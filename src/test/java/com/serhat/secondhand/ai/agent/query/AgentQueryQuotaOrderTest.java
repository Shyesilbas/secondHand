package com.serhat.secondhand.ai.agent.query;

import com.serhat.secondhand.ai.agent.dto.AgentQueryRequest;
import com.serhat.secondhand.ai.agent.dto.AgentQueryResponse;
import com.serhat.secondhand.ai.agent.search.AuraListingSearchOrchestrator;
import com.serhat.secondhand.ai.application.GeminiAiService;
import com.serhat.secondhand.ai.memory.service.MemoryService;
import com.serhat.secondhand.ai.util.AiErrorCodes;
import com.serhat.secondhand.core.exception.BusinessException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.concurrent.Executor;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AgentQueryQuotaOrderTest {

    @Mock
    private MemoryService memoryService;

    @Mock
    private GeminiAiService geminiAiService;

    @Mock
    private AuraListingSearchOrchestrator listingSearchOrchestrator;

    @Test
    void reservesQuotaBeforeSearchPlannerAndRejectsExhaustedUserWithoutCallingOrchestrator() {
        Executor directExecutor = Runnable::run;
        AgentQueryService service = new AgentQueryService(
                memoryService,
                List.of(),
                directExecutor,
                geminiAiService,
                listingSearchOrchestrator
        );

        when(geminiAiService.reserveAuraSlotForUser(42L))
                .thenThrow(new BusinessException(AiErrorCodes.AURA_LIMIT_EXCEEDED));

        AgentQueryRequest request = new AgentQueryRequest("iPhone 15 bul", null, true, null);

        assertThatThrownBy(() -> service.executeQuery(42L, request))
                .isInstanceOf(BusinessException.class)
                .extracting(e -> ((BusinessException) e).getErrorCode())
                .isEqualTo(AiErrorCodes.AURA_LIMIT_EXCEEDED.getCode());

        verifyNoInteractions(listingSearchOrchestrator, memoryService);
    }

    @Test
    void releasesReservedQuotaIfSearchOrchestratorFailsAfterReservation() {
        Executor directExecutor = Runnable::run;
        AgentQueryService service = new AgentQueryService(
                memoryService,
                List.of(),
                directExecutor,
                geminiAiService,
                listingSearchOrchestrator
        );

        LocalDate today = LocalDate.now();
        when(geminiAiService.reserveAuraSlotForUser(7L)).thenReturn(today);
        when(memoryService.buildMemoryData(any())).thenReturn("userId=7");
        when(listingSearchOrchestrator.augment(any(), any(), any()))
                .thenThrow(new BusinessException(AiErrorCodes.AI_DAILY_BUDGET_EXCEEDED));

        AgentQueryRequest request = new AgentQueryRequest("iPhone 15 bul", null, true, null);
        AgentQueryResponse response = service.executeQuery(7L, request);

        assertThat(response.success()).isFalse();
        verify(geminiAiService).releaseAuraSlotForUser(7L, today);
    }
}
