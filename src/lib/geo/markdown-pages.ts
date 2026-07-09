import { faqData } from "@/data/faq";
import { getAllPosts, getPostBySlug, getPostsByTag } from "@/lib/blog";
import { changelogs } from "@/lib/data/changelogs";
import { absoluteUrl, markdownUrlFor, SITE_NAME, SITE_URL } from "@/lib/geo/site";

function pageHeader(title: string, path: string, summary: string): string {
  return [
    `# ${title}`,
    "",
    `> ${summary}`,
    "",
    `- HTML: ${absoluteUrl(path)}`,
    `- Markdown: ${markdownUrlFor(path)}`,
    "",
  ].join("\n");
}

function relatedLinks(links: { title: string; path: string }[]): string {
  return [
    "## Related pages",
    "",
    ...links.map((link) => `- [${link.title}](${markdownUrlFor(link.path)})`),
    "",
    "## External references",
    "",
    "- [YouTube Help Center](https://support.google.com/youtube/): Official YouTube product documentation",
    "- [OpenAI API documentation](https://platform.openai.com/docs): Reference for large language model APIs used in AI summarization products",
    "- [Schema.org CreativeWork](https://schema.org/CreativeWork): Structured data vocabulary for web content",
    "",
  ].join("\n");
}

function homeMarkdown(): string {
  return [
    pageHeader(
      SITE_NAME,
      "/",
      "AI-powered YouTube learning platform that turns videos into summaries, chat, and organized knowledge."
    ),
    "Vidiopintar helps learners extract insights from YouTube without watching every minute. Paste a video URL to generate summaries, ask follow-up questions in chat, and keep notes in a personal library.",
    "",
    "## How it works",
    "",
    "1. Paste a YouTube URL on the homepage or dashboard.",
    "2. Vidiopintar analyzes the transcript and produces structured insights.",
    "3. Chat with the video to clarify concepts, request examples, or dig into specific sections.",
    "4. Save useful videos and notes in your library for later review.",
    "",
    "## Core features",
    "",
    "### Instant insights",
    "",
    "Get outlines, key takeaways, and actionable next steps from educational videos, podcasts, and tutorials.",
    "",
    "### AI video chat",
    "",
    "Ask questions grounded in the video transcript so answers stay tied to the source material.",
    "",
    "### Personal learning library",
    "",
    "Organize processed videos, revisit summaries, and share selected conversations when you want collaboration.",
    "",
    "## Pricing overview",
    "",
    "- Free: limited daily videos with basic summaries",
    "- Monthly: IDR 50,000 for unlimited videos and advanced insights",
    "- Yearly: IDR 500,000 (save 20%) with priority support",
    "",
    relatedLinks([
      { title: "FAQ", path: "/faq" },
      { title: "Blog", path: "/blog" },
      { title: "Changelogs", path: "/changelogs" },
      { title: "Privacy Policy", path: "/privacy" },
      { title: "Terms of Service", path: "/terms" },
    ]),
  ].join("\n");
}

function faqMarkdown(): string {
  const items = faqData
    .map(
      (faq) =>
        `### ${faq.question}\n\nCategory: ${faq.category}\n\n${faq.answer}\n`
    )
    .join("\n");

  return [
    pageHeader(
      "FAQ — Vidiopintar",
      "/faq",
      "Answers about AI YouTube summaries, pricing, privacy, and how Vidiopintar works."
    ),
    "This page collects the most common questions about using Vidiopintar as an AI YouTube summarizer and learning assistant.",
    "",
    "## Questions and answers",
    "",
    items,
    relatedLinks([
      { title: "Home", path: "/" },
      { title: "Blog", path: "/blog" },
      { title: "Pricing on home page", path: "/" },
      { title: "Privacy Policy", path: "/privacy" },
      { title: "Terms of Service", path: "/terms" },
    ]),
  ].join("\n");
}

