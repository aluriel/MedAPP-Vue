<template>
  <div class="sheet-tabs-wrapper">
    <div class="sheet-tabs">
      <button
        v-for="sheet in store.sheets"
        :key="sheet.id"
        class="sheet-tab"
        :class="{ 'sheet-tab--active': sheet.id === store.currentSheetId }"
        @click="store.setCurrentSheet(sheet.id)"
      >
        <span
          :ref="el => { if (el) nameRefs[sheet.id] = el; }"
          class="sheet-tab__name"
          @dblclick.stop="beginRename(sheet)"
        >{{ sheet.name }}</span>
        <button
          class="sheet-tab__delete"
          aria-label="Listeyi sil"
          @click.stop="$emit('delete-confirm', sheet)"
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </button>
    </div>
    <button class="sheet-add-btn" aria-label="Yeni liste ekle" @click="addSheet">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
      </svg>
    </button>
  </div>
</template>

<script setup>
import { reactive, nextTick } from 'vue';
import { useTaskStore } from '../stores/tasks';

defineEmits(['delete-confirm']);
const store    = useTaskStore();
const nameRefs = reactive({});

async function addSheet() {
  const sheet = await store.addSheet('Yeni Liste');
  if (sheet) {
    await nextTick();
    beginRename(sheet);
  }
}

function beginRename(sheet) {
  const el = nameRefs[sheet.id];
  if (!el) return;

  el.contentEditable = 'true';
  el.focus();

  const range = document.createRange();
  range.selectNodeContents(el);
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);

  function finish() {
    el.contentEditable = 'false';
    const newName = el.textContent.trim();
    if (!newName) {
      el.textContent = sheet.name;
    } else if (newName !== sheet.name) {
      store.renameSheet(sheet.id, newName);
    }
  }

  function onKey(e) {
    if (e.key === 'Enter') { e.preventDefault(); el.blur(); }
    if (e.key === 'Escape') { el.textContent = sheet.name; el.blur(); }
  }

  el.addEventListener('blur', finish, { once: true });
  el.addEventListener('keydown', onKey);
}
</script>
