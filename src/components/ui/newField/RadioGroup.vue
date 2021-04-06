<template>
  <div ref="group" class="radio-group" :disabled="disabled" :invalid="invalid">
    {{ invalid }}
    <Tips type="error" :tabindex="disabled ? -1 : null" :tips="tips" :show="show">
      <Radio
        v-for="(option, idx) in options"
        :key="option[valueKey]"
        ref="radio"
        :idx="idx"
        :name="name"
        :label="option[textKey]"
        :value="localValue[option[valueKey]]"
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
import Radio from '@/components/ui/newField/Radio';

export default /*#__PURE__*/ {
  name: 'CheckboxGroup',
  components: {
    Tips,
    Radio,
  },
  props: {
    form: { type: HTMLFormElement, default: null },
    // ----------------------------------
    name: { type: String, required: true },
    value: { type: [String, Number, Boolean], default: null },
    options: { type: Array, default: () => [] },
    textKey: { type: String, default: 'text' },
    valueKey: { type: String, default: 'value' },
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
      localForm: this.form,
      invalid: false,
      show: false,
      tips: null,
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
        acc[v] = this.value === v;
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
  mounted() {
    if (!this.localForm) {
      this.localForm = this.$refs.group.closest('form');
    }
  },
  methods: {
    toggle(key) {
      this.mutableValue = key;
    },
    reset() {
      this.mutableValue = this.defaultValue;
      this.invalid = false;
      this.show = false;
    },
    focus(idx) {
      if (idx == null || idx < 0 || idx > this.$refs.radio.length - 1) idx = 0;
      this.$refs.radio[idx].focus();
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
      if (this.novalidate || this.disabled || (this.localForm && this.localForm.novalidate)) {
        return true;
      }

      if (this.validity()) {
        this.invalid = false;
        this.show = false;
      } else {
        this.invalid = true;
        this.show = true;
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

.radio-group {
  display: inline-block;

  &:focus-within,
  &:hover {
    .tips {
      z-index: 2;
    }
  }

  &[disabled] {
    pointer-events: none;

    .tips {
      pointer-events: all;
      cursor: not-allowed;
      outline: 0;
    }

    .radio {
      pointer-events: none;
      opacity: 0.6;
    }
  }

  .radio {
    transition: opacity 0.3s;
  }

  .tips[show='show'] {
    --themeColor: var(--errorColor);
    --borderColor: var(--errorColor);
  }
}
</style>
