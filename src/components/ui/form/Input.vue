/* eslint-disable vue/no-mutating-props */
<template>
  <div class="x-input" :disabled="disabled" :invalid="invalid" :block="block" :multi="multi">
    <Tips type="error" :tabindex="disabled ? -1 : null" :dir="errordir" :tips="tips" :show="showTips">
      <Icon v-if="icon" class="x-input__pre" :icon="icon" />
      <template v-if="true">
        <textarea
          v-if="multi"
          ref="input"
          v-model="mutableValue"
          v-bind="bindAttrs"
          @focus="handleFocus"
          @blur="handleBlur"
          @input="handleInput"
          @keydown="handleKeydown"
          @keyup="handleKeyup"
        />
        <input
          v-else-if="type === 'number'"
          ref="input"
          v-model.number="mutableValue"
          v-bind="bindAttrs"
          @focus="handleFocus"
          @blur="handleBlur"
          @input="handleInput"
          @keydown="handleKeydown"
          @keyup="handleKeyup"
        />
        <input
          v-else
          ref="input"
          v-model.trim="mutableValue"
          v-bind="bindAttrs"
          @focus="handleFocus"
          @blur="handleBlur"
          @input="handleInput"
          @keydown="handleKeydown"
          @keyup="handleKeyup"
        />
      </template>
      <label v-if="label && !icon" class="x-input__label">{{ label }}</label>
      <template v-if="!multi">
        <div v-if="type === 'number'" class="x-input__right x-input__right--number">
          <Button icon="mdi:chevron-up" type="flat" @click="invokeAdd" />
          <Button icon="mdi:chevron-down" type="flat" @click="invokeSub" />
        </div>
        <Button
          v-else-if="type === 'password'"
          class="x-input__right"
          :icon="eyeclose ? 'mdi-light:eye-off' : 'mdi-light:eye'"
          type="flat"
          shape="circle"
          @click="invokePass"
        ></Button>
        <Button
          v-else-if="type === 'search'"
          ref="search"
          class="x-input__right"
          icon="ic:baseline-search"
          type="flat"
          shape="circle"
          @click="invokeSubmit"
        ></Button>
      </template>
    </Tips>
  </div>
</template>

<script>
import Tips from '@/components/ui/Tips';
import Icon from '@/components/ui/Icon';
import Button from '@/components/ui/Button';

