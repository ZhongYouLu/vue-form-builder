/* eslint-disable vue/no-mutating-props */
<template>
  <div class="block" :class="classes">
    <slot />
  </div>
</template>

<script>
export default /*#__PURE__*/ {
  name: 'Block',
  props: {
    shadow: { type: Boolean, required: false },
    radius: { type: Boolean, required: false },
  },
  computed: {
    classes() {
      return {
        'block--radius': this.radius,
        'block--shadow': this.shadow,
      };
    },
  },
};
</script>

<style lang="scss">
@import '@/assets/scss/utils.scss';

.block {
  overflow: hidden;
  margin-bottom: $gap-lg;

  &--radius {
    border-radius: $border-radius;
  }

  &--shadow {
    box-shadow: $shadow-52;
    transition: box-shadow 0.2s ease-in;

    &:hover {
      box-shadow: $shadow-56;
    }
  }
}
</style>
