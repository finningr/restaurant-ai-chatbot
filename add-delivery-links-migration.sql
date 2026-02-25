-- Add delivery_links column for DoorDash, Uber Eats, Grubhub, and custom platforms
-- Structure: { "doordash": "url", "uber_eats": "url", "grubhub": "url", "custom": [{ "name": "Toast", "url": "..." }] }
ALTER TABLE restaurants 
ADD COLUMN IF NOT EXISTS delivery_links JSONB DEFAULT '{}';

COMMENT ON COLUMN restaurants.delivery_links IS 'Delivery/ordering platform URLs: preset keys (doordash, uber_eats, grubhub) and custom array with {name, url}';
