import OpenAI from 'openai';
import logger from '../config/logger';
import { LLMResponse } from '../types';

export class LLMExecutionService {
  private openai: OpenAI;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not set');
    }

    this.openai = new OpenAI({
      apiKey,
    });
  }

  /**
   * Process a single chunk with LLM
   */
  async processChunk(
    chunk: string,
    prompt: string,
    metadata?: Record<string, any>
  ): Promise<LLMResponse> {
    try {
      const systemPrompt = `You are an expert educational content transformer. Your role is to transform raw learning material into structured, goal-oriented study outputs.

Guidelines:
- Be accurate and factual
- If information is not in the source, state "Not found in source"
- Maintain clear structure
- Cite sources when possible
- Avoid hallucinations`;

      const userPrompt = `${prompt}\n\n## Content to Process:\n${chunk}`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3,
        max_tokens: 2000,
      });

      const content = response.choices[0]?.message?.content || '';

      return {
        content,
        citations: metadata ? [`Chunk ${metadata.chunkIndex || 'unknown'}`] : undefined,
      };
    } catch (error) {
      logger.error('LLM processing failed:', error);
      throw new Error(
        `LLM processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Process multiple chunks and synthesize
   */
  async processChunks(
    chunks: Array<{ content: string; metadata?: Record<string, any> }>,
    prompt: string
  ): Promise<LLMResponse> {
    try {
      // Process chunks in parallel (with rate limiting consideration)
      const chunkPromises = chunks.map(chunk =>
        this.processChunk(chunk.content, prompt, chunk.metadata)
      );
      const chunkResults = await Promise.all(chunkPromises);

      // Synthesize all results
      const synthesizedContent = await this.synthesize(
        chunkResults.map(r => r.content),
        prompt
      );

      return {
        content: synthesizedContent,
        citations: chunkResults.flatMap(r => r.citations || []),
      };
    } catch (error) {
      logger.error('Chunk processing failed:', error);
      throw error;
    }
  }

  /**
   * Synthesize multiple partial outputs into final output
   */
  private async synthesize(partialOutputs: string[], originalPrompt: string): Promise<string> {
    const synthesisPrompt = `You are synthesizing multiple partial outputs into a cohesive final output.

Original task: ${originalPrompt}

## Partial Outputs:
${partialOutputs.map((out, idx) => `\n### Part ${idx + 1}:\n${out}`).join('\n')}

## Task:
Synthesize these partial outputs into a single, well-structured, coherent final output. Remove redundancies, maintain logical flow, and ensure completeness.`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content:
              'You are an expert at synthesizing and organizing information into coherent, structured outputs.',
          },
          { role: 'user', content: synthesisPrompt },
        ],
        temperature: 0.3,
        max_tokens: 4000,
      });

      return response.choices[0]?.message?.content || '';
    } catch (error) {
      logger.error('Synthesis failed:', error);
      // Fallback: concatenate with separator
      return partialOutputs.join('\n\n---\n\n');
    }
  }
}

export default new LLMExecutionService();
