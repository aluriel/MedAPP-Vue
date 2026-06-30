<template>
  <li
    class="task-card"
    :class="{
      'task-card--completed':  isCompleted,
      'task-card--completing': completing,
    }"
  >
    <div class="task-row">
      <!-- Checkbox -->
      <button
        class="task-checkbox"
        :aria-label="isCompleted ? 'Tamamlanmadı olarak işaretle' : 'Tamamlandı olarak işaretle'"
        @click="handleToggle"
      >
        <svg class="checkbox-svg" viewBox="0 0 26 26">
          <circle class="checkbox-bg" r="11" cx="13" cy="13" />
          <circle class="checkbox-stroke" r="11" cx="13" cy="13" />
          <polyline class="checkbox-check" points="8,13 11.5,16.5 18,9.5" />
        </svg>
      </button>

      <!-- Task Name (contenteditable) -->
      <span
        ref="nameEl"
        class="task-name"
        contenteditable="true"
        spellcheck="false"
        @blur="saveName"
        @keydown.enter.prevent="nameEl.blur()"
        @keydown.escape="revertName"
      >{{ task.name }}</span>

      <!-- Time Badge (contenteditable) -->
      <span
        ref="timeEl"
        class="task-time"
        contenteditable="true"
        spellcheck="false"
        role="textbox"
        :aria-label="task.time ? `Saat: ${task.time}` : 'Saat ekle'"
        :data-empty="task.time ? undefined : 'true'"
        @focus="selectAll"
        @blur="saveTime"
        @keydown.enter.prevent="timeEl.blur()"
        @keydown.escape="revertTime"
      >{{ task.time || '' }}</span>

      <!-- Recurrence badge -->
      <span v-if="task.recurring" class="task-recurrence-badge">{{ recurrenceLabel }}</span>
      <span v-else class="task-onetime-badge">
        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        1×
      </span>

      <!-- Delete -->
      <button class="task-delete" aria-label="Görevi sil" @click="store.deleteTask(task.id)">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>

    <!-- Notes toggle (only shown if task has notes or notes area is open) -->
    <template v-if="task.notes || notesOpen">
      <button
        class="task-notes-toggle"
        :aria-expanded="notesOpen"
        @click="notesOpen = !notesOpen"
      >
        <span class="notes-toggle-label">{{ task.notes ? task.notes.slice(0, 50) : 'Not ekle…' }}</span>
        <svg class="notes-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </button>
      <div class="task-notes-body" :class="{ 'is-open': notesOpen }">
        <textarea
          class="task-notes-text"
          placeholder="Not ekle…"
          :value="task.notes"
          @blur="e => store.updateTask(task.id, { notes: e.target.value })"
        ></textarea>
      </div>
    </template>
  </li>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useTaskStore } from '../stores/tasks';

const props = defineProps({ task: Object });
const store = useTaskStore();

const nameEl    = ref(null);
const timeEl    = ref(null);
const completing = ref(false);
const notesOpen  = ref(false);

const isCompleted = computed(() => store.isComplete(props.task.id, store.selectedDate));

const recurrenceLabel = computed(() => {
  if (props.task.recurrence_type === 'daily')        return 'Her gün';
  if (props.task.recurrence_type === 'weekly')       return 'Her hafta';
  if (props.task.recurrence_type === 'every_n_days') return `${props.task.recurrence_interval}g`;
  return '';
});

async function handleToggle() {
  if (!isCompleted.value) {
    completing.value = true;
    setTimeout(() => { completing.value = false; }, 600);
  }
  await store.toggleComplete(props.task.id, store.selectedDate);
}

function saveName() {
  const val = nameEl.value?.textContent.trim();
  if (val && val !== props.task.name) store.updateTask(props.task.id, { name: val });
  else if (!val && nameEl.value) nameEl.value.textContent = props.task.name;
}
function revertName() {
  if (nameEl.value) nameEl.value.textContent = props.task.name;
  nameEl.value?.blur();
}

function saveTime() {
  const val = timeEl.value?.textContent.trim();
  if (val === '') {
    store.updateTask(props.task.id, { time: '' });
  } else if (/^([01]\d|2[0-3]):[0-5]\d$/.test(val)) {
    store.updateTask(props.task.id, { time: val });
  } else {
    if (timeEl.value) timeEl.value.textContent = props.task.time || '';
  }
}
function revertTime() {
  if (timeEl.value) timeEl.value.textContent = props.task.time || '';
  timeEl.value?.blur();
}

function selectAll() {
  if (!props.task.time) return;
  const el = timeEl.value;
  if (!el) return;
  const range = document.createRange();
  range.selectNodeContents(el);
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);
}

// Keep contenteditable in sync when the store updates the task externally
watch(() => props.task.name, val => {
  if (nameEl.value && document.activeElement !== nameEl.value) nameEl.value.textContent = val;
});
watch(() => props.task.time, val => {
  if (timeEl.value && document.activeElement !== timeEl.value) timeEl.value.textContent = val || '';
});
</script>
