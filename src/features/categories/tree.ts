import type { Category } from '../../api/schemas/catalogue';

export interface CategoryNode {
  category: Category;
  depth: 0 | 1;
}

/** Flat server list -> display order: each parent followed by its children (two levels only). */
export function flattenTree(list: Category[]): CategoryNode[] {
  const roots = list.filter(c => c.parent_id === null);
  const known = new Set(list.map(c => c.id));
  // A child whose parent is missing is shown at the top level rather than hidden.
  const orphans = list.filter(
    c => c.parent_id !== null && !known.has(c.parent_id),
  );
  const out: CategoryNode[] = [];
  for (const r of [...roots, ...orphans]) {
    out.push({ category: r, depth: 0 });
    for (const c of list.filter(x => x.parent_id === r.id)) {
      out.push({ category: c, depth: 1 });
    }
  }
  return out;
}

/**
 * The reorder endpoint takes the full new order of every category. Moving one
 * swaps it with its previous/next sibling (same parent) and keeps everything else.
 * Returns null when it cannot move that way.
 */
export function moveSibling(
  list: Category[],
  id: number,
  direction: 'up' | 'down',
): number[] | null {
  const item = list.find(c => c.id === id);
  if (!item) {
    return null;
  }
  const siblings = list.filter(c => c.parent_id === item.parent_id);
  const at = siblings.findIndex(c => c.id === id);
  const swapWith = siblings[direction === 'up' ? at - 1 : at + 1];
  if (!swapWith) {
    return null;
  }
  const ids = list.map(c => c.id);
  const a = ids.indexOf(id);
  const b = ids.indexOf(swapWith.id);
  [ids[a], ids[b]] = [ids[b], ids[a]];
  return ids;
}

/** Valid parents for a category: top-level ones, never itself, and never a parent if it has children. */
export function parentOptions(
  list: Category[],
  editingId: number | null,
): Category[] {
  const hasChildren =
    editingId !== null && list.some(c => c.parent_id === editingId);
  if (hasChildren) {
    return [];
  }
  return list.filter(c => c.parent_id === null && c.id !== editingId);
}
