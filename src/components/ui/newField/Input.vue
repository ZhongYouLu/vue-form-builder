/* eslint-disable vue/no-mutating-props */
<template>
  <div
    class="x-input"
    :block="block"
    :label="!!label"
    :invalid="invalid"
    :disabled="disabled"
    :required="required"
    :readonly="readonly"
  >
    <Tips type="error" :tabindex="disabled ? -1 : null" :dir="errordir" :tips="tips" :show="showTips">
      <Icon v-if="icon" class="icon-pre" :name="icon" />
      <component
        :is="multi ? 'textarea' : 'input'"
        ref="input"
        v-model="mutableValue"
        class="input"
        :class="{ textarea: multi }"
        v-bind="bindAttrs"
        @focus="handleFocus"
        @keydown="handleKeydown"
      />
      <slot></slot>
      <label v-if="label && !icon" class="input-label">{{ label }}</label>
      <template v-if="!multi">
        <div v-if="type === 'number'" class="btn-right btn-number">
          <Button icon="up" type="flat" @click="invokeAdd" />
          <Button icon="down" type="flat" @click="invokeSub" />
        </div>
        <Button
          v-else-if="type === 'password'"
          class="btn-right"
          :icon="eyeclose ? 'eye-close' : 'eye'"
          type="flat"
          shape="circle"
          @click="invokePass"
        ></Button>
        <Button
          v-else-if="type === 'search'"
          class="btn-right"
          icon="search"
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
    customValidity: {
      type: Object,
      default: () => ({
        method: () => true,
        // tips: '',
      }),
    },
    errortips: { type: String, default: null },
    errordir: { type: String, default: 'top' },
  },
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
        this.$emit('input', val);
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
      this.$refs.input.focus();
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
    },
    invokeSearch() {
      console.log('invokeSearch');
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
  display: flex;

  &:not(:first-child):not(:last-child) {
    border-radius: 0;
  }
  * {
    margin: 0 !important;
  }
  &:not(:first-child) {
    margin-left: -1px !important;
  }
  &:first-child {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0px;
  }
  &:last-child {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }
}
.x-input {
  box-sizing: border-box;
  display: inline-block;
  border: 1px solid var(--borderColor, rgba(0, 0, 0, 0.2));
  border-radius: var(--borderRadius, 0.25em);
  line-height: 1.8;
  transition: border-color 0.3s, box-shadow 0.3s;
  padding: 0.25em 0.625em;
  color: var(--fontColor, #333);
  font-size: 14px;

  // &:focus-within {
  //   box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  // }

  &:not([block]) {
    width: 300px;
  }

  &[block] {
    display: block;
  }

  // .tips[show='show'] {
  //   color: var(--errorColor, #f4615c);
  // }

  &[invalid] {
    // --themeColor: var(--errorColor, #f4615c);
    // border-color: var(--errorColor, #f4615c);
    --themeColor: var(--errorColor);
    --borderColor: var(--errorColor);

    // color: var(--errorColor);
    // border-color: var(--errorColor);

    .icon {
      // color: var(--errorColor);
    }
  }

  &:not([disabled]) {
    &:hover,
    &:focus-within {
      border-color: var(--themeColor);

      .icon-pre,
      .input-label {
        color: var(--themeColor);
      }

      .btn-number {
        visibility: visible;
      }
    }
  }

  // ???
  &[showtips] {
    pointer-events: all;
  }

  &[disabled] {
    opacity: 0.8;
    cursor: not-allowed;

    .tips {
      pointer-events: none;
      background: rgba(0, 0, 0, 0.1);
    }
  }

  .tips {
    display: flex;
    align-items: center;
    margin: -0.25em -0.625em;
    padding: 0.25em 0.625em;
    width: 100%;
    height: 100%;
    font-family: inherit;
    transition: background-color 0.3s;
  }

  .icon-pre {
    display: flex;
    margin-right: 0.25em;
    color: #999;
  }

  & .input::placeholder {
    color: #999;
  }
  &[label] .input::placeholder {
    color: transparent;
  }

  .input {
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
    }
    &:not(:placeholder-shown) ~ .input-label,
    &:focus ~ .input-label {
      background: var(--bgColor, #fff);
      transform: translateY(calc(-50% - 0.43em)) scale(0.8);
    }

    &.textarea {
      margin: 0;
      padding-right: 0.25em;
      line-height: 1.5;

      .tips {
        margin-right: -0.25em;
        padding-right: 0.25em;
        align-items: flex-start;
      }

      .icon-pre {
        height: 1.5em;
      }
    }
  }

  .btn {
    &-right {
      margin: -0.25em -0.5em -0.25em 0.25em;
      padding: 0;
      width: 2em;
      height: 2em;
      color: #999;
      font-size: inherit;
    }

    &-number {
      display: flex;
      flex-direction: column;
      width: 1.5em;
      visibility: hidden;
      transition: 0s;

      .button {
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

  .button:not([disabled]) {
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
