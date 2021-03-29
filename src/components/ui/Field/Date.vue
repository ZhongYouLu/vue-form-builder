<template>
  <div class="input">
    <input
      ref="input"
      v-model.trim="mutableValue"
      v-bind="$attrs"
      type="date"
      :min="min"
      :max="max"
      @focus="$emit('focus')"
      @blur="$emit('blur')"
    />
  </div>
</template>

<script>
export default /*#__PURE__*/ {
  name: 'FieldDate',
  inheritAttrs: false,
  props: {
    value: { type: String, default: null },
    min: { type: String, default: null },
    max: { type: String, default: null },
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
