<template>
  <div class="condition-display">
    <div v-if="!root" class="drag">
      <Icon icon="mdi:drag" />
      <span>{{ logicText }}</span>
    </div>
    <component :is="root ? 'div' : 'li'" :class="leaf ? 'is-leaf' : 'is-folder'">
      <Block v-if="!root">
        <div class="trigger-controll">
          <Field
            v-if="hasList"
            class="trigger-controll__logic"
            :value="logic"
            type="select"
            placeholder="邏輯"
            :options="logicOptions"
            :searchable="false"
            @update:value="$emit('update:logic', $event)"
          />
          <Field
            class="trigger-controll__id"
            :value="triggerId"
            type="select"
            placeholder="監聽欄位"
            :options="columnsExcludeSelf"
            :icons="typeIcons"
            text-key="name"
            icon-key="type"
            clearable
            @update:value="$emit('update:trigger-id', $event)"
          />
          <Field
            v-if="triggerId"
            class="trigger-controll__state"
            :value="state"
            type="select"
            :searchable="false"
            :options="stateOptions"
            @update:value="$emit('update:state', $event)"
          />
          <Button :icon="leaf ? 'mdi:toggle-switch-off' : 'mdi:toggle-switch'" type="flat" @click="toggleGroups" />
          <Button icon="mdi:close-thick" type="flat" shape="circle" @click="$emit('remove', id)" />
        </div>
        <div v-if="triggerColumn" class="trigger-setting">
          <template v-if="allowInputValues">
            <Field
              v-if="typeConstraint.needOptions"
              :value="value"
              required
              placeholder="請選擇條件 (可多選)"
              type="select"
              multiple
              :options="triggerColumn.item.options"
              :fuse-keys="['text']"
              @update:value="$emit('update:value', $event)"
            />
            <Field
              v-else-if="typeConstraint.isNumber"
              :value="value"
              type="select"
              required
              multiple
              taggable
              placeholder="請輸入條件，按下 Enter 確認。 (可輸入多筆)"
              no-drop
              :close-on-select="false"
              :reduce="(option) => option"
              :create-option="(option) => ({ id: Number(option), text: thousandSeparatorFunc(option) })"
              @update:value="$emit('update:value', $event)"
            />
            <Field
              v-else
              :value="value"
              type="select"
              required
              multiple
              taggable
              placeholder="請輸入條件，按下 Enter 確認。 (可輸入多筆)"
              no-drop
              :close-on-select="false"
              :reduce="(option) => option"
              :get-option-label="(option) => option"
              :create-option="(option) => option"
              @update:value="$emit('update:value', $event)"
            />
          </template>
          <template v-else-if="allowInputValue">
            <Field v-if="typeConstraint.isText" :value="value" required @update:value="$emit('update:value', $event)" />
            <Field
              v-else-if="typeConstraint.isNumber"
              :value="value"
              required
              type="number"
              @update:value="$emit('update:value', $event)"
            />
          </template>
        </div>
      </Block>
      <Draggable v-model="mutableList" tag="ul" :group="{ name: 'g1' }" :class="root ? 'folders' : 'sub-folders'">
        <ColumnSettingConditionDisplay
          v-for="child in mutableList"
          v-bind="$attrs"
          :id="child.id"
          :key="child.id"
          :logic.sync="child.logic"
          :state.sync="child.state"
          :trigger-id.sync="child.triggerId"
          :value.sync="child.value"
          :list.sync="child.list"
          :level="level + 1"
          :root-logic="root ? rootLogic : logic"
          :columns-by-key="columnsByKey"
          :columns-exclude-self="columnsExcludeSelf"
          @remove="removeItem"
        >
          <template v-for="(_, slot) in $scopedSlots" #[slot]="props">
            <slot :name="slot" v-bind="props" />
          </template>
        </ColumnSettingConditionDisplay>
      </Draggable>
      <Button v-if="root || list" icon="mdi:plus" block type="dashed" @click="addItem" />
    </component>
  </div>
</template>

<script>
import Block from '@/components/ui/Block';
import Draggable from '@/components/ui/Draggable/CustomDraggable';
import Field from '@/components/ui/form/Field';
import Icon from '@/components/ui/Icon';
import Button from '@/components/ui/Button';
import { nanoid, arrRemoveValueByKey, thousandSeparator } from '@/assets/js/helper.js';
import { getTypeConstraint, typeIcons } from '@/assets/js/options.js';

