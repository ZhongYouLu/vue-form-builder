/* eslint-disable vue/no-mutating-props */
<template>
  <component :is="tag" class="x-block" :class="classes">
    <slot />
  </component>
</template>

<script>
export default /*#__PURE__*/ {
  name: 'Block',
  props: {
    tag: { type: String, default: 'div' },
    shadow: { type: Boolean, default: null },
    radius: { type: Boolean, default: null },
    border: { type: Boolean, default: null },
  },
  computed: {
    classes() {
      return {
        'x-block--radius': this.radius,
        'x-block--shadow': this.shadow,
        'x-block--border': this.border,
      };
    },
  },
};
</script>

<style lang="scss">
@import '@/assets/scss/utils.scss';

.x-block {
  overflow: hidden;
  margin-bottom: var(--hGap);

  &--radius {
    border-radius: var(--borderRadius);
  }

  &--shadow {
    box-shadow: $shadow-52;
    transition: box-shadow 0.2s ease-in;

    &:hover {
      box-shadow: $shadow-56;
    }
  }

  &--border {
    border: var(--borderWidth) solid var(--borderColor);
  }
}

fieldset.x-block {
  margin: 0;
  padding: 0;
  // border: none;
}
</style>
