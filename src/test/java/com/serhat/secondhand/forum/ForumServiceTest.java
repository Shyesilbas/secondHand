package com.serhat.secondhand.forum;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.forum.application.ForumService;
import com.serhat.secondhand.forum.application.KeywordEngine;
import com.serhat.secondhand.forum.dto.ForumThreadDto;
import com.serhat.secondhand.forum.dto.request.ChangeForumThreadStatusRequest;
import com.serhat.secondhand.forum.dto.request.CreateForumCommentRequest;
import com.serhat.secondhand.forum.dto.request.CreateForumThreadRequest;
import com.serhat.secondhand.forum.dto.request.ForumReactionAction;
import com.serhat.secondhand.forum.dto.request.ForumReactionRequest;
import com.serhat.secondhand.forum.dto.request.UpdateForumThreadRequest;
import com.serhat.secondhand.forum.entity.ForumComment;
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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionStatus;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ForumServiceTest {

    @Mock private ForumThreadRepository threadRepository;
    @Mock private ForumCommentRepository commentRepository;
    @Mock private ForumThreadReactionRepository threadReactionRepository;
    @Mock private ForumCommentReactionRepository commentReactionRepository;
    @Mock private ForumThreadMapper threadMapper;
    @Mock private ForumCommentMapper commentMapper;
    @Mock private KeywordEngine keywordEngine;
    @Mock private PlatformTransactionManager transactionManager;
    @Mock private UserRepository userRepository;

    private ForumService forumService;

    @BeforeEach
    void setUp() {
        forumService = new ForumService(
                threadRepository,
                commentRepository,
                threadReactionRepository,
                commentReactionRepository,
                threadMapper,
                commentMapper,
                keywordEngine,
                new ForumValidator(),
                transactionManager,
                userRepository
        );
    }

    @Test
    void publishThread_formatsAuthorDisplayNameAccordingToVisibility() {
        User author = User.builder().id(5L).name("Serhat").surname("Kaya").build();
        CreateForumThreadRequest req = new CreateForumThreadRequest(
                " Shipping Fee ", " Clarify shipping cost ", ForumCategory.SUGGESTIONS, ForumAuthorVisibility.DISPLAY_NAME);
        ForumThread saved = ForumThread.builder().id(10L).title("Shipping Fee").userId(5L).build();
        ForumThreadDto dto = new ForumThreadDto(10L, "Shipping Fee", "Clarify shipping cost",
                ForumCategory.SUGGESTIONS, ForumThreadStatus.OPEN, 5L, ForumAuthorVisibility.DISPLAY_NAME,
                "Serhat K.", 0L, 0L, List.of("shipping"), null, null, 0L, null);

        when(keywordEngine.extractKeywords(req.title(), req.description())).thenReturn(List.of("shipping"));
        when(userRepository.findById(5L)).thenReturn(Optional.of(author));
        when(threadMapper.toKeywordsJson(List.of("shipping"))).thenReturn("[\"shipping\"]");
        when(threadRepository.save(any(ForumThread.class))).thenAnswer(inv -> {
            ForumThread arg = inv.getArgument(0);
            assertThat(arg.getAuthorDisplayName()).isEqualTo("Serhat K.");
            assertThat(arg.getTitle()).isEqualTo("Shipping Fee");
            return saved;
        });
        when(threadMapper.toDto(saved)).thenReturn(dto);

        Result<ForumThreadDto> result = forumService.publishThread(5L, req);

        assertThat(result.isSuccess()).isTrue();
        assertThat(result.getData().authorDisplayName()).isEqualTo("Serhat K.");
    }

    @Test
    void modifyThreadContent_andChangeStatus_enforceOwnership() {
        ForumThread thread = ForumThread.builder().id(10L).userId(5L).title("Old").description("Desc").build();
        when(threadRepository.findById(10L)).thenReturn(Optional.of(thread));

        Result<ForumThreadDto> forbidden = forumService.modifyThreadContent(99L, 10L, new UpdateForumThreadRequest("New", "New desc"));
        assertThat(forbidden.getErrorCode()).isEqualTo(ForumErrorCodes.FORBIDDEN.getCode());

        Result<ForumThreadDto> statusForbidden = forumService.changeThreadStatus(99L, 10L, new ChangeForumThreadStatusRequest(ForumThreadStatus.RESOLVED));
        assertThat(statusForbidden.getErrorCode()).isEqualTo(ForumErrorCodes.FORBIDDEN.getCode());
    }

    @Test
    void addCommentToThread_rejectsParentCommentFromDifferentThread() {
        ForumComment foreignParent = ForumComment.builder().id(77L).threadId(999L).build();
        when(threadRepository.existsById(10L)).thenReturn(true);
        when(commentRepository.findById(77L)).thenReturn(Optional.of(foreignParent));

        Result<?> result = forumService.addCommentToThread(5L, 10L,
                new CreateForumCommentRequest("Reply", 77L, ForumAuthorVisibility.ANONYMOUS));

        assertThat(result.isError()).isTrue();
        assertThat(result.getErrorCode()).isEqualTo(ForumErrorCodes.PARENT_COMMENT_INVALID.getCode());
    }

    @Test
    void reactToThread_updatesExistingDislikeToLikeAndAdjustsCounters() {
        when(transactionManager.getTransaction(any())).thenReturn(mock(TransactionStatus.class));
        ForumThread thread = ForumThread.builder().id(10L).userId(5L).totalLikes(2).totalDislikes(1).build();
        ForumThreadReaction existing = ForumThreadReaction.builder().threadId(10L).userId(8L).reaction(ForumReactionType.DISLIKE).build();

        when(threadRepository.findById(10L)).thenReturn(Optional.of(thread));
        when(threadReactionRepository.findByThreadIdAndUserId(10L, 8L)).thenReturn(Optional.of(existing));
        when(threadRepository.save(thread)).thenReturn(thread);

        forumService.reactToThread(8L, 10L, new ForumReactionRequest(ForumReactionAction.LIKE));

        assertThat(existing.getReaction()).isEqualTo(ForumReactionType.LIKE);
        assertThat(thread.getTotalLikes()).isEqualTo(3);
        assertThat(thread.getTotalDislikes()).isZero();
        verify(threadReactionRepository).save(existing);
    }

    @Test
    void deleteThread_cleansReactionsCommentsAndThreadForOwner() {
        when(transactionManager.getTransaction(any())).thenReturn(mock(TransactionStatus.class));
        ForumThread thread = ForumThread.builder().id(10L).userId(5L).build();
        when(threadRepository.findById(10L)).thenReturn(Optional.of(thread));
        when(commentRepository.findIdsByThreadId(10L)).thenReturn(List.of(101L, 102L));

        Result<Void> result = forumService.deleteThread(5L, 10L);

        assertThat(result.isSuccess()).isTrue();
        verify(threadReactionRepository).deleteByThreadId(10L);
        verify(commentReactionRepository).deleteByCommentIdIn(List.of(101L, 102L));
        verify(commentRepository).deleteByThreadId(10L);
        verify(threadRepository).deleteById(10L);
    }
}
