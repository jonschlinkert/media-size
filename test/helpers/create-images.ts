import fs from 'node:fs';
import path from 'node:path';
import { createFakeImageFile } from './create-fake-image-file';

const dir = path.resolve(__dirname, '../fixtures');

type Fixture = {
  filename: string;
  width: number;
  height: number;
  orientation?: 'landscape' | 'portrait';
};

export const supportedImageFixtures: Fixture[] = [
  { filename: 'fake-image.avif', width: 320, height: 180 },
  { filename: 'fake-image.avifs', width: 320, height: 180 },
  { filename: 'fake-image.bmp', width: 320, height: 180 },
  { filename: 'fake-image.cur', width: 32, height: 32 },
  { filename: 'fake-image.dds', width: 320, height: 180 },
  { filename: 'fake-image.dib', width: 320, height: 180 },
  { filename: 'fake-image.gif', width: 320, height: 180, orientation: 'landscape' },
  { filename: 'fake-image.icb', width: 320, height: 180 },
  { filename: 'fake-image.ico', width: 32, height: 32 },
  { filename: 'fake-image.j2c', width: 320, height: 180 },
  { filename: 'fake-image.j2k', width: 320, height: 180 },
  { filename: 'fake-image.jfi', width: 320, height: 180 },
  { filename: 'fake-image.jfif', width: 320, height: 180 },
  { filename: 'fake-image.jif', width: 320, height: 180 },
  { filename: 'fake-image.jp2', width: 320, height: 180 },
  { filename: 'fake-image.jpc', width: 320, height: 180 },
  { filename: 'fake-image.jpe', width: 320, height: 180 },
  { filename: 'fake-image.jpeg', width: 320, height: 180 },
  { filename: 'fake-image.jpf', width: 320, height: 180 },
  { filename: 'fake-image.jpg', width: 320, height: 180 },
  { filename: 'fake-image.jpm', width: 320, height: 180 },
  { filename: 'fake-image.ktx', width: 320, height: 180 },
  { filename: 'fake-image.ktx2', width: 320, height: 180 },
  { filename: 'fake-image.mj2', width: 320, height: 180, orientation: 'landscape' },
  { filename: 'fake-image.pam', width: 320, height: 180 },
  { filename: 'fake-image.pbm', width: 320, height: 180 },
  { filename: 'fake-image.pfm', width: 320, height: 180 },
  { filename: 'fake-image.pgm', width: 320, height: 180 },
  { filename: 'fake-image.png', width: 320, height: 180 },
  { filename: 'fake-image.pnm', width: 320, height: 180 },
  { filename: 'fake-image.ppm', width: 320, height: 180 },
  { filename: 'fake-image.psd', width: 320, height: 180 },
  { filename: 'fake-image.svg', width: 320, height: 180 },
  { filename: 'fake-image.svgz', width: 320, height: 180 },
  { filename: 'fake-image.tga', width: 320, height: 180 },
  { filename: 'fake-image.tif', width: 320, height: 180 },
  { filename: 'fake-image.tiff', width: 320, height: 180 },
  { filename: 'fake-image.vda', width: 320, height: 180 },
  { filename: 'fake-image.vst', width: 320, height: 180 }
];

export async function createImages() {
  for (const image of supportedImageFixtures) {
    const filepath = path.join(dir, image.filename);
    if (fs.existsSync(filepath)) {
      continue;
    }

    await createFakeImageFile(filepath, {
      width: image.width,
      height: image.height
    });
  }
}
