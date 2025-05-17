<template>
  <div
    v-show="modelValue"
    class="detail-panel"
    :class="{ show: show }"
    @click="handleClickOutside"
  >
    <div class="detail-panel-content">
      <button
        class="btn-close position-absolute"
        style="top: 20px; right: 20px"
        @click.stop="close"
        aria-label="Close panel"
      ></button>
      <div class="detail-panel-body">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean;
  show: boolean;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "close"): void;
}>();

const close = () => {
  emit("update:modelValue", false);
  emit("close");
};

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  if (target.classList.contains("detail-panel")) {
    close();
  }
};
</script>

<style scoped>
.detail-panel {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.5);
  height: 100vh;
  z-index: 1050;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
}

.detail-panel.show {
  opacity: 1;
  visibility: visible;
}

.detail-panel-content {
  background: white;
  width: 100%;
  max-width: 1000px;
  height: 85vh;
  border-radius: 20px 20px 0 0;
  position: relative;
  transform: translateY(100%);
  transition: transform 0.3s ease;
}

.detail-panel.show .detail-panel-content {
  transform: translateY(0);
}

.detail-panel-body {
  padding: 60px 30px 30px;
  height: 100%;
  overflow-y: auto;
}

.btn-close {
  z-index: 1;
  opacity: 0.5;
  transition: opacity 0.2s;
}

.btn-close:hover {
  opacity: 1;
}
</style>

<script lang="ts">
export default {
  name: "DetailPanel",
};
</script> 