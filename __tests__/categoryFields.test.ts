import { categoryFields } from '../src/features/categories/api';

const v = { name: ' Electronics ', parentId: null, description: '  ', isActive: true };

describe('categoryFields', () => {
  it('sends every required field and trims', () => {
    expect(categoryFields(v, false)).toEqual({ name: 'Electronics', parent_id: '', description: '', is_active: '1' });
  });
  it('sends the parent id as a string, and an empty string to make a category top-level', () => {
    expect(categoryFields({ ...v, parentId: 7 }, false).parent_id).toBe('7');
    expect(categoryFields({ ...v, parentId: null }, false).parent_id).toBe('');
  });
  it('encodes the active flag as 1/0 for multipart', () => {
    expect(categoryFields({ ...v, isActive: false }, false).is_active).toBe('0');
  });
  it('adds remove_image only when asked', () => {
    expect(categoryFields(v, false)).not.toHaveProperty('remove_image');
    expect(categoryFields(v, true).remove_image).toBe('1');
  });
});
