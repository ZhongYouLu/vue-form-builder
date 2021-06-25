<template>
  <div ref="group" class="x-radio-group" v-bind="{ disabled, invalid: !disabled ? invalid : null }">
    <Tips v-bind="{ tips, showTips, disabled }">
      <Radio
        v-for="(option, idx) in options"
        :key="option[valueKey]"
        ref="el"
        v-bind="{
          idx,
          name,
          label: option[textKey] || option[valueKey],
          value: localValue[option[valueKey]],
          yes,
          no,
          disabled,
          novalidate,
        }"
        v-on="{
          focus: handleFocus,
          blur: handleBlur,
        }"
        @update:value="toggle(option[valueKey], $event)"
      />
    </Tips>
  </div>
</template>

<script>
import Tips from '@/components/ui/Tips';
import Radio from '@/components/ui/form/Field/Radio';

export default /*#__PURE__*/ {
  name: 'CheckboxGroup',
  components: {
    Tips,
    Radio,
  },
  inheritAttrs: false,
  props: {
    value: { type: [String, Number, Boolean], default: null },
    error: { type: String, default: null },
    // ----------------------------------
    name: { type: String, default: null },
    defaultValue: { type: [String, Number, Boolean], default: null },
    required: { type: Boolean, default: null },
    disabled: { type: Boolean, default: null },
    novalidate: { type: Boolean, default: null },
    // ----------------------------------
    options: { type: Array, default: () => [] },
    valueKey: { type: String, default: 'id' },
    textKey: { type: String, default: 'text' },
    yes: { type: [String, Number, Boolean], default: 1 },
    no: { type: [String, Number, Boolean], default: null },
    // ----------------------------------
    processRule: { type: Function, default: null },
  },
  emits: ['update:value', 'update:error', 'focus', 'blur'],
  data() {
    return {
      invalid: null,
      tips: null,
      showTips: null,
    };
  },
  computed: {
    mutableValue: {
      get() {
        return this.value;
      },
      set(val) {
        this.$emit('update:value', val);
      },
    },
    mutableError: {
      get() {
        return this.error;
      },
      set(val) {
        this.$emit('update:error', val);
      },
    },
    localValue() {
      return this.options.reduce((acc, option) => {
        const v = option[this.valueKey];
        acc[v] = this.value === v ? this.yes : this.no;
        return acc;
      }, {});
    },
  },
  watch: {
    mutableValue: 'checkValidity',
    mutableError: 'checkValidity',
  },
  methods: {
    toggle(key, flag) {
      if (flag === this.yes) {
        this.mutableValue = key;
      }
    },
    focus(idx) {
      if (idx == null || idx < 0 || idx > this.$refs.el.length - 1) idx = 0;

      if (this.$refs.el[idx]) {
        this.$nextTick(() => this.$refs.el[idx].focus());
      }
    },
    reset() {
      this.mutableValue = this.defaultValue;
      this.invalid = null;
      this.showTips = null;
      this.tips = null;
    },
    validity() {
      // custom
      if (this.processRule && !this.processRule()) return false;

      return true;
    },
    checkValidity() {
      if (this.novalidate || this.disabled) {
        return true;
      }

      if (this.validity()) {
        this.invalid = null;
        this.showTips = null;
        this.tips = null;
      } else {
        // this.focus();
        this.invalid = true;
        this.showTips = true;
        this.tips = this.mutableError;
      }

      return !this.invalid;
    },
    handleFocus(idx) {
      this.$emit('focus', idx);
    },
    handleBlur(idx) {
      this.$emit('blur', idx);
    },
  },
};
</script>

<style lang="scss">
@import '@/assets/scss/utils.scss';

.x-radio-group {
  display: inline-block;

  &:focus-within,
  &:hover {
    .x-tips {
      z-index: 2;
    }
  }

  &[disabled] {
    pointer-events: none;

    .x-tips {
      pointer-events: all;
      cursor: not-allowed;
      outline: 0;
    }

    .x-radio {
      pointer-events: none;
      opacity: 0.6;
    }
  }

  .x-radio {
    margin-right: var(--fontSize);
    transition: opacity 0.3s;
  }
}
</style>
