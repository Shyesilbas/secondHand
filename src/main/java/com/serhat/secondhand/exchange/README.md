# Exchange Domain

Provides cached currency conversion rates between `USD`, `EUR`, and `TRY` via ExchangeRate-API (`ExchangeRateService`).

> [!NOTE]
> **Related Documentation & Runbooks:**
> - **Architecture Deep Dive:** [`docs/external-integrations-cloudinary-and-exchange.md`](/docs/external-integrations-cloudinary-and-exchange.md)
> - **Frontend Module:** [`secondhand-frontend/src/common/README.md`](/secondhand-frontend/src/common/README.md)
> - **Key Entry Points:** [`ExchangeRateController`](api/ExchangeRateController.java) · [`ExchangeRateService`](application/ExchangeRateService.java) · [`ExchangeRateDto`](ExchangeRateDto.java)

## Business Rules & Invariants
- **Supported ISO Currencies:** Validates `from` and `to` strictly against `USD`, `EUR`, and `TRY` (case-insensitive, normalized to uppercase).
- **Bounded Timeouts & Structured Errors:** Outbound `RestTemplate` calls use 5s connection and 10s read timeouts (`ExchangeConfig`); failures map to `EXCHANGE_SERVICE_UNAVAILABLE` (`503`), `EXCHANGE_SERVICE_ERROR` (`502`), or `EXCHANGE_UNEXPECTED_ERROR` (`500`).

## Redis & Caching
- Spring cache `payment:exchangeRates` (`CacheConfig`, key `#from.toUpperCase() + '_' + #to.toUpperCase()`, 2h TTL).

## API (`ExchangeRateController`, `/api/v1/exchange-rates`)
- `GET /{from}/{to}` (`@PublicEndpoint`) — returns `ExchangeRateDto` (`from`, `to`, `rate`).
