// Utility functions extracted for testing

/**
 * Get the current trading session based on London time
 */
export const getPresentSession = (): string => {
  const now = new Date();
  const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
  const londonOffset = 1;
  const londonTime = new Date(utcTime + (londonOffset * 3600000));

  const hours = londonTime.getHours();
  const minutes = londonTime.getMinutes();
  const timeInMinutes = hours * 60 + minutes;

  const overnightStart = 6 * 60;
  const overnightEnd = 11 * 60;
  const morningStart = 11 * 60 + 1;
  const morningEnd = 17 * 60;
  const afternoonStart = 17 * 60 + 1;
  const afternoonEnd = 23 * 60 + 59;

  if (timeInMinutes >= overnightStart && timeInMinutes <= overnightEnd) {
    return "OVERNIGHT";
  } else if (timeInMinutes >= morningStart && timeInMinutes <= morningEnd) {
    return "MORNING";
  } else if (timeInMinutes >= afternoonStart && timeInMinutes <= afternoonEnd) {
    return "AFTERNOON";
  } else {
    return "OUTSIDE";
  }
};

/**
 * Get session from specific time in minutes
 */
export const getSessionFromTime = (timeInMinutes: number): string => {
  const overnightStart = 6 * 60;
  const overnightEnd = 11 * 60;
  const morningStart = 11 * 60 + 1;
  const morningEnd = 17 * 60;
  const afternoonStart = 17 * 60 + 1;
  const afternoonEnd = 23 * 60 + 59;

  if (timeInMinutes >= overnightStart && timeInMinutes <= overnightEnd) {
    return "OVERNIGHT";
  } else if (timeInMinutes >= morningStart && timeInMinutes <= morningEnd) {
    return "MORNING";
  } else if (timeInMinutes >= afternoonStart && timeInMinutes <= afternoonEnd) {
    return "AFTERNOON";
  } else {
    return "OUTSIDE";
  }
};

/**
 * Convert number to emoji representation
 */
export const returnEmoji = (count: string): string => {
  const numberToEmoji: { [key: number]: string } = {
    0: '0⃣',
    1: '1⃣',
    2: '2⃣',
    3: '3⃣',
    4: '4⃣',
    5: '5⃣',
    6: '6⃣',
    7: '7⃣',
    8: '8⃣',
    9: '9⃣'
  };

  const ogNumberString = count.split('');
  const modNumberString = ogNumberString.map((num: string) => numberToEmoji[Number(num)]);
  const modString = modNumberString.join('');

  return modString;
};

/**
 * Calculate session accuracy
 */
export const getSessionAccuracy = (wins: number, losses: number): { status: boolean; percentage: string } => {
  const totalSignals = wins + losses;
  if (totalSignals === 0) {
    return { status: false, percentage: '0%' };
  }
  const per = wins / totalSignals;
  return {
    status: true,
    percentage: `${(per * 100).toFixed(2)}%`
  };
};

/**
 * Get formatted day string
 */
export const getDayFormatted = (date: string | null = null): string => {
  const today = date ? new Date(date) : new Date();
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayOfMonth = today.getDate();

  const ordinalSuffix = (n: number) => ['th', 'st', 'nd', 'rd'][((n % 100) - 20) % 10] || ['th', 'st', 'nd', 'rd'][n % 100] || 'th';

  return `${daysOfWeek[today.getDay()]}, ${months[today.getMonth()]} ${dayOfMonth}${ordinalSuffix(dayOfMonth)}, ${today.getFullYear()}`;
};

/**
 * Pad number with leading zero
 */
export const padZero = (num: number): string => num.toString().padStart(2, "0");

/**
 * Get next time with increment
 */
export const getNextTime = (h: number, m: number, increment: number): string => {
  m += increment;
  if (m >= 60) {
    h += Math.floor(m / 60);
    m %= 60;
  }
  h %= 24;
  return `${padZero(h)}:${padZero(m)}`;
};

/**
 * Generate signal message
 */
