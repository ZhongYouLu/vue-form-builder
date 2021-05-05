<template>
  <transition-group tag="div" name="fade" :style="{ position: 'relative' }" v-bind="$attrs" v-on="$listeners">
    <slot />
  </transition-group>
</template>

<script>
export default /*#__PURE__*/ {
  name: 'TransitionGroupFade',
  inheritAttrs: false,
};
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease-out;
}

.fade-move {
  transition: transform 0.3s ease-out;
}

.fade-leave-active {
  position: absolute;
  width: 100%;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>
