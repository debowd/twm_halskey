/**
 * Get the current trading session based on London time
 */
export declare const getPresentSession: () => string;
/**
 * Get session from specific time in minutes
 */
export declare const getSessionFromTime: (timeInMinutes: number) => string;
/**
 * Convert number to emoji representation
 */
export declare const returnEmoji: (count: string) => string;
/**
 * Calculate session accuracy
 */
export declare const getSessionAccuracy: (wins: number, losses: number) => {
    status: boolean;
    percentage: string;
};
/**
 * Get formatted day string
 */
export declare const getDayFormatted: (date?: string | null) => string;
/**
 * Pad number with leading zero
 */
export declare const padZero: (num: number) => string;
/**
 * Get next time with increment
 */
export declare const getNextTime: (h: number, m: number, increment: number) => string;
/**
 * Generate signal message
 */
export declare const generateSignalMessage: (pair: string, hour: number, minute: number, direction: string) => string;
/**
 * Calculate stats from signals
 */
export declare const calculateStats: (signals: Array<{
    result?: string | null;
}>) => {
    wins: number;
    losses: number;
    total: number;
    accuracy: string;
};
/**
 * Calculate current streak from signals
 */
export declare const calculateStreak: (signals: Array<{
    result?: string | null;
}>) => {
    type: "win" | "loss";
    count: number;
};
/**
 * Find milestone status
 */
export declare const getMilestoneStatus: (totalSignals: number) => {
    lastMilestone: number;
    nextMilestone: number;
    signalsToNext: number;
};
/**
 * Validate currency pair format
 */
export declare const isValidCurrencyPair: (pair: string) => boolean;
//# sourceMappingURL=utils.d.ts.map