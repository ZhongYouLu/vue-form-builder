<template>
  <div class="form-demo">
    <form name="demo" @submit="submit">
      <div v-for="({ id, ...column }, idx) in columns" :key="id">
        <Row
          v-if="values[id] !== undefined"
          :id="id"
          :name="column.name"
          :idx="idx + 1"
          :type="column.type"
          v-bind="{
            ...column.base,
            ...column.rule,
            ...column.item,
            ...column.condition,
          }"
          :columns="columns"
          :columns-obj-by-key="columnsObjByKey"
          :values="values"
          :value.sync="values[id]"
          :error.sync="errors[id]"
        />
      </div>
      <button>Send</button>
    </form>
    <hr class="dashed" />
    <div>values: {{ values }}</div>
    <div>errors: {{ errors }}</div>
  </div>
</template>

<script>
import Row from '@/components/FormDemo/Row';
import { arr2ObjByKey } from '@/assets/js/helper.js';

export default /*#__PURE__*/ {
  name: 'FormDemo',
  components: {
    Row,
  },
  props: {
    // id: {
    //   type: String,
    //   required: true,
    // },
    columns: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      values: {},
      errors: {},
    };
  },
  computed: {
    columnsObjByKey() {
      return arr2ObjByKey(this.columns, 'id');
    },
  },
  watch: {
    columns: {
      handler: function (columns) {
        columns.map((column) => {
          this.$set(this.values, column.id, column.base?.defaultValue || null);
          this.$set(this.errors, column.id, null);
        });
      },
      immediate: true,
    },
  },
  methods: {
    // https://developers.google.com/web/fundamentals/design-and-ux/input/forms
    submit(evt) {
      evt.preventDefault();
      const form = evt.target;
      // form.checkValidity()
      if (form.reportValidity() === false) {
        alert('Form is invalid - submission prevented!');
        return false;
      }

      this.serialized(form);
    },
    serialized(form) {
      const serialized = [];

      for (var i = 0, field; (field = form.elements[i]); i++) {
        // Don't serialize fields without a name, submits, buttons, file and reset inputs, and disabled fields
        if (
          !field.name ||
          field.disabled ||
          field.type === 'file' ||
          field.type === 'reset' ||
          field.type === 'submit' ||
          field.type === 'button'
        )
          continue;

        // If a multi-select, get all selections
        if (field.type === 'select-multiple') {
          for (var n = 0; n < field.options.length; n++) {
            if (!field.options[n].selected) continue;
            serialized.push(encodeURIComponent(field.name) + '=' + encodeURIComponent(field.options[n].value));
          }
        }
        // Convert field data to a query string
        else if ((field.type !== 'checkbox' && field.type !== 'radio') || field.checked) {
          serialized.push(encodeURIComponent(field.name) + '=' + encodeURIComponent(field.value));
        }
      }

      console.log('serialized:', serialized.join('&'));
    },
  },
};
</script>

<style scoped lang="scss">
// @import '@/assets/scss/utils.scss';
</style>
