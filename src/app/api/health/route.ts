import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db/execute';
import { sql } from 'drizzle-orm';

export async function GET() {
  try {
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Database connection timeout')), 8000);
    });

    const dbQuery = executeQuery(sql`SELECT 1`);

    await Promise.race([dbQuery, timeoutPromise]);
    
    return NextResponse.json({ status: 'ok', message: 'Application and database are healthy' });
  } catch (error) {
    console.error('Database connection failed:', error);
    return NextResponse.json(
      { 
        status: 'error', 
        message: 'Database connection failed'
      },
      { status: 500 }
    );
  }
}
