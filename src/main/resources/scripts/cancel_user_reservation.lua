-- KEYS[1]: stock key (e.g. stock:{listingId})
-- KEYS[2]: reservation key (e.g. reservation:{userId}:{listingId})
-- Returns 1 when a reservation was removed, 0 when none was found.
-- When the stock key is missing it is not recreated from the reserved quantity;
-- the next reservation initializes it from the PostgreSQL available quantity.

local stockKey = KEYS[1]
local reservationKey = KEYS[2]

local reservedQty = redis.call('GET', reservationKey)

if reservedQty then
    local restoreQty = tonumber(reservedQty)
    if restoreQty and restoreQty > 0 and redis.call('EXISTS', stockKey) == 1 then
        redis.call('INCRBY', stockKey, restoreQty)
    end
    redis.call('DEL', reservationKey)
    return 1
else
    return 0 -- No reservation found or already expired
end
