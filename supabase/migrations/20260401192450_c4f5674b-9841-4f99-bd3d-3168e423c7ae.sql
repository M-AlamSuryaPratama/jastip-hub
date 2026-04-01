
-- Create a bot-friendly insert function that accepts lowercase status/expedition values
CREATE OR REPLACE FUNCTION public.insert_package_from_bot(
  p_customer_name text,
  p_tracking_number text,
  p_fee_jastip numeric DEFAULT 0,
  p_status text DEFAULT 'pending',
  p_expedition_type text DEFAULT 'J&T',
  p_notes text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_status package_status;
  v_expedition expedition_type;
  v_id uuid;
BEGIN
  v_status := CASE lower(p_status)
    WHEN 'pending' THEN 'Pending'::package_status
    WHEN 'picked up' THEN 'Picked Up'::package_status
    WHEN 'picked_up' THEN 'Picked Up'::package_status
    WHEN 'done' THEN 'Done'::package_status
    ELSE 'Pending'::package_status
  END;

  v_expedition := CASE lower(p_expedition_type)
    WHEN 'j&t' THEN 'J&T'::expedition_type
    WHEN 'jnt' THEN 'J&T'::expedition_type
    WHEN 'jne' THEN 'JNE'::expedition_type
    WHEN 'spx' THEN 'SPX'::expedition_type
    WHEN 'sicepat' THEN 'Sicepat'::expedition_type
    WHEN 'makanan' THEN 'Makanan'::expedition_type
    ELSE 'Lainnya'::expedition_type
  END;

  INSERT INTO public.packages (customer_name, tracking_number, fee_jastip, status, expedition_type, notes)
  VALUES (p_customer_name, p_tracking_number, p_fee_jastip, v_status, v_expedition, p_notes)
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

-- Enable realtime for packages table
ALTER PUBLICATION supabase_realtime ADD TABLE public.packages;
