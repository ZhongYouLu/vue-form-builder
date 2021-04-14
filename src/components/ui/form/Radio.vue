<template>
  <div class="x-radio" :checked="checked" :disabled="disabled" :invalid="invalid">
    <Tips type="error" :dir="idx ? 'bottomleft' : 'topleft'" :tips="tips" :show="showTips">
      <label>
        <input
          :id="id"
          ref="radio"
          v-model="checked"
          :name="name"
          type="checkbox"
          :true-value="yes"
          :false-value="no"
          :required="required"
          :disabled="disabled"
          @input="handleInput"
          @keydown="handleKeydown"
          @focus="handleFocus"
          @blur="handleBlur"
        />
        <span class="x-cheked" />
        <slot>
          <span>{{ label }}</span>
        </slot>
      </label>
    </Tips>
  </div>
</template>

<script>
import Tips from '@/components/ui/Tips';

export default /*#__PURE__*/ {
  name: 'Radio',
  components: {
    Tips,
  },
  inheritAttrs: false,
  props: {
    idx: { type: Number, default: null },
    id: { type: String, default: null },
    name: { type: String, default: null },
    value: { type: [String, Number, Boolean], default: null },
    label: { type: [String, Number, Boolean], default: '是' },
    yes: { type: [String, Number, Boolean], default: true },
    no: { type: [String, Number, Boolean], default: false },
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
      showTips: false,
      tips: null,
      isfocus: false,
    };
  },
  computed: {
    checked: {
      get() {
        return this.value;
      },
      set(val) {
        this.$emit('input', val);
      },
    },
  },
  watch: {
    checked: function () {
      this.$refs.radio.checked = this.checked;
      this.checkValidity();
    },
  },
  created() {
    this.resetSlot();
  },
  beforeUpdate() {
    this.resetSlot();
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
      this.tips = null;
      this.showTips = null;
    },
    focus() {
      this.$nextTick(() => this.$refs.radio.focus());
    },
    validity() {
      return this.$refs.radio.checkValidity();
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
        this.focus();
        this.invalid = true;
        this.showTips = true;
        this.tips = this.errortips || this.$refs.radio?.validationMessage;
      }

      return !this.invalid;
    },
    handleInput(e) {
      e.target.checked = this.checked = true;
    },
    handleKeydown(e) {
      switch (e.keyCode) {
        case 13: //Enter
          this.checked = true;
          break;
        default:
          break;
      }
    },
    handleFocus(e) {
      e.stopPropagation();
      if (!this.isfocus) {
        this.$emit('focus', this.idx);
      }
    },
    handleBlur(e) {
      e.stopPropagation();
      if (getComputedStyle(this.$refs.radio).zIndex == 2) {
        this.isfocus = true;
      } else {
        this.isfocus = false;
        this.$emit('blur', this.idx);
      }
    },
  },
};
</script>

<style lang="scss">
@import '@/assets/scss/utils.scss';

.x-radio {
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

    .x-cheked {
      background: rgba(0, 0, 0, 0.1);
    }
  }

  &:focus-within,
  &:not([disabled]) label:hover {
    .x-cheked {
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

    &:checked + .x-cheked {
      border-color: var(--themeColor);
    }
    &:checked + .x-cheked::before {
      transform: scale(1);
    }
    &:focus-visible + .x-cheked::after {
      transform: scale(2.5);
    }
  }

  .x-cheked {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;

    width: 1em;
    height: 1em;
    text-align: initial;
    border-radius: 50%;
    border: 0.0875em solid var(--borderColor, rgba(0, 0, 0, 0.2));
    transition: 0.3s;

    &::before,
    &::after {
      position: absolute;
      content: '';
      background: var(--themeColor);
      border-radius: 50%;
      transform: scale(0);
      transition: 0.2s cubic-bezier(0.12, 0.4, 0.29, 1.46) 0.1s;
    }
    &::before {
      width: 0.5em;
      height: 0.5em;
    }
    &::after {
      width: 100%;
      height: 100%;
      opacity: 0.2;
      z-index: -1;
    }

    & ~ *:not(:empty) {
      margin-left: 0.5em;
    }
  }

  // &:focus-within,
  // &:active:not([disabled]) {
  //   .x-cheked::after {
  //     transform: scale(2.5);
  //   }
  // }
}
</style>
