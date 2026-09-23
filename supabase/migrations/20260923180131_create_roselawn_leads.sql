/*
# Create Roselawn Builders lead capture table

1. New Tables
- `contractor_leads`
- `id` (uuid, primary key) — unique request identifier.
- `name` (text) — visitor name.
- `email` (text) — visitor email address.
- `phone` (text) — visitor phone number.
- `service` (text) — project type selected by the visitor.
- `message` (text) — project notes supplied by the visitor.
- `created_at` (timestamptz) — time the request was received.

2. Security
- Row-level security is enabled.
- Anonymous and authenticated visitors may submit a new lead.
- Leads cannot be read, edited, or deleted through the public website client.

3. Important Notes
- This is a single-business intake table and does not require visitor accounts.
- The public website only needs insert access; later administrative tooling can use a protected server-side role.
*/

CREATE TABLE IF NOT EXISTS public.contractor_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  service text NOT NULL,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.contractor_leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can submit contractor leads" ON public.contractor_leads;
CREATE POLICY "Public can submit contractor leads"
ON public.contractor_leads
FOR INSERT
TO anon, authenticated
WITH CHECK (
  length(trim(name)) BETWEEN 2 AND 120
  AND length(trim(email)) BETWEEN 5 AND 254
  AND length(trim(phone)) BETWEEN 7 AND 40
  AND length(trim(service)) BETWEEN 2 AND 120
  AND length(trim(message)) BETWEEN 10 AND 2000
);

DROP POLICY IF EXISTS "Public cannot read contractor leads" ON public.contractor_leads;
CREATE POLICY "Public cannot read contractor leads"
ON public.contractor_leads
FOR SELECT
TO anon, authenticated
USING (false);

DROP POLICY IF EXISTS "Public cannot update contractor leads" ON public.contractor_leads;
CREATE POLICY "Public cannot update contractor leads"
ON public.contractor_leads
FOR UPDATE
TO anon, authenticated
USING (false)
WITH CHECK (false);

DROP POLICY IF EXISTS "Public cannot delete contractor leads" ON public.contractor_leads;
CREATE POLICY "Public cannot delete contractor leads"
ON public.contractor_leads
FOR DELETE
TO anon, authenticated
USING (false);
