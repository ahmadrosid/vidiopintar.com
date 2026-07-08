export interface ChangelogEntry {
  date: string;
  version: string;
  type: 'major' | 'minor' | 'patch';
  changes: {
    category: 'added' | 'changed' | 'fixed' | 'removed';
    items: string[];
  }[];
}

export const changelogs: ChangelogEntry[] = [
  {
    date: "2026-07-08",
    version: "2.0.2",
    type: "patch",
    changes: [
      {
        category: "removed",
        items: [
          "Tips alert on the video page that prompted users to replace YouTube URLs with Vidiopintar links"
        ]
      }
    ]
  },
  {
    date: "2026-07-07",
    version: "2.0.1",
    type: "patch",
    changes: [
      {
        category: "added",
        items: [
          "Recommended videos on home page for new users with no watch history — one-click try without leaving the app"
        ]
      },
      {
        category: "changed",
        items: [
          "Admin transaction confirm/reject buttons now use brand accent and destructive styles instead of hardcoded green/red"
        ]
      },
      {
        category: "fixed",
        items: [
          "Dark mode support for admin transaction confirm and reject dialogs"
        ]
      }
    ]
  },
  {
    date: "2026-07-07",
    version: "2.0.0",
    type: "major",
    changes: [
      {
        category: "added",
        items: [
          "Clerk authentication with dedicated sign-in and sign-up pages",
          "TranscriptAPI.com integration for reliable YouTube transcript fetching",
          "PostgreSQL-to-SQLite migration scripts (`db:migrate-from-pg`, `db:verify`)",
          "FAQ JSON-LD structured data on landing page for SEO",
          "Blog index redesign with featured post and grid layout",
          "Back to home link on blog index page"
        ]
      },
      {
        category: "changed",
        items: [
          "Migrated database from PostgreSQL to SQLite with Drizzle ORM",
          "Replaced Better Auth and Google login with Clerk authentication",
          "Migrated AI chat and summaries from OpenAI to DeepSeek v4 Flash",
          "Switched transcript fetching from youtube-transcript-plus to TranscriptAPI.com",
          "Video metadata now fetched via YouTube oEmbed instead of internal API",
          "CLI updated to use DeepSeek and TranscriptAPI.com",
          "Simplified CI/CD workflow to build-and-push only (removed VPS SSH deploy step)",
          "Docker setup now uses SQLite with persistent volume at `/data`",
          "Blog cards styled consistently with landing page design"
        ]
      },
      {
        category: "fixed",
        items: [
          "Clerk user sync with existing database users by email",
          "Transcript caching and segment normalization across app and CLI",
          "Build and deployment fixes for SQLite in Docker on Alpine"
        ]
      },
      {
        category: "removed",
        items: [
          "Category/topic browsing pages and home dashboard topic cards",
          "YouTube comments tab and API endpoint",
          "Landing page Topics section",
          "PostgreSQL deployment infrastructure (deploy script, pg_hba.conf, local postgres scripts)",
          "Better Auth API route and custom auth form",
          "Supadata integration"
        ]
      }
    ]
  },
  {
    date: "2026-02-07",
    version: "1.5.0",
    type: "minor",
    changes: [
      {
        category: "added",
        items: [
          "MDX-based blog with SEO optimization (OG tags, JSON-LD, RSS feed)",
          "CLI tool (vidiopintar-cli) for chatting with YouTube transcripts",
          "Browser-like headers to bypass bot detection for YouTube fetching",
          "Transcript-only mode without requiring OpenAI API key",
          "Tag-based filtering for blog posts",
          "Auto-generated sitemap and RSS feed for blog",
          "Canonical URLs for main pages (home, blog, changelogs, privacy, terms)",
          "SEO metadata for privacy policy and terms of service pages"
        ]
      },
      {
        category: "changed",
        items: [
          "Migrated summary generation to gpt-5-nano model",
          "Updated Next.js to 15.4.10 (security patches for CVE-2025-55184, CVE-2025-55183, CVE-2025-67779)",
          "Switched from Supadata to youtube-transcript-plus for transcripts",
          "CI/CD now uses GITHUB_TOKEN instead of PAT for GHCR authentication",
          "Deployment script migrated to Bun + TypeScript",
          "Removed effect-ts dependency"
        ]
      },
      {
        category: "fixed",
        items: [
          "Docker login to GHCR.io on VPS before deployment",
          "Type errors for build process",
          "Duplicate request issues when generating summaries",
          "Added locking mechanism to prevent concurrent summary generation",
          "Blog link color contrast in dark mode",
          "Code block dark mode support with theme switching",
          "External image URL support in blog posts"
        ]
      }
    ]
  },
  {
    date: "2025-11-08",
    version: "1.4.0",
    type: "minor",
    changes: [
      {
        category: "added",
        items: [
          "Note taking feature with dedicated notes page",
          "Last Notes section on home page",
          "Resizable chat panel",
          "Reusable skeleton components for video loading states in category pages"
        ]
      },
      {
        category: "changed",
        items: [
          "Standardized card styling and improved consistency across pages",
          "Improved UX and styling throughout the application",
          "Performance optimizations to make the app feel faster"
        ]
      }
    ]
  },
  {
    date: "2025-11-05",
    version: "1.3.16",
    type: "patch",
    changes: [
      {
        category: "added",
        items: [
          "SEO optimization with Open Graph (OG) image support"
        ]
      },
      {
        category: "changed",
        items: [
          "Updated admin page styling",
          "Improved styling consistency on home page",
          "Reduced FAQ content"
        ]
      },
      {
        category: "fixed",
        items: [
          "Redirect after login issue"
        ]
      },
      {
        category: "removed",
        items: [
          "Thread-generator feature"
        ]
      }
    ]
  },
  {
    date: "2025-10-18",
    version: "1.3.8",
    type: "patch",
    changes: [
      {
        category: "changed",
        items: [
          "Improved UX across the application"
        ]
      },
      {
        category: "fixed",
        items: [
          "Inconsistent icon sizes"
        ]
      }
    ]
  },
  {
    date: "2025-09-26",
    version: "1.3.7",
    type: "patch",
    changes: [
      {
        category: "fixed",
        items: [
          "Hydration error in React components"
        ]
      }
    ]
  },
  {
    date: "2025-09-20",
    version: "1.3.6",
    type: "patch",
    changes: [
      {
        category: "added",
        items: [
          "New navbar component",
          "Call to action component",
          "Typography components",
          "Updated logo"
        ]
      },
      {
        category: "changed",
        items: [
          "Refactored main layout structure",
          "Improved home page design",
          "Enhanced privacy and terms condition pages",
          "Moved footer to layout directory"
        ]
      },
      {
        category: "fixed",
        items: [
          "Brand logo display",
          "Terms and privacy page layout"
        ]
      }
    ]
  },
  {
    date: "2025-09-15",
    version: "1.3.5",
    type: "patch",
    changes: [
      {
        category: "added",
        items: [
          "Login button or home button display logic in landing page",
          "Authentication requirement for purchase flow"
        ]
      },
      {
        category: "changed",
        items: [
          "Updated landing page design",
          "Admin cart UI now uses accent color"
        ]
      }
    ]
  },
  {
    date: "2025-08-28",
    version: "1.3.4",
    type: "patch",
    changes: [
      {
        category: "added",
        items: [
          "Subscription expiration date display in admin panel"
        ]
      },
      {
        category: "fixed",
        items: [
          "Billing expiration plan handling",
          "Various billing-related issues"
        ]
      }
    ]
  },
  {
    date: "2025-08-06",
    version: "1.3.3",
    type: "patch",
    changes: [
      {
        category: "changed",
        items: [
          "Simplified profile usage view",
          "Removed usage sidebar"
        ]
      }
    ]
  },
  {
    date: "2025-08-03",
    version: "1.3.9",
    type: "patch",
    changes: [
      {
        category: "added",
        items: [
          "Comprehensive achievement system to profile usage page"
        ]
      }
    ]
  },
  {
    date: "2025-08-01",
    version: "1.3.8",
    type: "patch",
    changes: [
      {
        category: "added",
        items: [
          "Conversion rate card to admin transactions page"
        ]
      }
    ]
  },
  {
    date: "2025-07-31",
    version: "1.3.7",
    type: "patch",
    changes: [
      {
        category: "changed",
        items: [
          "Refactored to use `useLocale` hook for language handling"
        ]
      }
    ]
  },
  {
    date: "2025-07-27",
    version: "1.3.6",
    type: "patch",
    changes: [
      {
        category: "added",
        items: [
          "Basic payment integration system",
          "Billing section in profile page and sidebar",
          "Pending payment section",
          "Daily video limit for free users (2 videos per day)",
          "Transaction management and logging"
        ]
      },
      {
        category: "changed",
        items: [
          "Enhanced video page with daily limit display and translations",
          "Added drizzle.config.ts to Dockerfile"
        ]
      }
    ]
  },
  {
    date: "2025-07-26",
    version: "1.3.5",
    type: "patch",
    changes: [
      {
        category: "fixed",
        items: [
          "Auto scroll functionality in chat container"
        ]
      },
      {
        category: "changed",
        items: [
          "Moved ChatContainerScrollAnchor component",
          "Minor UI enhancements"
        ]
      }
    ]
  },
  {
    date: "2025-07-24",
    version: "1.3.4",
    type: "patch",
    changes: [
      {
        category: "added",
        items: [
          "Full internationalization (i18n) support",
          "Translations for login and register pages",
          "Multi-language support throughout the application"
        ]
      },
      {
        category: "changed",
        items: [
          "Refactored authentication middleware location"
        ]
      }
    ]
  },
  {
    date: "2025-07-22",
    version: "1.3.3",
    type: "patch",
    changes: [
      {
        category: "added",
        items: [
          "Support for live YouTube video URLs",
          "User retention overview in admin page"
        ]
      },
      {
        category: "changed",
        items: [
          "Migrated React context to Zustand store for better state management",
          "Upgraded to Next.js 15 and React 19",
          "Improved deployment script to automatically detect and remove unhealthy containers"
        ]
      },
      {
        category: "fixed",
        items: [
          "Video page display on smaller screens (now shows more than just chat section)",
          "Database exposure security issue",
          "Feedback authorization and admin checks",
          "Prevent rendering video page when there are no transcriptions",
          "Build issues after Next.js upgrade"
        ]
      }
    ]
  },
  {
    date: "2025-07-17",
    version: "1.3.2",
    type: "patch",
    changes: [
      {
        category: "added",
        items: [
          "Cost analysis dashboard in admin panel"
        ]
      },
      {
        category: "changed",
        items: [
          "Simplified header logic and fixed UI bugs"
        ]
      }
    ]
  },
  {
    date: "2025-07-16",
    version: "1.3.1",
    type: "patch",
    changes: [
      {
        category: "added",
        items: [
          "Chrome extension for VidioPintar",
          "Database backup and migration system from Neon provider",
          "Docker development setup instructions"
        ]
      },
      {
        category: "changed",
        items: [
          "Improved health check with database connection timeout",
          "Updated deployment script and Docker configuration",
          "Fixed Deriving State Anti-Pattern"
        ]
      },
      {
        category: "removed",
        items: [
          "Host networking from deployment script",
          "Unused code"
        ]
      }
    ]
  },
  {
    date: "2025-07-14",
    version: "1.3.0",
    type: "minor",
    changes: [
      {
        category: "changed",
        items: [
          "Set thread-generator route to 404 temporarily"
        ]
      }
    ]
  },
  {
    date: "2025-07-13",
    version: "1.2.9",
    type: "patch",
    changes: [
      {
        category: "changed",
        items: [
          "Improved authentication and search result handling",
          "Enhanced YouTube search schema validation"
        ]
      },
      {
        category: "added",
        items: [
          "Chat response feedback system",
          "Admin feedback management with delete confirmation dialog",
          "Button to copy all transcripts to clipboard",
          "Improved transcript search functionality"
        ]
      }
    ]
  },
  {
    date: "2025-07-10",
    version: "1.2.8",
    type: "patch",
    changes: [
      {
        category: "added",
        items: [
          "Admin dashboard page for understanding users"
        ]
      },
      {
        category: "changed",
        items: [
          "Code cleanup and maintenance"
        ]
      },
      {
        category: "removed",
        items: [
          "Transcript debug code"
        ]
      }
    ]
  },
  {
    date: "2025-07-08",
    version: "1.2.7",
    type: "patch",
    changes: [
      {
        category: "added",
        items: [
          "Add youtube to threads generator tools"
        ]
      },
      {
        category: "changed",
        items: [
          "Changed YouTube search route to use POST method for better security",
          "Refactored and improved YouTube search route implementation",
          "Implemented API proxy for YouTube video search functionality",
          "Improved styling and spacing consistency on home page"
        ]
      }
    ]
  },
  {
    date: "2025-07-07",
    version: "1.2.6",
    type: "patch",
    changes: [
      {
        category: "changed",
        items: [
          "Updated testimonials section with additional testimonials"
        ]
      }
    ]
  },
  {
    date: "2025-07-06",
    version: "1.2.5",
    type: "patch",
    changes: [
      {
        category: "fixed",
        items: [
          "Security vulnerability - ensures users can only delete their own videos"
        ]
      }
    ]
  },
  {
    date: "2025-07-06",
    version: "1.2.4",
    type: "patch",
    changes: [
      {
        category: "added",
        items: [
          "Testimonial from Muhammad Fatih Darmawan"
        ]
      },
      {
        category: "changed",
        items: [
          "Profile page is now responsive and mobile friendly",
          "Improved header navigation style",
          "Removed duplicate code related to search video",
        ]
      }
    ]
  },
  {
    date: "2025-07-05",
    version: "1.2.3",
    type: "patch",
    changes: [
      {
        category: "added",
        items: [
          "Profile page with theme and language preferences",
          "Language selector component with backend sync",
          "Real testimonials data",
          "GitHub link in navigation"
        ]
      },
      {
        category: "changed",
        items: [
          "Updated YouTube model name display",
          "Improved UI padding and layout"
        ]
      }
    ]
  },
  {
    date: "2025-07-03",
    version: "1.2.2",
    type: "patch",
    changes: [
      {
        category: "added",
        items: [
          "Top users in dashboard admin page"
        ]
      }
    ]
  },
  {
    date: "2025-07-02",
    version: "1.2.1",
    type: "patch",
    changes: [
      {
        category: "added",
        items: [
          "Terms of Service and Privacy Policy pages"
        ]
      },
      {
        category: "changed",
        items: [
          "Refactor call to action component to use FormStartLearning"
        ]
      }
    ]
  },
  {
    date: "2025-07-01",
    version: "1.2.0",
    type: "minor",
    changes: [
      {
        category: "added",
        items: [
          "Manage profile page where users can view their latest messages",
          "View latest shared chats in profile page",
          "Delete profile permanently option",
          "Tips alert showing how to convert YouTube URLs to VidioPintar chat links",
          "CC BY-NC 4.0 license for open source release",
          "Automatic cleanup of previous containers after successful deployment"
        ]
      },
      {
        category: "changed",
        items: [
          "Remove theme-toggle change to theme-switcher",
          "Improved rollout deployment script for better reliability",
        ]
      },
      {
        category: "fixed",
        items: [
          "Prevent submit quick question when in shared mode",
          "Display of created_at timestamp for latest messages in admin page",
        ]
      }
    ]
  },
  {
    date: "2025-06-30",
    version: "1.1.0",
    type: "minor",
    changes: [
      {
        category: "added",
        items: [
          "Search functionality triggered on button click",
          "Rollout deployment system setup"
        ]
      },
      {
        category: "changed",
        items: [
          "Multiple code cleanup and optimization passes"
        ]
      },
      {
        category: "fixed",
        items: [
          "Container name conflicts during deployment",
          "Styling issues in delete video dialog",
          "Rollout deployment process stability"
        ]
      },
      {
        category: "removed",
        items: [
          "Deprecated submit-button component"
        ]
      }
    ]
  }
];
