<template>
  <div class="form-builder">
    <RecordControls
      v-model="mutableColumns"
      :record-name="`formBuilder-${id}`"
      :record-limit="10"
      immediate
      @record:removed="mutableColumns = []"
    />
    <h1>Form ID: {{ id }}</h1>
    <main class="form-builder__main">
      <FormSetting>
        <template v-for="(_, slot) in $scopedSlots" #[slot]="props">
          <slot :name="slot" v-bind="props" />
        </template>
      </FormSetting>
      <div>
        <FormDemo :columns="finalColumns" />
        <hr />
        <JsonView :data="mutableColumns" :deep="0" />
        <hr />
        <JsonView :data="finalColumns" :deep="0" />
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
import { getters as columnsGetters } from '@/store/columns.js';
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
    columns: { type: Array, required: true },
  },
  emits: ['update:columns'],
  computed: {
    mutableColumns: columnsGetters.mutableColumns,
    finalColumns: columnsGetters.finalColumns,
  },
  watch: {
    mutableColumns: {
      handler: function (val) {
        // TODO:
        console.log('update:columns');
        tunnelEmit(this, 'update:columns', val);
      },
      // deep: true,
      // immediate: true,
    },
  },
};
</script>

<style lang="scss">
.form-builder {
  &__main {
    display: flex;

    & > * {
      padding: var(--vGap);
      width: 50%;
    }
  }
}
</style>