export default /*#__PURE__*/ {
  name: 'Input',
  components: {
    Tips,
    Icon,
    Button,
  },
  inheritAttrs: false,
  props: {
    form: { type: HTMLFormElement, default: null },
    // ----------------------------------
    value: { type: [String, Number], default: null },
    name: { type: String, default: null },
    type: { type: String, default: null },
    placeholder: { type: String, default: null },
    label: { type: String, default: null }, // 設置後 placeholder 失效
    icon: { type: String, default: null }, // 設置後 label 失效
    required: { type: Boolean, default: null },
    readonly: { type: Boolean, default: null },
    disabled: { type: Boolean, default: null },
    novalidate: { type: Boolean, default: null },
    // ---------------------------------
    pattern: { type: String, default: null },
    minlength: { type: Number, default: null },
    maxlength: { type: Number, default: null },
    rows: { type: Number, default: null },
    min: { type: Number, default: null },
    max: { type: Number, default: null },
    step: { type: Number, default: null },
    // ---------------------------------
    multi: { type: Boolean, default: null },
    block: { type: Boolean, default: null },
    errortips: { type: String, default: null },
    errordir: { type: String, default: 'top' },
    debounce: { type: Number, default: null },
    customValidity: {
      type: Object,
      default: () => ({
        method: () => true,
        // tips: '',
      }),
    },
    callInput: { type: Function, default: null },
  },
  emits: ['input', 'focus', 'blur', 'submit'],
  data() {
    return {
      localForm: this.form,
      invalid: null,
      tips: null,
      showTips: null,
      errorType: null,
      eyeclose: true,
      inputTimer: null,
    };
  },
  computed: {
    mutableValue: {
      get() {
        return this.value;
      },
      set(val) {
        this.$emit('input', val !== '' ? val : null);
      },
    },
    localType() {
      let type = null;
      switch (this.type) {
        case 'number':
        case 'email':
        case 'tel':
        case 'url':
          type = this.type;
          break;
        case 'password':
          type = this.eyeclose ? 'password' : 'text';
          break;
        default:
          type = 'text';
          break;
      }
      return type;
    },
    classes() {
      return [
        'x-input__input',
        { 'x-input__input--label': this.label && !this.icon },
        { 'x-input__input--number': this.type === 'number' },
      ];
    },
    bindAttrs() {
      let temp = {
        name: this.name,
        type: this.localType,
        class: this.classes,
        placeholder: this.label || this.placeholder,
        minlength: this.minlength,
        maxlength: this.maxlength,
        rows: this.rows,
        pattern: this.pattern,
        required: this.required,
        readonly: this.readonly,
        disabled: this.disabled,
      };

      if (this.type === 'number') {
        temp = {
          ...temp,
          min: this.min,
          max: this.max,
          step: this.step,
        };
      }

      return temp;
    },
  },
  watch: {
    mutableValue: function () {
      this.$nextTick(() => {
        this.checkValidity();
      });
    },
  },
  mounted() {
    if (!this.localForm) {
      this.localForm = this.$refs.input.closest('form');
    }
  },
  methods: {
    reset() {
      this.mutableValue = this.defaultvalue;
      this.invalid = false;
      this.tips = null;
      this.showTips = null;
    },
    focus() {
      this.$nextTick(() => this.$refs.input.focus());
    },
    // 是否有效
    validity() {
      // base (default)
      if (!this.$refs.input.checkValidity()) {
        this.errorType = null;
        return false;
      }

      // custom
      if (!this.customValidity.method(this.$props)) {
        this.errorType = 'custom';
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
        this.showTips = null;
        this.tips = null;
      } else {
        // this.focus();
        this.invalid = true;
        this.showTips = true;

        /* [ValidityState]
         * badInput: 表示使用者提供了瀏覽器無法轉換的輸入
         * customError: 有客製化設定 el.setCustomValidity(non-empty)
         * patternMismatch: 不符合設定的 pattern 屬性的值
         * rangeOverflow: 大於 max 屬性的值
         * rangeUnderflow: 小於 min 屬性的值
         * stepMismatch: 不符合 step 屬性的倍數
         * tooLong: 長度大於 maxlength 屬性的值
         * tooShort: 長度小於 minlength 屬性的值
         * typeMismatch: 格式型態不正確（email, url, color）
         * valid: 有效的，符合所有驗證
         * valueMissing: 有設置 required 屬性，但沒有值
         */

        const inputEl = this.$refs.input;
        // if (inputEl.validity.valueMissing) {
        //   this.tips = inputEl.validationMessage;
        // }

        switch (this.errorType) {
          case 'custom':
            this.tips = this.customValidity.tips;
            break;
          default:
            this.tips = this.errortips || inputEl.validationMessage;
            break;
        }
      }

      return !this.invalid;
    },
    handleKeydown(e) {
      switch (e.keyCode) {
        case 13: //Enter
          e.preventDefault();
          e.stopPropagation();
          break;
        default:
          break;
      }
    },
    handleKeyup(e) {
      switch (e.keyCode) {
        case 13: //Enter
          if (this.validity()) {
            const searchBtn = this.$refs.search;
            // searchBtn.$refs.btn.focus();
            searchBtn.$refs.btn.dispatchEvent(new MouseEvent('mousedown'));
            searchBtn.handleClick();
          }
          break;
        default:
          break;
      }
    },
    handleInput(e) {
      e.stopPropagation();

      if (this.debounce) {
        this.inputTimer && clearTimeout(this.inputTimer);
        this.inputTimer = setTimeout(() => {
          this.callInput && this.callInput(this.value);
        }, this.debounce);
      } else {
        this.callInput && this.callInput(this.value);
      }
    },
    handleFocus() {
      // this.checkValidity();
      this.$emit('focus');
    },
    handleBlur() {
      this.checkValidity();
      this.$emit('blur');
    },
    invokeSubmit() {
      console.log('invokeSubmit');
      // this.$emit('submit', this.value);
      // submit
    },
    invokePass() {
      this.eyeclose = !this.eyeclose;
      this.focus();
      console.log('invokePass');
    },
    invokeAdd() {
      this.$refs.input.stepUp();
    },
    invokeSub() {
      this.$refs.input.stepDown();
    },
  },
};
</script>

<style lang="scss">
@import '@/assets/scss/utils.scss';

.x-input-group {
  @include group;
}

