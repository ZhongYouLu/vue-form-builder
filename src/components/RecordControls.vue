<template>
  <div class="record-controls">
    <slot name="controls" v-bind="scope.controls">
      <div class="x-btn-group">
        <Button v-for="(btn, key) in scope.controls" :key="key" v-bind="btn.attributes" v-on="btn.events" />
      </div>
    </slot>
    <!-- Default Slot -->
    <slot name="msg" v-bind="scope.msg">
      <span v-show="hasThis"> {{ recordIdx + 1 }} / {{ recordLimit }} 筆 : {{ createdTime }} </span>
    </slot>
  </div>
</template>

<script>
import Button from '@/components/ui/Button';
import { deepCopy } from '@/assets/js/helper.js';

export default /*#__PURE__*/ {
  name: 'RecordControls',
  components: {
    Button,
  },
  props: {
    recordName: { type: String, required: true },
    recordLimit: { type: Number, default: 5 },
    value: { type: [String, Number, Boolean, Array, Object, Date, Function, Symbol], required: true },
    immediate: { type: Boolean, default: false },
  },
  emits: ['input', 'record:created', 'record:removed'],
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
      return this.record[this.recordIdx] && this.record[this.recordIdx].createdTime;
    },
    scope() {
      return {
        msg: {
          recordName: this.recordName,
          recordLimit: this.recordLimit,
          value: this.value,
          // ---------------------------
          record: this.record,
          recordIdx: this.recordIdx,
          createdTime: this.createdTime,
          hasThis: this.hasThis,
          hasPrev: this.hasPrev,
          hasNext: this.hasNext,
        },
        controls: {
          addToRecord: {
            attributes: { icon: 'mdi:content-save' },
            events: { click: this.addToRecord },
          },
          restorePrev: {
            attributes: { icon: 'ri:arrow-go-back-fill', disabled: !this.hasPrev },
            events: { click: this.restorePrev },
          },
          restoreNext: {
            attributes: { icon: 'ri:arrow-go-forward-fill', disabled: !this.hasNext },
            events: { click: this.restoreNext },
          },
          restoreThis: {
            attributes: { icon: 'mdi:restore', disabled: !this.hasThis },
            events: { click: this.restoreThis },
          },
          removeRecord: {
            attributes: { icon: 'mdi:trash-can', disabled: !this.hasThis },
            events: { click: this.removeRecord },
          },
        },
      };
    },
  },
  created() {
    this.getRecord();
    this.restoreLast();
  },
  methods: {
    initRecord() {
      this.record = [];
      this.recordIdx = -1;
    },
    getRecord() {
      this.record = JSON.parse(localStorage.getItem(this.recordName)) || [];

      if (!Array.isArray(this.record) || !this.record.length) {
        this.initRecord();

        if (this.immediate) {
          this.addToRecord();
        }
      }
    },
    addToRecord() {
      const newRecord = {
        value: deepCopy(this.value),
        createdTime: new Date().toLocaleString(),
      };
      this.record.push(newRecord);

      if (this.record.length > this.recordLimit) {
        this.record = this.record.slice(0 - this.recordLimit);
      }

      localStorage.setItem(this.recordName, JSON.stringify(this.record));

      this.$emit('record:created', newRecord);

      this.restoreLast();
    },
    removeRecord() {
      if (confirm(`確定清除 [${this.recordName}] 的所有存檔?`)) {
        localStorage.removeItem(this.recordName);

        this.initRecord();
        this.$emit('record:removed');
      }
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
      const targetRecordValue = idx > -1 && idx < this.record.length ? this.record[idx].value : null;

      if (!targetRecordValue) return;

      this.recordIdx = idx;
      this.$emit('input', deepCopy(targetRecordValue));
    },
  },
};
</script>
