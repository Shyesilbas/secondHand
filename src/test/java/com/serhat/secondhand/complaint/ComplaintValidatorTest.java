package com.serhat.secondhand.complaint;

import com.serhat.secondhand.chat.application.ChatAuthorizationService;
import com.serhat.secondhand.chat.entity.ChatRoom;
import com.serhat.secondhand.chat.entity.Message;
import com.serhat.secondhand.chat.util.ChatErrorCodes;
import com.serhat.secondhand.complaint.config.ComplaintModerationProperties;
import com.serhat.secondhand.complaint.repository.ComplaintRepository;
import com.serhat.secondhand.complaint.util.ComplaintErrorCodes;
import com.serhat.secondhand.complaint.validator.ComplaintValidator;
import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.user.domain.entity.User;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class ComplaintValidatorTest {

    private static final long COMPLAINER = 1L;
    private static final long COMPLAINED = 2L;
    private static final long ROOM = 10L;
    private static final long MESSAGE = 100L;
    private static final String CLOUDINARY_URL = "https://res.cloudinary.com/demo/image/upload/a.jpg";

    private final ComplaintRepository repository = mock(ComplaintRepository.class);
    private final ChatAuthorizationService chat = mock(ChatAuthorizationService.class);
    private final ComplaintValidator validator =
            new ComplaintValidator(repository, chat, new ComplaintModerationProperties());

    private static User user(long id) {
        User u = new User();
        u.setId(id);
        return u;
    }

    private static ComplaintRequest request(Long roomId, Long messageId, List<String> urls) {
        return new ComplaintRequest(COMPLAINED, null, roomId, messageId, "HARASSMENT", "desc", urls);
    }

    private static ChatRoom room(Long... participants) {
        ChatRoom room = new ChatRoom();
        room.setId(ROOM);
        room.setParticipantIds(Set.of(participants));
        return room;
    }

    private static Message messageFrom(long senderId) {
        Message message = new Message();
        message.setId(MESSAGE);
        message.setChatRoomId(ROOM);
        message.setSender(user(senderId));
        return message;
    }

    @Test
    void messageWithoutRoomIsRejected() {
        Result<Void> result = validator.validateRequest(COMPLAINER, request(null, MESSAGE, null));
        assertThat(result.getErrorCode()).isEqualTo(ComplaintErrorCodes.COMPLAINT_MESSAGE_REQUIRES_CHAT_ROOM.getCode());
    }

    @Test
    void moreThanThreeEvidenceImagesAreRejected() {
        List<String> urls = List.of(CLOUDINARY_URL, CLOUDINARY_URL, CLOUDINARY_URL, CLOUDINARY_URL);
        Result<Void> result = validator.validateRequest(COMPLAINER, request(null, null, urls));
        assertThat(result.getErrorCode()).isEqualTo(ComplaintErrorCodes.COMPLAINT_TOO_MANY_EVIDENCE_IMAGES.getCode());
    }

    @Test
    void evidenceImageOutsideCloudinaryIsRejected() {
        Result<Void> result = validator.validateRequest(COMPLAINER,
                request(null, null, List.of("https://evil.example.com/a.jpg")));
        assertThat(result.getErrorCode()).isEqualTo(ComplaintErrorCodes.COMPLAINT_INVALID_EVIDENCE_IMAGE_URL.getCode());
    }

    @Test
    void plainHttpEvidenceImageIsRejected() {
        Result<Void> result = validator.validateRequest(COMPLAINER,
                request(null, null, List.of("http://res.cloudinary.com/demo/a.jpg")));
        assertThat(result.getErrorCode()).isEqualTo(ComplaintErrorCodes.COMPLAINT_INVALID_EVIDENCE_IMAGE_URL.getCode());
    }

    @Test
    void cloudinaryEvidenceImagesAreAccepted() {
        Result<Void> result = validator.validateRequest(COMPLAINER, request(null, null, List.of(CLOUDINARY_URL)));
        assertThat(result.isSuccess()).isTrue();
    }

    @Test
    void openComplaintAboutSameUserBlocksANewOne() {
        User complainer = user(COMPLAINER);
        User complained = user(COMPLAINED);
        when(repository.existsByComplainerAndComplainedUserAndStatusIn(
                eq(complainer), eq(complained), eq(ComplaintValidator.ACTIVE_STATUSES))).thenReturn(true);

        Result<Void> result = validator.validateComplaint(complainer, complained);
        assertThat(result.getErrorCode()).isEqualTo(ComplaintErrorCodes.COMPLAINT_ALREADY_EXISTS.getCode());
    }

    @Test
    void closedComplaintAboutSameUserAllowsANewOne() {
        when(repository.existsByComplainerAndComplainedUserAndStatusIn(any(), any(), any())).thenReturn(false);
        assertThat(validator.validateComplaint(user(COMPLAINER), user(COMPLAINED)).isSuccess()).isTrue();
    }

    @Test
    void chatNotContainingReportedUserIsRejected() {
        when(chat.authorizeRoomAccess(ROOM, COMPLAINER)).thenReturn(Result.success(room(COMPLAINER, 3L)));

        Result<Void> result = validator.validateChatEvidence(request(ROOM, null, null), user(COMPLAINER), user(COMPLAINED));
        assertThat(result.getErrorCode()).isEqualTo(ComplaintErrorCodes.COMPLAINT_CHAT_NOT_SHARED.getCode());
    }

    @Test
    void chatTheComplainerIsNotInIsRejected() {
        when(chat.authorizeRoomAccess(ROOM, COMPLAINER)).thenReturn(Result.error(ChatErrorCodes.ACCESS_DENIED));

        Result<Void> result = validator.validateChatEvidence(request(ROOM, null, null), user(COMPLAINER), user(COMPLAINED));
        assertThat(result.getErrorCode()).isEqualTo(ChatErrorCodes.ACCESS_DENIED.getCode());
    }

    @Test
    void reportedMessageMustComeFromReportedUser() {
        when(chat.authorizeRoomAccess(ROOM, COMPLAINER)).thenReturn(Result.success(room(COMPLAINER, COMPLAINED)));
        when(chat.findMessageInRoom(MESSAGE, ROOM)).thenReturn(Result.success(messageFrom(COMPLAINER)));

        Result<Void> result = validator.validateChatEvidence(request(ROOM, MESSAGE, null), user(COMPLAINER), user(COMPLAINED));
        assertThat(result.getErrorCode()).isEqualTo(ComplaintErrorCodes.COMPLAINT_MESSAGE_NOT_FROM_USER.getCode());
    }

    @Test
    void reportedMessageFromReportedUserInSharedChatIsAccepted() {
        when(chat.authorizeRoomAccess(ROOM, COMPLAINER)).thenReturn(Result.success(room(COMPLAINER, COMPLAINED)));
        when(chat.findMessageInRoom(MESSAGE, ROOM)).thenReturn(Result.success(messageFrom(COMPLAINED)));

        Result<Void> result = validator.validateChatEvidence(request(ROOM, MESSAGE, null), user(COMPLAINER), user(COMPLAINED));
        assertThat(result.isSuccess()).isTrue();
    }
}
