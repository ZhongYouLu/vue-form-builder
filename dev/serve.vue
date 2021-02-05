<script>
import Vue from 'vue';
import FormBuilder from '@/form-builder.vue';

export default Vue.extend({
  name: 'ServeDev',
  components: {
    FormBuilder,
  },
});
</script>

<template>
  <div id="app">
    <form-builder />
  </div>
</template>
