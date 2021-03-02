<template>
  <fragment>
    <label :class="['input-row', { required: isRequired }]">
      <div class="for">
        <p>{{ label }}</p>
      </div>
      <div class="field">
        <slot>
          <template v-if="isInput">
            <div class="input">
              <input v-bind="$attrs" :value="value" :type="type" @input="update" />
            </div>
          </template>
          <template v-else-if="type === 'radio'">
            <div class="radio-row">
              <label v-for="option in options" :key="option.text">
                <input
                  type="radio"
                  :value="option.value"
                  :checked="option.value === value"
                  @change="setSelected(option.value)"
                />
                <span>{{ option.text }}</span>
              </label>
            </div>
          </template>
          <template v-else-if="type === 'select'">
            <VueSelect
              v-bind="$attrs"
              :value="value"
              :options="options"
              :clearable="false"
              :append-to-body="true"
              :calculate-position="withPopper"
              :searchable="false"
              :reduce="(option) => option.value"
              :get-option-label="(option) => option.text"
              @input="setSelected"
            />
          </template>
          <template v-else-if="type === 'select-search'">
            <VueSelect
              v-bind="$attrs"
              :value="value"
              :options="options"
              :clearable="true"
              :append-to-body="true"
              :calculate-position="withPopper"
              :searchable="true"
              :reduce="reduce"
              :get-option-label="getOptionLabel"
              :filter="fuseSearch"
              :reset-on-options-change="false"
              @input="setSelected"
            >
              <template #option="option">
                {{ option.name || option.id }}
                <br />
                <em>{{ option.label }}</em>
              </template>
              <template #no-options="{ search, searching }">
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
          </template>
        </slot>
      </div>
    </label>
    <div>
      <slot name="msg" />
    </div>
  </fragment>
</template>
<script>
import { Fragment } from 'vue-fragment';
import VueSelect from 'vue-select';
import Fuse from 'fuse.js';
import { createPopper } from '@popperjs/core';

export default /*#__PURE__*/ {
  components: {
    Fragment,
    VueSelect,
  },
  inheritAttrs: false,
  props: {
    label: { type: String, required: true },
    value: { type: [String, Number], default: '' },
    isRequired: { type: Boolean, default: false },
    type: {
      type: String,
      default: 'text',
      validator(value) {
        return ['text', 'number', 'select', 'select-search', 'radio', 'checkbox'].includes(value);
      },
    },
    options: { type: Array, default: () => [] },
    reduce: { type: Function, default: (option) => option.id },
    getOptionLabel: { type: Function, default: (option) => option.name || option.id },
  },
  emits: ['input'],
  data() {
    return {
      placement: 'bottom',
    };
  },
  computed: {
    isInput() {
      return ['text', 'number'].includes(this.type);
    },
  },
  methods: {
    update(e) {
      this.$emit('input', e.target.value);
    },
    setSelected(value) {
      console.log(`setSelected:${this.label}`, value);
      this.$emit('input', value);
    },
    fuseSearch(options, search) {
      const fuse = new Fuse(options, {
        keys: ['name', 'label'],
        shouldSort: true,
      });
      return search.length ? fuse.search(search).map(({ item }) => item) : fuse.list;
    },
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
<style lang="scss">
@import '~vue-select/src/scss/vue-select.scss';
@import '@/assets/scss/utils.scss';
@import '@/assets/scss/components/_field.scss';

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
