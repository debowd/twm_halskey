import { describe, it, expect } from 'vitest';
import {
  getSessionFromTime,
  returnEmoji,
  getSessionAccuracy,
  getDayFormatted,
  padZero,
  getNextTime,
  generateSignalMessage,
  calculateStats,
  calculateStreak,
  getMilestoneStatus,
  isValidCurrencyPair,
} from '../src/utils.js';

describe('Session Detection', () => {
  it('should return OVERNIGHT for 6:00 - 11:00', () => {
    expect(getSessionFromTime(6 * 60)).toBe('OVERNIGHT'); // 6:00
    expect(getSessionFromTime(8 * 60 + 30)).toBe('OVERNIGHT'); // 8:30
    expect(getSessionFromTime(11 * 60)).toBe('OVERNIGHT'); // 11:00
  });

  it('should return MORNING for 11:01 - 17:00', () => {
    expect(getSessionFromTime(11 * 60 + 1)).toBe('MORNING'); // 11:01
    expect(getSessionFromTime(14 * 60)).toBe('MORNING'); // 14:00
    expect(getSessionFromTime(17 * 60)).toBe('MORNING'); // 17:00
  });

  it('should return AFTERNOON for 17:01 - 23:59', () => {
    expect(getSessionFromTime(17 * 60 + 1)).toBe('AFTERNOON'); // 17:01
    expect(getSessionFromTime(20 * 60)).toBe('AFTERNOON'); // 20:00
    expect(getSessionFromTime(23 * 60 + 59)).toBe('AFTERNOON'); // 23:59
  });

  it('should return OUTSIDE for 0:00 - 5:59', () => {
    expect(getSessionFromTime(0)).toBe('OUTSIDE'); // 0:00
    expect(getSessionFromTime(3 * 60)).toBe('OUTSIDE'); // 3:00
    expect(getSessionFromTime(5 * 60 + 59)).toBe('OUTSIDE'); // 5:59
  });
});

describe('Emoji Conversion', () => {
  it('should convert single digit to emoji', () => {
    expect(returnEmoji('0')).toBe('0⃣');
    expect(returnEmoji('5')).toBe('5⃣');
    expect(returnEmoji('9')).toBe('9⃣');
  });

  it('should convert multi-digit numbers to emojis', () => {
    expect(returnEmoji('12')).toBe('1⃣2⃣');
    expect(returnEmoji('99')).toBe('9⃣9⃣');
    expect(returnEmoji('123')).toBe('1⃣2⃣3⃣');
  });
});

describe('Session Accuracy', () => {
  it('should calculate accuracy correctly', () => {
    expect(getSessionAccuracy(8, 2)).toEqual({ status: true, percentage: '80.00%' });
    expect(getSessionAccuracy(5, 5)).toEqual({ status: true, percentage: '50.00%' });
    expect(getSessionAccuracy(10, 0)).toEqual({ status: true, percentage: '100.00%' });
  });

  it('should handle zero signals', () => {
    expect(getSessionAccuracy(0, 0)).toEqual({ status: false, percentage: '0%' });
  });

  it('should handle all losses', () => {
    expect(getSessionAccuracy(0, 10)).toEqual({ status: true, percentage: '0.00%' });
  });
});

describe('Time Utilities', () => {
  it('should pad single digits with zero', () => {
    expect(padZero(0)).toBe('00');
    expect(padZero(5)).toBe('05');
    expect(padZero(9)).toBe('09');
  });

  it('should not pad double digits', () => {
    expect(padZero(10)).toBe('10');
    expect(padZero(23)).toBe('23');
  });

  it('should calculate next time correctly', () => {
    expect(getNextTime(10, 30, 5)).toBe('10:35');
    expect(getNextTime(10, 55, 10)).toBe('11:05');
    expect(getNextTime(23, 50, 15)).toBe('00:05'); // Wrap around
  });
});

describe('Signal Message Generation', () => {
  it('should generate valid signal message', () => {
    const msg = generateSignalMessage('🇪🇺 EUR / USD 🇺🇸 (OTC)', 14, 30, '🟩 BUY');

    expect(msg).toContain('EUR / USD');
    expect(msg).toContain('Entry at 14:30');
    expect(msg).toContain('🟩 BUY');
    expect(msg).toContain('14:35'); // Martingale 1
    expect(msg).toContain('14:40'); // Martingale 2
    expect(msg).toContain('14:45'); // Martingale 3
  });

  it('should handle midnight wraparound', () => {
    const msg = generateSignalMessage('🇬🇧 GBP / USD 🇺🇸 (OTC)', 23, 50, '🟥 SELL');

    expect(msg).toContain('Entry at 23:50');
    expect(msg).toContain('23:55'); // Martingale 1
    expect(msg).toContain('00:00'); // Martingale 2
    expect(msg).toContain('00:05'); // Martingale 3
  });
});

