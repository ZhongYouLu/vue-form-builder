<template>
  <div class="form-demo">
    <Form name="demo" :columns="columns" @submit="submit" />
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
    columns: { type: Array, required: true },
  },
  methods: {
    // https://developers.google.com/web/fundamentals/design-and-ux/input/forms
    submit(values) {
      console.log(values);
    },
  },
};
</script>

<style scoped lang="scss">
// @import '@/assets/scss/utils.scss';
</style>
