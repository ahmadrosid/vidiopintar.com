import { ChangelogList } from "@/components/changelog/changelog-list"
import MainLayout from "@/components/layouts/main-layout"
import { changelogs } from "@/lib/data/changelogs"

export default function ChangelogsPage() {
  return (
    <MainLayout cta={false}>
      <main className="relative min-h-screen p-6 overflow-hidden">
        <div className="relative z-10 max-w-5xl px-6 flex justify-start mx-auto pt-20">
          <div className="mb-12">
            <h1 className="text-4xl font-bold tracking-tighter mb-4">Changelogs</h1>
            <p className="text-muted-foreground mb-8">
              Stay up to date with the latest features and improvements in Vidiopintar.
            </p>
            <ChangelogList changelogs={changelogs} />
          </div>
        </div>
      </main>
    </MainLayout>
  )
}
