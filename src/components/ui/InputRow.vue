<template>
  <component :is="$props.multiple ? 'div' : 'label'" :class="['input-row', { required: required }]">
    <div class="for">
      <slot name="text-left"></slot>
      <p>{{ text }}</p>
      <slot name="text-right"></slot>
    </div>
    <Field v-bind="$attrs" :multiple="multiple" :required="required" @input="$emit('input', $event)">
      <template v-for="(_, slot) in $scopedSlots" #[slot]="props">
        <slot :name="slot" v-bind="props" />
      </template>
    </Field>
  </component>
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
    text: { type: String, default: '' },
    required: { type: Boolean, default: false },
    multiple: { type: Boolean, default: false },
  },
  emits: ['input'],
};
</script>

<style lang="scss">
@import '@/assets/scss/utils.scss';

// 輸入列
.input-row {
  @include content-centered($x: false);
  // flex-wrap: wrap;
  width: 100%;

  &:not(:last-child) {
    margin-bottom: $gap;
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
    flex: 0 1 30%;
    max-width: 15rem;
    @include content-centered($x: false);
    padding-right: $gap;
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
    flex-grow: 1;
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
