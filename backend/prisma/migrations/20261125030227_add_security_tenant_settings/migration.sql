-- CreateTable
CREATE TABLE "SecurityConfig" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "mfaPolicy" TEXT NOT NULL DEFAULT 'required',
    "backchannelLogout" BOOLEAN NOT NULL DEFAULT true,
    "socialConnections" JSONB NOT NULL DEFAULT '[]',
    "mfaFactors" JSONB NOT NULL DEFAULT '[]',
    "threats" JSONB NOT NULL DEFAULT '[]',
    "dbConnections" JSONB NOT NULL DEFAULT '[]',
    "passwordlessRoutes" JSONB NOT NULL DEFAULT '[]',
    "enterpriseSso" JSONB NOT NULL DEFAULT '[]',
    "dnsVerifications" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SecurityConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TenantSettings" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "customDomain" TEXT,
    "sslActive" BOOLEAN NOT NULL DEFAULT true,
    "sslExpiresOn" TIMESTAMP(3),
    "accessTokenTtl" INTEGER NOT NULL DEFAULT 60,
    "idleTimeout" INTEGER NOT NULL DEFAULT 15,
    "maxConcurrency" INTEGER NOT NULL DEFAULT 3,
    "backchannelLogout" BOOLEAN NOT NULL DEFAULT true,
    "emailProvider" TEXT NOT NULL DEFAULT 'resend',
    "senderEmail" TEXT NOT NULL DEFAULT 'security@acme.com',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TenantSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SecurityConfig_organizationId_key" ON "SecurityConfig"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "TenantSettings_organizationId_key" ON "TenantSettings"("organizationId");

-- AddForeignKey
ALTER TABLE "SecurityConfig" ADD CONSTRAINT "SecurityConfig_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantSettings" ADD CONSTRAINT "TenantSettings_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
