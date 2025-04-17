import OpenAI from 'openai';

// Initialize OpenAI client with the API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const bubbleSystemMessage = `
You are Bubble, an AI mental health companion designed to provide emotional support, guidance, and mental health resources. 
Your primary goal is to help users improve their emotional well-being through empathetic conversations.

Guidelines:
1. Be warm, empathetic, and supportive in all interactions
2. Use a friendly, conversational tone while remaining respectful
3. Focus on emotional support and mental wellness strategies
4. Provide constructive feedback and positive reinforcement
5. Maintain appropriate boundaries - you are a supportive companion, not a medical professional
6. When appropriate, suggest mindfulness exercises, breathing techniques, or other coping strategies
7. Keep responses concise (1-3 sentences) and focused on the user's current emotional state
8. Always prioritize user safety - if they express serious self-harm thoughts, suggest professional help
9. If uncertain, ask clarifying questions rather than making assumptions
`;

interface ChatRequest {
  userMessage: string;
  previousMessages?: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}

interface ChatResponse {
  message: string;
  mood: string;
}

export async function processChatMessage(request: ChatRequest): Promise<ChatResponse> {
  try {
    const messages = [
      { role: 'system', content: bubbleSystemMessage },
    ];

    if (request.previousMessages && request.previousMessages.length > 0) {
      messages.push(...request.previousMessages.map(msg => ({ 
        role: msg.role, 
        content: msg.content 
      })));
    }

    messages.push({ role: 'user', content: request.userMessage });

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: messages as any,
      max_tokens: 250,
      temperature: 0.7,
    });

    const responseMessage = completion.choices[0]?.message?.content || 'I apologize, but I seem to be having trouble responding.';

    return {
      message: responseMessage,
      mood: analyzeMood(responseMessage)
    };
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    return {
      message: "I apologize, but I'm having trouble connecting to my thinking system right now. Could we try again in a moment?",
      mood: 'neutral'
    };
  }
}

function analyzeMood(message: string): string {
  const message_lower = message.toLowerCase();

  if (message_lower.includes('happy') || message_lower.includes('joy') || message_lower.includes('excited')) {
    return 'happy';
  } else if (message_lower.includes('calm') || message_lower.includes('peaceful') || message_lower.includes('relaxed')) {
    return 'calm';
  } else if (message_lower.includes('sad') || message_lower.includes('depressed') || message_lower.includes('unhappy')) {
    return 'sad';
  } else if (message_lower.includes('anxious') || message_lower.includes('worried') || message_lower.includes('nervous')) {
    return 'anxious';
  } else if (message_lower.includes('stress') || message_lower.includes('overwhelm') || message_lower.includes('pressure')) {
    return 'stressed';
  } else if (message_lower.includes('better') || message_lower.includes('improv') || message_lower.includes('progress')) {
    return 'improved';
  }

  return 'neutral';
}