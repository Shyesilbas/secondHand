package com.serhat.secondhand.chat;

import com.serhat.secondhand.chat.dto.ChatMessageDto;
import com.serhat.secondhand.chat.entity.Message;
import com.serhat.secondhand.chat.mapper.ChatMessageMapper;
import com.serhat.secondhand.user.domain.entity.User;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class ChatMessageMapperTest {

    private final ChatMessageMapper mapper = new ChatMessageMapper();

    private static Message message() {
        User a = new User();
        a.setId(1L);
        User b = new User();
        b.setId(2L);
        Message m = new Message();
        m.setSender(a);
        m.setRecipient(b);
        m.setContent("violating text");
        m.setIsRead(false);
        return m;
    }

    @Test
    void removedMessageNeverLeaksContent() {
        Message m = message();
        m.setRemovedByModeration(true);

        ChatMessageDto dto = mapper.toDto(m);

        assertThat(dto.isRemovedByModeration()).isTrue();
        assertThat(dto.getContent()).isNull();
    }

    @Test
    void normalMessageKeepsContent() {
        ChatMessageDto dto = mapper.toDto(message());

        assertThat(dto.isRemovedByModeration()).isFalse();
        assertThat(dto.getContent()).isEqualTo("violating text");
    }
}
