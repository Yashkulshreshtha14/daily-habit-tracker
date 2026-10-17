const STORAGE_KEY = 'little-by-little-habits-v1';
const ICONS = ['📖', '💧', '🧘', '🏃', '✍️', '🌱', '🎨', '😴', '🥗', '📵', '🎸', '☀️'];
const DEFAULT_HABITS = [
  { id: 'water', name: 'Drink a glass of water', icon: '💧', completed: false },
  { id: 'read', name: 'Read for 10 minutes', icon: '📖', completed: false },
  { id: 'move', name: 'Move your body', icon: '🏃', completed: false }
];
const list = document.querySelector('#habit-list');
const empty = document.querySelector('#empty-state');
const dialog = document.querySelector('#habit-dialog');
const form = document.querySelector('#habit-form');
const nameInput = document.querySelector('#habit-name');
let selectedIcon = ICONS[0];
let state = loadState();

function todayKey() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }
function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && Array.isArray(saved.habits)) return { date: saved.date, habits: saved.habits };
  } catch (error) { console.warn('Could not load saved habits.', error); }
  return { date: todayKey(), habits: DEFAULT_HABITS.map(h => ({ ...h })) };
}
function save() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
function rollOverIfNeeded() {
  if (state.date !== todayKey()) {
    state.date = todayKey();
    state.habits = state.habits.map(h => ({ ...h, completed: false }));
    save();
  }
}
function render() {
  rollOverIfNeeded();
  list.replaceChildren();
  empty.hidden = state.habits.length !== 0;
  list.hidden = state.habits.length === 0;
  state.habits.forEach(habit => {
    const row = document.createElement('article');
    row.className = `habit-row${habit.completed ? ' is-done' : ''}`;
    const icon = document.createElement('div'); icon.className = 'habit-icon'; icon.textContent = habit.icon;
    const info = document.createElement('div');
    const title = document.createElement('div'); title.className = 'habit-title'; title.textContent = habit.name;
    const meta = document.createElement('div'); meta.className = 'habit-meta'; meta.textContent = habit.completed ? 'Done for today — nice work' : 'A small step counts';
    info.append(title, meta);
    const actions = document.createElement('div'); actions.className = 'habit-actions';
    const check = document.createElement('button'); check.className = 'check-button'; check.type = 'button'; check.setAttribute('aria-label', `${habit.completed ? 'Unmark' : 'Complete'} ${habit.name}`); check.setAttribute('aria-pressed', String(habit.completed)); check.textContent = habit.completed ? '✓' : '';
    check.addEventListener('click', () => { habit.completed = !habit.completed; save(); render(); });
    const remove = document.createElement('button'); remove.className = 'delete-button'; remove.type = 'button'; remove.setAttribute('aria-label', `Delete ${habit.name}`); remove.textContent = '×';
    remove.addEventListener('click', () => { state.habits = state.habits.filter(h => h.id !== habit.id); save(); render(); });
    actions.append(check, remove); row.append(icon, info, actions); list.append(row);
  });
  const done = state.habits.filter(h => h.completed).length;
  const total = state.habits.length;
  document.querySelector('#progress-text').textContent = `${done} / ${total}`;
  document.querySelector('#progress-bar').style.width = `${total ? done / total * 100 : 0}%`;
  document.querySelector('#progress-note').textContent = !total ? 'Start with one small habit.' : done === total ? 'You showed up for yourself today. ✨' : done ? 'Every small step is a win.' : 'A fresh start is waiting.';
  document.querySelector('#today-label').textContent = new Intl.DateTimeFormat(undefined, { weekday: 'short', month: 'short', day: 'numeric' }).format(new Date());
}
function buildIconPicker() {
  const picker = document.querySelector('#icon-picker'); picker.replaceChildren();
  ICONS.forEach((icon, index) => {
    const button = document.createElement('button'); button.type = 'button'; button.className = `icon-option${index === 0 ? ' selected' : ''}`; button.textContent = icon; button.setAttribute('aria-label', `Choose ${icon}`);
    button.addEventListener('click', () => { selectedIcon = icon; picker.querySelectorAll('.icon-option').forEach(option => option.classList.remove('selected')); button.classList.add('selected'); });
    picker.append(button);
  });
}
function openDialog() { selectedIcon = ICONS[0]; buildIconPicker(); form.reset(); dialog.showModal(); nameInput.focus(); }
document.querySelector('#add-open').addEventListener('click', openDialog);
document.querySelector('#empty-add').addEventListener('click', openDialog);
document.querySelector('#cancel-add').addEventListener('click', () => dialog.close());
form.addEventListener('submit', event => {
  if (event.submitter?.value !== 'save') return;
  event.preventDefault();
  const name = nameInput.value.trim(); if (!name) return;
  state.habits.push({ id: crypto.randomUUID(), name, icon: selectedIcon, completed: false });
  save(); render(); dialog.close();
});
document.querySelector('#reset-day').addEventListener('click', () => {
  if (!state.habits.some(h => h.completed)) return;
  state.habits = state.habits.map(h => ({ ...h, completed: false })); save(); render();
});
render();
