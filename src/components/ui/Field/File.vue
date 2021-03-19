<template>
  <div class="input">
    <input v-bind="$attrs" type="file" :multiple="multiple" @change="previewFiles" />
  </div>
</template>

<script>
export default /*#__PURE__*/ {
  name: 'FieldFile',
  inheritAttrs: false,
  props: {
    value: { type: [Object, FileList], default: null },
    multiple: { type: Boolean, default: null },
  },
  emits: ['input'],
  computed: {
    mutableValue: {
      get() {
        return this.value;
      },
      set(value) {
        this.$emit('input', value);
      },
    },
  },
  methods: {
    previewFiles(event) {
      console.log(event.target.files);
      this.mutableValue = event.target.files;
    },
  },
};
</script>
