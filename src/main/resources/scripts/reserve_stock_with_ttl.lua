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

-- Check if user already holds an active reservation for this listing
local existingReservation = redis.call('GET', reservationKey)
if existingReservation then
    -- User already reserved this, refresh TTL and return current stock
    redis.call('EXPIRE', reservationKey, ttlSeconds)
    local currentStock = redis.call('GET', stockKey)
    return tonumber(currentStock) or 0
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

if currentStock >= requestedQty then
    local remaining = redis.call('DECRBY', stockKey, requestedQty)
    -- Record user reservation with TTL
    redis.call('SET', reservationKey, requestedQty, 'EX', ttlSeconds)
    -- Also keep stockKey alive for the duration of active reservations
    redis.call('EXPIRE', stockKey, ttlSeconds)
    return remaining
else
    return -1 -- Insufficient stock
end
