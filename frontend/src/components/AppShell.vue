<template>
  <div class="app">
    <!-- Header -->
    <header class="app-header">
      <div>
        <div class="app-label">Günlük Görevler</div>
      </div>
      <div class="header-right">
        <div class="app-date" :class="dateClass">{{ formattedDate }}</div>
        <div class="task-count">{{ taskCountText }}</div>
      </div>
      <div class="header-actions">
        <button class="theme-toggle-btn" @click="toggleTheme" :aria-label="isDark ? 'Açık temaya geç' : 'Koyu temaya geç'">
          <svg v-if="isDark" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="5"/>
            <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
            <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
          </svg>
          <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
        </button>
        <button class="help-btn" @click="showHelp = true" aria-label="Yardım">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </button>
        <button class="logout-btn" @click="store.logout()" aria-label="Çıkış yap">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
        </button>
      </div>
    </header>

    <SheetTabs @delete-confirm="sheetToDelete = $event" />

    <!-- Sheet delete confirmation -->
    <div v-if="sheetToDelete" class="sheet-delete-confirm">
      <div class="sheet-delete-icon">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="3 6 5 6 21 6"/>
          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
          <path d="M9 6V4h6v2"/>
        </svg>
      </div>
      <p class="sheet-delete-msg">
        <strong>{{ sheetToDelete.name }}</strong> listesi silinsin mi? İçindeki tüm görevler de silinir.
      </p>
      <div class="sheet-delete-actions">
        <button class="btn-danger-sm" @click="confirmDeleteSheet">Sil</button>
        <button class="btn-ghost-sm" @click="sheetToDelete = null">İptal</button>
      </div>
    </div>

    <DateStrip />

    <main class="app-main">
      <TaskList :show-add-form="showAddForm" @close-add="showAddForm = false" />
    </main>

    <footer class="app-footer">
      <button class="add-btn" :aria-expanded="showAddForm" @click="showAddForm = !showAddForm">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        Görev Ekle
      </button>
      <button class="bulk-add-btn" @click="showBulk = true">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
          <line x1="8" y1="18" x2="21" y2="18"/>
          <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/>
          <line x1="3" y1="18" x2="3.01" y2="18"/>
        </svg>
        Toplu Ekle
      </button>
    </footer>

    <HelpModal :show="showHelp" @close="showHelp = false" />
    <BulkAddModal :show="showBulk" @close="showBulk = false" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useTaskStore } from '../stores/tasks';
import SheetTabs from './SheetTabs.vue';
import DateStrip from './DateStrip.vue';
import TaskList from './TaskList.vue';
import HelpModal from './HelpModal.vue';
import BulkAddModal from './BulkAddModal.vue';

const store         = useTaskStore();
const showHelp      = ref(false);
const showBulk      = ref(false);
const showAddForm   = ref(false);
const sheetToDelete = ref(null);
const theme         = ref(localStorage.getItem('medapp_theme') || 'dark');
const isDark        = computed(() => theme.value !== 'light');

function toggleTheme() {
  theme.value = isDark.value ? 'light' : 'dark';
  localStorage.setItem('medapp_theme', theme.value);
  document.documentElement.setAttribute('data-theme', theme.value);
}

async function confirmDeleteSheet() {
  if (!sheetToDelete.value) return;
  await store.deleteSheet(sheetToDelete.value.id);
  sheetToDelete.value = null;
}

function handleKeydown(e) {
  if (e.key !== 'Escape') return;
  if (showHelp.value)         { showHelp.value = false; return; }
  if (showBulk.value)         { showBulk.value = false; return; }
  if (showAddForm.value)      { showAddForm.value = false; return; }
  if (sheetToDelete.value)    { sheetToDelete.value = null; }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown);
  document.documentElement.setAttribute('data-theme', theme.value);
});
onUnmounted(() => document.removeEventListener('keydown', handleKeydown));

const DAYS_TR   = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
const MONTHS_TR = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];

const formattedDate = computed(() => {
  const d = new Date(store.selectedDate + 'T00:00:00');
  return `${DAYS_TR[d.getDay()]}, ${d.getDate()} ${MONTHS_TR[d.getMonth()]}`;
});

const dateClass = computed(() => {
  const today = new Date().toISOString().slice(0, 10);
  if (store.selectedDate < today) return 'app-date--past';
  if (store.selectedDate > today) return 'app-date--future';
  return '';
});

const taskCountText = computed(() => {
  const visible = store.visibleTasks;
  const done    = visible.filter(t => store.isComplete(t.id, store.selectedDate)).length;
  return `${done} / ${visible.length} tamamlandı`;
});
</script>
