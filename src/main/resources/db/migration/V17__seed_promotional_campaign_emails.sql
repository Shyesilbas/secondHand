-- V17: Seed promotional campaign emails for all existing users
INSERT INTO emails (id, user_id, recipient_email, sender_email, subject, content, email_type, created_at)
SELECT 
    gen_random_uuid(), 
    id, 
    email, 
    'secondhand@noreply.com', 
    'Showcase Kampanyası: İlanlarınızı Öne Çıkarın!', 
    '4 ve daha fazla ilanınızı showcase''e ekleyin % 10 indirim kazanın.', 
    'PROMOTIONAL', 
    now()
FROM users;

INSERT INTO emails (id, user_id, recipient_email, sender_email, subject, content, email_type, created_at)
SELECT 
    gen_random_uuid(), 
    id, 
    email, 
    'secondhand@noreply.com', 
    'SAVE200: Alışverişlerinizde Dev İndirim Fırsatı!', 
    '2000 TL alışverişe 200 TL indirim kazanın!

Kategori fark etmeksizin, en az 2000 TL''lik alışveriş yapın, 200 TL indirim kazanın. 1 kullanıcı en fazla 1 kez faydalanabilir. 1000 adet ile sınırlıdır.', 
    'PROMOTIONAL', 
    now()
FROM users;
