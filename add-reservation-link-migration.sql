-- Add reservation_link column (separate from delivery_links - reservations are not delivery)
ALTER TABLE restaurants 
ADD COLUMN IF NOT EXISTS reservation_link VARCHAR(500);

COMMENT ON COLUMN restaurants.reservation_link IS 'URL to book a reservation (OpenTable, Resy, etc.) - separate from delivery/ordering links';
