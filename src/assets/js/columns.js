import regexConfig from '@/store/regex.js';
import { getTypeConstraint } from '@/assets/js/options.js';
import { thousandSeparator } from '@/assets/js/helper.js';

export const checkConditionDisplay = (columnsByKey, fields, rootList, rootLogic) => {
  if (!Array.isArray(rootList) || !rootList.length) return true;

  let flag = rootLogic === 'or' ? false : true;

  for (let i = 0; i < rootList.length; i++) {
    const { triggerId, state, value, list, logic: groupLogic } = rootList[i];

    const selfFlag = checkDisplayState(columnsByKey, fields, triggerId, state, value);

    let tempFlag = selfFlag;

    if (Array.isArray(list) && list.length) {
      const groupFlag = checkConditionDisplay(columnsByKey, fields, list, groupLogic);

      if (groupLogic === 'or') {
        tempFlag = tempFlag || groupFlag;
      } else {
        tempFlag = tempFlag && groupFlag;
      }
    }

    if (rootLogic === 'or') {
      flag = flag || tempFlag;
    } else {
      flag = flag && tempFlag;
    }

    if (!flag) return false;
  }

  return flag;
};
export const checkDisplayState = (columnsByKey, fields, triggerId, state = null, value = null) => {
  const triggerColumn = columnsByKey[triggerId];
  if (!triggerColumn) return true;

  const triggerValue = fields[triggerId].value;

  switch (state) {
    // 有效的
    case null: {
      return checkRule(columnsByKey, fields, triggerId).flag;
    }
    // 空值
    case '0': {
      return triggerValue == null || triggerValue === '';
    }
    // 不為空
    case '1': {
      return triggerValue != null && triggerValue !== '';
    }
    // 符合其一
    case 'mo': {
      return Array.isArray(value) && value.length
        ? value.some((v) => (Array.isArray(triggerValue) ? triggerValue.includes(v) : triggerValue === v))
        : false;
    }
    // 符合全部
    case 'ma': {
      return Array.isArray(value) && value.length
        ? value.every((v) => (Array.isArray(triggerValue) ? triggerValue.includes(v) : triggerValue === v))
        : false;
    }
    // Is
    case 'is': {
      return triggerValue === value;
    }
    // Is not
    case 'nis': {
      return triggerValue !== value;
    }
    // Contains
    case 'ct': {
      return triggerValue?.includes(value);
    }
    // Does not contain
    case 'nct': {
      return !triggerValue?.includes(value);
    }
    // Starts with
    case 'sw': {
      return triggerValue?.startsWith(value);
    }
    // Starts with
    case 'ew': {
      return triggerValue?.endsWith(value);
    }
    // equal (=)
    case 'eq': {
      return triggerValue === value;
    }
    // not equal (!=)
    case 'neq': {
      return triggerValue !== value;
    }
    // greater then (>)
    case 'gt': {
      return triggerValue > value;
    }
    // less then (<)
    case 'lt': {
      return triggerValue < value;
    }
    // greater then or equal (>=)
    case 'ge': {
      return triggerValue >= value;
    }
    // less then or equal (<=)
    case 'le': {
      return triggerValue <= value;
    }
  }
};

export const errorMsg = {
  required: `[:name] 為必填。`,
  sameAs: `[:name] 與 [:sameAsName] 不相符。`,
  regex: `[:name] 格式驗證失敗。`,
  min: {
    text: `[:name] 最少 [:min] 個字。`,
    number: `[:name] 最少 [:min]。`,
    date: `[:name] 不得小於 [:min]。`,
    option: `[:name] 最少選 [:min] 個。`,
  },
  max: {
    text: `[:name] 最少 [:max] 個字。`,
    number: `[:name] 最多 [:max]。`,
    date: `[:name] 不得大於 [:max]。`,
    option: `[:name] 最多選 [:max] 個。`,
  },
};

export const getErrorMsg = (msg, { name, sameAsName, min, max } = {}) => {
  if (!msg) return '';

  let temp = msg.replace(':name', name);
  if (sameAsName != null) temp = temp.replace(':sameAsName', sameAsName);
  if (min != null) temp = temp.replace(':min', thousandSeparator(min));
  if (max != null) temp = temp.replace(':max', thousandSeparator(max));

  return temp;
};

export const processRule = (columnsByKey, fields, id) => {
  // 防呆
  if (!columnsByKey || !fields || !id) return true;

  const { flag, errorMsg } = checkRule(columnsByKey, fields, id);
  fields[id].error = errorMsg;

  if (fields[id].requiredSync?.length) {
    fields[id].requiredSync.forEach((cid) => {
      const { errorMsg } = checkRule(columnsByKey, fields, cid);
      fields[cid].error = errorMsg;
    });
  }

  return flag;
};

