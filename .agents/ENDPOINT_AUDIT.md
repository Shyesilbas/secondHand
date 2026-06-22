# Endpoint Audit Raporu
_Tarih: 2026-06-22_

## Tutarsızlıklar

### Path Formatı Sorunları
| Controller | Mevcut Path | Olması Gereken | Sorun |
|-----------|-------------|----------------|-------|
| - | - | - | Yok |

### Versiyon Eksikliği
| Controller | Path | Sorun |
|-----------|------|-------|
| - | - | Yok |

### Eksik Yetkilendirme (@PreAuthorize)
| Controller | Method | Path |
|-----------|--------|------|
| AddressController | POST | /api/v1/users/addresses |
| AddressController | PUT | /api/v1/users/addresses/{id} |
| AddressController | DELETE | /api/v1/users/addresses/{id} |
| AddressController | POST | /api/v1/users/addresses/{id}/main |
| AgentController | POST | /api/v1/ai/agents/query |
| AgreementController | POST | /api/v1/agreements/accept |
| AgreementController | POST | /api/v1/agreements/initialize |
| AgreementController | GET | /api/v1/agreements/user/acceptance-history/{agreement-id} |
| AgreementController | GET | /api/v1/agreements/user/agreements |
| AgreementController | GET | /api/v1/agreements/user/status/{agreement-type} |
| AiChatController | POST | /api/v1/ai/chats |
| AiChatController | DELETE | /api/v1/ai/chats/history |
| AiChatController | POST | /api/v1/ai/chats/new |
| AiChatController | DELETE | /api/v1/ai/memories |
| AiSummaryController | GET | /api/v1/ai/summary/user/{user-id} |
| BooksListingController | POST | /api/v1/books/create-listing |
| BooksListingController | POST | /api/v1/books/filter |
| BooksListingController | PUT | /api/v1/books/{id} |
| CampaignController | POST | /api/v1/seller/campaigns |
| CampaignController | PUT | /api/v1/seller/campaigns/{id} |
| CampaignController | DELETE | /api/v1/seller/campaigns/{id} |
| CartController | POST | /api/v1/cart/items |
| CartController | DELETE | /api/v1/cart/items |
| CartController | PUT | /api/v1/cart/items/{listing-id} |
| CartController | DELETE | /api/v1/cart/items/{listing-id} |
| ChatRestController | POST | /api/v1/chats/messages |
| ChatRestController | DELETE | /api/v1/chats/messages/{message-id} |
| ChatRestController | POST | /api/v1/chats/rooms/direct |
| ChatRestController | POST | /api/v1/chats/rooms/listing/{listing-id} |
| ChatRestController | DELETE | /api/v1/chats/rooms/{chat-room-id} |
| ChatRestController | PUT | /api/v1/chats/rooms/{chat-room-id}/messages/read |
| ClothingListingController | POST | /api/v1/clothing/create-listing |
| ClothingListingController | POST | /api/v1/clothing/filter |
| ClothingListingController | PUT | /api/v1/clothing/{id} |
| ComplaintController | POST | /api/v1/complaints |
| CouponController | POST | /api/v1/coupons/preview |
| DashboardController | GET | /api/v1/dashboards/buyer |
| DashboardController | GET | /api/v1/dashboards/seller |
| EWalletController | POST | /api/v1/e-wallets |
| EWalletController | POST | /api/v1/e-wallets/deposit |
| EWalletController | PUT | /api/v1/e-wallets/limits |
| EWalletController | PUT | /api/v1/e-wallets/update/spending-warning |
| EWalletController | DELETE | /api/v1/e-wallets/update/spending-warning |
| EWalletController | POST | /api/v1/e-wallets/withdraw |
| ElectronicListingController | POST | /api/v1/electronics/create-listing |
| ElectronicListingController | POST | /api/v1/electronics/filter |
| ElectronicListingController | PUT | /api/v1/electronics/{id} |
| EmailController | DELETE | /api/v1/emails |
| EmailController | GET | /api/v1/emails/my-emails |
| EmailController | GET | /api/v1/emails/my-emails/{email-type} |
| EmailController | DELETE | /api/v1/emails/{email-id} |
| EmailController | PATCH | /api/v1/emails/{id}/read |
| FavoriteController | POST | /api/v1/favorites |
| FavoriteController | POST | /api/v1/favorites/stats |
| FavoriteController | POST | /api/v1/favorites/toggle |
| FavoriteController | DELETE | /api/v1/favorites/{listing-id} |
| FavoriteListController | POST | /api/v1/favorite-lists |
| FavoriteListController | GET | /api/v1/favorite-lists/my |
| FavoriteListController | GET | /api/v1/favorite-lists/user/{user-id} |
| FavoriteListController | PUT | /api/v1/favorite-lists/{list-id} |
| FavoriteListController | DELETE | /api/v1/favorite-lists/{list-id} |
| FavoriteListController | POST | /api/v1/favorite-lists/{list-id}/items |
| FavoriteListController | DELETE | /api/v1/favorite-lists/{list-id}/items/{listing-id} |
| FavoriteListController | POST | /api/v1/favorite-lists/{list-id}/like |
| FavoriteListController | DELETE | /api/v1/favorite-lists/{list-id}/like |
| ForumController | POST | /api/v1/forums/threads |
| ForumController | PATCH | /api/v1/forums/threads/{thread-id} |
| ForumController | DELETE | /api/v1/forums/threads/{thread-id} |
| ForumController | POST | /api/v1/forums/threads/{thread-id}/comments |
| ForumController | POST | /api/v1/forums/threads/{thread-id}/comments/{comment-id}/reaction |
| ForumController | POST | /api/v1/forums/threads/{thread-id}/reaction |
| ForumController | PATCH | /api/v1/forums/threads/{thread-id}/status |
| GeminiController | POST | /api/v1/ai/tests/ask |
| ImageController | DELETE | /api/v1/images/delete |
| ImageController | POST | /api/v1/images/upload |
| ListingController | POST | /api/v1/listings/bulks |
| ListingController | POST | /api/v1/listings/filter |
| ListingController | POST | /api/v1/listings/pay-fee |
| ListingController | PUT | /api/v1/listings/price/batch |
| ListingController | PUT | /api/v1/listings/quantity/batch |
| ListingController | DELETE | /api/v1/listings/{id} |
| ListingController | PUT | /api/v1/listings/{id}/deactivate |
| ListingController | PUT | /api/v1/listings/{id}/mark-sold |
| ListingController | PUT | /api/v1/listings/{id}/price |
| ListingController | PUT | /api/v1/listings/{id}/publish |
| ListingController | PUT | /api/v1/listings/{id}/quantity |
| ListingController | PUT | /api/v1/listings/{id}/reactivate |
| ListingController | POST | /api/v1/listings/{id}/relist |
| ListingViewController | POST | /api/v1/listings/{id}/view |
| MembershipController | POST | /api/v1/memberships/cancel |
| MembershipController | POST | /api/v1/memberships/upgrade |
| NotificationController | PUT | /api/v1/notifications/read-all |
| NotificationController | PUT | /api/v1/notifications/{id}/read |
| OfferController | POST | /api/v1/offers |
| OfferController | POST | /api/v1/offers/{offer-id}/accept |
| OfferController | POST | /api/v1/offers/{offer-id}/counter |
| OfferController | POST | /api/v1/offers/{offer-id}/reject |
| OrderController | POST | /api/v1/orders/checkout |
| OrderController | PUT | /api/v1/orders/{order-id}/address |
| OrderController | PUT | /api/v1/orders/{order-id}/cancel |
| OrderController | PUT | /api/v1/orders/{order-id}/complete |
| OrderController | PUT | /api/v1/orders/{order-id}/name |
| OrderController | PUT | /api/v1/orders/{order-id}/notes |
| OrderController | POST | /api/v1/orders/{order-id}/refund |
| OrderController | PUT | /api/v1/orders/{order-id}/ship |
| OrderController | POST | /api/v1/orders/{order-number}/confirm-handover-completion |
| OrderController | POST | /api/v1/orders/{order-number}/regenerate-meetup-code |
| OrderController | POST | /api/v1/orders/{order-number}/verify-meetup |
| RateLimitTestController | POST | /api/v1/test/rate-limits/payment/burst |
| RealEstateController | POST | /api/v1/real-estates/create-listing |
| RealEstateController | POST | /api/v1/real-estates/filter |
| RealEstateController | PUT | /api/v1/real-estates/{id} |
| ReviewController | POST | /api/v1/reviews |
| SellerFollowController | GET | /api/v1/follows/user/{user-id}/followers |
| SellerFollowController | GET | /api/v1/follows/user/{user-id}/following |
| SellerFollowController | POST | /api/v1/follows/{user-id} |
| SellerFollowController | DELETE | /api/v1/follows/{user-id} |
| SellerFollowController | PATCH | /api/v1/follows/{user-id}/notifications |
| ShowcaseController | POST | /api/v1/showcases |
| ShowcaseController | POST | /api/v1/showcases/bulks |
| ShowcaseController | GET | /api/v1/showcases/my |
| ShowcaseController | POST | /api/v1/showcases/{id}/cancel |
| ShowcaseController | POST | /api/v1/showcases/{id}/extend |
| SportsListingController | POST | /api/v1/sports/create-listing |
| SportsListingController | POST | /api/v1/sports/filter |
| SportsListingController | PUT | /api/v1/sports/{id} |
| UserBadgesController | GET | /api/v1/user/badges |
| UserController | PUT | /api/v1/users/email |
| UserController | PUT | /api/v1/users/phone |
| VehicleListingController | POST | /api/v1/vehicles/create-listing |
| VehicleListingController | POST | /api/v1/vehicles/filter |
| VehicleListingController | PUT | /api/v1/vehicles/{id} |

