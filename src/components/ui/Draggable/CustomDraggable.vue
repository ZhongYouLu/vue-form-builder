<template>
  <Draggable v-model="mutableValue" :tag="tag" v-bind="dragOptions" noTransitionOnDrag @start="onStart" @end="onEnd">
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
    tag: { type: String, default: 'div' },
    group: { type: [String, Object], default: null }, // 相同的組之間可以相互拖曳
    ghostClass: { type: String, default: 'ghost' }, // 佔位符樣式
    handle: { type: String, default: '.drag' }, // 可拖曳樣式
    filter: { type: String, default: null }, // 不可拖曳樣式
    animation: { type: Number, default: 200 },
  },
  emits: ['input'],
  data() {
    return {
      drag: false,
      transitionMode: false,
    };
  },
  computed: {
    mutableValue: {
      get() {
        return this.value;
      },
      set(val) {
        this.$emit('input', val);
      },
    },
    dragOptions() {
      return {
        animation: this.animation,
        group: this.group,
        ghostClass: this.ghostClass,
        disabled: false,
        handle: this.handle,
        filter: this.filter,
      };
    },
  },
  mounted() {
    this.transitionMode = this.isTransition(this.$slots.default);
  },
  methods: {
    onStart() {
      this.drag = true;
    },
    onEnd() {
      this.drag = false;
    },
    isTransition(slots) {
      if (!slots || slots.length !== 1) {
        return false;
      }
      const [{ componentOptions }] = slots;
      if (!componentOptions) {
        return false;
      }
      return this.isTransitionName(componentOptions.tag);
    },
    isTransitionName(name) {
      return ['transition-group', 'TransitionGroup'].includes(name);
    },
  },
};
</script>

<style lang="scss">
@import '@/assets/scss/utils.scss';

.drag {
  @include content-centered($x: fasle);
  margin-right: $gap-lg;
  cursor: move;

  &:hover {
    background-color: lighten($color-gray-dark, 30);
  }
}

.no-move {
  transition: transform 0s;
}

.ghost {
  opacity: 0.5;
}
</style>
