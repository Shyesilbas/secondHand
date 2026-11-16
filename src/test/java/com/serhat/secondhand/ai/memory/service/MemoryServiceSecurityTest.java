package com.serhat.secondhand.ai.memory.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.serhat.secondhand.ai.application.GeminiClient;
import com.serhat.secondhand.ai.dto.SecondHandProfileDto;
import com.serhat.secondhand.ai.dto.UserMemory;
import com.serhat.secondhand.ai.dto.UserMemoryDto;
import com.serhat.secondhand.ai.memory.repository.ChatMessageRepository;
import com.serhat.secondhand.ai.memory.repository.UserMemoryRepository;
import com.serhat.secondhand.ai.util.AiErrorCodes;
import com.serhat.secondhand.core.exception.BusinessException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MemoryServiceSecurityTest {

    @Mock
    private UserMemoryRepository userMemoryRepository;

    @Mock
    private ChatMessageRepository chatMessageRepository;

    @Mock
    private GeminiClient geminiClient;

    @Mock
    private MemoryConversationService memoryConversationService;

    private MemoryService memoryService;

    @BeforeEach
    void setUp() {
        memoryService = new MemoryService(
                userMemoryRepository,
                chatMessageRepository,
                geminiClient,
                memoryConversationService,
                new ObjectMapper()
        );
    }

    @Test
    void updateMemoryAndRemoveInterestDoNotTriggerLlmSummaryRefreshAndClampFields() {
        UserMemory memory = new UserMemory(9L, "Friendly");
        when(userMemoryRepository.findById(9L)).thenReturn(Optional.of(memory));
        when(userMemoryRepository.save(any(UserMemory.class))).thenAnswer(inv -> inv.getArgument(0));

        List<String> tooManyInterests = new ArrayList<>();
        for (int i = 0; i < 30; i++) {
            tooManyInterests.add("interest-" + i + "-" + "x".repeat(80));
        }
        List<String> tooManyBrands = new ArrayList<>();
        for (int i = 0; i < 30; i++) {
            tooManyBrands.add("BrandVeryLongName-" + i + "-" + "y".repeat(40));
        }

        UserMemoryDto dto = new UserMemoryDto(
                "A".repeat(150),
                "formal",
                tooManyInterests,
                "N".repeat(1200),
                new SecondHandProfileDto(
                        List.of("Electronics", "Automobile"),
                        tooManyBrands,
                        new SecondHandProfileDto.BudgetDto(BigDecimal.TEN, BigDecimal.valueOf(50000), "TRY")
                )
        );

        memoryService.updateMemory(9L, dto);

        assertThat(memory.getUserName()).hasSize(60);
        assertThat(memory.getUserNotes()).hasSize(500);
        assertThat(memory.getPermanentInterests()).hasSize(20);
        assertThat(memory.getPermanentInterests()).allSatisfy(item -> assertThat(item.length()).isLessThanOrEqualTo(60));
        assertThat(memory.getSecondHandProfileJson()).hasSizeLessThanOrEqualTo(1000);

        memoryService.removeInterest(9L, memory.getPermanentInterests().get(0));
        assertThat(memory.getPermanentInterests()).hasSize(19);

        verify(userMemoryRepository, org.mockito.Mockito.times(2)).save(memory);
        verifyNoInteractions(geminiClient, memoryConversationService);
    }

    @Test
    void removeInterestRejectsBlankOrOversizedInterest() {
        assertThatThrownBy(() -> memoryService.removeInterest(9L, "   "))
                .isInstanceOf(BusinessException.class)
                .extracting(e -> ((BusinessException) e).getErrorCode())
                .isEqualTo(AiErrorCodes.AI_INVALID_REQUEST.getCode());

        assertThatThrownBy(() -> memoryService.removeInterest(9L, "z".repeat(61)))
                .isInstanceOf(BusinessException.class)
                .extracting(e -> ((BusinessException) e).getErrorCode())
                .isEqualTo(AiErrorCodes.AI_INVALID_REQUEST.getCode());

        verifyNoInteractions(geminiClient, memoryConversationService, userMemoryRepository);
    }
}
