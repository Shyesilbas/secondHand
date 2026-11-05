-- Fixed-window request counter shared by all instances.
-- KEYS[1]: counter key for one client, category and window
-- ARGV[1]: window length in milliseconds
-- Returns the request count in this window, including this request.
local count = redis.call('INCR', KEYS[1])
if count == 1 then
    redis.call('PEXPIRE', KEYS[1], ARGV[1])
end
return count
