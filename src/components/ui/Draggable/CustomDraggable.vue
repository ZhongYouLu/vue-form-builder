<template>
  <Draggable
    v-model="localValue"
    :tag="tag"
    :group="group"
    :handle="`.${handleClass}`"
    :animation="animation"
    :ghost-class="ghostClass"
  >
    <slot />
  </Draggable>
</template>

<script>
import Draggable from 'vuedraggable';

export default /*#__PURE__*/ {
  name: 'CustomDraggable',
  components: {
    Draggable,
  },
  props: {
    value: { type: Array, required: true },
    handleClass: { type: String, default: 'drag' },
    tag: { type: String, default: 'div' },
    group: { type: Object, default: null },
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

.drag {
  @include content-centered($x: fasle);
  margin-right: $gap-lg;
  cursor: move;

  &:hover {
    background-color: lighten($color-gray-dark, 30);
  }
}
</style>
