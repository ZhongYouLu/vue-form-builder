<template>
  <transition-group tag="div" :name="back ? 'slider-prev' : 'slider-next'" v-bind="$attrs" v-on="$listeners">
    <slot />
  </transition-group>
</template>

<script>
export default /*#__PURE__*/ {
  name: 'SliderTransitionGroup',
  inheritAttrs: false,
  props: {
    back: { type: Boolean, default: false },
  },
};
</script>

<style lang="scss">
.slider-prev-enter-active,
.slider-prev-leave-active,
.slider-next-enter-active,
.slider-next-leave-active {
  transition: transform 0.5s ease;
}

.slider-prev-enter,
.slider-prev-leave-to,
.slider-next-enter,
.slider-next-leave-to {
  position: absolute;
  width: 100%;
}

.slider-next-enter,
.slider-prev-leave-to {
  transform: translateX(105%);
}

.slider-next-leave-to,
.slider-prev-enter {
  transform: translateX(-105%);
}
</style>
