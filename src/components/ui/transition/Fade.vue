<template>
  <transition name="fade" v-bind="$attrs" v-on="$listeners">
    <slot />
  </transition>
</template>

<script>
export default /*#__PURE__*/ {
  name: 'TransitionFade',
  inheritAttrs: false,
};
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>
