ALTER TABLE listings
    ALTER COLUMN price TYPE NUMERIC(15, 2);

ALTER TABLE price_history
    ALTER COLUMN old_price TYPE NUMERIC(15, 2),
    ALTER COLUMN new_price TYPE NUMERIC(15, 2),
    ALTER COLUMN percentage_change TYPE NUMERIC(10, 2);

