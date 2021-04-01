/* eslint-disable vue/no-mutating-props */
<template>
  <div class="zyl-btn" v-bind="wrapperProps">
    <Loading v-if="loading" />
    <Icon v-else-if="icon" :icon="icon" :color="color" />
    <slot></slot>
    <component
      :is="href ? 'a' : 'button'"
      ref="btn"
      class="btn"
      v-bind="cmpProps"
      @click="handleClick"
      @mousedown="handleMousedown"
      @keydown="handleKeydown"
    />
  </div>
</template>

<script>
import Loading from '@/components/ui/Loading';
import Icon from '@/components/ui/Icon';

export default /*#__PURE__*/ {
  name: 'Button',
  components: {
    Loading,
    Icon,
  },
  props: {
    // ---- 元素屬性 ----
    name: { type: String, default: null },
    htmltype: { type: String, default: null },
    href: { type: String, default: null },
    target: { type: String, default: '_blank' },
    rel: { type: String, default: null },
    download: { type: String, default: null },
    disabled: { type: Boolean, default: null }, // 禁用
    // ---- 元件樣式 ----
    type: {
      type: String,
      default: null,
      validator: (value) => ['primary', 'danger', 'flat', 'dashed'].includes(value),
    },
    icon: { type: String, default: null }, // 圖示
    color: { type: String, default: null }, // 圖示顏色
    loading: { type: Boolean, default: null }, // 載入中 (狀態與禁用相仿)
    shape: { type: String, default: null }, // 形狀
    block: { type: Boolean, default: null }, // 區塊
    // ---- 其他 ----
    toggle: { type: Boolean, default: null },
    handleToggle: { type: Function, default: null },
  },
  emits: ['click'],
  data() {
    return {
      checked: false,
      isEmpty: false,
    };
  },
  computed: {
    wrapperClasses() {
      return [
        this.type && `zyl-btn--${this.type}`,
        { 'zyl-btn--href': !!this.href },
        { 'zyl-btn--block': this.block },
        { 'zyl-btn--circle': this.shape === 'circle' },
        { 'zyl-btn--disabled': !this.type && this.disabled },
      ];
    },
    wrapperProps() {
      return {
        class: this.wrapperClasses,
        disabled: this.disabled,
        loading: this.loading,
        empty: this.isEmpty,
        checked: this.toggle && this.checked,
      };
    },
    cmpProps() {
      let temp = {
        name: this.name,
        type: this.htmltype,
        disabled: this.disabled || this.loading,
      };

      if (this.href) {
        temp = {
          ...temp,
          href: !this.disabled && !this.loading && this.href,
          target: this.target,
          rel: this.rel,
          download: this.download,
        };
      }

      return temp;
    },
  },
  created() {
    this.checkSlot();
  },
  beforeUpdate() {
    this.checkSlot();
  },
  methods: {
    checkSlot() {
      this.isEmpty = !this.$slots.default;
      if (!this.isEmpty) {
        // 如果純文字 補上 <span> 標籤
        if (!this.$slots.default[0].tag) this.$slots.default[0].tag = 'span';
      }
    },
    focus() {
      this.$refs.btn.focus();
    },
    handleClick() {
      this.$emit('click');

      if (this.toggle) {
        this.checked = !this.checked;

        if (this.handleToggle) {
          this.handleToggle(this.checked);
        }
      }
    },
    handleMousedown(e) {
      if (!this.disabled) {
        // 設定波紋(ripple)起始位置
        const { left, top } = this.$refs.btn.getBoundingClientRect();
        this.$refs.btn.style.setProperty('--x', e.clientX - left + 'px');
        this.$refs.btn.style.setProperty('--y', e.clientY - top + 'px');
      }
    },
    handleKeydown(e) {
      switch (e.keyCode) {
        case 13: //Enter
          e.stopPropagation();
          break;
        default:
          break;
      }
    },
  },
};
</script>

<style lang="scss">
@import '@/assets/scss/utils.scss';

