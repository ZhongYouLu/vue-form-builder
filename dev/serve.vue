<template>
  <div id="app">
    <FormBuilder v-bind="formJson" />
    <!-- <div class="form-builder">
      <h1>Form ID: {{ formJson.id }}</h1>
      <main class="form-builder__main">
        <FormSetting v-bind="formJson" />
        <FormDemo v-bind="formJson" />
      </main>
    </div> -->
  </div>
</template>

<script>
import Vue from 'vue';

// Uncomment import and local "components" registration if library is not registered globally.
// === library ===
// import { FormSetting, FormDemo } from '@/entry/library/entry.esm';
// === single ===
import FormBuilder from '@/entry/single/entry.esm';

export default Vue.extend({
  name: 'ServeDev',
  components: {
    FormBuilder,
    // FormSetting,
    // FormDemo,
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
    updateFormJson(val) {
      this.formJson = val;
      this.forceRerender();
    },
    forceRerender() {
      this.componentKey += 1;
    },
  },
});
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
