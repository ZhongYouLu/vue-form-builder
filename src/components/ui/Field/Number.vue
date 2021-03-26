<template>
  <div class="input">
    <input
      v-model.number="mutableValue"
      v-bind="$attrs"
      type="number"
      :min="min"
      :max="max"
      :step="step"
      @focus="$emit('focus')"
      @blur="$emit('blur')"
    />
  </div>
</template>

<script>
export default /*#__PURE__*/ {
  name: 'FieldNumber',
  inheritAttrs: false,
  props: {
    value: { type: Number, default: null },
    min: { type: Number, default: null },
    max: { type: Number, default: null },
    step: { type: Number, default: null },
  },
  emits: ['input', 'focus', 'blur'],
  computed: {
    mutableValue: {
      get() {
        return this.value;
      },
      set(value) {
        this.$emit('input', value);
      },
    },
  },
};
</script>
