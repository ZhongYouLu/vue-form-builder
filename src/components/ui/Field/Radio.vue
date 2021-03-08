<template>
  <div class="radio-row">
    <label v-for="option in options" :key="option.value">
      <input v-model="mutableValue" :value="option.value" type="radio" />
      <span>{{ option.text }}</span>
    </label>
  </div>
</template>

<script>
export default /*#__PURE__*/ {
  name: 'FieldRadio',
  inheritAttrs: false,
  props: {
    value: { type: [String, Number, Boolean], default: null },
    options: { type: Array, default: () => [] },
  },
  emits: ['input'],
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