.zyl-btn {
  box-sizing: border-box;
  position: relative;
  padding: var(--vGap) var(--hGap);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  vertical-align: middle;
  font-size: var(--fontSize);
  color: var(--fontColor);
  border: var(--borderWidth) solid var(--borderColor);
  border-radius: var(--borderRadius);
  transition: z-index 0.3s, color 0.3s, border-color 0.3s, background 0.3s, box-shadow 0.3s;
  z-index: 0;
  overflow: hidden;

  // 焦點的陰影
  // &:focus-within {
  //   box-shadow: $shadow-52;
  // }

  // 非禁用hover 或 focus
  &:not([disabled]):hover,
  &:focus-within {
    color: var(--themeColor);
    border-color: var(--themeColor);
  }

  // 禁用 or 載入中
  &[disabled],
  &[loading] {
    opacity: 0.6;
    pointer-events: none;

    .btn {
      cursor: not-allowed;
      pointer-events: all;
    }
  }
  // 非禁用 且 非載入中
  &:not([disabled]):not([loading]) {
    &:hover,
    &:active,
    &:focus-within {
      z-index: 1;
    }
    // 按下
    // &:active {
    //   transform: translateY(0.05em);
    // }
  }

  .btn {
    position: absolute;
    padding: 0;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    border: 0;
    background: none;
    user-select: none;
    cursor: unset;
    outline: 0;

    &::-moz-focus-inner {
      border: 0;
    }

    &::before,
    &::after {
      content: '';
      display: block;
      position: absolute;
      width: 100%;
      height: 100%;
      left: 0;
      top: 0;
      opacity: 0;
      pointer-events: none;
    }

    // flat 背景
    &::before {
      background: #fff;
      transition: 0.3s;
    }

    // 波紋
    &::after {
      left: var(--x, 0);
      top: var(--y, 0);
      background-image: radial-gradient(circle, var(--themeColor) 10%, transparent 10.01%);
      background-repeat: no-repeat;
      background-position: 50%;
      transform: translate(-50%, -50%) scale(10);
      transition: transform 0.3s, opacity 0.8s;
    }

    // 啟動波紋
    &:not([disabled]):active::after {
      transform: translate(-50%, -50%) scale(0);
      opacity: 0.3;
      transition: 0s;
    }
  }

  // 禁用樣式
  &--disabled {
    background: rgba(0, 0, 0, 0.1);
  }
  // 超連結樣式
  &--href {
    cursor: pointer;
  }
  // 圓行樣式
  &--circle {
    border-radius: 50%;
  }
  // 區塊樣式
  &--block {
    display: flex;
  }
  // 以下樣式，補上短少的邊框寬度
  &--primary,
  &--danger,
  &--flat {
    border: 0;
    padding: calc(var(--vGap) + var(--borderWidth)) calc(var(--hGap) + var(--borderWidth));

    &[empty] {
      padding: calc(var(--vGap) + var(--borderWidth));
    }
  }
  &--primary,
  &--danger {
    color: #fff;
    // 非禁用hover 或 focus
    &:not([disabled]):hover,
    &:focus-within {
      color: #fff;
    }
    .btn::after {
      background-image: radial-gradient(circle, #fff 10%, transparent 10.01%);
    }
  }
  &--primary {
    background: var(--themeColor);
  }
  &--danger {
    background: var(--dangerColor);
  }
  &--dashed {
    border-style: dashed;
  }
  &--flat {
    .btn::before {
      background: var(--themeColor);
    }
    &:not([disabled]):hover .btn::before {
      opacity: 0.1;
    }
    &:focus-within .btn::before {
      opacity: 0.2;
    }
  }

  // 切換
  &[checked] {
    background: var(--themeColor);
    color: #fff;

    &:not([disabled]):hover,
    &:focus-within {
      background: var(--themeColor);
      color: #fff;
    }
  }

  .loading,
  .icon {
    color: inherit;

    &:first-child {
      margin-right: 0.35em;
    }
  }

  * ~ .icon {
    margin-left: 0.35em;
  }
  .icon {
    transition: none;
  }

  &[empty] {
    padding: var(--vGap);

    .loading,
    .icon {
      &:first-child {
        margin: auto;
      }
    }
  }

  .zyl-btn-group & {
    margin: 0 !important;

    &:first-of-type {
      border-top-right-radius: 0;
      border-bottom-right-radius: 0;
    }
    &:last-of-type {
      border-top-left-radius: 0;
      border-bottom-left-radius: 0;
    }
    &:not(:first-of-type):not(:last-of-type) {
      border-radius: 0;
    }

    &:not(:first-of-type) {
      margin-left: calc(var(--borderWidth) * -1) !important;
    }

    &--primary,
    &--danger,
    &--flat {
      &:not(:first-of-type) {
        margin-left: var(--borderWidth) !important;
      }
    }
  }
}

.zyl-btn-group {
  display: inline-flex;
}
</style>
