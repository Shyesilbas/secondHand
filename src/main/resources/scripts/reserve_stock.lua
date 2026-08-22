-- KEYS[1]: stock key (e.g. stock:{listingId})
-- ARGV[1]: requested quantity (e.g. 1)
-- ARGV[2]: default stock to initialize if key does not exist (e.g. 1)

local stockKey = KEYS[1]
local requestedQty = tonumber(ARGV[1])
local defaultStock = tonumber(ARGV[2])

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
    return remaining
else
    return -1 -- Insufficient stock
end
