# secondHand Project Rules

## 0. Repository Invariants
- **Backend:** Java 17, Spring Boot 3, Spring Data JPA (PostgreSQL), MapStruct.
- **Frontend:** React 19 (Vite), TailwindCSS, React Router.
- **Client State/Data Fetching:** React Query (`@tanstack/react-query`).
- **Architecture/API:** RESTful APIs, Hexagonal Architecture, CQRS pattern, DTO-based responses.

## 1. Global AI Behavior
- **Context Loading Strategy:** Stop reading immediately once enough context is acquired. Never continue reading out of habit. 
- **Confidence-Based Escalation Rule:** Start with the minimum required context. If, after inspecting the source code, confidence is below approximately 80%, load the next most relevant documentation source. Escalation order: Source Code → Knowledge Item (if applicable) → Domain README → Architecture Decision Record (ADR) → Cross-domain documentation.
- **Intent-Based Routing:** Adapt your execution order based on the specific workflow:
  - *New Features:* 1. `GEMINI.md` → 2. `.agents/TASKS.md` → 3. Relevant Skill → 4. Target Layer Domain README → 5. Source Code.
  - *Implementation Bug (e.g., NullPointer, wrong mapper):* 1. `GEMINI.md` → 2. Source Code.
  - *Business Rule Bug (e.g., Cancellation rules, Escrow release):* 1. `GEMINI.md` → 2. Domain README → 3. Source Code.
  - *Investigations:* 1. `GEMINI.md` → 2. Knowledge Items (KIs) / Runbooks → 3. Domain README (ONLY if intended business behavior is required, skip by default) → 4. Source Code.
  - *Mechanical Refactoring (e.g., Rename, Extract Method):* 1. `GEMINI.md` → 2. Unit Tests → 3. Source Code.
  - *Behavioral Refactoring (e.g., Service decomposition, redesign):* 1. `GEMINI.md` → 2. Code Quality Skill → 3. Domain README → 4. Source Code.
- **Minimum Total Context Cost (MTCC):** Optimize every action for the minimum number of tokens loaded and minimum tool calls executed.
- **Safety Over Assumptions:** Make the safest change with the least context. Never silently assume intent, architecture, or business rules in high-risk domains (Payment, Escrow, Order).
- **Periodic Documentation Drift Validation:** Periodically audit READMEs and KIs for references to deleted packages, renamed classes, obsolete workflows, duplicate KIs, or overlapping documentation to prevent stale guidance from accumulating.

## 2. Global Constraints
- **Do not break abstraction:** Keep boundaries tight between modules.
- **High-Risk Domains:** `auth` (session stability), `payment` (financial transactions), `escrow` (state machines), `ewallet` (balances). Treat these with extreme caution.
- **No Stale Data:** Update `.agents/TASKS.md` immediately when the active working state changes.

## 3. Repository Navigation Philosophy
- **Domain & Layer Locality:** Load domain documentation only for the specific layer you are modifying (e.g., load frontend READMEs for frontend bugs). Never load unrelated domain or cross-layer documentation.
- **Behavior Priority:** When modifying existing behavior or refactoring, prefer **Unit Tests** over documentation. Tests represent actual validated behavior, whereas documentation only represents intended behavior.
- **Skills are Executable:** Skills (located in `.agents/skills/`) are self-contained executable units. Rely on their embedded rules.
- **No Monoliths:** Do not load large architectural decision files (ADRs) or historical changelogs into your context window unless explicitly necessary.
- **KI Metadata:** Every Knowledge Item MUST begin with a YAML metadata block defining: Purpose, Trigger, Load When, Do Not Load When, Required Context, Related KIs, and Estimated Tokens.

## 4. Final Reasoning Rules

### 4.1 Evidence-Based Investigation
- Start from the observable symptom.
- Follow only evidence that exists in the source code.
- Do not infer hidden architecture without supporting evidence.
- Do not assume asynchronous processing, event-driven architecture, caching layers, message queues, schedulers, or distributed systems unless the source code or documentation explicitly demonstrates their existence.
- Reasoning should always progress from facts to hypotheses, never the reverse.

