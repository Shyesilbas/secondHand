package com.serhat.secondhand.complaint.queue;

/**
 * Reviews one due complaint (Aura, phase 4). Implementations own the status transition and must be
 * safe to call again for the same complaint: the worker retries a complaint whose review threw.
 */
public interface ComplaintReviewHandler {

    void review(String complaintId);
}
