<template>
  <div>
    <FormItem
      :id="`[${id}]-requiredSync`"
      :value="requiredSync"
      desc="連動必填..."
      type="select"
      :options="requiredSyncOptions"
      :icons="typeIcons"
      text-key="name"
      icon-key="type"
      multiple
      @handle:selecting="handleRequiredSync(1, $event)"
      @handle:deselecting="handleRequiredSync(0, $event)"
    />
    <hr class="dashed" />
    <div v-for="(v, k) in fields" :key="k" class="input-group">
      <FormItem :id="`[${id}]-${k}`" v-bind="v.props" :value="$props[k]" @update:value="updateRule([k], $event)">
        <template #text-right>
          <Button icon="mdi:ideogram-cjk-variant" type="flat" shape="circle" @click="toggleToggleMsg(k)" />
        </template>
        <template v-for="(_, slot) in $scopedSlots" #[slot]="props">
          <slot :name="slot" v-bind="props" />
        </template>
      </FormItem>
      <!-- Msg -->
      <FormItem
        v-show="toggleMsg[k]"
        :id="`[${id}]-${k}-msg`"
        :value="$props.msg[k]"
        :placeholder="v.msg"
        @update:value="updateRule(['msg', k], $event)"
      />
    </div>
  </div>
</template>

<script>
import FormItem from '@/components/ui/form/FormItem';
import Button from '@/components/ui/Button';
import { getters as collectsGetters, mutations as collectsMutations } from '@/store/collects.js';

import { arrRemoveValue } from '@/assets/js/helper.js';
import { typeIcons, regexOptions } from '@/assets/js/options.js';

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
    // 排除自己的所有欄位群
    columnsExcludeSelf: { type: Array, required: true },
    // 所有欄位群 (obj by key)
    columnsByKey: { type: Object, required: true },
    //-----------
    // 規則提示
    msg: { type: Object, default: () => ({}) },
    // 被其他欄位連動必填 (自身必填檢查)
    requiredPassive: { type: Array, default: () => [] },
    // 必填
    required: { type: Number, default: null },
    // 與..相符
    sameAs: { type: String, default: null },
    // 字元下限
    minimum: { type: [Number, String], default: null },
    // 字元上限
    maximum: { type: [Number, String], default: null },
    // 驗證格式
    regex: { type: String, default: null },
    // 選擇數量下限 [多選框選項]
    least: { type: Number, default: null },
    // 選擇數量上限 [多選框選項]
    most: { type: Number, default: null },
  },
  emits: ['update'],
  computed: {
    ...collectsGetters,
    typeIcons() {
      return typeIcons;
    },
    regexOptions() {
      return regexOptions;
    },
    fields() {
      const name = this.name || this.id;
      const sameAsName = this.sameAs ? this.columnsByKey[this.sameAs].name || this.columnsByKey[this.sameAs].id : '';

      let fields = {};

      if (!this.required) {
        fields = {
          requiredPassive: {
            props: {
              desc: '被...連動必填',
              type: 'select',
              options: this.requiredPassiveOptions,
              icons: this.typeIcons,
              textKey: 'name',
              iconKey: 'type',
              multiple: true,
            },
            msg: `[${name}] 為必填。`,
          },
        };
      }

      fields = {
        ...fields,
        required: {
          props: { desc: '是否必填', label: '必填', type: 'checkbox' },
          msg: `[${name}] 為必填。`,
        },
        sameAs: {
          props: {
            desc: '與..相符',
            placeholder: '請選擇欄位',
            type: 'select',
            options: this.typeConstraint.filterSame(this.columnsExcludeSelf),
            icons: this.typeIcons,
            textKey: 'name',
            iconKey: 'type',
            clearable: true,
          },
          msg: `[${name}] 與 [${sameAsName}] 不相符`,
        },
      };

      if (this.typeConstraint.isText && !this.columnsByKey[this.id].base?.subType) {
        fields = {
          ...fields,
          minimum: { props: { desc: '字元下限', type: 'number' }, msg: `[${name}] 最少 [:min] 個字。` },
          maximum: { props: { desc: '字元上限', type: 'number' }, msg: `[${name}] 最多 [:max] 個字。` },
          regex: {
            props: {
              desc: '驗證格式',
              type: 'select',
              placeholder: '請選擇',
              options: this.regexOptions,
              clearable: true,
              taggable: true,
              pushTags: true,
              reactable: true,
              createOption: (option) => ({ id: option, text: option }),
              // getOptionLabel: (option) => option,
            },
            msg: `[${name}] 格式驗證失敗。`,
          },
        };
      } else if (this.typeConstraint.isNumber) {
        fields = {
          ...fields,
          minimum: { props: { desc: '數字下限', type: 'number' }, msg: `[${name}] 最少 [:min]。` },
          maximum: { props: { desc: '數字上限', type: 'number' }, msg: `[${name}] 最多 [:max]。` },
        };
      } else if (this.typeConstraint.isDate) {
        fields = {
          ...fields,
          minimum: { props: { desc: '日期下限', type: 'date' }, msg: `[${name}] 不得小於 [:min]。` },
          maximum: { props: { desc: '日期上限', type: 'date' }, msg: `[${name}] 不得大於 [:max]。` },
        };
      } else if (this.columnsByKey[this.id].base?.multiple) {
        fields = {
          ...fields,
          least: { props: { desc: '選擇數量下限', type: 'number' }, msg: `[${name}] 最少選 [:least] 個。` },
          most: { props: { desc: '選擇數量上限', type: 'number' }, msg: `[${name}] 最多選 [:most] 個。` },
        };
      }

      return fields;
    },
    toggleMsg() {
      return this.collects[this.id]['toggleMsg'];
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
  },
  created() {
    console.log('created');
    this.setCollect([this.id, 'toggleMsg']);
    this.updateRule(['msg'], {});
    this.updateRule(['requiredPassive'], []);

    // if (this.regex && this.regexOptions.findIndex((option) => option.value === this.regex) === -1) {
    //   this.regexOptions.push({ id: this.regex, text: this.regex });
    // }
  },
  methods: {
    ...collectsMutations,
    updateRule(path, val) {
      this.$emit('update:column', this.id, [this.tab, ...path], val);
    },
    toggleToggleMsg(k) {
      this.toggleCollect([this.id, 'toggleMsg', k]);
    },
    handleRequiredSync(isAdd, { id }) {
      const target = this.columnsByKey[id];
      const requiredPassive = target.rule?.requiredPassive || [];

      if (isAdd) {
        target.rule.requiredPassive = [...requiredPassive, this.id];
      } else {
        target.rule.requiredPassive = arrRemoveValue(requiredPassive, this.id);
      }
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
