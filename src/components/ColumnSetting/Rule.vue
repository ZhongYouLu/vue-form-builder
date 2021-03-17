<template>
  <!-- 規則設定 -->
  <fieldset>
    <!-- <legend>規則設定</legend> -->
    <div v-for="(v, k) in fields" :key="k" class="input-group">
      <InputRow :value="$props[k]" v-bind="v.props" @input="update(k, $event)">
        <template #label-right>
          <Icon v-show="$props[k]" icon="mdi:ideogram-cjk-variant" is-btn @click="setToggleMsg(k)" />
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
  computed: {
    fields() {
      const name = this.name || this.id;
      const sameAsName = this.sameAs
        ? this.columnsObjByKey[this.sameAs].name || this.columnsObjByKey[this.sameAs].id
        : '';

      let temp = {
        required: {
          props: { label: '是否必填', text: '必填', type: 'checkbox', yes: 1, no: null },
          msg: `[${name}] 為必填。`,
        },
        sameAs: {
          props: {
            label: '與..相符',
            placeholder: '請選擇欄位',
            type: 'select',
            options: this.columnsExcludeSelf,
            clearable: true,
            searchable: true,
          },
          msg: `[${name}] 與 [${sameAsName}] 不相符`,
        },
      };

      if (this.isText) {
        temp = {
          ...temp,
          minimum: { props: { label: '字元下限', type: 'number' }, msg: `[${name}] 最少 [:min] 個字。` },
          maximum: { props: { label: '字元上限', type: 'number' }, msg: `[${name}] 最多 [:max] 個字。` },
          regex: { props: { label: '驗證格式' }, msg: `[${name}] 格式驗證失敗。` },
        };
      } else if (this.isCheckBox) {
        temp = {
          ...temp,
          least: { props: { label: '選擇數量下限', type: 'number' }, msg: `[${name}] 最少選 [:least] 個。` },
          most: { props: { label: '選擇數量上限', type: 'number' }, msg: `[${name}] 最多選 [:most] 個。` },
        };
      }

      return temp;
    },
    toggleMsg() {
      return this.collect[this.id]['toggleMsg'];
    },
  },
  created() {
    this.setCollect(this.id, 'toggleMsg', {});
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
