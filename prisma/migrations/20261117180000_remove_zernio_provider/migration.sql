-- This installation has no Zernio accounts or connections. Remove the unused
-- alternate-provider storage and keep Instagram connections direct to Meta.
DROP TABLE "ZernioConnection";
ALTER TABLE "InstagramAccount"
  DROP COLUMN "zernioAccountId",
  DROP COLUMN "provider";
DROP TYPE "InstagramProvider";
