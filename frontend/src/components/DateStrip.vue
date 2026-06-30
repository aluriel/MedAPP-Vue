<template>
  <div class="date-strip-wrapper">
    <div class="date-strip">
      <button
        v-for="chip in chips"
        :key="chip.date"
        class="date-chip"
        :class="{
          'date-chip--today':    chip.isToday,
          'date-chip--past':     chip.isPast,
          'date-chip--selected': chip.date === store.selectedDate,
        }"
        @click="store.setSelectedDate(chip.date)"
      >
        <span class="date-chip__day">{{ chip.dayLabel }}</span>
        <span class="date-chip__num">{{ chip.dayNum }}</span>
        <span class="date-chip__dot" :class="`date-chip__dot--${chip.dotState}`"></span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useTaskStore } from '../stores/tasks';

const store    = useTaskStore();
const DAYS_TR  = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];

const chips = computed(() => {
  const result = [];
  const today  = new Date();
  for (let i = -3; i <= 3; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    const visible = store.tasks.filter(t => store.isTaskVisibleOnDate(t, dateStr));
    const done    = visible.filter(t => store.isComplete(t.id, dateStr)).length;
    const total   = visible.length;
    const dotState = total === 0 ? 'none' : done === total ? 'full' : 'partial';

    result.push({
      date: dateStr,
      dayLabel: DAYS_TR[d.getDay()],
      dayNum:   d.getDate(),
      isToday:  i === 0,
      isPast:   i < 0,
      dotState,
    });
  }
  return result;
});
</script>
