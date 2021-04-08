/* eslint-disable vue/no-mutating-props */
<template>
  <div
    class="x-input"
    :block="block"
    :label="label && !icon"
    :invalid="invalid"
    :disabled="disabled"
    :required="required"
    :readonly="readonly"
  >
    <Tips type="error" :tabindex="disabled ? -1 : null" :dir="errordir" :tips="tips" :show="showTips">
      <Icon v-if="icon" class="x-icon-pre" :icon="icon" />
      <textarea
        v-if="multi"
        ref="input"
        v-model="mutableValue"
        class="_input _textarea"
        v-bind="bindAttrs"
        @focus="handleFocus"
        @blur="handleBlur"
        @keydown="handleKeydown"
      />
      <input
        v-else-if="type === 'number'"
        ref="input"
        v-model.number="mutableValue"
        class="_input"
        v-bind="bindAttrs"
        @focus="handleFocus"
        @blur="handleBlur"
        @keydown="handleKeydown"
      />
      <input
        v-else
        ref="input"
        v-model.trim="mutableValue"
        class="_input"
        v-bind="bindAttrs"
        @focus="handleFocus"
        @blur="handleBlur"
        @keydown="handleKeydown"
      />

      <slot></slot>
      <label v-if="label && !icon" class="x-input-label">{{ label }}</label>
      <template v-if="!multi">
        <div v-if="type === 'number'" class="x-btn-right x-btn-number">
          <Button icon="mdi:chevron-up" type="flat" @click="invokeAdd" />
          <Button icon="mdi:chevron-down" type="flat" @click="invokeSub" />
        </div>
        <Button
          v-else-if="type === 'password'"
          class="btn-right"
          :icon="eyeclose ? 'mdi-light:eye-off' : 'mdi-light:eye'"
          type="flat"
          shape="circle"
          @click="invokePass"
        ></Button>
        <Button
          v-else-if="type === 'search'"
          class="btn-right"
          icon="ic:baseline-search"
          type="flat"
          shape="circle"
          @click="invokeSearch"
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
    readonly: { type: Boolean, default: null },
    required: { type: Boolean, default: null },
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
    customValidity: {
      type: Object,
      default: () => ({
        method: () => true,
        // tips: '',
      }),
    },
  },
  emits: ['input', 'focus', 'blur', 'search'],
  data() {
    return {
      localForm: this.form,
      invalid: null,
      tips: null,
      showTips: false,
      eyeclose: true,
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
    bindAttrs() {
      let temp = {
        name: this.name,
        type: this.localType,
        placeholder: this.label || this.placeholder,
        minlength: this.minlength,
        maxlength: this.maxlength,
        rows: this.rows,
        pattern: this.pattern,
        required: this.required,
        readonly: this.readonly,
        disabled: this.disabled,
        // invalid: this.invalid,
        // novalidate: this.novalidate,
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
    mutableValue: 'checkValidity',
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
      this.showTips = false;
    },
    focus() {
      this.$nextTick(() => this.$refs.input.focus());
    },
    validity() {
      return this.$refs.input.checkValidity() && this.customValidity.method(this.$props);
    },
    checkValidity() {
      if (this.novalidate || this.disabled || (this.localForm && this.localForm.novalidate)) {
        return true;
      }
      if (this.validity()) {
        this.invalid = false;
        this.showTips = false;
        return true;
      } else {
        this.focus();
        this.invalid = true;
        this.showTips = true;

        const inputEl = this.$refs.input;
        if (inputEl.validity.valueMissing) {
          this.tips = inputEl.validationMessage;
        } else {
          if (!this.customValidity.method(inputEl)) {
            this.tips = this.customValidity.tips;
          } else {
            this.tips = this.errortips || inputEl.validationMessage;
          }
        }
        return false;
      }
    },
    handleKeydown(e) {
      switch (e.keyCode) {
        case 13: //Enter
          break;
        default:
          break;
      }
    },
    handleFocus() {
      this.checkValidity();
      this.$emit('focus');
    },
    handleBlur() {
      // this.checkValidity();
      this.$emit('blur');
    },
    invokeSearch() {
      console.log('invokeSearch');
      this.$emit('search', this.mutableValue);
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
  // display: inline-block;
  display: inline-flex;
  align-items: center;
  justify-content: left;
  vertical-align: middle;
  line-height: inherit;
  font-size: inherit;
  color: var(--fontColor);
  border: var(--borderWidth) solid var(--borderColor);
  border-radius: var(--borderRadius);
  transition: z-index 0.3s, border-color 0.3s, box-shadow 0.3s;

  &:not([block]) {
    width: 300px;
  }
  &[block] {
    display: flex;
  }
  // 無效的
  &[invalid] {
    --themeColor: var(--errorColor);
    --borderColor: var(--errorColor);

    .x-icon {
      color: var(--errorColor);
    }
  }

  // 非禁用下的
  &:not([disabled]) {
    &:hover,
    &:focus-within {
      z-index: 1;
      border-color: var(--themeColor);

      .x-icon-pre,
      .x-input-label {
        color: var(--themeColor);
      }

      .x-btn-number {
        visibility: visible;
      }
    }

    // 焦點的陰影
    // &:focus-within {
    //   box-shadow: $shadow-52;
    // }
  }

  // ???
  &[showtips] {
    pointer-events: all;
  }

  &[disabled] {
    opacity: 0.8;
    cursor: not-allowed;

    .x-tips {
      pointer-events: none;
      background: rgba(0, 0, 0, 0.1);
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

  .x-icon-pre {
    display: flex;
    margin-right: var(--vGap);
    color: #999;
  }

  & ._input::placeholder {
    user-select: none;
    color: #999;
  }
  &[label] ._input::placeholder {
    color: transparent;
  }

  ._input {
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

    &[type='number']::-webkit-inner-spin-button {
      display: none;
    }
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

    &-label {
      pointer-events: none;
      position: absolute;
      margin-left: -0.14em;
      padding: 0 0.14em;
      color: #999;
      transform-origin: left;
      transition: transform 0.3s, color 0.3s, background-color 0.3s;
      user-select: none;
    }
    &:not(:placeholder-shown) ~ .x-input-label,
    &:focus ~ .x-input-label {
      background: var(--bgColor, #fff);
      transform: translateY(calc(-50% - 0.43em)) scale(0.8);
    }

    &._textarea {
      margin: 0;
      padding-right: 0.25em;
      line-height: 1.5;

      .x-tips {
        margin-right: calc(var(--vGap) * -1);
        padding-right: 0.25em;
        align-items: flex-start;
      }

      .x-icon-pre {
        height: 1.5em;
      }
    }
  }

  .x-btn {
    &-right {
      margin: calc(var(--vGap) * -1) -0.5em calc(var(--vGap) * -1) 0.25em;
      // padding: var(--vGap);
      // font-size: inherit;
      color: #999;
    }

    &-number {
      display: flex;
      flex-direction: column;
      width: 1.5em;
      visibility: hidden;
      transition: 0s;

      .x-btn {
        flex: 1;
        display: flex;
        padding: 0;
        width: 100%;
        color: #999;
        font-size: 0.8em;
        border-radius: 0;
        transition: 0.2s;

        &:hover {
          flex: 1.5;
        }
      }
    }
  }

  .x-btn:not([disabled]) {
    &:hover,
    &:focus-within {
      color: var(--themeColor);
    }
  }

  @keyframes removeBg {
    to {
      background: transparent;
    }
  }
}
</style>