## Tam Endpoint Listesi
| # | Method | Path | Auth | Body | Params | Controller |
|---|--------|------|------|------|--------|-----------|
| 1 | GET | /api/v1/users/addresses | No | False | False | AddressController |
| 2 | POST | /api/v1/users/addresses | No | True | False | AddressController |
| 3 | PUT | /api/v1/users/addresses/{id} | No | True | False | AddressController |
| 4 | DELETE | /api/v1/users/addresses/{id} | No | False | False | AddressController |
| 5 | POST | /api/v1/users/addresses/{id}/main | No | False | False | AddressController |
| 6 | GET | /api/v1/admin/coupons | Yes | False | False | AdminCouponController |
| 7 | POST | /api/v1/admin/coupons | Yes | False | False | AdminCouponController |
| 8 | GET | /api/v1/admin/coupons/audience-stats | Yes | False | False | AdminCouponController |
| 9 | PUT | /api/v1/admin/coupons/{id} | Yes | False | False | AdminCouponController |
| 10 | POST | /api/v1/ai/agents/query | No | True | False | AgentController |
| 11 | GET | /api/v1/agreements | No | False | False | AgreementController |
| 12 | POST | /api/v1/agreements/accept | No | False | False | AgreementController |
| 13 | POST | /api/v1/agreements/initialize | No | False | False | AgreementController |
| 14 | GET | /api/v1/agreements/required | No | False | False | AgreementController |
| 15 | GET | /api/v1/agreements/user/acceptance-history/{agreement-id} | No | False | False | AgreementController |
| 16 | GET | /api/v1/agreements/user/agreements | No | False | False | AgreementController |
| 17 | GET | /api/v1/agreements/user/status/{agreement-type} | No | False | False | AgreementController |
| 18 | GET | /api/v1/agreements/{agreement-type} | No | False | False | AgreementController |
| 19 | POST | /api/v1/ai/chats | No | True | False | AiChatController |
| 20 | DELETE | /api/v1/ai/chats/history | No | False | False | AiChatController |
| 21 | POST | /api/v1/ai/chats/new | No | False | False | AiChatController |
| 22 | DELETE | /api/v1/ai/memories | No | False | False | AiChatController |
| 23 | GET | /api/v1/ai/summary/listing/{listing-id} | No | False | False | AiSummaryController |
| 24 | GET | /api/v1/ai/summary/user/{user-id} | No | False | False | AiSummaryController |
| 25 | GET | /api/v1/audit/enums/all | No | False | False | AuditEnumController |
| 26 | GET | /api/v1/audit/enums/event-statuses | No | False | False | AuditEnumController |
| 27 | GET | /api/v1/audit/enums/event-types | No | False | False | AuditEnumController |
| 28 | GET | /api/v1/admin/audit-logs/date-range | Yes | False | False | AuditLogController |
| 29 | GET | /api/v1/admin/audit-logs/event-type/{event-type} | Yes | False | False | AuditLogController |
| 30 | GET | /api/v1/admin/audit-logs/failed-attempts/ip/{ip-address} | Yes | False | False | AuditLogController |
| 31 | GET | /api/v1/admin/audit-logs/failed-attempts/user/{user-email} | Yes | False | False | AuditLogController |
| 32 | GET | /api/v1/admin/audit-logs/user/id/{user-id} | Yes | False | False | AuditLogController |
| 33 | GET | /api/v1/admin/audit-logs/user/{user-email} | Yes | False | False | AuditLogController |
| 34 | POST | /api/v1/auth/login | No | True | False | AuthController |
| 35 | POST | /api/v1/auth/logout | No | False | False | AuthController |
| 36 | POST | /api/v1/auth/oauth2/complete | No | True | False | AuthController |
| 37 | GET | /api/v1/auth/oauth2/google | No | False | False | AuthController |
| 38 | POST | /api/v1/auth/refresh | No | False | False | AuthController |
| 39 | POST | /api/v1/auth/register | No | True | False | AuthController |
| 40 | POST | /api/v1/auth/revoke-all-sessions | No | False | False | AuthController |
| 41 | POST | /api/v1/books/create-listing | No | False | False | BooksListingController |
| 42 | POST | /api/v1/books/filter | No | False | False | BooksListingController |
| 43 | PUT | /api/v1/books/{id} | No | False | False | BooksListingController |
| 44 | GET | /api/v1/books/{id} | No | False | False | BooksListingController |
| 45 | POST | /api/v1/seller/campaigns | No | True | False | CampaignController |
| 46 | GET | /api/v1/seller/campaigns | No | False | True | CampaignController |
| 47 | PUT | /api/v1/seller/campaigns/{id} | No | True | False | CampaignController |
| 48 | DELETE | /api/v1/seller/campaigns/{id} | No | False | False | CampaignController |
| 49 | GET | /api/v1/cart | No | False | False | CartController |
| 50 | GET | /api/v1/cart/check/{listing-id} | No | False | False | CartController |
| 51 | GET | /api/v1/cart/count | No | False | False | CartController |
| 52 | POST | /api/v1/cart/items | No | False | False | CartController |
| 53 | DELETE | /api/v1/cart/items | No | False | False | CartController |
| 54 | PUT | /api/v1/cart/items/{listing-id} | No | False | False | CartController |
| 55 | DELETE | /api/v1/cart/items/{listing-id} | No | False | False | CartController |
| 56 | GET | /api/v1/cart/reservations/count/{listing-id} | No | False | False | CartController |
| 57 | POST | /api/v1/chats/messages | No | True | False | ChatRestController |
| 58 | GET | /api/v1/chats/messages/unread-count | No | False | False | ChatRestController |
| 59 | GET | /api/v1/chats/messages/user | No | False | True | ChatRestController |
| 60 | DELETE | /api/v1/chats/messages/{message-id} | No | False | False | ChatRestController |
| 61 | POST | /api/v1/chats/rooms/direct | No | False | True | ChatRestController |
| 62 | POST | /api/v1/chats/rooms/listing/{listing-id} | No | False | False | ChatRestController |
| 63 | GET | /api/v1/chats/rooms/user | No | False | False | ChatRestController |
| 64 | DELETE | /api/v1/chats/rooms/{chat-room-id} | No | False | False | ChatRestController |
| 65 | GET | /api/v1/chats/rooms/{chat-room-id}/messages | No | False | False | ChatRestController |
| 66 | PUT | /api/v1/chats/rooms/{chat-room-id}/messages/read | No | False | False | ChatRestController |
| 67 | GET | /api/v1/clothing/brands/{brand-id}/types/{clothing-type-id} | No | False | False | ClothingListingController |
| 68 | POST | /api/v1/clothing/create-listing | No | False | False | ClothingListingController |
| 69 | POST | /api/v1/clothing/filter | No | False | False | ClothingListingController |
| 70 | PUT | /api/v1/clothing/{id} | No | False | False | ClothingListingController |
| 71 | GET | /api/v1/clothing/{id} | No | False | False | ClothingListingController |
| 72 | POST | /api/v1/complaints | No | True | False | ComplaintController |
| 73 | GET | /api/v1/coupons/active | No | False | False | CouponController |
| 74 | POST | /api/v1/coupons/preview | No | False | False | CouponController |
| 75 | GET | /api/v1/coupons/redemptions | No | False | False | CouponController |
| 76 | GET | /api/v1/dashboards/buyer | No | False | False | DashboardController |
| 77 | GET | /api/v1/dashboards/seller | No | False | False | DashboardController |
| 78 | POST | /api/v1/e-wallets | No | True | False | EWalletController |
| 79 | GET | /api/v1/e-wallets | No | False | False | EWalletController |
| 80 | GET | /api/v1/e-wallets/balance/check | No | False | True | EWalletController |
| 81 | POST | /api/v1/e-wallets/deposit | No | True | False | EWalletController |
| 82 | PUT | /api/v1/e-wallets/limits | No | True | False | EWalletController |
| 83 | GET | /api/v1/e-wallets/spending-warning/check | No | False | True | EWalletController |
| 84 | GET | /api/v1/e-wallets/transactions | No | False | False | EWalletController |
| 85 | PUT | /api/v1/e-wallets/update/spending-warning | No | True | False | EWalletController |
| 86 | DELETE | /api/v1/e-wallets/update/spending-warning | No | False | False | EWalletController |
| 87 | POST | /api/v1/e-wallets/withdraw | No | True | False | EWalletController |
| 88 | POST | /api/v1/electronics/create-listing | No | False | False | ElectronicListingController |
| 89 | GET | /api/v1/electronics/electronic-types/{electronic-type-id} | No | False | False | ElectronicListingController |
| 90 | POST | /api/v1/electronics/filter | No | False | False | ElectronicListingController |
| 91 | PUT | /api/v1/electronics/{id} | No | False | False | ElectronicListingController |
| 92 | GET | /api/v1/electronics/{id} | No | False | False | ElectronicListingController |
| 93 | DELETE | /api/v1/emails | No | False | False | EmailController |
| 94 | GET | /api/v1/emails/my-emails | No | False | False | EmailController |
| 95 | GET | /api/v1/emails/my-emails/{email-type} | No | False | False | EmailController |
| 96 | GET | /api/v1/emails/unread-count | No | False | False | EmailController |
| 97 | DELETE | /api/v1/emails/{email-id} | No | False | False | EmailController |
| 98 | PATCH | /api/v1/emails/{id}/read | No | False | False | EmailController |
| 99 | GET | /api/v1/enums/all | No | False | False | EnumController |
| 100 | GET | /api/v1/exchange-rates/{from}/{to} | No | False | False | ExchangeRateController |
| 101 | POST | /api/v1/favorites | No | False | False | FavoriteController |
| 102 | GET | /api/v1/favorites | No | False | False | FavoriteController |
| 103 | GET | /api/v1/favorites/check/{listing-id} | No | False | False | FavoriteController |
| 104 | GET | /api/v1/favorites/count/{listing-id} | No | False | False | FavoriteController |
| 105 | GET | /api/v1/favorites/ids | No | False | False | FavoriteController |
| 106 | POST | /api/v1/favorites/stats | No | False | False | FavoriteController |
| 107 | GET | /api/v1/favorites/stats/{listing-id} | No | False | False | FavoriteController |
| 108 | POST | /api/v1/favorites/toggle | No | False | False | FavoriteController |
| 109 | GET | /api/v1/favorites/top | No | False | False | FavoriteController |
| 110 | GET | /api/v1/favorites/top-listings | No | False | False | FavoriteController |
| 111 | DELETE | /api/v1/favorites/{listing-id} | No | False | False | FavoriteController |
| 112 | POST | /api/v1/favorite-lists | No | False | False | FavoriteListController |
| 113 | GET | /api/v1/favorite-lists/listing/{listing-id}/lists | No | False | False | FavoriteListController |
| 114 | GET | /api/v1/favorite-lists/my | No | False | False | FavoriteListController |
| 115 | GET | /api/v1/favorite-lists/popular | No | False | False | FavoriteListController |
| 116 | GET | /api/v1/favorite-lists/user/{user-id} | No | False | False | FavoriteListController |
| 117 | GET | /api/v1/favorite-lists/{list-id} | No | False | False | FavoriteListController |
| 118 | PUT | /api/v1/favorite-lists/{list-id} | No | False | False | FavoriteListController |
| 119 | DELETE | /api/v1/favorite-lists/{list-id} | No | False | False | FavoriteListController |
| 120 | POST | /api/v1/favorite-lists/{list-id}/items | No | False | False | FavoriteListController |
| 121 | DELETE | /api/v1/favorite-lists/{list-id}/items/{listing-id} | No | False | False | FavoriteListController |
| 122 | POST | /api/v1/favorite-lists/{list-id}/like | No | False | False | FavoriteListController |
| 123 | DELETE | /api/v1/favorite-lists/{list-id}/like | No | False | False | FavoriteListController |
| 124 | GET | /api/v1/forums/threads | No | False | True | ForumController |
| 125 | POST | /api/v1/forums/threads | No | True | False | ForumController |
| 126 | GET | /api/v1/forums/threads/{thread-id} | No | False | False | ForumController |
| 127 | PATCH | /api/v1/forums/threads/{thread-id} | No | False | False | ForumController |
| 128 | DELETE | /api/v1/forums/threads/{thread-id} | No | False | False | ForumController |
| 129 | GET | /api/v1/forums/threads/{thread-id}/comments | No | False | False | ForumController |
| 130 | POST | /api/v1/forums/threads/{thread-id}/comments | No | False | False | ForumController |
| 131 | POST | /api/v1/forums/threads/{thread-id}/comments/{comment-id}/reaction | No | False | False | ForumController |
| 132 | POST | /api/v1/forums/threads/{thread-id}/reaction | No | False | False | ForumController |
| 133 | PATCH | /api/v1/forums/threads/{thread-id}/status | No | False | False | ForumController |
| 134 | POST | /api/v1/ai/tests/ask | No | True | False | GeminiController |
| 135 | GET | /api/v1/ai/tests/gemini/hello | No | False | True | GeminiController |
| 136 | GET | /api/v1/ai/tests/quick | No | False | True | GeminiController |
| 137 | DELETE | /api/v1/images/delete | No | False | True | ImageController |
| 138 | POST | /api/v1/images/upload | No | False | True | ImageController |
| 139 | POST | /api/v1/listings/bulks | No | False | False | ListingController |
| 140 | GET | /api/v1/listings/fee-config | No | False | False | ListingController |
| 141 | POST | /api/v1/listings/filter | No | True | True | ListingController |
| 142 | GET | /api/v1/listings/my | No | False | True | ListingController |
| 143 | GET | /api/v1/listings/my/status/{status} | No | False | True | ListingController |
| 144 | GET | /api/v1/listings/my/view-stats | No | False | True | ListingController |
| 145 | POST | /api/v1/listings/pay-fee | No | False | False | ListingController |
| 146 | PUT | /api/v1/listings/price/batch | No | True | False | ListingController |
| 147 | PUT | /api/v1/listings/quantity/batch | No | True | False | ListingController |
| 148 | GET | /api/v1/listings/search | No | False | True | ListingController |
| 149 | GET | /api/v1/listings/search/listing-no/{no} | No | False | False | ListingController |
| 150 | GET | /api/v1/listings/statistics | No | False | False | ListingController |
| 151 | GET | /api/v1/listings/status/{status} | No | False | False | ListingController |
| 152 | GET | /api/v1/listings/{id} | No | False | False | ListingController |
| 153 | DELETE | /api/v1/listings/{id} | No | False | False | ListingController |
| 154 | PUT | /api/v1/listings/{id}/deactivate | No | False | False | ListingController |
| 155 | PUT | /api/v1/listings/{id}/mark-sold | No | False | False | ListingController |
| 156 | PUT | /api/v1/listings/{id}/price | No | True | False | ListingController |
| 157 | PUT | /api/v1/listings/{id}/publish | No | False | False | ListingController |
| 158 | PUT | /api/v1/listings/{id}/quantity | No | True | False | ListingController |
| 159 | PUT | /api/v1/listings/{id}/reactivate | No | False | False | ListingController |
| 160 | POST | /api/v1/listings/{id}/relist | No | False | False | ListingController |
| 161 | GET | /api/v1/listings/{listing-id}/review-stats | No | False | False | ListingController |
| 162 | GET | /api/v1/listings/{listing-id}/reviews | No | False | False | ListingController |
| 163 | POST | /api/v1/listings/{id}/view | No | False | False | ListingViewController |
| 164 | GET | /api/v1/listings/{id}/view-stats | No | False | False | ListingViewController |
| 165 | GET | /api/v1/catalog/locations/cities | No | False | False | LocationCatalogController |
| 166 | GET | /api/v1/catalog/locations/districts | No | False | True | LocationCatalogController |
| 167 | GET | /api/v1/catalog/locations/neighborhoods | No | False | True | LocationCatalogController |
| 168 | POST | /api/v1/memberships/cancel | No | False | False | MembershipController |
| 169 | GET | /api/v1/memberships/status | No | False | False | MembershipController |
| 170 | POST | /api/v1/memberships/upgrade | No | False | False | MembershipController |
| 171 | GET | /api/v1/notifications | No | False | False | NotificationController |
| 172 | PUT | /api/v1/notifications/read-all | No | False | False | NotificationController |
| 173 | GET | /api/v1/notifications/unread-count | No | False | False | NotificationController |
| 174 | PUT | /api/v1/notifications/{id}/read | No | False | False | NotificationController |
| 175 | POST | /api/v1/offers | No | False | False | OfferController |
| 176 | GET | /api/v1/offers/{offer-id} | No | False | False | OfferController |
| 177 | POST | /api/v1/offers/{offer-id}/accept | No | False | False | OfferController |
| 178 | POST | /api/v1/offers/{offer-id}/counter | No | False | False | OfferController |
| 179 | POST | /api/v1/offers/{offer-id}/reject | No | False | False | OfferController |
| 180 | GET | /api/v1/orders | No | False | False | OrderController |
| 181 | POST | /api/v1/orders/checkout | No | False | False | OrderController |
| 182 | GET | /api/v1/orders/items/{order-item-id}/review | Yes | False | False | OrderController |
| 183 | GET | /api/v1/orders/pending-completion | No | False | False | OrderController |
| 184 | GET | /api/v1/orders/seller | No | False | False | OrderController |
| 185 | GET | /api/v1/orders/seller/pending-escrow-amount | No | False | False | OrderController |
| 186 | GET | /api/v1/orders/seller/{order-id} | No | False | False | OrderController |
| 187 | GET | /api/v1/orders/{order-id} | No | False | False | OrderController |
| 188 | PUT | /api/v1/orders/{order-id}/address | No | False | False | OrderController |
| 189 | PUT | /api/v1/orders/{order-id}/cancel | No | False | False | OrderController |
| 190 | PUT | /api/v1/orders/{order-id}/complete | No | False | False | OrderController |
| 191 | PUT | /api/v1/orders/{order-id}/name | No | False | False | OrderController |
| 192 | PUT | /api/v1/orders/{order-id}/notes | No | False | False | OrderController |
| 193 | POST | /api/v1/orders/{order-id}/refund | No | False | False | OrderController |
| 194 | PUT | /api/v1/orders/{order-id}/ship | No | False | False | OrderController |
| 195 | POST | /api/v1/orders/{order-number}/confirm-handover-completion | No | False | False | OrderController |
| 196 | GET | /api/v1/orders/{order-number}/qr-code | No | False | False | OrderController |
| 197 | POST | /api/v1/orders/{order-number}/regenerate-meetup-code | No | False | False | OrderController |
| 198 | POST | /api/v1/orders/{order-number}/verify-meetup | No | False | False | OrderController |
| 199 | PUT | /api/v1/auth/passwords/change | No | True | False | PasswordController |
| 200 | POST | /api/v1/auth/passwords/forgot | No | False | False | PasswordController |
| 201 | POST | /api/v1/auth/passwords/reset | No | False | False | PasswordController |
| 202 | POST | /api/v1/payments/initiate-verification | Yes | False | False | PaymentController |
| 203 | GET | /api/v1/payments/my | Yes | False | False | PaymentController |
| 204 | POST | /api/v1/payments/pay | Yes | False | False | PaymentController |
| 205 | GET | /api/v1/payments/statistics | Yes | False | False | PaymentController |
| 206 | GET | /api/v1/price-history/listing/{listing-id} | No | False | False | PriceHistoryController |
| 207 | GET | /api/v1/price-history/listing/{listing-id}/exists | No | False | False | PriceHistoryController |
| 208 | GET | /api/v1/price-history/listing/{listing-id}/latest | No | False | False | PriceHistoryController |
| 209 | GET | /api/v1/campaigns/active | No | False | True | PublicCampaignController |
| 210 | GET | /api/v1/test/rate-limits/auth | No | False | False | RateLimitTestController |
| 211 | POST | /api/v1/test/rate-limits/auth/burst | No | False | False | RateLimitTestController |
| 212 | GET | /api/v1/test/rate-limits/general | No | False | False | RateLimitTestController |
| 213 | GET | /api/v1/test/rate-limits/payment | No | False | False | RateLimitTestController |
| 214 | POST | /api/v1/test/rate-limits/payment/burst | No | False | False | RateLimitTestController |
| 215 | GET | /api/v1/catalog/real-estate/specs/room-configs | No | False | False | RealEstateCatalogController |
| 216 | GET | /api/v1/catalog/real-estate/specs/zoning-statuses | No | False | False | RealEstateCatalogController |
| 217 | POST | /api/v1/real-estates/create-listing | No | False | False | RealEstateController |
| 218 | POST | /api/v1/real-estates/filter | No | False | False | RealEstateController |
| 219 | PUT | /api/v1/real-estates/{id} | No | False | False | RealEstateController |
| 220 | GET | /api/v1/real-estates/{id} | No | False | False | RealEstateController |
| 221 | POST | /api/v1/reviews | No | True | False | ReviewController |
| 222 | GET | /api/v1/reviews | No | False | True | ReviewController |
| 223 | GET | /api/v1/follows/check/{user-id} | No | False | False | SellerFollowController |
| 224 | GET | /api/v1/follows/followers | No | False | True | SellerFollowController |
| 225 | GET | /api/v1/follows/following | No | False | True | SellerFollowController |
| 226 | GET | /api/v1/follows/stats/{user-id} | No | False | False | SellerFollowController |
| 227 | GET | /api/v1/follows/user/{user-id}/followers | No | False | False | SellerFollowController |
| 228 | GET | /api/v1/follows/user/{user-id}/following | No | False | False | SellerFollowController |
| 229 | POST | /api/v1/follows/{user-id} | No | False | False | SellerFollowController |
| 230 | DELETE | /api/v1/follows/{user-id} | No | False | False | SellerFollowController |
| 231 | PATCH | /api/v1/follows/{user-id}/notifications | No | False | False | SellerFollowController |
| 232 | POST | /api/v1/showcases | No | True | False | ShowcaseController |
| 233 | GET | /api/v1/showcases/active | No | False | True | ShowcaseController |
| 234 | POST | /api/v1/showcases/bulks | No | True | False | ShowcaseController |
| 235 | GET | /api/v1/showcases/my | No | False | False | ShowcaseController |
| 236 | GET | /api/v1/showcases/pricing-config | No | False | False | ShowcaseController |
| 237 | POST | /api/v1/showcases/{id}/cancel | No | False | False | ShowcaseController |
| 238 | POST | /api/v1/showcases/{id}/extend | No | True | False | ShowcaseController |
| 239 | POST | /api/v1/sports/create-listing | No | False | False | SportsListingController |
| 240 | POST | /api/v1/sports/filter | No | False | False | SportsListingController |
| 241 | PUT | /api/v1/sports/{id} | No | False | False | SportsListingController |
| 242 | GET | /api/v1/sports/{id} | No | False | False | SportsListingController |
| 243 | GET | /api/v1/user/badges | No | False | False | UserBadgesController |
| 244 | GET | /api/v1/users/audit-logs | No | False | False | UserController |
| 245 | PUT | /api/v1/users/email | No | True | False | UserController |
| 246 | GET | /api/v1/users/great-sellers | No | False | False | UserController |
| 247 | GET | /api/v1/users/me | No | False | False | UserController |
| 248 | GET | /api/v1/users/me/complaints | No | False | False | UserController |
| 249 | GET | /api/v1/users/me/complaints/received | No | False | False | UserController |
| 250 | GET | /api/v1/users/me/offers/made | No | False | False | UserController |
| 251 | GET | /api/v1/users/me/offers/received | No | False | False | UserController |
| 252 | GET | /api/v1/users/me/reviews/received | No | False | False | UserController |
| 253 | PUT | /api/v1/users/phone | No | True | False | UserController |
| 254 | GET | /api/v1/users/search | No | False | True | UserController |
| 255 | POST | /api/v1/users/verification/send | No | False | False | UserController |
| 256 | POST | /api/v1/users/verification/verify | No | True | False | UserController |
| 257 | GET | /api/v1/users/{id} | Yes | False | False | UserController |
| 258 | GET | /api/v1/users/{user-id}/great-seller-status | No | False | False | UserController |
| 259 | GET | /api/v1/users/{user-id}/listings | No | False | False | UserController |
| 260 | GET | /api/v1/users/{user-id}/review-stats | No | False | False | UserController |
| 261 | GET | /api/v1/users/{user-id}/reviews/received | No | False | False | UserController |
| 262 | GET | /api/v1/users/{user-id}/reviews/written | No | False | False | UserController |
| 263 | GET | /api/v1/vehicles/brand/{brand-id}/model/{model-id} | No | False | False | VehicleListingController |
| 264 | POST | /api/v1/vehicles/create-listing | No | False | False | VehicleListingController |
| 265 | POST | /api/v1/vehicles/filter | No | False | False | VehicleListingController |
| 266 | PUT | /api/v1/vehicles/{id} | No | False | False | VehicleListingController |
| 267 | GET | /api/v1/vehicles/{id} | No | False | False | VehicleListingController |