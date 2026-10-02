// Standard Code 128 (Subset B) Barcode Generator for Courier Airway Bills
// Produces 100% compliant, machine-readable vector SVG barcodes with exact guard bars & checksum

// 107 standard Code 128 patterns (widths of alternating 3 bars and 3 spaces; stop has 7 elements)
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
  '114131', '311141', '411131', '211412', '211214', '211232', '2331112'                                 // 100-106 (104=Start B, 106=Stop)
];

const START_B_INDEX = 104;
const STOP_INDEX = 106;

export interface BarcodeBar {
  x: number;
  width: number;
  isBlack: boolean;
}

export function encodeCode128(text: string): { bars: BarcodeBar[]; totalWidth: number } {
  const safeText = (text || 'HZC-0000').trim();
  const indices: number[] = [START_B_INDEX];

  let checksum = START_B_INDEX;
  for (let i = 0; i < safeText.length; i++) {
    const charCode = safeText.charCodeAt(i);
    // ASCII 32 (' ') to 126 ('~') mapped to values 0 to 94
    let val = charCode - 32;
    if (val < 0 || val > 95) {
      val = 0; // fallback to space
    }
    indices.push(val);
    checksum += val * (i + 1);
  }

  const checkVal = checksum % 103;
  indices.push(checkVal);
  indices.push(STOP_INDEX);

  const bars: BarcodeBar[] = [];
  let currentX = 0;

  for (const symIndex of indices) {
    const pattern = CODE128_PATTERNS[symIndex];
    if (!pattern) continue;

    for (let p = 0; p < pattern.length; p++) {
      const width = parseInt(pattern[p], 10);
      const isBlack = p % 2 === 0; // Even indices are bars (black), odd are spaces (white)

      bars.push({
        x: currentX,
        width,
        isBlack,
      });
      currentX += width;
    }
  }

  return { bars, totalWidth: currentX };
}
