package com.serhat.secondhand.complaint.application.listener;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.serhat.secondhand.complaint.AppealStatus;
import com.serhat.secondhand.complaint.ComplaintStatus;
import com.serhat.secondhand.complaint.PenaltyAction;
import com.serhat.secondhand.complaint.ViolationCategory;
import com.serhat.secondhand.complaint.application.event.AppealReviewedEvent;
import com.serhat.secondhand.complaint.application.event.ComplaintReviewedEvent;
import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.notification.application.INotificationService;
import com.serhat.secondhand.notification.dto.NotificationRequest;
import com.serhat.secondhand.notification.entity.enums.NotificationType;
import com.serhat.secondhand.notification.template.NotificationTemplateCatalog;
import com.serhat.secondhand.user.domain.entity.User;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class ComplaintNotificationListenerTest {

    private final INotificationService notifications = mock(INotificationService.class);
    private final ComplaintNotificationListener listener =
            new ComplaintNotificationListener(notifications, new NotificationTemplateCatalog(new ObjectMapper()));

    {
        when(notifications.createAndSend(any())).thenReturn(Result.success(null));
    }

    private static User user(long id) {
        User u = new User();
        u.setId(id);
        return u;
    }

    private List<NotificationRequest> sent(int times) {
        ArgumentCaptor<NotificationRequest> captor = ArgumentCaptor.forClass(NotificationRequest.class);
        verify(notifications, times(times)).createAndSend(captor.capture());
        return captor.getAllValues();
    }

    @Test
    void upheldComplaintNotifiesComplainerAndPenalizedUser() {
        listener.onComplaintReviewed(new ComplaintReviewedEvent("c-1", user(1), user(2), "t", null,
                ComplaintStatus.RESOLVED, PenaltyAction.TEMP_BAN_7_DAYS, ViolationCategory.HARASSMENT, "n",
                LocalDateTime.now(), LocalDateTime.now().plusDays(7), 0, PenaltyAction.NONE, null));

        List<NotificationRequest> requests = sent(2);
        assertThat(requests.get(0).getUserId()).isEqualTo(1L);
        assertThat(requests.get(0).getType()).isEqualTo(NotificationType.COMPLAINT_REVIEWED);
        assertThat(requests.get(1).getUserId()).isEqualTo(2L);
        assertThat(requests.get(1).getType()).isEqualTo(NotificationType.MODERATION_SANCTION);
        assertThat(requests.get(1).getMetadata()).contains("TEMP_BAN_7_DAYS").contains("COMMUNITY_RULES");
    }

    @Test
    void badFaithReportNotifiesTheComplainerOfTheirBan() {
        listener.onComplaintReviewed(new ComplaintReviewedEvent("c-1", user(1), user(2), "t", null,
                ComplaintStatus.DISMISSED, PenaltyAction.NONE, ViolationCategory.NONE, "n",
                LocalDateTime.now(), null, 0, PenaltyAction.PERM_BAN, null));

        List<NotificationRequest> requests = sent(2);
        assertThat(requests.get(1).getUserId()).isEqualTo(1L);
        assertThat(requests.get(1).getMetadata()).contains("PERM_BAN").contains("BAD_FAITH_REPORT");
    }

    @Test
    void appealOutcomeReachesTheAppellant() {
        listener.onAppealReviewed(new AppealReviewedEvent("c-1", user(2), AppealStatus.APPROVED,
                PenaltyAction.WARNING, true, "x"));

        NotificationRequest request = sent(1).get(0);
        assertThat(request.getUserId()).isEqualTo(2L);
        assertThat(request.getType()).isEqualTo(NotificationType.MODERATION_APPEAL_DECIDED);
        assertThat(request.getMetadata()).contains("\"penaltyReversed\":\"true\"");
    }
}
