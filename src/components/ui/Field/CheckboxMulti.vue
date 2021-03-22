<template>
  <RadioRow>
    <label v-for="option in options" :key="option[valueKey]">
      <input
        v-model="mutableValue"
        v-bind="$attrs"
        type="checkbox"
        :value="option[valueKey]"
        :disabled="disabled || (limit > -1 && value.length === limit && !value.includes(option[valueKey]))"
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
    limit: { type: Number, default: -1 },
  },
  emits: ['input'],
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
