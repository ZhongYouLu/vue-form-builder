<template>
  <VueSelect
    :value="mutableValue"
    :options="mutableOptions"
    :placeholder="placeholder"
    :autocomplete="autocomplete"
    :disabled="disabled"
    :multiple="multiple"
    :label="textKey"
    :selectable="invokeSelectable"
    :reduce="invokeReduce"
    :get-option-label="invokeGetOptionLabel"
    :reset-on-options-change="resetOnOptionsChange"
    :clearable="clearable"
    :searchable="searchable"
    :filterable="filterable"
    :filter="fuseSearch"
    :taggable="taggable"
    :push-tags="pushTags"
    :create-option="invokeCreatedOption"
    :close-on-select="closeOnSelect"
    :no-drop="noDrop"
    :append-to-body="true"
    :calculate-position="withPopper"
    @input="handleInput"
    @option:selected="handleSelected"
    @option:created="handleCreated"
  >
    <template #search="{ attributes, events }">
      <input
        :id="id"
        ref="input"
        :name="name"
        class="vs__search"
        :required="required && !mutableValue"
        v-bind="attributes"
        v-on="events"
        @focus="$emit('focus')"
        @blur="$emit('blur')"
      />
    </template>

    <!-- 已選項目  -->
    <template #selected-option="option">
      <IconRow :icon="icons[option[iconKey]] || option[iconKey]">
        {{ option[textKey] || `(${option[valueKey]})` }}
      </IconRow>
    </template>

    <!-- 項目  -->
    <template #option="option">
      <IconRow :icon="icons[option[iconKey]] || option[iconKey]">
        {{ option[textKey] || `(${option[valueKey]})` }}
      </IconRow>
    </template>

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
import IconRow from '@/components/ui/IconRow';
import Fuse from 'fuse.js';
import { createPopper } from '@popperjs/core';
import { nanoid } from '@/assets/js/helper.js';

