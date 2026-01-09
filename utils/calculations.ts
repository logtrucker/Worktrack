
import { Shift, AppSettings, ShiftStats, FilingStatus, StateCode } from "../types";
import { parse, differenceInMinutes, format, parseISO, addDays, isBefore, isValid } from "date-fns";

// Estimated 2026 Federal Standard Deductions
const FED_2026_STANDARD_DEDUCTIONS = {
  single: 15000,
  mfj: 30000,
  hoh: 22500,
  mfs: 15000
};

// Simplified State Tax Data (Standard Deductions & Brackets)
// Using representative 2024/2025 data as a baseline for 2026 projections
const STATE_TAX_DATA: Partial<Record<StateCode, {
  deduction: Record<FilingStatus, number>;
  brackets: Record<FilingStatus, { upTo: number; rate: number }[]>;
  isFlat?: boolean;
}>> = {
  AL: { deduction: { single: 2500, mfj: 7500, hoh: 4700, mfs: 3750 }, brackets: { 
    single: [{ upTo: 500, rate: 0.02 }, { upTo: 3000, rate: 0.04 }, { upTo: Infinity, rate: 0.05 }],
    mfj: [{ upTo: 1000, rate: 0.02 }, { upTo: 6000, rate: 0.04 }, { upTo: Infinity, rate: 0.05 }],
    hoh: [{ upTo: 500, rate: 0.02 }, { upTo: 3000, rate: 0.04 }, { upTo: Infinity, rate: 0.05 }],
    mfs: [{ upTo: 500, rate: 0.02 }, { upTo: 3000, rate: 0.04 }, { upTo: Infinity, rate: 0.05 }]
  }},
  AZ: { deduction: { single: 14600, mfj: 29200, hoh: 21900, mfs: 14600 }, isFlat: true, brackets: {
    single: [{ upTo: Infinity, rate: 0.025 }], mfj: [{ upTo: Infinity, rate: 0.025 }], hoh: [{ upTo: Infinity, rate: 0.025 }], mfs: [{ upTo: Infinity, rate: 0.025 }]
  }},
  AR: { deduction: { single: 2340, mfj: 4680, hoh: 2340, mfs: 2340 }, brackets: {
    single: [{ upTo: 5000, rate: 0.02 }, { upTo: 10000, rate: 0.03 }, { upTo: Infinity, rate: 0.044 }],
    mfj: [{ upTo: 5000, rate: 0.02 }, { upTo: 10000, rate: 0.03 }, { upTo: Infinity, rate: 0.044 }],
    hoh: [{ upTo: 5000, rate: 0.02 }, { upTo: 10000, rate: 0.03 }, { upTo: Infinity, rate: 0.044 }],
    mfs: [{ upTo: 5000, rate: 0.02 }, { upTo: 10000, rate: 0.03 }, { upTo: Infinity, rate: 0.044 }]
  }},
  CA: { deduction: { single: 5363, mfj: 10726, hoh: 10726, mfs: 5363 }, brackets: {
    single: [{ upTo: 10412, rate: 0.01 }, { upTo: 24684, rate: 0.02 }, { upTo: 38959, rate: 0.04 }, { upTo: 54081, rate: 0.06 }, { upTo: 68350, rate: 0.08 }, { upTo: 349137, rate: 0.093 }, { upTo: Infinity, rate: 0.133 }],
    mfj: [{ upTo: 20824, rate: 0.01 }, { upTo: 49368, rate: 0.02 }, { upTo: 77918, rate: 0.04 }, { upTo: 108162, rate: 0.06 }, { upTo: 136700, rate: 0.08 }, { upTo: 698274, rate: 0.093 }, { upTo: Infinity, rate: 0.133 }],
    hoh: [{ upTo: 20837, rate: 0.01 }, { upTo: 49371, rate: 0.02 }, { upTo: 63640, rate: 0.04 }, { upTo: 78765, rate: 0.06 }, { upTo: 93037, rate: 0.08 }, { upTo: 474824, rate: 0.093 }, { upTo: Infinity, rate: 0.133 }],
    mfs: [{ upTo: 10412, rate: 0.01 }, { upTo: 24684, rate: 0.02 }, { upTo: 38959, rate: 0.04 }, { upTo: 54081, rate: 0.06 }, { upTo: 68350, rate: 0.08 }, { upTo: 349137, rate: 0.093 }, { upTo: Infinity, rate: 0.133 }]
  }},
  CO: { deduction: { single: 14600, mfj: 29200, hoh: 21900, mfs: 14600 }, isFlat: true, brackets: {
    single: [{ upTo: Infinity, rate: 0.044 }], mfj: [{ upTo: Infinity, rate: 0.044 }], hoh: [{ upTo: Infinity, rate: 0.044 }], mfs: [{ upTo: Infinity, rate: 0.044 }]
  }},
  GA: { deduction: { single: 12000, mfj: 24000, hoh: 12000, mfs: 12000 }, brackets: {
    single: [{ upTo: Infinity, rate: 0.0549 }], mfj: [{ upTo: Infinity, rate: 0.0549 }], hoh: [{ upTo: Infinity, rate: 0.0549 }], mfs: [{ upTo: Infinity, rate: 0.0549 }]
  }},
  IL: { deduction: { single: 2775, mfj: 5550, hoh: 2775, mfs: 2775 }, isFlat: true, brackets: {
    single: [{ upTo: Infinity, rate: 0.0495 }], mfj: [{ upTo: Infinity, rate: 0.0495 }], hoh: [{ upTo: Infinity, rate: 0.0495 }], mfs: [{ upTo: Infinity, rate: 0.0495 }]
  }},
  MA: { deduction: { single: 4400, mfj: 8800, hoh: 6800, mfs: 4400 }, isFlat: true, brackets: {
    single: [{ upTo: Infinity, rate: 0.05 }], mfj: [{ upTo: Infinity, rate: 0.05 }], hoh: [{ upTo: Infinity, rate: 0.05 }], mfs: [{ upTo: Infinity, rate: 0.05 }]
  }},
  NY: { deduction: { single: 8000, mfj: 16050, hoh: 11200, mfs: 8000 }, brackets: {
    single: [{ upTo: 8500, rate: 0.04 }, { upTo: 11700, rate: 0.045 }, { upTo: 13900, rate: 0.0525 }, { upTo: 21400, rate: 0.0585 }, { upTo: 80650, rate: 0.0625 }, { upTo: 215400, rate: 0.0685 }, { upTo: Infinity, rate: 0.109 }],
    mfj: [{ upTo: 17150, rate: 0.04 }, { upTo: 23600, rate: 0.045 }, { upTo: 27900, rate: 0.0525 }, { upTo: 43000, rate: 0.0585 }, { upTo: 161550, rate: 0.0625 }, { upTo: 323200, rate: 0.0685 }, { upTo: Infinity, rate: 0.109 }],
    hoh: [{ upTo: 12850, rate: 0.04 }, { upTo: 17650, rate: 0.045 }, { upTo: 20900, rate: 0.0525 }, { upTo: 32200, rate: 0.0585 }, { upTo: 107650, rate: 0.0625 }, { upTo: 269300, rate: 0.0685 }, { upTo: Infinity, rate: 0.109 }],
    mfs: [{ upTo: 8500, rate: 0.04 }, { upTo: 11700, rate: 0.045 }, { upTo: 13900, rate: 0.0525 }, { upTo: 21400, rate: 0.0585 }, { upTo: 80650, rate: 0.0625 }, { upTo: 215400, rate: 0.0685 }, { upTo: Infinity, rate: 0.109 }]
  }},
  NC: { deduction: { single: 12750, mfj: 25500, hoh: 19125, mfs: 12750 }, isFlat: true, brackets: {
    single: [{ upTo: Infinity, rate: 0.045 }], mfj: [{ upTo: Infinity, rate: 0.045 }], hoh: [{ upTo: Infinity, rate: 0.045 }], mfs: [{ upTo: Infinity, rate: 0.045 }]
  }},
  PA: { deduction: { single: 0, mfj: 0, hoh: 0, mfs: 0 }, isFlat: true, brackets: {
    single: [{ upTo: Infinity, rate: 0.0307 }], mfj: [{ upTo: Infinity, rate: 0.0307 }], hoh: [{ upTo: Infinity, rate: 0.0307 }], mfs: [{ upTo: Infinity, rate: 0.0307 }]
  }},
  TX: { deduction: { single: 0, mfj: 0, hoh: 0, mfs: 0 }, isFlat: true, brackets: {
    single: [{ upTo: Infinity, rate: 0 }], mfj: [{ upTo: Infinity, rate: 0 }], hoh: [{ upTo: Infinity, rate: 0 }], mfs: [{ upTo: Infinity, rate: 0 }]
  }},
  FL: { deduction: { single: 0, mfj: 0, hoh: 0, mfs: 0 }, isFlat: true, brackets: {
    single: [{ upTo: Infinity, rate: 0 }], mfj: [{ upTo: Infinity, rate: 0 }], hoh: [{ upTo: Infinity, rate: 0 }], mfs: [{ upTo: Infinity, rate: 0 }]
  }},
  WA: { deduction: { single: 0, mfj: 0, hoh: 0, mfs: 0 }, isFlat: true, brackets: {
    single: [{ upTo: Infinity, rate: 0 }], mfj: [{ upTo: Infinity, rate: 0 }], hoh: [{ upTo: Infinity, rate: 0 }], mfs: [{ upTo: Infinity, rate: 0 }]
  }}
};

