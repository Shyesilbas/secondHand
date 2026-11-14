package com.serhat.secondhand.complaint.review;

import com.serhat.secondhand.ai.application.GeminiClient;
import com.serhat.secondhand.complaint.AppealStatus;
import com.serhat.secondhand.complaint.Complaint;
import com.serhat.secondhand.complaint.application.event.AppealReviewedEvent;
import com.serhat.secondhand.complaint.config.ComplaintModerationProperties;
import com.serhat.secondhand.complaint.queue.AppealReviewHandler;
import com.serhat.secondhand.complaint.repository.ComplaintRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Component;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Aura's second look at an appeal (proposal section 5.6), in the same three steps as a complaint review:
 * read the context, ask Gemini outside any transaction, apply the decision. Only a confident approval
 * reverses the penalty; a doubtful one leaves the decision in place (REJECTED). Exclusive processing is
 * guaranteed by the worker lock; the decision step re-checks that the appeal is still PENDING.
 */
@Component
@Slf4j
public class AuraAppealReviewHandler implements AppealReviewHandler {

    private static final Map<String, Object> RESPONSE_SCHEMA = AppealVerdictParser.responseSchema();

    /** Shown instead of Aura's text when a doubtful approval is turned into a rejection. */
    static final String LOW_CONFIDENCE_REJECTION = "İtirazınız incelendi. Mevcut kanıtlar kararın değiştirilmesi "
            + "için yeterli bulunmadığından karar geçerliliğini korumaktadır.";

    private final ComplaintRepository complaintRepository;
    private final ComplaintContextBuilder contextBuilder;
    private final AuraAppealPromptBuilder promptBuilder;
    private final EvidenceImageLoader evidenceImageLoader;
    private final GeminiClient geminiClient;
    private final AppealVerdictParser verdictParser;
    private final SanctionExecutor sanctionExecutor;
    private final ComplaintModerationProperties properties;
    private final ApplicationEventPublisher eventPublisher;
    private final TransactionTemplate transactionTemplate;

    public AuraAppealReviewHandler(ComplaintRepository complaintRepository,
                                   ComplaintContextBuilder contextBuilder,
                                   AuraAppealPromptBuilder promptBuilder,
                                   EvidenceImageLoader evidenceImageLoader,
                                   GeminiClient geminiClient,
                                   AppealVerdictParser verdictParser,
                                   SanctionExecutor sanctionExecutor,
                                   ComplaintModerationProperties properties,
                                   ApplicationEventPublisher eventPublisher,
                                   PlatformTransactionManager transactionManager) {
        this.complaintRepository = complaintRepository;
        this.contextBuilder = contextBuilder;
        this.promptBuilder = promptBuilder;
        this.evidenceImageLoader = evidenceImageLoader;
        this.geminiClient = geminiClient;
        this.verdictParser = verdictParser;
        this.sanctionExecutor = sanctionExecutor;
        this.properties = properties;
        this.eventPublisher = eventPublisher;
        this.transactionTemplate = new TransactionTemplate(transactionManager);
    }

    @Override
    public void reviewAppeal(String complaintId) {
        AppealInput input = transactionTemplate.execute(status -> {
            Complaint complaint = complaintRepository.findByIdWithDetails(complaintId).orElse(null);
            if (complaint == null || complaint.getAppealStatus() != AppealStatus.PENDING) {
                return null;
            }
            return new AppealInput(contextBuilder.build(complaintId, LocalDateTime.now()), complaint);
        });
        if (input == null) {
            log.info("Appeal of complaint {} is no longer pending, review skipped", complaintId);
            return;
        }
        Complaint original = input.complaint();
        EvidenceImageLoader.LoadedEvidence evidence = input.context().evidenceImageUrls().isEmpty()
                ? EvidenceImageLoader.LoadedEvidence.none()
                : evidenceImageLoader.load(input.context().evidenceImageUrls());
        String prompt = promptBuilder.build(input.context(), evidence, original.getViolationCategory(),
                original.getPenaltyAction(), original.getAdminNotes(), original.getAppealReason());
        String raw = geminiClient.generateStrictJson(AuraAppealPromptBuilder.SYSTEM_INSTRUCTION, prompt,
                evidence.images(), RESPONSE_SCHEMA);
        AppealVerdict verdict = verdictParser.parse(raw);
        transactionTemplate.executeWithoutResult(status -> applyVerdict(complaintId, verdict, LocalDateTime.now()));
    }

    void applyVerdict(String complaintId, AppealVerdict verdict, LocalDateTime now) {
        Complaint complaint = complaintRepository.findByIdWithDetails(complaintId)
                .orElseThrow(() -> new IllegalStateException("Complaint " + complaintId + " disappeared during appeal review"));
        if (complaint.getAppealStatus() != AppealStatus.PENDING) {
            throw new IllegalStateException("Appeal of complaint " + complaintId + " left PENDING during review");
        }
        boolean confident = verdict.confidenceScore().compareTo(properties.getReview().getMinConfidence()) >= 0;
        AppealStatus outcome = verdict.decision() == AppealStatus.APPROVED && confident
                ? AppealStatus.APPROVED
                : AppealStatus.REJECTED;
        boolean reversed = outcome == AppealStatus.APPROVED && sanctionExecutor.reverse(complaint, now);
        String explanation = outcome == verdict.decision() ? verdict.explanation() : LOW_CONFIDENCE_REJECTION;

        complaint.setAppealStatus(outcome);
        complaint.setAppealReviewedAt(now);
        complaint.setAppealDecisionNotes(explanation);
        complaintRepository.save(complaint);

        log.info("Aura decided appeal of complaint {}: outcome={} (requested {}), confidence={}, reversed={}, notes={}",
                complaintId, outcome, verdict.decision(), verdict.confidenceScore(), reversed, verdict.internalNotes());

        eventPublisher.publishEvent(new AppealReviewedEvent(complaintId, complaint.getComplainedUser(), outcome,
                complaint.getPenaltyAction(), reversed, explanation));
    }

    private record AppealInput(ComplaintReviewContext context, Complaint complaint) {}
}
