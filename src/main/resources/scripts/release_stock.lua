-- KEYS[1]: stock key (e.g. stock:{listingId})
-- ARGV[1]: restored quantity (e.g. 1)
-- Returns the new stock, or -1 when the stock key does not exist.
-- A missing key is never created here: its true value is unknown to this script.
-- The next reservation initializes it from the PostgreSQL available quantity.

local stockKey = KEYS[1]
local restoreQty = tonumber(ARGV[1])

if redis.call('EXISTS', stockKey) == 1 then
    return redis.call('INCRBY', stockKey, restoreQty)
end
return -1
