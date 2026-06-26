import re

file_path = 'secondhand-frontend/src/common/constants/apiEndpoints.js'
with open(file_path, 'r') as f:
    content = f.read()

# Replace missing /v1/ or incorrect singulars:
replacements = {
    "'/auth/": "'/v1/auth/",
    "'/chat/": "'/v1/chats/",
    "`/chat/": "`/v1/chats/",
    "'/agreements": "'/v1/agreements",
    "`/agreements": "`/v1/agreements",
    "'/ewallet": "'/v1/e-wallets",
    "`/ewallet": "`/v1/e-wallets",
    "'/favorites": "'/v1/favorites",
    "`/favorites": "`/v1/favorites",
    "'/showcases": "'/v1/showcases",
    "`/showcases": "`/v1/showcases",
    "'/follow/": "'/v1/follows/",
    "`/follow/": "`/v1/follows/",
    "'/favorite-lists": "'/v1/favorite-lists",
    "`/favorite-lists": "`/v1/favorite-lists",
    "'/addresses": "'/v1/users/addresses",
    "`/addresses": "`/v1/users/addresses",
    "'/admin/audit-logs": "'/v1/admin/audit-logs",
    "`/admin/audit-logs": "`/v1/admin/audit-logs",
    "'/audit/enums": "'/v1/audit/enums",
    "'/catalog/locations": "'/v1/catalog/locations",
    "`/catalog/locations": "`/v1/catalog/locations",
    "'/images/": "'/v1/images/",
    "`/images/": "`/v1/images/",

    # Specific path fixes:
    "'/v1/listings/allListings'": "'/v1/listings/search'", 
    "'/v1/listings/my-listings'": "'/v1/listings/my'",
    "'/v1/listings/bulk'": "'/v1/listings/bulks'",
    "'/v1/listings/my-listings/view-stats'": "'/v1/listings/my/view-stats'",
    "'/v1/payments/my-payments'": "'/v1/payments/my'",
    "'/v1/dashboard/seller'": "'/v1/dashboards/seller'",
    "'/v1/dashboard/buyer'": "'/v1/dashboards/buyer'",
    "'/v1/membership/": "'/v1/memberships/",
    "'/v1/forum/": "'/v1/forums/",
    "`/v1/forum/": "`/v1/forums/",
    "'/v1/exchange/": "'/v1/exchange-rates/",
    "`/v1/exchange/": "`/v1/exchange-rates/",
    "'/v1/e-wallets/update/spendingWarning'": "'/v1/e-wallets/update/spending-warning'"
}

for old, new in replacements.items():
    content = content.replace(old, new)

with open(file_path, 'w') as f:
    f.write(content)
