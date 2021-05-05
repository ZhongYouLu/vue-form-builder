<template>
  <div class="x-checkbox" :checked="checked" :disabled="disabled" :invalid="invalid">
    <Tips type="error" :dir="idx ? 'bottomleft' : 'topleft'" :tips="tips" :show="showTips">
      <label>
        <input
          :id="id"
          ref="el"
          v-model="checked"
          :name="name"
          type="checkbox"
          :true-value="yes"
          :false-value="no"
          :required="required"
          :disabled="disabled"
          @keydown="handleKeydown"
          @focus="handleFocus"
          @blur="handleBlur"
        />
        <span class="x-cheked">
          <Icon icon="mdi:check" />
        </span>
        <slot>
          <span>{{ label }}</span>
        </slot>
      </label>
    </Tips>
  </div>
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
  inheritAttrs: false,
  props: {
    idx: { type: Number, default: null },
    id: { type: String, default: null },
    name: { type: String, default: null },
    value: { type: [String, Number, Boolean], default: null },
    label: { type: [String, Number, Boolean], default: '是' },
    yes: { type: [String, Number, Boolean], default: 1 },
    no: { type: [String, Number, Boolean], default: null },
    // ----------------------------------
    required: { type: Boolean, default: null },
    disabled: { type: Boolean, default: null },
    novalidate: { type: Boolean, default: null },
    // ----------------------------------
    errortips: { type: String, default: null },
  },
  emits: ['update:value', 'focus', 'blur'],
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
        return this.value === this.yes;
      },
      set(val) {
        this.$emit('update:value', val);
      },
    },
    indeterminate: {
      get() {
        return this.$refs.el?.indeterminate;
      },
      set(flag) {
        const el = this.$refs.el;
        if (el) el.indeterminate = !!flag;
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
    reset() {
      this.checked = this.no;
      this.invalid = false;
      this.tips = null;
      this.showTips = null;
    },
    focus() {
      this.$nextTick(() => this.$refs.el.focus());
    },
    setIndeterminate(flag) {
      this.indeterminate = flag;
    },
    validity() {
      return this.$refs.el.checkValidity();
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
        this.tips = this.errortips || this.$refs.el?.validationMessage;
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

.x-checkbox {
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

    // 勾勾
    &:checked:not(:indeterminate) + .x-cheked .x-icon {
      transform: scale(1.5);
    }

    // 點亮背景
    &:checked,
    &:indeterminate {
      & + .x-cheked {
        border-color: transparent;
        background-color: var(--themeColor);
      }
    }

    &:indeterminate + .x-cheked::before {
      transform: scale(1);
    }
    &:focus-visible + .x-cheked::after {
      transform: scale(2.5);
    }
  }

  .x-icon {
    color: #fff;
    transform: scale(0);
    transition: 0.2s cubic-bezier(0.12, 0.4, 0.29, 1.46) 0.1s;
    overflow: hidden;

    svg {
      width: 70%;
      height: 70%;
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
  //   .x-cheked::after {
  //     transform: scale(2.5);
  //   }
  // }

  .x-tips {
    display: block;
    padding-left: 0.575em;
    margin-left: -0.575em;

    &[hastips] {
      --themeColor: var(--errorColor);
      --borderColor: var(--errorColor);
    }
  }
}
</style>
