import type { Category } from '../src/api/schemas/catalogue';
import { flattenTree, moveSibling, parentOptions } from '../src/features/categories/tree';

const cat = (id: number, parent_id: number | null, name = `c${id}`): Category => ({
  id, parent_id, name, slug: name, description: null, position: 0, is_active: true, image: null, products_count: 0,
});

// Server order: A(1), its children a1(3) a2(4), B(2), its child b1(5)
const list = [cat(1, null), cat(3, 1), cat(4, 1), cat(2, null), cat(5, 2)];

describe('flattenTree', () => {
  it('puts each parent before its children, two levels only', () => {
    expect(flattenTree(list).map((n) => `${n.depth}:${n.category.id}`)).toEqual(['0:1', '1:3', '1:4', '0:2', '1:5']);
  });
  it('shows a child with a missing parent at the top level instead of hiding it', () => {
    const nodes = flattenTree([cat(1, null), cat(9, 77)]);
    expect(nodes.map((n) => n.category.id)).toEqual([1, 9]);
    expect(nodes[1].depth).toBe(0);
  });
});

describe('moveSibling', () => {
  it('swaps with the next sibling and sends the full order', () => {
    expect(moveSibling(list, 1, 'down')).toEqual([2, 3, 4, 1, 5]);
  });
  it('moves children only among siblings', () => {
    expect(moveSibling(list, 4, 'up')).toEqual([1, 4, 3, 2, 5]);
    expect(moveSibling(list, 3, 'up')).toBeNull();
    expect(moveSibling(list, 4, 'down')).toBeNull();
  });
  it('returns null at the edges and for unknown ids', () => {
    expect(moveSibling(list, 1, 'up')).toBeNull();
    expect(moveSibling(list, 2, 'down')).toBeNull();
    expect(moveSibling(list, 99, 'up')).toBeNull();
  });
  it('always lists every category exactly once', () => {
    const ids = moveSibling(list, 1, 'down')!;
    expect([...ids].sort()).toEqual(list.map((c) => c.id).sort());
  });
});

describe('parentOptions', () => {
  it('offers only top-level categories, not itself', () => {
    const flat = [cat(1, null), cat(2, null), cat(3, 2)];
    expect(parentOptions(flat, 1).map((c) => c.id)).toEqual([2]);
    expect(parentOptions(flat, null).map((c) => c.id)).toEqual([1, 2]);
    expect(parentOptions(flat, 3).map((c) => c.id)).toEqual([1, 2]);
  });
  it('offers nothing to a category that has children (only 2 levels allowed)', () => {
    expect(parentOptions(list, 1)).toEqual([]);
    expect(parentOptions([cat(1, null), cat(3, 1)], 1)).toEqual([]);
  });
});
