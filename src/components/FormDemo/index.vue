<template>
  <div class="form-demo">
    <Form v-bind="{ name, columns, testMode }" @submit="submit" />
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
    testMode: { type: Boolean, default: false },
  },
  methods: {
    // https://developers.google.com/web/fundamentals/design-and-ux/input/forms
    submit(values, cb) {
      console.log(values);

      setTimeout(cb, 1000);
    },
  },
};
</script>

<style scoped lang="scss">
// @import '@/assets/scss/utils.scss';
</style>
