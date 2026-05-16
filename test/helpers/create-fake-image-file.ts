import { spawn } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, extname } from 'node:path';
import { gzip } from 'node:zlib';
import { promisify } from 'node:util';

const gzipAsync = promisify(gzip);

export type CreateFakeImageFileOptions = {
  width: number;
  height: number;
  color?: string;
};

function runFfmpeg(args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn('ffmpeg', args, {
      stdio: ['ignore', 'ignore', 'pipe']
    });

    let stderr = '';
    proc.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    proc.on('error', reject);
    proc.on('close', (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(stderr || `ffmpeg exited with code ${code}`));
    });
  });
}

function getOutputArgs(filepath: string): string[] {
  const ext = extname(filepath).toLowerCase();

  switch (ext) {
    case '.avif':
    case '.avifs':
      return ['-frames:v', '1', '-c:v', 'libsvtav1', '-pix_fmt', 'yuv420p', '-f', 'avif'];
    case '.bmp':
    case '.dib':
      return ['-frames:v', '1', '-c:v', 'bmp', '-f', 'image2'];
    case '.gif':
      return ['-frames:v', '1', '-c:v', 'gif', '-f', 'image2'];
    case '.ico':
    case '.cur':
      return ['-frames:v', '1', '-c:v', 'bmp', '-f', 'ico'];
    case '.j2c':
    case '.j2k':
    case '.jpc':
      return ['-frames:v', '1', '-c:v', 'jpeg2000', '-f', 'image2'];
    case '.jp2':
    case '.jpf':
    case '.jpm':
    case '.mj2':
      return ['-frames:v', '1', '-c:v', 'jpeg2000', '-f', 'image2'];
    case '.jfi':
    case '.jfif':
    case '.jif':
    case '.jpe':
    case '.jpeg':
    case '.jpg':
      return ['-frames:v', '1', '-c:v', 'mjpeg', '-f', 'image2'];
    case '.pam':
      return ['-frames:v', '1', '-c:v', 'pam', '-f', 'image2'];
    case '.pbm':
      return ['-frames:v', '1', '-c:v', 'pbm', '-f', 'image2'];
    case '.pfm':
      return ['-frames:v', '1', '-c:v', 'pfm', '-f', 'image2'];
    case '.pgm':
      return ['-frames:v', '1', '-c:v', 'pgm', '-f', 'image2'];
    case '.pnm':
    case '.ppm':
      return ['-frames:v', '1', '-c:v', 'ppm', '-f', 'image2'];
    case '.png':
      return ['-frames:v', '1', '-c:v', 'png', '-f', 'image2'];
    case '.tga':
    case '.icb':
    case '.vda':
    case '.vst':
      return ['-frames:v', '1', '-c:v', 'targa', '-f', 'image2'];
    case '.tif':
    case '.tiff':
      return ['-frames:v', '1', '-c:v', 'tiff', '-f', 'image2'];
    case '.webp':
      return ['-frames:v', '1', '-c:v', 'libwebp', '-lossless', '1', '-f', 'webp'];
    default:
      throw new Error(`Unsupported fake image extension: ${ext}`);
  }
}

