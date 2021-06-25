<template>
  <div class="form-demo">
    <Form
      v-bind="{
        name,
        columns,
        answer,
        testMode,
        answerMode: !!answer || answerMode,
      }"
      @submit="submit"
    />
  </div>
</template>

<script>
import Form from '@/components/ui/form/Form';

export default /*#__PURE__*/ {
  name: 'FormDemo',
  components: {
    Form,
  },
  props: {
    // id: { type: String, required: true },
    name: { type: String, default: 'demo' },
    columns: { type: Array, required: true },
    answer: { type: Object, default: null },
    // -----------------------------------
    testMode: { type: Boolean, default: false },
    answerMode: { type: Boolean, default: false },
  },
  emits: ['submit'],
  methods: {
    // https://developers.google.com/web/fundamentals/design-and-ux/input/forms
    submit(answer, cb) {
      console.log(answer);
      this.$emit('submit', answer);
      setTimeout(cb, 1000);
    },
  },
};
</script>

<style scoped lang="scss">
// @import '@/assets/scss/utils.scss';
</style>
