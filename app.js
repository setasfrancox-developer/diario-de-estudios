const STORAGE_KEY = 'studySessions';

function loadSessions() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch (e) {
    return [];
  }
}

function saveSessions(sessions) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

let sessions = loadSessions();

function todayStr() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return y + '-' + m + '-' + day;
}

function strFromDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return y + '-' + m + '-' + day;
}

function dateFromStr(str) {
  const parts = str.split('-');
  return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
}

function studyDays() {
  const set = new Set();
  sessions.forEach(function (s) { set.add(s.date); });
  return set;
}

function computeStreak() {
  const days = studyDays();
  const today = todayStr();

  let cursor = null;
  if (days.has(today)) {
    cursor = today;
  } else {
    const yd = dateFromStr(today);
    yd.setDate(yd.getDate() - 1);
    const ys = strFromDate(yd);
    if (days.has(ys)) {
      cursor = ys;
    } else {
      return 0;
    }
  }

  let count = 0;
  let cur = cursor;
  while (days.has(cur)) {
    count++;
    const d = dateFromStr(cur);
    d.setDate(d.getDate() - 1);
    cur = strFromDate(d);
  }
  return count;
}

function computeBestStreak() {
  const days = Array.from(studyDays()).sort();
  if (days.length === 0) return 0;

  let best = 1;
  let current = 1;
  for (let i = 1; i < days.length; i++) {
    const prev = dateFromStr(days[i - 1]);
    prev.setDate(prev.getDate() + 1);
    if (strFromDate(prev) === days[i]) {
      current++;
      if (current > best) best = current;
    } else {
      current = 1;
    }
  }
  return best;
}

function renderStreaks() {
  const current = computeStreak();
  const best = computeBestStreak();
  document.getElementById('streak').textContent = current;
  document.getElementById('streak-word').textContent = current === 1 ? 'día seguido' : 'días seguidos';
  document.getElementById('best-streak').textContent = best;
  document.getElementById('best-streak-word').textContent = best === 1 ? 'día' : 'días';
}

function renderSessions() {
  const list = document.getElementById('sessions');
  list.innerHTML = '';

  if (sessions.length === 0) {
    const li = document.createElement('li');
    li.className = 'empty';
    li.textContent = 'Todavía no hay sesiones.';
    list.appendChild(li);
    return;
  }

  const sorted = sessions.slice().sort(function (a, b) {
    if (a.date < b.date) return 1;
    if (a.date > b.date) return -1;
    return b.id - a.id;
  });

  sorted.forEach(function (s) {
    const li = document.createElement('li');
    li.className = 'session-item';

    const left = document.createElement('div');
    const topic = document.createElement('div');
    topic.className = 'session-topic';
    topic.textContent = s.topic;
    const meta = document.createElement('div');
    meta.className = 'session-meta';
    meta.textContent = s.date + ' · ' + s.minutes + ' min';
    left.appendChild(topic);
    left.appendChild(meta);

    li.appendChild(left);
    list.appendChild(li);
  });
}

function render() {
  renderStreaks();
  renderSessions();
}

const form = document.getElementById('session-form');
const dateInput = document.getElementById('date');
const topicInput = document.getElementById('topic');
const minutesInput = document.getElementById('minutes');

dateInput.value = todayStr();
dateInput.max = todayStr();

form.addEventListener('submit', function (e) {
  e.preventDefault();
  const date = dateInput.value;
  const topic = topicInput.value.trim();
  const minutes = Number(minutesInput.value);

  if (!date || !topic || !(minutes > 0) || date > todayStr()) {
    return;
  }

  sessions.push({
    id: Date.now(),
    date: date,
    topic: topic,
    minutes: minutes
  });
  saveSessions(sessions);
  render();

  topicInput.value = '';
  minutesInput.value = '';
  dateInput.value = todayStr();
  dateInput.max = todayStr();
});

render();