import ImageResizer from '@bam.tech/react-native-image-resizer';
import { ImageTooLargeError, prepareImage } from '../src/media/prepare';

const resize = ImageResizer.createResizedImage as jest.Mock;

describe('prepareImage', () => {
  beforeEach(() => resize.mockReset());

  it('resizes a large photo to a 1600px long edge as JPEG at q82 and drops metadata', async () => {
    resize.mockResolvedValue({ uri: 'file:///r.jpg', size: 400_000 });
    const out = await prepareImage({ uri: 'file:///big.jpg', width: 4000, height: 3000 });
    expect(resize).toHaveBeenCalledWith('file:///big.jpg', 1600, 1200, 'JPEG', 82, 0, undefined, false, {
      mode: 'contain',
      onlyScaleDown: true,
    });
    expect(out).toMatchObject({ uri: 'file:///r.jpg', type: 'image/jpeg', size: 400_000 });
  });

  it('steps quality down until the file fits the limit', async () => {
    resize
      .mockResolvedValueOnce({ uri: 'a', size: 6_000_000 })
      .mockResolvedValueOnce({ uri: 'b', size: 5_500_000 })
      .mockResolvedValueOnce({ uri: 'c', size: 4_000_000 });
    const out = await prepareImage({ uri: 'x', width: 4000, height: 3000 });
    expect(out.uri).toBe('c');
    expect(resize.mock.calls.map((c) => c[4])).toEqual([82, 70, 58]);
  });

  it('gives up with a clear error if it never fits', async () => {
    resize.mockResolvedValue({ uri: 'a', size: 9_000_000 });
    await expect(prepareImage({ uri: 'x', width: 4000, height: 3000 })).rejects.toBeInstanceOf(ImageTooLargeError);
  });

  it('uses the smaller logo limit when asked', async () => {
    resize.mockResolvedValue({ uri: 'a', size: 3_000_000 });
    await expect(prepareImage({ uri: 'x', width: 100, height: 100 }, 2 * 1024 * 1024)).rejects.toBeInstanceOf(ImageTooLargeError);
  });
});
