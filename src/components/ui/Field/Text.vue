<template>
  <div class="input">
    <input
      v-model.trim="mutableValue"
      v-bind="$attrs"
      type="text"
      :readonly="readonly"
      :disabled="disabled"
      :maxlength="maxlength"
    />
  </div>
</template>

<script>
export default /*#__PURE__*/ {
  name: 'FieldText',
  inheritAttrs: false,
  props: {
    value: { type: String, default: null },
    default: { type: String, default: null },
    readonly: { type: Boolean, default: null },
    disabled: { type: Boolean, default: null },
    size: { type: Number, default: null }, // The size attribute specifies the width (in characters) of an input field
    maxlength: { type: Number, default: null }, // The maxlength attribute specifies the maximum number of characters allowed in an input field
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
  created() {
    if (this.default && this.mutableValue === null) {
      this.mutableValue = this.default;
    }
  },
};
</script>
