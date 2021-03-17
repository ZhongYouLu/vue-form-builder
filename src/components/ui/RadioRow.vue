<template>
  <div class="radio-row">
    <slot />
  </div>
</template>

<script>
export default /*#__PURE__*/ {
  name: 'RadioRow',
};
</script>

<style lang="scss">
@import '@/assets/scss/utils.scss';

.radio-row {
  & > label {
    display: inline-block;
    margin-right: $input-gap * 4;
    white-space: nowrap; /* 強迫不換行 */

    &:last-of-type {
      margin-right: initial;
    }
  }
}
</style>
