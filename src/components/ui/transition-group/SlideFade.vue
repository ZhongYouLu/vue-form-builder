<template>
  <transition-group
    tag="div"
    name="slide-fade-list"
    v-bind="$attrs"
    :style="{ position: 'relative' }"
    v-on="$listeners"
  >
    <slot />
  </transition-group>
</template>

<script>
export default /*#__PURE__*/ {
  name: 'SlideFadeTransitionGroup',
  inheritAttrs: false,
};
</script>

<style>
.slide-fade-list-enter-active,
.slide-fade-list-leave-active {
  transition: opacity 0.3s ease-out, transform 0.3s ease-out;
}

/* .slide-fade-list-move {
  transition: transform 0.3s ease-out;
} */

.slide-fade-list-leave-active {
  position: absolute;
  width: 100%;
}

.slide-fade-list-enter,
.slide-fade-list-leave-to {
  transform: translateX(10px);
  opacity: 0;
}
</style>
