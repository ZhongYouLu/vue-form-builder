/* eslint-disable vue/no-mutating-props */
<template>
  <div class="x-card">
    <header v-if="hasHeader" class="x-card__header">
      <slot name="cardHeader" />
    </header>
    <main v-if="hasMain" class="x-card__main">
      <slot name="cardMain" />
    </main>
    <footer v-if="hasFooter" class="x-card__footer">
      <slot name="cardFooter" />
    </footer>
  </div>
</template>

<script>
export default /*#__PURE__*/ {
  name: 'Card',
  props: {
    open: { type: Boolean, default: false },
  },
  computed: {
    hasHeader() {
      return !!this.$slots.cardHeader || !!this.$scopedSlots.cardHeader;
    },
    hasMain() {
      return !!this.$slots.cardMain || !!this.$scopedSlots.cardMain;
    },
    hasFooter() {
      return !!this.$slots.cardFooter || !!this.$scopedSlots.cardFooter;
    },
  },
};
</script>

<style lang="scss">
@import '@/assets/scss/utils.scss';

.x-card {
  background-color: $color-white;

  &__header {
    @include content-centered($x: false);
    padding: $gap $gap-lg;
    color: $color-white;
    font-weight: bolder;
    background-color: lighten($color-gray-dark, 20);
  }

  &__main {
    padding: $gap-lg;
  }
}
</style>
