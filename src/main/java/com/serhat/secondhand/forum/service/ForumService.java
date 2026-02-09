package com.serhat.secondhand.forum.service;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.forum.dto.ForumCommentDto;
import com.serhat.secondhand.forum.dto.ForumThreadDto;
import com.serhat.secondhand.forum.dto.request.*;
import com.serhat.secondhand.forum.entity.ForumComment;
import com.serhat.secondhand.forum.entity.ForumCommentReaction;
import com.serhat.secondhand.forum.entity.ForumThread;
import com.serhat.secondhand.forum.entity.ForumThreadReaction;
import com.serhat.secondhand.forum.entity.enums.ForumAuthorVisibility;
import com.serhat.secondhand.forum.entity.enums.ForumCategory;
import com.serhat.secondhand.forum.entity.enums.ForumReactionType;
import com.serhat.secondhand.forum.entity.enums.ForumThreadStatus;
import com.serhat.secondhand.forum.mapper.ForumCommentMapper;
import com.serhat.secondhand.forum.mapper.ForumThreadMapper;
import com.serhat.secondhand.forum.repository.ForumCommentReactionRepository;
import com.serhat.secondhand.forum.repository.ForumCommentRepository;
import com.serhat.secondhand.forum.repository.ForumThreadReactionRepository;
import com.serhat.secondhand.forum.repository.ForumThreadRepository;
import com.serhat.secondhand.forum.util.ForumErrorCodes;
import com.serhat.secondhand.forum.validator.ForumValidator;
import com.serhat.secondhand.user.domain.entity.User;
import com.serhat.secondhand.user.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;

import java.util.List;
import java.util.Optional;
import java.util.function.Supplier;

@Service
@RequiredArgsConstructor
public class ForumService {

    private final ForumThreadRepository threadRepository;
    private final ForumCommentRepository commentRepository;
    private final ForumThreadReactionRepository threadReactionRepository;
    private final ForumCommentReactionRepository commentReactionRepository;
    private final ForumThreadMapper threadMapper;
    private final ForumCommentMapper commentMapper;
    private final KeywordEngine keywordEngine;
    private final ForumValidator validator;
    private final PlatformTransactionManager transactionManager;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public Page<ForumThreadDto> listThreads(ForumCategory category,
                                            ForumThreadStatus status,
                                            String q,
                                            Pageable pageable) {
        return threadRepository.search(category, status, normalizeQuery(q), pageable).map(threadMapper::toDto);
    }

    @Transactional(readOnly = true)
    public Result<ForumThreadDto> getThread(Long threadId) {
        if (threadId == null) return Result.error(ForumErrorCodes.INVALID_REQUEST);
        return threadRepository.findById(threadId)
                .map(t -> Result.success(threadMapper.toDto(t)))
                .orElseGet(() -> Result.error(ForumErrorCodes.THREAD_NOT_FOUND));
    }

    public Result<ForumThreadDto> publishThread(Long userId, CreateForumThreadRequest req) {
        if (userId == null || req == null) return Result.error(ForumErrorCodes.INVALID_REQUEST);
        List<String> keywords = keywordEngine.extractKeywords(req.title(), req.description());
        ForumAuthorVisibility visibility = normalizeVisibility(req.authorVisibility());
        String authorDisplayName = computeAuthorDisplayName(userId, visibility);
        ForumThread thread = ForumThread.builder()
                .title(req.title().trim())
                .description(req.description().trim())
                .category(req.category())
                .userId(userId)
                .authorVisibility(visibility)
                .authorDisplayName(authorDisplayName)
                .keywordsJson(threadMapper.toKeywordsJson(keywords))
                .build();
        ForumThread saved = threadRepository.save(thread);
        return Result.success(threadMapper.toDto(saved));
    }