// Fallback for states not explicitly mapped above (No income tax default or standard flat rate logic)
const NO_INCOME_TAX_STATES: StateCode[] = ['AK', 'FL', 'NV', 'SD', 'TN', 'TX', 'WA', 'WY'];
const FLAT_TAX_STATES: Partial<Record<StateCode, number>> = {
  IN: 0.0305, KY: 0.04, MI: 0.0405, MS: 0.05, NH: 0.04, UT: 0.0465
};

const FED_2026_BRACKETS: Record<FilingStatus, { upTo: number; rate: number }[]> = {
  single: [{ upTo: 11925, rate: 0.10 }, { upTo: 48475, rate: 0.12 }, { upTo: 103350, rate: 0.22 }, { upTo: 197300, rate: 0.24 }, { upTo: 250525, rate: 0.32 }, { upTo: 626350, rate: 0.35 }, { upTo: Infinity, rate: 0.37 }],
  mfj: [{ upTo: 23850, rate: 0.10 }, { upTo: 96950, rate: 0.12 }, { upTo: 206700, rate: 0.22 }, { upTo: 394600, rate: 0.24 }, { upTo: 501050, rate: 0.32 }, { upTo: 751600, rate: 0.35 }, { upTo: Infinity, rate: 0.37 }],
  hoh: [{ upTo: 17000, rate: 0.10 }, { upTo: 64850, rate: 0.12 }, { upTo: 103350, rate: 0.22 }, { upTo: 197300, rate: 0.24 }, { upTo: 250500, rate: 0.32 }, { upTo: 626350, rate: 0.35 }, { upTo: Infinity, rate: 0.37 }],
  mfs: [{ upTo: 11925, rate: 0.10 }, { upTo: 48475, rate: 0.12 }, { upTo: 103350, rate: 0.22 }, { upTo: 197300, rate: 0.24 }, { upTo: 250525, rate: 0.32 }, { upTo: 375800, rate: 0.35 }, { upTo: Infinity, rate: 0.37 }]
};

