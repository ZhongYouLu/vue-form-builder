<template>
  <div style="display: flex; align-items: flex-start">
    <div v-if="!root" class="drag" style="padding: var(--vGap)">
      <Icon icon="mdi:drag" />
      <span>{{ logicText }}</span>
    </div>
    <component :is="root ? 'ul' : 'li'" :class="[root && 'folders', leaf ? 'is-leaf' : 'is-folder']" style="flex: 1">
      <!-- Root -->
      <template v-if="root">
        <Draggable v-model="mutableChildren">
          <ConditionDisplay
            v-for="(child, _idx) in mutableChildren"
            v-bind="$attrs"
            :id="child.id"
            :key="child.id"
            :logic.sync="child.logic"
            :state.sync="child.state"
            :trigger-id.sync="child.triggerId"
            :value.sync="child.value"
            :children.sync="child.children"
            :idx="_idx"
            :level="level + 1"
            :root-logic="rootLogic"
            :type-icons="typeIcons"
            :columns-obj-by-key="columnsObjByKey"
            :columns-exclude-self="columnsExcludeSelf"
            @remove="$emit('remove', child.id)"
          >
            <template v-for="(_, slot) in $scopedSlots" #[slot]="props">
              <slot :name="slot" v-bind="props" />
            </template>
          </ConditionDisplay>
        </Draggable>
      </template>
      <!-- Item -->
      <template v-else>
        <Block>
          <div class="trigger-controll">
            <Field
              v-if="hasChildren"
              :value="logic"
              type="select"
              placeholder="邏輯"
              :options="logicOptions"
              :searchable="false"
              @update:value="$emit('update:logic', $event)"
            />
            <Field
              :id="id"
              :value="triggerId"
              style="flex: 2"
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
              <template v-if="typeConstraint.needOptions">
                <Field
                  :value="value"
                  required
                  placeholder="請選擇條件 (可多選)"
                  type="select"
                  multiple
                  :options="triggerColumn.item.options"
                  :fuse-keys="['text']"
                  @update:value="$emit('update:value', $event)"
                />
              </template>
              <template v-else-if="typeConstraint.isNumber">
                <Field
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
              </template>
              <template v-else>
                <Field
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
            </template>
            <template v-else-if="allowInputValue">
              <Field
                v-if="typeConstraint.isText"
                :value="value"
                required
                @update:value="$emit('update:value', $event)"
              />
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
        <!-- Children -->
        <ul v-if="hasChildren" class="sub-folders">
          <Draggable v-model="mutableChildren">
            <ConditionDisplay
              v-for="(child, _idx) in mutableChildren"
              v-bind="$attrs"
              :id="child.id"
              :key="child.id"
              :logic.sync="child.logic"
              :state.sync="child.state"
              :trigger-id.sync="child.triggerId"
              :value.sync="child.value"
              :children.sync="child.children"
              :idx="_idx"
              :level="level + 1"
              :root-logic="logic"
              :type-icons="typeIcons"
              :columns-obj-by-key="columnsObjByKey"
              :columns-exclude-self="columnsExcludeSelf"
              @remove="removeItem"
            >
              <template v-for="(_, slot) in $scopedSlots" #[slot]="props">
                <slot :name="slot" v-bind="props" />
              </template>
            </ConditionDisplay>
          </Draggable>
        </ul>
      </template>
      <Button v-if="root || children" icon="mdi:plus" block type="dashed" @click="addItem" />
    </component>
  </div>
</template>

<script>
import Block from '@/components/ui/Block';
import Draggable from '@/components/ui/Draggable/CustomDraggable';
import Field from '@/components/ui/form/Field';
import Icon from '@/components/ui/Icon';
import Button from '@/components/ui/Button';
import { nanoid, arrRemoveValueByKey, arrUpdateItemByKey } from '@/assets/js/helper.js';

import { thousandSeparator } from '@/assets/js/helper.js';
import { getTypeConstraint } from '@/assets/js/options.js';

export default /*#__PURE__*/ {
  name: 'ColumnSettingConditionDisplay',
  components: {
    ConditionDisplay: () => import('@/components/ColumnSetting/ConditionDisplay'),
    Block,
    Draggable,
    Field,
    Icon,
    Button,
  },
  inject: ['handleConfirm'],
  props: {
    columnsExcludeSelf: { type: Array, required: true },
    columnsObjByKey: { type: Object, required: true },
    typeIcons: { type: Object, required: true },
    //-----------
    id: { type: String, default: null },
    idx: { type: Number, default: null },
    triggerId: { type: String, default: null },
    state: { type: String, default: null },
    value: { type: [String, Number, Array], default: null },
    logic: { validator: (value) => ['and', 'or'].includes(value), default: 'and' },
    children: { type: Array, default: null },
    // ------------------------
    level: { type: Number, default: 0 },
    rootLogic: { validator: (value) => ['and', 'or'].includes(value), default: 'and' },
  },
  $emits: ['remove'],
  data() {
    return {
      expanded: false,
    };
  },
  computed: {
    root() {
      return this.level === 0;
    },
    mutableChildren: {
      get() {
        return this.children || [];
      },
      set(val) {
        this.$emit('update:children', val);
      },
    },
    leaf() {
      return !this.children;
    },
    hasChildren() {
      return !this.leaf && !!this.children.length;
    },
    triggerColumn() {
      return this.triggerId ? this.columnsObjByKey[this.triggerId] : null;
    },
    typeConstraint() {
      if (!this.triggerColumn) return null;

      const trigger = this.triggerColumn;
      return getTypeConstraint(trigger.type, trigger.subType, trigger.base?.multiple);
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
        this.mutableChildren = this.leaf ? [] : null;
      };
      const showMsg = `確定${this.leaf ? '轉為' : '取消'}群組?`;

      if (this.handleConfirm) {
        this.handleConfirm(showMsg, allowFunc);
      } else {
        if (confirm(showMsg)) allowFunc();
      }
    },
    addItem() {
      this.mutableChildren.push({ id: nanoid(6) });
    },
    updateItem(id, newObj) {
      newObj = arrUpdateItemByKey(this.mutableChildren, 'id', id, newObj);
      console.log(id, this.mutableChildren, newObj);
      this.mutableChildren = newObj;
    },
    removeItem(id) {
      const allowFunc = () => {
        this.mutableChildren = arrRemoveValueByKey(this.mutableChildren, 'id', id);
      };
      const showMsg = `確定刪除顯示條件 #${id}?`;

      if (this.handleConfirm) {
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

li {
  &.is-leaf {
    padding: 0;
  }
  &.is-folder {
    padding: 1rem;
    margin-bottom: 1rem;
    border: 1px solid var(--borderColor);
  }
}

.trigger-controll,
.trigger-setting {
  display: flex;
  .x-field {
    flex: 1;
  }
}
</style>
