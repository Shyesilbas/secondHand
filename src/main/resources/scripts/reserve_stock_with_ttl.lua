-- KEYS[1]: stock key (e.g. stock:{listingId})
-- KEYS[2]: reservation key (e.g. reservation:{userId}:{listingId})
-- ARGV[1]: requested quantity (e.g. 1)
-- ARGV[2]: default stock to initialize if key does not exist (e.g. 1)
-- ARGV[3]: TTL in seconds for reservation (e.g. 900 -> 15 minutes)

local stockKey = KEYS[1]
local reservationKey = KEYS[2]
local requestedQty = tonumber(ARGV[1])
local defaultStock = tonumber(ARGV[2])
local ttlSeconds = tonumber(ARGV[3])

-- Existing reservation: only the increase over what the user already holds is taken from stock
local held = tonumber(redis.call('GET', reservationKey)) or 0
local delta = requestedQty - held
if held > 0 and delta <= 0 then
    return tonumber(redis.call('GET', stockKey)) or 0
end

local currentStock = redis.call('GET', stockKey)

if not currentStock then
    if defaultStock ~= nil and defaultStock > 0 then
        currentStock = defaultStock
        redis.call('SET', stockKey, currentStock)
    else
        return -1 -- Stock key does not exist and no valid default
    end
else
    currentStock = tonumber(currentStock)
end

if currentStock >= delta then
    local remaining = redis.call('DECRBY', stockKey, delta)
    -- Record user reservation with TTL
    redis.call('SET', reservationKey, requestedQty, 'EX', ttlSeconds)
    return remaining
else
    return -1 -- Insufficient stock
end
