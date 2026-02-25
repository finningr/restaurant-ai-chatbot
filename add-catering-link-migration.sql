-- Add catering_link column (for catering inquiry form / booking URL)
ALTER TABLE restaurants 
ADD COLUMN IF NOT EXISTS catering_link VARCHAR(500);

COMMENT ON COLUMN restaurants.catering_link IS 'URL for catering inquiries or orders - shown when Catering is in special_services';