function blogIndexMarkdown(): string {
  const posts = getAllPosts();
  const list = posts
    .map(
      (post) =>
        `- [${post.title}](${markdownUrlFor(`/blog/${post.slug}`)}): ${post.description}`
    )
    .join("\n");

  return [
    pageHeader(
      "Blog — Vidiopintar",
      "/blog",
      "Articles on AI learning, YouTube productivity, and product updates from the Vidiopintar team."
    ),
    "The Vidiopintar blog covers practical ways to learn faster from video, product announcements, and notes from building an AI learning platform.",
    "",
    "## Latest posts",
    "",
    list || "_No posts published yet._",
    "",
    relatedLinks([
      { title: "Home", path: "/" },
      { title: "FAQ", path: "/faq" },
      { title: "Changelogs", path: "/changelogs" },
    ]),
  ].join("\n");
}

function blogPostMarkdown(slug: string): string | null {
  const post = getPostBySlug(slug);
  if (!post) return null;

  return [
    pageHeader(post.title, `/blog/${post.slug}`, post.description),
    `- Published: ${post.publishedAt}`,
    post.updatedAt ? `- Updated: ${post.updatedAt}` : null,
    `- Author: ${post.author}`,
    `- Reading time: ${post.readingTime} min`,
    post.tags.length ? `- Tags: ${post.tags.join(", ")}` : null,
    "",
    post.content.trim(),
    "",
    relatedLinks([
      { title: "Blog index", path: "/blog" },
      { title: "Home", path: "/" },
      { title: "FAQ", path: "/faq" },
      ...post.tags.slice(0, 2).map((tag) => ({
        title: `Tag: ${tag}`,
        path: `/blog/tag/${encodeURIComponent(tag)}`,
      })),
    ]),
  ]
    .filter((line): line is string => line !== null)
    .join("\n");
}

function blogTagMarkdown(tag: string): string | null {
  const decoded = decodeURIComponent(tag);
  const posts = getPostsByTag(decoded);
  if (posts.length === 0) return null;

  const list = posts
    .map(
      (post) =>
        `- [${post.title}](${markdownUrlFor(`/blog/${post.slug}`)}): ${post.description}`
    )
    .join("\n");

  return [
    pageHeader(
      `Posts tagged “${decoded}”`,
      `/blog/tag/${encodeURIComponent(decoded)}`,
      `Vidiopintar blog articles tagged with ${decoded}.`
    ),
    list,
    "",
    relatedLinks([
      { title: "Blog index", path: "/blog" },
      { title: "Home", path: "/" },
      { title: "FAQ", path: "/faq" },
    ]),
  ].join("\n");
}

function changelogsMarkdown(): string {
  const entries = changelogs
    .slice(0, 20)
    .map((entry) => {
      const changes = entry.changes
        .map(
          (change) =>
            `#### ${change.category}\n\n${change.items.map((item) => `- ${item}`).join("\n")}`
        )
        .join("\n\n");
      return `### ${entry.version} — ${entry.date}\n\n${changes}`;
    })
    .join("\n\n");

  return [
    pageHeader(
      "Changelogs — Vidiopintar",
      "/changelogs",
      "Product updates, fixes, and feature releases for the Vidiopintar platform."
    ),
    "Track what shipped recently on Vidiopintar, from dashboard improvements to summarization and chat updates.",
    "",
    "## Recent releases",
    "",
    entries,
    "",
    relatedLinks([
      { title: "Home", path: "/" },
      { title: "Blog", path: "/blog" },
      { title: "FAQ", path: "/faq" },
    ]),
  ].join("\n");
}

function privacyMarkdown(): string {
  return [
    pageHeader(
      "Privacy Policy — Vidiopintar",
      "/privacy",
      "How Vidiopintar collects, uses, and protects personal information."
    ),
    "VidioPintar is committed to protecting personal information and privacy rights. This policy explains what we collect, how we use it, and the choices available to users of our AI YouTube learning service.",
    "",
    "## Information we collect",
    "",
    "- Account details such as email address and optional name",
    "- Payment information for premium plans",
    "- Usage data such as processing preferences and device information",
    "- Content data needed to process videos you submit, including transcripts and chat history",
    "",
    "## How we use information",
    "",
    "We use collected data to operate the service, process videos, improve product quality, communicate account updates, handle billing, and meet legal obligations.",
    "",
    "## Your rights",
    "",
    "You may request access, correction, deletion, or portability of your personal data, and you can opt out of marketing communications. Contact privacy@vidiopintar.com to exercise these rights.",
    "",
    "Full HTML policy: " + absoluteUrl("/privacy"),
    "",
    relatedLinks([
      { title: "Terms of Service", path: "/terms" },
      { title: "FAQ", path: "/faq" },
      { title: "Home", path: "/" },
    ]),
  ].join("\n");
}

