<template>
  <Block>
    <InputRow
      :value="triggerID"
      type="select"
      label="監聽欄位"
      clearable
      searchable
      :options="columnsExcludeSelf"
      @input="$emit('update', 'triggerID', $event)"
    >
      <template #label-left>
        <Icon icon="mdi:close-thick" is-btn @click="$emit('remove')" />
        <!-- <span>{{ idx + 1 }}.</span> -->
      </template>
    </InputRow>
    <template v-if="triggerColumn">
      <template v-if="triggerColumn.type === 'number'">
        <InputRow
          :value="values"
          type="select"
          multiple
          taggable
          push-tags
          :filterable="false"
          :create-option="(option) => option"
          @input="$emit('update', 'values', $event)"
        >
          <template #label-left>
            <Field :value="meet" type="select" :options="meetOptions" @input="$emit('update', 'meet', $event)" />
          </template>
        </InputRow>
      </template>
      <!-- Select / Radio / Checkbox -->
      <template v-if="['select', 'radio', 'checkbox'].includes(triggerColumn.type)">
        <InputRow
          v-if="triggerColumn.data.srcMode === 'list'"
          :value="values"
          type="select"
          multiple
          searchable
          :options="triggerColumn.data.items"
          :get-option-label="(option) => option.text || `(${option.id})`"
          :reduce="(option) => option.id"
          :fuse-keys="['text']"
          @input="$emit('update', 'values', $event)"
        >
          <template #label-left>
            <Field :value="meet" type="select" :options="meetOptions" @input="$emit('update', 'meet', $event)" />
          </template>
        </InputRow>
      </template>
    </template>
  </Block>
</template>
<script>
import Block from '@/components/ui/Block';
import InputRow from '@/components/ui/InputRow';
import Field from '@/components/ui/Field';
import Icon from '@/components/ui/Icon';

export default /*#__PURE__*/ {
  name: 'ColumnSettingConditionDisplay',
  components: {
    Block,
    InputRow,
    Field,
    Icon,
  },
  inject: ['handleConfirm'],
  props: {
    // 排除自己的所有欄位群
    columnsExcludeSelf: { type: Array, required: true },
    // 所有欄位群 (obj by key)
    columnsObjByKey: { type: Object, required: true },
    //-----------
    idx: { type: Number, required: true },
    triggerID: { type: String, default: null },
    values: { type: Array, default: () => [] },
    meet: { type: Boolean, default: null }, // 是否需滿足全部(如果對象可多選)
  },
  emits: ['update'],
  computed: {
    meetOptions() {
      return [
        { value: null, text: '滿足其一' },
        { value: true, text: '滿足全部' },
      ];
    },
    triggerColumn() {
      return this.triggerID ? this.columnsObjByKey[this.triggerID] : null;
    },
  },
  watch: {
    'triggerColumn.type': function (newType, oldType) {
      if (
        (['select', 'radio', 'checkbox'].includes(newType) && !['select', 'radio', 'checkbox'].includes(oldType)) ||
        ('text' === newType && 'text' !== oldType) ||
        ('number' === newType && 'number' !== oldType)
      ) {
        this.$emit('update', 'values', []);
      }
    },
  },
};
</script>
