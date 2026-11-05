-- Gives back one usage taken by apply_coupon_with_limit.lua when the redemption does not commit.
-- KEYS[1]: global usage key
-- KEYS[2]: user usage key
-- Counters never go below zero (a key may have expired or been flushed since it was incremented).

for _, key in ipairs(KEYS) do
    local current = tonumber(redis.call('GET', key) or '0')
    if current > 0 then
        redis.call('DECR', key)
    end
end
return 1
