<template>
  <LoginView v-if="!store.currentUser" />
  <AppShell v-else />
</template>

<script setup>
import { onMounted } from 'vue';
import { useTaskStore } from './stores/tasks';
import LoginView from './components/LoginView.vue';
import AppShell from './components/AppShell.vue';

const store = useTaskStore();
onMounted(() => store.init());
</script>
