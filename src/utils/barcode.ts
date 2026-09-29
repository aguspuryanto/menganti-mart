/**
 * Code-128 Barcode Generator (Code 128-B)
 * Generates an SVG representation of a Code-128 barcode for sharp thermal printing.
 */

// Code 128 patterns for characters from 32 (space) to 127, plus control codes
const CODE128_PATTERNS: string[] = [
  '212222', '222122', '222221', '121223', '121322', '131222', '122213', '122312', '132212', '221213', // 0-9
  '221312', '231212', '112232', '122132', '122231', '113222', '123122', '123221', '223211', '221132', // 10-19
  '221231', '213212', '223112', '312131', '311222', '321122', '321221', '312212', '322112', '322211', // 20-29
  '212123', '212321', '232121', '111323', '131123', '131321', '112313', '132113', '132311', '211313', // 30-39
  '231113', '231311', '112133', '112331', '132131', '113123', '113321', '133121', '313121', '211331', // 40-49
  '231131', '213113', '213311', '213131', '311123', '311321', '331121', '312113', '312311', '332111', // 50-59
  '314111', '221411', '431111', '111224', '111422', '121124', '121421', '141122', '141221', '112214', // 60-69
  '112412', '122114', '122411', '142112', '142211', '241211', '221114', '413111', '241112', '134111', // 70-79
  '111242', '121142', '121241', '114212', '124112', '124211', '411212', '421112', '421211', '212141', // 80-89
  '214121', '412121', '111143', '111341', '131141', '114113', '114311', '411113', '411311', '113141', // 90-99
  '114131', '311141', '411131', '211412', '211214', '211232', '2331112' // 100-106 (106 is STOP)
];

const START_CODE_B = 104;
const STOP_CODE = 106;

export function encodeCode128B(text: string): string {
  const codes: number[] = [START_CODE_B];
  let checkSum = START_CODE_B;

  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i);
    // ASCII 32 to 126 maps to Code 128 values 0 to 94
    const val = charCode >= 32 && charCode <= 126 ? charCode - 32 : 0;
    codes.push(val);
    checkSum += val * (i + 1);
  }

  const checkDigit = checkSum % 103;
  codes.push(checkDigit);
  codes.push(STOP_CODE);

  // Convert codes to bar pattern string
  let pattern = '';
  for (const c of codes) {
    pattern += CODE128_PATTERNS[c] || '';
  }

  return pattern;
}

export function generateBarcodeSvg(text: string, height: number = 55): string {
  const pattern = encodeCode128B(text);
  const barWidth = 1.6;
  const bars: { x: number; w: number }[] = [];
  let currentX = 10; // Left quiet zone

  for (let i = 0; i < pattern.length; i++) {
    const width = parseInt(pattern[i], 10) * barWidth;
    const isBar = i % 2 === 0;
    if (isBar) {
      bars.push({ x: currentX, w: width });
    }
    currentX += width;
  }

  const totalWidth = currentX + 10; // Right quiet zone

  const rects = bars
    .map(b => `<rect x="${b.x.toFixed(1)}" y="0" width="${b.w.toFixed(1)}" height="${height}" fill="#000000" />`)
    .join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalWidth.toFixed(1)} ${height}" width="100%" height="${height}" preserveAspectRatio="none">${rects}</svg>`;
}
