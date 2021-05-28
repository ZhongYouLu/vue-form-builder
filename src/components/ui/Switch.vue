/* eslint-disable vue/no-mutating-props */
<template>
  <div class="x-switch" :disabled="disabled" :checked="checked">
    <label>
      <input v-model="checked" type="checkbox" :disabled="disabled" @keydown="handleKeydown" />
    </label>
  </div>
</template>

<script>
export default /*#__PURE__*/ {
  name: 'ZylSwitch',
  props: {
    value: { type: Boolean, default: false },
    disabled: { type: Boolean, default: null },
  },
  computed: {
    checked: {
      get() {
        return this.value;
      },
      set(value) {
        this.$emit('input', value);
      },
    },
  },
  methods: {
    handleKeydown(evt) {
      switch (evt.keyCode) {
        case 13: //Enter
          this.checked = !this.checked;
          break;
        default:
          break;
      }
    },
  },
};
</script>

<style lang="scss">
@import '@/assets/scss/utils.scss';

.x-switch {
  box-sizing: content-box;
  display: inline-block;
  -webkit-tap-highlight-color: transparent; /* for removing the highlight */

  &[disabled] {
    pointer-events: none;
    opacity: 0.6;

    label {
      pointer-events: all;
      cursor: not-allowed;
    }
  }

  &:focus-within,
  &:active {
    input {
      z-index: 2;
    }
    label::after {
      background: var(--themeColor);
    }
  }

  input {
    // hiding, but keeps content visible to screenreaders.
    position: absolute;
    clip: rect(0, 0, 0, 0);
  }

  $h: $font-size;
  label {
    cursor: pointer;
    display: flex;
    width: $h * 2;
    height: $h;
    padding: $h / 10;
    border-radius: $h;
    background: #eee;
    transition: background-color 0.3s;

    &::before {
      content: '';
      flex: 0;
      transition: flex 0.2s cubic-bezier(0.12, 0.4, 0.29, 1.46);
    }

    &::after {
      $len: $h / 3;
      content: '';
      width: $len;
      height: $len;
      border: $len solid #fff;
      border-radius: $len * 1.5;
      background: #fff;
      box-shadow: 0 2px 4px 0 rgba(0, 35, 11, 0.2);
      transition: padding 0.3s, background 0.3s;
    }

    &:active::after {
      padding: 0 $h / 4;
    }
  }

  &[checked] label {
    background: var(--themeColor);

    &::before {
      flex: 1;
    }
  }
}
</style>
