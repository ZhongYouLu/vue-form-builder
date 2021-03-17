<template>
  <RadioRow>
    <label>
      <input
        v-model="mutableValue"
        type="checkbox"
        :true-value="yes"
        :false-value="no"
        :disabled="disabled"
        :required="required"
      />
      <span>{{ text }}</span>
    </label>
  </RadioRow>
</template>

<script>
import RadioRow from '@/components/ui/RadioRow';

export default /*#__PURE__*/ {
  name: 'FieldCheckbox',
  components: {
    RadioRow,
  },
  inheritAttrs: false,
  props: {
    value: { type: [String, Number, Boolean], default: null },
    text: { type: String, default: 'Yes' },
    yes: { type: [String, Number, Boolean], default: 1 },
    no: { type: [String, Number, Boolean], default: 0 },
    disabled: { type: Boolean, default: false },
    required: { type: Boolean, default: false },
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
