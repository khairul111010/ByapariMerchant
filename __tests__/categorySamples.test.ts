import { ApiError, mapError } from '../src/api/errors';
import { errorMessage } from '../src/api/errorMessage';
import {
  categoriesSchema,
  categoryEnvelopeSchema,
  messageSchema,
} from '../src/api/schemas/catalogue';
import { flattenTree } from '../src/features/categories/tree';
import { categorySamples as s } from '../test/samples-categories';

const body = (k: string) => s[k] as Record<string, unknown>;

describe('category responses (real backend samples)', () => {
  it.each([
    'Create category (top level)',
    'Create subcategory',
    'Create category with image',
    'Update category (rename, hide)',
  ])('save response: %s', k =>
    expect(categoryEnvelopeSchema.safeParse(body(k)).success).toBe(true),
  );
  it('list before and after delete', () => {
    expect(
      categoriesSchema.safeParse(body('List categories BEFORE delete')).success,
    ).toBe(true);
    expect(
      categoriesSchema.safeParse(body('List categories AFTER delete')).success,
    ).toBe(true);
  });
  it('delete returns a fixed message', () => {
    expect(
      messageSchema.safeParse(
        body(
          'Delete a category that has 3 products and 1 subcategory (with 1 product)',
        ),
      ).success,
    ).toBe(true);
  });
});

describe('save responses from an older backend', () => {
  it('still accepts a save reply without position and products_count', () => {
    const {
      position: _p,
      products_count: _c,
      ...older
    } = body('Create category (top level)').data as Record<
      string,
      unknown
    > as Record<string, unknown>;
    expect(categoryEnvelopeSchema.safeParse({ data: older }).success).toBe(
      true,
    );
  });
  it('still rejects a reply missing the fields we rely on', () => {
    expect(categoryEnvelopeSchema.safeParse({ data: { id: 1 } }).success).toBe(
      false,
    );
  });
});

describe('validation and 404 handling', () => {
  it('maps the 422 field errors, including parent_id', () => {
    const e = mapError(422, body('Create category, validation errors'));
    expect(e.kind).toBe('validation');
    expect(e.fieldErrors.name[0]).toBe('The name field is required.');
    expect(e.fieldErrors.parent_id[0]).toBe(
      'A subcategory cannot itself be used as a parent category.',
    );
  });
  it('a parent-is-itself refusal is a validation error on parent_id', () => {
    const e = mapError(422, body('Update category, parent_id = itself'));
    expect(e.kind).toBe('validation');
    expect(e.fieldErrors.parent_id).toHaveLength(1);
  });
  it('a 404 never shows the raw server text (it names a PHP model)', () => {
    const t = ((k: string) => k) as never;
    const e = mapError(404, body('Update unknown category'));
    expect(e).toBeInstanceOf(ApiError);
    expect(e.kind).toBe('not_found');
    expect(errorMessage(e, t)).toBe('errors.not_found');
    expect(errorMessage(e, t)).not.toContain('App\\Models');
  });
});

describe('after a delete the tree still renders', () => {
  it('a promoted subcategory shows at the top level', () => {
    const after = categoriesSchema.parse(
      body('List categories AFTER delete'),
    ).data;
    expect(flattenTree(after).map(n => `${n.depth}:${n.category.id}`)).toEqual([
      '0:3',
      '0:2',
    ]);
  });
  it('before the delete, the subcategory sits under its parent', () => {
    const before = categoriesSchema.parse(
      body('List categories BEFORE delete'),
    ).data;
    expect(flattenTree(before).map(n => `${n.depth}:${n.category.id}`)).toEqual(
      ['0:3', '0:1', '1:2'],
    );
  });
});
