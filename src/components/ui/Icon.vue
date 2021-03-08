<template>
  <span ref="el" class="icon" :class="{ 'icon--btn': isBtn }" @click="$emit('click')" />
</template>

<script>
import Iconify from '@purge-icons/generated';

export default /*#__PURE__*/ {
  name: 'Icon',
  props: {
    icon: {
      type: String,
      required: true,
    },
    isBtn: {
      type: Boolean,
      default: false,
    },
  },
  watch: {
    icon: 'updateIcon',
  },
  mounted() {
    this.updateIcon(this.icon);
  },
  methods: {
    async updateIcon(icon) {
      await this.$nextTick();
      this.$refs.el.textContent = '';
      const temp = Iconify.default ? Iconify.default : Iconify;
      const svg = icon ? temp.renderSVG(icon, {}) : null;
      if (svg) {
        this.$refs.el.appendChild(svg);
      } else {
        const span = document.createElement('span');
        span.className = 'iconify';
        if (icon) {
          span.dataset.icon = icon;
        }
        this.$refs.el.appendChild(span);
      }
    },
  },
};
</script>
<style lang="scss">
@import '@/assets/scss/utils.scss';

.icon {
  display: flex;
  width: 1em;
  height: 1em;

  .iconify {
    width: 100%;
    height: 100%;
  }

  &--btn {
    @include content-centered();
    width: 1.1em;
    height: 1.1em;
    text-align: center;
    border-radius: 50%;
    outline: none;
    user-select: none;
    cursor: pointer;

    &:hover {
      background-color: lighten($color-gray-dark, 30);
    }

    * ~ & {
      margin-left: $gap;
    }

    .iconify {
      width: 90%;
      height: 90%;
    }
  }
}
</style>
