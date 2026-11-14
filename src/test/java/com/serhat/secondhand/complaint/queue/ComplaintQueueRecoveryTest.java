package com.serhat.secondhand.complaint.queue;

import com.serhat.secondhand.complaint.ComplaintStatus;

import com.serhat.secondhand.complaint.queue.ComplaintQueueRecovery;
import com.serhat.secondhand.complaint.queue.ComplaintReviewQueue;
import com.serhat.secondhand.complaint.repository.ComplaintRepository;
import com.serhat.secondhand.complaint.repository.ComplaintRepository.QueuedComplaint;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.SliceImpl;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class ComplaintQueueRecoveryTest {

    private final ComplaintRepository repository = mock(ComplaintRepository.class);
    private final ComplaintReviewQueue queue = mock(ComplaintReviewQueue.class);
    private final ComplaintQueueRecovery recovery = new ComplaintQueueRecovery(repository, queue,
            new com.serhat.secondhand.complaint.config.ComplaintModerationProperties(),
            mock(org.springframework.transaction.PlatformTransactionManager.class));

    {
        when(repository.findPendingAppealsForQueue(any()))
                .thenReturn(new SliceImpl<>(List.of(), PageRequest.of(0, 500), false));
    }

    private static QueuedComplaint row(String id, LocalDateTime at) {
        return new QueuedComplaint() {
            public String getId() { return id; }
            public LocalDateTime getEligibleForReviewAt() { return at; }
        };
    }

    @Test
    void requeuesEveryPendingComplaintAcrossPagesWithoutOverwritingScores() {
        LocalDateTime t = LocalDateTime.of(2026, 11, 13, 10, 0);
        when(repository.findPendingForQueue(PageRequest.of(0, 500)))
                .thenReturn(new SliceImpl<>(List.of(row("a", t)), PageRequest.of(0, 500), true));
        when(repository.findPendingForQueue(PageRequest.of(1, 500)))
                .thenReturn(new SliceImpl<>(List.of(row("b", t.plusHours(1))), PageRequest.of(1, 500), false));
        when(queue.scheduleIfAbsent(any(), any())).thenReturn(true);

        recovery.onApplicationReady();

        verify(queue).scheduleIfAbsent("a", t);
        verify(queue).scheduleIfAbsent("b", t.plusHours(1));
        verify(queue, never()).schedule(any(), any());
    }

    @Test
    void stuckInvestigationsAreReleasedBeforeRequeueing() {
        when(repository.findPendingForQueue(any()))
                .thenReturn(new SliceImpl<>(List.of(), PageRequest.of(0, 500), false));

        recovery.onApplicationReady();

        org.mockito.InOrder order = inOrder(repository);
        order.verify(repository).releaseStaleClaims(any());
        order.verify(repository).findPendingForQueue(any());
    }

    @Test
    void recoveryFailureDoesNotBreakStartup() {
        when(repository.findPendingForQueue(any())).thenThrow(new IllegalStateException("db down"));

        recovery.onApplicationReady();
    }

    @Test
    void pendingAppealsAreRequeuedToo() {
        LocalDateTime t = LocalDateTime.of(2026, 11, 14, 9, 0);
        when(repository.findPendingForQueue(any()))
                .thenReturn(new SliceImpl<>(List.of(), PageRequest.of(0, 500), false));
        when(repository.findPendingAppealsForQueue(any()))
                .thenReturn(new SliceImpl<>(List.of(row("p", t)), PageRequest.of(0, 500), false));
        when(queue.scheduleAppealIfAbsent("p", t)).thenReturn(true);

        org.assertj.core.api.Assertions.assertThat(recovery.recover()).isEqualTo(1);
        verify(queue).scheduleAppealIfAbsent("p", t);
    }
}
