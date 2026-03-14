package com.serhat.secondhand.ai.agent.query;

import com.serhat.secondhand.ai.agent.dto.AgentUiContextRequest;
import com.serhat.secondhand.ai.dto.UserMemory;
import com.serhat.secondhand.ai.memory.service.MemoryService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AgentQueryServiceTest {

    @Mock
    private MemoryService memoryService;

    @Mock
    private AgentContextAdapter adapterOne;

    @Mock
    private AgentContextAdapter adapterTwo;

    @Test
    void shouldBuildContextWithDataSourcesAndDomainSummary() {
        Long userId = 10L;
        AgentUiContextRequest uiContext = new AgentUiContextRequest("AuraChatPage", "/aura", null, Map.of());

        UserMemory memory = new UserMemory(userId, "Friendly");
        when(memoryService.getOrCreate(userId)).thenReturn(memory);
        when(memoryService.buildMemoryData(memory)).thenReturn("userName=Test User");
        when(adapterOne.fetch(userId, uiContext)).thenReturn(new AgentContextSection("orders", "Order summary", "ok"));
        when(adapterTwo.fetch(userId, uiContext)).thenReturn(new AgentContextSection("listings", "Listing summary", "unavailable"));

        AgentQueryService service = new AgentQueryService(memoryService, List.of(adapterOne, adapterTwo));
        AgentQueryService.AgentContextBundle bundle = service.buildContext(userId, uiContext);

        assertEquals("userName=Test User", bundle.memoryData());
        assertFalse(bundle.domainContext().isBlank());
        assertEquals(2, bundle.dataSources().size());
        assertTrue(bundle.dataSources().stream().anyMatch(ds -> "orders".equals(ds.source())));
        assertTrue(bundle.dataSources().stream().anyMatch(ds -> "listings".equals(ds.source())));
    }
}
