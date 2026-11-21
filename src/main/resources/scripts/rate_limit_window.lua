-- Fixed-window counter shared by all instances, incremented and expired in one atomic step.
-- KEYS[1]: counter key
-- ARGV[1]: window length in milliseconds
-- Returns the count in this window, including this call.
-- The expiry is set whenever the key has none (PTTL < 0), not only on the first hit, so a counter that
-- lost its TTL heals on the next call instead of blocking its owner forever.
local count = redis.call('INCR', KEYS[1])
if redis.call('PTTL', KEYS[1]) < 0 then
    redis.call('PEXPIRE', KEYS[1], ARGV[1])
end
return count
