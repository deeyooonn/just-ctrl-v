-- Prisma connects as the existing PostgreSQL owner; browser API roles do not.
-- Keep the owner path unchanged while protecting account/session/password data.
ALTER TABLE public."Account" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Session" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."VerificationToken" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Conversion" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Folder" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public."Account", public."Session", public."VerificationToken",
  public."User", public."Conversion", public."Folder" FROM anon, authenticated;
