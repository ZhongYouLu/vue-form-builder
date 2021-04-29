<template>
  <div id="app">
    {{ formJson.columns }}
    <FormBuilder :id="formJson.id" :columns.sync="formJson.columns" />
  </div>
</template>

<script>
import Vue from 'vue';

// Uncomment import and local "components" registration if library is not registered globally.
// === single ===
// import FormBuilder from '@/entry/single/entry.esm';
// === library ===
import { FormBuilder } from '@/entry/library/entry.esm';
// import { FormMainLogic, FormSetting, FormDemo, RecordControls } from '@/entry/library/entry.esm';

export default Vue.extend({
  name: 'ServeDev',
  components: {
    FormBuilder,
    // FormMainLogic,
    // FormSetting,
    // FormDemo,
    // RecordControls,
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
    };
  },
  methods: {
    handleConfirm(msg, allowFunc) {
      if (confirm(msg)) allowFunc();
    },
  },
});
</script>

<style lang="scss">
@import '@/assets/scss/base/normalize.scss';
@import '@/assets/scss/utils.scss';
@import '@/assets/scss/base/base.scss';
@import '@/assets/scss/root.scss';
</style>
