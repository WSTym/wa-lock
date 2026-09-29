import fs from 'fs';
import zlib from 'zlib';

function createIconPNG(size) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(size, 0);
  ihdrData.writeUInt32BE(size, 4);
  ihdrData.writeUInt8(8, 8); // 8 bits
  ihdrData.writeUInt8(6, 9); // RGBA
  ihdrData.writeUInt8(0, 10);
  ihdrData.writeUInt8(0, 11);
  ihdrData.writeUInt8(0, 12);

  const ihdr = makeChunk('IHDR', ihdrData);

  const rowSize = 1 + size * 4;
  const rawData = Buffer.alloc(size * rowSize);

  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.46;
  const scale = size * 0.42;

  // 4x4 Supersampling for ultra-crisp antialiasing
  const subSamples = 4;
  const subStep = 1 / subSamples;

  for (let py = 0; py < size; py++) {
    const rowOffset = py * rowSize;
    rawData[rowOffset] = 0; // Filter 0

    for (let px = 0; px < size; px++) {
      let totalR = 0, totalG = 0, totalB = 0, totalA = 0;

      for (let sy = 0; sy < subSamples; sy++) {
        for (let sx = 0; sx < subSamples; sx++) {
          const x = px + (sx + 0.5) * subStep;
          const y = py + (sy + 0.5) * subStep;

          const dx = x - cx;
          const dy = y - cy;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist <= radius) {
            // Inside background circle
            // WhatsApp green/teal gradient: #00a884 to #128c7e
            const gradT = (y / size);
            const bgR = Math.round(0 * (1 - gradT) + 18 * gradT);
            const bgG = Math.round(168 * (1 - gradT) + 140 * gradT);
            const bgB = Math.round(132 * (1 - gradT) + 126 * gradT);

            // Normalized coordinates for the lock
            // Center of the lock body is slightly below the circle center
            const nx = dx / scale;
            const ny = (dy + size * 0.02) / scale; // shifted slightly down for visual balance

            // --- Lock Geometry ---
            // 1. Shackle (Arco do cadeado)
            // Arch center at (0, -0.06)
            const archCy = -0.06;
            const archDy = ny - archCy;
            const rShackle = Math.sqrt(nx * nx + archDy * archDy);
            const rOut = 0.32;
            const rIn = 0.17;

            // Semi-circle top arch
            const inArch = (archDy <= 0) && (rShackle >= rIn && rShackle <= rOut);
            // Straight vertical legs going into the lock body
            const inLegs = (archDy > 0 && archDy <= 0.12) && (Math.abs(nx) >= rIn && Math.abs(nx) <= rOut);
            const inShackle = inArch || inLegs;

            // 2. Lock Body (Corpo do cadeado)
            // Box from nx: [-0.42, 0.42], ny: [-0.04, 0.50]
            const bLeft = -0.42, bRight = 0.42, bTop = -0.04, bBottom = 0.50;
            const cornerR = 0.08;

            let inBody = false;
            if (nx >= bLeft && nx <= bRight && ny >= bTop && ny <= bBottom) {
              // Rounded corners check
              const nearLeft = nx < bLeft + cornerR;
              const nearRight = nx > bRight - cornerR;
              const nearTop = ny < bTop + cornerR;
              const nearBottom = ny > bBottom - cornerR;

              if (nearLeft && nearTop) {
                const cdx = nx - (bLeft + cornerR);
                const cdy = ny - (bTop + cornerR);
                inBody = (cdx * cdx + cdy * cdy <= cornerR * cornerR);
              } else if (nearRight && nearTop) {
                const cdx = nx - (bRight - cornerR);
                const cdy = ny - (bTop + cornerR);
                inBody = (cdx * cdx + cdy * cdy <= cornerR * cornerR);
              } else if (nearLeft && nearBottom) {
                const cdx = nx - (bLeft + cornerR);
                const cdy = ny - (bBottom - cornerR);
                inBody = (cdx * cdx + cdy * cdy <= cornerR * cornerR);
              } else if (nearRight && nearBottom) {
                const cdx = nx - (bRight - cornerR);
                const cdy = ny - (bBottom - cornerR);
                inBody = (cdx * cdx + cdy * cdy <= cornerR * cornerR);
              } else {
                inBody = true;
              }
            }

            // 3. Keyhole (Fechadura) inside body
            let inKeyhole = false;
            if (inBody) {
              // Circle at (0, 0.17), radius 0.075
              const khDy = ny - 0.17;
              const inKhCircle = (nx * nx + khDy * khDy <= 0.072 * 0.072);
              // Stem extending downwards: ny between 0.17 and 0.33
              const inKhStem = (ny >= 0.17 && ny <= 0.33) && (Math.abs(nx) <= (0.032 + (ny - 0.17) * 0.08));
              inKeyhole = inKhCircle || inKhStem;
            }

            if ((inBody || inShackle) && !inKeyhole) {
              // Crisp White lock
              totalR += 255;
              totalG += 255;
              totalB += 255;
              totalA += 255;
            } else if (inKeyhole) {
              // Keyhole cutout matches the dark teal
              totalR += 14;
              totalG += 105;
              totalB += 95;
              totalA += 255;
            } else {
              // Background
              totalR += bgR;
              totalG += bgG;
              totalB += bgB;
              totalA += 255;
            }
          }
          // Outside background circle: transparent (totalA += 0)
        }
      }

      const numSamples = subSamples * subSamples;
      const pxOffset = rowOffset + 1 + px * 4;
      rawData[pxOffset] = Math.round(totalR / numSamples);
      rawData[pxOffset + 1] = Math.round(totalG / numSamples);
      rawData[pxOffset + 2] = Math.round(totalB / numSamples);
      rawData[pxOffset + 3] = Math.round(totalA / numSamples);
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

// CRC32
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

fs.writeFileSync('icons/icon16.png', createIconPNG(16));
fs.writeFileSync('icons/icon48.png', createIconPNG(48));
fs.writeFileSync('icons/icon128.png', createIconPNG(128));
console.log('Novos icones gerados com arco completo e antialiasing 4x!');