export const generateSignalMessage = (pair: string, hour: number, minute: number, direction: string): string => {
  const entryTime = `${padZero(hour)}:${padZero(minute)}`;
  const martingaleLevels = [
    getNextTime(hour, minute, 5),
    getNextTime(hour, minute, 10),
    getNextTime(hour, minute, 15),
  ];

  let SIGNAL_MSG = `<strong>${pair}</strong>\n\n`;
  SIGNAL_MSG += `<strong>🕘 ᴇxᴘɪʀᴀᴛɪᴏɴ 5ᴍ</strong>\n`;
  SIGNAL_MSG += `<strong>⏺ Entry at ${entryTime}</strong>\n\n`;
  SIGNAL_MSG += `<strong>${direction}</strong>\n\n`;
  SIGNAL_MSG += `<strong>ᴛᴇʟᴇɢʀᴀᴍ: <a href="https://t.me/gudtradewithmatthew">@ɢᴜᴅᴛʀᴀᴅᴇᴡɪᴛʜᴍᴀᴛᴛʜᴇᴡ</a></strong>\n\n`;
  SIGNAL_MSG += `<strong>🔽 ᴍᴀʀᴛɪɴɢᴀʟᴇ ʟᴇᴠᴇʟꜱ</strong>\n`;
  SIGNAL_MSG += `<strong>1️⃣ ʟᴇᴠᴇʟ ᴀᴛ  ${martingaleLevels[0]}</strong>\n`;
  SIGNAL_MSG += `<strong>2️⃣ ʟᴇᴠᴇʟ ᴀᴛ  ${martingaleLevels[1]}</strong>\n`;
  SIGNAL_MSG += `<strong>3️⃣ ʟᴇᴠᴇʟ ᴀᴛ  ${martingaleLevels[2]}</strong>\n\n`;
  SIGNAL_MSG += `<strong><a href="https://shorturl.at/l6Oot">💹 ᴛʀᴀᴅᴇ ᴛʜɪꜱ ꜱɪɢɴᴀʟ ʜᴇʀᴇ</a></strong>\n\n`;

  return SIGNAL_MSG;
};

/**
 * Calculate stats from signals
 */
export const calculateStats = (signals: Array<{ result?: string | null }>): {
  wins: number;
  losses: number;
  total: number;
  accuracy: string;
} => {
  const wins = signals.filter(s => s.result?.includes('WIN')).length;
  const losses = signals.filter(s => s.result && !s.result.includes('WIN')).length;
  const total = wins + losses;
  const accuracy = total > 0 ? ((wins / total) * 100).toFixed(1) + '%' : '0%';
  return { wins, losses, total, accuracy };
};

/**
 * Calculate current streak from signals
 */
export const calculateStreak = (signals: Array<{ result?: string | null }>): {
  type: 'win' | 'loss';
  count: number;
} => {
  if (signals.length === 0) return { type: 'win', count: 0 };

  const firstResult = signals[0].result;
  const isWin = firstResult?.includes('WIN');
  let count = 0;

  for (const signal of signals) {
    const signalIsWin = signal.result?.includes('WIN');
    if (signalIsWin === isWin) {
      count++;
    } else {
      break;
    }
  }

  return { type: isWin ? 'win' : 'loss', count };
};

/**
 * Find milestone status
 */
export const getMilestoneStatus = (totalSignals: number): {
  lastMilestone: number;
  nextMilestone: number;
  signalsToNext: number;
} => {
  const milestones = [50, 100, 250, 500, 750, 1000, 1500, 2000, 2500, 3000, 5000, 10000];
  const lastMilestone = milestones.filter(m => m <= totalSignals).pop() || 0;
  const nextMilestone = milestones.find(m => m > totalSignals) || totalSignals + 100;
  const signalsToNext = nextMilestone - totalSignals;

  return { lastMilestone, nextMilestone, signalsToNext };
};

/**
 * Validate currency pair format
 */
export const isValidCurrencyPair = (pair: string): boolean => {
  const pairRegex = /^[A-Z]{3}\/[A-Z]{3} \(OTC\)$/;
  return pairRegex.test(pair);
};
