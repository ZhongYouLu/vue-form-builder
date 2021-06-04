<template>
  <div>
    <FormItem
      v-bind="requiredSyncScope"
      @handle:selecting="handleRequiredSync(1, $event)"
      @handle:deselecting="handleRequiredSync(0, $event)"
    />
    <hr class="dashed" />
    <div v-for="(v, k) in fields" :key="k" class="input-group">
      <FormItem
        v-bind="{
          id: `[${id}]-${k}`,
          value: $props[k],
          ...v.props,
        }"
        @update:value="updateRule([k], $event)"
      >
        <template #text-right>
          <Button
            v-bind="{ icon: 'mdi:ideogram-cjk-variant', type: 'flat', shape: 'circle' }"
            @click="toggleShowMsg(k)"
          />
        </template>
        <template v-for="(_, slot) in $scopedSlots" #[slot]="props">
          <slot :name="slot" v-bind="props" />
        </template>
      </FormItem>
      <!-- Msg -->
      <FormItem
        v-show="collectShowMsg[k]"
        v-bind="{
          id: `[${id}]-${k}-msg`,
          value: !collectShowRealMsg[k] ? $props.msg[k] : invokeGetErrorMsg(k, v.msg),
          placeholder: v.msg,
          toggle: true,
          readonly: collectShowRealMsg[k],
          toggleCallBack: () => toggleShowRealMsg(k),
        }"
        @update:value="updateRule(['msg', k], $event)"
      />
    </div>
  </div>
</template>

<script>
import FormItem from '@/components/ui/form/FormItem';
import Button from '@/components/ui/Button';
import { getters as collectsGetters, mutations as collectsMutations } from '@/store/collects.js';
import { getters as regexGetters, mutations as regexMutations } from '@/store/regex.js';
import { arrRemoveValue } from '@/assets/js/helper.js';
import { typeIcons } from '@/assets/js/options.js';
import { errorMsg, getErrorMsg } from '@/assets/js/columns.js';

