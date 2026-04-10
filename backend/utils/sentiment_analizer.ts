import { google } from '@ai-sdk/google';
import { generateText, Output } from 'ai';
import { object, z } from 'zod';
import {Post} from '../models/Post.js';

export const analyzePostInBackground = async (postId: string, content: string) => {
  try {
    const { output } = await generateText({
      model: google('gemini-2.5-flash'),
      output: Output.object({
        schema: z.object({
            optimism: z.number().min(0).max(1),
            nsfw: z.number().min(0).max(1),
        }),
      }),
      system: `Score the blog post sentiment and safety. Respond only in JSON.
        - 0.1: Extremely Nihilistic. Focuses on total despair, inevitable failure, or the pointlessness of existence.
        - 0.2 - 0.3: Negative/Cynical. Focuses on problems, complaints, or a "doomer" outlook without any suggested solutions.
        - 0.4 - 0.5: Neutral/Objective. Reporting facts or events without an emotional lean, or a perfect balance of pros and cons.
        - 0.6 - 0.7: Positive/Hopeful. Generally upbeat, focuses on progress, small wins, or a constructive outlook.
        - 0.8 - 0.9: Highly Optimistic. Enthusiastic, motivational, and focuses on bright futures and massive opportunities.
        - 1.0: Peak Inspiration. Overwhelmingly positive, visionary, and empowering content.

        For NSFW:
        - 0.1: G-Rated / Family Friendly. Purely professional, educational, or wholesome content. No profanity or suggestive themes.
        - 0.2 - 0.3: Mild/PG. Contains very mild slang or polite medical discussion. Safe for a general audience.
        - 0.4 - 0.5: Moderate/PG-13. Contains moderate profanity, crude humor, or non-explicit romantic/suggestive themes. 
        - 0.6 - 0.7: Suggestive/Soft-NSFW. Contains heavy profanity, suggestive descriptions, or themes suitable only for mature audiences.
        - 0.8 - 0.9: Explicit. Contains graphic descriptions of violence, explicit sexual content, or severe profanity.
        - 1.0: Hardcore. Extreme graphic content that should be hidden behind a major warning or strictly filtered.

        ### RULES:
        1. You must only output a number from this set: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0].
        2. Evaluate based on TEXT content only.
        3. Be objective: "Educational" content about mature topics (like health) should be scored lower than "gratuitous" content.
        4. Do not provide any text or explanation; only the numerical score.
        `,
      prompt: content,
    });

    await Post.findByIdAndUpdate(postId, { 
      scores: output,
      isAnalyzed: true 
    });

    console.log(`Successfully scored post: ${postId} with scores:`, output);
  } catch (error) {
    console.error(`Background scoring failed for ${postId}:`, error);
  }
};
