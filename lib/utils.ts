import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Converts markdown text to clean HTML compatible with Tiptap.
 * If the string is already HTML (contains tags), it is returned as-is.
 */
export function ensureHtmlContent(raw: string): string {
  if (!raw || typeof raw !== 'string') return '<p></p>';
  const trimmed = raw.trim();
  
  // If already HTML
  if (trimmed.startsWith('<') && (trimmed.endsWith('>') || trimmed.includes('</'))) {
    return raw;
  }

  const lines = raw.split('\n');
  const result: string[] = [];
  let inTaskList = false;
  let inBulletList = false;
  let inNumberedList = false;
  let inCodeBlock = false;
  let codeBuffer: string[] = [];

  const closeOpenLists = () => {
    if (inTaskList) {
      result.push('</ul>');
      inTaskList = false;
    }
    if (inBulletList) {
      result.push('</ul>');
      inBulletList = false;
    }
    if (inNumberedList) {
      result.push('</ol>');
      inNumberedList = false;
    }
  };

  const formatInline = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code>$1</code>');
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();

    if (trimmedLine.startsWith('```')) {
      if (inCodeBlock) {
        closeOpenLists();
        result.push(`<pre><code>${codeBuffer.join('\n')}</code></pre>`);
        codeBuffer = [];
        inCodeBlock = false;
      } else {
        closeOpenLists();
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(line.replace(/</g, '&lt;').replace(/>/g, '&gt;'));
      continue;
    }

    if (!trimmedLine) {
      closeOpenLists();
      continue;
    }

    // Headings
    if (trimmedLine.startsWith('# ')) {
      closeOpenLists();
      result.push(`<h1>${formatInline(trimmedLine.slice(2))}</h1>`);
    } else if (trimmedLine.startsWith('## ')) {
      closeOpenLists();
      result.push(`<h2>${formatInline(trimmedLine.slice(3))}</h2>`);
    } else if (trimmedLine.startsWith('### ')) {
      closeOpenLists();
      result.push(`<h3>${formatInline(trimmedLine.slice(4))}</h3>`);
    } 
    // Task lists: - [ ] or - [x]
    else if (/^-\s*\[([ xX])\]\s*/.test(trimmedLine)) {
      if (inBulletList || inNumberedList) closeOpenLists();
      if (!inTaskList) {
        result.push('<ul data-type="taskList">');
        inTaskList = true;
      }
      const isChecked = trimmedLine.match(/^-\s*\[([xX])\]/) !== null;
      const taskText = trimmedLine.replace(/^-\s*\[([ xX])\]\s*/, '');
      result.push(`<li data-type="taskItem" data-checked="${isChecked}"><label><input type="checkbox" ${isChecked ? 'checked' : ''} /></label><div><p>${formatInline(taskText)}</p></div></li>`);
    }
    // Bullet lists: - or *
    else if (/^[-*]\s+/.test(trimmedLine)) {
      if (inTaskList || inNumberedList) closeOpenLists();
      if (!inBulletList) {
        result.push('<ul>');
        inBulletList = true;
      }
      const itemText = trimmedLine.replace(/^[-*]\s+/, '');
      result.push(`<li><p>${formatInline(itemText)}</p></li>`);
    }
    // Numbered lists: 1. 2.
    else if (/^\d+\.\s+/.test(trimmedLine)) {
      if (inTaskList || inBulletList) closeOpenLists();
      if (!inNumberedList) {
        result.push('<ol>');
        inNumberedList = true;
      }
      const itemText = trimmedLine.replace(/^\d+\.\s+/, '');
      result.push(`<li><p>${formatInline(itemText)}</p></li>`);
    }
    // Blockquote: >
    else if (trimmedLine.startsWith('> ')) {
      closeOpenLists();
      result.push(`<blockquote><p>${formatInline(trimmedLine.slice(2))}</p></blockquote>`);
    }
    // Divider: ---
    else if (trimmedLine === '---' || trimmedLine === '***') {
      closeOpenLists();
      result.push('<hr />');
    }
    // Standard paragraph
    else {
      closeOpenLists();
      result.push(`<p>${formatInline(trimmedLine)}</p>`);
    }
  }

  closeOpenLists();
  return result.join('');
}

