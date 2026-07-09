export const dynamic = "force-static";

const BODY = `# As a condition of accessing this website, you agree to abide by the following Content Signals:
# (a) If a content-signal = yes, you may collect content for the corresponding use.
# (b) If a content-signal = no, you may not collect content for the corresponding use.
# (c) If a signal is omitted, no preference is expressed for that use.
# search: building a search index and providing search results.
# ai-input: inputting content into AI models for real-time answers (RAG / grounding).
# ai-train: training or fine-tuning AI models.

User-agent: *
Allow: /
Allow: /faq
Allow: /blog
Allow: /blog/
Allow: /changelogs
Allow: /privacy
Allow: /terms
Allow: /llms.txt
Allow: /shared/
Disallow: /admin/
Disallow: /profile/
Disallow: /video/
Disallow: /watch
Disallow: /payment
Disallow: /home
Disallow: /api/
Disallow: /sign-in
Disallow: /sign-up
Content-Signal: search=yes, ai-input=yes, ai-train=yes

User-agent: GPTBot
Allow: /
Content-Signal: search=yes, ai-input=yes, ai-train=yes

User-agent: ChatGPT-User
Allow: /
Content-Signal: search=yes, ai-input=yes, ai-train=yes

User-agent: CCBot
Allow: /
Content-Signal: search=yes, ai-input=yes, ai-train=yes

User-agent: anthropic-ai
Allow: /
Content-Signal: search=yes, ai-input=yes, ai-train=yes

User-agent: Claude-Web
Allow: /
Content-Signal: search=yes, ai-input=yes, ai-train=yes

User-agent: ClaudeBot
Allow: /
Content-Signal: search=yes, ai-input=yes, ai-train=yes

User-agent: Google-Extended
Allow: /
Content-Signal: search=yes, ai-input=yes, ai-train=yes

User-agent: PerplexityBot
Allow: /
Content-Signal: search=yes, ai-input=yes, ai-train=yes

Sitemap: https://vidiopintar.com/sitemap.xml
Host: https://vidiopintar.com
`;

export async function GET() {
  return new Response(BODY, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
