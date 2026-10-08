import { getCurrentUser } from '@/lib/auth';
import { UserRepository } from '@/lib/db/repository';
import { NextRequest } from 'next/server';

export async function GET() {
  try {
    const user = await getCurrentUser();
    const language = await UserRepository.getPreferredLanguage(user.id);
    
    return Response.json({ language: language || 'id' });
  } catch (error) {
    console.error('Failed to get user language preference:', error);
    return Response.json({ language: 'id' }, { status: 200 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { language } = await request.json();
    
    if (!language || (language !== 'en' && language !== 'id')) {
      return Response.json({ error: 'Invalid language' }, { status: 400 });
    }

    await UserRepository.updatePreferredLanguage(user.id, language);

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error updating language preference:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
