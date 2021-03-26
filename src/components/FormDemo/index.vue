<template>
  <div class="form-demo">
    answer: {{ answer }}
    <hr class="dashed" />
    <form name="demo" @submit.prevent="checkForm">
      <div v-for="({ id, ...column }, idx) in columns" :key="id">
        <Row
          v-if="answer[id] !== undefined"
          :id="id"
          v-model="answer[id]"
          :idx="idx + 1"
          :type="column.type"
          v-bind="{
            ...column.base,
            ...column.rule,
            ...column.item,
            ...column.condition,
          }"
        />
      </div>
      <button>Send</button>
    </form>
  </div>
</template>

<script>
import Row from '@/components/FormDemo/Row';

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
      answer: {},
    };
  },
  watch: {
    columns: {
      handler: function (columns) {
        this.answer = columns.reduce((acc, column) => {
          this.$set(acc, column.id, column.base?.defaultValue || null);
          return acc;
        }, {});
      },
      immediate: true,
    },
  },
  methods: {
    checkForm($event) {
      const form = $event.target;
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
