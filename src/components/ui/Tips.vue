/* eslint-disable vue/no-mutating-props */
<template>
  <div
    ref="tips"
    class="tips"
    :style="styles"
    :tips="tips"
    :prefix="prefix"
    :suffix="suffix"
    :dir="tempDir"
    :type="type"
    :show="show ? 'true' : 'false'"
  >
    <slot>{{ tempDir }}</slot>
  </div>
</template>

<script>
export default /*#__PURE__*/ {
  name: 'Tips',
  props: {
    tips: { type: String, default: null },
    dir: {
      type: String,
      default: 'top',
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
    },
    type: {
      type: String,
      default: null,
      validator(value) {
        return ['success', 'error', 'warning'].includes(value);
      },
    },
    prefix: { type: String, default: '' },
    suffix: { type: String, default: '' },
    show: { type: Boolean, default: null },

    color: { type: String, default: '' },
  },
  data() {
    return {
      TIP_SIZE: 30,
      tempDir: null,
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

.tips {
  display: inline-block;
  position: relative;
  overflow: visible;

  // slot {
  //   border-radius: inherit;
  // }

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
  &::after {
    width: 0;
    height: 0;
    border: 6px solid transparent;
    overflow: hidden;
  }
  &[tips]:not([tips='']) {
    &[show='true'],
    &:hover:not([show='false']),
    &:focus-within:not([show='false']) {
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
    &[show='true'],
    &:hover:not([show='false']),
    &:focus-within:not([show='false']) {
      &::before,
      &::after {
        transform: translate(-50%, -10px);
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
    &[show='true'],
    &:hover:not([show='false']),
    &:focus-within:not([show='false']) {
      &::before,
      &::after {
        transform: translate(10px, -50%);
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
    &[show='true'],
    &:hover:not([show='false']),
    &:focus-within:not([show='false']) {
      &::before,
      &::after {
        transform: translate(-50%, 10px);
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
    &[show='true'],
    &:hover:not([show='false']),
    &:focus-within:not([show='false']) {
      &::before,
      &::after {
        transform: translate(-10px, -50%);
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
    &[show='true'],
    &:hover:not([show='false']),
    &:focus-within:not([show='false']) {
      &::before,
      &::after {
        transform: translate(0, -10px);
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
    &[show='true'],
    &:hover:not([show='false']),
    &:focus-within:not([show='false']) {
      &::before,
      &::after {
        transform: translate(10px, 0);
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
    &[show='true'],
    &:hover:not([show='false']),
    &:focus-within:not([show='false']) {
      &::before,
      &::after {
        transform: translate(0, 10px);
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
    &[show='true'],
    &:hover:not([show='false']),
    &:focus-within:not([show='false']) {
      &::before,
      &::after {
        transform: translate(-10px, 0);
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
