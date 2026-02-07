#!/usr/bin/env bun

import { fetchYoutubeTranscript, extractVideoId } from './youtubeTranscript';
import { chatWithTranscript, ChatMessage } from './chatWithTranscript';
import * as readline from 'readline';
import { marked } from 'marked';
import { markedTerminal } from 'marked-terminal';

// Configure marked to render markdown in terminal
marked.use(markedTerminal());

// Load environment variables from project root
import 'dotenv/config';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = 'gpt-4o-mini';

function printUsage() {
  console.error('Usage: bun run youtube-cli/src/index.ts <youtube-url>');
  console.error('');
  console.error('Environment variables:');
  console.error('  OPENAI_API_KEY (required) - Your OpenAI API key');
  process.exit(1);
}

function createReadlineInterface() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '> ',
  });
}

async function runChatLoop(transcript: string, videoTitle?: string) {
  const rl = createReadlineInterface();
  const history: ChatMessage[] = [];
  const language = 'en'; // Default to English, can be made configurable later

  console.log('\n' + '='.repeat(60));
  if (videoTitle) {
    console.log(`Video: ${videoTitle}`);
  }
  console.log('Chat with YouTube video transcript');
  console.log('Type your questions (or :q to quit)');
  console.log('='.repeat(60) + '\n');

  rl.prompt();

  rl.on('line', async (input: string) => {
    const question = input.trim();

    // Check for exit commands
    if (question === ':q' || question === 'exit' || question === 'quit') {
      console.log('\nGoodbye!');
      rl.close();
      process.exit(0);
      return;
    }

    // Skip empty input
    if (!question) {
      rl.prompt();
      return;
    }

    // Show thinking indicator
    process.stdout.write('Thinking... ');

    try {
      const answer = await chatWithTranscript({
        transcript,
        question,
        history,
        model: OPENAI_MODEL,
        language,
      });

      // Clear the "Thinking..." line and print answer with markdown rendering
      process.stdout.write('\r' + ' '.repeat(20) + '\r');
      const renderedAnswer = marked.parse(answer) as string;
      console.log('\n' + renderedAnswer);

      // Add to history
      history.push({ role: 'user', content: question });
      history.push({ role: 'assistant', content: answer });
    } catch (error) {
      process.stdout.write('\r' + ' '.repeat(20) + '\r');
      console.error('\nError:', error instanceof Error ? error.message : 'Unknown error');
      console.log('');
    }

    rl.prompt();
  });

  rl.on('close', () => {
    console.log('\nGoodbye!');
    process.exit(0);
  });
}

async function main() {
  const videoUrl = process.argv[2];

  if (!videoUrl) {
    printUsage();
  }

  if (!OPENAI_API_KEY) {
    console.error('Error: OPENAI_API_KEY environment variable is required');
    console.error('');
    console.error('Please set it in your .env file or export it:');
    console.error('  export OPENAI_API_KEY=your-api-key');
    process.exit(1);
  }

  // Set the API key for the OpenAI SDK
  process.env.OPENAI_API_KEY = OPENAI_API_KEY;

  console.log('Fetching transcript...');

  try {
    const transcript = await fetchYoutubeTranscript(videoUrl);
    console.log(`✓ Transcript loaded (${transcript.split(/\s+/).length} words)\n`);

    // Try to extract video title (optional, can be enhanced later)
    let videoTitle: string | undefined;
    try {
      const videoId = extractVideoId(videoUrl);
      if (videoId) {
        // For now, we'll just use the video ID as title
        // In the future, we could fetch video metadata
        videoTitle = `Video ID: ${videoId}`;
      }
    } catch {
      // Ignore errors in title extraction
    }

    await runChatLoop(transcript, videoTitle);
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
