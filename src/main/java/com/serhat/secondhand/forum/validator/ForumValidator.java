package com.serhat.secondhand.forum.validator;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.forum.entity.ForumComment;
import com.serhat.secondhand.forum.entity.ForumThread;
import com.serhat.secondhand.forum.util.ForumErrorCodes;
import org.springframework.stereotype.Component;

@Component
public class ForumValidator {

    public Result<Void> requireOwner(ForumThread thread, Long userId) {
        if (thread == null || userId == null) return Result.error(ForumErrorCodes.INVALID_REQUEST);
        if (!userId.equals(thread.getUserId())) return Result.error(ForumErrorCodes.FORBIDDEN);
        return Result.success();
    }

    public Result<Void> validateParentComment(ForumComment parent, Long threadId) {
        if (parent == null) return Result.error(ForumErrorCodes.PARENT_COMMENT_INVALID);
        if (threadId == null || parent.getThreadId() == null) return Result.error(ForumErrorCodes.PARENT_COMMENT_INVALID);
        if (!threadId.equals(parent.getThreadId())) return Result.error(ForumErrorCodes.PARENT_COMMENT_INVALID);
        return Result.success();
    }
}