### 4.2 Follow the Execution Path
- During investigations, always inspect the execution path before consulting additional documentation.
- Preferred investigation order: Observable symptom → Entry point → Call chain → Dependencies → Infrastructure → Architecture documentation (only if still ambiguous).
- Avoid jumping directly to downstream implementations before confirming they are involved.

### 4.3 Evidence Before Architecture
- Source code is the primary source of truth. Architectural documentation describes intended behavior. Implementation describes actual behavior.
- Whenever the implementation and documentation appear inconsistent, investigate the implementation first and use documentation only to clarify intended behavior.

### 4.4 Progressive Confidence Escalation
- Maintain an internal confidence estimate while gathering context.
- When confidence is sufficiently high (approximately 80% or greater), continue using the current context.
- Only load additional documentation when confidence falls below this threshold.
- Escalation order: Source Code → Knowledge Item → Domain README → Architecture Decision Record (ADR) → Cross-domain documentation.
- Never skip escalation levels without justification.

### 4.5 Minimize Architectural Assumptions
- Do not assume that a repository contains: Event-driven architecture, CQRS, Message queues, Redis, Kafka, RabbitMQ, Transactional Outbox, Saga, Event Sourcing unless explicitly documented, directly referenced by source code, or discovered during investigation.
- Repository invariants may establish technology choices, but should never be expanded into unsupported architectural assumptions.

### 4.6 Locality Before Breadth
- Investigations should begin with the smallest possible scope.
- Prefer: Single component → Single service → Single module → Single domain → Cross-domain reasoning.
- Avoid loading multiple domains before evidence indicates interaction between them.

### 4.7 Cross-Domain Escalation
- Do not load multiple domain READMEs simply because multiple domains appear in the user story.
- Only load another domain when the execution path demonstrably crosses that boundary.
- Example: Listing → publishes PaymentCompletedEvent → Payment → creates Order → Order → sends Notification. Only after discovering this chain should additional domains be loaded.

### 4.8 Behavior Before Documentation
- Whenever unit tests clearly define the expected behavior, prefer them over architectural documentation.
- Priority: Tests → Implementation → Knowledge Items → README → ADR.
- Documentation should explain behavior—not replace executable specifications.

### 4.9 Repository Documentation Philosophy
- Documentation exists to reduce uncertainty. It should never be loaded merely because it exists.
- Every documentation load must answer one question: "What uncertainty does this document remove?" If no concrete uncertainty is removed, the document should not be loaded.

### 4.10 Documentation Budget Rule
- Every task starts with a documentation budget.
- Estimate the minimum documentation required.
- Before opening each additional document ask: "Will this document likely increase confidence by at least 15%?"
- If not, skip it.
- Always maximize: Confidence gained per token consumed.

### 4.11 Hypothesis Generation and Grouping
- **Hypothesis Budget Rule:** Produce at most 3 primary hypotheses ordered by posterior probability. Additional hypotheses should only be generated if evidence collected from source code rejects all primary hypotheses.
- **Priority Classes:** Group hypotheses into logical priority classes (e.g., Priority 1: React Query synchronization, Priority 2: Component State, Priority 3: Backend consistency) rather than presenting a flat list.

### 4.12 Evidence-First Identifiers
- Intentionally avoid assuming or guessing exact identifiers, such as React Query `queryKeys`, API endpoints, or specific component names.
- Explicitly state your strategy to locate them first (e.g., "My first task is locating every `useQuery()` serving this page via grep") before proceeding with the investigation.

### 4.13 Executable Debugging Path
- Every investigation must conclude with an "Expected Debugging Path".
- Provide an explicit, step-by-step, actionable sequence of steps that guides the exact debugging process (e.g., Step 1: Locate useQuery → Step 2: Locate mutation → Step 3: Compare queryKeys → Step 4: Verify invalidateQueries → Step 5: Open DevTools).
