<template>
  <div class="form-demo">
    <form action="">
      <button>Send</button>
    </form>
    <code>
      {{ columns }}
    </code>
  </div>
</template>

<script>
export default /*#__PURE__*/ {
  name: 'FormDemo',
  props: {
    id: {
      type: String,
      required: true,
    },
    columns: {
      type: Array,
      required: true,
    },
  },
};
</script>

<style scoped lang="scss">
// @import '@/assets/scss/utils.scss';
</style>
