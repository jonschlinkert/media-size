import { readFile } from 'node:fs/promises';
import { extname } from 'node:path';
import { promisify } from 'node:util';
import { gunzip } from 'node:zlib';
import { imageSize } from 'image-size';
import { isVideoFile, videoRegex, videoSize } from 'video-size';
import { createExtRegex } from '~/regex-trie';

const gunzipAsync = promisify(gunzip);

// - jpg type expands to jpg, jpeg, jpe, jfif, jif, jfi
// - tiff type expands to tif, tiff
// - heif type expands to heif, heifs, heic, heics
// - pnm type expands to pnm, pbm, pgm, ppm, pam, pfm
// - ktx type expands to ktx, ktx2

export const IMAGE_EXTS = new Set([
  'avif',
  'avifs',
  'bmp',
  'cur',
  'dds',
  'dib',
  'gif',
  'heic',
  'heics',
  'heif',
  'heifs',
  'icb',
  'icns',
  'ico',
  'j2c',
  'j2k',
  'jfi',
  'jfif',
  'jif',
  'jp2',
  'jpc',
  'jpe',
  'jpeg',
  'jpf',
  'jpg',
  'jpm',
  'jxl',
  'ktx',
  'ktx2',
  'mj2',
  'pam',
  'pbm',
  'pfm',
  'pgm',
  'png',
  'pnm',
  'ppm',
  'psd',
  'svg',
  'svgz',
  'tga',
  'tif',
  'tiff',
  'vda',
  'vst',
  'webp'
]);

export const imageRegex = createExtRegex([...IMAGE_EXTS]);

export async function mediaSize(filepath: string) {
  if (isVideoFile(filepath)) {
    const { width, height, orientation } = await videoSize(filepath);

    return {
      width,
      height,
      orientation
    };
  };

  if (imageRegex.test(filepath)) {
    const input = await readFile(filepath);
    const { width, height, orientation } = extname(filepath).toLowerCase() === '.svgz'
      ? imageSize(await gunzipAsync(input))
      : imageSize(input);

    return {
      width,
      height,
      orientation
    };
  }

  return null;
}
