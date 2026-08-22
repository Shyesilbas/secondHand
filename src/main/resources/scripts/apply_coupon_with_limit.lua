-- KEYS[1]: global usage key (e.g. coupon:usage:global:{code})
-- KEYS[2]: user usage key (e.g. coupon:usage:user:{code}:{userId})
-- ARGV[1]: global usage limit (-1 if unlimited)
-- ARGV[2]: user usage limit (-1 if unlimited)
-- ARGV[3]: TTL in seconds (e.g. coupon validity duration)

local globalKey = KEYS[1]
local userKey = KEYS[2]
local globalLimit = tonumber(ARGV[1])
local userLimit = tonumber(ARGV[2])
local ttlSeconds = tonumber(ARGV[3])

-- 1. Check user limit if configured
if userLimit ~= nil and userLimit > 0 then
    local currentUserUsage = tonumber(redis.call('GET', userKey) or '0')
    if currentUserUsage >= userLimit then
        return -2 -- User usage limit exceeded
    end
end

-- 2. Check global limit if configured
if globalLimit ~= nil and globalLimit > 0 then
    local currentGlobalUsage = tonumber(redis.call('GET', globalKey) or '0')
    if currentGlobalUsage >= globalLimit then
        return -1 -- Global usage limit exceeded
    end
end

-- 3. Atomically increment usage counts
local newGlobal = redis.call('INCR', globalKey)
if ttlSeconds ~= nil and ttlSeconds > 0 then
    redis.call('EXPIRE', globalKey, ttlSeconds)
end

local newUser = redis.call('INCR', userKey)
if ttlSeconds ~= nil and ttlSeconds > 0 then
    redis.call('EXPIRE', userKey, ttlSeconds)
end

return newGlobal
