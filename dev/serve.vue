<template>
  <div id="app">
    <div class="form-builder">
      <RecordControls
        v-model="formJson"
        :record-name="'formBuilder-' + formJson.id"
        :record-limit="5"
        :callback="forceRerender"
      />
      <h1>Form ID: {{ formJson.id }}</h1>
      <main class="form-builder__main">
        <FormMainLogic :key="componentKey" v-slot="props" :columns.sync="formJson.columns">
          <!-- columns: {{ props.columns }}
          <br /> -->
          <!-- cleanColumns: {{ props.cleanColumns }}
          <hr /> -->
          <FormSetting v-bind="props" />
        </FormMainLogic>
        <FormDemo v-bind="formJson" />
      </main>
    </div>
  </div>
</template>

<script>
import Vue from 'vue';

// Uncomment import and local "components" registration if library is not registered globally.
// === single ===
// import FormBuilder from '@/entry/single/entry.esm';
// === library ===
import { FormMainLogic, FormSetting, FormDemo, RecordControls } from '@/entry/library/entry.esm';

export default Vue.extend({
  name: 'ServeDev',
  components: {
    FormMainLogic,
    FormSetting,
    FormDemo,
    RecordControls,
  },
  provide() {
    return {
      handleConfirm: this.handleConfirm,
    };
  },
  data() {
    return {
      formJson: {
        id: 'demo',
        columns: [],
      },
      componentKey: 0,
    };
  },
  methods: {
    forceRerender(val) {
      console.log('forceRerender', val);
      this.componentKey += 1;
    },
    handleConfirm(msg, allowFunc) {
      if (confirm(msg)) allowFunc();
    },
  },
});
</script>
<style lang="scss">
@import '@/assets/scss/utils.scss';
@import '@/assets/scss/base/normalize.scss';
@import '@/assets/scss/base/base.scss';

.form-builder {
  &__main {
    display: flex;

    & > * {
      width: 50%;
      padding: $gap;
    }
  }
}
</style>
