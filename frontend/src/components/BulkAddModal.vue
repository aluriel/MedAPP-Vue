<template>
  <div class="bulk-overlay" :class="{ 'is-open': show }" @click.self="$emit('close')">
    <div class="bulk-modal">
      <div class="bulk-modal-header">
        <h2 class="bulk-modal-title">Toplu Görev Ekle</h2>
        <button class="help-close-btn" aria-label="Kapat" @click="$emit('close')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      <div class="bulk-modal-body">
        <p class="bulk-hint">
          Her satıra bir görev: <code>Görev adı // Sıklık // Saat</code>
        </p>
        <p class="bulk-hint-sub">
          Sıklık: <code>0</code>=tek seferlik, <code>1</code>=her gün, <code>N</code>=N günde bir. Saat boş bırakılabilir.
        </p>
        <textarea
          v-model="input"
          class="bulk-textarea"
          rows="8"
          placeholder="İlaç iç // 1 // 08:00&#10;Spor // 2 // 07:30&#10;Fatura öde // 0 //"
        ></textarea>
        <ul v-if="errors.length" class="bulk-error-list">
          <li v-for="(err, i) in errors" :key="i">{{ err }}</li>
        </ul>
        <div class="bulk-actions">
          <button class="btn btn--primary" @click="submit">Ekle</button>
          <button class="btn btn--ghost"   @click="$emit('close')">İptal</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useTaskStore } from '../stores/tasks';

const props = defineProps({ show: Boolean });
const emit   = defineEmits(['close']);
const store  = useTaskStore();
const input  = ref('');
const errors = ref([]);

watch(() => props.show, val => { if (val) { input.value = ''; errors.value = []; } });

function parseLine(line, lineNum) {
  const [rawName, rawCycle, rawTime = ''] = line.split('//').map(p => p.trim());
  if (!rawName)             return { error: `Satır ${lineNum}: Görev adı boş olamaz.` };
  if (rawName.length > 30)  return { error: `Satır ${lineNum}: Görev adı 30 karakterden uzun.` };
  const cycle = parseInt(rawCycle ?? '1', 10);
  if (isNaN(cycle) || cycle < 0) return { error: `Satır ${lineNum}: Sıklık geçersiz.` };
  const timeStr = rawTime.trim();
  if (timeStr && !/^([01]\d|2[0-3]):[0-5]\d$/.test(timeStr))
    return { error: `Satır ${lineNum}: Saat formatı hatalı (SS:DD).` };

  let recurring, recurrence_type, recurrence_interval;
  if (cycle === 0) { recurring = false; recurrence_type = null; recurrence_interval = null; }
  else if (cycle === 1) { recurring = true; recurrence_type = 'daily'; recurrence_interval = null; }
  else { recurring = true; recurrence_type = 'every_n_days'; recurrence_interval = cycle; }

  return { task: {
    name: rawName, time: timeStr, notes: '',
    created_date: store.selectedDate,
    recurring, recurrence_type, recurrence_interval,
  }};
}

function submit() {
  const lines  = input.value.split('\n').filter(l => l.trim());
  const parsed = lines.map((l, i) => parseLine(l, i + 1));
  const errs   = parsed.filter(p => p.error).map(p => p.error);
  if (errs.length) { errors.value = errs; return; }
  parsed.forEach(p => store.addTask(p.task));
  emit('close');
}
</script>
