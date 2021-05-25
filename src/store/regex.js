import Vue from 'vue';
import { convertOptions } from '@/assets/js/options.js';
import { difference, nested2Pairs } from '@/assets/js/helper.js';

// https://www.html5pattern.com/
// https://regexr.com/
/* use demo:
    const regex = new RegExp(pattern, flag); // flag:['g', 'i', 'gi']
    const check = regex.test(string);
  */
const regexConfig = {
  tel: { text: '手機', pattern: '^09[0-9]{8}$' },
  date: { text: '日期', pattern: '^((19|20)?[0-9]{2}[- /.](0?[1-9]|1[012])[- /.](0?[1-9]|[12][0-9]|3[01]))$' },
  password: { text: '密碼', pattern: '^(?=.*[a-zA-Z]+)(?=.*\\d+)[a-zA-Z0-9]{8,16}$' },
  chinese: { text: '中文字', pattern: '^[\u4e00-\u9fa5]+$' },
};

const state = Vue.observable({
  regexConfig: regexConfig,
  regexOptions: convertOptions(nested2Pairs(regexConfig, 'text')),
});

// Getters
const getters = {
  regexConfig: () => state.regexConfig,
  regexOptions: () => state.regexOptions,
};

// Mutations
const mutations = {
  addRegex: (val) => {
    state.regexConfig[val] = { text: val, pattern: val };
    state.regexOptions.push({ id: val, text: val });
  },
  updateRegex: (regexValues) => {
    if (Array.isArray(regexValues) && regexValues.length) {
      const newValues = difference(regexValues, Object.keys(state.regexConfig));
      newValues.forEach((val) => mutations.addRegex(val));
    }
  },
};

export default state.regexConfig;
export { getters, mutations };
