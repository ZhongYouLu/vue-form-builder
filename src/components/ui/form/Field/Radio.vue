<template>
  <div class="x-radio" v-bind="{ disabled, invalid: !disabled ? invalid : null, checked }">
    <Tips v-bind="{ tips, showTips, disabled, dir: idx ? 'bottomleft' : 'topleft' }">
      <label>
        <input
          ref="el"
          v-model="checked"
          type="checkbox"
          :true-value="yes"
          :false-value="no"
          v-bind="bindAttrs"
          v-on="bindEvents"
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
    value: { type: [String, Number, Boolean], default: null },
    error: { type: String, default: null },
    // ----------------------------------
    idx: { type: Number, default: null },
    name: { type: String, default: null },
    required: { type: Boolean, default: null },
    disabled: { type: Boolean, default: null },
    novalidate: { type: Boolean, default: null },
    // ----------------------------------
    label: { type: [String, Number, Boolean], default: '是' },
    yes: { type: [String, Number, Boolean], default: 1 },
    no: { type: [String, Number, Boolean], default: null },
    // ----------------------------------
    processRule: { type: Function, default: null },
  },
  emits: ['update:value', 'update:error', 'focus', 'blur'],
  data() {
    return {
      invalid: null,
      showTips: null,
      tips: null,
      isfocus: false,
    };
  },
  computed: {
    checked: {
      get() {
        return this.value === this.yes;
      },
      set(val) {
        if (val === this.no) {
          this.$refs.el.checked = this.checked;
          return;
        }
        this.$emit('update:value', val);
      },
    },
    bindAttrs() {
      return {
        name: this.name,
        required: this.required,
        disabled: this.disabled,
      };
    },
    bindEvents() {
      return {
        keydown: this.handleKeydown,
        focus: this.handleFocus,
        blur: this.handleBlur,
      };
    },
  },
  watch: {
    checked: 'checkValidity',
    error: 'checkValidity',
  },
  created() {
    this.resetSlot();
  },
  beforeUpdate() {
    this.resetSlot();
  },
  updated() {
    this.$refs.el.checked = this.checked;
  },
  mounted() {
    this.$refs.el.checked = this.checked;
  },
  methods: {
    resetSlot() {
      if (this.$slots.default) {
        if (!this.$slots.default[0].tag) this.$slots.default[0].tag = 'span';
      }
    },
    focus() {
      this.$nextTick(() => this.$refs.el.focus());
    },
    reset() {
      this.checked = this.no;
      this.invalid = null;
      this.showTips = null;
      this.tips = null;
    },
    validity() {
      // custom
      if (this.processRule && !this.processRule()) return false;

      // return this.$refs.el.checkValidity();
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
        this.tips = this.error;
        // this.tips = this.errortips || this.$refs.el?.validationMessage;
      }

      return !this.invalid;
    },
    handleKeydown(e) {
      switch (e.keyCode) {
        case 13: //Enter
          this.checked = this.checked ? this.no : this.yes;
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
      if (getComputedStyle(this.$refs.el).zIndex == 2) {
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

  .x-cheked {
    background-color: #fff;
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