function termsMarkdown(): string {
  return [
    pageHeader(
      "Terms of Service — Vidiopintar",
      "/terms",
      "Acceptable use, accounts, billing, and liability terms for Vidiopintar."
    ),
    "By using Vidiopintar you agree to these terms. The service provides AI-assisted YouTube learning features including transcription analysis, summaries, chat, and related tools.",
    "",
    "## Key points",
    "",
    "- You must provide accurate account information and keep credentials secure",
    "- Do not upload or process unlawful, infringing, or harmful content",
    "- You retain ownership of content you submit; we receive a limited license to process it",
    "- Premium billing follows the selected plan; first-time subscribers may be eligible for a 7-day refund window subject to policy limits",
    "- The service is provided as-is; review AI-generated output before relying on it",
    "",
    "Full HTML terms: " + absoluteUrl("/terms"),
    "",
    relatedLinks([
      { title: "Privacy Policy", path: "/privacy" },
      { title: "FAQ", path: "/faq" },
      { title: "Home", path: "/" },
    ]),
  ].join("\n");
}

/**
 * Resolve markdown body for a public path. Returns null when unsupported.
 */
export function getMarkdownForPath(rawPath: string): string | null {
  const path = normalizePath(rawPath);

  if (path === "/") return homeMarkdown();
  if (path === "/faq") return faqMarkdown();
  if (path === "/blog") return blogIndexMarkdown();
  if (path === "/changelogs") return changelogsMarkdown();
  if (path === "/privacy") return privacyMarkdown();
  if (path === "/terms") return termsMarkdown();

  const blogMatch = path.match(/^\/blog\/([^/]+)$/);
  if (blogMatch) return blogPostMarkdown(blogMatch[1]);

  const tagMatch = path.match(/^\/blog\/tag\/([^/]+)$/);
  if (tagMatch) return blogTagMarkdown(tagMatch[1]);

  return null;
}

export function normalizePath(rawPath: string): string {
  let path = rawPath.trim();
  if (!path.startsWith("/")) path = `/${path}`;
  if (path === "/index" || path === "/index.html") path = "/";
  if (path.length > 1 && path.endsWith("/")) path = path.slice(0, -1);
  return path;
}

export function buildLlmsTxt(): string {
  const posts = getAllPosts();
  const postLinks = posts
    .map(
      (post) =>
        `- [${post.title}](${markdownUrlFor(`/blog/${post.slug}`)}): ${post.description}`
    )
    .join("\n");

  return `# ${SITE_NAME}
> AI-powered YouTube learning platform. Paste a YouTube URL to get instant summaries, chat with video content, and organize knowledge.

Vidiopintar turns educational YouTube videos, podcasts, and tutorials into structured insights and interactive AI chat. Use this file to discover the highest-signal pages in Markdown form.

## Primary
- [Home](${markdownUrlFor("/")}): Product overview, features, pricing, and getting started
- [FAQ](${markdownUrlFor("/faq")}): Common questions about summaries, chat, pricing, and privacy
- [Blog](${markdownUrlFor("/blog")}): Articles on AI learning and product updates
- [Changelogs](${markdownUrlFor("/changelogs")}): Recent product releases and fixes

## Policies
- [Privacy Policy](${markdownUrlFor("/privacy")}): Data collection, retention, and user rights
- [Terms of Service](${markdownUrlFor("/terms")}): Acceptable use, billing, and liability

## Blog posts
${postLinks || "- No posts published yet."}

## Optional
- [Sitemap](${SITE_URL}/sitemap.xml): Machine-readable list of indexable URLs
- [RSS feed](${SITE_URL}/rss.xml): Blog syndication feed
- [GitHub repository](https://github.com/ahmadrosid/vidiopintar.com): Source code and project history
`;
}