export default /*#__PURE__*/ {
  name: 'ColumnSettingConditionDisplay',
  components: {
    // ConditionDisplay: () => import('@/components/ColumnSetting/ConditionDisplay'),
    Block,
    Draggable,
    Field,
    Icon,
    Button,
  },
  inject: ['handleConfirm'],
  props: {
    columnsExcludeSelf: { type: Array, required: true },
    columnsByKey: { type: Object, required: true },
    //-----------
    id: { type: String, default: null },
    triggerId: { type: String, default: null },
    state: { type: String, default: null },
    value: { type: [String, Number, Array], default: null },
    logic: { validator: (value) => ['and', 'or'].includes(value), default: 'and' },
    list: { type: Array, default: null },
    // ------------------------
    level: { type: Number, default: 0 },
    rootLogic: { validator: (value) => ['and', 'or'].includes(value), default: 'and' },
  },
  $emits: ['update:list', 'remove'],
  data() {
    return {
      expanded: false,
    };
  },
  computed: {
    root() {
      return this.level === 0;
    },
    mutableList: {
      get() {
        return this.list || [];
      },
      set(val) {
        this.$emit('update:list', val);
      },
    },
    leaf() {
      return !this.list;
    },
    hasList() {
      return !this.leaf && !!this.list.length;
    },
    triggerColumn() {
      return this.triggerId ? this.columnsByKey[this.triggerId] : null;
    },
    typeConstraint() {
      if (!this.triggerColumn) return null;

      const trigger = this.triggerColumn;
      return getTypeConstraint(trigger.type, trigger.subType, trigger.base?.multiple);
    },
    typeIcons() {
      return typeIcons;
    },
    logicOptions() {
      let options = [
        { id: 'and', text: 'And' },
        { id: 'or', text: 'Or' },
      ];
      return options;
    },
    logicText() {
      return this.logicOptions.find((logic) => logic.id === this.rootLogic).text || '??';
    },
    stateBaseOptions() {
      return [
        { id: null, text: '有效的' }, // valid
        { id: '0', text: '空值' }, // is empty
        { id: '1', text: '不為空' }, // is not empty]
      ];
    },
    stateValuesOptions() {
      return [
        { id: 'mo', text: '符合其一' }, // meet one
        { id: 'ma', text: '符合全部' }, // meet all
      ];
    },
    stateTextOptions() {
      return [
        { id: 'is', text: 'Is' }, // Is
        { id: 'nis', text: 'Is not' }, // Is not
        { id: 'ct', text: 'Containss' }, // Containss
        { id: 'nct', text: 'Does not contain' }, // Does not contain
        { id: 'sw', text: 'Starts with' }, // Starts with
        { id: 'ew', text: 'Ends with' }, // Ends with
      ];
    },
    stateNumberOptions() {
      return [
        { id: 'eq', text: '=' }, // equal
        { id: 'neq', text: '!=' }, // not equal
        { id: 'gt', text: '>' }, // greater then
        { id: 'lt', text: '<' }, // less then
        { id: 'ge', text: '>=' }, // greater then or equal
        { id: 'le', text: '<=' }, // less then or equal
      ];
    },
    stateOptions() {
      let options = [...this.stateBaseOptions, ...this.stateValuesOptions];

      if (this.typeConstraint) {
        if (this.typeConstraint.isText) options = [...options, ...this.stateTextOptions];
        if (this.typeConstraint.isNumber) options = [...options, ...this.stateNumberOptions];
      }

      return options;
    },
    allowInputValues() {
      return this.stateValuesOptions.map((option) => option.id).includes(this.state);
    },
    allowInputValue() {
      return !this.stateBaseOptions.map((option) => option.id).includes(this.state) && !this.allowInputValues;
    },
    thousandSeparatorFunc() {
      return (option) => {
        console.log(option);
        return thousandSeparator(option);
      };
    },
  },
  watch: {
    allowInputValues: function (flag) {
      if (flag) this.$emit('update:value', []);
    },
    allowInputValue: function (flag) {
      if (flag) this.$emit('update:value', null);
    },
    stateOptions: function (options) {
      if (!options.map((o) => o.id).includes(this.state)) {
        this.$emit('update:state', null);
      }
    },
  },
  methods: {
    expand() {
      if (this.leaf) {
        return;
      }

      this.expanded = !this.expanded;
    },
    toggleGroups: function () {
      const allowFunc = () => {
        this.mutableList = this.leaf ? [] : null;
      };
      const showMsg = `確定${this.leaf ? '轉為' : '取消'}群組?`;

      if (typeof this.handleConfirm === 'function') {
        this.handleConfirm(showMsg, allowFunc);
      } else {
        if (confirm(showMsg)) allowFunc();
      }
    },
    addItem() {
      this.mutableList.push({ id: nanoid(6) });
    },
    removeItem(id) {
      const allowFunc = () => {
        this.mutableList = arrRemoveValueByKey(this.mutableList, 'id', id);
      };
      const showMsg = `確定刪除顯示條件?`;

      if (typeof this.handleConfirm === 'function') {
        this.handleConfirm(showMsg, allowFunc);
      } else {
        if (confirm(showMsg)) allowFunc();
      }
    },
  },
};
</script>

<style lang="scss">
ul {
  &.folders,
  &.sub-folders {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .sub-folders {
    padding-top: 1rem;
  }
}

.condition-display {
  display: flex;
  align-items: flex-start;

  .drag {
    padding: var(--vGap);
  }

  .is-leaf,
  .is-folder {
    flex: 1;
  }

  .is-leaf {
    padding: 0;
  }
  .is-folder {
    padding: 1rem;
    margin-bottom: 1rem;
    border: 1px solid var(--borderColor);
  }
}

.trigger-controll {
  display: flex;
  &__logic {
    flex: 2;
  }
  &__id {
    flex: 4;
  }
  &__state {
    flex: 3;
  }
}
.trigger-setting {
}
</style>
