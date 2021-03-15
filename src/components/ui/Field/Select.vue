<template>
  <VueSelect
    v-model="mutableValue"
    :options="options"
    :placeholder="placeholder"
    :autocomplete="autocomplete"
    :disabled="disabled"
    :multiple="multiple"
    :selectable="tempSelectable"
    :reduce="tempReduce"
    :get-option-label="tempGetOptionLabel"
    :reset-on-options-change="resetOnOptionsChange"
    :clearable="clearable"
    :searchable="searchable"
    :filterable="filterable"
    :filter="fuseSearch"
    :taggable="taggable"
    :push-tags="pushTags"
    :create-option="createOption"
    :close-on-select="closeOnSelect"
    :no-drop="noDrop"
    :append-to-body="true"
    :calculate-position="withPopper"
  >
    <!-- 必填處理 -->
    <template v-if="required" #search="{ attributes, events }">
      <input class="vs__search" :required="!mutableValue" v-bind="attributes" v-on="events" />
    </template>

    <!-- 已選項目  -->
    <!-- <template #selected-option="option">
      {{ option }}
    </template> -->

    <!-- 項目  -->
    <!-- <template #option="option">
      {{ option }}
    </template> -->

    <!-- 無項目 -->
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
    // https://vue-select.org/api/props.html#options
    value: { type: [String, Array], default: null },
    options: { type: Array, default: () => [] },
    placeholder: { type: String, default: '' },
    autocomplete: { type: String, default: 'off' },
    disabled: { type: Boolean, default: false },
    multiple: { type: Boolean, default: false },
    required: { type: Boolean, default: false },
    // ---------------------------------------------
    selectable: { type: Function, default: null }, // 是否可選處理
    reduce: { type: Function, default: null }, // 轉換對象處理 (傳遞給 v-model binding 或 @input event.)
    getOptionLabel: { type: Function, default: null }, // 生成項目文字處理
    resetOnOptionsChange: { type: [Function, Boolean], default: false }, // 項目更新是否重置所選值處理
    // ---------------------------------------------
    clearable: { type: Boolean, default: false }, // 是否可清除所選
    searchable: { type: Boolean, default: false }, // 是否可查詢項目
    // ---------------------------------------------
    filterable: { type: Boolean, default: true }, // When true, existing options will be filtered by the search text. Should not be used in conjunction with taggable.
    fuseKeys: { type: Array, default: () => ['name'] }, // 模糊查詢欄位
    // ---------------------------------------------
    taggable: { type: Boolean, default: false }, // Enable/disable creating options from searchInput.
    pushTags: { type: Boolean, default: false }, // When true, newly created tags will be added to the options list.
    createOption: { type: Function, default: null }, // User defined function for adding Options
    // ---------------------------------------------
    closeOnSelect: { type: Boolean, default: true }, // Close a dropdown when an option is chosen. Set to false to keep the dropdown open
    noDrop: { type: Boolean, default: false }, // Disable the dropdown entirely.
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
    tempSelectable() {
      if (this.selectable !== null) return this.selectable;
      // multiple
      if (this.multiple) return (option) => !this.value.includes(option.id);
      // default
      return () => true;
    },
    tempReduce() {
      if (this.reduce !== null) return this.reduce;
      // searchable
      if (this.searchable) return (option) => option.id;
      // default
      return (option) => option.value;
    },
    tempGetOptionLabel() {
      // Label text is used for filtering comparison and displaying.
      // If you only need to adjust the display, you should use the option and selected-option slots.

      if (this.getOptionLabel !== null) return this.getOptionLabel;
      // searchable
      if (this.searchable) return (option) => option.name || option.id;
      // default
      return (option) => option.text;
    },
    fuseSearch() {
      if (!this.filterable || !this.searchable) return null;

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

<style lang="scss">
@import '@/assets/scss/utils.scss';

// Vue-select
$vs-component-placeholder-color: $color-gray-dark;
$vs-state-active-bg: $selection-bg-color;
$vs-state-active-color: $selection-text-color;

$vs-border-width: $border-width;
$vs-border-style: solid;
$vs-border-radius: $border-radius;
$vs-border-color: $border-color;

$vs-controls-color: $border-color;

$vs-dropdown-box-shadow: 0px 3px 6px 0px rgba(0, 0, 0, 0.5);

@import '~vue-select/src/scss/vue-select.scss';

.vs {
  &__dropdown-toggle {
    .v-select.drop-up.vs--open & {
      border-radius: 0 0 $vs-border-radius $vs-border-radius;
      border-top-color: transparent;
      border-bottom-color: $vs-border-color;
    }
  }

  &__dropdown-option--disabled {
    display: none;
  }
}

.vs__selected {
  button:disabled {
    display: none;
  }
}

[data-popper-placement='top'] {
  border-radius: $vs-border-radius $vs-border-radius 0 0;
  border-top-style: $vs-border-style;
  border-bottom-style: none;
  box-shadow: 0px -3px 6px 0px rgba(0, 0, 0, 0.15);
}
</style>