    public Result<ForumThreadDto> modifyThreadContent(Long userId, Long threadId, UpdateForumThreadRequest req) {
        if (userId == null || threadId == null || req == null) return Result.error(ForumErrorCodes.INVALID_REQUEST);
        Optional<ForumThread> opt = threadRepository.findById(threadId);
        if (opt.isEmpty()) return Result.error(ForumErrorCodes.THREAD_NOT_FOUND);
        ForumThread thread = opt.get();
        Result<Void> ownerCheck = validator.requireOwner(thread, userId);
        if (ownerCheck.isError()) return Result.error(ownerCheck.getMessage(), ownerCheck.getErrorCode());

        thread.setTitle(req.title().trim());
        thread.setDescription(req.description().trim());
        List<String> keywords = keywordEngine.extractKeywords(thread.getTitle(), thread.getDescription());
        thread.setKeywordsJson(threadMapper.toKeywordsJson(keywords));
        ForumThread saved = threadRepository.save(thread);
        return Result.success(threadMapper.toDto(saved));
    }

    public Result<ForumThreadDto> changeThreadStatus(Long userId, Long threadId, ChangeForumThreadStatusRequest req) {
        if (userId == null || threadId == null || req == null) return Result.error(ForumErrorCodes.INVALID_REQUEST);
        Optional<ForumThread> opt = threadRepository.findById(threadId);
        if (opt.isEmpty()) return Result.error(ForumErrorCodes.THREAD_NOT_FOUND);
        ForumThread thread = opt.get();
        Result<Void> ownerCheck = validator.requireOwner(thread, userId);
        if (ownerCheck.isError()) return Result.error(ownerCheck.getMessage(), ownerCheck.getErrorCode());
        thread.setStatus(req.status());
        ForumThread saved = threadRepository.save(thread);
        return Result.success(threadMapper.toDto(saved));
    }

    public Result<Void> deleteThread(Long userId, Long threadId) {
        if (userId == null || threadId == null) return Result.error(ForumErrorCodes.INVALID_REQUEST);
        Optional<ForumThread> opt = threadRepository.findById(threadId);
        if (opt.isEmpty()) return Result.error(ForumErrorCodes.THREAD_NOT_FOUND);
        ForumThread thread = opt.get();
        Result<Void> ownerCheck = validator.requireOwner(thread, userId);
        if (ownerCheck.isError()) return Result.error(ownerCheck.getMessage(), ownerCheck.getErrorCode());

        TransactionTemplate tt = new TransactionTemplate(transactionManager);
        tt.execute(status -> {
            threadReactionRepository.deleteByThreadId(threadId);
            List<Long> commentIds = commentRepository.findIdsByThreadId(threadId);
            if (commentIds != null && !commentIds.isEmpty()) {
                commentReactionRepository.deleteByCommentIdIn(commentIds);
            }
            commentRepository.deleteByThreadId(threadId);
            threadRepository.deleteById(threadId);
            return null;
        });

        return Result.success();
    }

    public Page<ForumCommentDto> listComments(Long threadId, Pageable pageable) {
        return commentRepository.findByThreadId(threadId, pageable).map(commentMapper::toDto);
    }

    public Result<ForumCommentDto> addCommentToThread(Long userId, Long threadId, CreateForumCommentRequest req) {
        if (userId == null || threadId == null || req == null) return Result.error(ForumErrorCodes.INVALID_REQUEST);
        if (!threadRepository.existsById(threadId)) return Result.error(ForumErrorCodes.THREAD_NOT_FOUND);

        Long parentId = req.parentCommentId();
        if (parentId != null) {
            Optional<ForumComment> parentOpt = commentRepository.findById(parentId);
            if (parentOpt.isEmpty()) return Result.error(ForumErrorCodes.PARENT_COMMENT_INVALID);
            Result<Void> parentCheck = validator.validateParentComment(parentOpt.get(), threadId);
            if (parentCheck.isError()) return Result.error(parentCheck.getMessage(), parentCheck.getErrorCode());
        }

        ForumAuthorVisibility visibility = normalizeVisibility(req.authorVisibility());
        String authorDisplayName = computeAuthorDisplayName(userId, visibility);

        ForumComment comment = ForumComment.builder()
                .threadId(threadId)
                .userId(userId)
                .authorVisibility(visibility)
                .authorDisplayName(authorDisplayName)
                .parentCommentId(parentId)
                .content(req.content().trim())
                .build();
        ForumComment saved = commentRepository.save(comment);
        return Result.success(commentMapper.toDto(saved));
    }

