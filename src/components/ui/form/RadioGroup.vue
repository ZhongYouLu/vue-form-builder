<template>
  <div ref="group" class="x-radio-group" :disabled="disabled" :invalid="invalid">
    <Tips type="error" :tabindex="disabled ? -1 : null" :tips="tips" :show="showTips">
      <Radio
        v-for="(option, idx) in options"
        :key="option[valueKey]"
        ref="radio"
        :idx="idx"
        :name="name"
        :label="option[textKey] || option[valueKey]"
        :value="localValue[option[valueKey]]"
        :yes="yes"
        :no="no"
        :disabled="disabled"
        :novalidate="novalidate"
        @update:value="toggle(option[valueKey], $event)"
        @focus="handleFocus"
        @blur="handleBlur"
      />
    </Tips>
  </div>
</template>

<script>
import Tips from '@/components/ui/Tips';
import Radio from '@/components/ui/form/Radio';

export default /*#__PURE__*/ {
  name: 'CheckboxGroup',
  components: {
    Tips,
    Radio,
  },
  inheritAttrs: false,
  props: {
    name: { type: String, default: null },
    value: { type: [String, Number, Boolean], default: null },
    options: { type: Array, default: () => [] },
    valueKey: { type: String, default: 'id' },
    textKey: { type: String, default: 'text' },
    yes: { type: [String, Number, Boolean], default: 1 },
    no: { type: [String, Number, Boolean], default: null },
    // ----------------------------------
    required: { type: Boolean, default: null },
    disabled: { type: Boolean, default: null },
    novalidate: { type: Boolean, default: null },
    // ----------------------------------
    errortips: { type: String, default: null },
  },
  emits: ['input', 'focus', 'blur'],
  data() {
    return {
      invalid: false,
      tips: null,
      showTips: false,
      errorType: null,
      defaultValue: null,
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
        acc[v] = this.value === v ? this.yes : this.no;
        return acc;
      }, {});
    },
  },
  watch: {
    mutableValue: 'checkValidity',
  },
  created() {
    this.defaultValue = this.value;
  },
  methods: {
    toggle(key, flag) {
      if (flag === this.yes) {
        this.mutableValue = key;
      }
    },
    reset() {
      this.mutableValue = this.defaultValue;
      this.invalid = false;
      this.tips = null;
      this.showTips = null;
    },
    focus(idx) {
      if (idx == null || idx < 0 || idx > this.$refs.radio.length - 1) idx = 0;
      this.$nextTick(() => this.$refs.radio[idx].focus());
    },
    validity() {
      this.errorType = null;

      // 必填
      if (this.required && (this.value == null || this.value === '')) {
        this.errorType = 'required';
        return false;
      }

      return true;
    },
    checkValidity() {
      if (this.novalidate || this.disabled) {
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
        case 'required':
          this.focus();
          this.tips = '必須選擇一項';
          break;
        default:
          break;
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

  .x-tips[hastips] {
    --themeColor: var(--errorColor);
    --borderColor: var(--errorColor);
  }
}
</style>
