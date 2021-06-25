<template>
  <div ref="group" class="x-checkbox-group" v-bind="{ disabled, invalid: !disabled ? invalid : null }">
    <Tips v-bind="{ tips, showTips, disabled }">
      <Checkbox
        v-for="(option, idx) in options"
        :key="option[valueKey]"
        ref="el"
        v-bind="{
          idx,
          name,
          label: option[textKey] || option[valueKey],
          value: localValue[option[valueKey]].flag,
          required: localValue[option[valueKey]].required,
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
import Checkbox from '@/components/ui/form/Field/Checkbox';
import { arrRemoveValue } from '@/assets/js/helper.js';

export default /*#__PURE__*/ {
  name: 'CheckboxGroup',
  components: {
    Tips,
    Checkbox,
  },
  inheritAttrs: false,
  props: {
    value: { type: Array, default: () => [] },
    error: { type: String, default: null },
    // ----------------------------------
    name: { type: String, default: null },
    defaultValue: { type: Array, default: () => [] },
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
    requiredValue: { type: Array, default: () => [] },
    min: { type: Number, default: null },
    max: { type: Number, default: null },
    // ----------------------------------
    processRule: { type: Function, default: null },
  },
  emits: ['update:value', 'update:error', 'focus', 'blur'],
  data() {
    return {
      invalid: false,
      tips: null,
      showTips: false,
      errorType: null,
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
        acc[v] = {
          flag: this.value?.includes(v) ? this.yes : this.no,
          required: this.requiredValue.includes(v),
        };
        return acc;
      }, {});
    },
    localMin() {
      const min = this.min || 0;
      return this.required ? Math.max(1, min) : min;
    },
    localMax() {
      return this.max || Infinity;
    },
  },
  watch: {
    mutableValue: 'checkValidity',
    mutableError: 'checkValidity',
  },
  methods: {
    toggle(key, flag) {
      if (flag === this.yes) {
        this.mutableValue = (this.mutableValue || []).concat(key);
      } else {
        this.mutableValue = arrRemoveValue(this.mutableValue, key);
      }
    },
    checkAll() {
      this.mutableValue = Object.keys(this.localValue).map((key) => key);
    },
    focus(idx) {
      if (idx == null || idx < 0 || idx > this.$refs.el.length - 1) idx = 0;

      if (this.$refs.el[idx]) {
        this.$nextTick(() => this.$refs.el[idx].focus());
      }
    },
    reset() {
      this.mutableValue = this.defaultValue;
      this.invalid = false;
      this.showTips = null;
      this.tips = null;
    },
    validity() {
      this.errorType = null;

      // custom
      if (this.processRule && !this.processRule()) return false;

      const len = (this.value || []).length;

      // 非必填且無勾選
      if (!this.required && len == 0) {
        return true;
      }

      // 數量限制
      // if (len < this.localMin) {
      //   this.errorType = 'min';
      //   return false;
      // }
      // if (len > this.localMax) {
      //   this.errorType = 'max';
      //   return false;
      // }

      // 項目必填
      if (this.requiredValue.length) {
        for (let i = 0, el; (el = this.$refs.el[i]); i++) {
          if (!el.checkValidity()) {
            this.errorType = 'item-required';
            return false;
          }
        }
      }

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
        this.invalid = true;
        this.showTips = true;

        switch (this.errorType) {
          case 'item-required':
            this.tips = null;
            break;
          default:
            this.tips = this.mutableError;
            break;
        }
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

.x-checkbox-group {
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

    .x-checkbox {
      pointer-events: none;
      opacity: 0.6;
    }
  }

  .x-checkbox {
    margin-right: var(--fontSize);
    transition: opacity 0.3s;
  }
}
</style>