export const getShiftRange = (shift: { date: string, startTime: string, endTime: string }) => {
  const fixTime = (t: string) => {
    if (!t || !t.includes(':')) return t || "00:00";
    const [h, m] = t.split(':');
    return `${h.padStart(2, '0')}:${m.padStart(2, '0')}`;
  };
  const safeStart = fixTime(shift.startTime);
  const safeEnd = fixTime(shift.endTime);
  let start = parse(`${shift.date} ${safeStart}`, "yyyy-MM-dd HH:mm", new Date());
  let end = parse(`${shift.date} ${safeEnd}`, "yyyy-MM-dd HH:mm", new Date());
  if (!isValid(start) || !isValid(end)) return { start: new Date(NaN), end: new Date(NaN) };
  if (isBefore(end, start)) end = addDays(end, 1);
  return { start, end };
};

export const calculateShiftHours = (shift: Shift): number => {
  const { start, end } = getShiftRange(shift);
  if (!isValid(start) || !isValid(end)) return 0;
  return differenceInMinutes(end, start) / 60;
};

export const areShiftsOverlapping = (shiftA: Omit<Shift, 'id'>, shiftB: Omit<Shift, 'id'>): boolean => {
  const rangeA = getShiftRange(shiftA);
  const rangeB = getShiftRange(shiftB);
  if (!isValid(rangeA.start) || !isValid(rangeA.end) || !isValid(rangeB.start) || !isValid(rangeB.end)) return false;
  return isBefore(rangeA.start, rangeB.end) && isBefore(rangeB.start, rangeA.end);
};

