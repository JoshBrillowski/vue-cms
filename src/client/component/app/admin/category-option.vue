<template>
  <div>
    <el-select
      v-model="selectValue"
      placeholder="select..."
      class="uk-width-1-1"
    >
      <el-option
        v-for="item in options"
        :key="item.value"
        :label="item.label"
        :value="item.value"
      />
    </el-select>
  </div>
</template>
<script>
import _ from 'lodash';
import config from '../../../config';

const { db } = config;

export default {
  name: 'AppCategoryOption',
  props: {
    value: {
      type: Number,
      default: db.rootId,
    },
  },
  data() {
    return {
      options: [],
      selectValue: db.rootId,
    };
  },
  watch: {
    value() {
      this.selectValue = this.value;
    },
    selectValue() {
      this.$emit('input', this.selectValue);
    },
  },
  created() {
    const { Category } = this.$store.getters;
    Category.query().then((res) => {
      const categories = res.data.items;
      const idMap = { null: { children: [] } };
      _.each(categories, (category) => {
        idMap[category.id] = category;
        category.children = [];
      });
      _.each(categories, (category) => {
        const pid = category.parent_id;
        idMap[pid].children.push(category);
      });
      const root = idMap.null.children[0];

      const options = [];
      let split = '';
      const grnOptions = (node, subOptions) => {
        subOptions.push({
          label: `${split} ${node.title}`,
          value: node.id,
        });
        split += '|—';
        _.each(node.children, (child) => {
          const parentSplit = split;
          grnOptions(child, subOptions);
          split = parentSplit;
        });
      };
      grnOptions(root, options);
      this.options = options;
    });
  },
};
</script>
<style lang="scss" scoped>
</style>
