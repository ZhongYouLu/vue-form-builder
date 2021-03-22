<template>
  <RadioRow>
    <label v-for="option in options" :key="option[valueKey]">
      <input v-model="mutableValue" v-bind="$attrs" type="radio" :value="option[valueKey]" />
      <span>{{ option[textKey] }}</span>
    </label>
  </RadioRow>
</template>

<script>
import RadioRow from '@/components/ui/RadioRow';

export default /*#__PURE__*/ {
  name: 'FieldRadio',
  components: {
    RadioRow,
  },
  inheritAttrs: false,
  props: {
    value: { type: [String, Number, Boolean], default: null },
    options: { type: Array, default: () => [] },
    textKey: { type: String, default: 'text' },
    valueKey: { type: String, default: 'value' },
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

<style lang="scss">
@import '@/assets/scss/utils.scss';

.radio-row {
  & > label {
    display: inline-block;
    margin-right: $input-gap * 4;
    white-space: nowrap; /* 強迫不換行 */

    &:last-of-type {
      margin-right: initial;
    }
  }
}
</style>
