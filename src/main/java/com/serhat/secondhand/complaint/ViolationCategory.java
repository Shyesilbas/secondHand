package com.serhat.secondhand.complaint;

public enum ViolationCategory {
    HARASSMENT,
    OFF_PLATFORM_TRADING,
    SCAM_FRAUD,
    INAPPROPRIATE_CONTENT,
    FALSE_ADVERTISING,
    NONE,
    /**
     * Set by the system on a complainer sanctioned for a bad-faith report. Never a valid answer from
     * Aura, which reports bad faith through its own flag.
     */
    MALICIOUS_REPORT
}
