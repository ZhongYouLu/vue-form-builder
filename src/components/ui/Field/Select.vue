<template>
  <div>
    <VueSelect
      v-model="mutableValue"
      v-bind="$attrs"
      :options="options"
      :clearable="clearable"
      :searchable="searchable"
      :append-to-body="true"
      :calculate-position="withPopper"
      :reduce="tempReduce"
      :get-option-label="tempGetOptionLabel"
      :filter="fuseSearch"
      :reset-on-options-change="false"
    >
      <template v-if="searchable" #option="option">
        {{ option.name || option.id }}
        <br />
        <em>{{ option.label }}</em>
      </template>

      <template v-if="searchable" #no-options="{ search, searching }">
        <template v-if="searching">
          查無
          <em>{{ search }}</em> 相關.
        </template>
        <em v-else style="opacity: 0.5">開始嘗試搜尋欄位</em>
      </template>

      <template v-for="(_, slot) in $scopedSlots" #[slot]="props">
        <slot :name="slot" v-bind="props" />
      </template>
    </VueSelect>
  </div>
</template>

<script>
import VueSelect from 'vue-select';
import Fuse from 'fuse.js';
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
    clearable: { type: Boolean, default: false },
    searchable: { type: Boolean, default: false },
    reduce: { type: Function, default: null },
    getOptionLabel: { type: Function, default: null },
    fuseKeys: { type: Array, default: () => ['name', 'label'] },
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
    tempReduce() {
      if (this.reduce) return this.reduce;
      // default
      return !this.searchable ? (option) => option.value : (option) => option.id;
    },
    tempGetOptionLabel() {
      if (this.getOptionLabel) return this.getOptionLabel;
      // default
      return !this.searchable ? (option) => option.text : (option) => option.name || option.id;
    },
    fuseSearch() {
      if (!this.searchable) return null;

      return (options, search) => {
        const fuse = new Fuse(options, {
          keys: this.fuseKeys,
          shouldSort: true,
        });
        return search.length ? fuse.search(search).map(({ item }) => item) : fuse.list;
      };
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
