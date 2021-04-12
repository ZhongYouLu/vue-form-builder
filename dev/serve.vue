<template>
  <div id="app">
    <!-- <FormBuilder :id="formJson.id" :columns.sync="formJson.columns" /> -->
    <div class="form-builder">
      <RecordControls
        v-model="formJson.columns"
        :record-name="`formBuilder-${formJson.id}`"
        :record-limit="5"
        immediate
      />
      <h1>Form ID: {{ formJson.id }}</h1>
      <FormMainLogic v-slot="{ finalColumns, ...props }" :columns.sync="formJson.columns">
        <main class="form-builder__main">
          <FormSetting v-bind="props">
            <!-- <template #cardHeader="test">
              <button @click="test.toggleIsOpen">
                {{ test.isOpen ? 'close' : 'open' }}
              </button>
              <div class="card__name">
                <Field v-model="test.column.name" :placeholder="test.column.id" />
                <Field v-if="test.column.rule && test.column.rule.msg" v-model="test.column.rule.msg.required" />
              </div>
              <button @click="props.invokeRemove(test.column.id)">X</button>
            </template> -->
            <!-- <template #option="option"> {{ option }} [test] </template> -->
          </FormSetting>
          <div>
            <FormDemo :columns="props.columns" />
            <hr />
            <code>
              {{ props.columns }}
            </code>
            <!-- <FormDemo :columns="finalColumns" /> -->
          </div>
        </main>
      </FormMainLogic>
    </div>
  </div>
</template>
0
<script>
import Vue from 'vue';

// Uncomment import and local "components" registration if library is not registered globally.
// === single ===
// import FormBuilder from '@/entry/single/entry.esm';
// === library ===
// import { FormBuilder } from '@/entry/library/entry.esm';
import { FormMainLogic, FormSetting, FormDemo, RecordControls } from '@/entry/library/entry.esm';
// import Field from '@/components/ui/Field';

export default Vue.extend({
  name: 'ServeDev',
  components: {
    // FormBuilder,
    FormMainLogic,
    FormSetting,
    FormDemo,
    RecordControls,
    // Field,
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