const calculateProgressiveTax = (taxable: number, brackets: { upTo: number; rate: number }[]): number => {
  if (taxable <= 0) return 0;
  let tax = 0;
  let previousLimit = 0;
  for (const bracket of brackets) {
    const upper = bracket.upTo;
    const rate = bracket.rate;
    if (taxable > previousLimit) {
       const taxableInBracket = Math.min(taxable, upper) - previousLimit;
       tax += taxableInBracket * rate;
    }
    previousLimit = upper;
    if (taxable <= previousLimit) break;
  }
  return tax;
};

export const calculateWeeklyStats = (shifts: Shift[], settings: AppSettings): ShiftStats => {
  const totalHours = shifts.reduce((acc, s) => acc + calculateShiftHours(s), 0);
  let regularHours = totalHours;
  let overtimeHours = 0;

  if (totalHours > settings.overtimeThreshold) {
    regularHours = settings.overtimeThreshold;
    overtimeHours = totalHours - settings.overtimeThreshold;
  }

  const regularPay = regularHours * settings.hourlyRate;
  const overtimePay = overtimeHours * settings.hourlyRate * settings.overtimeMultiplier;
  let grossPay = regularPay + overtimePay;

  let guaranteeApplied = false;
  if (grossPay < settings.minWeeklyGuarantee && shifts.length > 0) {
      grossPay = settings.minWeeklyGuarantee;
      guaranteeApplied = true;
  }

  if (settings.taxSettings.is1099) {
      return { totalHours, regularHours, overtimeHours, grossPay, regularPay, overtimePay, estimatedFederalTax: 0, estimatedStateTax: 0, estimatedFICA: 0, netPay: grossPay, guaranteeApplied };
  }

  const annualGross = grossPay * 52;
  const fedStdDeduction = settings.taxSettings.useStandardDeduction ? FED_2026_STANDARD_DEDUCTIONS[settings.taxSettings.filingStatus] : settings.taxSettings.customDeduction;
  const taxableFed = Math.max(0, annualGross - fedStdDeduction);
  const weeklyFedTax = calculateProgressiveTax(taxableFed, FED_2026_BRACKETS[settings.taxSettings.filingStatus]) / 52;

  let weeklyStateTax = 0;
  const stateCode = settings.taxSettings.stateCode;
  if (stateCode === 'CUSTOM') {
      weeklyStateTax = grossPay * (settings.taxSettings.stateTaxRate / 100);
  } else if (stateCode !== 'NONE' && !NO_INCOME_TAX_STATES.includes(stateCode)) {
      const stateData = STATE_TAX_DATA[stateCode];
      if (stateData) {
          const stateDeduction = settings.taxSettings.useStandardDeduction ? stateData.deduction[settings.taxSettings.filingStatus] : settings.taxSettings.customDeduction;
          const taxableState = Math.max(0, annualGross - stateDeduction);
          weeklyStateTax = calculateProgressiveTax(taxableState, stateData.brackets[settings.taxSettings.filingStatus]) / 52;
      } else if (FLAT_TAX_STATES[stateCode]) {
          weeklyStateTax = (annualGross * FLAT_TAX_STATES[stateCode]!) / 52;
      } else {
          // General fallback to a basic progressive/flat mix for unmapped states (approx 4%)
          weeklyStateTax = (annualGross * 0.04) / 52;
      }
  }

  const weeklyFICA = settings.taxSettings.includeFica ? grossPay * 0.0765 : 0;
  const additional = settings.taxSettings.additionalWithholding || 0;
  const netPay = grossPay - (weeklyFedTax + weeklyStateTax + weeklyFICA + additional);

  return { totalHours, regularHours, overtimeHours, grossPay, regularPay, overtimePay, estimatedFederalTax: weeklyFedTax, estimatedStateTax: weeklyStateTax, estimatedFICA: weeklyFICA, netPay, guaranteeApplied };
};

