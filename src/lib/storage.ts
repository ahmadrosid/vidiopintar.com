import { MessageRepository } from '@/lib/db/repository';

export interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: number;
}

export async function getChatHistory(videoId: string, userVideoId: number): Promise<Message[]> {
  try {
    const messages = await MessageRepository.getByUserVideoId(userVideoId);
    
    return messages.map(message => ({
      id: message.id,
      content: message.content,
      role: message.role as "user" | "assistant",
      timestamp: message.timestamp,
    }));
  } catch (error) {
    console.error('Error fetching chat history:', error);
    return [];
  }
}
