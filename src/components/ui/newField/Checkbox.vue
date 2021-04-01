<template>
  <div class="checkbox" :disabled="disabled" :checked="checked">
    <Tips type="error" dir="topleft" :tips="tips" :show="show">
      <label>
        <input
          ref="checkbox"
          v-model="checked"
          :true-value="yes"
          :false-value="no"
          :name="name"
          type="checkbox"
          :required="required"
          :disabled="disabled"
          :invalid="invalid"
          :novalidate="novalidate"
          @keydown="handleKeydown"
          @focus="handleFocus"
          @blur="handleBlur"
        />
        <span class="cheked">
          <Icon icon="mdi:check" />
        </span>
        <slot>
          <span>{{ label }}</span>
        </slot>
      </label>
    </Tips>
  </div>
  <!-- <p>{{ checked }}</p>
    <p>show: {{ show }}</p>
    <p>novalidate: {{ novalidate }}</p>
    <p>disabled: {{ disabled }}</p>
    <p>indeterminate: {{ indeterminate }}</p>
    <button @click="checkValidity">checkValidity</button>
    <button @click="focus">focus</button>
    <button @click="reset">reset</button> -->
</template>

<script>
import Tips from '@/components/ui/Tips';
import Icon from '@/components/ui/Icon';

export default /*#__PURE__*/ {
  name: 'Checkbox',
  components: {
    Tips,
    Icon,
  },
  props: {
    // form: { type: Object, default: null },
    // ----------------------------------
    value: { type: [String, Number, Boolean], default: null },
    yes: { type: [String, Number, Boolean], default: 1 },
    no: { type: [String, Number, Boolean], default: null },
    label: { type: [String, Number, Boolean], default: '是' },
    // ----------------------------------
    name: { type: String, default: null },
    required: { type: Boolean, default: null },
    disabled: { type: Boolean, default: null },
    novalidate: { type: Boolean, default: null },
    // ----------------------------------
    errortips: { type: String, default: null },
  },
  emits: ['input', 'focus', 'blur'],
  data() {
    return {
      form: null,
      invalid: false,
      show: false,
      tips: null,
      isfocus: false,
    };
  },
  computed: {
    checked: {
      get() {
        return this.value;
      },
      set(value) {
        this.$emit('input', value);
      },
    },
    indeterminate: {
      get() {
        return this.$refs.checkbox?.indeterminate;
      },
      set(value) {
        const checkbox = this.$refs.checkbox;
        if (checkbox) checkbox.indeterminate = value;
      },
    },
  },
  watch: {
    checked: 'checkValidity',
  },
  created() {
    this.resetSlot();
  },
  beforeUpdate() {
    this.resetSlot();
  },
  mounted() {
    this.form = this.$refs.checkbox.closest('form');
  },
  methods: {
    resetSlot() {
      if (this.$slots.default) {
        if (!this.$slots.default[0].tag) this.$slots.default[0].tag = 'span';
      }
    },
    reset() {
      this.checked = false;
      this.invalid = false;
      this.show = false;
    },
    focus() {
      this.$refs.checkbox.focus();
    },
    validity() {
      const result = this.$refs.checkbox?.checkValidity();
      // console.log('validity', result);
      return result;
    },
    checkValidity() {
      if (this.novalidate || this.disabled || (this.form && this.form.novalidate)) {
        return true;
      }
      if (this.validity()) {
        this.invalid = false;
        this.show = false;
        // this.tips = null;
        return true;
      } else {
        this.focus();
        this.invalid = true;
        this.show = true;
        this.tips = this.errortips || this.$refs.checkbox?.validationMessage;
        return false;
      }
    },
    toggle(evt) {
      const target = evt.target;
      if (target.readOnly) target.checked = target.readOnly = false;
      else if (!target.checked) target.readOnly = this.indeterminate = true;
    },
    handleKeydown(evt) {
      switch (evt.keyCode) {
        case 13: //Enter
          this.checked = !this.checked;
          break;
        default:
          break;
      }
    },
    handleFocus(e) {
      e.stopPropagation();
      if (!this.isfocus) {
        console.log('focus');
        this.$emit('focus');
      }
    },
    handleBlur(e) {
      e.stopPropagation();
      if (getComputedStyle(this.$refs.checkbox).zIndex == 2) {
        this.isfocus = true;
      } else {
        this.isfocus = false;
        console.log('blur');
        this.$emit('blur');
      }
    },
  },
};
</script>

<style lang="scss">
@import '@/assets/scss/utils.scss';

.checkbox {
  display: inline-block;
  font-size: 14px;
  color: var(--fontColor, #333);
  -webkit-tap-highlight-color: transparent;

  label {
    box-sizing: border-box;
    cursor: pointer;
    display: flex;
    align-items: center;
  }

  &[disabled] {
    pointer-events: none;
    opacity: 0.6;

    label {
      pointer-events: all;
      cursor: not-allowed;
    }

    .cheked {
      background: rgba(0, 0, 0, 0.1);
    }
  }

  &:focus-within,
  &:not([disabled]) label:hover {
    .cheked {
      border-color: var(--themeColor);
      // box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
      z-index: 1;
    }
  }

  &:focus-within,
  &:active {
    input {
      z-index: 2;
    }
  }

  input {
    position: absolute;
    clip: rect(0, 0, 0, 0);

    // 勾勾
    &:checked:not(:indeterminate) + .cheked .icon {
      transform: scale(1.5);
    }

    // 點亮背景
    &:checked,
    &:indeterminate {
      & + .cheked {
        border-color: transparent;
        background-color: var(--themeColor);
      }
    }

    &:indeterminate + .cheked::before {
      transform: scale(1);
    }
    &:focus-visible + .cheked::after {
      transform: scale(2.5);
    }
  }

  .icon {
    color: #fff;
    transform: scale(0);
    transition: 0.2s cubic-bezier(0.12, 0.4, 0.29, 1.46) 0.1s;
    overflow: hidden;

    svg {
      width: 70%;
      height: 70%;
    }
  }

  .cheked {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;

    width: 1em;
    height: 1em;
    text-align: initial;
    border: 0.0875em solid var(--borderColor, rgba(0, 0, 0, 0.2));
    border-radius: 0.15em;
    transition: 0.3s;

    &::before,
    &::after {
      position: absolute;
      content: '';
      transform: scale(0);
      transition: 0.2s cubic-bezier(0.12, 0.4, 0.29, 1.46) 0.1s;
    }
    &::before {
      width: 74%;
      height: 0.15em;
      background: #fff;
      border-radius: 0.15em;
    }
    &::after {
      width: 100%;
      height: 100%;
      background: var(--themeColor);
      border-radius: 50%;
      opacity: 0.2;
      z-index: -1;
    }

    & ~ *:not(:empty) {
      margin-left: 0.5em;
    }
  }

  // &:focus-within,
  // &:active:not([disabled]) {
  //   .cheked::after {
  //     transform: scale(2.5);
  //   }
  // }

  .tips {
    display: block;
    padding-left: 0.575em;
    margin-left: -0.575em;

    &[show='show'] {
      --themeColor: var(--errorColor);
      --borderColor: var(--errorColor);
    }
  }
}
</style>
