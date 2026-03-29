import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'stress_reset_data';

interface Session {
  type: string;
  durationSec: number;
  date: string;
  ts: number;
}

interface Data {
  sessions: Session[];
  streak: number;
  lastDate: string | null;
}

interface DayData {
  date: string;
  count: number;
  label: string;
}

export interface Stats {
  totalSessions: number;
  totalMinutes: number;
  todaySessions: number;
  todayMinutes: number;
  streak: number;
  last7Days: DayData[];
}

async function getData(): Promise<Data> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : { sessions: [], streak: 0, lastDate: null };
  } catch {
    return { sessions: [], streak: 0, lastDate: null };
  }
}

async function save(data: Data) {
  await AsyncStorage.setItem(KEY, JSON.stringify(data));
}

export async function logSession(type: string, durationSec: number): Promise<Data> {
  const data = await getData();
  const today = new Date().toISOString().slice(0, 10);
  data.sessions.push({ type, durationSec, date: today, ts: Date.now() });

  if (data.lastDate !== today) {
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    data.streak = data.lastDate === yesterday ? data.streak + 1 : 1;
    data.lastDate = today;
  }

  await save(data);
  return data;
}

function last7Days(sessions: Session[]): DayData[] {
  const days: DayData[] = [];
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    const dateStr = d.toISOString().slice(0, 10);
    const count = sessions.filter(s => s.date === dateStr).length;
    days.push({ date: dateStr, count, label: weekdays[d.getDay()] });
  }
  return days;
}

export async function getStats(): Promise<Stats> {
  const data = await getData();
  const today = new Date().toISOString().slice(0, 10);
  const todaySessions = data.sessions.filter(s => s.date === today);
  const totalMinutes = Math.round(data.sessions.reduce((a, s) => a + s.durationSec, 0) / 60);
  const todayMinutes = Math.round(todaySessions.reduce((a, s) => a + s.durationSec, 0) / 60);

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
    last7Days: last7Days(data.sessions),
  };
}
