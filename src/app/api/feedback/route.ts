import { getCurrentUser } from '@/lib/auth';
import { FeedbackRepository } from '@/lib/db/repository';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { type, rating, comment, metadata } = await request.json();
    
    // Validate required fields
    if (!type || !rating) {
      return Response.json({ error: 'Type and rating are required' }, { status: 400 });
    }

    // Validate rating values
    if (!['bad', 'decent', 'love_it'].includes(rating)) {
      return Response.json({ error: 'Invalid rating value' }, { status: 400 });
    }

    // Validate type values
    if (!['platform', 'video', 'chat_response'].includes(type)) {
      return Response.json({ error: 'Invalid feedback type' }, { status: 400 });
    }

    // Check for duplicate feedback on chat responses
    if (type === 'chat_response' && metadata?.messageId) {
      const existingFeedback = await FeedbackRepository.existsByUserAndMessage(
        user.id, 
        metadata.messageId
      );
      
      if (existingFeedback) {
        return Response.json({ 
          error: 'Feedback already submitted for this message' 
        }, { status: 409 }); // 409 Conflict
      }
    }

    // Create feedback
    const feedback = await FeedbackRepository.create({
      userId: user.id,
      type,
      rating,
      comment: comment || null,
      metadata: metadata || null,
    });

    return Response.json({ 
      success: true, 
      id: feedback.id 
    });
  } catch (error) {
    console.error('Error creating feedback:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's feedback
    const userFeedback = await FeedbackRepository.getByUserId(user.id);
    
    return Response.json({ feedback: userFeedback });
  } catch (error) {
    console.error('Error fetching feedback:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const feedbackId = searchParams.get('id');

    if (!feedbackId) {
      return Response.json({ error: 'Feedback ID is required' }, { status: 400 });
    }

    const id = parseInt(feedbackId);
    if (isNaN(id)) {
      return Response.json({ error: 'Invalid feedback ID' }, { status: 400 });
    }

    // Delete the feedback
    await FeedbackRepository.delete(id);

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error deleting feedback:', error);
    if (error instanceof Error && error.message === 'Feedback not found') {
      return Response.json({ error: 'Feedback not found' }, { status: 404 });
    }
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}