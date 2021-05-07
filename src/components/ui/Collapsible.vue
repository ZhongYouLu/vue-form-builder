<template>
  <div class="collapsible" :class="{ showing: open, hidden: !open }" :style="{ 'max-height': calcedHeight }">
    <slot />
  </div>
</template>

<script>
export default /*#__PURE__*/ {
  name: 'Collapsible',
  props: {
    open: { type: Boolean, default: false },
  },
  data() {
    return {
      height: 0,
    };
  },
  computed: {
    /**
     * @return {string} max height of the container in pixels if shown else zero
     */
    calcedHeight() {
      const maxHeight = this.open ? this.height : 10;
      const maxHeightPx = maxHeight + 'px';

      return maxHeightPx;
    },
  },
  updated() {
    this.height = this.$slots['default'][0].elm.clientHeight;
    console.log('updated', this.height);
  },
  mounted() {
    this.height = this.$slots['default'][0].elm.clientHeight;
  },
};
</script>

<style lang="scss">
.collapsible {
  height: auto;
  transition: max-height 0.3s;

  // &.showing {
  //   transition: all 0.6s cubic-bezier(1, 0.01, 1, 0.01);
  // }
  // &.hidden {
  //   transition: all 0.6s cubic-bezier(0.01, 1, 0.01, 1);
  // }
}
</style>
