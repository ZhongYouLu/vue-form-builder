/* eslint-disable vue/no-mutating-props */
<template>
  <div
    class="zyl-btn"
    :type="type"
    :href="!disabled && !!href"
    :shape="shape"
    :block="block"
    :loading="loading"
    :disabled="disabled"
  >
    <component
      :is="href ? 'a' : 'button'"
      ref="btn"
      class="btn"
      :href="!disabled && href"
      :target="target"
      :rel="rel"
      :download="(href && download) || null"
      :disabled="disabled || loading"
      :checked="toggle && checked"
      @click="handleClick"
      @keydown="handleKeydown"
      @mousedown="handleMousedown"
    >
    </component>
    <Icon v-if="!loading && icon" :icon="icon" />
    <slot></slot>
  </div>
</template>

<script>
import Icon from '@/components/ui/Icon';

export default /*#__PURE__*/ {
  name: 'Button',
  components: {
    Icon,
  },
  props: {
    type: { type: String, default: null },
    href: { type: String, default: null },
    target: { type: String, default: null },
    rel: { type: String, default: null },
    download: { type: String, default: null },
    shape: { type: String, default: null },
    block: { type: Boolean, default: null },
    loading: { type: Boolean, default: null },
    disabled: { type: Boolean, default: null },
    icon: { type: String, default: null },
    toggle: { type: Boolean, default: null },
  },
  data() {
    return {
      checked: false,
    };
  },
  methods: {
    focus() {
      this.$refs.btn.focus();
    },
    handleClick() {
      if (this.toggle) {
        this.checked = !this.checked;
      }
    },
    handleKeydown(evt) {
      console.log(evt.keyCode);
      switch (evt.keyCode) {
        case 13: //Enter
          evt.stopPropagation();
          break;
        default:
          break;
      }
    },
    handleMousedown(evt) {
      if (!this.disabled) {
        // ripple
        const { left, top } = this.$refs.btn.getBoundingClientRect();
        this.$refs.btn.style.setProperty('--x', evt.clientX - left + 'px');
        this.$refs.btn.style.setProperty('--y', evt.clientY - top + 'px');
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
  transition: color 0.3s, border-color 0.3s, background 0.3s, box-shadow 0.3s;
  overflow: hidden;

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
      background-image: radial-gradient(circle, #fff 10%, transparent 10.01%);
      background-repeat: no-repeat;
      background-position: 50%;
      transform: translate(-50%, -50%) scale(10);
      transition: transform 0.3s, opacity 0.8s;
    }

    // 啟動波紋
    &:active::after {
      transform: translate(-50%, -50%) scale(0);
      opacity: 0.3;
      transition: 0s;
    }
  }

  // 以下樣式，補上短少的邊框寬度
  &[type='primary'],
  &[type='danger'],
  &[type='flat'] {
    border: 0;
    padding: calc(var(--vGap) + var(--borderWidth)) calc(var(--hGap) + var(--borderWidth));
  }
  &[type='primary'] {
    color: #fff;
    background: var(--themeColor);
  }
  &[type='danger'] {
    color: #fff;
    background: var(--dangerColor);
  }
  &:not([type='primary']):not([type='danger']) {
    // 非禁用hover 或 focus
    &:not([disabled]):hover,
    &:focus-within {
      color: var(--themeColor);
      border-color: var(--themeColor);
    }
    .btn::after {
      background-image: radial-gradient(circle, var(--themeColor) 10%, transparent 10.01%);
    }
  }
  &[type='dashed'] {
    border-style: dashed;
  }
  &[type='flat'] {
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

  // 焦點的陰影
  &:focus-within {
    box-shadow: $shadow-52;
  }

  &[href] {
    cursor: pointer;
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
    &:active {
      z-index: 1;
    }
    // 按下
    // &:active {
    //   transform: translateY(0.05em);
    // }
  }

  // 禁用背景顏色 (無指定類型)
  &[disabled]:not([type]) {
    background: rgba(0, 0, 0, 0.1);
  }

  // 圓形
  &[shape='circle'] {
    border-radius: 50%;
  }

  // 區塊
  &[block] {
    display: flex;
  }
}

.zyl-btn {
  .loading,
  .icon {
    margin-right: 0.35em;
  }

  .icon {
    transition: none;
  }
}
</style>
