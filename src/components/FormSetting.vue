<template>
  <div class="form-setting">
    <Draggable :value="columns" @input="invokeUpdateColumns">
      <Block v-for="(column, idx) in columns" :key="column.id" radius shadow>
        <Card>
          <!-- Card Header -->
          <template #cardHeader>
            <slot
              name="cardHeader"
              :idx="idx"
              :column="column"
              :isOpen="collect[column.id].isOpen"
              :toggleIsOpen="toggleIsOpen.bind(null, column.id)"
              :isEditName="collect[column.id].isEditName"
              :toggleIsEditName="toggleIsEditName.bind(null, column.id)"
            >
              <div class="drag">
                <Icon icon="mdi:drag" />
                <span>#{{ idx + 1 }}</span>
              </div>
              <div class="card__name">
                <template v-if="collect[column.id].isEditName">
                  <Field :value.sync="column.name" :placeholder="column.id" />
                </template>
                <template v-else>
                  <div class="text-ellipsis">{{ column.name || `(${column.id})` }}</div>
                </template>
                <Button
                  type="flat"
                  shape="circle"
                  color="#fff"
                  :icon="collect[column.id].isEditName ? 'ic:baseline-done-outline' : 'mi:edit-alt'"
                  @click="toggleIsEditName(column.id)"
                />
              </div>
              <div class="card__controll">
                <Button
                  type="flat"
                  shape="circle"
                  color="#fff"
                  :icon="collect[column.id].isOpen ? 'mdi:eye-minus' : 'mdi:eye-settings'"
                  @click="toggleIsOpen(column.id)"
                />
                <Button
                  type="flat"
                  shape="circle"
                  color="#fff"
                  icon="mdi:close-thick"
                  @click="invokeRemove(column.id)"
                />
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
    <Button icon="mdi:plus" block @click="invokeAdd" />
  </div>
</template>

<script>
import { Draggable, Block, Card, Button, Icon, Field } from '@/components/ui';
import ColumnSetting from '@/components/ColumnSetting';

export default /*#__PURE__*/ {
  name: 'FormSetting',
  components: {
    Draggable,
    Block,
    Card,
    Button,
    Icon,
    Field,
    ColumnSetting,
  },
  inject: ['collect', 'toggleCollect'],
  props: {
    columns: { type: Array, required: true },
    invokeUpdateColumns: { type: Function, required: true },
    invokeAdd: { type: Function, required: true },
    invokeUpdate: { type: Function, required: true },
    invokeRemove: { type: Function, required: true },
  },
  methods: {
    toggleIsOpen(columnId) {
      this.toggleCollect(columnId, 'isOpen');
    },
    toggleIsEditName(columnId) {
      this.toggleCollect(columnId, 'isEditName');
    },
  },
};
</script>

<style lang="scss">
@import '@/assets/scss/utils.scss';

.card {
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
