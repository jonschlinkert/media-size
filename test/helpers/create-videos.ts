import fs from 'node:fs';
import path from 'node:path';
import { writeFile } from 'node:fs/promises';
import { createFakeVideoFile } from './create-fake-video-file';

const dir = path.resolve(__dirname, '../fixtures');

type Fixture = {
  filename: string;
  width: number;
  height: number;
  supported: boolean;
};

const fixtures: Fixture[] = [
  { filename: 'fake-160x90.mp4', width: 160, height: 90, supported: true },
  { filename: 'fake-320x180.mov', width: 320, height: 180, supported: true },
  { filename: 'fake-426x240.m4v', width: 426, height: 240, supported: true },
  { filename: 'fake-640x360.mp4', width: 640, height: 360, supported: true },
  { filename: 'fake-854x480.mov', width: 854, height: 480, supported: true },
  { filename: 'fake-1280x720.mp4', width: 1280, height: 720, supported: true },
  { filename: 'fake-1920x1080.mkv', width: 1920, height: 1080, supported: true },
  { filename: 'fake-2560x1440.webm', width: 2560, height: 1440, supported: true },
  { filename: 'fake-3840x2160.mp4', width: 3840, height: 2160, supported: true },
  { filename: 'fake-square-512x512.mov', width: 512, height: 512, supported: true },
  { filename: 'fake-portrait-720x1280.mp4', width: 720, height: 1280, supported: true },
  { filename: 'fake-ultrawide-2560x1080.mkv', width: 2560, height: 1080, supported: true },
  { filename: 'fake-avi.avi', width: 960, height: 540, supported: true },
  { filename: 'fake-flv.flv', width: 1024, height: 576, supported: true },
  { filename: 'fake-mpeg.mpeg', width: 1440, height: 1080, supported: true },
  { filename: 'fake-mpg.mpg', width: 720, height: 576, supported: true },
  { filename: 'fake-ts.ts', width: 1280, height: 720, supported: true },
  { filename: 'fake-3gp.3gp', width: 352, height: 288, supported: true },
  { filename: 'fake-ogv.ogv', width: 800, height: 450, supported: true },
  { filename: 'fake-wmv.wmv', width: 640, height: 480, supported: true },
  { filename: 'fake-asf.asf', width: 1920, height: 800, supported: true },
  { filename: 'fake-unsupported.txt', width: 1280, height: 720, supported: false },
  { filename: 'fake-unsupported.json', width: 1920, height: 1080, supported: false },
  { filename: 'fake-unsupported.png', width: 640, height: 360, supported: false },
  { filename: 'fake-unsupported.xyz', width: 854, height: 480, supported: false }
];

export const supportedVideoFixtures = fixtures.filter(
  fixture => fixture.supported
);

export const unsupportedVideoFixtures = fixtures.filter(
  fixture => !fixture.supported
);

export async function createVideos() {
  for (const video of fixtures) {
    const filepath = path.join(dir, video.filename);
    if (fs.existsSync(filepath)) {
      continue;
    }

    if (video.supported) {
      await createFakeVideoFile(filepath, {
        width: video.width,
        height: video.height
      });
      continue;
    }

    await writeFile(
      filepath,
      [
        'This is not a video file.',
        `filename=${video.filename}`,
        `size=${video.width}x${video.height}`
      ].join('\n')
    );
  }
}
