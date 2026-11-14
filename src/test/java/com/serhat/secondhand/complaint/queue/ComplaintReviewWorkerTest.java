package com.serhat.secondhand.complaint.queue;

import com.serhat.secondhand.complaint.ComplaintStatus;

import com.serhat.secondhand.complaint.config.ComplaintModerationProperties;
import com.serhat.secondhand.complaint.queue.ComplaintReviewHandler;
import com.serhat.secondhand.complaint.queue.ComplaintReviewQueue;
import com.serhat.secondhand.complaint.queue.ComplaintReviewWorker;
import com.serhat.secondhand.complaint.queue.ComplaintWorkerLock;
import com.serhat.secondhand.complaint.repository.ComplaintRepository;
import org.junit.jupiter.api.Test;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.*;

class ComplaintReviewWorkerTest {

    private static final LocalDateTime NOW = LocalDateTime.of(2026, 11, 13, 15, 0);

    private final ComplaintReviewQueue queue = mock(ComplaintReviewQueue.class);
    private final ComplaintWorkerLock lock = mock(ComplaintWorkerLock.class);
    private final ComplaintRepository repository = mock(ComplaintRepository.class);
    private final ComplaintReviewHandler handler = mock(ComplaintReviewHandler.class);
    private final AppealReviewHandler appealHandler = mock(AppealReviewHandler.class);
    private final ComplaintModerationProperties properties = new ComplaintModerationProperties();
    private final ComplaintReviewWorker worker =
            new ComplaintReviewWorker(queue, lock, repository, handler, appealHandler, properties, Runnable::run);

    private void pending(String... ids) {
        for (String id : ids) {
            when(repository.findStatusById(id)).thenReturn(Optional.of(ComplaintStatus.PENDING));
        }
    }

    @Test
    void reviewsDueComplaintsAndRemovesThemFromTheQueue() {
        when(queue.due(NOW, 10)).thenReturn(List.of("a", "b"));
        pending("a", "b");

        int reviewed = worker.runBatch(NOW, properties.getWorker());

        assertThat(reviewed).isEqualTo(2);
        verify(handler).review("a");
        verify(handler).review("b");
        verify(queue).remove("a");
        verify(queue).remove("b");
    }

    @Test
    void asksForAtMostTheConfiguredBatch() {
        properties.getWorker().setBatchSize(3);
        when(queue.due(any(), anyInt())).thenReturn(List.of());

        worker.runBatch(NOW, properties.getWorker());

        verify(queue).due(NOW, 3);
    }

    @Test
    void failedReviewIsRescheduledAndDoesNotBlockTheRest() {
        when(queue.due(NOW, 10)).thenReturn(List.of("bad", "good"));
        pending("bad", "good");
        doThrow(new IllegalStateException("gemini timeout")).when(handler).review("bad");

        int reviewed = worker.runBatch(NOW, properties.getWorker());

        assertThat(reviewed).isEqualTo(1);
        verify(queue).schedule("bad", NOW.plus(Duration.ofHours(1)));
        verify(queue, never()).remove("bad");
        verify(queue).remove("good");
    }

    @Test
    void complaintNoLongerPendingIsDroppedWithoutReview() {
        when(queue.due(NOW, 10)).thenReturn(List.of("closed", "gone"));
        when(repository.findStatusById("closed")).thenReturn(Optional.of(ComplaintStatus.DISMISSED));
        when(repository.findStatusById("gone")).thenReturn(Optional.empty());

        worker.runBatch(NOW, properties.getWorker());

        verifyNoInteractions(handler);
        verify(queue).remove("closed");
        verify(queue).remove("gone");
    }

    @Test
    void skipsTheRunWhenAnotherInstanceHoldsTheLock() {
        when(lock.tryAcquire(any())).thenReturn(Optional.empty());

        worker.processDueComplaints();

        verifyNoInteractions(queue, handler);
        verify(lock, never()).release(any());
    }

    @Test
    void releasesTheLockEvenWhenTheBatchThrows() {
        when(lock.tryAcquire(Duration.ofMinutes(5))).thenReturn(Optional.of("token"));
        when(queue.due(any(), anyInt())).thenThrow(new IllegalStateException("redis down"));

        try {
            worker.processDueComplaints();
        } catch (IllegalStateException ignored) {
            // expected
        }

        verify(lock).release("token");
    }

    @Test
    void scheduledTickOnlyHandsTheBatchToTheModerationExecutor() {
        java.util.List<Runnable> submitted = new java.util.ArrayList<>();
        ComplaintReviewWorker async = new ComplaintReviewWorker(queue, lock, repository, handler, appealHandler, properties, submitted::add);

        async.scheduleBatch();

        assertThat(submitted).hasSize(1);
        verifyNoInteractions(lock, queue, handler);
    }

    @Test
    void pendingAppealIsReviewedAndRemoved() {
        when(queue.dueAppeals(NOW, 10)).thenReturn(List.of("a1", "a2"));
        when(repository.findAppealStatusById("a1")).thenReturn(Optional.of(com.serhat.secondhand.complaint.AppealStatus.PENDING));
        when(repository.findAppealStatusById("a2")).thenReturn(Optional.of(com.serhat.secondhand.complaint.AppealStatus.APPROVED));

        int reviewed = worker.runAppealBatch(NOW, properties.getWorker());

        assertThat(reviewed).isEqualTo(1);
        verify(appealHandler).reviewAppeal("a1");
        verify(appealHandler, never()).reviewAppeal("a2");
        verify(queue).removeAppeal("a1");
        verify(queue).removeAppeal("a2");
    }

    @Test
    void failedAppealIsPushedBackByTheRetryDelay() {
        when(queue.dueAppeals(NOW, 10)).thenReturn(List.of("a1"));
        when(repository.findAppealStatusById("a1")).thenReturn(Optional.of(com.serhat.secondhand.complaint.AppealStatus.PENDING));
        doThrow(new IllegalStateException("gemini down")).when(appealHandler).reviewAppeal("a1");

        assertThat(worker.runAppealBatch(NOW, properties.getWorker())).isZero();

        verify(queue).scheduleAppeal("a1", NOW.plus(properties.getWorker().getRetryDelay()));
        verify(queue, never()).removeAppeal("a1");
    }
}
