-- Migration script to add new booking fields
-- This script adds: calosc (total amount), ilosc_osob (number of people), pozostalo_do_zaplaty (remaining to pay)

-- Add columns to public.apart1 table
ALTER TABLE public.apart1
ADD COLUMN calosc DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN ilosc_osob INTEGER DEFAULT 1,
ADD COLUMN pozostalo_do_zaplaty DECIMAL(10, 2) DEFAULT 0;

-- Add columns to public.apart2 table
ALTER TABLE public.apart2
ADD COLUMN calosc DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN ilosc_osob INTEGER DEFAULT 1,
ADD COLUMN pozostalo_do_zaplaty DECIMAL(10, 2) DEFAULT 0;

-- Optional: Add columns to public.apart_jacuuzi if needed
ALTER TABLE public.apart_jacuuzi
ADD COLUMN calosc DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN ilosc_osob INTEGER DEFAULT 1,
ADD COLUMN pozostalo_do_zaplaty DECIMAL(10, 2) DEFAULT 0;

-- Create a function to automatically calculate pozostalo_do_zaplaty
CREATE OR REPLACE FUNCTION calculate_remaining_payment()
RETURNS TRIGGER AS $$
BEGIN
  NEW.pozostalo_do_zaplaty := NEW.calosc - COALESCE(NEW.amount_advance_payment, 0);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic calculation on apart1
DROP TRIGGER IF EXISTS calculate_remaining_payment_ap1 ON public.apart1;
CREATE TRIGGER calculate_remaining_payment_ap1
BEFORE INSERT OR UPDATE ON public.apart1
FOR EACH ROW
EXECUTE FUNCTION calculate_remaining_payment();

-- Create triggers for automatic calculation on apart2
DROP TRIGGER IF EXISTS calculate_remaining_payment_ap2 ON public.apart2;
CREATE TRIGGER calculate_remaining_payment_ap2
BEFORE INSERT OR UPDATE ON public.apart2
FOR EACH ROW
EXECUTE FUNCTION calculate_remaining_payment();

-- Create triggers for automatic calculation on apart_jacuuzi
DROP TRIGGER IF EXISTS calculate_remaining_payment_jacuzzi ON public.apart_jacuuzi;
CREATE TRIGGER calculate_remaining_payment_jacuzzi
BEFORE INSERT OR UPDATE ON public.apart_jacuuzi
FOR EACH ROW
EXECUTE FUNCTION calculate_remaining_payment();

COMMIT;
