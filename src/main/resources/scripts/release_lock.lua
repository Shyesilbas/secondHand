-- Releases a lock only if the caller still owns it.
-- KEYS[1]: lock key
-- ARGV[1]: owner token written when the lock was taken
-- Returns 1 when the lock was released, 0 when it had expired or belongs to someone else.
if redis.call('GET', KEYS[1]) == ARGV[1] then
    return redis.call('DEL', KEYS[1])
end
return 0
