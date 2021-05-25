import { obj2Arr, nested2Pairs, pairs2Arr } from '@/assets/js/helper.js';

export const convertOptions = (obj) => pairs2Arr(obj, 'text', 'id');

// https://www.w3schools.com/tags/tag_input.asp
export const typeConfig = {
  text: { text: '文字框', icon: 'carbon:string-text' },
  number: { text: '數字框', icon: 'carbon:string-integer' },
  date: { text: '日期框', icon: 'carbon:calendar' },
  radio: { text: '單選框', icon: 'carbon:radio-button-checked' },
  checkbox: { text: '勾選框', icon: 'carbon:checkbox-checked' },
  select: { text: '下拉選單', icon: 'carbon:list' },
  // file: { text: '檔案', icon: 'ic:baseline-attach-file' },
};
export const typeOptions = obj2Arr(typeConfig, ['text', 'icon'], 'id');
export const typeIcons = {
  ...nested2Pairs(typeConfig, 'icon'),
  undefined: 'carbon:unknown',
};

// https://developer.mozilla.org/zh-TW/docs/Web/HTML/Element/input
export const subTypeConfig = {
  // text: { text: '文字', icon: 'carbon:string-text' }, // default
  tel: { text: '電話', icon: 'carbon:phone' },
  email: { text: '信箱', icon: 'carbon:email' },
  password: { text: '密碼', icon: 'carbon:password' },
  url: { text: '網址', icon: 'mdi:web' },
  // 其他
  // search: { text: '搜尋', icon: 'carbon:search' },
};
export const subTypeOptions = obj2Arr(subTypeConfig, ['text', 'icon'], 'id');

export const getTypeConstraint = (type) => {
  const base = {
    isText: type === 'text',
    isNumber: type === 'number',
    isDate: type === 'date',
    isRadio: type === 'radio',
    isCheckbox: type === 'checkbox',
    isSelect: type === 'select',
    isFile: type === 'file',
  };
  return {
    ...base,
    isInput: base.isText || base.isNumber || base.isDate,
    needOptions: base.isSelect || base.isCheckbox || base.isRadio,
    canMultiple: base.isSelect || base.isCheckbox,
    filterSame: (columns) => columns.filter((c) => c.type === type),
  };
};

// https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#autofilling-form-controls:-the-autocomplete-attribute
export const autocompleteOptions = convertOptions({
  // off: '關閉', // default
  name: '姓名',
  email: '信箱',
  tel: '電話',
  'street-address': '地址',
  username: '帳號',
  'current-password': '密碼',
  'new-password': '新密碼',
  // organization: '組織',
  // 'organization-title': '職稱',
});

export const autocompleteSectionOptions = convertOptions({
  billing: '訂購',
  shipping: '收件',
});
