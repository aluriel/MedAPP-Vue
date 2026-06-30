<template>
  <div class="login-screen">
    <div class="login-card">
      <div class="login-label">Günlük Görevler</div>
      <form class="login-form" @submit.prevent="handleSubmit">
        <div class="form-field">
          <label class="form-label" for="loginUsername">Kullanıcı Adı</label>
          <input
            id="loginUsername"
            v-model="username"
            class="form-input"
            type="text"
            placeholder="kullanici_adi"
            autocomplete="username"
            autocapitalize="none"
            required
          />
        </div>
        <div class="form-field">
          <label class="form-label" for="loginPassword">Şifre</label>
          <input
            id="loginPassword"
            v-model="password"
            class="form-input"
            type="password"
            autocomplete="current-password"
            required
          />
        </div>
        <div class="login-error" role="alert">{{ error }}</div>
        <button type="submit" class="btn btn--primary btn--full" :disabled="busy">
          {{ busy ? 'Giriş yapılıyor…' : 'Giriş Yap' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useTaskStore } from '../stores/tasks';

const store    = useTaskStore();
const username = ref('');
const password = ref('');
const error    = ref('');
const busy     = ref(false);

async function handleSubmit() {
  error.value = '';
  busy.value  = true;
  try {
    await store.login(username.value, password.value);
  } catch (e) {
    error.value = e.message;
  } finally {
    busy.value = false;
  }
}
</script>
