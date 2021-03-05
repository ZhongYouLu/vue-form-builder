<template>
  <VueSelect
    v-model="mutableValue"
    v-bind="$attrs"
    :options="options"
    :clearable="false"
    :append-to-body="true"
    :calculate-position="withPopper"
    :searchable="false"
    :reduce="(option) => option.value"
    :get-option-label="(option) => option.text"
  />
</template>

<script>
import VueSelect from 'vue-select';
import { createPopper } from '@popperjs/core';

export default /*#__PURE__*/ {
  name: 'FieldSelect',
  components: {
    VueSelect,
  },
  inheritAttrs: false,
  props: {
    value: { type: String, default: null },
    options: { type: Array, default: () => [] },
  },
  emits: ['input'],
  data() {
    return {
      placement: 'bottom',
    };
  },
  computed: {
    mutableValue: {
      get() {
        return this.value;
      },
      set(value) {
        this.$emit('input', value);
      },
    },
  },
  methods: {
    withPopper(dropdownList, component, { width }) {
      /**
       * We need to explicitly define the dropdown width since
       * it is usually inherited from the parent with CSS.
       */
      dropdownList.style.width = width;

      /**
       * Here we position the dropdownList relative to the $refs.toggle Element.
       *
       * The 'offset' modifier aligns the dropdown so that the $refs.toggle and
       * the dropdownList overlap by 1 pixel.
       *
       * The 'toggleClass' modifier adds a 'drop-up' class to the Vue Select
       * wrapper so that we can set some styles for when the dropdown is placed
       * above.
       */
      const popper = createPopper(component.$refs.toggle, dropdownList, {
        placement: this.placement,
        modifiers: [
          {
            name: 'offset',
            options: {
              offset: [0, -1],
            },
          },
          {
            name: 'toggleClass',
            enabled: true,
            phase: 'write',
            fn({ state }) {
              component.$el.classList.toggle('drop-up', state.placement === 'top');
            },
          },
        ],
      });

      /**
       * To prevent memory leaks Popper needs to be destroyed.
       * If you return function, it will be called just before dropdown is removed from DOM.
       */
      return () => popper.destroy();
    },
  },
};
</script>
//
<style lang="scss">
@import '~vue-select/src/scss/vue-select.scss';
@import '@/assets/scss/utils.scss';

// vue-select
.vs {
  &__search {
    &::placeholder {
      color: $color-gray-dark;
    }
  }
  &__clear,
  &__open-indicator {
    fill: fade-in($border-color, 0.8);
  }
  &__dropdown {
    &-toggle {
      background-color: $color-white;
      border-radius: $border-radius;
      border: $border-width solid $border-color;

      .v-select.drop-up.vs--open & {
        border-radius: 0 0 $border-radius $border-radius;
        border-top-color: transparent;
        border-bottom-color: $border-color;
      }
    }
    &-menu {
      background-color: $color-white;
      border-radius: 0 0 $border-radius $border-radius;
      border-width: $border-width;
      border-color: $border-color;
    }
    &-option {
      &--highlight {
        color: $selection-text-color;
        background-color: $selection-bg-color;
      }
    }
  }
}

[data-popper-placement='top'] {
  border-radius: $border-radius $border-radius 0 0;
  border-top-style: solid;
  border-bottom-style: none;
  // box-shadow: 0 -$border-radius 6px rgba(0, 0, 0, 0.15);
}
</style>
