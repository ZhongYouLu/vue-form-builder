<template>
  <div>
    <template v-if="root">
      <ul class="folders">
        <Recursive
          v-for="child in children"
          v-bind="$attrs"
          :id="child.id"
          :key="child.id"
          :children.sync="child.children"
          @remove="$emit('remove', child.id)"
        >
          <template v-for="(_, slot) in $scopedSlots" #[slot]="props">
            <slot :name="slot" v-bind="props" />
          </template>
        </Recursive>
      </ul>
      <Button icon="mdi:plus" block type="dashed" @click="addItem" />
    </template>

    <li v-else class="folder" :class="[leaf ? 'is-leaf' : 'is-folder']">
      <span @click="expand">{{ id }}</span>
      <Button :icon="leaf ? 'mdi:toggle-switch-off' : 'mdi:toggle-switch'" type="flat" @click="toggleGroups" />
      <Button icon="mdi:delete" type="flat" @click="$emit('remove', id)" />
      <slot :id="id" :props="$attrs" :updateItem="updateItem">
        <!-- {{ children }} -->
      </slot>

      <ul v-if="hasChildren" v-show="expanded" class="sub-folders">
        <Recursive
          v-for="child in children"
          v-bind="$attrs"
          :id="child.id"
          :key="child.id"
          :children.sync="child.children"
          @remove="removeItem"
        >
          <template v-for="(_, slot) in $scopedSlots" #[slot]="props">
            <slot :name="slot" v-bind="props" />
          </template>
        </Recursive>
      </ul>
      <div v-else v-show="!leaf && expanded" class="folder-empty">No Data</div>
      <Button v-if="expanded && children" icon="mdi:plus" block type="dashed" @click="addItem" />
    </li>
  </div>
</template>

<script>
import Button from '@/components/ui/Button';
import { nanoid, arrRemoveValueByKey, arrUpdateItemByKey } from '@/assets/js/helper.js';

export default /*#__PURE__*/ {
  name: 'Recursive',
  components: {
    Recursive: () => import('@/components/ui/Recursive'),
    Button,
  },
  inject: ['handleConfirm'],
  inheritAttrs: false,
  props: {
    id: { type: String, default: null },
    children: { type: Array, default: null },
    // ------------------------
    root: { type: Boolean, default: null },
  },
  $emits: ['remove'],
  data() {
    return {
      expanded: false,
    };
  },
  computed: {
    mutableChildren: {
      get() {
        return this.children;
      },
      set(val) {
        this.$emit('update:children', val);
      },
    },
    leaf() {
      return !this.children;
    },
    hasChildren() {
      return !this.leaf && this.children.length;
    },
  },
  methods: {
    expand() {
      if (this.leaf) {
        return;
      }

      this.expanded = !this.expanded;
    },
    toggleGroups: function () {
      const allowFunc = () => {
        this.mutableChildren = this.leaf ? [] : null;
      };
      const showMsg = `確定${this.leaf ? '轉為' : '取消'}群組?`;

      if (this.handleConfirm) {
        this.handleConfirm(showMsg, allowFunc);
      } else {
        if (confirm(showMsg)) allowFunc();
      }
    },
    addItem() {
      this.mutableChildren.push({ id: nanoid(6) });
    },
    updateItem(id, newObj) {
      newObj = arrUpdateItemByKey(this.mutableChildren, 'id', id, newObj);
      console.log(id, this.mutableChildren, newObj);
      this.mutableChildren = newObj;
    },
    removeItem(id) {
      const allowFunc = () => {
        this.mutableChildren = arrRemoveValueByKey(this.mutableChildren, 'id', id);
      };
      const showMsg = `確定刪除顯示條件 #${id}?`;

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
ul {
  padding-left: 1em;
  line-height: 1.5em;
  list-style-type: dot;

  &.folders {
    box-sizing: border-box;
    margin: 0;
    padding: 1rem;
    width: 100%;
    list-style: none;

    & > li:first-child {
      padding: 1rem 1rem 1rem 0;
    }
  }

  .sub-folders {
    box-sizing: border-box;
    margin: 0;
    padding: 1rem 1rem 0 0;
    width: 100%;
    list-style: none;
  }
}

li {
  &.is-folder {
    padding: 1rem;
    border-left: 1px solid #d3d3d3;
    margin-bottom: 0.5rem;

    > span {
      padding: 0.5rem;
      border: 1px solid #d3d3d3;
      cursor: pointer;
      display: inline-block;
    }
  }

  &.is-leaf {
    padding: 0 0 0 1rem;
    color: #000;
  }
}
div.folder-empty {
  padding: 1rem 1rem 0 1rem;
  color: #000;
  opacity: 0.5;
}
</style>
