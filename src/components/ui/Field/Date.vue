<template>
  <div class="input">
    <input v-model.trim="mutableValue" v-bind="$attrs" type="date" :min="min" :max="max" />
  </div>
</template>

<script>
export default /*#__PURE__*/ {
  name: 'FieldData',
  inheritAttrs: false,
  props: {
    value: { type: String, default: null },
    min: { type: String, default: null },
    max: { type: String, default: null },
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
