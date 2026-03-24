
CREATE TYPE public.expedition_type AS ENUM ('J&T', 'JNE', 'SPX', 'Sicepat', 'Makanan', 'Lainnya');
CREATE TYPE public.package_status AS ENUM ('Pending', 'Picked Up', 'Done');

CREATE TABLE public.packages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  customer_name TEXT NOT NULL,
  expedition_type public.expedition_type NOT NULL,
  tracking_number TEXT NOT NULL,
  fee_jastip NUMERIC NOT NULL DEFAULT 0,
  status public.package_status NOT NULL DEFAULT 'Pending',
  notes TEXT
);

ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to packages" ON public.packages FOR ALL USING (true) WITH CHECK (true);
