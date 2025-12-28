import logger from '../config/logger';
import { ChunkMetadata } from '../types';

interface ChunkingOptions {
  chunkSize?: number;
  overlap?: number;
  preserveMetadata?: boolean;
}

export class ChunkingService {
  private readonly DEFAULT_CHUNK_SIZE = 2000; // tokens (approximate)
  private readonly DEFAULT_OVERLAP = 200; // tokens (approximate)

  /**
   * Estimate token count (rough approximation: 1 token ≈ 4 characters)
   */
  private estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }

  /**
   * Split text into sentences
   */
  private splitIntoSentences(text: string): string[] {
    return text
      .split(/(?<=[.!?])\s+/)
      .map(s => s.trim())
      .filter(s => s.length > 0);
  }

  /**
   * Chunk content intelligently with metadata preservation
   */
  async chunkContent(
    text: string,
    metadata: ChunkMetadata = {},
    options: ChunkingOptions = {}
  ): Promise<Array<{ content: string; tokenCount: number; metadata: ChunkMetadata }>> {
    const chunkSize = options.chunkSize || this.DEFAULT_CHUNK_SIZE;
    const overlap = options.overlap || this.DEFAULT_OVERLAP;
    const preserveMetadata = options.preserveMetadata !== false;

    const chunks: Array<{ content: string; tokenCount: number; metadata: ChunkMetadata }> = [];
    const sentences = this.splitIntoSentences(text);

    let currentChunk: string[] = [];
    let currentTokenCount = 0;
    let chunkIndex = 0;

    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i];
      const sentenceTokens = this.estimateTokens(sentence);

      // If adding this sentence would exceed chunk size, finalize current chunk
      if (currentTokenCount + sentenceTokens > chunkSize && currentChunk.length > 0) {
        const chunkContent = currentChunk.join(' ');
        chunks.push({
          content: chunkContent,
          tokenCount: this.estimateTokens(chunkContent),
          metadata: preserveMetadata
            ? {
                ...metadata,
                chunkIndex,
                startSentence: i - currentChunk.length,
                endSentence: i - 1,
              }
            : { chunkIndex },
        });

        chunkIndex++;

        // Start new chunk with overlap
        if (overlap > 0) {
          const overlapSentences = currentChunk.slice(-Math.ceil(overlap / 50)); // Rough overlap calculation
          currentChunk = overlapSentences;
          currentTokenCount = this.estimateTokens(currentChunk.join(' '));
        } else {
          currentChunk = [];
          currentTokenCount = 0;
        }
      }

      currentChunk.push(sentence);
      currentTokenCount += sentenceTokens;
    }

    // Add remaining content as final chunk
    if (currentChunk.length > 0) {
      const chunkContent = currentChunk.join(' ');
      chunks.push({
        content: chunkContent,
        tokenCount: this.estimateTokens(chunkContent),
        metadata: preserveMetadata
          ? {
              ...metadata,
              chunkIndex,
              startSentence: sentences.length - currentChunk.length,
              endSentence: sentences.length - 1,
            }
          : { chunkIndex },
      });
    }

    logger.info(`Chunked content into ${chunks.length} chunks`);
    return chunks;
  }

  /**
   * Chunk content with page-aware metadata (for PDFs)
   */
  async chunkWithPageAwareness(
    _text: string,
    pageMetadata: Array<{ pageNumber: number; text: string }>,
    options: ChunkingOptions = {}
  ): Promise<Array<{ content: string; tokenCount: number; metadata: ChunkMetadata }>> {
    const allChunks: Array<{ content: string; tokenCount: number; metadata: ChunkMetadata }> = [];

    for (const page of pageMetadata) {
      const pageChunks = await this.chunkContent(
        page.text,
        { pageNumber: page.pageNumber },
        options
      );
      allChunks.push(...pageChunks);
    }

    return allChunks;
  }
}

export default new ChunkingService();
