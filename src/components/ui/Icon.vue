<template>
  <span ref="el" class="icon" />
</template>

<script>
import Iconify from '@purge-icons/generated';

export default /*#__PURE__*/ {
  name: 'Icon',
  props: {
    icon: {
      type: String,
      required: true,
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
        if (icon) {
          span.dataset.icon = icon;
        }
        this.$refs.el.appendChild(span);
      }
    },
  },
};
</script>
<style lang="scss">
.icon {
  display: inline-block;
  width: 1em;
  height: 1em;
  vertical-align: middle;

  .iconify {
    display: inline-block;
    width: 100%;
    height: 100%;
    vertical-align: super;
  }
}
</style>
