/* eslint-disable vue/no-mutating-props */
<template>
  <div
    ref="tips"
    class="x-tips"
    v-bind="{
      style: styles,
      type: type,
      dir: tempDir,
      tips: localTips,
      prefix: prefix,
      suffix: suffix,
      show: localShow,
      hastips: !disabled ? !!tips : null,
      tabindex: disabled ? -1 : null,
    }"
  >
    <slot />
  </div>
</template>

<script>
export default /*#__PURE__*/ {
  name: 'Tips',
  props: {
    tips: { type: String, default: null },
    prefix: { type: String, default: '' },
    suffix: { type: String, default: '' },
    dir: {
      validator(value) {
        return [
          // 'auto',
          'top',
          'topleft',
          'topright',
          'right',
          'righttop',
          'rightbottom',
          'bottom',
          'bottomleft',
          'bottomright',
          'left',
          'lefttop',
          'leftbottom',
        ].includes(value);
      },
      default: 'top',
    },
    type: {
      validator(value) {
        return ['success', 'error', 'warning'].includes(value);
      },
      default: null,
    },
    show: { type: Boolean, default: null },
    color: { type: String, default: '' },
    disabled: { type: Boolean, default: null },
  },
  data() {
    return {
      TIP_SIZE: 30,
      tempDir: null,
      localTips: this.tips,
      localShow: this.show,
      timer: null,
      showTimer: null,
    };
  },
  computed: {
    styles() {
      return (
        this.color && {
          '--color': this.color,
        }
      );
    },
  },
  watch: {
    dir: 'resetDir',
    tips: function (_tips) {
      this.timer && clearTimeout(this.timer);

      if (_tips) {
        this.localTips = _tips;
      } else {
        this.timer = setTimeout(() => {
          this.localTips = null;
        }, 300);
      }
    },
    show: function (_show) {
      this.showTimer && clearTimeout(this.showTimer);

      // todo: sync
      this.localShow = _show;
      if (_show) {
        this.showTimer = setTimeout(() => {
          this.localShow = null;
        }, 1500);
      }
    },
  },
  mounted() {
    this.resetDir();
  },
  methods: {
    resetDir() {
      this.tempDir = this.dir;
      if (this.tempDir === 'auto') {
        const { left, top, width, height } = this.$refs.tips.getBoundingClientRect();
        const w = document.body.scrollWidth;
        const h = document.body.scrollHeight;

        if (top < this.TIP_SIZE) {
          this.tempDir = 'bottom';
        }
        if (h - top - height < this.TIP_SIZE) {
          this.tempDir = 'top';
        }
        if (left < this.TIP_SIZE) {
          this.tempDir = 'right';
        }
        if (w - left - width < this.TIP_SIZE) {
          this.tempDir = 'left';
        }
      }
    },
  },
};
</script>

<style lang="scss">
@import '@/assets/scss/utils.scss';

