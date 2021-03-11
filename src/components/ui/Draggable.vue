<template>
  <VueDraggable
    v-model="localValue"
    :tag="tag"
    :handle="`.${handleClass}`"
    :animation="animation"
    :ghost-class="ghostClass"
  >
    <slot />
  </VueDraggable>
</template>

<script>
import VueDraggable from 'vuedraggable';

export default /*#__PURE__*/ {
  name: 'Draggable',
  components: {
    VueDraggable,
  },
  props: {
    value: { type: Array, required: true },
    handleClass: { type: String, required: true },
    tag: { type: String, default: 'div' },
    animation: { type: Number, default: 200 },
    ghostClass: { type: String, default: 'ghost' },
  },
  emits: ['input'],
  computed: {
    localValue: {
      get() {
        return this.value;
      },
      set(val) {
        this.$emit('input', val);
      },
    },
  },
};
</script>

<style lang="scss">
@import '@/assets/scss/utils.scss';

.ghost {
  opacity: 0.5;
}
</style>
