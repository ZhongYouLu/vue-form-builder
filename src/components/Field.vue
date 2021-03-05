<template>
  <div class="field">
    <slot>
      <template v-if="type === 'text'">
        <FieldText v-model="mutableValue" v-bind="$attrs" />
      </template>

      <template v-else-if="type === 'number'">
        <FieldNumber v-model="mutableValue" v-bind="$attrs" />
      </template>

      <template v-else-if="type === 'radio'">
        <FieldRadio v-model="mutableValue" />
      </template>

      <template v-else-if="type === 'checkbox'">
        <FieldCheckbox v-model="mutableValue" v-bind="$attrs" />
      </template>

      <template v-else-if="type === 'select'">
        <FieldSelect v-model="mutableValue" v-bind="$attrs" />
      </template>

      <template v-else-if="type === 'select-search'">
        <!-- <VueSelect
          v-model="mutableValue"
          v-bind="$attrs"
          :options="options"
          :clearable="true"
          :append-to-body="true"
          :calculate-position="withPopper"
          :searchable="true"
          :reduce="reduce"
          :get-option-label="getOptionLabel"
          :filter="fuseSearch"
          :reset-on-options-change="false"
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
        </VueSelect> -->
      </template>
    </slot>
  </div>
</template>
<script>
// import VueSelect from 'vue-select';
// import Fuse from 'fuse.js';
// import { createPopper } from '@popperjs/core';
import FieldText from '@/components/Field/Text';
import FieldNumber from '@/components/Field/Number';
import FieldRadio from '@/components/Field/Radio';
import FieldCheckbox from '@/components/Field/Checkbox';
import FieldSelect from '@/components/Field/Select';

export default /*#__PURE__*/ {
  name: 'Field',
  components: {
    // VueSelect,
    FieldText,
    FieldNumber,
    FieldRadio,
    FieldCheckbox,
    FieldSelect,
  },
  inheritAttrs: false,
  props: {
    value: { type: [String, Number, Boolean, Array], default: null },
    type: {
      type: String,
      default: 'text',
      validator(value) {
        return ['text', 'number', 'radio', 'checkbox', 'select', 'select-search'].includes(value);
      },
    },
    // ---- select ----
    // reduce: { type: Function, default: (option) => option.id },
    // getOptionLabel: { type: Function, default: (option) => option.name || option.id },
    // fuseSearch: {
    //   type: Function,
    //   default: (options, search) => {
    //     const fuse = new Fuse(options, {
    //       keys: ['name', 'label'],
    //       shouldSort: true,
    //     });
    //     return search.length ? fuse.search(search).map(({ item }) => item) : fuse.list;
    //   },
    // },
  },
  emits: ['input'],
  computed: {
    mutableValue: {
      get() {
        return this.value;
      },
      set(value) {
        console.log(`mutableValue`, value);
        this.$emit('input', value);
      },
    },
  },
};
</script>
<style lang="scss">
@import '@/assets/scss/utils.scss';
@import '@/assets/scss/components/_field.scss';
</style>
