---
name: API Contract
description: Establishes the contract between the backend endpoint and the frontend service layer when a new feature is added.
triggers:
  - "api contract"
  - "new endpoint"
---

# API Contract

## Trigger
Establish the contract for both sides together when a new backend endpoint or frontend feature is added. Triggered by "api contract" or "new endpoint".
If a domain name is not provided, ask: "Which domain are we adding the feature to?"

## Zero-I/O Architectural Rules
- **Backend Response Wrapping:** Backend must use `ResultResponses` wrapper for all responses. 
  - Success: `return ResultResponses.ok(Result.success(dto));`
  - Error: Return `{ "error": "CODE", "message": "..." }`
- **Frontend Fetching:** Use `react-query` (`useQuery`, `useMutation`). Do not use `fetch` or `axios` inside `useEffect`.
- **Frontend Responses:** Frontend receives direct DTO on success. Double unwrap is prohibited (use `response.data`, not `response.data.data`).
- **Data Transfer:** Always use DTOs for request/response. Use `jakarta.validation` constraints. Controllers must NEVER return Entity models.

## Workflow Steps

### 1. Define the Backend Contract
- HTTP Method: GET / POST / PUT / DELETE / PATCH
- Path: `/api/v1/[domain]/[resource]`
- Auth: Required / Public
- Request Body: [DTO name and fields]
- Response: [DTO name and fields]
- Error Codes: [ERROR_CODE → description]

### 2. Backend Implementation Order
1. Write Request/Response DTO
2. Add Repository method
3. Write Validator/Policy rule
4. Write Service method
5. Add endpoint to Controller → Wrap with `ResultResponses`

### 3. Frontend Implementation Order
1. Write API service function
2. Write React Query hook
3. Use the hook in the Component

### 4. Cache & Security
- Check Cache implications (`@CacheEvict`, `queryClient.invalidateQueries`).
- Verify Auth (`@PreAuthorize`), rate limits, ownership checks, and data leakage.
