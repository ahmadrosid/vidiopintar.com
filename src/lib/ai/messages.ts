import type { UIMessage } from 'ai';

export function toUIMessages(
  messages: Array<{ id: string; content: string; role: 'user' | 'assistant' }>
): UIMessage[] {
  return messages.map((message) => ({
    id: message.id,
    role: message.role,
    parts: [{ type: 'text', text: message.content }],
  }));
}

export function getMessageText(
  message: Pick<UIMessage, 'parts'> & { content?: string }
): string {
  if (message.parts?.length) {
    const textParts: string[] = [];
    for (const part of message.parts) {
      if (part.type === 'text') {
        textParts.push(part.text);
      }
    }
    return textParts.join('');
  }

  return message.content ?? '';
}
