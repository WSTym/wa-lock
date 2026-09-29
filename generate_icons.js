import fs from 'fs';
import zlib from 'zlib';

function createPNG(width, height, r, g, b, a) {
  // Simple PNG generator using zlib
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8); // bit depth 8
  ihdrData.writeUInt8(6, 9); // color type 6 (RGBA)
  ihdrData.writeUInt8(0, 10); // compression
  ihdrData.writeUInt8(0, 11); // filter
  ihdrData.writeUInt8(0, 12); // interlace

  const ihdr = makeChunk('IHDR', ihdrData);

  // Raw image data with scanline filters (filter byte = 0)
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(height * rowSize);

  // Draw a lock icon on a circular dark green background
  const cx = width / 2;
  const cy = height / 2;
  const radius = width * 0.45;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter None

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      const dx = x - cx + 0.5;
      const dy = y - cy + 0.5;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Background circle
      if (dist <= radius) {
        // WhatsApp green #25D366 -> rgb(37, 211, 102)
        // Dark background #128C7E / #075E54
        let pr = 37, pg = 211, pb = 102, pa = 255;

        // Draw lock body and shackle inside
        // Normalize coordinates to [-1, 1]
        const nx = (x - cx) / (radius * 0.75);
        const ny = (y - cy) / (radius * 0.75);

        // Lock shackle (loop): ny between -0.6 and 0.0, nx between -0.4 and 0.4
        const inShackleArch = (ny >= -0.65 && ny <= 0.0) && (Math.abs(nx) >= 0.22 && Math.abs(nx) <= 0.42) && (ny >= -0.2 || (nx * nx + (ny + 0.2) * (ny + 0.2) <= 0.22 && nx * nx + (ny + 0.2) * (ny + 0.2) >= 0.06));
        // Lock body (rectangle): nx between -0.45 and 0.45, ny between -0.05 and 0.6
        const inBody = (nx >= -0.48 && nx <= 0.48 && ny >= -0.08 && ny <= 0.6);
        // Keyhole
        const inKeyholeCircle = (nx * nx + (ny - 0.18) * (ny - 0.18) <= 0.015);
        const inKeyholeStem = (Math.abs(nx) <= 0.05 && ny >= 0.18 && ny <= 0.38);
        const inKeyhole = inKeyholeCircle || inKeyholeStem;

        if (inBody || inShackleArch) {
          if (inKeyhole) {
            pr = 18; pg = 140; pb = 126; pa = 255;
          } else {
            pr = 255; pg = 255; pb = 255; pa = 255;
          }
        } else {
          // Circular gradient or solid green
          pr = 18; pg = 140; pb = 126; pa = 255; // Dark teal/green
        }

        // Anti-aliasing edge
        if (dist > radius - 1) {
          pa = Math.floor(255 * (radius - dist));
        }

        rawData[pxOffset] = pr;
        rawData[pxOffset + 1] = pg;
        rawData[pxOffset + 2] = pb;
        rawData[pxOffset + 3] = pa;
      } else {
        rawData[pxOffset] = 0;
        rawData[pxOffset + 1] = 0;
        rawData[pxOffset + 2] = 0;
        rawData[pxOffset + 3] = 0; // Transparent
      }
    }
  }

  const compressedData = zlib.deflateSync(rawData);
  const idat = makeChunk('IDAT', compressedData);
  const iend = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdr, idat, iend]);
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);

  const typeBuf = Buffer.from(type, 'ascii');
  const body = Buffer.concat([typeBuf, data]);

  const crc = crc32(body);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc, 0);

  return Buffer.concat([len, body, crcBuf]);
}

// CRC32 implementation
function crc32(buf) {
  let crc = 0 ^ (-1);
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xFF];
  }
  return (crc ^ (-1)) >>> 0;
}

const table = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let k = 0; k < 8; k++) {
    c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
  }
  table[i] = c;
}

if (!fs.existsSync('icons')) {
  fs.mkdirSync('icons');
}

fs.writeFileSync('icons/icon16.png', createPNG(16, 16));
fs.writeFileSync('icons/icon48.png', createPNG(48, 48));
fs.writeFileSync('icons/icon128.png', createPNG(128, 128));
console.log('Icons generated successfully.');
