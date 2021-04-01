<template>
  <!-- 規則設定 -->
  <fieldset>
    <!-- <legend>規則設定</legend> -->
    <div v-for="(v, k) in fields" :key="k" class="input-group">
      <InputRow :value="$props[k]" v-bind="v.props" @input="update(k, $event)">
        <template #text-right>
          <Button
            v-show="$props[k]"
            icon="mdi:ideogram-cjk-variant"
            type="flat"
            shape="circle"
            @click="setToggleMsg(k)"
          />
        </template>
        <template v-for="(_, slot) in $scopedSlots" #[slot]="props">
          <slot :name="slot" v-bind="props" />
        </template>
      </InputRow>
      <!-- Msg -->
      <InputRow
        v-show="$props[k] && toggleMsg[k]"
        :value="$props.msg[k]"
        :placeholder="v.msg"
        @input="$emit('updateObj', 'msg', k, $event)"
      />
    </div>
  </fieldset>
</template>

<script>
import { InputRow, Button } from '@/components/ui';
import { typeIcons, regexOptions } from '@/assets/js/options.js';

export default /*#__PURE__*/ {
  name: 'ColumnSettingRule',
  components: {
    InputRow,
    Button,
  },
  inject: ['collect', 'setCollect'],
  props: {
    // 識別碼
    id: { type: String, required: true },
    // 欄位名稱
    name: { type: String, required: true },
    // 欄位屬性約束
    typeConstraint: { type: Object, required: true },
    // 排除自己的所有欄位群
    columnsExcludeSelf: { type: Array, required: true },
    // 所有欄位群 (obj by key)
    columnsObjByKey: { type: Object, required: true },
    //-----------
    // 規則提示
    msg: { type: Object, default: () => ({}) },
    // 必填
    required: { type: Number, default: null },
    // 與..相符
    sameAs: { type: String, default: null },
    // 字元下限
    minimum: { type: Number, default: null },
    // 字元上限
    maximum: { type: Number, default: null },
    // 驗證格式
    regex: { type: String, default: null },
    // 選擇數量下限 [多選框選項]
    least: { type: Number, default: null },
    // 選擇數量上限 [多選框選項]
    most: { type: Number, default: null },
  },
  emits: ['update', 'updateObj'],
  data() {
    return {
      localRegexOptions: regexOptions,
    };
  },
  computed: {
    fields() {
      const name = this.name || this.id;
      const sameAsName = this.sameAs
        ? this.columnsObjByKey[this.sameAs].name || this.columnsObjByKey[this.sameAs].id
        : '';

      let temp = {
        required: {
          props: { text: '是否必填', label: '必填', type: 'checkbox', yes: 1, no: null },
          msg: `[${name}] 為必填。`,
        },
        sameAs: {
          props: {
            text: '與..相符',
            placeholder: '請選擇欄位',
            type: 'select',
            options: this.typeConstraint.filterSame(this.columnsExcludeSelf),
            icons: this.typeIcons,
            valueKey: 'id',
            textKey: 'name',
            iconKey: 'type',
            clearable: true,
            searchable: true,
          },
          msg: `[${name}] 與 [${sameAsName}] 不相符`,
        },
      };

      if (this.typeConstraint.isText && !this.typeConstraint.hasSubType) {
        temp = {
          ...temp,
          minimum: { props: { text: '字元下限', type: 'number' }, msg: `[${name}] 最少 [:min] 個字。` },
          maximum: { props: { text: '字元上限', type: 'number' }, msg: `[${name}] 最多 [:max] 個字。` },
          regex: {
            props: {
              text: '驗證格式',
              type: 'select',
              placeholder: '請選擇',
              options: this.localRegexOptions,
              clearable: true,
              searchable: true,
              taggable: true,
              pushTags: true,
              createOption: (option) => ({ value: option, text: option }),
              // getOptionLabel: (option) => option,
            },
            msg: `[${name}] 格式驗證失敗。`,
          },
        };
      } else if (this.typeConstraint.isNumber) {
        temp = {
          ...temp,
          minimum: { props: { text: '數字下限', type: 'number' }, msg: `[${name}] 最少 [:min]。` },
          maximum: { props: { text: '數字上限', type: 'number' }, msg: `[${name}] 最多 [:max]。` },
        };
      } else if (this.typeConstraint.isMultiple) {
        temp = {
          ...temp,
          least: { props: { text: '選擇數量下限', type: 'number' }, msg: `[${name}] 最少選 [:least] 個。` },
          most: { props: { text: '選擇數量上限', type: 'number' }, msg: `[${name}] 最多選 [:most] 個。` },
        };
      }

      return temp;
    },
    typeIcons() {
      return typeIcons;
    },
    toggleMsg() {
      return this.collect[this.id]['toggleMsg'];
    },
  },
  created() {
    this.setCollect(this.id, 'toggleMsg', {});

    if (this.regex && this.localRegexOptions.findIndex((option) => option.value === this.regex) === -1) {
      this.localRegexOptions = this.localRegexOptions.concat({ value: this.regex, text: this.regex });
    }
  },
  methods: {
    update(k, v) {
      this.$emit('update', k, v);

      if (this.toggleMsg[k] === undefined) {
        this.setToggleMsg(k, false);
      }
    },
    setToggleMsg(k, v) {
      this.setCollect(this.id, 'toggleMsg', {
        ...this.toggleMsg,
        [k]: v !== undefined ? v : !this.toggleMsg[k],
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
