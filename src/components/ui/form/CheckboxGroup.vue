<template>
  <div ref="group" class="x-checkbox-group" :disabled="disabled" :invalid="invalid">
    <Tips type="error" :tabindex="disabled ? -1 : null" :tips="tips" :show="showTips">
      <Checkbox
        v-for="(option, idx) in options"
        :key="option[valueKey]"
        ref="checkbox"
        :idx="idx"
        :name="name"
        :label="option[textKey] || option[valueKey]"
        :value="localValue[option[valueKey]].flag"
        :required="localValue[option[valueKey]].required"
        :disabled="disabled"
        :novalidate="novalidate"
        :form="form"
        @input="toggle(option[valueKey], $event)"
        @focus="handleFocus"
        @blur="handleBlur"
      />
    </Tips>
  </div>
</template>

<script>
import Tips from '@/components/ui/Tips';
import Checkbox from '@/components/ui/form/Checkbox';
import { arrRemoveValue } from '@/assets/js/helper.js';

export default /*#__PURE__*/ {
  name: 'CheckboxGroup',
  components: {
    Tips,
    Checkbox,
  },
  inheritAttrs: false,
  props: {
    form: { type: HTMLFormElement, default: null },
    // ----------------------------------
    name: { type: String, required: true },
    value: { type: Array, default: () => [] },
    options: { type: Array, default: () => [] },
    textKey: { type: String, default: 'text' },
    valueKey: { type: String, default: 'value' },
    // ----------------------------------
    required: { type: Boolean, default: null },
    requiredValue: { type: Array, default: () => [] },
    disabled: { type: Boolean, default: null },
    novalidate: { type: Boolean, default: null },
    min: { type: Number, default: null },
    max: { type: Number, default: null },
    // ----------------------------------
    errortips: { type: String, default: null },
  },
  emits: ['input', 'focus', 'blur'],
  data() {
    return {
      localForm: this.form,
      invalid: false,
      tips: null,
      showTips: false,
      errorType: null,
      defaultValue: [],
    };
  },
  computed: {
    mutableValue: {
      get() {
        return this.value;
      },
      set(val) {
        this.$emit('input', val);
      },
    },
    localValue() {
      return this.options.reduce((acc, option) => {
        const v = option[this.valueKey];
        acc[v] = {
          flag: this.value.includes(v),
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
  },
  created() {
    this.defaultValue = this.value;
  },
  mounted() {
    if (!this.localForm) {
      this.localForm = this.$refs.group.closest('form');
    }
  },
  methods: {
    toggle(key, checked) {
      if (checked) {
        this.mutableValue = this.mutableValue.concat(key);
      } else {
        this.mutableValue = arrRemoveValue(this.mutableValue, key);
      }
    },
    reset() {
      this.mutableValue = this.defaultValue;
      this.invalid = false;
      this.tips = null;
      this.showTips = null;
    },
    focus(idx) {
      if (idx == null || idx < 0 || idx > this.$refs.checkbox.length - 1) idx = 0;
      this.$nextTick(() => this.$refs.checkbox[idx].focus());
    },
    checkAll() {
      this.mutableValue = Object.keys(this.localValue).map((key) => key);
    },
    validity() {
      this.errorType = null;
      const len = this.value.length;

      // 非必填且無勾選
      if (!this.required && len == 0) {
        return true;
      }

      // 數量限制
      if (len < this.localMin) {
        this.errorType = 'min';
        return false;
      }
      if (len > this.localMax) {
        this.errorType = 'max';
        return false;
      }

      // 項目必填
      if (this.requiredValue.length) {
        for (let i = 0, checkbox; (checkbox = this.$refs.checkbox[i]); i++) {
          if (!checkbox.checkValidity()) {
            this.errorType = 'item-required';
            return false;
          }
        }
      }

      return true;
    },
    checkValidity() {
      if (this.novalidate || this.disabled || (this.localForm && this.localForm.novalidate)) {
        return true;
      }

      if (this.validity()) {
        this.invalid = false;
        this.showTips = null;
        this.tips = null;
      } else {
        this.invalid = true;
        this.showTips = true;
      }

      switch (this.errorType) {
        case 'min':
          this.focus();
          this.tips = `請至少選擇${this.localMin}項`;
          break;
        case 'max':
          this.tips = `至多選擇${this.localMax}項`;
          break;
        case 'item-required':
          this.tips = null;
          break;
        default:
          break;
      }

      return !this.invalid;
    },
    handleFocus(idx) {
      console.log('focus', idx);
      this.$emit('focus');
    },
    handleBlur(idx) {
      console.log('blur', idx);
      this.$emit('blur');
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
    transition: opacity 0.3s;
  }

  .x-tips[hastips] {
    --themeColor: var(--errorColor);
    --borderColor: var(--errorColor);
  }
}
</style>
