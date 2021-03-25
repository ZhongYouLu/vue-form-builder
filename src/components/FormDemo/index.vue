<template>
  <div class="form-demo">
    answer: {{ answer }}
    <hr class="dashed" />
    <form action="">
      <div v-for="({ id, ...column }, idx) in columns" :key="id">
        <Row
          v-if="answer[id] !== undefined"
          :id="id"
          v-model="answer[id]"
          :idx="idx + 1"
          :type="column.type"
          v-bind="{ ...column.base, ...column.item }"
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
};
</script>

<style scoped lang="scss">
// @import '@/assets/scss/utils.scss';
</style>
