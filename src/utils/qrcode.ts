const VERSION = 3;
const SIZE = VERSION * 4 + 17;
const DATA_CODEWORDS = 55;
const ECC_CODEWORDS = 15;

function appendBits(bits: number[], value: number, length: number) {
  for (let i = length - 1; i >= 0; i--) {
    bits.push((value >>> i) & 1);
  }
}

function bitsToCodewords(bits: number[]) {
  const codewords: number[] = [];
  for (let i = 0; i < bits.length; i += 8) {
    let value = 0;
    for (let j = 0; j < 8; j++) {
      value = (value << 1) | (bits[i + j] || 0);
    }
    codewords.push(value);
  }
  return codewords;
}

function multiply(x: number, y: number) {
  let z = 0;
  for (let i = 7; i >= 0; i--) {
    z = (z << 1) ^ ((z >>> 7) * 0x11d);
    z ^= ((y >>> i) & 1) * x;
  }
  return z & 0xff;
}

function reedSolomonGenerator(degree: number) {
  const result = new Array(degree).fill(0);
  result[degree - 1] = 1;
  let root = 1;

  for (let i = 0; i < degree; i++) {
    for (let j = 0; j < result.length; j++) {
      result[j] = multiply(result[j], root);
      if (j + 1 < result.length) {
        result[j] ^= result[j + 1];
      }
    }
    root = multiply(root, 0x02);
  }

  return result;
}

function reedSolomonRemainder(data: number[], generator: number[]) {
  const result = new Array(generator.length - 1).fill(0);

  for (const value of data) {
    const factor = value ^ result.shift();
    result.push(0);
    generator.forEach((coefficient, index) => {
      result[index] ^= multiply(coefficient, factor);
    });
  }

  return result;
}

function createDataCodewords(text: string) {
  const bytes = Array.from(new TextEncoder().encode(text));
  const bits: number[] = [];

  appendBits(bits, 0x4, 4);
  appendBits(bits, bytes.length, 8);
  bytes.forEach((byte) => appendBits(bits, byte, 8));
  appendBits(bits, 0, Math.min(4, DATA_CODEWORDS * 8 - bits.length));

  while (bits.length % 8 !== 0) {
    bits.push(0);
  }

  const codewords = bitsToCodewords(bits);
  for (let pad = 0xec; codewords.length < DATA_CODEWORDS; pad ^= 0xfd) {
    codewords.push(pad);
  }

  return codewords;
}

function getFormatBits() {
  const errorCorrectionLevel = 1;
  const maskPattern = 0;
  let data = (errorCorrectionLevel << 3) | maskPattern;
  let bits = data << 10;
  const generator = 0x537;

  for (let i = 14; i >= 10; i--) {
    if (((bits >>> i) & 1) !== 0) {
      bits ^= generator << (i - 10);
    }
  }

  return ((data << 10) | bits) ^ 0x5412;
}

function getBit(value: number, index: number) {
  return ((value >>> index) & 1) !== 0;
}

function createMatrix() {
  const modules: (boolean | null)[][] = Array.from({ length: SIZE }, () => Array(SIZE).fill(null));
  const reserved: boolean[][] = Array.from({ length: SIZE }, () => Array(SIZE).fill(false));

  function setFunction(x: number, y: number, value: boolean) {
    modules[y][x] = value;
    reserved[y][x] = true;
  }

  function drawFinder(x: number, y: number) {
    for (let dy = -1; dy <= 7; dy++) {
      for (let dx = -1; dx <= 7; dx++) {
        const xx = x + dx;
        const yy = y + dy;
        if (xx < 0 || xx >= SIZE || yy < 0 || yy >= SIZE) continue;
        const isBorder = dx === -1 || dx === 7 || dy === -1 || dy === 7;
        const isDark = !isBorder && (dx === 0 || dx === 6 || dy === 0 || dy === 6 || (dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4));
        setFunction(xx, yy, isDark);
      }
    }
  }

  function drawAlignment(x: number, y: number) {
    for (let dy = -2; dy <= 2; dy++) {
      for (let dx = -2; dx <= 2; dx++) {
        setFunction(x + dx, y + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
      }
    }
  }

  drawFinder(0, 0);
  drawFinder(SIZE - 7, 0);
  drawFinder(0, SIZE - 7);
  drawAlignment(22, 22);

  for (let i = 0; i < SIZE; i++) {
    if (!reserved[6][i]) setFunction(i, 6, i % 2 === 0);
    if (!reserved[i][6]) setFunction(6, i, i % 2 === 0);
  }

  for (let i = 0; i < 8; i++) {
    setFunction(8, i, false);
    setFunction(i, 8, false);
    setFunction(SIZE - 1 - i, 8, false);
    setFunction(8, SIZE - 1 - i, false);
  }
  setFunction(8, 8, false);
  setFunction(8, SIZE - 8, true);

  return { modules, reserved, setFunction };
}

function drawFormatBits(modules: (boolean | null)[][]) {
  const bits = getFormatBits();
  const set = (x: number, y: number, value: boolean) => {
    modules[y][x] = value;
  };

  for (let i = 0; i <= 5; i++) set(8, i, getBit(bits, i));
  set(8, 7, getBit(bits, 6));
  set(8, 8, getBit(bits, 7));
  set(7, 8, getBit(bits, 8));
  for (let i = 9; i < 15; i++) set(14 - i, 8, getBit(bits, i));

  for (let i = 0; i < 8; i++) set(SIZE - 1 - i, 8, getBit(bits, i));
  for (let i = 8; i < 15; i++) set(8, SIZE - 15 + i, getBit(bits, i));
  set(8, SIZE - 8, true);
}

function drawData(modules: (boolean | null)[][], reserved: boolean[][], data: number[]) {
  const bits: boolean[] = [];
  data.forEach((byte) => {
    for (let i = 7; i >= 0; i--) {
      bits.push(((byte >>> i) & 1) !== 0);
    }
  });

  let bitIndex = 0;
  let upward = true;

  for (let right = SIZE - 1; right >= 1; right -= 2) {
    if (right === 6) right--;

    for (let vertical = 0; vertical < SIZE; vertical++) {
      const y = upward ? SIZE - 1 - vertical : vertical;
      for (let dx = 0; dx < 2; dx++) {
        const x = right - dx;
        if (reserved[y][x]) continue;
        const mask = (x + y) % 2 === 0;
        modules[y][x] = (bits[bitIndex++] || false) !== mask;
      }
    }

    upward = !upward;
  }
}

function escapeXml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

export function createQrCodeSvg(text: string) {
  if (new TextEncoder().encode(text).length > 53) {
    throw new Error("QR Code text is too long for the local generator.");
  }

  const data = createDataCodewords(text);
  const ecc = reedSolomonRemainder(data, reedSolomonGenerator(ECC_CODEWORDS));
  const { modules, reserved } = createMatrix();

  drawData(modules, reserved, [...data, ...ecc]);
  drawFormatBits(modules);

  const cells: string[] = [];
  modules.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value) cells.push(`<rect x="${x}" y="${y}" width="1" height="1"/>`);
    });
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SIZE} ${SIZE}" role="img" aria-label="${escapeXml(text)}"><rect width="${SIZE}" height="${SIZE}" fill="#fff"/><g fill="#000">${cells.join("")}</g></svg>`;
}

export function createQrCodeDataUrl(text: string) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(createQrCodeSvg(text))}`;
}