export const checkRule = (columnsByKey, fields, id) => {
  // 防呆
  if (!columnsByKey || !fields || !id) return { flag: true, errorMsg: null };

  // 取得欄位設定資訊
  const column = columnsByKey[id];

  // 判斷是否有規則設定
  if (!column.rule) return { flag: true, errorMsg: null };

  const value = fields[id].value; // 欄位值
  const name = column.name || id; // 欄位名稱
  const typeConstraint = getTypeConstraint(column.type); // 欄位屬性約束
  const ruleMsg = column.rule.msg || {}; // 自定義錯誤訊息

  console.log('[checkRule]', name, value);

  let next = true;
  let msg = '';

  // 解構規則設定
  const { required, requiredPassive, min, max, regex, sameAs } = column.rule;

  // 檢查 - 必填
  if (next) {
    // 自身必填檢查
    let needRequired = required;
    if (!needRequired && requiredPassive?.length) {
      // requiredPassive 被其他欄位連動必填 (自身必填檢查)
      needRequired = requiredPassive.some((cid) => {
        const targetValue = fields[cid].value;
        const hasValue = Array.isArray(targetValue) ? !targetValue.length : targetValue != null && targetValue !== '';
        return hasValue && checkRule(columnsByKey, fields, cid).flag;
      });
    }

    if (needRequired && (value == null || value === '' || (Array.isArray(value) && !value.length))) {
      next = false;
      msg = getErrorMsg(ruleMsg['required'] || errorMsg['required'], { name });
    }
  }

  // (通過必填檢查，但無資料，不進行後續檢查。)
  // if (next && value == null) return { flag: true, errorMsg: null };

  // 檢查 - 上下限
  if (next && value) {
    // 文字
    if (typeConstraint.isText) {
      // 字元下限
      if (min && min > value.length) {
        next = false;
        msg = getErrorMsg(ruleMsg['min'] || errorMsg['min']['text'], { name, min });
      }
      // 字元上限
      if (max && max < value.length) {
        next = false;
        msg = getErrorMsg(ruleMsg['max'] || errorMsg['max']['text'], { name, max });
      }
    }
    // 數字
    else if (typeConstraint.isNumber) {
      // 數字下限
      if (min && min > value) {
        next = false;
        msg = getErrorMsg(ruleMsg['min'] || errorMsg['min']['number'], { name, min });
      }
      // 數字上限
      if (max && max < value) {
        next = false;
        msg = getErrorMsg(ruleMsg['max'] || errorMsg['max']['number'], { name, max });
      }
    }
    // 日期
    else if (typeConstraint.isDate) {
      const valueDateTime = new Date(value).getTime();
      // 日期下限
      if (min && new Date(min).getTime() > valueDateTime) {
        next = false;
        msg = getErrorMsg(ruleMsg['min'] || errorMsg['min']['date'], { name, min });
      }
      // 日期上限
      if (max && new Date(max).getTime() < valueDateTime) {
        next = false;
        msg = getErrorMsg(ruleMsg['max'] || errorMsg['max']['date'], { name, max });
      }
    }
    // 選擇數量
    else if (column.base?.multiple && Array.isArray(value)) {
      // 選擇數量下限
      if (min && min > value.length) {
        next = false;
        msg = getErrorMsg(ruleMsg['min'] || errorMsg['min']['option'], { name, min });
      }
      // 選擇數量上限
      if (max && max < value.length) {
        next = false;
        msg = getErrorMsg(ruleMsg['max'] || errorMsg['max']['option'], { name, max });
      }
    }
  }

  // 檢查 - Regex
  if (next && value && regex) {
    if (!new RegExp(regexConfig[regex].pattern, 'gi').test(value)) {
      next = false;
      msg = getErrorMsg(ruleMsg['regex'] || errorMsg['regex'], { name });
    }
  }

  // 檢查 - 與..相符
  if (next && sameAs) {
    const sameAsColumn = columnsByKey[sameAs];
    const sameAsValue = fields[sameAs].value;
    if (sameAsColumn) {
      if (column.base?.multiple && Array.isArray(value)) {
        if (value.length !== sameAsValue.length) next = false;
        if (!value.every((v) => sameAsValue.includes(v))) next = false;
      } else {
        if (value !== sameAsValue) next = false;
      }

      if (!next) {
        const sameAsName = sameAsColumn.name || sameAs;
        msg = getErrorMsg(ruleMsg['sameAs'] || errorMsg['sameAs'], { name, sameAsName });
      }
    }
  }

  return { flag: next, errorMsg: msg };
};
