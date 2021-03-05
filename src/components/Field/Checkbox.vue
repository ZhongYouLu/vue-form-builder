<template>
  <label>
    <input v-model="mutableValue" v-bind="$attrs" type="checkbox" :true-value="yes" :false-value="no" />
    <span></span>
  </label>
</template>

<script>
export default /*#__PURE__*/ {
  name: 'FieldCheckbox',
  inheritAttrs: false,
  props: {
    value: { type: [String, Number, Boolean], default: null },
    yes: { type: [String, Number, Boolean], default: 1 },
    no: { type: [String, Number, Boolean], default: 0 },
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
