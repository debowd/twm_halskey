'use strict';

import { describe, it, expect, vi, afterEach } from 'vitest';
import cron from 'node-cron';

describe('Cron Expression Validation', () => {
  it('should validate correct cron expressions', () => {
    // Standard cron expressions (minute hour day month weekday)
    expect(cron.validate('0 6 * * *')).toBe(true);  // 6:00 AM daily
    expect(cron.validate('30 11 * * *')).toBe(true); // 11:30 AM daily
    expect(cron.validate('0 17 * * 1-5')).toBe(true); // 5 PM weekdays
    expect(cron.validate('*/5 * * * *')).toBe(true); // Every 5 minutes
    expect(cron.validate('0 0 * * *')).toBe(true); // Midnight
  });

  it('should reject invalid cron expressions', () => {
    expect(cron.validate('invalid')).toBe(false);
    expect(cron.validate('60 * * * *')).toBe(false); // 60 minutes invalid
    expect(cron.validate('* 25 * * *')).toBe(false); // 25 hours invalid
    expect(cron.validate('')).toBe(false);
  });

  // Trading session times
  it('should validate overnight session cron (6:00 - 11:00 London)', () => {
    expect(cron.validate('0 6 * * 1-5')).toBe(true);  // Session start
    expect(cron.validate('0 11 * * 1-5')).toBe(true); // Session end
  });

  it('should validate morning session cron (11:01 - 17:00 London)', () => {
    expect(cron.validate('1 11 * * 1-5')).toBe(true); // Session start
    expect(cron.validate('0 17 * * 1-5')).toBe(true); // Session end
  });

  it('should validate afternoon session cron (17:01 - 23:59 London)', () => {
    expect(cron.validate('1 17 * * 1-5')).toBe(true); // Session start
    expect(cron.validate('59 23 * * 1-5')).toBe(true); // Session end
  });
});

describe('Cron Scheduling', () => {
  let scheduledTask: ReturnType<typeof cron.schedule> | null = null;

  afterEach(() => {
    if (scheduledTask) {
      scheduledTask.stop();
      scheduledTask = null;
    }
  });

  it('should schedule a task without error', () => {
    const mockCallback = vi.fn();

    expect(() => {
      scheduledTask = cron.schedule('* * * * *', mockCallback, {
        name: 'test-task',
        timezone: 'Europe/London'
      });
    }).not.toThrow();
  });

  it('should schedule with timezone option', () => {
    const mockCallback = vi.fn();

    expect(() => {
      scheduledTask = cron.schedule('0 6 * * *', mockCallback, {
        name: 'overnight-start',
        timezone: 'Europe/London'
      });
    }).not.toThrow();

    expect(() => {
      scheduledTask = cron.schedule('0 11 * * *', mockCallback, {
        name: 'overnight-end',
        timezone: 'Africa/Lagos'
      });
    }).not.toThrow();
  });

  it('should be able to stop scheduled task', () => {
    const mockCallback = vi.fn();

    scheduledTask = cron.schedule('* * * * *', mockCallback, {
      name: 'stoppable-task'
    });

    expect(() => {
      scheduledTask?.stop();
    }).not.toThrow();
  });
});

describe('Cron Task Creation', () => {
  it('should create task successfully', () => {
    const mockCallback = vi.fn();

    const task = cron.schedule('0 0 31 2 *', mockCallback, {
      name: 'creation-test'
    });

    expect(task).toBeDefined();
    task.stop();
  });

  it('should create task that can be started and stopped', () => {
    const mockCallback = vi.fn();

    const task = cron.schedule('* * * * *', mockCallback, {
      name: 'start-stop-test'
    });

    expect(() => task.start()).not.toThrow();
    expect(() => task.stop()).not.toThrow();
  });
});

describe('Trading Session Cron Scenarios', () => {
  const sessionCrons = {
    overnight_start: '0 6 * * 1-5',
    overnight_end: '0 11 * * 1-5',
    morning_start: '1 11 * * 1-5',
    morning_end: '0 17 * * 1-5',
    afternoon_start: '1 17 * * 1-5',
    afternoon_end: '59 23 * * 1-5',
    day_end: '0 0 * * 2-6', // Midnight, runs Tue-Sat for Mon-Fri reports
  };

  it('should have all valid session cron expressions', () => {
    Object.entries(sessionCrons).forEach(([name, expression]) => {
      expect(cron.validate(expression), `${name} should be valid`).toBe(true);
    });
  });

  it('should schedule all session crons without error', () => {
    const tasks: ReturnType<typeof cron.schedule>[] = [];
    const mockCallback = vi.fn();

    Object.entries(sessionCrons).forEach(([name, expression]) => {
      expect(() => {
        const task = cron.schedule(expression, mockCallback, {
          name,
          timezone: 'Europe/London'
        });
        tasks.push(task);
      }).not.toThrow();
    });

    // Cleanup
    tasks.forEach(task => task.stop());
  });
});

describe('Timezone Handling', () => {
  const validTimezones = [
    'Europe/London',
    'Africa/Lagos',
    'America/New_York',
    'Asia/Tokyo',
    'UTC',
  ];

  it('should accept valid timezones', () => {
    const mockCallback = vi.fn();

    validTimezones.forEach(timezone => {
      expect(() => {
        const task = cron.schedule('0 0 * * *', mockCallback, {
          name: `tz-test-${timezone}`,
          timezone
        });
        task.stop();
      }).not.toThrow();
    });
  });
});
