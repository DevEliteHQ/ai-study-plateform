import pdfParse from 'pdf-parse';
import * as cheerio from 'cheerio';
import { chromium } from 'playwright';
import fs from 'fs/promises';
import logger from '../config/logger';
import { DocumentType } from '@prisma/client';

export class ContentExtractionService {
  /**
   * Extract text from PDF file
   */
  async extractFromPDF(filePath: string): Promise<{
    text: string;
    metadata: {
      pages: number;
      info: any;
    };
  }> {
    try {
      const dataBuffer = await fs.readFile(filePath);
      const data = await pdfParse(dataBuffer);

      return {
        text: data.text,
        metadata: {
          pages: data.numpages,
          info: data.info,
        },
      };
    } catch (error) {
      logger.error('PDF extraction failed:', error);
      throw new Error(
        `Failed to extract PDF content: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Extract text from URL using Playwright
   */
  async extractFromURL(url: string): Promise<{
    text: string;
    metadata: {
      title: string;
      url: string;
      description?: string;
    };
  }> {
    let browser;
    try {
      browser = await chromium.launch();
      const page = await browser.newPage();
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

      const content = await page.content();
      const $ = cheerio.load(content);

      // Remove script and style elements
      $('script, style, nav, footer, header, aside').remove();

      const text = $('body').text().replace(/\s+/g, ' ').trim();
      const title = $('title').text() || page.url();
      const description = $('meta[name="description"]').attr('content') || undefined;

      return {
        text,
        metadata: {
          title,
          url: page.url(),
          description,
        },
      };
    } catch (error) {
      logger.error('URL extraction failed:', error);
      throw new Error(
        `Failed to extract URL content: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  /**
   * Extract text from plain text input
   */
  async extractFromText(text: string): Promise<{
    text: string;
    metadata: Record<string, any>;
  }> {
    return {
      text: text.trim(),
      metadata: {},
    };
  }

  /**
   * Main extraction method that routes to appropriate extractor
   */
  async extract(
    type: DocumentType,
    source: string
  ): Promise<{
    text: string;
    metadata: Record<string, any>;
  }> {
    switch (type) {
      case 'PDF':
        return this.extractFromPDF(source);
      case 'URL':
        return this.extractFromURL(source);
      case 'TEXT':
        return this.extractFromText(source);
      default:
        throw new Error(`Unsupported document type: ${type}`);
    }
  }
}

export default new ContentExtractionService();
