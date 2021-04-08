/* eslint-disable vue/no-mutating-props */
<template>
  <div class="x-loading" :style="styles">
    <svg viewBox="22 22 44 44" :style="svgStyles">
      <circle cx="44" cy="44" r="20.2" fill="none" stroke-width="3.6"></circle>
    </svg>
    <slot></slot>
  </div>
</template>

<script>
export default /*#__PURE__*/ {
  name: 'Loading',
  props: {
    color: { type: String, default: null },
    size: { type: Number, default: null },
  },
  computed: {
    styles() {
      const temp = {};
      if (this.color) temp.color = this.color;
      if (this.size) temp.fontSize = `${this.size}px`;

      return temp;
    },
    svgStyles() {
      const temp = {};
      if (this.$slots.default) temp.margin = '0.5em';

      return temp;
    },
  },
};
</script>

<style lang="scss">
@import '@/assets/scss/utils.scss';

.x-loading {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  // flex-direction: column;
  font-size: inherit;
  color: var(--themeColor);

  svg {
    display: block;
    width: 1em;
    height: 1em;
    margin: auto;
    animation: rotate 1.4s linear infinite;
  }
  circle {
    stroke: currentColor;
    animation: progress 1.4s ease-in-out infinite;
    stroke-dasharray: 80px, 200px;
    stroke-dashoffset: 0px;
    // transition: 0.3s;
  }

  @keyframes rotate {
    to {
      transform: rotate(360deg);
    }
  }
  @keyframes progress {
    0% {
      stroke-dasharray: 1px, 200px;
      stroke-dashoffset: 0px;
    }
    50% {
      stroke-dasharray: 100px, 200px;
      stroke-dashoffset: -15px;
    }
    100% {
      stroke-dasharray: 100px, 200px;
      stroke-dashoffset: -125px;
    }
  }
}
</style>
