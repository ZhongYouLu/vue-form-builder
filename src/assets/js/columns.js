import regexConfig from '@/store/regex.js';
import { getTypeConstraint } from '@/assets/js/options.js';

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
  let errorMsg = '';

  // 解構規則設定
  const { required, requiredPassive, minimum, maximum, least, most, regex, sameAs } = column.rule;

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
      errorMsg = ruleMsg['required'] || `[${name}] 為必填。`;
    }
  }

  // (通過必填檢查，但無資料，不進行後續檢查。)
  // if (next && value == null) return { flag: true, errorMsg: null };

  // 檢查 - 上下限
  if (next && value) {
    // 文字
    if (typeConstraint.isText) {
      // 字元下限
      if (minimum && minimum > value.length) {
        next = false;
        errorMsg = (ruleMsg['minimum'] || `[${name}] 最少 [:min] 個字。`).replace('[:min]', minimum);
      }
      // 字元上限
      if (maximum && maximum < value.length) {
        next = false;
        errorMsg = (ruleMsg['maximum'] || `[${name}] 最多 [:max] 個字。`).replace('[:max]', maximum);
      }
    }
    // 數字
    else if (typeConstraint.isNumber) {
      // 數字下限
      if (minimum && minimum > value) {
        next = false;
        errorMsg = (ruleMsg['minimum'] || `[${name}] 最少 [:min]。`).replace('[:min]', minimum);
      }
      // 數字上限
      if (maximum && maximum < value) {
        next = false;
        errorMsg = (ruleMsg['maximum'] || `[${name}] 最多 [:max]。`).replace('[:max]', maximum);
      }
    }
    // 日期
    else if (typeConstraint.isDate) {
      const valueDateTime = new Date(value).getTime();
      // 日期下限
      if (minimum && new Date(minimum).getTime() > valueDateTime) {
        next = false;
        errorMsg = (ruleMsg['minimum'] || `[${name}] 不得小於 [:min]。`).replace('[:min]', minimum);
      }
      // 日期上限
      if (maximum && new Date(maximum).getTime() < valueDateTime) {
        next = false;
        errorMsg = (ruleMsg['maximum'] || `[${name}] 不得大於 [:max]。`).replace('[:max]', maximum);
      }
    }
    // 選擇數量
    else if (column.base?.multiple && Array.isArray(value)) {
      // 選擇數量下限
      if (least && least > value.length) {
        next = false;
        errorMsg = (ruleMsg['least'] || `[${name}] 最少選 [:least]。`).replace('[:least]', least);
      }
      // 選擇數量上限
      if (most && most < value.length) {
        next = false;
        errorMsg = (ruleMsg['most'] || `[${name}] 最多選 [:most]。`).replace('[:most]', most);
      }
    }
  }

  // 檢查 - Regex
  if (next && value && regex) {
    if (!new RegExp(regexConfig[regex].pattern, 'gi').test(value)) {
      next = false;
      errorMsg = ruleMsg['regex'] || `[${name}] 格式驗證失敗。`;
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
        errorMsg = ruleMsg['sameAs'] || `[${name}] 與 [${sameAsName}] 不相符。`;
      }
    }
  }

  return { flag: next, errorMsg };
};
