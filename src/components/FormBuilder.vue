<template>
  <div class="form-builder">
    <RecordControls
      v-model="mutableColumns"
      :record-name="`formBuilder-${id}`"
      :record-limit="5"
      immediate
      @record:removed="mutableColumns = []"
    />
    <h1>Form ID: {{ id }}</h1>
    <main class="form-builder__main">
      <FormSetting
        :columns.sync="mutableColumns"
        v-bind="{
          columnsByKey: columnsByKey,
          addColumn: addColumn,
          setColumnById: setColumnById,
          handleRemoveColumn: handleRemoveColumn,
        }"
      >
        <template v-for="(_, slot) in $scopedSlots" #[slot]="props">
          <slot :name="slot" v-bind="props" />
        </template>
      </FormSetting>
      <FormDemo :columns="finalColumns" />
      <div>
        sync: {{ JSON.stringify(columns) === JSON.stringify(mutableColumns) }}
        <hr />
        <JsonView :data="mutableColumns" :deep="5" />
        <hr />
        <JsonView :data="finalColumns" :deep="5" />
      </div>
    </main>
  </div>
</template>

<script>
import FormSetting from '@/components/FormSetting';
import FormDemo from '@/components/FormDemo';
import RecordControls from '@/components/RecordControls';
import JsonView from 'vue-json-views';
import { tunnelEmit } from '@/store/helper';
import {
  getters as columnsGetters,
  mutations as columnsMutations,
  actions as columnsActions,
} from '@/store/columns.js';

export default /*#__PURE__*/ {
  name: 'FormBuilder',
  components: {
    FormSetting,
    FormDemo,
    RecordControls,
    JsonView,
  },
  props: {
    id: { type: String, required: true },
    columns: { type: Array, default: () => [] },
  },
  emits: ['update:columns'],
  computed: {
    ...columnsGetters,
  },
  watch: {
    mutableColumns(val) {
      tunnelEmit(this, 'update:columns', val);
    },
  },
  methods: {
    ...columnsMutations,
    ...columnsActions,
  },
};
</script>

<style lang="scss">
.form-builder {
  &__main {
    display: flex;

    & > * {
      padding: var(--vGap);
      width: 33%;
    }
  }
}
</style>
