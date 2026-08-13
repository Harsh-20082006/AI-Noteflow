import { useMemo } from 'react';

interface MarkdownProps {
  content: string;
  className?: string;
}

/**
 * A lightweight, dependency-free markdown renderer supporting headings, bold,
 * italic, code blocks, inline code, lists, links, blockquotes, and paragraphs.
 * Output is safe: all user content is HTML-escaped before transformation.
 */
export function Markdown({ content, className }: MarkdownProps) {
  const html = useMemo(() => renderMarkdown(content), [content]);
  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderMarkdown(md: string): string {
  if (!md.trim()) return '<p class="text-slate-400 italic">Nothing to preview yet. Start writing your note on the left...</p>';

  const lines = md.split('\n');
  const htmlParts: string[] = [];
  let inCodeBlock = false;
  let codeBuffer: string[] = [];
  let listBuffer: string[] = [];
  let listType: 'ul' | 'ol' | null = null;

  function flushList() {
    if (listBuffer.length > 0 && listType) {
      const tag = listType;
      htmlParts.push(`<${tag}>${listBuffer.join('')}</${tag}>`);
      listBuffer = [];
      listType = null;
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code block fence
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        htmlParts.push(`<pre><code>${escapeHtml(codeBuffer.join('\n'))}</code></pre>`);
        codeBuffer = [];
        inCodeBlock = false;
      } else {
        flushList();
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      continue;
    }

    // Headings
    const headingMatch = line.match(/^(#{1,6})\s+(.*)/);
    if (headingMatch) {
      flushList();
      const level = headingMatch[1].length;
      const text = inlineFormat(headingMatch[2]);
      htmlParts.push(`<h${level}>${text}</h${level}>`);
      continue;
    }

    // Blockquote
    if (line.trim().startsWith('>')) {
      flushList();
      const text = inlineFormat(line.replace(/^\s*>\s?/, ''));
      htmlParts.push(`<blockquote>${text}</blockquote>`);
      continue;
    }

    // Ordered list
    const olMatch = line.match(/^\s*\d+\.\s+(.*)/);
    if (olMatch) {
      if (listType !== 'ol') flushList();
      listType = 'ol';
      listBuffer.push(`<li>${inlineFormat(olMatch[1])}</li>`);
      continue;
    }

    // Unordered list
    const ulMatch = line.match(/^\s*[-*]\s+(.*)/);
    if (ulMatch) {
      if (listType !== 'ul') flushList();
      listType = 'ul';
      listBuffer.push(`<li>${inlineFormat(ulMatch[1])}</li>`);
      continue;
    }

    // Horizontal rule
    if (line.trim() === '---' || line.trim() === '***') {
      flushList();
      htmlParts.push('<hr />');
      continue;
    }

    // Empty line
    if (line.trim() === '') {
      flushList();
      continue;
    }

    // Paragraph
    flushList();
    htmlParts.push(`<p>${inlineFormat(line)}</p>`);
  }

  // Flush remaining
  if (inCodeBlock && codeBuffer.length > 0) {
    htmlParts.push(`<pre><code>${escapeHtml(codeBuffer.join('\n'))}</code></pre>`);
  }
  flushList();

  return htmlParts.join('\n');
}

function inlineFormat(text: string): string {
  let result = escapeHtml(text);
  // Inline code
  result = result.replace(/`([^`]+)`/g, '<code>$1</code>');
  // Bold
  result = result.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  result = result.replace(/__([^_]+)__/g, '<strong>$1</strong>');
  // Italic
  result = result.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  result = result.replace(/_([^_]+)_/g, '<em>$1</em>');
  // Links
  result = result.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
  );
  return result;
}
