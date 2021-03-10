<template>
  <div class="form-setting">
    <Draggable :value="columns" handle=".card__drag" @input="invokeUpdateColumns">
      <Block v-for="(column, idx) in columns" :key="column.id" radius shadow>
        <Card>
          <!-- Card Header -->
          <template #cardHeader>
            <slot name="cardHeader">
              <div class="card__drag">
                <Icon icon="mdi:drag" />
                <span>#{{ idx + 1 }}</span>
              </div>
              <div class="card__name">
                <template v-if="collect[column.id].isEditName">
                  <Field v-model="column.name" :placeholder="column.id" />
                </template>
                <template v-else>
                  <div class="text-ellipsis">{{ column.name || column.id }}</div>
                </template>
                <Icon
                  :icon="collect[column.id].isEditName ? 'ic:baseline-done-outline' : 'mi:edit-alt'"
                  is-btn
                  @click="toggleIsEditName(column.id)"
                />
              </div>
              <div class="card__controll">
                <Icon
                  :icon="collect[column.id].isOpen ? 'mdi:eye-minus' : 'mdi:eye-settings'"
                  is-btn
                  @click="toggleIsOpen(column.id)"
                />
                <Icon icon="mdi:close-thick" is-btn @click="invokeRemove(idx)" />
              </div>
            </slot>
          </template>

          <!-- Card Main -->
          <template #cardMain>
            <slot name="cardMain">
              <ColumnSetting
                v-show="collect[column.id].isOpen"
                :idx="idx"
                :columns="columns"
                v-bind="column"
                @update="invokeUpdate"
              >
                <template v-for="(_, slot) in $scopedSlots" #[slot]="props">
                  <slot :name="slot" v-bind="props" />
                </template>
              </ColumnSetting>
            </slot>
          </template>
        </Card>
      </Block>
    </Draggable>
    <button class="btn btn--add" @click="invokeAdd">&#10010;</button>
  </div>
</template>

<script>
import Draggable from '@/components/ui/Draggable';
import Block from '@/components/ui/Block';
import Icon from '@/components/ui/Icon';
import Card from '@/components/ui/Card';
import Field from '@/components/ui/Field';
import ColumnSetting from '@/components/ColumnSetting';

export default /*#__PURE__*/ {
  name: 'FormSetting',
  components: {
    Draggable,
    Block,
    Card,
    Icon,
    Field,
    ColumnSetting,
  },
  props: {
    columns: { type: Array, required: true },
    invokeUpdateColumns: { type: Function, required: true },
    invokeAdd: { type: Function, required: true },
    invokeUpdate: { type: Function, required: true },
    invokeRemove: { type: Function, required: true },
  },
  data() {
    return {
      collect: {},
    };
  },
  watch: {
    columns(columns) {
      columns.map((column) => {
        if (!this.collect[column.id]) {
          this.collect = {
            ...this.collect,
            [column.id]: {
              isOpen: false,
              isEditName: false,
            },
          };
        }
      });
    },
  },
  methods: {
    toggleIsOpen(columnId) {
      this.collect[columnId].isOpen = !this.collect[columnId].isOpen;
    },
    toggleIsEditName(columnId) {
      this.collect[columnId].isEditName = !this.collect[columnId].isEditName;
    },
  },
};
</script>

<style lang="scss">
@import '@/assets/scss/utils.scss';

.form-setting {
  .btn {
    width: 100%;
    padding: $gap;
    text-align: center;
    color: $btn-text-color;
    background-color: $btn-bg-color;
    border-radius: $border-radius;
    outline: none;
    user-select: none;
    cursor: pointer;

    &:hover {
      background-color: $btn-bg-color-hover;
    }
  }
}

.card {
  &__drag {
    @include content-centered();
    margin-right: $gap * 2;
    cursor: move;

    &:hover {
      background-color: lighten($color-gray-dark, 30);
    }
  }

  &__name {
    @include content-centered();
    min-width: 0; // fix: text-ellipsis

    input {
      color: $color-black;
    }
  }

  &__controll {
    @include content-centered();
    margin-left: auto;
  }
}

.text-ellipsis {
  @include truncate(100%);
}
</style>
