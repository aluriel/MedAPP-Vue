<template>
  <div class="add-form-wrapper" :class="{ 'is-open': show }">
    <form class="add-form" @submit.prevent="handleSubmit">
      <div class="form-field">
        <label class="form-label" for="newTaskName">Görev Adı</label>
        <input
          id="newTaskName"
          ref="nameInput"
          v-model="name"
          class="form-input"
          type="text"
          placeholder="Görev adı"
          maxlength="50"
          required
        />
      </div>

      <div class="form-field">
        <label class="form-label">Tür</label>
        <div class="form-type-toggle">
          <button type="button" class="type-btn" :class="{ 'type-btn--active': isRecurring }" @click="isRecurring = true">Tekrarlayan</button>
          <button type="button" class="type-btn" :class="{ 'type-btn--active': !isRecurring }" @click="isRecurring = false">Tek seferlik</button>
        </div>
      </div>

      <div v-if="isRecurring" class="form-field">
        <label class="form-label">Sıklık</label>
        <div class="form-recurrence-toggle">
          <button type="button" class="recurrence-btn" :class="{ 'recurrence-btn--active': recurrence === 'daily' }"        @click="recurrence = 'daily'">Her gün</button>
          <button type="button" class="recurrence-btn" :class="{ 'recurrence-btn--active': recurrence === 'weekly' }"       @click="recurrence = 'weekly'">Her hafta</button>
          <button type="button" class="recurrence-btn" :class="{ 'recurrence-btn--active': recurrence === 'every_n_days' }" @click="recurrence = 'every_n_days'">Özel</button>
        </div>
        <div class="recurrence-custom-row" :class="{ 'is-open': recurrence === 'every_n_days' }">
          <span class="recurrence-custom-label">Her</span>
          <input v-model.number="interval" type="number" min="2" max="365" class="form-input recurrence-days-input" />
          <span class="recurrence-custom-label">günde bir</span>
        </div>
      </div>

      <div class="form-row">
        <div class="form-field form-field--time">
          <label class="form-label" for="newTaskTime">Saat</label>
          <input id="newTaskTime" v-model="time" type="time" class="form-input form-input--time" />
        </div>
        <div class="form-field">
          <label class="form-label" for="newTaskNotes">Notlar</label>
          <textarea id="newTaskNotes" v-model="notes" class="form-textarea" placeholder="İsteğe bağlı not…"></textarea>
        </div>
      </div>

      <div class="form-actions">
        <button type="submit" class="btn btn--primary">Kaydet</button>
        <button type="button" class="btn btn--ghost" @click="$emit('close')">İptal</button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useTaskStore } from '../stores/tasks';

const props  = defineProps({ show: Boolean });
const emit   = defineEmits(['close']);
const store  = useTaskStore();

const nameInput  = ref(null);
const name       = ref('');
const isRecurring = ref(true);
const recurrence = ref('daily');
const interval   = ref(2);
const time       = ref('');
const notes      = ref('');

watch(() => props.show, val => {
  if (val) setTimeout(() => nameInput.value?.focus(), 50);
  else reset();
});

function reset() {
  name.value = '';
  isRecurring.value = true;
  recurrence.value  = 'daily';
  interval.value    = 2;
  time.value        = '';
  notes.value       = '';
}

async function handleSubmit() {
  if (!name.value.trim()) return;
  await store.addTask({
    name:                 name.value.trim(),
    time:                 time.value || '',
    notes:                notes.value,
    created_date:         store.selectedDate,
    recurring:            isRecurring.value,
    recurrence_type:      isRecurring.value ? recurrence.value : null,
    recurrence_interval:  isRecurring.value && recurrence.value === 'every_n_days' ? interval.value : null,
  });
  emit('close');
}
</script>
