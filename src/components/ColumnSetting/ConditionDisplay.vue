<template>
  <Block>
    <FormItem
      :id="id"
      :value="triggerID"
      desc="監聽欄位"
      type="select"
      :options="columnsExcludeSelf"
      :icons="typeIcons"
      text-key="name"
      icon-key="type"
      clearable
      searchable
      @update:value="$emit('update', 'triggerID', $event)"
    >
      <template #text-left>
        <Button icon="mdi:close-thick" type="flat" shape="circle" @click="$emit('remove')" />
        <span>{{ idx + 1 }}. </span>
      </template>
    </FormItem>
    <div v-if="triggerColumn">
      <Block>
        <div class="input-row">
          <div class="for">
            <Field :value="meet" type="select" :options="meetOptions" @update:value="$emit('update', 'meet', $event)" />
          </div>
          <template v-if="meet !== null">
            <template v-if="triggerColumn.type === 'text'">
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
            <template v-else-if="triggerColumn.type === 'number'">
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
            <template v-else-if="['select', 'radio', 'checkbox'].includes(triggerColumn.type) && triggerColumn.item">
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
</template>
<script>
import { Button, Field, Block } from '@/components/ui';
import FormItem from '@/components/ui/form/FormItem';
import { thousandSeparator } from '@/assets/js/helper.js';

export default /*#__PURE__*/ {
  name: 'ColumnSettingConditionDisplay',
  components: {
    FormItem,
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
    meet: { type: Number, default: null },
    values: { type: Array, default: () => [] },
  },
  emits: ['update'],
  computed: {
    meetOptions() {
      return [
        { id: null, text: '有效的' },
        { id: 1, text: '符合其一' },
        { id: 2, text: '符合全部' },
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
