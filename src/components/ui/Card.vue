/* eslint-disable vue/no-mutating-props */
<template>
  <div class="card">
    <!-- Header -->
    <header v-if="!!$slots.cardHeader || !!$scopedSlots.cardHeader" class="card__header">
      <slot name="cardHeader" />
    </header>
    <!-- Main -->
    <main v-if="!!$slots.cardMain || !!$scopedSlots.cardMain" class="card__main">
      <slot name="cardMain"> </slot>
    </main>
    <!-- Header -->
    <footer v-if="!!$slots.cardFooter || !!$scopedSlots.cardFooter" class="card__footer">
      <slot name="cardFooter" />
    </footer>
  </div>
</template>

<script>
export default /*#__PURE__*/ {
  name: 'Card',
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
