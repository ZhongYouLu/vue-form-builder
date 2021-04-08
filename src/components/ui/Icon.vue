<template>
  <span ref="el" class="x-icon" :style="styles" :spin="spin" @click="handleClick" />
</template>

<script>
import Iconify from '@iconify/iconify';

export default /*#__PURE__*/ {
  name: 'Icon',
  props: {
    icon: { type: String, required: true },
    color: { type: String, default: null },
    size: { type: Number, default: null },
    spin: { type: Boolean, default: null },
  },
  emits: ['click'],
  computed: {
    styles() {
      const temp = {};
      if (this.color) temp.color = this.color;
      if (this.size) temp.fontSize = `${this.size}px`;

      return temp;
    },
  },
  watch: {
    icon: 'updateIcon',
  },
  mounted() {
    this.updateIcon(this.icon);
  },
  methods: {
    async updateIcon(icon) {
      await this.$nextTick();
      this.$refs.el.textContent = '';
      const temp = Iconify.default ? Iconify.default : Iconify;
      const svg = icon ? temp.renderSVG(icon, {}) : null;
      if (svg) {
        this.$refs.el.appendChild(svg);
      } else {
        const span = document.createElement('span');
        span.className = 'iconify';
        if (icon) span.dataset.icon = icon;
        this.$refs.el.appendChild(span);
      }
    },
    handleClick(e) {
      if (this._events.click) {
        e.preventDefault();
        this.$emit('click');
      }
    },
  },
};
</script>

<style lang="scss">
@import '@/assets/scss/utils.scss';

.x-icon {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  width: 1em;
  height: 1em;
  font-size: inherit;
  transition: 0.3s;

  .iconify {
    display: block;
    width: 100%;
    height: 100%;
    margin: auto;
    fill: currentColor;
    overflow: hidden;
    /*transition:inherit;*/
  }

  &[spin] {
    animation: rotate 1.4s linear infinite;
  }

  @keyframes rotate {
    to {
      transform: rotate(360deg);
    }
  }
}
</style>
