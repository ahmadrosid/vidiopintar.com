import { ChangelogList } from "@/components/changelog/changelog-list"
import MainLayout from "@/components/layouts/main-layout"
import { changelogs } from "@/lib/data/changelogs"
import { buildPageMetadata } from "@/lib/geo/metadata"
import { SITE_LAST_MODIFIED, SITE_URL } from "@/lib/geo/site"

export const metadata = buildPageMetadata({
  title: "Changelogs",
  description:
    "Latest Vidiopintar features, improvements, and fixes for AI YouTube summaries and learning tools.",
  path: "/changelogs",
  modifiedTime: changelogs[0]?.date
    ? new Date(changelogs[0].date).toISOString()
    : SITE_LAST_MODIFIED.toISOString(),
})

const webPageSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Changelogs",
  url: `${SITE_URL}/changelogs`,
  dateModified: changelogs[0]?.date || SITE_LAST_MODIFIED.toISOString(),
}

export default function ChangelogsPage() {
  return (
    <MainLayout cta={false}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
      />
      <main className="relative min-h-screen p-6 overflow-hidden">
        <div className="relative z-10 max-w-5xl px-6 flex justify-start mx-auto pt-20">
          <div className="mb-12">
            <h1 className="text-4xl font-bold tracking-tighter mb-4">Changelogs</h1>
            <p className="text-muted-foreground mb-4 max-w-2xl">
              Stay up to date with the latest features and improvements in
              Vidiopintar. This page lists product releases for summarization,
              chat, library, billing, and dashboard workflows so you can see what
              changed and when.
            </p>
            <p className="text-muted-foreground mb-8 text-sm">
              Last updated:{" "}
              <time dateTime={changelogs[0]?.date || SITE_LAST_MODIFIED.toISOString()}>
                {changelogs[0]?.date || SITE_LAST_MODIFIED.toISOString().slice(0, 10)}
              </time>
            </p>
            <ChangelogList changelogs={changelogs} />
          </div>
        </div>
      </main>
    </MainLayout>
  )
}
