package com.serhat.secondhand.forum.api;

import com.serhat.secondhand.core.result.ResultResponses;
import com.serhat.secondhand.forum.dto.ForumCommentDto;
import com.serhat.secondhand.forum.dto.ForumThreadDto;
import com.serhat.secondhand.forum.dto.request.*;
import com.serhat.secondhand.forum.entity.enums.ForumCategory;
import com.serhat.secondhand.forum.entity.enums.ForumThreadStatus;
import com.serhat.secondhand.forum.service.ForumService;
import com.serhat.secondhand.user.domain.entity.User;
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
@RequestMapping("/api/v1/forum")
public class ForumController {

    private final ForumService forumService;

    @GetMapping("/threads")
    public Page<ForumThreadDto> listThreads(
            @RequestParam(required = false) ForumCategory category,
            @RequestParam(required = false) ForumThreadStatus status,
            @RequestParam(required = false) String q,
            @RequestParam(required = false, defaultValue = "NEW") ForumThreadSort sort,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        Pageable p = applySort(pageable, sort);
        return forumService.listThreads(category, status, q, p);
    }

    @GetMapping("/threads/{threadId}")
    public ResponseEntity<?> getThread(@PathVariable Long threadId) {
        return ResultResponses.ok(forumService.getThread(threadId));
    }

    @PostMapping("/threads")
    public ResponseEntity<?> publishThread(
            @AuthenticationPrincipal User currentUser,
            @RequestBody @Valid CreateForumThreadRequest req
    ) {
        return ResultResponses.ok(forumService.publishThread(currentUser.getId(), req));
    }

    @PatchMapping("/threads/{threadId}")
    public ResponseEntity<?> modifyThreadContent(
            @AuthenticationPrincipal User currentUser,
            @PathVariable Long threadId,
            @RequestBody @Valid UpdateForumThreadRequest req
    ) {
        return ResultResponses.ok(forumService.modifyThreadContent(currentUser.getId(), threadId, req));
    }

    @PatchMapping("/threads/{threadId}/status")
    public ResponseEntity<?> changeThreadStatus(
            @AuthenticationPrincipal User currentUser,
            @PathVariable Long threadId,
            @RequestBody @Valid ChangeForumThreadStatusRequest req
    ) {
        return ResultResponses.ok(forumService.changeThreadStatus(currentUser.getId(), threadId, req));
    }

    @DeleteMapping("/threads/{threadId}")
    public ResponseEntity<?> deleteThread(
            @AuthenticationPrincipal User currentUser,
            @PathVariable Long threadId
    ) {
        return ResultResponses.noContent(forumService.deleteThread(currentUser.getId(), threadId));
    }

    @PostMapping("/threads/{threadId}/reaction")
    public ResponseEntity<?> reactToThread(
            @AuthenticationPrincipal User currentUser,
            @PathVariable Long threadId,
            @RequestBody @Valid ForumReactionRequest req
    ) {
        return ResultResponses.ok(forumService.reactToThread(currentUser.getId(), threadId, req));
    }

    @GetMapping("/threads/{threadId}/comments")
    public Page<ForumCommentDto> listComments(
            @PathVariable Long threadId,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        Pageable p = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), Sort.by(Sort.Direction.DESC, "createdAt"));
        return forumService.listComments(threadId, p);
    }

    @PostMapping("/threads/{threadId}/comments")
    public ResponseEntity<?> addComment(
            @AuthenticationPrincipal User currentUser,
            @PathVariable Long threadId,
            @RequestBody @Valid CreateForumCommentRequest req
    ) {
        return ResultResponses.ok(forumService.addCommentToThread(currentUser.getId(), threadId, req));
    }

    @PostMapping("/threads/{threadId}/comments/{commentId}/reaction")
    public ResponseEntity<?> reactToComment(
            @AuthenticationPrincipal User currentUser,
            @PathVariable Long threadId,
            @PathVariable Long commentId,
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

