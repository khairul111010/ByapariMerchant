import { blocksToHtml, htmlToBlocks, inlineToHtml } from '../src/richtext/model';

const ALLOWED = new Set(['p', 'br', 'strong', 'em', 'u', 'h2', 'h3', 'ul', 'ol', 'li', 'blockquote', 'a']);
const tagsIn = (html: string) => [...html.matchAll(/<\/?([a-z0-9]+)/gi)].map((m) => m[1].toLowerCase());

describe('inlineToHtml', () => {
  it('renders markers as the allowed tags', () => {
    expect(inlineToHtml('**bold** *it* __under__')).toBe('<strong>bold</strong> <em>it</em> <u>under</u>');
  });
  it('turns newlines into <br>', () => {
    expect(inlineToHtml('a\nb')).toBe('a<br>b');
  });
  it('escapes anything that looks like markup', () => {
    const h = inlineToHtml('<script>alert(1)</script> <img src=x onerror=1> & "q"');
    expect(h).not.toContain('<script');
    expect(h).not.toContain('<img');
    expect(h).toContain('&lt;script&gt;');
    expect(h).toContain('&amp;');
  });
  it('allows http, https, mailto and tel links with only href', () => {
    expect(inlineToHtml('[shop](https://a.com/x?y=1&z=2)')).toBe('<a href="https://a.com/x?y=1&amp;z=2">shop</a>');
    expect(inlineToHtml('[mail](mailto:a@b.com)')).toContain('<a href="mailto:a@b.com">');
    expect(inlineToHtml('[call](tel:01700000000)')).toContain('<a href="tel:01700000000">');
  });
  it('drops javascript: and data: links but keeps the text', () => {
    expect(inlineToHtml('[x](javascript:alert(1))')).not.toContain('<a');
    expect(inlineToHtml('[x](JaVaScRiPt:alert(1))')).not.toContain('<a');
    expect(inlineToHtml('[x](data:text/html;base64,AAAA)')).toBe('x');
  });
  it('cannot break out of the href attribute', () => {
    const h = inlineToHtml('[x](https://a.com/"onmouseover="alert(1))');
    // The tag keeps exactly one intact href; the quote is escaped, so no extra attribute can start.
    const attrs = [...h.matchAll(/<a ([^>]*)>/g)].map((m) => m[1]);
    expect(attrs).toHaveLength(1);
    expect(attrs[0]).toMatch(/^href="[^"]*"$/);
  });
});

describe('blocksToHtml', () => {
  it('serialises every block type and skips empty ones', () => {
    const html = blocksToHtml([
      { type: 'h2', text: 'Title' },
      { type: 'p', text: 'Hello **world**' },
      { type: 'p', text: '   ' },
      { type: 'ul', items: ['a', '', 'b'] },
      { type: 'ol', items: ['one'] },
      { type: 'blockquote', text: 'quote' },
    ]);
    expect(html).toBe('<h2>Title</h2><p>Hello <strong>world</strong></p><ul><li>a</li><li>b</li></ul><ol><li>one</li></ol><blockquote>quote</blockquote>');
  });
  it('only ever emits allowlisted tags, whatever is typed', () => {
    const html = blocksToHtml([
      { type: 'p', text: '<iframe src=x></iframe><style>*{}</style> **b** [l](https://x.com)' },
      { type: 'ul', items: ['<b onclick=1>x</b>'] },
    ]);
    expect(tagsIn(html).every((t) => ALLOWED.has(t))).toBe(true);
  });
});

describe('htmlToBlocks (loading what the server stored)', () => {
  it('parses the sample description', () => {
    expect(htmlToBlocks('<p>Great <strong>sound</strong> quality.</p>')).toEqual([{ type: 'p', text: 'Great **sound** quality.' }]);
  });
  it('round-trips the allowed subset', () => {
    const html = '<h2>T</h2><p>a <em>b</em> <u>c</u><br>d</p><ul><li>x</li><li>y</li></ul><ol><li>1</li></ol><blockquote>q</blockquote><p><a href="https://a.com">go</a></p>';
    expect(blocksToHtml(htmlToBlocks(html))).toBe(html);
  });
  it('treats bare text as a paragraph and handles empty input', () => {
    expect(htmlToBlocks('just text')).toEqual([{ type: 'p', text: 'just text' }]);
    expect(htmlToBlocks(null)).toEqual([]);
    expect(htmlToBlocks('  ')).toEqual([]);
  });
  it('maps <b> and <i> to the same markers', () => {
    expect(htmlToBlocks('<p><b>x</b> <i>y</i></p>')).toEqual([{ type: 'p', text: '**x** *y*' }]);
  });
  it('decodes entities so editing does not double-escape', () => {
    const blocks = htmlToBlocks('<p>Tom &amp; Jerry &lt;3</p>');
    expect(blocks).toEqual([{ type: 'p', text: 'Tom & Jerry <3' }]);
    expect(blocksToHtml(blocks)).toBe('<p>Tom &amp; Jerry &lt;3</p>');
  });
});
