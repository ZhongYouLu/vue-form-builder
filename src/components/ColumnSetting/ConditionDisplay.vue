<template>
  <div>
    <span>{{ idx + 1 }}. </span>
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
      <div v-if="triggerColumn">
        <Block>
          <div class="x-form-item">
            <template v-if="state !== null">
              <template v-if="typeConstraint.isText">
                <Field
                  :value="values"
                  type="select"
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
              <template v-else-if="typeConstraint.isNumber">
                <Field
                  :value="values"
                  type="select"
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
              <!-- Select / Radio / Checkbox -->
              <template v-else-if="typeConstraint.needOptions && triggerColumn.item">
                <Field
                  v-if="triggerColumn.item.srcMode === 'list'"
                  :value="values"
                  placeholder="請選擇條件 (可多選)"
                  type="select"
                  multiple
                  searchable
                  :options="triggerColumn.item.options"
                  :fuse-keys="['text']"
                  @update:value="$emit('update', 'values', $event)"
                />
              </template>
            </template>
          </div>
        </Block>
      </div>
    </Block>
  </div>
</template>
<script>
import { Button, Field, Block } from '@/components/ui';
import { thousandSeparator } from '@/assets/js/helper.js';
import { getTypeConstraint } from '@/assets/js/options.js';

export default /*#__PURE__*/ {
  name: 'ColumnSettingConditionDisplay',
  components: {
    Button,
    Field,
    Block,
  },
  inject: ['handleConfirm'],
  props: {
    // 排除自己的所有欄位群
    columnsExcludeSelf: { type: Array, required: true },
    // 所有欄位群 (obj by key)
    columnsObjByKey: { type: Object, required: true },
    typeIcons: { type: Object, required: true },
    //-----------
    id: { type: String, required: true },
    idx: { type: Number, required: true },
    triggerID: { type: String, default: null },
    state: { type: String, default: null },
    value: { type: [String, Number], default: null },
    values: { type: Array, default: () => [] },
  },
  emits: ['update'],
  computed: {
    stateOptions() {
      let options = [
        { id: null, text: '有效的' }, // valid
        { id: 'mo', text: '符合其一' }, // meet one
        { id: 'ma', text: '符合全部' }, // meet all
      ];

      if (this.typeConstraint?.isNumber) {
        options = [
          ...options,
          { id: 'eq', text: '等於' }, // equal
          { id: 'ne', text: '不等於' }, // not equal
          { id: 'gt', text: '大於' }, // greater then
          { id: 'ge', text: '大於等於' }, // greater then or equal
          { id: 'lt', text: '小於' }, // less then
          { id: 'le', text: '小於等於' }, // less then or equal
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
};
</script>
