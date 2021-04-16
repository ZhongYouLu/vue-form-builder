<template>
  <!-- <div>
    <Block>
      <div class="x-form-item">
        <Button icon="mdi:close-thick" type="flat" shape="circle" @click="$emit('remove')" />
        <Field
          :id="id"
          :value="triggerID"
          type="select"
          placeholder="監聽欄位"
          :options="columnsExcludeSelf"
          :icons="typeIcons"
          text-key="name"
          icon-key="type"
          clearable
          searchable
          @update:value="$emit('update', 'triggerID', $event)"
        />
        <Field
          v-if="triggerID"
          :value="state"
          type="select"
          :options="stateOptions"
          @update:value="$emit('update', 'state', $event)"
        />
      </div>
      <Block v-if="triggerColumn">
        <div class="x-form-item">
          <template v-if="state !== null">
            <template v-if="typeConstraint.needOptions && triggerColumn.item">
              <Field
                v-if="triggerColumn.item.srcMode === 'list'"
                :value="values"
                required
                placeholder="請選擇條件 (可多選)"
                type="select"
                multiple
                searchable
                :options="triggerColumn.item.options"
                :fuse-keys="['text']"
                @update:value="$emit('update', 'values', $event)"
              />
            </template>
            <template v-else-if="typeConstraint.isNumber">
              <Field
                :value="values"
                type="select"
                required
                multiple
                taggable
                searchable
                placeholder="請輸入條件，按下 Enter 確認。 (可輸入多筆)"
                no-drop
                :close-on-select="false"
                :reduce="(option) => option"
                :get-option-label="thousandSeparatorFunc"
                :create-option="(option) => Number(option)"
                @update:value="$emit('update', 'values', $event)"
              />
            </template>
            <template v-else>
              <Field
                :value="values"
                type="select"
                required
                multiple
                taggable
                searchable
                placeholder="請輸入條件，按下 Enter 確認。 (可輸入多筆)"
                no-drop
                :close-on-select="false"
                :reduce="(option) => option"
                :get-option-label="(option) => option"
                :create-option="(option) => option"
                @update:value="$emit('update', 'values', $event)"
              />
            </template>
          </template>
        </div>
      </Block>
    </Block>
    <Button icon="mdi:plus" type="dashed" block @click="$emit('add')" />
  </div> -->
  <li>
    <div :class="{ bold: isFolder }" @click="toggle" @dblclick="makeFolder">
      {{ item.name }}
      <span v-if="isFolder">[{{ isOpen ? '-' : '+' }}]</span>
    </div>
    <ul v-show="isOpen" v-if="isFolder">
      <ConditionDisplay
        v-for="(child, index) in item.children"
        :key="index"
        :item="child"
        :columns-exclude-self="columnsExcludeSelf"
        :columns-obj-by-key="columnsObjByKey"
        :type-icons="typeIcons"
        @make-folder="$emit('make-folder', $event)"
        @add-item="$emit('add-item', $event)"
      ></ConditionDisplay>
      <li class="add" @click="$emit('add-item', item)">+</li>
    </ul>
  </li>
</template>
<script>
// import { Button, Field, Block } from '@/components/ui';
import { thousandSeparator } from '@/assets/js/helper.js';
import { getTypeConstraint } from '@/assets/js/options.js';

export default /*#__PURE__*/ {
  name: 'ColumnSettingConditionDisplay',
  components: {
    ConditionDisplay: () => import('@/components/ColumnSetting/ConditionDisplay'),
  },
  inject: ['handleConfirm'],
  props: {
    // 排除自己的所有欄位群
    columnsExcludeSelf: { type: Array, required: true },
    // 所有欄位群 (obj by key)
    columnsObjByKey: { type: Object, required: true },
    typeIcons: { type: Object, required: true },
    //-----------
    // id: { type: String, required: true },
    group: { type: Array, default: () => [] },
    triggerID: { type: String, default: null },
    state: { type: String, default: null },
    value: { type: [String, Number], default: null },
    values: { type: Array, default: () => [] },
    //------------
    item: { type: Object, default: null },
  },
  emits: ['add', 'update', 'remove'],
  data: function () {
    return {
      isOpen: false,
    };
  },
  computed: {
    isFolder: function () {
      return this.item.children && this.item.children.length;
    },
    stateOptions() {
      let options = [
        { id: null, text: '有效的' }, // valid
        { id: '0', text: '空值' }, // is empty
        { id: '1', text: '不為空' }, // is not empty
        { id: 'mo', text: '符合其一' }, // meet one
        { id: 'ma', text: '符合全部' }, // meet all
      ];

      if (this.typeConstraint?.isText) {
        options = [
          ...options,
          { id: 'is', text: 'Is' }, // Is
          { id: 'nis', text: 'Is not' }, // Is not
          { id: 'ct', text: 'Containss' }, // Containss
          { id: 'nct', text: 'Does not contain' }, // Does not contain
          { id: 'sw', text: 'Starts with' }, // Starts with
          { id: 'ew', text: 'Ends with' }, // Ends with
        ];
      }

      if (this.typeConstraint?.isNumber) {
        options = [
          ...options,
          { id: 'eq', text: '=' }, // equal
          { id: 'neq', text: '!=' }, // not equal
          { id: 'gt', text: '>' }, // greater then
          { id: 'lt', text: '<' }, // less then
          { id: 'ge', text: '>=' }, // greater then or equal
          { id: 'le', text: '<=' }, // less then or equal
        ];
      }

      return options;
    },
    triggerColumn() {
      return this.triggerID ? this.columnsObjByKey[this.triggerID] : null;
    },
    typeConstraint() {
      if (!this.triggerColumn) return null;

      const trigger = this.triggerColumn;
      return getTypeConstraint(trigger.type, trigger.subType, trigger.base?.multiple);
    },
    thousandSeparatorFunc() {
      return (option) => thousandSeparator(option);
    },
  },
  watch: {
    stateOptions: function (options) {
      if (!options.map((o) => o.id).includes(this.state)) {
        this.$emit('update', 'state', null);
      }
    },
  },
  methods: {
    toggle: function () {
      if (this.isFolder) {
        this.isOpen = !this.isOpen;
      }
    },
    makeFolder: function () {
      if (!this.isFolder) {
        this.$emit('make-folder', this.item);
        this.isOpen = true;
      }
    },
  },
};
</script>