export default /*#__PURE__*/ {
  name: 'ColumnSettingRule',
  components: {
    FormItem,
    Button,
  },
  inheritAttrs: false,
  props: {
    // 識別碼
    id: { type: String, required: true },
    // Tab
    tab: { type: String, required: true },
    // 欄位名稱
    name: { type: String, default: null },
    // 欄位屬性約束
    typeConstraint: { type: Object, required: true },
    // 所有欄位群 (obj by key)
    columnsByKey: { type: Object, required: true },
    // 排除自己的所有欄位群
    columnsExcludeSelf: { type: Array, required: true },
    //-----------
    // 規則提示
    msg: { type: Object, default: () => ({}) },
    // 被其他欄位連動必填 (自身必填檢查)
    requiredPassive: { type: Array, default: () => [] },
    // 必填
    required: { type: Number, default: null },
    // 與..相符
    sameAs: { type: String, default: null },
    // 下限
    min: { type: [Number, String], default: null },
    // 上限
    max: { type: [Number, String], default: null },
    // 驗證格式
    regex: { type: String, default: null },
  },
  emits: ['update:column'],
  computed: {
    collects: collectsGetters.collects,
    regexOptions: regexGetters.regexOptions,
    fields() {
      const name = this.name || this.id;
      const sameAsName = this.sameAs ? this.columnsByKey[this.sameAs].name || this.columnsByKey[this.sameAs].id : '';

      let fields = {};

      if (!this.required) {
        fields = {
          requiredPassive: {
            props: {
              desc: '被...連動必填',
              placeholder: '請選擇欄位',
              type: 'select',
              options: this.requiredPassiveOptions,
              icons: typeIcons,
              textKey: 'name',
              iconKey: 'type',
              multiple: true,
            },
            msg: errorMsg.required,
          },
        };
      }

      fields = {
        ...fields,
        required: {
          props: { desc: '是否必填', label: '必填', type: 'checkbox' },
          msg: errorMsg.required,
        },
        sameAs: {
          props: {
            desc: '與..相符',
            placeholder: '請選擇欄位',
            type: 'select',
            options: this.sameAsOptions,
            icons: typeIcons,
            textKey: 'name',
            iconKey: 'type',
            clearable: true,
          },
          msg: errorMsg.sameAs,
        },
      };

      if (this.typeConstraint.isText) {
        fields = {
          ...fields,
          min: { props: { desc: '字元下限', type: 'number' }, msg: errorMsg.min.text },
          max: { props: { desc: '字元上限', type: 'number' }, msg: errorMsg.max.text },
          regex: {
            props: {
              desc: '驗證格式',
              type: 'select',
              placeholder: '請選擇',
              options: this.regexOptions,
              clearable: true,
              taggable: true,
              pushTags: true,
              // reactable: true,
              createOption: (option) => ({ id: option, text: option }),
              handleCreatedCallback: (option) => regexMutations.addRegex(option.text),
              // getOptionLabel: (option) => option,
            },
            msg: errorMsg.regex,
          },
        };
      } else if (this.typeConstraint.isNumber) {
        fields = {
          ...fields,
          min: { props: { desc: '數字下限', type: 'number' }, msg: errorMsg.min.number },
          max: { props: { desc: '數字上限', type: 'number' }, msg: errorMsg.max.number },
        };
      } else if (this.typeConstraint.isDate) {
        fields = {
          ...fields,
          min: { props: { desc: '日期下限', type: 'date' }, msg: errorMsg.min.date },
          max: { props: { desc: '日期上限', type: 'date' }, msg: errorMsg.max.date },
        };
      } else if (this.columnsByKey[this.id].base?.multiple) {
        fields = {
          ...fields,
          min: { props: { desc: '選擇數量下限', type: 'number' }, msg: errorMsg.min.option },
          max: { props: { desc: '選擇數量上限', type: 'number' }, msg: errorMsg.max.option },
        };
      }

      return fields;
    },
    sameAsOptions() {
      return this.typeConstraint.filterSame(this.columnsExcludeSelf);
    },
    requiredPassiveOptions() {
      return this.required ? [] : this.columnsExcludeSelf;
    },
    requiredSyncOptions() {
      return this.columnsExcludeSelf.filter((c) => {
        return c.rule?.required ? !c.rule.required : true;
      });
    },
    // 連動必填其他欄位 (如果自身有值，其欄位必填)
    requiredSync() {
      return this.columnsExcludeSelf.reduce((acc, c) => {
        if (c.rule?.requiredPassive?.includes(this.id)) {
          acc.push(c.id);
        }
        return acc;
      }, []);
    },
    requiredSyncScope() {
      return {
        id: `[${this.id}]-requiredSync`,
        value: this.requiredSync,
        desc: '連動必填...',
        placeholder: '請選擇欄位',
        type: 'select',
        options: this.requiredSyncOptions,
        icons: typeIcons,
        textKey: 'name',
        iconKey: 'type',
        multiple: true,
      };
    },
    collectShowMsg() {
      return this.collects[this.id]['showMsg'];
    },
    collectShowRealMsg() {
      return this.collects[this.id]['showRealMsg'];
    },
  },
  created() {
    collectsMutations.setCollect([this.id, 'showMsg']);
    collectsMutations.setCollect([this.id, 'showRealMsg']);
    this.updateRule(['msg'], this.msg);
  },
  methods: {
    toggleShowMsg(k) {
      collectsMutations.toggleCollect([this.id, 'showMsg', k]);
    },
    toggleShowRealMsg(k) {
      collectsMutations.toggleCollect([this.id, 'showRealMsg', k]);
    },
    updateColumnById(id, path, val) {
      this.$emit('update:column', id, path, val);
    },
    updateRule(path, val) {
      this.updateColumnById(this.id, [this.tab, ...path], val);
    },
    handleRequiredSync(isAdd, { id }) {
      const targetColumn = this.columnsByKey[id];
      const requiredPassive = targetColumn.rule?.requiredPassive || [];
      const newValue = isAdd ? [...requiredPassive, this.id] : arrRemoveValue(requiredPassive, this.id);
      this.updateColumnById(id, ['rule', 'requiredPassive'], newValue);
    },
    invokeGetErrorMsg(k, msg) {
      return getErrorMsg(this.$props.msg[k] || msg, {
        name: this.name,
        min: this.min,
        max: this.max,
        sameAs: this.sameAs,
      });
    },
  },
};
</script>

<style lang="scss">
@import '@/assets/scss/utils.scss';

.input-group {
  &:not(:last-child) {
    margin-bottom: $gap-lg;
  }
}
</style>
