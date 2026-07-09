import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getAllPosts } from '@/lib/blog';
import { Card } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { buildPageMetadata } from '@/lib/geo/metadata';
import { SITE_LAST_MODIFIED, SITE_URL } from '@/lib/geo/site';

export const metadata: Metadata = buildPageMetadata({
  title: 'Blog',
  description:
    'AI learning tips, YouTube productivity ideas, and Vidiopintar product updates from the team.',
  path: '/blog',
});

function CoverImage({ src, alt, className }: { src?: string; alt: string; className?: string }) {
  if (!src) {
    return (
      <div className={`flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5 ${className}`}>
        <span className="text-4xl">📝</span>
      </div>
    );
  }

  if (src.startsWith('http')) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={alt} className={`object-cover ${className}`} />
    );
  }

  return <Image src={src} alt={alt} fill className={`object-cover ${className}`} />;
}

export default function BlogPage() {
  const posts = getAllPosts();

  const featuredPost = posts.find((p) => p.featured) || posts[0];
  const otherPosts = posts.filter((p) => p.slug !== featuredPost?.slug);
  const latestModified =
    posts[0]?.updatedAt || posts[0]?.publishedAt || SITE_LAST_MODIFIED.toISOString();

  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Vidiopintar Blog',
    url: `${SITE_URL}/blog`,
    dateModified: latestModified,
    description:
      'Articles on AI learning, YouTube productivity, and Vidiopintar product updates.',
  };

  return (
    <div className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
      />
      <section className="border-b border-border bg-muted/30">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="max-w-6xl mx-auto">
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Blog</h1>
            <p className="text-muted-foreground mt-3 max-w-2xl">
              Practical writing on AI-assisted learning, summarizing YouTube content,
              and building better study workflows with Vidiopintar. Browse featured
              posts below or jump into the full archive.
            </p>
            <nav className="mt-4 flex flex-wrap gap-4 text-sm">
              <Link href="/faq" className="text-primary hover:underline">
                FAQ
              </Link>
              <Link href="/changelogs" className="text-primary hover:underline">
                Changelogs
              </Link>
              <Link href="/privacy" className="text-primary hover:underline">
                Privacy
              </Link>
              <a
                href="https://github.com/ahmadrosid/vidiopintar.com"
                className="text-primary hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub
              </a>
              <a
                href="https://platform.openai.com/docs"
                className="text-primary hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                OpenAI Docs
              </a>
            </nav>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {posts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground">No posts yet. Check back soon!</p>
            </div>
          ) : (
            <>
              {featuredPost && (
                <Link href={`/blog/${featuredPost.slug}`} className="group block mb-16">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                    <div className="relative aspect-[4/3] lg:aspect-[16/10] rounded-2xl overflow-hidden bg-muted">
                      <CoverImage
                        src={featuredPost.coverImage}
                        alt={featuredPost.title}
                        className="w-full h-full group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>

                    <div className="space-y-3">
                      <h2 className="text-2xl md:text-3xl font-bold leading-tight group-hover:text-primary transition-colors">
                        {featuredPost.title}
                      </h2>
                      <p className="text-muted-foreground leading-relaxed">
                        {featuredPost.description}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <time dateTime={featuredPost.publishedAt}>
                          {new Date(featuredPost.publishedAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </time>
                        {' · '}
                        {featuredPost.readingTime} min read
                      </p>
                    </div>
                  </div>
                </Link>
              )}

              {otherPosts.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {otherPosts.map((post) => (
                    <Link key={post.slug} href={`/blog/${post.slug}`} className="group block">
                      <Card className="overflow-hidden rounded-xs shadow-none border-none bg-card hover:bg-card/50 transition-all duration-200">
                        <div className="relative h-40 overflow-hidden bg-muted">
                          <CoverImage
                            src={post.coverImage}
                            alt={post.title}
                            className="w-full h-full group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>

                        <div className="p-4 space-y-2">
                          <h3 className="text-base font-semibold truncate group-hover:text-primary transition-colors">
                            {post.title}
                          </h3>
                          <p className="text-sm text-muted-foreground truncate">
                            {post.author}
                          </p>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
