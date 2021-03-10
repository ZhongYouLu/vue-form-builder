<template>
  <div class="record-controls">
    <button @click="addToRecord">
      <Icon icon="mdi:content-save" />
    </button>
    <button :disabled="!hasPrev" @click="restorePrev">
      <Icon icon="ri:arrow-go-back-fill" />
    </button>
    <button :disabled="!hasNext" @click="restoreNext">
      <Icon icon="ri:arrow-go-forward-fill" />
    </button>
    <button :disabled="!hasThis" @click="restoreThis">
      <Icon icon="mdi:restore" />
    </button>
    <button :disabled="!hasThis" @click="removeRecord">
      <Icon icon="mdi:trash-can" />
    </button>
    <!-- Default Slot -->
    <slot :hasThis="hasThis" :recordIdx="recordIdx" :recordLimit="recordLimit" :createdTime="createdTime">
      <span v-show="hasThis"> {{ recordIdx + 1 }} / {{ recordLimit }} 筆 : {{ createdTime }} </span>
    </slot>
  </div>
</template>

<script>
import Icon from '@/components/ui/Icon';
import { deepCopy } from '@/assets/js/helper.js';

export default /*#__PURE__*/ {
  name: 'RecordControls',
  components: {
    Icon,
  },
  props: {
    recordName: { type: String, required: true },
    recordLimit: { type: Number, default: 5 },
    value: { type: [String, Number, Boolean, Array, Object, Date, Function, Symbol], required: true },
    immediate: { type: Boolean, default: false },
    callback: { type: Function, default: null },
  },
  data() {
    return {
      record: [],
      recordIdx: -1,
    };
  },
  computed: {
    hasThis() {
      return this.recordIdx > -1 && this.recordIdx < this.record.length;
    },
    hasPrev() {
      return this.recordIdx > 0;
    },
    hasNext() {
      return this.recordIdx < this.record.length - 1;
    },
    createdTime() {
      return this.record[this.recordIdx] && this.record[this.recordIdx].created;
    },
  },
  created() {
    this.getRecord();
  },
  methods: {
    removeRecord() {
      if (confirm(`確定清除 [${this.recordName}] 的所有存檔?`)) {
        localStorage.removeItem(this.recordName);
        window.location.reload();
      }
    },
    getRecord() {
      this.record = JSON.parse(localStorage.getItem(this.recordName)) || [];

      if (this.immediate && (!this.record || !this.record.length)) {
        this.record = [];
        this.addToRecord();
      }

      this.restoreLast();
    },
    addToRecord() {
      this.record.push({
        value: deepCopy(this.value),
        created: new Date().toLocaleString(),
      });

      if (this.record.length > this.recordLimit) {
        this.record = this.record.slice(0 - this.recordLimit);
      }

      localStorage.setItem(this.recordName, JSON.stringify(this.record));

      this.restoreLast();
    },
    restoreThis() {
      this.setTargetInfo(this.recordIdx);
    },
    restorePrev() {
      this.setTargetInfo(this.recordIdx - 1);
    },
    restoreNext() {
      this.setTargetInfo(this.recordIdx + 1);
    },
    restoreLast() {
      this.setTargetInfo(this.record.length - 1);
    },
    setTargetInfo(idx) {
      const temp = idx > -1 && idx < this.record.length ? this.record[idx].value : null;

      if (!temp) return;

      this.recordIdx = idx;
      this.$emit('input', deepCopy(temp));

      if (this.callback) this.callback(temp);
    },
  },
};
</script>
