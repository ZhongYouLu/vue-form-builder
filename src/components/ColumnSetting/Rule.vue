<template>
  <!-- 規則設定 -->
  <fieldset>
    <!-- <legend>規則設定</legend> -->
    <div v-for="(v, k) in fields" :key="k" class="input-group">
      <InputRow :value="rule[k]" v-bind="v.bind" @input="$emit('update', k, $event)">
        <template #label-right>
          <div v-if="rule[k]" @click.prevent="collect[id]['toggle'][k] = !collect[id]['toggle'][k]">
            <Icon icon="mdi:ideogram-cjk-variant" is-btn />
          </div>
        </template>
        <template v-for="(_, slot) in $scopedSlots" #[slot]="props">
          <slot :name="slot" v-bind="props" />
        </template>
      </InputRow>
      <InputRow
        v-if="rule[k] && collect[id]['toggle'][k]"
        :value="rule.msg[k]"
        :placeholder="v.msg"
        @input="$emit('updateObj', 'msg', k, $event)"
      />
    </div>
  </fieldset>
</template>

<script>
import InputRow from '@/components/ui/InputRow';
import Icon from '@/components/ui/Icon';

export default /*#__PURE__*/ {
  name: 'ColumnSettingRule',
  components: {
    InputRow,
    Icon,
  },
  inject: ['collect', 'setCollect'],
  props: {
    // 識別碼
    id: { type: String, required: true },
    // 欄位名稱
    name: { type: String, required: true },
    // 屬於文字輸入框
    isText: { type: Boolean, required: true },
    // 屬於多選框
    isCheckBox: { type: Boolean, required: true },
    // 排除自己的所有欄位群
    columnsExcludeSelf: { type: Array, required: true },
    // 所有欄位群 (obj by key)
    columnsObjByKey: { type: Object, required: true },
    //-----------
    // 規則提示
    msg: { type: Object, default: () => ({}) },
    // 必填
    required: { type: Number, default: null },
    // 字元下限
    minimum: { type: Number, default: null },
    // 字元上限
    maximum: { type: Number, default: null },
    // 驗證格式
    regex: { type: String, default: null },
    // 與..相符
    sameAs: { type: String, default: null },
    // 選擇數量下限 [多選框選項]
    least: { type: Number, default: null },
    // 選擇數量上限 [多選框選項]
    most: { type: Number, default: null },
  },
  emits: ['update', 'updateObj', 'updateArr', 'addArr', 'removeArr'],
  // data() {
  //   return {
  //     toggle: {},
  //   };
  // },
  computed: {
    rule() {
      return {
        msg: this.msg,
        // --------------------
        required: this.required,
        minimum: this.minimum,
        maximum: this.maximum,
        regex: this.regex,
        sameAs: this.sameAs,
        least: this.least,
        most: this.most,
      };
    },
    fields() {
      const name = this.name || this.id;
      const sameAsName = this.rule.sameAs
        ? this.columnsObjByKey[this.rule.sameAs].name || this.columnsObjByKey[this.rule.sameAs].id
        : '';

      let temp = {
        required: {
          msg: `[${name}] 為必填。`,
          bind: { label: '是否必填', type: 'checkbox', yes: 1, no: null },
        },
        sameAs: {
          msg: `[${name}] 與 [${sameAsName}] 不相符`,
          bind: {
            label: '與..相符',
            placeholder: '請選擇欄位',
            type: 'select',
            options: this.columnsExcludeSelf,
            clearable: true,
            searchable: true,
          },
        },
      };

      if (this.isText) {
        temp = {
          ...temp,
          minimum: {
            msg: `[${name}] 最少 [:min] 個字。`,
            bind: { label: '字元下限', type: 'number' },
          },
          maximum: {
            msg: `[${name}] 最多 [:max] 個字。`,
            bind: { label: '字元上限', type: 'number' },
          },
          regex: { if: this.isText, msg: `[${name}] 格式驗證失敗。`, bind: { label: '驗證格式' } },
        };
      } else if (this.isCheckBox) {
        temp = {
          ...temp,
          least: {
            msg: `[${name}] 最少選 [:least] 個。`,
            bind: { label: '選擇數量下限', type: 'number' },
          },
          most: {
            msg: `[${name}] 最多選 [:most] 個。`,
            bind: { label: '選擇數量上限', type: 'number' },
          },
        };
      }

      return temp;
    },
  },
  created() {
    Object.keys(this.rule).map((key) => {
      const newToggle = { ...this.collect[this.id]['toggle'], [key]: false };
      this.setCollect(this.id, 'toggle', newToggle);
    });
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
