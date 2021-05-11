<template>
  <div class="form-setting">
    <Draggable v-model="mutableColumns">
      <SlideFadeTransitionGroup>
        <Block v-for="(column, idx) in mutableColumns" :key="column.id" radius shadow>
          <Card>
            <!-- Card Header -->
            <template #cardHeader>
              <slot name="cardHeader" :idx="idx" :column="column">
                <div class="drag">
                  <Icon icon="mdi:drag" />
                  <span>#{{ idx + 1 }}</span>
                </div>
                <div class="card__name">
                  <template v-if="collects[column.id].isEditName">
                    <Field
                      :ref="`editName-${column.id}`"
                      v-bind="{ value: column.name, placeholder: column.id, block: true }"
                      @update:value="setColumnById(column.id, ['name'], $event)"
                      @handle:enter="handleEditNameEnter(column.id)"
                    />
                  </template>
                  <template v-else>
                    <div class="text-ellipsis">{{ column.name || `(${column.id})` }}</div>
                  </template>
                  <Button
                    :ref="`toggleEditNameBtn-${column.id}`"
                    v-bind="{
                      icon: collects[column.id].isEditName ? 'ic:baseline-done-outline' : 'mi:edit-alt',
                      ...headerBtnProps,
                    }"
                    @click="toggleIsEditName(column.id)"
                  />
                </div>
                <div class="card__controll">
                  <Button
                    v-bind="{
                      icon: collects[column.id].isOpen ? 'mdi:eye-minus' : 'mdi:eye-settings',
                      ...headerBtnProps,
                    }"
                    @click="toggleIsOpen(column.id)"
                  />
                  <Button
                    v-bind="{ icon: 'mdi:close-thick', ...headerBtnProps }"
                    @click="handleRemoveColumn(column.id)"
                  />
                </div>
              </slot>
            </template>
            <!-- Card Main -->
            <template #cardMain>
              <slot name="cardMain" :column="column">
                <ExpandTransition>
                  <ColumnSetting
                    v-show="collects[column.id].isOpen"
                    v-bind="{ ...column, columns: mutableColumns, columnsByKey }"
                    @update:column="setColumnById(...arguments)"
                  >
                    <template v-for="(_, slot) in $scopedSlots" #[slot]="props">
                      <slot :name="slot" v-bind="props" />
                    </template>
                  </ColumnSetting>
                </ExpandTransition>
              </slot>
            </template>
          </Card>
        </Block>
      </SlideFadeTransitionGroup>
    </Draggable>
    <Button v-bind="{ icon: 'mdi:plus', type: 'dashed', block: true }" @click="addColumn" />
  </div>
</template>

<script>
import ColumnSetting from '@/components/ColumnSetting';
import { Draggable, Block, Card, Button, Icon, Field } from '@/components/ui';
import SlideFadeTransitionGroup from '@/components/ui/transition-group/SlideFade';
import ExpandTransition from '@/components/ui/transition/Expand';
import { getters as collectsGetters, mutations as collectsMutations } from '@/store/collects.js';

export default /*#__PURE__*/ {
  name: 'FormSetting',
  components: {
    ColumnSetting,
    // UI
    Draggable,
    Block,
    Card,
    Button,
    Icon,
    Field,
    // Transition
    SlideFadeTransitionGroup,
    ExpandTransition,
  },
  props: {
    columns: { type: Array, required: true },
    columnsByKey: { type: Object, required: true },
    //-----------
    addColumn: { type: Function, required: true },
    setColumnById: { type: Function, required: true },
    handleRemoveColumn: { type: Function, required: true },
  },
  emits: ['update:columns'],
  computed: {
    collects: collectsGetters.collects,
    mutableColumns: {
      get() {
        return this.columns;
      },
      set(val) {
        this.$emit('update:columns', val);
      },
    },
    headerBtnProps() {
      return { type: 'flat', shape: 'circle', color: '#fff' };
    },
  },
  methods: {
    toggleCollect: collectsMutations.toggleCollect,
    toggleIsOpen(columnId) {
      this.toggleCollect([columnId, 'isOpen']);
    },
    toggleIsEditName(columnId) {
      this.toggleCollect([columnId, 'isEditName']);

      if (this.collects[columnId].isEditName) {
        this.$nextTick(() => {
          this.handleEditNameFocus(columnId);
        });
      }
    },
    handleEditNameFocus(columnId) {
      const refEditName = this.$refs[`editName-${columnId}`][0];
      if (refEditName) {
        const inputEl = refEditName.$refs.el;
        inputEl.focus();
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

fieldset.x-block {
  margin: 0;
  padding: var(--hGap);
  overflow: hidden;
  position: relative;
}

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
