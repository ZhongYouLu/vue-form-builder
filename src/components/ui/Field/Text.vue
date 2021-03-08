<template>
  <div class="input">
    <input v-model.trim="mutableValue" v-bind="$attrs" type="text" />
  </div>
</template>

<script>
export default /*#__PURE__*/ {
  name: 'FieldText',
  inheritAttrs: false,
  props: {
    value: { type: String, default: null },
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
