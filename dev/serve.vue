<script>
import Vue from 'vue';
import FormBuilder from '@/form-builder.vue';
import '@purge-icons/generated';

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
