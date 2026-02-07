#!/usr/bin/env bun

import { fetchYoutubeTranscript, extractVideoId } from './youtubeTranscript';

function printUsage() {
  console.error('Usage: bun run src/transcript.ts <youtube-url>');
  console.error('');
  console.error('Examples:');
  console.error('  bun run src/transcript.ts https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  console.error('  bun run src/transcript.ts https://youtu.be/dQw4w9WgXcQ');
  console.error('  bun run src/transcript.ts dQw4w9WgXcQ');
  process.exit(1);
}

async function main() {
  const videoUrl = process.argv[2];

  if (!videoUrl) {
    printUsage();
  }

  const videoId = extractVideoId(videoUrl);

  try {
    const transcript = await fetchYoutubeTranscript(videoUrl);
    console.log(transcript);
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
