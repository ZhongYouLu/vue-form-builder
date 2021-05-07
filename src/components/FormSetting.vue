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
                      :value="column.name"
                      :placeholder="column.id"
                      block
                      @update:value="setColumnById(column.id, ['name'], $event)"
                      @handle:enter="handleEditNameEnter(column.id)"
                    />
                  </template>
                  <template v-else>
                    <div class="text-ellipsis">{{ column.name || `(${column.id})` }}</div>
                  </template>
                  <Button
                    :ref="`toggleEditNameBtn-${column.id}`"
                    :icon="collects[column.id].isEditName ? 'ic:baseline-done-outline' : 'mi:edit-alt'"
                    v-bind="headerBtnProps"
                    @click="toggleIsEditName(column.id)"
                  />
                </div>
                <div class="card__controll">
                  <Button
                    :icon="collects[column.id].isOpen ? 'mdi:eye-minus' : 'mdi:eye-settings'"
                    v-bind="headerBtnProps"
                    @click="toggleIsOpen(column.id)"
                  />
                  <Button icon="mdi:close-thick" v-bind="headerBtnProps" @click="handleRemoveColumn(column.id)" />
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
    <Button icon="mdi:plus" type="dashed" block @click="addColumn" />
  </div>
</template>

<script>
import { Draggable, Block, Card, Button, Icon, Field } from '@/components/ui';
import SlideFadeTransitionGroup from '@/components/ui/TransitionGroup/SlideFade';
import ExpandTransition from '@/components/ui/Transition/Expand';
import ColumnSetting from '@/components/ColumnSetting';
import {
  getters as columnsGetters,
  mutations as columnsMutations,
  actions as columnsActions,
} from '@/store/columns.js';
import { getters as collectsGetters, mutations as collectsMutations } from '@/store/collects.js';

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
    SlideFadeTransitionGroup,
    ExpandTransition,
  },
  computed: {
    ...columnsGetters,
    ...collectsGetters,
    headerBtnProps() {
      return {
        type: 'flat',
        shape: 'circle',
        color: '#fff',
      };
    },
  },
  methods: {
    ...columnsMutations,
    ...columnsActions,
    ...collectsMutations,
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
