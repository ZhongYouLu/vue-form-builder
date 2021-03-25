<template>
  <div class="form-builder">
    <RecordControls v-model="localColumns" :record-name="`formBuilder-${id}`" :record-limit="5" immediate />
    <h1>Form ID: {{ id }}</h1>
    <FormMainLogic v-slot="{ finalColumns, ...props }" :columns.sync="localColumns">
      <main class="form-builder__main">
        <FormSetting v-bind="props" />
        <FormDemo :columns="finalColumns" />
      </main>
    </FormMainLogic>
  </div>
</template>

<script>
import FormMainLogic from '@/components/FormMainLogic';
import FormSetting from '@/components/FormSetting';
import FormDemo from '@/components/FormDemo';
import RecordControls from '@/components/RecordControls';

export default /*#__PURE__*/ {
  name: 'FormBuilder',
  components: {
    FormMainLogic,
    FormSetting,
    FormDemo,
    RecordControls,
  },
  props: {
    id: {
      type: String,
      required: true,
    },
    columns: {
      type: Array,
      required: true,
    },
  },
  emits: ['update:columns'],
  computed: {
    localColumns: {
      get() {
        return this.columns;
      },
      set(val) {
        this.$emit('update:columns', val);
      },
    },
  },
};
</script>

<style lang="scss">
@import '@/assets/scss/utils.scss';

.form-builder {
  &__main {
    display: flex;

    & > * {
      padding: $gap;
      width: 50%;
    }
  }
}
</style>
