/* eslint-disable vue/no-mutating-props */
<template>
  <div class="card">
    <header v-if="hasHeader" class="card__header">
      <slot name="cardHeader" />
    </header>
    <main v-if="hasMain" class="card__main">
      <slot name="cardMain" />
    </main>
    <footer v-if="hasFooter" class="card__footer">
      <slot name="cardFooter" />
    </footer>
  </div>
</template>

<script>
export default /*#__PURE__*/ {
  name: 'Card',
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

.card {
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
