import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { mediaSize } from '~/media-size';
import { createFakeVideoFile } from './helpers/create-fake-video-file';
import { createFakeImageFile } from './helpers/create-fake-image-file';
import { supportedImageFixtures } from './helpers/create-images';

function fixture(filename: string): string {
  return path.resolve(__dirname, 'fixtures', filename);
}

async function makeVideo(
  filename: string,
  width: number,
  height: number
): Promise<string> {
  const filepath = fixture(filename);
  if (fs.existsSync(filepath)) return filepath;
  await createFakeVideoFile(filepath, { width, height });
  return filepath;
}

async function makeImage(
  filename: string,
  width: number,
  height: number
): Promise<string> {
  const filepath = fixture(filename);
  if (fs.existsSync(filepath)) return filepath;
  await createFakeImageFile(filepath, { width, height });
  return filepath;
}

async function makeNonVideo(filename: string): Promise<string> {
  const filepath = fixture(filename);
  if (fs.existsSync(filepath)) return filepath;
  await fs.promises.writeFile(filepath, 'This is not a video file.\n');
  return filepath;
}

describe('media-size', () => {
  describe('images async', () => {
    for (const image of supportedImageFixtures) {
      describe(path.extname(image.filename), () => {
        it(`reads a ${image.width}x${image.height} file`, async () => {
          const filepath = await makeImage(image.filename, image.width, image.height);
          const dimensions = await mediaSize(filepath);

          assert.equal(dimensions.width, image.width);
          assert.equal(dimensions.height, image.height);
          assert.equal(dimensions.orientation, image.orientation);
        });
      });
    }
  });

  describe('videos', () => {
    describe('.mov', () => {
      it('reads a 640x360 file', async () => {
        const filepath = await makeVideo('fake.mov', 640, 360);
        const dimensions = await mediaSize(filepath);

        assert.equal(dimensions.width, 640);
        assert.equal(dimensions.height, 360);
        assert.equal(dimensions.orientation, 'landscape');
      });

      it('reads a square file', async () => {
        const filepath = await makeVideo('fake-square.mov', 512, 512);
        const dimensions = await mediaSize(filepath);

        assert.equal(dimensions.width, 512);
        assert.equal(dimensions.height, 512);
        assert.equal(dimensions.orientation, null);
      });
    });

    describe('.mp4', () => {
      it('reads a 1280x720 file', async () => {
        const filepath = await makeVideo('fake.mp4', 1280, 720);
        const dimensions = await mediaSize(filepath);

        assert.equal(dimensions.width, 1280);
        assert.equal(dimensions.height, 720);
        assert.equal(dimensions.orientation, 'landscape');
      });

      it('reads a 720x1280 file', async () => {
        const filepath = await makeVideo('fake-portrait.mp4', 720, 1280);
        const dimensions = await mediaSize(filepath);

        assert.equal(dimensions.width, 720);
        assert.equal(dimensions.height, 1280);
        assert.equal(dimensions.orientation, 'portrait');
      });
    });

    describe('.m4v', () => {
      it('reads a 426x240 file', async () => {
        const filepath = await makeVideo('fake.m4v', 426, 240);
        const dimensions = await mediaSize(filepath);

        assert.equal(dimensions.width, 426);
        assert.equal(dimensions.height, 240);
        assert.equal(dimensions.orientation, 'landscape');
      });
    });

    describe('.mkv', () => {
      it('reads a 1920x1080 file', async () => {
        const filepath = await makeVideo('fake.mkv', 1920, 1080);
        const dimensions = await mediaSize(filepath);

        assert.equal(dimensions.width, 1920);
        assert.equal(dimensions.height, 1080);
        assert.equal(dimensions.orientation, 'landscape');
      });
    });

    describe('.mpeg', () => {
      it('reads a 1440x1080 file', async () => {
        const filepath = await makeVideo('fake.mpeg', 1440, 1080);
        const dimensions = await mediaSize(filepath);

        assert.equal(dimensions.width, 1440);
        assert.equal(dimensions.height, 1080);
        assert.equal(dimensions.orientation, 'landscape');
      });
    });

    describe('.mpg', () => {
      it('reads a 720x576 file', async () => {
        const filepath = await makeVideo('fake.mpg', 720, 576);
        const dimensions = await mediaSize(filepath);

        assert.equal(dimensions.width, 720);
        assert.equal(dimensions.height, 576);
        assert.equal(dimensions.orientation, 'landscape');
      });
    });

    describe('.webm', () => {
      it('reads a 2560x1440 file', async () => {
        const filepath = await makeVideo('fake.webm', 2560, 1440);
        const dimensions = await mediaSize(filepath);

        assert.equal(dimensions.width, 2560);
        assert.equal(dimensions.height, 1440);
        assert.equal(dimensions.orientation, 'landscape');
      });
    });

    describe('.avi', () => {
      it('reads a 960x540 file', async () => {
        const filepath = await makeVideo('fake.avi', 960, 540);
        const dimensions = await mediaSize(filepath);

        assert.equal(dimensions.width, 960);
        assert.equal(dimensions.height, 540);
        assert.equal(dimensions.orientation, 'landscape');
      });
    });

    describe('.flv', () => {
      it('reads a 1024x576 file', async () => {
        const filepath = await makeVideo('fake.flv', 1024, 576);
        const dimensions = await mediaSize(filepath);

        assert.equal(dimensions.width, 1024);
        assert.equal(dimensions.height, 576);
        assert.equal(dimensions.orientation, 'landscape');
      });
    });

    describe('.3gp', () => {
      it('reads a 352x288 file', async () => {
        const filepath = await makeVideo('fake.3gp', 352, 288);
        const dimensions = await mediaSize(filepath);

        assert.equal(dimensions.width, 352);
        assert.equal(dimensions.height, 288);
        assert.equal(dimensions.orientation, 'landscape');
      });
    });

    describe('.3g2', () => {
      it('reads a 352x288 file', async () => {
        const filepath = await makeVideo('fake.3g2', 352, 288);
        const dimensions = await mediaSize(filepath);

        assert.equal(dimensions.width, 352);
        assert.equal(dimensions.height, 288);
        assert.equal(dimensions.orientation, 'landscape');
      });
    });

    describe('.ts', () => {
      it('reads a 1280x720 file', async () => {
        const filepath = await makeVideo('fake.ts', 1280, 720);
        const dimensions = await mediaSize(filepath);

        assert.equal(dimensions.width, 1280);
        assert.equal(dimensions.height, 720);
        assert.equal(dimensions.orientation, 'landscape');
      });
    });

    describe('.m2t', () => {
      it('reads a 1280x720 file', async () => {
        const filepath = await makeVideo('fake.m2t', 1280, 720);
        const dimensions = await mediaSize(filepath);

        assert.equal(dimensions.width, 1280);
        assert.equal(dimensions.height, 720);
        assert.equal(dimensions.orientation, 'landscape');
      });
    });

    describe('.m2ts', () => {
      it('reads a 1280x720 file', async () => {
        const filepath = await makeVideo('fake.m2ts', 1280, 720);
        const dimensions = await mediaSize(filepath);

        assert.equal(dimensions.width, 1280);
        assert.equal(dimensions.height, 720);
        assert.equal(dimensions.orientation, 'landscape');
      });
    });

    describe('.mts', () => {
      it('reads a 1280x720 file', async () => {
        const filepath = await makeVideo('fake.mts', 1280, 720);
        const dimensions = await mediaSize(filepath);

        assert.equal(dimensions.width, 1280);
        assert.equal(dimensions.height, 720);
        assert.equal(dimensions.orientation, 'landscape');
      });
    });
  });

  describe('unsupported extensions', () => {
    it('returns null for .txt files', async () => {
      const filepath = await makeNonVideo('fake.txt');
      assert.equal(await mediaSize(filepath), null, 'should return null for .txt files');
    });

    it('returns null for .json files', async () => {
      const filepath = await makeNonVideo('fake.json');
      assert.equal(await mediaSize(filepath), null, 'should return null for .json files');
    });

    it('returns null for .bin files', async () => {
      const filepath = await makeNonVideo('fake.bin');
      assert.equal(await mediaSize(filepath), null, 'should return null for .bin files');
    });

    it('returns null for .xyz files', async () => {
      const filepath = await makeNonVideo('fake.xyz');
      assert.equal(await mediaSize(filepath), null, 'should return null for .xyz files');
    });
  });
});