    public Result<ForumThreadDto> reactToThread(Long userId, Long threadId, ForumReactionRequest req) {
        if (userId == null || threadId == null || req == null || req.reaction() == null) {
            return Result.error(ForumErrorCodes.INVALID_REQUEST);
        }
        return runWithRetry(() -> reactToThreadOnce(userId, threadId, req.reaction()));
    }

    public Result<ForumCommentDto> reactToComment(Long userId, Long threadId, Long commentId, ForumReactionRequest req) {
        if (userId == null || threadId == null || commentId == null || req == null || req.reaction() == null) {
            return Result.error(ForumErrorCodes.INVALID_REQUEST);
        }
        return runWithRetry(() -> reactToCommentOnce(userId, threadId, commentId, req.reaction()));
    }

    private Result<ForumThreadDto> reactToThreadOnce(Long userId, Long threadId, ForumReactionAction action) {
        TransactionTemplate tt = new TransactionTemplate(transactionManager);
        return tt.execute(status -> {
            Optional<ForumThread> opt = threadRepository.findById(threadId);
            if (opt.isEmpty()) return Result.error(ForumErrorCodes.THREAD_NOT_FOUND);
            ForumThread thread = opt.get();

            Optional<ForumThreadReaction> existingOpt = threadReactionRepository.findByThreadIdAndUserId(threadId, userId);
            ForumReactionType oldReaction = existingOpt.map(ForumThreadReaction::getReaction).orElse(null);
            ForumReactionType newReaction = toNewReaction(action);

            Delta delta = computeDelta(oldReaction, newReaction);
            applyThreadReactionRow(existingOpt, threadId, userId, newReaction);
            applyThreadCounters(thread, delta);

            ForumThread saved = threadRepository.save(thread);
            return Result.success(threadMapper.toDto(saved));
        });
    }

    private Result<ForumCommentDto> reactToCommentOnce(Long userId, Long threadId, Long commentId, ForumReactionAction action) {
        TransactionTemplate tt = new TransactionTemplate(transactionManager);
        return tt.execute(status -> {
            Optional<ForumComment> cOpt = commentRepository.findById(commentId);
            if (cOpt.isEmpty()) return Result.error(ForumErrorCodes.COMMENT_NOT_FOUND);
            ForumComment comment = cOpt.get();
            if (!threadId.equals(comment.getThreadId())) return Result.error(ForumErrorCodes.COMMENT_NOT_FOUND);

            Optional<ForumCommentReaction> existingOpt = commentReactionRepository.findByCommentIdAndUserId(commentId, userId);
            ForumReactionType oldReaction = existingOpt.map(ForumCommentReaction::getReaction).orElse(null);
            ForumReactionType newReaction = toNewReaction(action);

            Delta delta = computeDelta(oldReaction, newReaction);
            applyCommentReactionRow(existingOpt, commentId, userId, newReaction);
            applyCommentCounters(comment, delta);

            ForumComment saved = commentRepository.save(comment);
            return Result.success(commentMapper.toDto(saved));
        });
    }

    private <T> Result<T> runWithRetry(Supplier<Result<T>> action) {
        int attempts = 0;
        while (attempts < 3) {
            attempts++;
            try {
                return action.get();
            } catch (OptimisticLockingFailureException e) {
                if (attempts >= 3) return Result.error(ForumErrorCodes.CONFLICT);
            }
        }
        return Result.error(ForumErrorCodes.CONFLICT);
    }

