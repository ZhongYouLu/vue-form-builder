<template>
  <div class="form-builder">
    <h1>Form ID: {{ id }}</h1>
    <main class="form-builder__main">
      <FormSetting :id="id" :columns="columns" :update-colums="updateColums" />
      <FormDemo :id="id" :columns="columns" />
    </main>
  </div>
</template>

<script>
import FormSetting from '@/components/FormSetting';
import FormDemo from '@/components/FormDemo';

export default /*#__PURE__*/ {
  name: 'FormBuilder', // vue component name
  components: {
    FormSetting,
    FormDemo,
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
    updateColums: {
      type: Function,
      required: true,
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
      flex: 1;
      padding: $gap;
    }
  }
}
</style>