.x-input {
  box-sizing: border-box;
  position: relative;
  padding: var(--vGap) var(--hGap);
  display: inline-flex;
  align-items: center;
  justify-content: left;
  vertical-align: middle;
  line-height: 1.4;
  font-size: var(--fontSize);
  color: var(--fontColor);
  border: var(--borderWidth) solid var(--borderColor);
  border-radius: var(--borderRadius);
  transition: z-index 0.3s, border-color 0.3s, box-shadow 0.3s;

  &__pre,
  &__label,
  &__right,
  &__right--number .x-btn {
    color: #999;
  }

  &__pre {
    display: flex;
    margin-right: var(--vGap);
  }

  &__label {
    position: absolute;
    margin-left: calc(var(--fontSize) * -0.1);
    padding: 0 0.1em;
    display: flex;
    justify-content: center;
    align-items: center;
    transform-origin: left;
    transition: transform 0.3s ease, color 0.3s, background-color 0.3s;
    pointer-events: none;
    user-select: none;

    &::before {
      content: '';
      z-index: -1;
      position: absolute;
      top: 0;
      width: 100%;
      height: calc(var(--borderWidth) * 3);
      transition: top 0.3s ease-out;
    }
    :focus + &,
    :not(:placeholder-shown) + &,
    :-webkit-autofill + & {
      &::before {
        background: var(--bgColor, #fff);
        top: calc(49% + calc(var(--borderWidth) / 2));
      }
      transform: translateY(calc(-50% - var(--vGap) * 1.5)) scale(0.8);
    }
  }

  & &__right {
    margin: calc(var(--vGap) * -1) -0.5em calc(var(--vGap) * -1) var(--vGap);

    &:hover,
    &:focus-within {
      color: var(--themeColor);
    }

    &--number {
      display: flex;
      flex-direction: column;
      width: 1.5em;
      height: 1.5em;
      // visibility: hidden;
      transition: 0s;

      .x-btn {
        flex: 1;
        display: flex;
        margin: 0;
        padding: 0;
        width: 100%;
        font-size: 0.8em;
        border-radius: 0;
        transition: 0.2s;

        &:hover {
          flex: 1.5;
        }
      }
    }
  }

  &__input {
    flex: 1;
    padding: 0;
    min-width: 0;
    line-height: inherit;
    text-align: inherit;
    font-size: inherit;
    font-family: inherit;
    color: currentColor;
    border: 0;
    background: none;
    -webkit-appearance: none;
    -moz-appearance: textfield;
    overflow-x: hidden;
    outline: 0;
    transition: color 0.3s;
    animation: removeBg 0s forwards;

    &::-moz-focus-inner,
    &::-moz-focus-outer {
      border: 0;
      outline: 0;
    }
    &:-moz-ui-invalid {
      box-shadow: none;
    }
    &::-ms-reveal {
      display: none;
    }
    &--number::-webkit-inner-spin-button {
      display: none;
    }

    &::placeholder {
      user-select: none;
      color: #999;
    }
    &--label::placeholder {
      color: transparent;
    }
  }

  @keyframes removeBg {
    to {
      background: transparent;
    }
  }

  .x-tips {
    box-sizing: content-box;
    display: flex;
    align-items: center;
    margin: calc(var(--vGap) * -1) calc(var(--hGap) * -1);
    padding: var(--vGap) var(--hGap);
    width: 100%;
    height: 100%;
    font-family: inherit;
    transition: background-color 0.3s;
  }

  &[block] {
    display: flex;
  }
  &:not([block]) {
    width: 300px;
  }

  // 無效的
  &[invalid] {
    --themeColor: var(--errorColor);
    --borderColor: var(--errorColor);

    .x-input__pre,
    .x-input__label {
      color: var(--errorColor);
    }
  }

  &[disabled] {
    opacity: 0.8;
    cursor: not-allowed;

    .x-tips {
      background: rgba(0, 0, 0, 0.1);
      pointer-events: none;
    }
  }
  &:not([disabled]) {
    &:hover,
    &:focus-within {
      z-index: 1;
      border-color: var(--themeColor);

      .x-input__pre,
      .x-input__label {
        color: var(--themeColor);
      }

      .x-input__right {
        &--number {
          visibility: visible;
        }
      }
    }

    // 焦點的陰影
    // &:focus-within {
    //   box-shadow: $shadow-52;
    // }
  }

  &[multi] {
    padding-right: var(--vGap);
    line-height: 1.5;

    .x-tips {
      margin-right: calc(var(--vGap) * -1);
      padding-right: var(--vGap);
      align-items: flex-start;
    }

    .x-input__pre {
      height: 1.5em;
    }
  }
}
</style>
