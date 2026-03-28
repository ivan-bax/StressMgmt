const Storage = {
  KEY: 'stress_reset_data',

  _getData() {
    try {
      return JSON.parse(localStorage.getItem(this.KEY)) || { sessions: [], streak: 0, lastDate: null };
    } catch {
      return { sessions: [], streak: 0, lastDate: null };
    }
  },

  _save(data) {
    localStorage.setItem(this.KEY, JSON.stringify(data));
  },

  logSession(type, durationSec) {
    const data = this._getData();
    const today = new Date().toISOString().slice(0, 10);
    data.sessions.push({ type, durationSec, date: today, ts: Date.now() });

    if (data.lastDate !== today) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      data.streak = data.lastDate === yesterday ? data.streak + 1 : 1;
      data.lastDate = today;
    }

    this._save(data);
    return data;
  },

  getStats() {
    const data = this._getData();
    const today = new Date().toISOString().slice(0, 10);
    const todaySessions = data.sessions.filter(s => s.date === today);
    const totalMinutes = Math.round(data.sessions.reduce((a, s) => a + s.durationSec, 0) / 60);
    const todayMinutes = Math.round(todaySessions.reduce((a, s) => a + s.durationSec, 0) / 60);

    // Check streak continuity
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    let streak = data.streak;
    if (data.lastDate && data.lastDate !== today && data.lastDate !== yesterday) {
      streak = 0;
    }

    return {
      totalSessions: data.sessions.length,
      totalMinutes,
      todaySessions: todaySessions.length,
      todayMinutes,
      streak,
      last7Days: this._last7Days(data.sessions)
    };
  },

  _last7Days(sessions) {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
      const count = sessions.filter(s => s.date === d).length;
      days.push({ date: d, count, label: new Date(d).toLocaleDateString('en', { weekday: 'short' }) });
    }
    return days;
  }
};
