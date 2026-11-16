-- GV-29: "delete conversation" hides the room for one participant instead of deleting the room and every
-- message for both sides (which also erased complaint evidence).
CREATE TABLE IF NOT EXISTS chat_room_hides (
    id BIGSERIAL PRIMARY KEY,
    chat_room_id BIGINT NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    hidden_at TIMESTAMP NOT NULL,
    CONSTRAINT uq_chat_room_hides_room_user UNIQUE (chat_room_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_chat_room_hides_user ON chat_room_hides (user_id);
