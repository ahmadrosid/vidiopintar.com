import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getAllPosts, getAllTags } from '@/lib/blog';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ArrowUpRight, ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Blog | Vidiopintar',
  description: 'Learn about AI, YouTube learning strategies, and productivity tips on the Vidiopintar blog.',
  openGraph: {
    title: 'Blog | Vidiopintar',
    description: 'Learn about AI, YouTube learning strategies, and productivity tips on the Vidiopintar blog.',
    type: 'website',
    url: 'https://vidiopintar.com/blog',
  },
  alternates: {
    canonical: '/blog',
  },
};

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function getAuthorInitials(author: string) {
  return author
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

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
  const tags = getAllTags();

  const featuredPost = posts.find((p) => p.featured) || posts[0];
  const otherPosts = posts.filter((p) => p.slug !== featuredPost?.slug);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
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
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-12">
              {tags.map((tag) => (
                <Link key={tag} href={`/blog/tag/${encodeURIComponent(tag)}`}>
                  <Badge
                    variant="secondary"
                    className="bg-muted hover:bg-muted/80 text-muted-foreground font-normal cursor-pointer transition-colors"
                  >
                    {tag}
                  </Badge>
                </Link>
              ))}
            </div>
          )}

          {posts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground">No posts yet. Check back soon!</p>
            </div>
          ) : (
            <>
              {/* Featured Post */}
              {featuredPost && (
                <Link href={`/blog/${featuredPost.slug}`} className="group block mb-16">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                    {/* Featured Image */}
                    <div className="relative aspect-[4/3] lg:aspect-[16/10] rounded-2xl overflow-hidden bg-muted">
                      <CoverImage
                        src={featuredPost.coverImage}
                        alt={featuredPost.title}
                        className="w-full h-full group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>

                    {/* Featured Content */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        {featuredPost.tags.slice(0, 2).map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="bg-muted hover:bg-muted/80 text-muted-foreground font-normal"
                          >
                            {tag}
                          </Badge>
                        ))}
                        <span>{formatDate(featuredPost.publishedAt)}</span>
                      </div>

                      <h2 className="text-2xl md:text-3xl font-bold leading-tight group-hover:text-primary transition-colors">
                        {featuredPost.title}
                      </h2>

                      <p className="text-muted-foreground leading-relaxed">
                        {featuredPost.description}
                      </p>

                      <div className="flex items-center gap-2 text-sm font-medium pt-2">
                        <span className="group-hover:text-primary transition-colors">
                          Read Article
                        </span>
                        <ArrowUpRight className="w-4 h-4 group-hover:text-primary transition-colors" />
                      </div>
                    </div>
                  </div>
                </Link>
              )}

              {/* Posts Grid */}
              {otherPosts.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {otherPosts.map((post) => (
                    <Link key={post.slug} href={`/blog/${post.slug}`} className="group block">
                      <Card className="h-full overflow-hidden border-0 shadow-none hover:shadow-lg transition-shadow duration-300">
                        {/* Cover Image */}
                        <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-muted mb-4">
                          <CoverImage
                            src={post.coverImage}
                            alt={post.title}
                            className="w-full h-full group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>

                        {/* Content */}
                        <div className="space-y-3">
                          {/* Tags */}
                          {post.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {post.tags.slice(0, 2).map((tag) => (
                                <Badge
                                  key={tag}
                                  variant="secondary"
                                  className="bg-muted hover:bg-muted/80 text-muted-foreground font-normal text-xs"
                                >
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}

                          <h3 className="text-lg font-semibold leading-snug group-hover:text-primary transition-colors line-clamp-2">
                            {post.title}
                          </h3>

                          <p className="text-muted-foreground text-sm line-clamp-2">
                            {post.description}
                          </p>

                          {/* Author */}
                          <div className="flex items-center gap-3 pt-2">
                            <Avatar className="w-8 h-8">
                              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                {getAuthorInitials(post.author)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="text-xs">
                              <p className="font-medium">{post.author}</p>
                              <p className="text-muted-foreground">
                                Updated on {formatDate(post.updatedAt || post.publishedAt)}
                              </p>
                            </div>
                          </div>
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
