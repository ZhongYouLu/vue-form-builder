<template>
  <div class="input">
    <input
      v-model.trim="mutableValue"
      v-bind="$attrs"
      :type="subType || 'text'"
      :maxlength="maxlength"
      @focus="$emit('focus')"
      @blur="$emit('blur')"
    />
  </div>
</template>

<script>
export default /*#__PURE__*/ {
  name: 'FieldText',
  inheritAttrs: false,
  props: {
    value: { type: String, default: null },
    subType: { type: String, default: null },
    size: { type: Number, default: null }, // The size attribute specifies the width (in characters) of an input field
    minlength: { type: Number, default: null }, // The minlength attribute specifies the minimum number of characters required in an input field.
    maxlength: { type: Number, default: null }, // The maxlength attribute specifies the maximum number of characters allowed in an input field
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
