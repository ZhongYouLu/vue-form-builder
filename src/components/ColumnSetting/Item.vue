<template>
  <!-- 項目設定 -->
  <fieldset>
    <!-- <legend>項目設定</legend> -->
    <FormItem
      :id="`[${id}]-src-mode`"
      :value="$props.srcMode"
      desc="資料來源"
      placeholder="請選擇來源"
      type="select"
      :options="sourceModeOptions"
      required
      @update:value="update('srcMode', $event)"
    />
    <hr class="dashed" />
    <template v-if="$props.srcMode === 'list'">
      <Block v-show="$props.options.length">
        <Draggable :value="$props.options" @input="update('options', $event)">
          <div v-for="(option, idx) in $props.options" :key="option.id" class="x-form-item">
            <div class="drag"><Icon icon="mdi:drag" />{{ idx + 1 }}</div>
            <Field
              :value="option.text"
              :placeholder="`(${option.id})`"
              @update:value="updateOption(option.id, 'text', $event)"
            />
            <Button icon="mdi:close-thick" type="flat" shape="circle" @click="removeOption(option.id)" />
          </div>
        </Draggable>
      </Block>
      <Button icon="mdi:plus" type="dashed" block @click="addOption" />
    </template>
    <template v-else>
      <FormItem
        :id="`[${id}]-api-url`"
        :value="$props.api.url"
        desc="API URL"
        required
        @update:value="updateApi('url', $event)"
      />
      <FormItem
        :id="`[${id}]-api-vk`"
        :value="$props.api.textKey"
        desc="Value Key"
        required
        @update:value="updateApi('textKey', $event)"
      />
      <FormItem
        :id="`[${id}]-api-tk`"
        :value="$props.api.valueKey"
        desc="Text Key"
        required
        @update:value="updateApi('valueKey', $event)"
      />
    </template>
  </fieldset>
</template>

<script>
import FormItem from '@/components/ui/form/FormItem';
import { Button, Icon, Field, Block, Draggable } from '@/components/ui';
import { nanoid } from '@/assets/js/helper.js';
import { convertOptions } from '@/assets/js/options.js';

export default /*#__PURE__*/ {
  name: 'ColumnSettingItem',
  components: {
    FormItem,
    Button,
    Icon,
    Field,
    Block,
    Draggable,
  },
  inject: ['handleConfirm'],
  inheritAttrs: false,
  props: {
    // 排除自己的所有欄位群
    columnsExcludeSelf: { type: Array, required: true },
    // 所有欄位群 (obj by key)
    columnsObjByKey: { type: Object, required: true },
    //-----------
    id: { type: String, required: true },
    // 資料來源模式
    srcMode: { validator: (value) => ['list', 'api'].includes(value), default: 'list' },
    // 顯示模式
    displayMode: { validator: (value) => ['line', 'next', 'bothSide'].includes(value), default: 'line' },
    // 項目
    options: { type: Array, default: () => [] },
    // API設定
    api: { type: Object, default: () => ({ url: '', textKey: '', valueKey: '' }) },
  },
  emits: ['update', 'updateObj', 'updateArr', 'addArr', 'removeArr'],
  computed: {
    sourceModeOptions() {
      return convertOptions({
        list: '手動設置',
        // api: 'API',
      });
    },
    displayModeOptions() {
      return convertOptions({
        line: 'Line by Line',
        next: 'Next to each others',
        bothSide: 'Stay on each sides in a row (Left - Right)',
      });
    },
  },
  methods: {
    update(key, val) {
      this.$emit('update', key, val);
    },
    updateApi(key, val) {
      this.$emit('updateObj', 'api', key, val);
    },
    updateOption(id, key, val) {
      this.$emit('updateArr', 'options', id, key, val);
    },
    addOption() {
      this.$emit('addArr', 'options', { id: nanoid(6), text: '' });
    },
    removeOption(id) {
      // 確認刪除函式
      const allowFunc = () => {
        this.$emit('removeArr', 'options', id);
      };

      const idx = this.$props.options.findIndex((option) => option.id === id);
      const { text } = this.$props.options[idx];
      const showMsg = `確定刪除項目 #${idx + 1} [${text || id}] ?`;

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
@import '@/assets/scss/utils.scss';

hr.dashed {
  border-top: 1px dashed $border-color;
}
</style>
