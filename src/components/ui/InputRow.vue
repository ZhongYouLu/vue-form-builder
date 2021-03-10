<template>
  <label :class="['input-row', { required: isRequired }]">
    <div class="for">
      <slot name="label-left"></slot>
      <p>{{ label }}</p>
      <slot name="label-right"></slot>
    </div>
    <Field v-bind="$attrs" @input="$emit('input', $event)">
      <template v-for="(_, slot) in $scopedSlots" #[slot]="props">
        <slot :name="slot" v-bind="props" />
      </template>
    </Field>
  </label>
</template>

<script>
import Field from '@/components/ui/Field';

export default /*#__PURE__*/ {
  name: 'InputRow',
  components: {
    Field,
  },
  inheritAttrs: false,
  props: {
    label: { type: String, default: '' },
    isRequired: { type: Boolean, default: false },
  },
  emits: ['input'],
};
</script>

<style lang="scss">
@import '@/assets/scss/utils.scss';

// 輸入列
.input-row {
  @include content-centered($x: false);
  flex-wrap: wrap;
  width: 100%;

  &:not(:last-child) {
    margin-bottom: $gap;
  }

  &.inline {
    flex-wrap: nowrap;
  }

  &:hover {
    .for {
      // font-weight: bolder;
      color: $color-secondary;
    }

    .input,
    .input-date,
    .vs__dropdown-toggle {
      background-color: darken($color-white, 5);
      // border-width: $border-width * 1.3;
    }
  }

  .for {
    @include content-centered($x: false);
    flex: 0 1 25%;
    white-space: nowrap; /* 強迫不換行 */
  }

  // 加星號
  &.required .for {
    position: relative;

    p {
      display: inline-block;
      vertical-align: middle;
    }

    &::after {
      content: '*';
      position: relative;
      display: inline-block;
      vertical-align: middle;
      font-size: 1em;
      top: 0;
      left: 0;
      color: $color-danger;
    }
  }

  .field {
    flex: 1 0 75%;
    text-align: left;

    .input,
    .input-date {
      transition: border-color 0.1s ease-in;

      &::after {
        transition: border-color 0.1s ease-in;
      }
    }

    // TODO: 待整理
    .warn:not(.select) {
      &,
      &::after {
        color: $color-danger;
      }

      & + .tips {
        $width: 1.2rem;
        position: relative;
        padding-left: 1.4rem;
        color: $color-danger;

        &::before {
          content: '';
          position: absolute;
          display: block;
          top: 0;
          left: 0;
          width: $width;
          height: 100%;
        }
      }
    }
  }
}
</style>
