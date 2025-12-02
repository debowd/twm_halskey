import pg from 'pg';
import dotenv from 'dotenv';
const { Pool } = pg;
dotenv.config();
class Database {
    pool;
    queries;
    channelId;
    constructor(channelName) {
        this.pool = new Pool({
            connectionString: `postgresql://postgres.gktmbqflwqgrlggxrbse:${process.env.POSTGRES_PASS}@aws-0-eu-west-1.pooler.supabase.com:6543/postgres`,
            ssl: {
                rejectUnauthorized: false
            }
        });
        this.queries = {
            getChannelByName: `SELECT * FROM channels WHERE name = $1`,
            getChannelCrons: `SELECT * FROM crons WHERE telegram_id = $1`,
            getChannelCronPosts: `SELECT * FROM cron_posts WHERE telegram_id = $1`,
            getAllChannelSignals: `SELECT * FROM signals WHERE telegram_id = $1`,
            getDaySignals: `SELECT * FROM signals WHERE telegram_id = $1 AND DATE(time_stamp) = CURRENT_DATE ORDER BY session ASC`,
            getWeekSignals: `SELECT * FROM signals WHERE telegram_id = $1 AND time_stamp >= NOW() - INTERVAL '7 days' ORDER BY time_stamp ASC`,
            getMonthSignals: `SELECT * FROM signals WHERE telegram_id = $1 AND time_stamp >= NOW() - INTERVAL '30 days' ORDER BY time_stamp ASC`,
            getSignalsBySession: `SELECT * FROM signals WHERE telegram_id = $1 AND session = $2 AND DATE(time_stamp) = CURRENT_DATE`,
            createSignal: `INSERT INTO signals (session, pair, direction, initial_time, telegram_id) VALUES ($1, $2, $3, $4, $5)`,
            updateSignalResult: `UPDATE signals SET result = $1 WHERE time_stamp = (SELECT time_stamp FROM signals WHERE telegram_id = $2 ORDER BY time_stamp DESC LIMIT 1)`,
            checkNullResultsInSession: `SELECT * FROM signals WHERE telegram_id = $1 AND session = $2 AND Date(time_stamp) = CURRENT_DATE AND result IS NULL ORDER BY time_stamp DESC`,
            getTotalSignalCount: `SELECT COUNT(*) as total FROM signals WHERE telegram_id = $1`,
            getRecentSignalsForStreak: `SELECT result FROM signals WHERE telegram_id = $1 AND result IS NOT NULL ORDER BY time_stamp DESC LIMIT 50`
        };
        this.channelId = -1002034301016;
        // this.channelId = -1002101961419;
        // this.initializeChannelId(channelName);
    }
    initializeChannelId = async (channelName) => {
        const result = await this.pool.query(this.queries.getChannelByName, [channelName]);
        return Number(result.rows[0].telegram_id);
    };
    getChannelId = () => this.channelId;
    getChannelCrons = async () => {
        const result = await this.pool.query(this.queries.getChannelCrons, [this.channelId]);
        return result.rows;
    };
    getChannelCronPosts = async () => {
        const result = await this.pool.query(this.queries.getChannelCronPosts, [this.channelId]);
        return result.rows;
    };
    getDaySignals = async () => {
        const result = await this.pool.query(this.queries.getDaySignals, [this.channelId]);
        return result.rows;
    };
    getWeekSignals = async () => {
        const result = await this.pool.query(this.queries.getWeekSignals, [this.channelId]);
        return result.rows;
    };
    getSessionSignals = async (session) => {
        const result = await this.pool.query(this.queries.getSignalsBySession, [this.channelId, session.toLocaleUpperCase()]);
        return result.rows;
    };
    saveSignal = async (signal, session) => {
        await this.pool.query(this.queries.createSignal, [session, signal.pair, signal.direction, signal.initialTime, this.channelId]);
    };
    updateSignal = async (result) => {
        await this.pool.query(this.queries.updateSignalResult, [result, this.channelId]);
    };
    validate = async (presentSession) => {
        const result = await this.pool.query(this.queries.checkNullResultsInSession, [this.channelId, presentSession]);
        return result.rows;
    };
    getMonthSignals = async () => {
        const result = await this.pool.query(this.queries.getMonthSignals, [this.channelId]);
        return result.rows;
    };
    getTotalSignalCount = async () => {
        const result = await this.pool.query(this.queries.getTotalSignalCount, [this.channelId]);
        return parseInt(result.rows[0].total);
    };
    getCurrentStreak = async () => {
        const result = await this.pool.query(this.queries.getRecentSignalsForStreak, [this.channelId]);
        const signals = result.rows;
        if (signals.length === 0)
            return { type: 'win', count: 0 };
        const firstResult = signals[0].result;
        const isWin = firstResult?.includes('WIN');
        let count = 0;
        for (const signal of signals) {
            const signalIsWin = signal.result?.includes('WIN');
            if (signalIsWin === isWin) {
                count++;
            }
            else {
                break;
            }
        }
        return { type: isWin ? 'win' : 'loss', count };
    };
    getStats = async () => {
        const calculateStats = (signals) => {
            const wins = signals.filter(s => s.result?.includes('WIN')).length;
            const losses = signals.filter(s => s.result && !s.result.includes('WIN')).length;
            const total = wins + losses;
            const accuracy = total > 0 ? ((wins / total) * 100).toFixed(1) + '%' : '0%';
            return { wins, losses, total, accuracy };
        };
        const [daySignals, weekSignals, monthSignals, allTime, streak] = await Promise.all([
            this.getDaySignals(),
            this.getWeekSignals(),
            this.getMonthSignals(),
            this.getTotalSignalCount(),
            this.getCurrentStreak()
        ]);
        return {
            today: calculateStats(daySignals),
            week: calculateStats(weekSignals),
            month: calculateStats(monthSignals),
            allTime,
            streak
        };
    };
}
export default Database;
//# sourceMappingURL=database.js.map