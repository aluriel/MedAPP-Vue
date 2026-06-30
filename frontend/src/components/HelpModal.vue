<template>
  <div class="help-overlay" :class="{ 'is-open': show }" @click.self="$emit('close')">
    <div class="help-modal">
      <div class="help-modal-header">
        <h2 class="help-modal-title">Nasıl Kullanılır?</h2>
        <button class="help-close-btn" aria-label="Kapat" @click="$emit('close')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      <div class="help-modal-body">
        <div class="help-section">
          <div class="help-section-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <div>
            <div class="help-section-title">Görev Tamamlama</div>
            <div class="help-section-text">Soldaki daireye tıkla. Tekrar tıklayarak geri al.</div>
          </div>
        </div>
        <div class="help-section">
          <div class="help-section-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </div>
          <div>
            <div class="help-section-title">Ad ve Saat Düzenleme</div>
            <div class="help-section-text">Görev adına veya mavi saat rozetine tıkla, yaz, Enter ile kaydet veya Esc ile iptal et.</div>
          </div>
        </div>
        <div class="help-section">
          <div class="help-section-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              <path d="M9 6V4h6v2"/>
            </svg>
          </div>
          <div>
            <div class="help-section-title">Silme</div>
            <div class="help-section-text">Kart üzerinde beliren × butonuna tıkla.</div>
          </div>
        </div>
        <div class="help-section">
          <div class="help-section-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
          <div>
            <div class="help-section-title">Tarih Gezintisi</div>
            <div class="help-section-text">Üstteki tarih şeridinde farklı günleri görüntüle. Geçmiş günler salt okunurdur.</div>
          </div>
        </div>
        <div class="help-section">
          <div class="help-section-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
              <line x1="8" y1="18" x2="21" y2="18"/>
              <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/>
              <line x1="3" y1="18" x2="3.01" y2="18"/>
            </svg>
          </div>
          <div>
            <div class="help-section-title">Toplu Ekleme</div>
            <div class="help-section-text">
              "Toplu Ekle" butonuyla birden fazla görevi aynı anda ekle.<br/>
              Format: <code style="font-family:monospace;font-size:0.85em;background:rgba(255,255,255,0.1);padding:1px 5px;border-radius:3px">Görev adı // Sıklık // Saat</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({ show: Boolean });
defineEmits(['close']);
</script>
