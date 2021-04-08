<template>
  <div class="x-icon-row">
    <slot />
    <Icon v-if="icon" :icon="icon" />
  </div>
</template>

<script>
import Icon from '@/components/ui/Icon';

export default /*#__PURE__*/ {
  name: 'IconRow',
  components: {
    Icon,
  },
  props: {
    icon: { type: String, default: null },
  },
};
</script>

<style lang="scss">
@import '@/assets/scss/utils.scss';

.x-icon-row {
  @include content-centered($x: false);

  .x-icon {
    margin-left: 0.5rem;
    opacity: 0.7;
  }
}
</style>
