package com.serhat.secondhand.complaint.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;

@Getter
@Setter
@Configuration
@ConfigurationProperties(prefix = "app.moderation")
public class ComplaintModerationProperties {

    /** Delay between filing a complaint and it becoming eligible for Aura review. */
    private Duration coolingOff = Duration.ofHours(2);

    /** Maximum evidence images a complainer may attach to one complaint. */
    private int maxEvidenceImages = 3;

    /** Allowed host for evidence image URLs (Cloudinary delivery host). */
    private String evidenceImageHost = "res.cloudinary.com";

    /** Complaints one user may file per rolling window ({@link #dailyLimitWindow}). */
    private int dailyComplaintLimit = 5;

    private Duration dailyLimitWindow = Duration.ofHours(24);

    private Worker worker = new Worker();

    private Review review = new Review();

    @Getter
    @Setter
    public static class Review {
        /** Below this Aura confidence no sanction heavier than WARNING is applied. */
        private java.math.BigDecimal minConfidence = new java.math.BigDecimal("0.66");

        /** Chat messages given to Aura as context. */
        private int transcriptSize = 25;

        /** Warnings after which the next violation becomes a temporary ban. */
        private int warningEscalationThreshold = 3;

        /** Temporary bans after which the next one becomes a permanent ban. */
        private int tempBansBeforePermBan = 3;

        private Duration tempBanDuration = Duration.ofDays(7);

        /** With no penalty for this long, warnings reset to zero. */
        private Duration strikeDecay = Duration.ofDays(180);

        /** INVESTIGATING rows older than this are treated as a crashed review and re-queued on startup. */
        private Duration staleInvestigation = Duration.ofMinutes(30);

        /** Aura confidence needed before a complainer is sanctioned for a bad-faith report. */
        private java.math.BigDecimal badFaithMinConfidence = new java.math.BigDecimal("0.85");

        /** Window for the brigade signals: complaints against the reported user in this period. */
        private Duration brigadeWindow = Duration.ofHours(72);

        /** Complainer accounts younger than this count as new in the brigade signals. */
        private Duration newAccountAge = Duration.ofDays(30);

        /** Other recent complaints whose text Aura sees, to spot copy-paste campaigns. */
        private int relatedReportSamples = 5;

        /** Recent complaints scanned for brigade signals. */
        private int relatedReportScanLimit = 50;

        /** Largest evidence image sent to Aura; a bigger one is reported to Aura as unavailable. */
        private long evidenceImageMaxBytes = 4L * 1024 * 1024;

        /** Connect and read timeout for one evidence image download. */
        private Duration evidenceImageTimeout = Duration.ofSeconds(5);

        /** A penalized user may appeal once within this period after the decision. */
        private Duration appealWindow = Duration.ofDays(7);
    }

    @Getter
    @Setter
    public static class Worker {
        /** Controls whether the scheduled Aura review worker runs. */
        private boolean enabled = true;

        private String cron = "0 0 * * * *";

        /** Complaints reviewed per run (Gemini cost and rate-limit guard). */
        private int batchSize = 10;

        /** Must exceed the worst-case run time (batchSize x Gemini timeout). */
        private Duration lockTtl = Duration.ofMinutes(5);

        /** A complaint whose review failed is pushed back by this much so others are not blocked. */
        private Duration retryDelay = Duration.ofHours(1);
    }
}
