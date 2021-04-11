/* eslint-disable vue/no-mutating-props */
<template>
  <div ref="item" class="x-form-item">
    <label :class="{ required: required }">{{ legend }}</label>
    <slot />
  </div>
</template>

<script>
export default /*#__PURE__*/ {
  name: 'FormItem',

  props: {
    legend: { type: String, default: null },
  },
  data() {
    return {
      slotDefault: null,
      localForm: null,
      refInput: null,
      required: null,
    };
  },
  computed: {},
  watch: {
    slotDefault: function (slot) {
      console.log(slot.child);
      if (slot.child) {
        this.refInput = slot.child;

        this.required = this.refInput.required;
        console.log('wathch refInput', this.refInput.checkValidity());
      }
    },
  },
  created() {
    this.resetSlot();
  },
  beforeUpdate() {
    this.resetSlot();
  },
  methods: {
    checkForSlotContent() {
      let checkForContent = (hasContent, node) => {
        return hasContent || node.tag || (node.text && node.text.trim());
      };

      return this.$slots.default && this.$slots.default.reduce(checkForContent, false);
    },
    resetSlot() {
      if (this.checkForSlotContent()) {
        if (this.slotDefault !== this.$slots.default[0]) {
          this.slotDefault = this.$slots.default[0];
        }
      }
    },
  },
};
</script>

<style lang="scss">
@import '@/assets/scss/utils.scss';

.x-form-item {
  display: contents;
  justify-self: stretch;

  label {
    color: var(--fontColor, #333);

    &.required:not(:empty)::before {
      content: '*';
      color: var(--errorColor, #f4615c);
    }
  }
}
</style>