.x-tips {
  display: inline-flex;
  position: relative;
  overflow: visible;

  // 方框 & 箭頭
  &::before,
  &::after {
    content: '';
    position: absolute;
    display: block;
    color: var(--color, rgba(0, 0, 0, 0.75));
    opacity: 0;
    transform: translate(-50%, -20px);
    transition: all 0.15s 0.15s, left 0s, top 0s;
    z-index: 1;
    pointer-events: none;
    visibility: hidden;
  }
  // 方框
  &::before {
    content: attr(prefix) attr(tips) attr(suffix);
    padding: 6px 10px;
    width: max-content;
    max-width: 200px;
    line-height: 18px;
    text-align: left;
    font-size: 12px;
    font-style: normal;
    color: #fff;
    border-radius: 3px;
    background-color: var(--color, rgba(0, 0, 0, 0.75));
  }
  // 箭頭
  &::after {
    width: 0;
    height: 0;
    border: 6px solid transparent;
    overflow: hidden;
  }
  &[hastips] {
    &[show],
    &:not([show]):hover,
    &:not([show]):focus-within {
      &::before,
      &::after {
        visibility: visible;
        opacity: 1;
      }
    }
  }

  /* top & '' */
  &[dir='top'],
  &:not([dir]) {
    &::before,
    &::after {
      left: calc(var(--percent, 0.5) * 100%);
      bottom: 100%;
      transform: translate(-50%, -20px);
    }
    &::after {
      margin-bottom: -12px;
      border-top-color: currentColor;
    }
    &[hastips] {
      &[show],
      &:not([show]):hover,
      &:not([show]):focus-within {
        &::before,
        &::after {
          transform: translate(-50%, -10px);
        }
      }
    }
  }

  /* right */
  &[dir='right'] {
    &::before,
    &::after {
      left: 100%;
      top: 50%;
      transform: translate(20px, -50%);
    }
    &::after {
      margin-left: -12px;
      border-right-color: currentColor;
    }
    &[hastips] {
      &[show],
      &:not([show]):hover,
      &:not([show]):focus-within {
        &::before,
        &::after {
          transform: translate(10px, -50%);
        }
      }
    }
  }

  /* bottom */
  &[dir='bottom'] {
    &::before,
    &::after {
      left: calc(var(--percent, 0.5) * 100%);
      top: 100%;
      transform: translate(-50%, 20px);
    }
    &::after {
      margin-top: -12px;
      border-bottom-color: currentColor;
    }
    &[hastips] {
      &[show],
      &:not([show]):hover,
      &:not([show]):focus-within {
        &::before,
        &::after {
          transform: translate(-50%, 10px);
        }
      }
    }
  }

  /* left */
  &[dir='left'] {
    &::before,
    &::after {
      right: 100%;
      top: 50%;
      transform: translate(-20px, -50%);
    }
    &::after {
      margin-right: -12px;
      border-left-color: currentColor;
    }
    &[hastips] {
      &[show],
      &:not([show]):hover,
      &:not([show]):focus-within {
        &::before,
        &::after {
          transform: translate(-10px, -50%);
        }
      }
    }
  }

  /* topleft & topright */
  &[dir='topleft'],
  &[dir='topright'] {
    &::before,
    &::after {
      bottom: 100%;
      transform: translate(0, -20px);
    }
    &::after {
      margin-bottom: -12px;
      border-top-color: currentColor;
    }
    &[hastips] {
      &[show],
      &:not([show]):hover,
      &:not([show]):focus-within {
        &::before,
        &::after {
          transform: translate(0, -10px);
        }
      }
    }
  }
  &[dir='topleft'] {
    &::before {
      left: 0;
    }
    &::after {
      left: 10px;
    }
  }
  &[dir='topright'] {
    &::before {
      right: 0;
    }
    &::after {
      right: 10px;
    }
  }

  /* righttop & rightbottom */
  &[dir='righttop'],
  &[dir='rightbottom'] {
    &::before,
    &::after {
      left: 100%;
      transform: translate(20px, 0);
    }
    &::after {
      margin-left: -12px;
      border-right-color: currentColor;
    }
    &[hastips] {
      &[show],
      &:not([show]):hover,
      &:not([show]):focus-within {
        &::before,
        &::after {
          transform: translate(10px, 0);
        }
      }
    }
  }
  &[dir='righttop'] {
    &::before {
      top: 0;
    }
    &::after {
      top: 10px;
    }
  }
  &[dir='rightbottom'] {
    &::before {
      bottom: 0;
    }
    &::after {
      bottom: 10px;
    }
  }

  /* bottomleft & bottomright */
  &[dir='bottomleft'],
  &[dir='bottomright'] {
    &::before,
    &::after {
      top: 100%;
      transform: translate(0, 20px);
    }
    &::after {
      margin-top: -12px;
      border-bottom-color: currentColor;
    }
    &[hastips] {
      &[show],
      &:not([show]):hover,
      &:not([show]):focus-within {
        &::before,
        &::after {
          transform: translate(0, 10px);
        }
      }
    }
  }
  &[dir='bottomleft'] {
    &::before {
      left: 0;
    }
    &::after {
      left: 10px;
    }
  }
  &[dir='bottomright'] {
    &::before {
      right: 0;
    }
    &::after {
      right: 10px;
    }
  }

  /* lefttop & leftbottom */
  &[dir='lefttop'],
  &[dir='leftbottom'] {
    &::before,
    &::after {
      right: 100%;
      transform: translate(-20px, 0);
    }
    &::after {
      margin-right: -12px;
      border-left-color: currentColor;
    }
    &[hastips] {
      &[show],
      &:not([show]):hover,
      &:not([show]):focus-within {
        &::before,
        &::after {
          transform: translate(-10px, 0);
        }
      }
    }
  }
  &[dir='lefttop'] {
    &::before {
      top: 0;
    }
    &::after {
      top: 10px;
    }
  }
  &[dir='leftbottom'] {
    &::before {
      bottom: 0;
    }
    &::after {
      bottom: 10px;
    }
  }

  /* success */
  &[type='success'] {
    --color: var(--successColor, #52c41a);
  }
  /* error */
  &[type='error'] {
    --color: var(--errorColor, #f4615c);
  }
  /* warning */
  &[type='warning'] {
    --color: var(--waringColor, #faad14);
  }
}
</style>
