import { NextRequest } from 'next/server';
import { env } from '@/lib/env/server';

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();
    
    if (!query) {
      return Response.json(
        { error: 'Query is required in request body' },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${env.API_BASE_URL}/youtube/search?q=${encodeURIComponent(query)}`,
      {
        headers: {
          'Accept': 'application/json',
          'X-API-Key': env.API_X_HEADER_API_KEY,
        },
      }
    );


    if (!response.ok) {
      throw new Error(`External API responded with ${response.status}`);
    }

    const data = await response.json();
    
    return Response.json(data);
  } catch (error) {
    console.error('YouTube search API error:', error);
    return Response.json(
      { error: 'Failed to search YouTube videos' },
      { status: 500 }
    );
  }
}