async function writeSvg(filepath: string, options: CreateFakeImageFileOptions): Promise<void> {
  const { width, height, color = 'black' } = options;
  const svg = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`,
    `<rect width="${width}" height="${height}" fill="${color}"/>`,
    '</svg>',
    ''
  ].join('\n');

  if (extname(filepath).toLowerCase() === '.svgz') {
    await writeFile(filepath, await gzipAsync(svg));
    return;
  }

  await writeFile(filepath, svg);
}

async function writeTiff(filepath: string, options: CreateFakeImageFileOptions): Promise<void> {
  const { width, height } = options;
  const bytesPerPixel = 3;
  const entries = [
    [256, 4, 1, width],
    [257, 4, 1, height],
    [258, 3, 3, 122],
    [259, 3, 1, 1],
    [262, 3, 1, 2],
    [273, 4, 1, 128],
    [277, 3, 1, 3],
    [278, 4, 1, height],
    [279, 4, 1, width * height * bytesPerPixel]
  ];
  const ifdLength = 2 + entries.length * 12 + 4;
  const bitsPerSampleOffset = 8 + ifdLength;
  const pixelOffset = bitsPerSampleOffset + 6;
  const buffer = Buffer.alloc(pixelOffset + width * height * bytesPerPixel);

  buffer.write('II', 0, 'ascii');
  buffer.writeUInt16LE(42, 2);
  buffer.writeUInt32LE(8, 4);
  buffer.writeUInt16LE(entries.length, 8);

  entries.forEach(([tag, type, count, value], index) => {
    const offset = 10 + index * 12;
    buffer.writeUInt16LE(tag, offset);
    buffer.writeUInt16LE(type, offset + 2);
    buffer.writeUInt32LE(count, offset + 4);
    buffer.writeUInt32LE(tag === 258 ? bitsPerSampleOffset : tag === 273 ? pixelOffset : value, offset + 8);
  });

  buffer.writeUInt16LE(8, bitsPerSampleOffset);
  buffer.writeUInt16LE(8, bitsPerSampleOffset + 2);
  buffer.writeUInt16LE(8, bitsPerSampleOffset + 4);

  await writeFile(filepath, buffer);
}

async function writeDds(filepath: string, options: CreateFakeImageFileOptions): Promise<void> {
  const { width, height } = options;
  const bytesPerPixel = 4;
  const headerLength = 128;
  const buffer = Buffer.alloc(headerLength + width * height * bytesPerPixel);

  buffer.write('DDS ', 0, 'ascii');
  buffer.writeUInt32LE(124, 4);
  buffer.writeUInt32LE(0x1007, 8);
  buffer.writeUInt32LE(height, 12);
  buffer.writeUInt32LE(width, 16);
  buffer.writeUInt32LE(width * bytesPerPixel, 20);
  buffer.writeUInt32LE(32, 76);
  buffer.writeUInt32LE(0x41, 80);
  buffer.writeUInt32LE(32, 88);
  buffer.writeUInt32LE(0x00ff0000, 92);
  buffer.writeUInt32LE(0x0000ff00, 96);
  buffer.writeUInt32LE(0x000000ff, 100);
  buffer.writeUInt32LE(0xff000000, 104);
  buffer.writeUInt32LE(0x1000, 108);

  await writeFile(filepath, buffer);
}

async function writeKtx(filepath: string, options: CreateFakeImageFileOptions): Promise<void> {
  const { width, height } = options;
  const bytesPerPixel = 4;
  const imageSize = width * height * bytesPerPixel;
  const headerLength = 64;
  const buffer = Buffer.alloc(headerLength + 4 + imageSize);

  Buffer.from([0xab, 0x4b, 0x54, 0x58, 0x20, 0x31, 0x31, 0xbb, 0x0d, 0x0a, 0x1a, 0x0a]).copy(buffer, 0);
  buffer.writeUInt32LE(0x04030201, 12);
  buffer.writeUInt32LE(0x1401, 16);
  buffer.writeUInt32LE(1, 20);
  buffer.writeUInt32LE(0x1908, 24);
  buffer.writeUInt32LE(0x1908, 28);
  buffer.writeUInt32LE(0x1908, 32);
  buffer.writeUInt32LE(width, 36);
  buffer.writeUInt32LE(height, 40);
  buffer.writeUInt32LE(1, 52);
  buffer.writeUInt32LE(1, 56);
  buffer.writeUInt32LE(imageSize, headerLength);

  await writeFile(filepath, buffer);
}

async function writeKtx2(filepath: string, options: CreateFakeImageFileOptions): Promise<void> {
  const { width, height } = options;
  const buffer = Buffer.alloc(80);

  Buffer.from([0xab, 0x4b, 0x54, 0x58, 0x20, 0x32, 0x30, 0xbb, 0x0d, 0x0a, 0x1a, 0x0a]).copy(buffer, 0);
  buffer.writeUInt32LE(37, 12);
  buffer.writeUInt32LE(1, 16);
  buffer.writeUInt32LE(width, 20);
  buffer.writeUInt32LE(height, 24);
  buffer.writeUInt32LE(1, 36);
  buffer.writeUInt32LE(1, 40);

  await writeFile(filepath, buffer);
}

async function writePsd(filepath: string, options: CreateFakeImageFileOptions): Promise<void> {
  const { width, height } = options;
  const channels = 3;
  const headerLength = 26;
  const sectionLength = 4 + 4 + 4 + 2;
  const buffer = Buffer.alloc(headerLength + sectionLength + width * height * channels);

  buffer.write('8BPS', 0, 'ascii');
  buffer.writeUInt16BE(1, 4);
  buffer.writeUInt16BE(channels, 12);
  buffer.writeUInt32BE(height, 14);
  buffer.writeUInt32BE(width, 18);
  buffer.writeUInt16BE(8, 22);
  buffer.writeUInt16BE(3, 24);

  await writeFile(filepath, buffer);
}

async function writeCursor(filepath: string): Promise<void> {
  const input = await readFile(filepath);
  const cursor = Buffer.from(input);

  cursor.writeUInt16LE(2, 2);

  await writeFile(filepath, cursor);
}

export async function createFakeImageFile(
  filepath: string,
  options: CreateFakeImageFileOptions
): Promise<void> {
  const { width, height, color = 'black' } = options;

  if (!Number.isInteger(width) || width <= 0) {
    throw new RangeError('width must be a positive integer');
  }

  if (!Number.isInteger(height) || height <= 0) {
    throw new RangeError('height must be a positive integer');
  }

  await mkdir(dirname(filepath), { recursive: true });

  const ext = extname(filepath).toLowerCase();

  if (ext === '.svg' || ext === '.svgz') {
    await writeSvg(filepath, { width, height, color });
    return;
  }

  if (ext === '.tif' || ext === '.tiff') {
    await writeTiff(filepath, { width, height, color });
    return;
  }

  if (ext === '.dds') {
    await writeDds(filepath, { width, height, color });
    return;
  }

  if (ext === '.ktx') {
    await writeKtx(filepath, { width, height, color });
    return;
  }

  if (ext === '.ktx2') {
    await writeKtx2(filepath, { width, height, color });
    return;
  }

  if (ext === '.psd') {
    await writePsd(filepath, { width, height, color });
    return;
  }

  const ffmpegArgs = [
    '-y',
    '-f',
    'lavfi',
    '-i',
    `color=c=${color}:s=${width}x${height}:d=1`,
    '-an',
    ...getOutputArgs(filepath),
    filepath
  ];

  await runFfmpeg(ffmpegArgs);

  if (ext === '.cur') {
    await writeCursor(filepath);
  }
}
