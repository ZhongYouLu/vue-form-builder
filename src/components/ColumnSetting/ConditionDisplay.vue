<template>
  <Block>
    <InputRow
      :value="triggerID"
      text="監聽欄位"
      type="select"
      :options="columnsExcludeSelf"
      :icons="typeIcons"
      value-key="id"
      text-key="name"
      icon-key="type"
      clearable
      searchable
      @input="$emit('update', 'triggerID', $event)"
    >
      <template #text-left>
        <Icon icon="mdi:close-thick" is-btn @click="$emit('remove')" />
        <span>{{ idx + 1 }}. </span>
      </template>
    </InputRow>
    <div v-if="triggerColumn">
      <Block>
        <div class="input-row">
          <template v-if="triggerColumn.type === 'text'">
            <div class="for"></div>
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
              @input="$emit('update', 'values', $event)"
            />
          </template>
          <template v-else-if="triggerColumn.type === 'number'">
            <div class="for">符合其一</div>
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
              @input="$emit('update', 'values', $event)"
            />
          </template>
          <!-- Select / Radio / Checkbox -->
          <template v-else-if="['select', 'radio', 'checkbox'].includes(triggerColumn.type) && triggerColumn.item">
            <div class="for">
              <Field :value="meet" type="select" :options="meetOptions" @input="$emit('update', 'meet', $event)" />
            </div>
            <Field
              v-if="triggerColumn.item.srcMode === 'list'"
              :value="values"
              placeholder="請選擇條件 (可多選)"
              type="select"
              multiple
              searchable
              :options="triggerColumn.item.items"
              value-key="id"
              text-key="text"
              :fuse-keys="['text']"
              @input="$emit('update', 'values', $event)"
            />
          </template></div
      ></Block>
    </div>
  </Block>
</template>
<script>
import { InputRow, Icon, Field, Block } from '@/components/ui';
import { thousandSeparator } from '@/assets/js/helper.js';

export default /*#__PURE__*/ {
  name: 'ColumnSettingConditionDisplay',
  components: {
    InputRow,
    Icon,
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
    idx: { type: Number, required: true },
    triggerID: { type: String, default: null },
    values: { type: Array, default: () => [] },
    meet: { type: Number, default: null }, // null: 滿足其一, 1: 滿足全部
  },
  emits: ['update'],
  computed: {
    meetOptions() {
      return [
        { value: null, text: '符合其一' },
        { value: 1, text: '符合全部' },
      ];
    },
    triggerColumn() {
      return this.triggerID ? this.columnsObjByKey[this.triggerID] : null;
    },
    thousandSeparatorFunc() {
      return (option) => thousandSeparator(option);
    },
  },
};
</script>
