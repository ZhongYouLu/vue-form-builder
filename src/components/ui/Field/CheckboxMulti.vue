<template>
  <RadioRow>
    <label v-for="option in options" :key="option[valueKey]">
      <input
        v-model="mutableValue"
        v-bind="$attrs"
        type="checkbox"
        :value="option[valueKey]"
        :required="required && value.length < least"
        :disabled="disabled || (most > -1 && value.length === most && !value.includes(option[valueKey]))"
        @focus="$emit('focus')"
        @blur="$emit('blur')"
      />
      <span>{{ option[textKey] || `(${option[valueKey]})` }}</span>
    </label>
  </RadioRow>
</template>

<script>
import RadioRow from '@/components/ui/RadioRow';

export default /*#__PURE__*/ {
  name: 'FieldCheckboxMulti',
  components: {
    RadioRow,
  },
  inheritAttrs: false,
  props: {
    value: { type: Array, default: () => [] },
    options: { type: Array, default: () => [] },
    textKey: { type: String, default: 'text' },
    valueKey: { type: String, default: 'value' },
    disabled: { type: Boolean, default: false },
    required: { type: Boolean, default: false },
    // 選擇數量下限
    least: { type: Number, default: 1 },
    // 選擇數量上限
    most: { type: Number, default: -1 },
  },
  emits: ['input', 'focus', 'blur'],
  computed: {
    mutableValue: {
      get() {
        return this.value;
      },
      set(val) {
        this.$emit('input', val);
      },
    },
  },
};
</script>