export const generateShareText = (shifts: Shift[], settings: AppSettings, stats: ShiftStats, activeClock?: { date: string, time: string } | null): string => {
  const sortedShifts = [...shifts].sort((a, b) => a.date.localeCompare(b.date));
  const lines = sortedShifts.map(s => {
      const h = calculateShiftHours(s);
      return `${format(parseISO(s.date), 'EEE, MMM d')}: ${s.startTime} - ${s.endTime} (${h.toFixed(2)}h)`;
  });
  if (activeClock) {
      const start = parse(`${activeClock.date} ${activeClock.time}`, "yyyy-MM-dd HH:mm", new Date());
      const now = new Date();
      const h = isValid(start) ? differenceInMinutes(now, start) / 60 : 0;
      lines.push(`${format(parseISO(activeClock.date), 'EEE, MMM d')}: ${activeClock.time} - ${format(now, 'HH:mm')} (Running... ${h.toFixed(2)}h)`);
  }
  lines.push('', `Total Hours: ${stats.totalHours.toFixed(2)}h`);
  return lines.join('\n');
};

export const generateDetailedShareText = (shifts: Shift[], settings: AppSettings, stats: ShiftStats, activeClock?: { date: string, time: string } | null): string => {
    const sortedShifts = [...shifts].sort((a, b) => a.date.localeCompare(b.date));
    const lines = sortedShifts.map(s => {
        const h = calculateShiftHours(s);
        return `${format(parseISO(s.date), 'EEE, MMM d')}: ${s.startTime} - ${s.endTime} (${h.toFixed(2)}h)`;
    });
    if (activeClock) {
        const start = parse(`${activeClock.date} ${activeClock.time}`, "yyyy-MM-dd HH:mm", new Date());
        const h = isValid(start) ? differenceInMinutes(new Date(), start) / 60 : 0;
        lines.push(`${format(parseISO(activeClock.date), 'EEE, MMM d')}: ${activeClock.time} - ${format(new Date(), 'HH:mm')} (Running... ${h.toFixed(2)}h)`);
    }
    lines.push('', '--- Summary ---', `Total Hours: ${stats.totalHours.toFixed(2)}h`);
    if (stats.overtimeHours > 0) lines.push(`Regular: ${stats.regularHours.toFixed(2)}h | Overtime: ${stats.overtimeHours.toFixed(2)}h`);
    lines.push(`Gross Pay: $${stats.grossPay.toFixed(2)}`, `Net Pay (Est): $${stats.netPay.toFixed(2)}`);
    return lines.join('\n');
};