describe('Stats Calculation', () => {
  it('should calculate wins and losses correctly', () => {
    const signals = [
      { result: '✅ WIN⁰ ✅ - Direct WIN' },
      { result: '✅ WIN¹ ✅ - Victory in Martingale 1' },
      { result: '❌ LOSS' },
      { result: '✅ WIN² ✅ - Victory in Martingale 2' },
    ];

    const stats = calculateStats(signals);
    expect(stats.wins).toBe(3);
    expect(stats.losses).toBe(1);
    expect(stats.total).toBe(4);
    expect(stats.accuracy).toBe('75.0%');
  });

  it('should handle empty signals', () => {
    const stats = calculateStats([]);
    expect(stats.wins).toBe(0);
    expect(stats.losses).toBe(0);
    expect(stats.accuracy).toBe('0%');
  });

  it('should ignore null results', () => {
    const signals = [
      { result: '✅ WIN⁰ ✅' },
      { result: null },
      { result: undefined },
    ];

    const stats = calculateStats(signals);
    expect(stats.wins).toBe(1);
    expect(stats.losses).toBe(0);
    expect(stats.total).toBe(1);
  });
});

describe('Streak Calculation', () => {
  it('should detect win streak', () => {
    const signals = [
      { result: '✅ WIN⁰ ✅' },
      { result: '✅ WIN¹ ✅' },
      { result: '✅ WIN² ✅' },
      { result: '❌ LOSS' },
    ];

    const streak = calculateStreak(signals);
    expect(streak.type).toBe('win');
    expect(streak.count).toBe(3);
  });

  it('should detect loss streak', () => {
    const signals = [
      { result: '❌ LOSS' },
      { result: '❌ LOSS' },
      { result: '✅ WIN⁰ ✅' },
    ];

    const streak = calculateStreak(signals);
    expect(streak.type).toBe('loss');
    expect(streak.count).toBe(2);
  });

  it('should handle empty signals', () => {
    const streak = calculateStreak([]);
    expect(streak.type).toBe('win');
    expect(streak.count).toBe(0);
  });

  it('should handle single signal', () => {
    const streak = calculateStreak([{ result: '✅ WIN⁰ ✅' }]);
    expect(streak.type).toBe('win');
    expect(streak.count).toBe(1);
  });
});

describe('Milestone Status', () => {
  it('should find correct milestones', () => {
    expect(getMilestoneStatus(75)).toEqual({
      lastMilestone: 50,
      nextMilestone: 100,
      signalsToNext: 25,
    });

    expect(getMilestoneStatus(500)).toEqual({
      lastMilestone: 500,
      nextMilestone: 750,
      signalsToNext: 250,
    });
  });

  it('should handle signals below first milestone', () => {
    expect(getMilestoneStatus(25)).toEqual({
      lastMilestone: 0,
      nextMilestone: 50,
      signalsToNext: 25,
    });
  });

  it('should handle very high signal counts', () => {
    const result = getMilestoneStatus(12000);
    expect(result.lastMilestone).toBe(10000);
    expect(result.nextMilestone).toBe(12100); // totalSignals + 100
  });
});

describe('Currency Pair Validation', () => {
  it('should validate correct pairs', () => {
    expect(isValidCurrencyPair('EUR/USD (OTC)')).toBe(true);
    expect(isValidCurrencyPair('GBP/JPY (OTC)')).toBe(true);
    expect(isValidCurrencyPair('AUD/CAD (OTC)')).toBe(true);
  });

  it('should reject invalid pairs', () => {
    expect(isValidCurrencyPair('EUR/USD')).toBe(false); // Missing (OTC)
    expect(isValidCurrencyPair('EURUSD (OTC)')).toBe(false); // Missing /
    expect(isValidCurrencyPair('EU/USD (OTC)')).toBe(false); // Too short
    expect(isValidCurrencyPair('EUR/USDD (OTC)')).toBe(false); // Too long
    expect(isValidCurrencyPair('')).toBe(false);
  });
});

describe('Day Formatting', () => {
  it('should format date correctly', () => {
    const formatted = getDayFormatted('2025-01-15');
    expect(formatted).toContain('January');
    expect(formatted).toContain('15');
    expect(formatted).toContain('2025');
  });

  it('should include day of week', () => {
    const formatted = getDayFormatted('2025-01-01'); // Wednesday
    expect(formatted).toContain('Wednesday');
  });
});
