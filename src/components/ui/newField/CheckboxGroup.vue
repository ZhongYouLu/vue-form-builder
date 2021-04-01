<template>
  <div ref="group" class="checkbox-group">
    {{ mutableValue }}
    <Tips id="tip" :tabindex="disabled ? -1 : null" type="error">
      <slot></slot>
    </Tips>
  </div>
</template>

<script>
import Tips from '@/components/ui/Tips';

export default /*#__PURE__*/ {
  name: 'CheckboxGroup',
  components: {
    Tips,
  },
  props: {
    // form: { type: Object, default: null },
    // ----------------------------------
    name: { type: String, default: null },
    value: { type: Array, default: null },
    defaultValue: { type: Array, default: null },
    required: { type: Boolean, default: null },
    disabled: { type: Boolean, default: null },
    min: { type: Number, default: null },
    max: { type: Number, default: null },
    //----------------
    novalidate: { type: Boolean, default: null },
    errortips: { type: String, default: null },
  },
  computed: {
    localMin() {
      const min = this.min || 0;
      return this.required ? Math.max(1, min) : min;
    },
    localMax() {
      return this.max || Infinity;
    },
    mutableValue: {
      get() {
        const arr = this.$refs.group?.querySelectorAll('.checkbox[checked]') || [];
        return arr.map((el) => el.value);
      },
    },
  },
};
</script>

<style lang="scss">
@import '@/assets/scss/utils.scss';

.checkbox-group {
  display: inline-block;

  &:focus-within,
  &:hover {
    .tips {
      z-index: 2;
    }
  }

  &[disabled] {
    pointer-events: none;

    .tips {
      pointer-events: all;
      cursor: not-allowed;
      outline: 0;
    }

    .checkbox {
      pointer-events: none;
      opacity: 0.6;
    }
  }

  .checkbox {
    transition: opacity 0.3s;
  }
}

.tips[show='show'] {
  --themeColor: var(--errorColor);
  --borderColor: var(--errorColor);
}
</style>
