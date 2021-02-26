<template>
  <div class="form-setting">
    <Draggable v-model="mutableColumns" animation="300" ghost-class="ghost" handle=".card__drag">
      <ColumnSetting
        v-for="(column, idx) in columns"
        :key="column.id"
        :idx="idx"
        v-bind="column"
        :columns="columns"
        @update="invokeUpdate"
        @remove="invokeRemove"
      >
        <template v-for="(_, slot) in $scopedSlots" #[slot]="props">
          <slot :name="slot" v-bind="props" />
        </template>
      </ColumnSetting>
    </Draggable>
    <button class="btn btn--add" @click="invokeAdd">&#10010;</button>
  </div>
</template>

<script>
import Draggable from 'vuedraggable';
import ColumnSetting from '@/components/ColumnSetting.vue';

export default /*#__PURE__*/ {
  name: 'FormSetting',
  components: {
    Draggable,
    ColumnSetting,
  },
  props: {
    columns: { type: Array, required: true },
    invokeUpdateColumns: { type: Function, required: true },
    invokeAdd: { type: Function, required: true },
    invokeUpdate: { type: Function, required: true },
    invokeRemove: { type: Function, required: true },
  },
  computed: {
    mutableColumns: {
      get() {
        return this.columns;
      },
      set(value) {
        this.invokeUpdateColumns(value);
      },
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
    border: $border-width solid $border-color;
    border-radius: $border-radius;
    outline: none;
    user-select: none;
    cursor: pointer;

    &:hover {
      background-color: $btn-bg-color-hover;
    }
  }
}
</style>
