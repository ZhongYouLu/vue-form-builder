<template>
  <div>
    <FormItem
      :id="`[${id}]-src-mode`"
      :value="$props.srcMode"
      desc="資料來源"
      placeholder="請選擇來源"
      type="select"
      :options="sourceModeOptions"
      required
      @update:value="updateItem(['srcMode'], $event)"
    />
    <hr class="dashed" />
    <template v-if="$props.srcMode === 'list'">
      <Block v-show="$props.options.length">
        <Draggable :value="$props.options" @input="updateItem(['options'], $event)">
          <SlideFadeTransitionGroup>
            <div v-for="(option, idx) in $props.options" :key="option.id" class="x-form-item">
              <div class="drag"><Icon icon="mdi:drag" />{{ idx + 1 }}</div>
              <Field ref="option" :value.sync="option.text" :placeholder="`(${option.id})`" />
              <Button icon="mdi:close-thick" type="flat" shape="circle" @click="removeOption(option.id)" />
            </div>
          </SlideFadeTransitionGroup>
        </Draggable>
      </Block>
      <Button icon="mdi:plus" type="dashed" block @click="addOption" />
    </template>
    <template v-else>
      <FormItem :id="`[${id}]-api-url`" :value.sync="$props.api.url" desc="API URL" sub-type="url" required />
      <FormItem :id="`[${id}]-api-vk`" :value.sync="$props.api.textKey" desc="Value Key" required />
      <FormItem :id="`[${id}]-api-tk`" :value.sync="$props.api.valueKey" desc="Text Key" required />
    </template>
  </div>
</template>

<script>
import FormItem from '@/components/ui/form/FormItem';
import { Button, Icon, Field, Block, Draggable } from '@/components/ui';
import SlideFadeTransitionGroup from '@/components/ui/transition-group/SlideFade';
import { nanoid, arrRemoveValueByKey } from '@/assets/js/helper.js';
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
    SlideFadeTransitionGroup,
  },
  inject: ['handleConfirm'],
  inheritAttrs: false,
  props: {
    // 識別碼
    id: { type: String, required: true },
    // Tab
    tab: { type: String, required: true },
    //-----------
    // 資料來源模式
    srcMode: { validator: (value) => ['list', 'api'].includes(value), default: 'list' },
    // 顯示模式
    displayMode: { validator: (value) => ['line', 'next', 'bothSide'].includes(value), default: 'line' },
    // 項目
    options: { type: Array, default: () => [] },
    // API設定
    api: { type: Object, default: () => ({ url: '', textKey: '', valueKey: '' }) },
  },
  emits: ['update:column'],
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
  created() {
    this.updateItem(['srcMode'], this.srcMode);
    this.updateItem(['options'], this.options);
  },
  methods: {
    updateColumnById(id, path, val) {
      this.$emit('update:column', id, path, val);
    },
    updateItem(path, val) {
      this.updateColumnById(this.id, [this.tab, ...path], val);
    },
    addOption() {
      const newOptions = this.$props.options.concat({ id: nanoid(6), text: '' });
      this.updateItem(['options'], newOptions);

      this.$nextTick(() => this.$refs.option[this.$refs.option.length - 1].focus());
    },
    removeOption(id) {
      const options = this.$props.options;

      // 確認刪除函式
      const allowFunc = () => {
        const newOptions = arrRemoveValueByKey(options, 'id', id);
        this.updateItem(['options'], newOptions);
      };

      const idx = options.findIndex((option) => option.id === id);
      const { text } = options[idx];
      const showMsg = `確定刪除項目 #${idx + 1} [${text || id}] ?`;

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
@import '@/assets/scss/utils.scss';

hr.dashed {
  border-top: 1px dashed $border-color;
}
</style>
