import Image from 'next/image';
import { CodeBlock, CodeBlockCode } from '@/components/ui/code-block';

export const mdxComponents = {
  h1: ({ children }: { children: React.ReactNode }) => (
    <h1 className="text-3xl font-bold tracking-tight mt-8 mb-4 text-foreground">
      {children}
    </h1>
  ),
  h2: ({ children }: { children: React.ReactNode }) => (
    <h2 className="text-2xl font-semibold tracking-tight mt-8 mb-4 text-foreground">
      {children}
    </h2>
  ),
  h3: ({ children }: { children: React.ReactNode }) => (
    <h3 className="text-xl font-semibold tracking-tight mt-6 mb-3 text-foreground">
      {children}
    </h3>
  ),
  p: ({ children }: { children: React.ReactNode }) => (
    <p className="leading-7 mb-4 text-foreground/80">{children}</p>
  ),
  ul: ({ children }: { children: React.ReactNode }) => (
    <ul className="list-disc pl-6 mb-4 space-y-2 text-foreground/80">{children}</ul>
  ),
  ol: ({ children }: { children: React.ReactNode }) => (
    <ol className="list-decimal pl-6 mb-4 space-y-2 text-foreground/80">{children}</ol>
  ),
  li: ({ children }: { children: React.ReactNode }) => (
    <li className="leading-7">{children}</li>
  ),
  a: ({ href, children }: { href?: string; children: React.ReactNode }) => (
    <a
      href={href}
      className="text-blue-600 dark:text-blue-200 hover:underline underline-offset-4 font-medium"
      target={href?.startsWith('http') ? '_blank' : undefined}
      rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
    >
      {children}
    </a>
  ),
  code: ({ children, className }: { children: React.ReactNode; className?: string }) => {
    const isInline = !className;
    if (isInline) {
      return (
        <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-foreground">
          {children}
        </code>
      );
    }
    return (
      <CodeBlock>
        <CodeBlockCode code={String(children)} language={className?.replace('language-', '') || 'text'} />
      </CodeBlock>
    );
  },
  pre: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  blockquote: ({ children }: { children: React.ReactNode }) => (
    <blockquote className="border-l-4 border-primary/30 pl-4 italic my-6 text-foreground/70">
      {children}
    </blockquote>
  ),
  img: ({ src, alt }: { src?: string; alt?: string }) => (
    <div className="my-6">
      <Image
        src={src || ''}
        alt={alt || ''}
        width={800}
        height={400}
        className="rounded-lg border border-border/50"
      />
      {alt && <p className="text-center text-sm text-muted-foreground mt-2">{alt}</p>}
    </div>
  ),
  hr: () => <hr className="my-8 border-border" />,
  table: ({ children }: { children: React.ReactNode }) => (
    <div className="overflow-x-auto my-6">
      <table className="w-full border-collapse border border-border">{children}</table>
    </div>
  ),
  thead: ({ children }: { children: React.ReactNode }) => (
    <thead className="bg-muted">{children}</thead>
  ),
  th: ({ children }: { children: React.ReactNode }) => (
    <th className="border border-border px-4 py-2 text-left font-semibold text-foreground">
      {children}
    </th>
  ),
  td: ({ children }: { children: React.ReactNode }) => (
    <td className="border border-border px-4 py-2 text-foreground/80">{children}</td>
  ),
  tr: ({ children }: { children: React.ReactNode }) => <tr>{children}</tr>,
};
