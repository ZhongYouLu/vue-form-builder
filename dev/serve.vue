<template>
  <div id="app">
    <div class="form-builder">
      <RecordControls v-model="formJson" :record-name="'formBuilder-' + formJson.id" :record-limit="5" immediate />
      <h1>Form ID: {{ formJson.id }}</h1>
      <FormMainLogic v-slot="props" :columns.sync="formJson.columns">
        <main class="form-builder__main">
          <FormSetting v-bind="props">
            <!-- <template #cardHeader="test">
              <button @click="test.toggleIsOpen(test.columnId)">{{ test.isOpen ? 'close' : 'open' }}</button>
            </template> -->
            <!-- <template #cardMain="xxx"> {{ xxx }} </template> -->
          </FormSetting>
          <div>
            <FormDemo :columns="props.columns" />
            <FormDemo :columns="props.cleanColumns" />
          </div>
        </main>
      </FormMainLogic>
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
@import '@/assets/scss/utils.scss';
@import '@/assets/scss/base/normalize.scss';
@import '@/assets/scss/base/base.scss';

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
