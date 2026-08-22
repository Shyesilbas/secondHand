-- KEYS[1]: stock key (e.g. stock:{listingId})
-- ARGV[1]: restored quantity (e.g. 1)

local stockKey = KEYS[1]
local restoreQty = tonumber(ARGV[1])

if redis.call('EXISTS', stockKey) == 1 then
    local newTotal = redis.call('INCRBY', stockKey, restoreQty)
    return newTotal
else
    redis.call('SET', stockKey, restoreQty)
    return restoreQty
end
