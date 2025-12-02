import { DBSignal, DBCron, DBCronPost, History } from './types.js';
declare class Database {
    private pool;
    private queries;
    private channelId;
    constructor(channelName: string);
    private initializeChannelId;
    getChannelId: () => number;
    getChannelCrons: () => Promise<DBCron[]>;
    getChannelCronPosts: () => Promise<DBCronPost[]>;
    getDaySignals: () => Promise<DBSignal[]>;
    getWeekSignals: () => Promise<DBSignal[]>;
    getSessionSignals: (session: string) => Promise<DBSignal[]>;
    saveSignal: (signal: History, session: string) => Promise<void>;
    updateSignal: (result: string) => Promise<void>;
    validate: (presentSession: string) => Promise<DBSignal[]>;
    getMonthSignals: () => Promise<DBSignal[]>;
    getTotalSignalCount: () => Promise<number>;
    getCurrentStreak: () => Promise<{
        type: "win" | "loss";
        count: number;
    }>;
    getStats: () => Promise<{
        today: {
            wins: number;
            losses: number;
            total: number;
            accuracy: string;
        };
        week: {
            wins: number;
            losses: number;
            total: number;
            accuracy: string;
        };
        month: {
            wins: number;
            losses: number;
            total: number;
            accuracy: string;
        };
        allTime: number;
        streak: {
            type: "win" | "loss";
            count: number;
        };
    }>;
}
export default Database;
//# sourceMappingURL=database.d.ts.map