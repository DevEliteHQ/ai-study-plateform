import { Client } from '@notionhq/client';
import logger from '../config/logger';
import { NotionPageStructure } from '../types';

export class NotionPublishingService {
  private notion: Client;
  private databaseId: string;

  constructor() {
    const apiKey = process.env.NOTION_API_KEY;
    if (!apiKey) {
      throw new Error('NOTION_API_KEY is not set');
    }

    this.databaseId = process.env.NOTION_DATABASE_ID || '';
    this.notion = new Client({ auth: apiKey });
  }

  /**
   * Create a page in Notion database
   */
  async createPage(
    structure: NotionPageStructure,
    parentPageId?: string
  ): Promise<{
    pageId: string;
    url: string;
  }> {
    try {
      // Create the page
      const pageResponse = await this.notion.pages.create({
        parent: parentPageId ? { page_id: parentPageId } : { database_id: this.databaseId },
        properties: {
          title: {
            title: [
              {
                text: {
                  content: structure.title,
                },
              },
            ],
          },
        },
        children: structure.blocks as unknown as any,
      });

      const pageId = pageResponse.id;
      const url = (pageResponse as any).url || `https://notion.so/${pageId.replace(/-/g, '')}`;

      logger.info(`Created Notion page: ${pageId}`);

      return { pageId, url };
    } catch (error) {
      logger.error('Failed to create Notion page:', error);
      throw new Error(
        `Notion publishing failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Create a parent page and child pages
   */
  async createPageHierarchy(
    parentTitle: string,
    children: Array<{ title: string; blocks: any[] }>
  ): Promise<{
    parentPageId: string;
    parentUrl: string;
    children: Array<{ pageId: string; url: string }>;
  }> {
    try {
      // Create parent page
      const parentPage = await this.notion.pages.create({
        parent: { database_id: this.databaseId },
        properties: {
          title: {
            title: [
              {
                text: {
                  content: parentTitle,
                },
              },
            ],
          },
        },
      });

      const parentPageId = parentPage.id;
      const parentUrl =
        (parentPage as any).url || `https://notion.so/${parentPageId.replace(/-/g, '')}`;

      // Create child pages
      const childPages = await Promise.all(
        children.map(async child => {
          const childPage = await this.notion.pages.create({
            parent: { page_id: parentPageId },
            properties: {
              title: {
                title: [
                  {
                    text: {
                      content: child.title,
                    },
                  },
                ],
              },
            },
            children: child.blocks,
          });

          return {
            pageId: childPage.id,
            url: (childPage as any).url || `https://notion.so/${childPage.id.replace(/-/g, '')}`,
          };
        })
      );

      logger.info(
        `Created Notion page hierarchy: ${parentPageId} with ${childPages.length} children`
      );

      return {
        parentPageId,
        parentUrl,
        children: childPages,
      };
    } catch (error) {
      logger.error('Failed to create Notion page hierarchy:', error);
      throw error;
    }
  }

  /**
   * Update an existing page
   */
  async updatePage(pageId: string, blocks: any[]): Promise<void> {
    try {
      // Notion API requires appending blocks separately
      await this.notion.blocks.children.append({
        block_id: pageId,
        children: blocks,
      });

      logger.info(`Updated Notion page: ${pageId}`);
    } catch (error) {
      logger.error('Failed to update Notion page:', error);
      throw error;
    }
  }
}

export default new NotionPublishingService();
