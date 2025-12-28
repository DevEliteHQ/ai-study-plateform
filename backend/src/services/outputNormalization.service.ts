import { NotionBlock, NotionPageStructure } from '../types';
export class OutputNormalizationService {
  /**
   * Convert LLM output to structured Notion blocks
   */
  normalizeToNotionBlocks(content: string): NotionBlock[] {
    const blocks: NotionBlock[] = [];
    const lines = content.split('\n').filter(line => line.trim());

    const currentParagraph: string[] = [];
    let inList = false;
    const listItems: string[] = [];

    for (const line of lines) {
      const trimmed = line.trim();

      // Headings
      if (trimmed.startsWith('# ')) {
        this.flushParagraph(blocks, currentParagraph);
        this.flushList(blocks, listItems);
        blocks.push({
          type: 'heading_1',
          heading_1: {
            rich_text: [{ type: 'text', text: { content: trimmed.substring(2) } }],
          },
        });
        continue;
      }

      if (trimmed.startsWith('## ')) {
        this.flushParagraph(blocks, currentParagraph);
        this.flushList(blocks, listItems);
        blocks.push({
          type: 'heading_2',
          heading_2: {
            rich_text: [{ type: 'text', text: { content: trimmed.substring(3) } }],
          },
        });
        continue;
      }

      if (trimmed.startsWith('### ')) {
        this.flushParagraph(blocks, currentParagraph);
        this.flushList(blocks, listItems);
        blocks.push({
          type: 'heading_3',
          heading_3: {
            rich_text: [{ type: 'text', text: { content: trimmed.substring(4) } }],
          },
        });
        continue;
      }

      // Bullet lists
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        this.flushParagraph(blocks, currentParagraph);
        if (!inList) {
          inList = true;
        }
        listItems.push(trimmed.substring(2));
        continue;
      }

      // Numbered lists
      if (/^\d+\.\s/.test(trimmed)) {
        this.flushParagraph(blocks, currentParagraph);
        if (!inList) {
          inList = true;
        }
        listItems.push(trimmed.replace(/^\d+\.\s/, ''));
        continue;
      }

      // Toggle blocks (if marked with >)
      if (trimmed.startsWith('> ')) {
        this.flushParagraph(blocks, currentParagraph);
        this.flushList(blocks, listItems);
        blocks.push({
          type: 'toggle',
          toggle: {
            rich_text: [{ type: 'text', text: { content: trimmed.substring(2) } }],
            children: [],
          },
        });
        continue;
      }

      // Callouts (if marked with [!])
      if (trimmed.startsWith('[!') && trimmed.includes(']')) {
        this.flushParagraph(blocks, currentParagraph);
        this.flushList(blocks, listItems);
        const match = trimmed.match(/^\[!(\w+)\]\s*(.+)$/);
        if (match) {
          const [, type, content] = match;
          blocks.push({
            type: 'callout',
            callout: {
              rich_text: [{ type: 'text', text: { content } }],
              icon: { emoji: this.getCalloutIcon(type) },
            },
          });
        }
        continue;
      }

      // Regular paragraph
      this.flushList(blocks, listItems);
      if (trimmed.length > 0) {
        currentParagraph.push(trimmed);
      }
    }

    // Flush remaining content
    this.flushParagraph(blocks, currentParagraph);
    this.flushList(blocks, listItems);

    return blocks;
  }

  private flushParagraph(blocks: NotionBlock[], paragraph: string[]): void {
    if (paragraph.length > 0) {
      blocks.push({
        type: 'paragraph',
        paragraph: {
          rich_text: [{ type: 'text', text: { content: paragraph.join(' ') } }],
        },
      });
      paragraph.length = 0;
    }
  }

  private flushList(blocks: NotionBlock[], items: string[]): void {
    if (items.length > 0) {
      blocks.push({
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: items.map(item => ({
            type: 'text',
            text: { content: item },
          })),
        },
      });
      items.length = 0;
    }
  }

  private getCalloutIcon(type: string): string {
    const icons: Record<string, string> = {
      note: '📝',
      tip: '💡',
      warning: '⚠️',
      important: '❗',
      info: 'ℹ️',
    };
    return icons[type.toLowerCase()] || '📝';
  }

  /**
   * Create Notion page structure
   */
  createNotionPageStructure(title: string, content: string): NotionPageStructure {
    const blocks = this.normalizeToNotionBlocks(content);

    return {
      title,
      blocks,
    };
  }
}

export default new OutputNormalizationService();
