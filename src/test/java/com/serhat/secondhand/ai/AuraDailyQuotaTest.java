package com.serhat.secondhand.ai;

import com.serhat.secondhand.ai.agent.prompt.AgentPromptBuilder;
import com.serhat.secondhand.ai.application.GeminiAiService;
import com.serhat.secondhand.ai.application.GeminiClient;
import com.serhat.secondhand.ai.dto.AiResponse;
import com.serhat.secondhand.ai.dto.UserQuestionRequest;
import com.serhat.secondhand.ai.memory.service.MemoryService;
import com.serhat.secondhand.core.exception.BusinessException;
import com.serhat.secondhand.user.domain.entity.User;
import com.serhat.secondhand.user.domain.repository.UserRepository;
import com.serhat.secondhand.user.dto.MembershipStatusDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.transaction.PlatformTransactionManager;

import java.time.LocalDate;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class AuraDailyQuotaTest {

    private final UserRepository userRepository = mock(UserRepository.class);
    private final GeminiClient geminiClient = mock(GeminiClient.class);
    private final MemoryService memoryService = mock(MemoryService.class);
    private GeminiAiService service;
    private User user;

    @BeforeEach
    void setUp() {
        service = new GeminiAiService(memoryService, geminiClient, mock(AgentPromptBuilder.class),
                userRepository, mock(PlatformTransactionManager.class));
        user = new User();
        user.setId(7L);
        when(userRepository.findById(7L)).thenReturn(Optional.of(user));
    }

    @Test
    void usageFromAnEarlierDay_isShownAsZeroToday() {
        user.setDailyAuraUsage(2);
        user.setDailyAuraResetDate(LocalDate.now().minusDays(1));

        assertThat(MembershipStatusDto.from(user).dailyAuraUsage()).isZero();

        user.setDailyAuraResetDate(LocalDate.now());
        assertThat(MembershipStatusDto.from(user).dailyAuraUsage()).isEqualTo(2);
    }

    @Test
    void reachedLimit_isThrownAsLimitError_withoutCallingGemini() {
        when(userRepository.reserveAuraSlot(anyLong(), any(LocalDate.class), anyInt())).thenReturn(0);

        assertThatThrownBy(() -> service.askQuestion(7L, new UserQuestionRequest("fiyat?", null)))
                .isInstanceOf(BusinessException.class)
                .extracting(e -> ((BusinessException) e).getErrorCode())
                .isEqualTo("AURA_LIMIT_EXCEEDED");

        verify(geminiClient, never()).generateText(anyString());
        verify(userRepository, never()).releaseAuraSlot(anyLong(), any(LocalDate.class));
    }

    @Test
    void failedAnswer_givesTheSlotBack() {
        when(userRepository.reserveAuraSlot(anyLong(), any(LocalDate.class), anyInt())).thenReturn(1);
        when(geminiClient.generateText(anyString())).thenThrow(new IllegalStateException("gemini down"));

        AiResponse response = service.askQuestion(7L, new UserQuestionRequest("fiyat?", null));

        assertThat(response.success()).isFalse();
        verify(userRepository).releaseAuraSlot(7L, LocalDate.now());
    }
}
