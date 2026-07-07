# YouTube CLI Chat Tool

A simple command-line tool to chat with YouTube video transcripts directly from your terminal.

## Features

- 🎥 Fetches video transcript automatically
- 💬 Interactive chat loop - ask questions about the video
- 📝 Maintains conversation history (last 5 exchanges)
- 🌍 Supports English and Indonesian
- ⚡ Fast and lightweight

## Setup

Make sure you have the required API keys set in your environment:

```bash
# Option 1: Export in your shell
export DEEPSEEK_API_KEY=your-api-key-here
export TRANSCRIPT_API_KEY=your-transcript-api-key-here

# Option 2: Add to .env file in project root (already loaded automatically)
DEEPSEEK_API_KEY=your-api-key-here
TRANSCRIPT_API_KEY=your-transcript-api-key-here
```

The CLI uses `deepseek-v4-flash` for all chat responses and [TranscriptAPI](https://transcriptapi.com) for transcript fetching.

## Usage

```bash
# Using npm script
bun run youtube-chat <youtube-url>

# Or directly with bun
bun run vidiopintar-cli/src/index.ts <youtube-url>

# Transcript only (no DeepSeek API key required, but TRANSCRIPT_API_KEY is required)
bun run vidiopintar-cli/src/index.ts <youtube-url> --transcript
```

## Examples

```bash
# Chat with a specific video
bun run youtube-chat https://www.youtube.com/watch?v=dQw4w9WgXcQ

# Using short URL format
bun run youtube-chat https://youtu.be/dQw4w9WgXcQ

# Using video ID directly
bun run youtube-chat dQw4w9WgXcQ

# Transcript only
bun run youtube-chat https://www.youtube.com/watch?v=dQw4w9WgXcQ --transcript
```

## Example Session

```bash
$ bun run youtube-chat https://www.youtube.com/watch?v=example
Fetching transcript...
✓ Transcript loaded (1234 words)

============================================================
Video: Video ID: example
Chat with YouTube video transcript
Type your questions (or :q to quit)
============================================================

> What is the main topic of this video?
Thinking... 

The main topic is about...

> Can you summarize the key points?
Thinking... 

Here are the key points:
- Point 1
- Point 2
...

> :q
Goodbye!
```

## Commands

- Type your question and press Enter to ask
- Type `:q`, `exit`, or `quit` to exit the chat

## Requirements

- Bun runtime
- DeepSeek API key (required only for chat mode)
- YouTube video with captions/transcripts enabled

## Project Structure

```
vidiopintar-cli/
├── src/
│   ├── index.ts              # Main CLI entry point
│   ├── youtubeTranscript.ts  # YouTube transcript fetching
│   └── chatWithTranscript.ts # AI chat functionality
└── README.md                 # This file
```
