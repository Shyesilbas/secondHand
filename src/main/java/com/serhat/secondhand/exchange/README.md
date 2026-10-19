# Exchange Domain

## Purpose
The `exchange` domain provides multi-currency conversion rates between TRY, USD, EUR, and GBP for international pricing displays, escrow conversions, and product valuations.

## Architecture Overview
- **External Integration:** Integrates with ExchangeRate-API via `RestTemplate` with strict connect (5s) and read (10s) timeouts.
- **Two-Hour Redis Caching:** Responses are cached via `@Cacheable(value = "exchangeRates")` with a 2-hour TTL (`Duration.ofHours(2)`) to minimize external API consumption and ensure resilience against remote outages.
- **Input Validation:** Enforces ISO 4217 3-letter currency codes before initiating any network or cache requests.

## Business Invariants & Constraints
- **Case Normalization:** Cache keys and parameters are normalized to uppercase (e.g., `USD_TRY`).
- **Resilience:** If the remote exchange rate provider is unavailable, a cached entry is used if available; otherwise a structured `EXCHANGE_SERVICE_UNAVAILABLE` business exception is returned rather than hanging user transactions.

## Public APIs
- `GET /api/v1/exchange-rate?from={base}&to={target}`: Returns `{ "from": "USD", "to": "TRY", "rate": 34.25 }`.
