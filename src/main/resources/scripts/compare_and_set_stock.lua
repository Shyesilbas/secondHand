-- KEYS[1]: stock key (e.g. stock:{listingId})
-- ARGV[1]: stock value the caller observed
-- ARGV[2]: corrected stock value
-- Writes ARGV[2] only if the key still holds ARGV[1]. Any reservation, cancellation or
-- release made after the observation changes the value, so the correction is skipped
-- instead of overwriting that concurrent change. Returns 1 when written, 0 otherwise.

local current = redis.call('GET', KEYS[1])
if current == ARGV[1] then
    redis.call('SET', KEYS[1], ARGV[2])
    return 1
end
return 0
