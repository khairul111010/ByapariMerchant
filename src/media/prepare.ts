import ImageResizer from '@bam.tech/react-native-image-resizer';
import { launchCamera, launchImageLibrary, Asset } from 'react-native-image-picker';
import { fitWithin, LIMITS, MAX_EDGE, QUALITY_STEPS } from './fit';

export interface PreparedImage {
  uri: string;
  name: string;
  type: 'image/jpeg';
  size: number;
}

export class ImageTooLargeError extends Error {
  constructor() {
    super('image_too_large');
    this.name = 'ImageTooLargeError';
  }
}

/**
 * Resizes to a long edge of at most 1600 px as JPEG, starting at ~q82 and stepping
 * down only if the file is still over the server limit. Metadata (EXIF/GPS) is dropped.
 */
export async function prepareImage(asset: Pick<Asset, 'uri' | 'width' | 'height'>, limit: number = LIMITS.image): Promise<PreparedImage> {
  if (!asset.uri) {
    throw new Error('no_image');
  }
  const { width, height } = fitWithin(asset.width ?? MAX_EDGE, asset.height ?? MAX_EDGE);
  for (const quality of QUALITY_STEPS) {
    const out = await ImageResizer.createResizedImage(asset.uri, width, height, 'JPEG', quality, 0, undefined, false, {
      mode: 'contain',
      onlyScaleDown: true,
    });
    if (out.size <= limit) {
      return { uri: out.uri, name: `photo-${Date.now()}.jpg`, type: 'image/jpeg', size: out.size };
    }
  }
  throw new ImageTooLargeError();
}

export type PickSource = 'library' | 'camera';

/** Returns the chosen asset, or null if the user cancelled. */
export async function pickImage(source: PickSource): Promise<Asset | null> {
  const res =
    source === 'camera'
      ? await launchCamera({ mediaType: 'photo', saveToPhotos: false })
      : await launchImageLibrary({ mediaType: 'photo', selectionLimit: 1 });
  if (res.didCancel) {
    return null;
  }
  if (res.errorCode) {
    throw new Error(res.errorCode);
  }
  return res.assets?.[0] ?? null;
}
