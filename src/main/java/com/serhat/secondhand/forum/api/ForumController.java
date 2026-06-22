package com.serhat.secondhand.forum.api;

import com.serhat.secondhand.core.result.ResultResponses;
import com.serhat.secondhand.forum.application.ForumService;
import com.serhat.secondhand.forum.dto.ForumCommentDto;
import com.serhat.secondhand.forum.dto.ForumThreadDto;
import com.serhat.secondhand.forum.dto.request.*;
import com.serhat.secondhand.forum.entity.enums.ForumCategory;
import com.serhat.secondhand.forum.entity.enums.ForumThreadStatus;
import com.serhat.secondhand.user.domain.entity.User;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/forums")
@Tag(name = "Forum", description = "Forum operations")
public class ForumController {

    private final ForumService forumService;

    @GetMapping("/threads")
    public Page<ForumThreadDto> listThreads(
            @RequestParam(required = false) ForumCategory category,
            @RequestParam(required = false) ForumThreadStatus status,
            @RequestParam(required = false) String q,
            @RequestParam(required = false, defaultValue = "NEW") ForumThreadSort sort,
            @PageableDefault(size = 20) Pageable pageable,
            @AuthenticationPrincipal User currentUser
    ) {
        Pageable p = applySort(pageable, sort);
        Long viewerId = currentUser != null ? currentUser.getId() : null;
        return forumService.listThreads(category, status, q, p, viewerId);
    }

    @GetMapping("/threads/{thread-id}")
    public ResponseEntity<?> getThread(
            @PathVariable("thread-id") Long threadId,
            @AuthenticationPrincipal User currentUser
    ) {
        Long viewerId = currentUser != null ? currentUser.getId() : null;
        return ResultResponses.ok(forumService.getThread(threadId, viewerId));
    }

    @PostMapping("/threads")
    public ResponseEntity<?> publishThread(
            @AuthenticationPrincipal User currentUser,
            @RequestBody @Valid CreateForumThreadRequest req
    ) {
        return ResultResponses.ok(forumService.publishThread(currentUser.getId(), req));
    }

    @PatchMapping("/threads/{thread-id}")
    public ResponseEntity<?> modifyThreadContent(
            @AuthenticationPrincipal User currentUser,
            @PathVariable("thread-id") Long threadId,
            @RequestBody @Valid UpdateForumThreadRequest req
    ) {
        return ResultResponses.ok(forumService.modifyThreadContent(currentUser.getId(), threadId, req));
    }

    @PatchMapping("/threads/{thread-id}/status")
    public ResponseEntity<?> changeThreadStatus(
            @AuthenticationPrincipal User currentUser,
            @PathVariable("thread-id") Long threadId,
            @RequestBody @Valid ChangeForumThreadStatusRequest req
    ) {
        return ResultResponses.ok(forumService.changeThreadStatus(currentUser.getId(), threadId, req));
    }

    @DeleteMapping("/threads/{thread-id}")
    public ResponseEntity<?> deleteThread(
            @AuthenticationPrincipal User currentUser,
            @PathVariable("thread-id") Long threadId
    ) {
        return ResultResponses.noContent(forumService.deleteThread(currentUser.getId(), threadId));
    }

    @PostMapping("/threads/{thread-id}/reaction")
    public ResponseEntity<?> reactToThread(
            @AuthenticationPrincipal User currentUser,
            @PathVariable("thread-id") Long threadId,
            @RequestBody @Valid ForumReactionRequest req
    ) {
        return ResultResponses.ok(forumService.reactToThread(currentUser.getId(), threadId, req));
    }

    @GetMapping("/threads/{thread-id}/comments")
    public Page<ForumCommentDto> listComments(
            @PathVariable("thread-id") Long threadId,
            @PageableDefault(size = 20) Pageable pageable,
            @AuthenticationPrincipal User currentUser
    ) {
        Pageable p = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), Sort.by(Sort.Direction.DESC, "createdAt"));
        Long viewerId = currentUser != null ? currentUser.getId() : null;
        return forumService.listComments(threadId, p, viewerId);
    }

    @PostMapping("/threads/{thread-id}/comments")
    public ResponseEntity<?> addComment(
            @AuthenticationPrincipal User currentUser,
            @PathVariable("thread-id") Long threadId,
            @RequestBody @Valid CreateForumCommentRequest req
    ) {
        return ResultResponses.ok(forumService.addCommentToThread(currentUser.getId(), threadId, req));
    }

    @PostMapping("/threads/{thread-id}/comments/{comment-id}/reaction")
    public ResponseEntity<?> reactToComment(
            @AuthenticationPrincipal User currentUser,
            @PathVariable("thread-id") Long threadId,
            @PathVariable("comment-id") Long commentId,
            @RequestBody @Valid ForumReactionRequest req
    ) {
        return ResultResponses.ok(forumService.reactToComment(currentUser.getId(), threadId, commentId, req));
    }

    private Pageable applySort(Pageable pageable, ForumThreadSort sort) {
        Sort s = switch (sort) {
            case TOP -> Sort.by(Sort.Direction.DESC, "totalLikes").and(Sort.by(Sort.Direction.DESC, "createdAt"));
            case NEW -> Sort.by(Sort.Direction.DESC, "createdAt");
        };
        return PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), s);
    }
}

