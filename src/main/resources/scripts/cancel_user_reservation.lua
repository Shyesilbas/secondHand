-- KEYS[1]: stock key (e.g. stock:{listingId})
-- KEYS[2]: reservation key (e.g. reservation:{userId}:{listingId})

local stockKey = KEYS[1]
local reservationKey = KEYS[2]

local reservedQty = redis.call('GET', reservationKey)

if reservedQty then
    local restoreQty = tonumber(reservedQty)
    if restoreQty and restoreQty > 0 then
        if redis.call('EXISTS', stockKey) == 1 then
            redis.call('INCRBY', stockKey, restoreQty)
        else
            redis.call('SET', stockKey, restoreQty)
        end
    end
    redis.call('DEL', reservationKey)
    return 1
else
    return 0 -- No reservation found or already expired
end
