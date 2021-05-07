<template>
  <Draggable v-model="mutableValue" :tag="tag" v-bind="dragOptions" @start="onStart" @end="onEnd">
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
    handle: { type: String, default: '.drag' }, // 可拖曳樣式
    filter: { type: String, default: null }, // 不可拖曳樣式
    animation: { type: Number, default: 200 },
    ghostClass: { type: String, default: 'ghost' }, // 佔位符樣式
    chosenClass: { type: String, default: null },
    dragClass: { type: String, default: null },
  },
  emits: ['input'],
  data() {
    return {
      drag: false,
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
        chosenClass: this.chosenClass,
        dragClass: this.dragClass,
        disabled: false,
        handle: this.handle,
        filter: this.filter,
      };
    },
  },
  created() {
    this.processTransition(this.$slots.default);
  },
  beforeUpdate() {
    this.processTransition(this.$slots.default);
  },
  methods: {
    onStart() {
      this.drag = true;
    },
    onEnd() {
      this.drag = false;
    },
    processTransition(slots) {
      if (!slots || slots.length !== 1) {
        return false;
      }
      const [{ componentOptions }] = slots;
      if (!componentOptions) {
        return false;
      }

      if (this.isTransitionName(componentOptions.tag)) {
        componentOptions.tag = 'transition-group';
      }
    },
    isTransitionName(name) {
      return name.match(/(transition-group|TransitionGroup)/);
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

.ghost {
  opacity: 0.5;
}
</style>
