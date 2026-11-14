package com.serhat.secondhand.complaint.review;

import com.serhat.secondhand.ai.application.GeminiClient;
import com.serhat.secondhand.complaint.Complaint;
import com.serhat.secondhand.complaint.ComplaintStatus;
import com.serhat.secondhand.complaint.PenaltyAction;
import com.serhat.secondhand.complaint.application.event.ComplaintReviewedEvent;
import com.serhat.secondhand.complaint.queue.ComplaintReviewHandler;
import com.serhat.secondhand.complaint.repository.ComplaintRepository;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Component;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Aura review of one complaint in three steps, so the Gemini call never runs inside a transaction:
 * (1) claim PENDING -> INVESTIGATING and collect context, (2) download evidence images and ask Gemini,
 * (3) apply the decision.
 * If (2) or (3) fails the claim is released back to PENDING and the exception reaches the worker,
 * which retries later.
 */
@Component
@Slf4j
public class AuraComplaintReviewHandler implements ComplaintReviewHandler {

    private static final Map<String, Object> RESPONSE_SCHEMA = AuraVerdictParser.responseSchema();

    private final ComplaintRepository complaintRepository;
    private final ComplaintContextBuilder contextBuilder;
    private final AuraModerationPromptBuilder promptBuilder;
    private final GeminiClient geminiClient;
    private final EvidenceImageLoader evidenceImageLoader;
    private final AuraVerdictParser verdictParser;
    private final SanctionPolicy sanctionPolicy;
    private final SanctionExecutor sanctionExecutor;
    private final ApplicationEventPublisher eventPublisher;
    private final TransactionTemplate transactionTemplate;

    public AuraComplaintReviewHandler(ComplaintRepository complaintRepository,
                                      ComplaintContextBuilder contextBuilder,
                                      AuraModerationPromptBuilder promptBuilder,
                                      GeminiClient geminiClient,
                                      EvidenceImageLoader evidenceImageLoader,
                                      AuraVerdictParser verdictParser,
                                      SanctionPolicy sanctionPolicy,
                                      SanctionExecutor sanctionExecutor,
                                      ApplicationEventPublisher eventPublisher,
                                      PlatformTransactionManager transactionManager) {
        this.complaintRepository = complaintRepository;
        this.contextBuilder = contextBuilder;
        this.promptBuilder = promptBuilder;
        this.geminiClient = geminiClient;
        this.evidenceImageLoader = evidenceImageLoader;
        this.verdictParser = verdictParser;
        this.sanctionPolicy = sanctionPolicy;
        this.sanctionExecutor = sanctionExecutor;
        this.eventPublisher = eventPublisher;
        this.transactionTemplate = new TransactionTemplate(transactionManager);
    }

    @Override
    public void review(String complaintId) {
        ComplaintReviewContext context = transactionTemplate.execute(status -> {
            if (complaintRepository.claimForReview(complaintId, LocalDateTime.now()) == 0) {
                return null;
            }
            return contextBuilder.build(complaintId, LocalDateTime.now());
        });
        if (context == null) {
            log.info("Complaint {} is no longer pending, review skipped", complaintId);
            return;
        }
        try {
            EvidenceImageLoader.LoadedEvidence evidence = context.evidenceImageUrls().isEmpty()
                    ? EvidenceImageLoader.LoadedEvidence.none()
                    : evidenceImageLoader.load(context.evidenceImageUrls());
            String raw = geminiClient.generateStrictJson(AuraModerationPromptBuilder.SYSTEM_INSTRUCTION,
                    promptBuilder.build(context, evidence), evidence.images(), RESPONSE_SCHEMA);
            AuraVerdict verdict = verdictParser.parse(raw);
            transactionTemplate.executeWithoutResult(status -> applyVerdict(complaintId, verdict, LocalDateTime.now()));
        } catch (RuntimeException e) {
            transactionTemplate.executeWithoutResult(status ->
                    complaintRepository.releaseClaim(complaintId, LocalDateTime.now()));
            throw e;
        }
    }

    void applyVerdict(String complaintId, AuraVerdict verdict, LocalDateTime now) {
        Complaint complaint = complaintRepository.findByIdWithDetails(complaintId)
                .orElseThrow(() -> new IllegalStateException("Complaint " + complaintId + " disappeared during review"));
        if (complaint.getStatus() != ComplaintStatus.INVESTIGATING) {
            throw new IllegalStateException("Complaint " + complaintId + " left INVESTIGATING during review");
        }
        User target = complaint.getComplainedUser();
        int effectiveWarnings = sanctionPolicy.effectiveWarnings(target, now);
        long priorTempBans = complaintRepository.countPenaltiesAgainst(target.getId(), PenaltyAction.TEMP_BAN_7_DAYS);
        SanctionDecision decision = sanctionPolicy.decide(verdict, effectiveWarnings, priorTempBans,
                complaint.getListing() != null);

        LocalDateTime bannedUntil = null;
        if (decision.status() == ComplaintStatus.RESOLVED) {
            bannedUntil = sanctionExecutor.apply(complaint, decision.penalty(), effectiveWarnings,
                    verdict.violationCategory().name(), now);
        }

        User complainer = complaint.getComplainer();
        PenaltyAction complainerPenalty = sanctionPolicy.decideComplainerPenalty(verdict,
                complaintRepository.countBadFaithReportsBy(complainer.getId()));
        LocalDateTime complainerBannedUntil = null;
        if (complainerPenalty != PenaltyAction.NONE) {
            complainerBannedUntil = sanctionExecutor.applyToComplainer(complaint, complainerPenalty,
                    sanctionPolicy.effectiveWarnings(complainer, now), now);
        }
        complaint.setBadFaithReport(complainerPenalty != PenaltyAction.NONE);
        complaint.setComplainerPenaltyAction(complainerPenalty);

        complaint.setStatus(decision.status());
        complaint.setViolationCategory(verdict.violationCategory());
        complaint.setPenaltyAction(decision.penalty());
        complaint.setAiConfidenceScore(verdict.confidenceScore());
        complaint.setAdminNotes(verdict.adminNotes());
        complaint.setAiReviewedAt(now);
        complaint.setResolvedAt(now);
        complaintRepository.save(complaint);

        log.info("Aura decided complaint {}: status={}, penalty={} (requested {}), confidence={}, adjustment={}, "
                        + "complainerPenalty={} (badFaith={}, coordinated={}), explanation={}",
                complaintId, decision.status(), decision.penalty(), verdict.penaltyAction(),
                verdict.confidenceScore(), decision.adjustment(), complainerPenalty, verdict.badFaithReport(),
                verdict.coordinatedAttackSuspected(), verdict.actionExplanation());

        eventPublisher.publishEvent(new ComplaintReviewedEvent(
                complaintId,
                complainer,
                target,
                complaint.getListing() != null ? complaint.getListing().getTitle()
                        : target.getName() + " " + target.getSurname(),
                complaint.getListing() != null ? complaint.getListing().getTitle() : null,
                decision.status(),
                decision.penalty(),
                verdict.violationCategory(),
                verdict.adminNotes(),
                now,
                bannedUntil,
                target.getWarningCount() == null ? 0 : target.getWarningCount(),
                complainerPenalty,
                complainerBannedUntil));
    }
}
