import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';
import {Post} from '../models/Post.js';

export const analyzePostInBackground = async (postId: string, content: string) => {
  try {
    const { object } = await generateObject({
      model: google('gemini-2.0-flash-exp'),
      schema: z.object({
        optimism: z.number().min(0).max(1),
        nsfw: z.number().min(0).max(1),
      }),
      system: "Score the blog post sentiment and safety. Respond only in JSON.",
      prompt: content,
    });

    await Post.findByIdAndUpdate(postId, { 
      scores: object,
      isAnalyzed: true 
    });

    console.log(`Successfully scored post: ${postId}`);
  } catch (error) {
    console.error(`Background scoring failed for ${postId}:`, error);
  }
};