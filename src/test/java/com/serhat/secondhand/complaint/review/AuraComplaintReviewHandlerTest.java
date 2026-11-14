package com.serhat.secondhand.complaint.review;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.serhat.secondhand.ai.application.GeminiClient;
import com.serhat.secondhand.complaint.Complaint;
import com.serhat.secondhand.complaint.ComplaintStatus;
import com.serhat.secondhand.complaint.PenaltyAction;
import com.serhat.secondhand.complaint.ViolationCategory;
import com.serhat.secondhand.complaint.application.event.ComplaintReviewedEvent;
import com.serhat.secondhand.complaint.config.ComplaintModerationProperties;
import com.serhat.secondhand.complaint.repository.ComplaintRepository;
import com.serhat.secondhand.core.exception.BusinessException;
import com.serhat.secondhand.user.domain.entity.User;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.PlatformTransactionManager;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class AuraComplaintReviewHandlerTest {

    private static final String ID = "c-1";

    private final ComplaintRepository repository = mock(ComplaintRepository.class);
    private final ComplaintContextBuilder contextBuilder = mock(ComplaintContextBuilder.class);
    private final GeminiClient gemini = mock(GeminiClient.class);
    private final EvidenceImageLoader imageLoader = mock(EvidenceImageLoader.class);
    private final SanctionExecutor executor = mock(SanctionExecutor.class);
    private final ApplicationEventPublisher events = mock(ApplicationEventPublisher.class);
    private final AuraComplaintReviewHandler handler = new AuraComplaintReviewHandler(
            repository, contextBuilder, new AuraModerationPromptBuilder(), gemini, imageLoader,
            new AuraVerdictParser(new ObjectMapper()), new SanctionPolicy(new ComplaintModerationProperties()),
            executor, events, mock(PlatformTransactionManager.class));

    private static User user(long id) {
        User u = new User();
        u.setId(id);
        u.setName("N" + id);
        u.setSurname("S" + id);
        u.setWarningCount(0);
        return u;
    }

    private Complaint investigating() {
        Complaint c = Complaint.builder().id(ID).complainer(user(1)).complainedUser(user(2))
                .reason("HARASSMENT").status(ComplaintStatus.INVESTIGATING).build();
        when(repository.findByIdWithDetails(ID)).thenReturn(Optional.of(c));
        return c;
    }

    private void claimed() {
        when(repository.claimForReview(eq(ID), any())).thenReturn(1);
        when(contextBuilder.build(eq(ID), any())).thenReturn(new ComplaintReviewContext(ID, "HARASSMENT", "d",
                new ComplaintReviewContext.Party(1L, LocalDate.now(), 0, 0),
                new ComplaintReviewContext.Party(2L, LocalDate.now(), 0, 0),
                null, null, List.of(), List.of(), ComplaintReviewContext.BrigadeSignals.none(72)));
    }

    private void geminiAnswers(String json) {
        when(gemini.generateStrictJson(anyString(), anyString(), anyList(), anyMap())).thenReturn(json);
    }

    private static final String TEMP_BAN = """
            {"verdict":"RESOLVED","violationCategory":"HARASSMENT","confidenceScore":0.92,"severity":"HIGH",
             "penaltyAction":"TEMP_BAN_7_DAYS","adminNotes":"Hakaret tespit edildi.",
             "badFaithReport":false,"coordinatedAttackSuspected":false}""";

    @Test
    void complaintAlreadyClaimedIsSkippedWithoutCallingGemini() {
        when(repository.claimForReview(eq(ID), any())).thenReturn(0);

        handler.review(ID);

        verifyNoInteractions(gemini, executor, events);
    }

    @Test
    void geminiFailureReleasesTheClaimAndRethrows() {
        claimed();
        when(gemini.generateStrictJson(anyString(), anyString(), anyList(), anyMap()))
                .thenThrow(new BusinessException("down", HttpStatus.BAD_GATEWAY, "AI_SERVICE_ERROR"));

        assertThatThrownBy(() -> handler.review(ID)).isInstanceOf(BusinessException.class);

        verify(repository).releaseClaim(eq(ID), any());
        verifyNoInteractions(executor, events);
    }

    @Test
    void malformedAnswerReleasesTheClaimAndNothingIsApplied() {
        claimed();
        geminiAnswers("Cevap hazir");

        assertThatThrownBy(() -> handler.review(ID)).isInstanceOf(AuraVerdictParser.InvalidAuraVerdictException.class);

        verify(repository).releaseClaim(eq(ID), any());
        verifyNoInteractions(executor, events);
    }

    @Test
    void decisionFailureAfterGeminiAlsoReleasesTheClaim() {
        claimed();
        geminiAnswers(TEMP_BAN);
        Complaint c = investigating();
        c.setStatus(ComplaintStatus.DISMISSED);

        assertThatThrownBy(() -> handler.review(ID)).isInstanceOf(IllegalStateException.class);

        verify(repository).releaseClaim(eq(ID), any());
        verifyNoInteractions(executor);
    }

    @Test
    void confidentVerdictIsAppliedRecordedAndAnnounced() {
        claimed();
        geminiAnswers(TEMP_BAN);
        Complaint c = investigating();

        handler.review(ID);

        verify(executor).apply(eq(c), eq(PenaltyAction.TEMP_BAN_7_DAYS), eq(0), eq("HARASSMENT"), any());
        assertThat(c.getStatus()).isEqualTo(ComplaintStatus.RESOLVED);
        assertThat(c.getPenaltyAction()).isEqualTo(PenaltyAction.TEMP_BAN_7_DAYS);
        assertThat(c.getViolationCategory()).isEqualTo(ViolationCategory.HARASSMENT);
        assertThat(c.getAiConfidenceScore()).isEqualByComparingTo(new BigDecimal("0.92"));
        assertThat(c.getAdminNotes()).isEqualTo("Hakaret tespit edildi.");
        assertThat(c.getAiReviewedAt()).isNotNull();
        verify(repository, never()).releaseClaim(any(), any());

        ArgumentCaptor<ComplaintReviewedEvent> event = ArgumentCaptor.forClass(ComplaintReviewedEvent.class);
        verify(events).publishEvent(event.capture());
        assertThat(event.getValue().penalty()).isEqualTo(PenaltyAction.TEMP_BAN_7_DAYS);
        assertThat(event.getValue().complainer().getId()).isEqualTo(1L);
    }

    @Test
    void dismissedVerdictTouchesNoUser() {
        claimed();
        geminiAnswers("""
                {"verdict":"DISMISSED","violationCategory":"NONE","confidenceScore":0.8,"severity":"LOW",
                 "penaltyAction":"NONE","adminNotes":"Ihlal tespit edilmedi.",
                 "badFaithReport":false,"coordinatedAttackSuspected":false}""");
        Complaint c = investigating();

        handler.review(ID);

        verifyNoInteractions(executor);
        assertThat(c.getStatus()).isEqualTo(ComplaintStatus.DISMISSED);
        assertThat(c.getPenaltyAction()).isEqualTo(PenaltyAction.NONE);
    }

    @Test
    void lowConfidenceBanRequestEndsAsWarning() {
        claimed();
        geminiAnswers(TEMP_BAN.replace("0.92", "0.40"));
        Complaint c = investigating();

        handler.review(ID);

        verify(executor).apply(eq(c), eq(PenaltyAction.WARNING), anyInt(), anyString(), any());
        assertThat(c.getPenaltyAction()).isEqualTo(PenaltyAction.WARNING);
    }

    @Test
    void confidentBadFaithReportBansTheComplainerAndSparesTheReportedUser() {
        claimed();
        geminiAnswers("""
                {"verdict":"DISMISSED","violationCategory":"NONE","confidenceScore":0.93,"severity":"LOW",
                 "penaltyAction":"NONE","adminNotes":"Uydurma iddia.",
                 "badFaithReport":true,"coordinatedAttackSuspected":false}""");
        Complaint c = investigating();
        when(repository.countBadFaithReportsBy(1L)).thenReturn(0L);

        handler.review(ID);

        verify(executor).applyToComplainer(eq(c), eq(PenaltyAction.TEMP_BAN_7_DAYS), eq(0), any());
        verify(executor, never()).apply(any(), any(), anyInt(), any(), any());
        assertThat(c.isBadFaithReport()).isTrue();
        assertThat(c.getComplainerPenaltyAction()).isEqualTo(PenaltyAction.TEMP_BAN_7_DAYS);
        ArgumentCaptor<ComplaintReviewedEvent> event = ArgumentCaptor.forClass(ComplaintReviewedEvent.class);
        verify(events).publishEvent(event.capture());
        assertThat(event.getValue().complainerPenalty()).isEqualTo(PenaltyAction.TEMP_BAN_7_DAYS);
    }

    @Test
    void repeatedBadFaithReportBansTheComplainerPermanently() {
        claimed();
        geminiAnswers("""
                {"verdict":"DISMISSED","violationCategory":"NONE","confidenceScore":0.93,"severity":"LOW",
                 "penaltyAction":"NONE","adminNotes":"Uydurma iddia.",
                 "badFaithReport":true,"coordinatedAttackSuspected":false}""");
        Complaint c = investigating();
        when(repository.countBadFaithReportsBy(1L)).thenReturn(1L);

        handler.review(ID);

        verify(executor).applyToComplainer(eq(c), eq(PenaltyAction.PERM_BAN), anyInt(), any());
        assertThat(c.getComplainerPenaltyAction()).isEqualTo(PenaltyAction.PERM_BAN);
    }

    @Test
    void evidenceImagesAreSentAndTransientDownloadFailureRetriesLater() {
        when(repository.claimForReview(eq(ID), any())).thenReturn(1);
        when(contextBuilder.build(eq(ID), any())).thenReturn(new ComplaintReviewContext(ID, "SCAM", "d",
                new ComplaintReviewContext.Party(1L, LocalDate.now(), 0, 0),
                new ComplaintReviewContext.Party(2L, LocalDate.now(), 0, 0),
                null, null, List.of(), List.of("https://res.cloudinary.com/x/a.png"),
                ComplaintReviewContext.BrigadeSignals.none(72)));
        when(imageLoader.load(anyList())).thenThrow(
                new EvidenceImageLoader.EvidenceUnavailableException("timeout", null));

        assertThatThrownBy(() -> handler.review(ID)).isInstanceOf(EvidenceImageLoader.EvidenceUnavailableException.class);

        verify(repository).releaseClaim(eq(ID), any());
        verifyNoInteractions(gemini, executor);
    }
}
