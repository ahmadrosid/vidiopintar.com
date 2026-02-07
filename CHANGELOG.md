# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- CLI tool (`vidiopintar-cli`) for chatting with YouTube video transcripts from command line
- Browser-like headers to bypass bot detection when fetching YouTube transcripts
- Support for transcript-only mode without requiring OpenAI API key

### Changed
- Migrated summary and quick start questions generation to use gpt-5-nano model
- Updated Next.js from 15.4.8 to 15.4.10 (security patches for CVE-2025-55184, CVE-2025-55183, CVE-2025-67779)
- Renamed `youtube-cli` to `vidiopintar-cli`
- CI/CD: Switched to GitHub Actions with GITHUB_TOKEN for GHCR authentication
- Deployment script migrated to Bun + TypeScript
- Switched from Supadata to youtube-transcript-plus for transcript fetching
- Replaced effect-ts with direct implementation

### Fixed
- Type errors for build process related to YouTube transcript fetching
- Docker login to GHCR.io on VPS before deployment
- Duplicate request issues when generating summaries
- Summary endpoint response handling
- Added locking mechanism to prevent concurrent summary generation
- Bun path configuration in deployment scripts

## [0.1.0] - 2025-12-09

### Added
- Initial release of Vidiopintar.com
- AI-powered YouTube video learning platform
- Video summary generation using OpenAI
- Chat interface to interact with video content
- User authentication with Better Auth
- PostgreSQL database with Drizzle ORM
- Docker support for development and deployment
- i18n support for multiple languages

### Tech Stack
- Next.js 14 with React 18
- TypeScript
- Tailwind CSS
- PostgreSQL database
- Drizzle ORM
- Better Auth for authentication
- OpenAI & Google AI SDK

[Unreleased]: https://github.com/ahmadrosid/vidiopintar.com/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/ahmadrosid/vidiopintar.com/releases/tag/v0.1.0
