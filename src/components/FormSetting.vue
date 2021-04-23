<template>
  <div class="form-setting">
    <Draggable :value="columns" @input="invokeUpdateColumns">
      <Block v-for="({ id, name, ...column }, idx) in columns" :key="id" radius shadow>
        <Card>
          <!-- Card Header -->
          <template #cardHeader>
            <slot
              name="cardHeader"
              :idx="idx"
              :column="column"
              :isOpen="collect[id].isOpen"
              :toggleIsOpen="toggleIsOpen.bind(null, id)"
              :isEditName="collect[id].isEditName"
              :toggleIsEditName="toggleIsEditName.bind(null, id)"
            >
              <div class="drag">
                <Icon icon="mdi:drag" />
                <span>#{{ idx + 1 }}</span>
              </div>
              <div class="card__name">
                <template v-if="collect[id].isEditName">
                  <Field
                    :ref="`editName-${id}`"
                    :value="name"
                    :placeholder="id"
                    @update:value="updateColumn(id, { name: $event })"
                    @handle:enter="handleEditNameEnter(id)"
                  />
                </template>
                <template v-else>
                  <div class="text-ellipsis">{{ name || `(${id})` }}</div>
                </template>
                <Button
                  :ref="`toggleEditNameBtn-${id}`"
                  type="flat"
                  shape="circle"
                  color="#fff"
                  :icon="collect[id].isEditName ? 'ic:baseline-done-outline' : 'mi:edit-alt'"
                  @click="toggleIsEditName(id)"
                />
              </div>
              <div class="card__controll">
                <Button
                  type="flat"
                  shape="circle"
                  color="#fff"
                  :icon="collect[id].isOpen ? 'mdi:eye-minus' : 'mdi:eye-settings'"
                  @click="toggleIsOpen(id)"
                />
                <Button type="flat" shape="circle" color="#fff" icon="mdi:close-thick" @click="invokeRemove(id)" />
              </div>
            </slot>
          </template>
          <!-- Card Main -->
          <template #cardMain>
            <slot name="cardMain">
              <ColumnSetting
                v-show="collect[id].isOpen"
                :id="id"
                :name="name"
                v-bind="column"
                :idx="idx"
                :columns="columns"
                @update:column="updateColumn(id, $event)"
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
    <Button icon="mdi:plus" type="dashed" block @click="invokeAdd" />
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
    updateColumn(id, updateProps) {
      this.invokeUpdate(id, updateProps);
    },
    toggleIsOpen(columnId) {
      this.toggleCollect(columnId, 'isOpen');
    },
    toggleIsEditName(columnId) {
      this.toggleCollect(columnId, 'isEditName');

      if (this.collect[columnId].isEditName) {
        this.$nextTick(() => {
          const refEditName = this.$refs[`editName-${columnId}`][0];
          if (refEditName) {
            const inputEl = refEditName.$refs.input;
            inputEl.focus();
          }
        });
      }
    },
    handleEditNameEnter(columnId) {
      const refToggleEditNameBtn = this.$refs[`toggleEditNameBtn-${columnId}`][0];
      if (refToggleEditNameBtn) {
        const btnEl = refToggleEditNameBtn.$refs.btn;
        btnEl.focus();
        btnEl.click();
      }
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