    private void applyThreadReactionRow(Optional<ForumThreadReaction> existingOpt, Long threadId, Long userId, ForumReactionType newReaction) {
        if (newReaction == null) {
            if (existingOpt.isPresent()) {
                threadReactionRepository.deleteByThreadIdAndUserId(threadId, userId);
            }
            return;
        }
        if (existingOpt.isPresent()) {
            ForumThreadReaction ex = existingOpt.get();
            ex.setReaction(newReaction);
            threadReactionRepository.save(ex);
            return;
        }
        ForumThreadReaction created = ForumThreadReaction.builder()
                .threadId(threadId)
                .userId(userId)
                .reaction(newReaction)
                .build();
        threadReactionRepository.save(created);
    }

    private void applyCommentReactionRow(Optional<ForumCommentReaction> existingOpt, Long commentId, Long userId, ForumReactionType newReaction) {
        if (newReaction == null) {
            if (existingOpt.isPresent()) {
                commentReactionRepository.deleteByCommentIdAndUserId(commentId, userId);
            }
            return;
        }
        if (existingOpt.isPresent()) {
            ForumCommentReaction ex = existingOpt.get();
            ex.setReaction(newReaction);
            commentReactionRepository.save(ex);
            return;
        }
        ForumCommentReaction created = ForumCommentReaction.builder()
                .commentId(commentId)
                .userId(userId)
                .reaction(newReaction)
                .build();
        commentReactionRepository.save(created);
    }

    private void applyThreadCounters(ForumThread thread, Delta delta) {
        long likes = thread.getTotalLikes() + delta.likeDelta;
        long dislikes = thread.getTotalDislikes() + delta.dislikeDelta;
        thread.setTotalLikes(Math.max(likes, 0));
        thread.setTotalDislikes(Math.max(dislikes, 0));
    }

    private void applyCommentCounters(ForumComment comment, Delta delta) {
        long likes = comment.getTotalLikes() + delta.likeDelta;
        long dislikes = comment.getTotalDislikes() + delta.dislikeDelta;
        comment.setTotalLikes(Math.max(likes, 0));
        comment.setTotalDislikes(Math.max(dislikes, 0));
    }

    private ForumReactionType toNewReaction(ForumReactionAction action) {
        if (action == null) return null;
        if (action == ForumReactionAction.CLEAR) return null;
        return action == ForumReactionAction.LIKE ? ForumReactionType.LIKE : ForumReactionType.DISLIKE;
    }

    private Delta computeDelta(ForumReactionType oldReaction, ForumReactionType newReaction) {
        long likeDelta = 0;
        long dislikeDelta = 0;
        if (oldReaction == ForumReactionType.LIKE) likeDelta -= 1;
        if (oldReaction == ForumReactionType.DISLIKE) dislikeDelta -= 1;
        if (newReaction == ForumReactionType.LIKE) likeDelta += 1;
        if (newReaction == ForumReactionType.DISLIKE) dislikeDelta += 1;
        return new Delta(likeDelta, dislikeDelta);
    }

    private String normalizeQuery(String q) {
        if (q == null) return null;
        String t = q.trim();
        return t.isBlank() ? null : t;
    }

    private ForumAuthorVisibility normalizeVisibility(ForumAuthorVisibility visibility) {
        return visibility == null ? ForumAuthorVisibility.ANONYMOUS : visibility;
    }

    private String computeAuthorDisplayName(Long userId, ForumAuthorVisibility visibility) {
        if (visibility == null || visibility == ForumAuthorVisibility.ANONYMOUS) return "Anonymous";
        Optional<User> uOpt = userRepository.findById(userId);
        if (uOpt.isEmpty()) return "User";
        User u = uOpt.get();
        String name = u.getName() == null ? "" : u.getName().trim();
        String surname = u.getSurname() == null ? "" : u.getSurname().trim();
        if (visibility == ForumAuthorVisibility.FULL_NAME) {
            String full = (name + " " + surname).trim();
            return full.isBlank() ? "User" : full;
        }
        String initial = surname.isBlank() ? "" : (surname.substring(0, 1).toUpperCase() + ".");
        String display = (name + (initial.isBlank() ? "" : " " + initial)).trim();
        return display.isBlank() ? "User" : display;
    }

    private record Delta(long likeDelta, long dislikeDelta) {}
}

