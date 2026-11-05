-- Refresh tokens are now stored as the hex SHA-256 of the token (TokenService.hash), so a leaked
-- tokens table cannot be replayed. Existing rows are hashed the same way; sessions keep working.
UPDATE tokens
SET token_value = encode(sha256(convert_to(token_value, 'UTF8')), 'hex')
WHERE token_value !~ '^[0-9a-f]{64}$';
