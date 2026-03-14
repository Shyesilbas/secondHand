package com.serhat.secondhand.ai.agent.query;

import com.serhat.secondhand.ai.agent.dto.AgentUiContextRequest;

public interface AgentContextAdapter {

    AgentContextSection fetch(Long userId, AgentUiContextRequest uiContext);
}
