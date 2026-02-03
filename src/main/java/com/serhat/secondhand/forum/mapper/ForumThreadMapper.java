package com.serhat.secondhand.forum.mapper;

import com.serhat.secondhand.forum.dto.ForumThreadDto;
import com.serhat.secondhand.forum.entity.ForumThread;
import com.serhat.secondhand.forum.entity.converter.StringListJsonConverter;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class ForumThreadMapper {

    private final StringListJsonConverter converter = new StringListJsonConverter();

    public ForumThreadDto toDto(ForumThread thread) {
        if (thread == null) return null;
        List<String> keywords = converter.convertToEntityAttribute(thread.getKeywordsJson());
        return new ForumThreadDto(
                thread.getId(),
                thread.getTitle(),
                thread.getDescription(),
                thread.getCategory(),
                thread.getStatus(),
                thread.getUserId(),
                thread.getAuthorVisibility(),
                thread.getAuthorDisplayName(),
                thread.getTotalLikes(),
                thread.getTotalDislikes(),
                keywords,
                thread.getCreatedAt(),
                thread.getUpdatedAt(),
                thread.getVersion()
        );
    }

    public String toKeywordsJson(List<String> keywords) {
        return converter.convertToDatabaseColumn(keywords);
    }
}

