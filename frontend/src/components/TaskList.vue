<template>
  <div>
    <div v-if="store.loading" class="loading-row">
      <div class="loading-dots">
        <span></span><span></span><span></span>
      </div>
    </div>
    <template v-else>
      <div v-if="!store.visibleTasks.length && !showAddForm" class="empty-state">
        <svg class="empty-icon" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <rect x="3" y="3" width="18" height="18" rx="4"/>
          <line x1="8" y1="8" x2="16" y2="8"/>
          <line x1="8" y1="12" x2="16" y2="12"/>
          <line x1="8" y1="16" x2="12" y2="16"/>
        </svg>
        <div class="empty-title">Görev yok</div>
        <div class="empty-sub">Aşağıdan ilk görevini ekle.</div>
      </div>
      <ul class="task-list">
        <TaskCard v-for="task in store.visibleTasks" :key="task.id" :task="task" />
      </ul>
      <AddTaskForm :show="showAddForm" @close="$emit('close-add')" />
    </template>
  </div>
</template>

<script setup>
import { useTaskStore } from '../stores/tasks';
import TaskCard from './TaskCard.vue';
import AddTaskForm from './AddTaskForm.vue';

defineProps({ showAddForm: Boolean });
defineEmits(['close-add']);
const store = useTaskStore();
</script>
