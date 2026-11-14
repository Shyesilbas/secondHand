package com.serhat.secondhand.complaint.review;

import com.serhat.secondhand.chat.application.ChatTranscriptService;
import com.serhat.secondhand.complaint.Complaint;
import com.serhat.secondhand.complaint.config.ComplaintModerationProperties;
import com.serhat.secondhand.complaint.repository.ComplaintRepository;
import com.serhat.secondhand.user.domain.entity.User;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class ComplaintContextBuilderBrigadeTest {

    private static final LocalDateTime NOW = LocalDateTime.of(2026, 11, 14, 12, 0);

    private final ComplaintRepository repository = mock(ComplaintRepository.class);
    private final ComplaintModerationProperties properties = new ComplaintModerationProperties();
    private final ComplaintContextBuilder builder = new ComplaintContextBuilder(repository,
            mock(ChatTranscriptService.class), new SanctionPolicy(properties), properties);

    private static Complaint complaint() {
        User complainer = new User();
        complainer.setId(1L);
        complainer.setLastLoginIp("10.0.0.9");
        User reported = new User();
        reported.setId(2L);
        return Complaint.builder().id("c-1").complainer(complainer).complainedUser(reported).build();
    }

    private static ComplaintRepository.RelatedComplaint related(long complainerId, LocalDate created, String ip, String text) {
        return new ComplaintRepository.RelatedComplaint() {
            public String getId() { return "r-" + complainerId; }
            public Long getComplainerId() { return complainerId; }
            public LocalDate getComplainerCreated() { return created; }
            public String getComplainerIp() { return ip; }
            public String getReason() { return "SCAM"; }
            public String getDescription() { return text; }
        };
    }

    @Test
    void countsNewAccountsAndSharedIpsAmongOtherComplainersOnly() {
        LocalDate fresh = NOW.toLocalDate().minusDays(3);
        LocalDate old = NOW.toLocalDate().minusYears(2);
        when(repository.findRecentAgainst(eq(2L), eq(NOW.minusHours(72)), eq("c-1"), any())).thenReturn(List.of(
                related(5, fresh, "10.0.0.9", "satici dolandirici"),
                related(5, fresh, "10.0.0.9", "satici dolandirici"),
                related(6, fresh, "10.0.0.9", "satici dolandirici"),
                related(7, old, "192.168.1.1", "urun gelmedi"),
                related(1, old, "10.0.0.9", "my own earlier complaint")));

        ComplaintReviewContext.BrigadeSignals b = builder.brigadeSignals(complaint(), NOW);

        assertThat(b.otherComplaints()).isEqualTo(4);
        assertThat(b.distinctOtherComplainers()).isEqualTo(3);
        assertThat(b.newAccountComplainers()).isEqualTo(2);
        assertThat(b.complainersSharingIp()).isEqualTo(2);
        assertThat(b.relatedReports()).hasSize(4).noneMatch(r -> r.contains("my own"));
    }

    @Test
    void noOtherComplaintsMeansNoSignals() {
        when(repository.findRecentAgainst(any(), any(), any(), any())).thenReturn(List.of());

        ComplaintReviewContext.BrigadeSignals b = builder.brigadeSignals(complaint(), NOW);

        assertThat(b.otherComplaints()).isZero();
        assertThat(b.relatedReports()).isEmpty();
    }
}
