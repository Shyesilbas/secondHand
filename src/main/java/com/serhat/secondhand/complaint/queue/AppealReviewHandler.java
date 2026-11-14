package com.serhat.secondhand.complaint.queue;

/**
 * Reviews one pending appeal (proposal section 5.6). Implementations own the appeal status transition
 * and must be safe to call again: the worker retries an appeal whose review threw.
 */
public interface AppealReviewHandler {

    void reviewAppeal(String complaintId);
}
