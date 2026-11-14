package com.serhat.secondhand.complaint;

import com.serhat.secondhand.chat.application.ChatAuthorizationService;
import com.serhat.secondhand.complaint.application.ComplaintService;
import com.serhat.secondhand.complaint.application.event.ComplaintSubmittedEvent;
import com.serhat.secondhand.complaint.config.ComplaintModerationProperties;
import com.serhat.secondhand.complaint.queue.ComplaintRateLimiter;
import com.serhat.secondhand.complaint.repository.ComplaintRepository;
import com.serhat.secondhand.complaint.util.ComplaintErrorCodes;
import com.serhat.secondhand.complaint.validator.ComplaintValidator;
import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.listing.application.common.ListingQueryService;
import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.user.application.IUserService;
import com.serhat.secondhand.user.domain.entity.User;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.context.ApplicationEventPublisher;

import java.time.Duration;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

class ComplaintServiceTest {

    private static final long COMPLAINER = 1L;
    private static final long COMPLAINED = 2L;

    private final ComplaintRepository repository = mock(ComplaintRepository.class);
    private final IUserService userService = mock(IUserService.class);
    private final ListingQueryService listingQueryService = mock(ListingQueryService.class);
    private final ComplaintModerationProperties properties = new ComplaintModerationProperties();
    private final ApplicationEventPublisher eventPublisher = mock(ApplicationEventPublisher.class);
    private final ComplaintRateLimiter rateLimiter = mock(ComplaintRateLimiter.class);
    private final ComplaintService service = new ComplaintService(
            repository, new ComplaintMapper(properties), userService, listingQueryService,
            new ComplaintValidator(repository, mock(ChatAuthorizationService.class), properties), properties,
            eventPublisher, rateLimiter);

    private static User user(long id) {
        User u = new User();
        u.setId(id);
        u.setName("N" + id);
        u.setSurname("S" + id);
        return u;
    }

    private void givenUsers() {
        when(userService.findById(COMPLAINER)).thenReturn(Result.success(user(COMPLAINER)));
        when(userService.findById(COMPLAINED)).thenReturn(Result.success(user(COMPLAINED)));
        when(repository.save(any(Complaint.class))).thenAnswer(inv -> inv.getArgument(0));
        when(rateLimiter.consume(COMPLAINER)).thenReturn(Result.success());
    }

    @Test
    void dailyLimitStopsTheComplaintBeforeSaving() {
        givenUsers();
        when(rateLimiter.consume(COMPLAINER)).thenReturn(Result.error(ComplaintErrorCodes.COMPLAINT_DAILY_LIMIT_REACHED));

        Result<ComplaintDto> result = service.createComplaint(COMPLAINER, request(null));

        assertThat(result.getErrorCode()).isEqualTo(ComplaintErrorCodes.COMPLAINT_DAILY_LIMIT_REACHED.getCode());
        verify(repository, never()).save(any());
        verifyNoInteractions(eventPublisher);
    }

    @Test
    void invalidComplaintDoesNotConsumeQuota() {
        givenUsers();
        UUID listingId = UUID.randomUUID();
        when(listingQueryService.findById(listingId)).thenReturn(Optional.empty());

        service.createComplaint(COMPLAINER, request(listingId));

        verifyNoInteractions(rateLimiter);
    }

    private static ComplaintRequest request(UUID listingId) {
        return new ComplaintRequest(COMPLAINED, listingId, null, null, "SCAM_FRAUD", "desc", null);
    }

    @Test
    void newComplaintIsPendingAndReviewableAfterCoolingOff() {
        givenUsers();

        Result<ComplaintDto> result = service.createComplaint(COMPLAINER, request(null));

        assertThat(result.isSuccess()).isTrue();
        ArgumentCaptor<Complaint> saved = ArgumentCaptor.forClass(Complaint.class);
        verify(repository).save(saved.capture());
        Complaint complaint = saved.getValue();
        assertThat(complaint.getStatus()).isEqualTo(ComplaintStatus.PENDING);
        assertThat(complaint.getAppealStatus()).isEqualTo(AppealStatus.NONE);
        assertThat(Duration.between(complaint.getCreatedAt(), complaint.getEligibleForReviewAt()))
                .isEqualTo(Duration.ofHours(2));

        ArgumentCaptor<ComplaintSubmittedEvent> event = ArgumentCaptor.forClass(ComplaintSubmittedEvent.class);
        verify(eventPublisher).publishEvent(event.capture());
        assertThat(event.getValue().complainer().getId()).isEqualTo(COMPLAINER);
        assertThat(event.getValue().targetLabel()).isEqualTo("N2 S2");
        assertThat(event.getValue().eligibleForReviewAt()).isEqualTo(complaint.getEligibleForReviewAt());
    }

