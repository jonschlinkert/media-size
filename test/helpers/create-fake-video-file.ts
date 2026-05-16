import { mkdir } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { dirname, extname } from 'node:path';

export type CreateFakeVideoFileOptions = {
  width: number;
  height: number;
  durationSeconds?: number;
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
    case '.webm':
      return ['-c:v', 'libvpx-vp9', '-pix_fmt', 'yuv420p'];
    case '.avi':
      return ['-c:v', 'mpeg4', '-pix_fmt', 'yuv420p'];
    case '.flv':
      return ['-c:v', 'flv', '-pix_fmt', 'yuv420p'];
    case '.3gp':
    case '.3g2':
      return ['-c:v', 'mpeg4', '-pix_fmt', 'yuv420p', '-f', '3gp'];
    case '.mpeg':
    case '.mpg':
      return ['-c:v', 'mpeg2video', '-pix_fmt', 'yuv420p'];
    case '.ts':
    case '.m2t':
    case '.m2ts':
    case '.mts':
      return ['-c:v', 'mpeg2video', '-pix_fmt', 'yuv420p', '-f', 'mpegts'];
    case '.mov':
    case '.mp4':
    case '.m4v':
      return ['-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-movflags', '+faststart'];
    default:
      return ['-c:v', 'libx264', '-pix_fmt', 'yuv420p'];
  }
}

export async function createFakeVideoFile(
  filepath: string,
  options: CreateFakeVideoFileOptions
): Promise<void> {
  const { width, height, durationSeconds = 1, color = 'black' } = options;

  if (!Number.isInteger(width) || width <= 0) {
    throw new RangeError('width must be a positive integer');
  }

  if (!Number.isInteger(height) || height <= 0) {
    throw new RangeError('height must be a positive integer');
  }

  if (typeof durationSeconds !== 'number' || !Number.isFinite(durationSeconds) || durationSeconds <= 0) {
    throw new RangeError('durationSeconds must be a positive number');
  }

  const ffmpegArgs = [
    '-y',
    '-f',
    'lavfi',
    '-i',
    `color=c=${color}:s=${width}x${height}:d=${durationSeconds}`,
    '-an',
    ...getOutputArgs(filepath),
    filepath
  ];

  await mkdir(dirname(filepath), { recursive: true });

  await runFfmpeg(ffmpegArgs);
}
