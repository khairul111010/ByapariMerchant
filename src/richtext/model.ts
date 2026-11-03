export type TextBlock = { type: 'p' | 'h2' | 'h3' | 'blockquote'; text: string };
export type ListBlock = { type: 'ul' | 'ol'; items: string[] };
export type Block = TextBlock | ListBlock;

export const isList = (b: Block): b is ListBlock => b.type === 'ul' || b.type === 'ol';

export const SAFE_LINK = /^(https?:\/\/|mailto:|tel:)/i;

const escapeHtml = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

const decode = (s: string): string =>
  s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&');

/** Marker text -> allowed inline HTML. Escapes first, so nothing typed can become another tag. */
export function inlineToHtml(text: string): string {
  let h = escapeHtml(text);
  h = h.replace(/\[([^\]\n]+)\]\(([^)\s]+)\)/g, (_m, label: string, url: string) => {
    const raw = decode(url);
    return SAFE_LINK.test(raw) ? `<a href="${url}">${label}</a>` : label;
  });
  h = h.replace(/\*\*([^*\n]+?)\*\*/g, '<strong>$1</strong>');
  h = h.replace(/\*([^*\n]+?)\*/g, '<em>$1</em>');
  h = h.replace(/__([^_\n]+?)__/g, '<u>$1</u>');
  return h.replace(/\n/g, '<br>');
}

/** Allowed inline HTML -> marker text. Unknown tags are dropped, their text kept. */
export function inlineFromHtml(html: string): string {
  let t = html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<a\b[^>]*?\bhref\s*=\s*"([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, (_m, href: string, label: string) => {
      const url = decode(href);
      return SAFE_LINK.test(url) ? `[${label}](${url})` : label;
    })
    .replace(/<(strong|b)\b[^>]*>([\s\S]*?)<\/\1>/gi, '**$2**')
    .replace(/<(em|i)\b[^>]*>([\s\S]*?)<\/\1>/gi, '*$2*')
    .replace(/<u\b[^>]*>([\s\S]*?)<\/u>/gi, '__$1__');
  t = t.replace(/<[^>]+>/g, '');
  return decode(t).trim();
}

export function blocksToHtml(blocks: Block[]): string {
  return blocks
    .map((b) => {
      if (isList(b)) {
        const items = b.items.map((i) => i.trim()).filter(Boolean);
        return items.length ? `<${b.type}>${items.map((i) => `<li>${inlineToHtml(i)}</li>`).join('')}</${b.type}>` : '';
      }
      const text = b.text.trim();
      return text ? `<${b.type}>${inlineToHtml(text)}</${b.type}>` : '';
    })
    .join('');
}

export function htmlToBlocks(html: string | null | undefined): Block[] {
  if (!html || !html.trim()) {
    return [];
  }
  const blocks: Block[] = [];
  const re = /<(p|h2|h3|blockquote|ul|ol)\b[^>]*>([\s\S]*?)<\/\1>/gi;
  let last = 0;
  let m: RegExpExecArray | null;
  const loose = (s: string) => {
    const text = inlineFromHtml(s);
    if (text) {
      blocks.push({ type: 'p', text });
    }
  };
  while ((m = re.exec(html)) !== null) {
    loose(html.slice(last, m.index));
    last = m.index + m[0].length;
    const type = m[1].toLowerCase() as 'p' | 'h2' | 'h3' | 'blockquote' | 'ul' | 'ol';
    if (type === 'ul' || type === 'ol') {
      const items = [...m[2].matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi)].map((li) => inlineFromHtml(li[1])).filter(Boolean);
      blocks.push({ type, items });
    } else {
      blocks.push({ type, text: inlineFromHtml(m[2]) });
    }
  }
  loose(html.slice(last));
  return blocks;
}