    @Test
    void listingComplaintEmailNamesTheListing() {
        givenUsers();
        UUID listingId = UUID.randomUUID();
        Listing listing = mock(Listing.class);
        when(listing.isOwnedBy(COMPLAINED)).thenReturn(true);
        when(listing.getTitle()).thenReturn("Bisiklet");
        when(listingQueryService.findById(listingId)).thenReturn(Optional.of(listing));

        service.createComplaint(COMPLAINER, request(listingId));

        ArgumentCaptor<ComplaintSubmittedEvent> event = ArgumentCaptor.forClass(ComplaintSubmittedEvent.class);
        verify(eventPublisher).publishEvent(event.capture());
        assertThat(event.getValue().targetLabel()).isEqualTo("Bisiklet");
    }

    @Test
    void missingListingFailsInsteadOfFilingWithoutTarget() {
        givenUsers();
        UUID listingId = UUID.randomUUID();
        when(listingQueryService.findById(listingId)).thenReturn(Optional.empty());

        Result<ComplaintDto> result = service.createComplaint(COMPLAINER, request(listingId));

        assertThat(result.getErrorCode()).isEqualTo(ComplaintErrorCodes.COMPLAINT_LISTING_NOT_FOUND.getCode());
        verify(repository, never()).save(any());
        verifyNoInteractions(eventPublisher);
    }

    @Test
    void listingOfAnotherSellerIsRejected() {
        givenUsers();
        UUID listingId = UUID.randomUUID();
        Listing listing = mock(Listing.class);
        when(listing.isOwnedBy(COMPLAINED)).thenReturn(false);
        when(listingQueryService.findById(listingId)).thenReturn(Optional.of(listing));

        Result<ComplaintDto> result = service.createComplaint(COMPLAINER, request(listingId));

        assertThat(result.getErrorCode()).isEqualTo(ComplaintErrorCodes.COMPLAINT_LISTING_NOT_OWNED_BY_USER.getCode());
        verify(repository, never()).save(any());
    }

    @Test
    void appealIsRecordedOnceAndQueuedAfterCommit() {
        User reported = user(COMPLAINED);
        Complaint c = Complaint.builder().id("c-9").complainer(user(COMPLAINER)).complainedUser(reported)
                .status(ComplaintStatus.RESOLVED).penaltyAction(PenaltyAction.WARNING)
                .resolvedAt(java.time.LocalDateTime.now().minusDays(1)).appealStatus(AppealStatus.NONE).build();
        when(repository.findByIdWithDetails("c-9")).thenReturn(java.util.Optional.of(c));
        when(repository.markAppealPending(eq("c-9"), eq("Yanlis anlasilma"), any())).thenReturn(1);

        var result = service.submitAppeal(COMPLAINED, "c-9", new AppealRequest("  Yanlis anlasilma "));

        assertThat(result.isSuccess()).isTrue();
        verify(eventPublisher).publishEvent(any(com.serhat.secondhand.complaint.application.event.AppealSubmittedEvent.class));
    }

    @Test
    void concurrentSecondAppealLoses() {
        Complaint c = Complaint.builder().id("c-9").complainer(user(COMPLAINER)).complainedUser(user(COMPLAINED))
                .status(ComplaintStatus.RESOLVED).penaltyAction(PenaltyAction.WARNING)
                .resolvedAt(java.time.LocalDateTime.now().minusDays(1)).appealStatus(AppealStatus.NONE).build();
        when(repository.findByIdWithDetails("c-9")).thenReturn(java.util.Optional.of(c));
        when(repository.markAppealPending(any(), any(), any())).thenReturn(0);

        var result = service.submitAppeal(COMPLAINED, "c-9", new AppealRequest("x"));

        assertThat(result.getErrorCode()).isEqualTo(ComplaintErrorCodes.APPEAL_ALREADY_SUBMITTED.getCode());
        verify(eventPublisher, never()).publishEvent(any(com.serhat.secondhand.complaint.application.event.AppealSubmittedEvent.class));
    }
}