export default /*#__PURE__*/ {
  name: 'FieldSelect',
  components: {
    VueSelect,
    IconRow,
  },
  inheritAttrs: false,
  props: {
    // https://vue-select.org/api/props.html#options
    value: { type: [String, Number, Boolean, Array], default: null },
    options: { type: Array, default: () => [] },
    icons: { type: Object, default: () => ({}) },
    id: { type: String, default: null },
    name: { type: String, default: null },
    placeholder: { type: String, default: null },
    autocomplete: { type: String, default: 'off' },
    disabled: { type: Boolean, default: false },
    multiple: { type: Boolean, default: false },
    required: { type: Boolean, default: false },
    // ---------------------------------------------
    valueKey: { type: String, default: 'id' },
    textKey: { type: String, default: 'text' },
    iconKey: { type: String, default: 'icon' },
    selectable: { type: Function, default: null }, // 是否可選處理
    reduce: { type: Function, default: null }, // 轉換對象處理 (傳遞給 v-model binding 或 @input event.)
    getOptionLabel: { type: Function, default: null }, // 生成項目文字處理
    resetOnOptionsChange: { type: [Function, Boolean], default: false }, // 項目更新是否重置所選值處理
    // ---------------------------------------------
    clearable: { type: Boolean, default: false }, // 是否可清除所選
    searchable: { type: Boolean, default: true }, // 是否可查詢項目
    // ---------------------------------------------
    filterable: { type: Boolean, default: true }, // When true, existing options will be filtered by the search text. Should not be used in conjunction with taggable.
    fuseKeys: { type: Array, default: null }, // 模糊查詢欄位
    // ---------------------------------------------
    taggable: { type: Boolean, default: false }, // Enable/disable creating options from searchInput.
    pushTags: { type: Boolean, default: false }, // When true, newly created tags will be added to the options list.
    createOption: { type: Function, default: null }, // User defined function for adding Options
    reactable: { type: Boolean, default: false },
    // ---------------------------------------------
    closeOnSelect: { type: Boolean, default: true }, // Close a dropdown when an option is chosen. Set to false to keep the dropdown open
    noDrop: { type: Boolean, default: false }, // Disable the dropdown entirely.
  },
  emits: ['input', 'focus', 'blur'],
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
    mutableOptions() {
      return this.options;
    },
    invokeSelectable() {
      if (this.selectable !== null) return this.selectable;
      // multiple
      if (this.multiple) return (option) => !(this.value || []).includes(option[this.valueKey]);
      // default
      return () => true;
    },
    invokeReduce() {
      if (this.reduce !== null) return this.reduce;
      // default
      return (option) => option[this.valueKey];
    },
    invokeGetOptionLabel() {
      // Label text is used for filtering comparison and displaying.
      // If you only need to adjust the display, you should use the option and selected-option slots.
      if (this.getOptionLabel !== null) return this.getOptionLabel;
      // default
      return (option) => option[this.textKey] || `(${option[this.valueKey]})`;
    },
    invokeCreatedOption() {
      if (this.createOption !== null) return this.createOption;
      // default
      return (option) => ({ [this.valueKey]: nanoid(6), [this.textKey]: option });
    },
    fuseSearch() {
      if (!this.filterable || !this.searchable) return null;

      return (options, search) => {
        const fuse = new Fuse(options, {
          keys: this.fuseKeys ? this.fuseKeys : [this.valueKey, this.textKey],
          shouldSort: true,
        });
        return search.length ? fuse.search(search).map(({ item }) => item) : fuse.list;
      };
    },
  },
  methods: {
    handleInput(value) {
      // console.log('handleInput', value);
      this.mutableValue = value;
    },
    handleSelected(/*option*/) {
      // console.log('handleSelected', option);
    },
    handleCreated(option) {
      // console.log('handleCreated', option);
      if (this.reactable) {
        this.mutableOptions.push(option);
      }
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
@import '@/assets/scss/utils.scss';

// Vue-select
$vs-colors: (
  lightest: rgba(60, 60, 60, 0.26),
  light: rgba(60, 60, 60, 0.5),
  dark: #333,
  darkest: rgba(0, 0, 0, 0.15),
) !default;
$vs-component-placeholder-color: $color-gray-dark;
$vs-state-active-bg: var(--selectionBgColor);
$vs-state-active-color: var(--selectionFontColor);

$vs-border-width: var(--borderWidth);
$vs-border-style: solid;
$vs-border-radius: var(--borderRadius);
$vs-border-color: var(--borderColor);

$vs-controls-color: var(--borderColor);

$vs-dropdown-box-shadow: 0px 3px 6px 0px rgba(0, 0, 0, 0.5);

@import '~vue-select/src/scss/vue-select.scss';

.v-select {
  line-height: 1.4;

  .vs__actions svg {
    transition: fill 300ms, transform 150ms cubic-bezier(1, -0.115, 0.975, 0.855);
  }

  &:hover,
  &:focus-within {
    .vs__dropdown-toggle {
      border-color: var(--themeColor);
    }
    .vs__actions svg {
      fill: var(--themeColor);
    }
  }
}
.vs {
  &__search,
  &__search:focus {
    margin: calc(var(--borderWidth) * -1) 0;
    padding: var(--vGap) var(--hGap);
  }
  &__selected-options {
    padding: 0;
    overflow: hidden;
  }

  &__selected {
    padding: 0 var(--vGap);
    margin: calc(var(--vGap) / 2) 0 calc(var(--vGap) / 2) var(--vGap);

    .vs--single.vs--open & {
      margin: calc(var(--borderWidth) * -1) 0;
      padding: var(--vGap) var(--hGap);
    }

    button:disabled {
      display: none;
    }
  }

  &__dropdown-toggle {
    padding: 0;
    transition: z-index 0.3s, border-color 0.3s, box-shadow 0.3s;

    .v-select.drop-up.vs--open & {
      border-radius: 0 0 $vs-border-radius $vs-border-radius;
      border-top-color: transparent;
      border-bottom-color: $vs-border-color;
    }
  }

  &__dropdown-option {
    // transition: color 0.1s, background 0.1s;
    .x-icon {
      transition: unset;
    }

    &--disabled {
      display: none;
    }
  }

  &__actions {
    margin: 0;
    padding: var(--vGap) var(--hGap) var(--vGap) 0;
  }
}

[data-popper-placement='top'] {
  border-radius: $vs-border-radius $vs-border-radius 0 0;
  border-top-style: $vs-border-style;
  border-bottom-style: none;
  box-shadow: 0px -3px 6px 0px rgba(0, 0, 0, 0.15);
}
</style>
