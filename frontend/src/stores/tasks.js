import { defineStore } from 'pinia';
import { ref, computed, reactive } from 'vue';
import { supabase } from '../lib/supabase';
import { api } from '../lib/api';

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export const useTaskStore = defineStore('tasks', () => {
  const currentUser     = ref(null);
  const currentSheetId  = ref(null);
  const selectedDate    = ref(todayStr());
  const sheets          = ref([]);
  const tasks           = ref([]);
  const completionsByDate = reactive({}); // { [date]: Set<taskId> } — reactive() handles Set mutations
  const loading         = ref(false);
  const pendingTaskIds  = new Set(); // task IDs that are in-flight (not yet confirmed by server)

  // ── Auth ────────────────────────────────────────────────
  async function init() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      currentUser.value = session.user.email.split('@')[0];
      await loadSheets();
    }
  }

  async function login(username, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: `${username.trim().toLowerCase()}@medapp.local`,
      password,
    });
    if (error || !data.user) throw new Error('Kullanıcı adı veya şifre hatalı');
    currentUser.value = username.trim().toLowerCase();
    await loadSheets();
  }

  async function logout() {
    await supabase.auth.signOut();
    currentUser.value = null;
    currentSheetId.value = null;
    sheets.value = [];
    tasks.value = [];
    Object.keys(completionsByDate).forEach(k => delete completionsByDate[k]);
  }

  // ── Sheets ──────────────────────────────────────────────
  async function loadSheets() {
    const data = await api.get('/sheets');
    sheets.value = data;
    const saved = localStorage.getItem(`medapp_activesheet_${currentUser.value}`);
    const active = sheets.value.find(s => s.id === saved) || sheets.value[0];
    if (active) await setCurrentSheet(active.id);
  }

  async function setCurrentSheet(sheetId) {
    currentSheetId.value = sheetId;
    if (currentUser.value) {
      localStorage.setItem(`medapp_activesheet_${currentUser.value}`, sheetId);
    }
    await loadTasks();
  }

  async function addSheet(name) {
    const sort_order = sheets.value.length;
    const tempId = crypto.randomUUID();
    sheets.value.push({ id: tempId, name, sort_order });
    const saved = await api.post('/sheets', { name, sort_order });
    const idx = sheets.value.findIndex(s => s.id === tempId);
    if (idx !== -1) sheets.value[idx] = saved;
    await setCurrentSheet(saved.id);
    return saved;
  }

  async function renameSheet(sheetId, newName) {
    const sheet = sheets.value.find(s => s.id === sheetId);
    if (sheet) sheet.name = newName;
    await api.patch(`/sheets/${sheetId}`, { name: newName });
  }

  async function deleteSheet(sheetId) {
    sheets.value = sheets.value.filter(s => s.id !== sheetId);
    if (currentSheetId.value === sheetId) {
      tasks.value = [];
      Object.keys(completionsByDate).forEach(k => delete completionsByDate[k]);
      const next = sheets.value[0];
      if (next) await setCurrentSheet(next.id);
      else currentSheetId.value = null;
    }
    await api.del(`/sheets/${sheetId}`);
  }

  // ── Tasks ────────────────────────────────────────────────
  async function loadTasks() {
    if (!currentSheetId.value) return;
    const sheetId = currentSheetId.value;
    loading.value = true;
    try {
      const data = await api.get(`/tasks?sheetId=${sheetId}`);
      if (currentSheetId.value !== sheetId) return;
      // Merge back any tasks that were added optimistically and are still in-flight
      const stillPending = tasks.value.filter(
        t => pendingTaskIds.has(t.id) && t.sheet_id === sheetId
      );
      tasks.value = [...data, ...stillPending];
      await loadCompletions();
    } finally {
      if (currentSheetId.value === sheetId) loading.value = false;
    }
  }

  async function loadCompletions() {
    const rows = await api.get('/completions');
    Object.keys(completionsByDate).forEach(k => delete completionsByDate[k]);
    for (const row of rows) {
      if (!completionsByDate[row.date]) completionsByDate[row.date] = new Set();
      completionsByDate[row.date].add(row.task_id);
    }
  }

  async function addTask(taskData) {
    const task = {
      id: crypto.randomUUID(),
      sheet_id: currentSheetId.value,
      sort_order: tasks.value.length,
      notes: '',
      time: '',
      ...taskData,
    };
    if (!task.time) task.time = '09:00';
    tasks.value.push(task);
    pendingTaskIds.add(task.id);
    try {
      const saved = await api.post('/tasks', task);
      const idx = tasks.value.findIndex(t => t.id === task.id);
      if (idx !== -1) tasks.value[idx] = saved;
    } catch (err) {
      console.error('addTask failed:', err);
      tasks.value = tasks.value.filter(t => t.id !== task.id);
    } finally {
      pendingTaskIds.delete(task.id);
    }
  }

  async function updateTask(id, fields) {
    const idx = tasks.value.findIndex(t => t.id === id);
    if (idx !== -1) Object.assign(tasks.value[idx], fields);
    await api.patch(`/tasks/${id}`, fields);
  }

  async function deleteTask(id) {
    tasks.value = tasks.value.filter(t => t.id !== id);
    await api.del(`/tasks/${id}`);
  }

  async function toggleComplete(taskId, date) {
    if (!completionsByDate[date]) completionsByDate[date] = new Set();
    const set = completionsByDate[date];
    if (set.has(taskId)) {
      set.delete(taskId);
      api.del('/completions', { task_id: taskId, date });
    } else {
      set.add(taskId);
      api.post('/completions', { task_id: taskId, date });
    }
  }

  function isComplete(taskId, date) {
    return completionsByDate[date]?.has(taskId) ?? false;
  }

  function isTaskVisibleOnDate(task, date) {
    const target  = new Date(date + 'T00:00:00');
    const created = new Date((task.created_date || todayStr()) + 'T00:00:00');

    if (task.recurring) {
      const diff = Math.round((target - created) / 86400000);
      if (diff < 0) return false;
      if (task.recurrence_type === 'daily')        return true;
      if (task.recurrence_type === 'weekly')       return diff % 7 === 0;
      if (task.recurrence_type === 'every_n_days') return diff % task.recurrence_interval === 0;
      return true;
    } else {
      if (target < created) return false;
      const completedOn = Object.entries(completionsByDate)
        .find(([, set]) => set.has(task.id))?.[0];
      if (!completedOn) return true;
      return date === completedOn;
    }
  }

  const visibleTasks = computed(() =>
    tasks.value.filter(t => isTaskVisibleOnDate(t, selectedDate.value))
  );

  function setSelectedDate(date) {
    selectedDate.value = date;
  }

  return {
    currentUser, currentSheetId, selectedDate, sheets, tasks, completionsByDate, loading,
    init, login, logout, loadSheets, setCurrentSheet, addSheet, renameSheet, deleteSheet,
    loadTasks, addTask, updateTask, deleteTask, toggleComplete, isComplete,
    setSelectedDate, visibleTasks, isTaskVisibleOnDate,
  };
});
