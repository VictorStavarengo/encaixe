import Link from "next/link";
import { Suspense } from "react";
import { BusinessForm } from "@/components/business-form";
import { CopyLink } from "@/components/copy-link";
import { Card, PageTitle } from "@/components/ui";
import { requireBusiness } from "@/lib/business";
import { appUrl } from "@/lib/email";

export default function PublicPageSettings() {
  return (
    <Suspense fallback={<SettingsSkeleton />}>
      <SettingsContent />
    </Suspense>
  );
}

async function SettingsContent() {
  const business = await requireBusiness();
  const publicUrl = `${appUrl()}/b/${business.slug}`;

  return (
    <div className="space-y-6">
      <PageTitle
        eyebrow="página pública"
        title="Como seus clientes te encontram"
        description="Esses dados aparecem no link que você compartilha no Instagram, no WhatsApp e na bio."
        actions={
          <Link
            href={`/b/${business.slug}`}
            target="_blank"
            className="text-sm font-medium text-navy hover:underline"
          >
            Abrir página ↗
          </Link>
        }
      />

      <Card className="flex flex-wrap items-center justify-between gap-4 bg-paper-deep/60">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted">
            link público
          </p>
          <p className="mt-1 truncate font-mono text-sm">{publicUrl}</p>
        </div>
        <CopyLink url={publicUrl} />
      </Card>

      <Card>
        <h2 className="mb-4 text-sm font-semibold">Dados do negócio</h2>
        <BusinessForm
          business={{
            name: business.name,
            slug: business.slug,
            phone: business.phone,
            address: business.address,
            timezone: business.timezone,
          }}
        />
      </Card>
    </div>
  );
}

function SettingsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-1/2 animate-pulse rounded-lg bg-paper-deep" />
      <div className="h-24 animate-pulse rounded-2xl bg-paper-deep" />
      <div className="h-72 animate-pulse rounded-2xl bg-paper-deep" />
    </div>
  );
}