/**
 * Converts Tiptap HTML into clean, well-formatted Markdown.
 */
export function htmlToMarkdown(html: string): string {
  if (!html) return '';

  if (typeof window !== 'undefined') {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const processNode = (node: Node): string => {
      if (node.nodeType === Node.TEXT_NODE) {
        return node.textContent || '';
      }

      if (node.nodeType !== Node.ELEMENT_NODE) {
        return '';
      }

      const el = node as HTMLElement;
      const tagName = el.tagName.toLowerCase();
      const childrenMarkdown = Array.from(el.childNodes).map(processNode).join('');

      switch (tagName) {
        case 'h1':
          return `# ${childrenMarkdown.trim()}\n\n`;
        case 'h2':
          return `## ${childrenMarkdown.trim()}\n\n`;
        case 'h3':
          return `### ${childrenMarkdown.trim()}\n\n`;
        case 'p':
          return `${childrenMarkdown.trim()}\n\n`;
        case 'strong':
        case 'b':
          return `**${childrenMarkdown}**`;
        case 'em':
        case 'i':
          return `*${childrenMarkdown}*`;
        case 's':
        case 'del':
        case 'strike':
          return `~~${childrenMarkdown}~~`;
        case 'code':
          if (el.parentElement?.tagName.toLowerCase() === 'pre') {
            return childrenMarkdown;
          }
          return `\`${childrenMarkdown}\``;
        case 'pre':
          return `\`\`\`\n${childrenMarkdown.trim()}\n\`\`\`\n\n`;
        case 'blockquote':
          return `> ${childrenMarkdown.trim().split('\n').join('\n> ')}\n\n`;
        case 'hr':
          return `---\n\n`;
        case 'img': {
          const src = el.getAttribute('src') || '';
          const alt = el.getAttribute('alt') || 'image';
          return `![${alt}](${src})\n\n`;
        }
        case 'a': {
          const href = el.getAttribute('href') || '#';
          return `[${childrenMarkdown}](${href})`;
        }
        case 'ul': {
          const isTaskList = el.getAttribute('data-type') === 'taskList';
          const items = Array.from(el.children).map((li) => {
            if (isTaskList || li.getAttribute('data-type') === 'taskItem') {
              const checked = 
                li.getAttribute('data-checked') === 'true' || 
                (li.querySelector('input[type="checkbox"]') as HTMLInputElement)?.checked;
              const textEl = li.querySelector('div') || li;
              const text = Array.from(textEl.childNodes)
                .filter(n => (n as HTMLElement).tagName?.toLowerCase() !== 'label')
                .map(processNode).join('').trim();
              return `- [${checked ? 'x' : ' '}] ${text}`;
            }
            return `- ${Array.from(li.childNodes).map(processNode).join('').trim()}`;
          });
          return `${items.join('\n')}\n\n`;
        }
        case 'ol': {
          const items = Array.from(el.children).map((li, idx) => {
            return `${idx + 1}. ${Array.from(li.childNodes).map(processNode).join('').trim()}`;
          });
          return `${items.join('\n')}\n\n`;
        }
        default:
          return childrenMarkdown;
      }
    };

    const markdown = Array.from(doc.body.childNodes)
      .map(processNode)
      .join('')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    return markdown;
  }

  // Fallback regex converter for server side
  return html
    .replace(/<h1>(.*?)<\/h1>/gi, '# $1\n\n')
    .replace(/<h2>(.*?)<\/h2>/gi, '## $1\n\n')
    .replace(/<h3>(.*?)<\/h3>/gi, '### $1\n\n')
    .replace(/<p>(.*?)<\/p>/gi, '$1\n\n')
    .replace(/<strong>(.*?)<\/strong>/gi, '**$1**')
    .replace(/<em>(.*?)<\/em>/gi, '*$1*')
    .replace(/<code>(.*?)<\/code>/gi, '`$1`')
    .replace(/<hr\s*\/?>/gi, '---\n\n')
    .replace(/<[^>]+>/g, '')
    .trim();
}

/**
 * Initiates browser download of markdown content.
 */
export function downloadMarkdownFile(title: string, content: string) {
  const sanitizedTitle = title.trim().replace(/[^a-zA-Z0-9_\-\s]/g, '') || 'document';
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${sanitizedTitle}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}


