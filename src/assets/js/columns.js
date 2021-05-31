import { getTypeConstraint } from '@/assets/js/options.js';

export const checkConditionDisplay = (columnsByKey, values, rootList, rootLogic) => {
  if (!Array.isArray(rootList) || !rootList.length) return true;

  let flag = rootLogic === 'or' ? false : true;

  for (let i = 0; i < rootList.length; i++) {
    const { triggerId, state, value, list, logic: groupLogic } = rootList[i];

    const selfFlag = checkDisplayState(columnsByKey, values, triggerId, state, value);

    let tempFlag = selfFlag;

    if (Array.isArray(list) && list.length) {
      const groupFlag = checkConditionDisplay(columnsByKey, values, list, groupLogic);

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
export const checkDisplayState = (columnsByKey, values, triggerId, state = null, value = null) => {
  const triggerColumn = columnsByKey[triggerId];
  if (!triggerColumn) return true;

  const triggerValue = values[triggerId];

  let flag = false;
  switch (state) {
    // 有效的
    case null: {
      flag = checkRule(columnsByKey, values, triggerId).flag;
      break;
    }
    // 空值
    case '0': {
      flag = triggerValue == null || triggerValue === '';
      break;
    }
    // 不為空
    case '1': {
      flag = triggerValue != null && triggerValue !== '';
      break;
    }
    // 符合其一
    case 'mo': {
      flag = (value || []).some((v) => (Array.isArray(triggerValue) ? triggerValue.includes(v) : triggerValue === v));
      break;
    }
    // 符合全部
    case 'ma': {
      flag = (value || []).every((v) => (Array.isArray(triggerValue) ? triggerValue.includes(v) : triggerValue === v));
      break;
    }
    // TODO: ...
  }

  return flag;
};

export const checkRule = (columnsByKey, values, id) => {
  let column;
  try {
    column = columnsByKey[id];
  } catch (error) {
    return { flag: true, errorMsg: null };
  }

  const { name: columnName, type, base, rule } = column;
  if (!rule) return { flag: true, errorMsg: null };

  const typeConstraint = getTypeConstraint(type);
  const { required, requiredPassive, minimum, maximum, least, most, regex, sameAs } = rule;

  const value = values[id];
  const ruleMsg = rule.msg || {};
  const name = columnName || id;
  let next = true;
  let errorMsg = '';

  // 檢查 - 必填
  if (next) {
    // 自身必填檢查
    let needRequired = required;
    if (!needRequired && requiredPassive && requiredPassive.length) {
      needRequired = requiredPassive.some((cid) => {
        var targetValue = values[cid];
        return Array.isArray(targetValue) ? !targetValue.length : targetValue != null && targetValue !== '';
      });
    }

    if (needRequired && (value == null || value === '' || (Array.isArray(value) && !value.length))) {
      next = false;
      errorMsg = ruleMsg['required'] || `[${name}] 為必填。`;
    }
  }

  // (通過必填檢查，但無資料，不進行後續檢查。)
  if (next && value == null) return { flag: true };

  // 檢查 - 上下限
  if (next) {
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
    else if (base.multiple) {
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
  if (next && regex) {
    if (!new RegExp(this.regexConfig[regex].pattern, 'gi').test(value)) {
      next = false;
      errorMsg = ruleMsg['regex'] || `[${name}] 格式驗證失敗。`;
    }
  }

  // 檢查 - 與..相符
  if (next && sameAs) {
    const sameAsColumn = this.columnsByKey[sameAs];
    const sameAsValue = this.values[sameAs];
    if (sameAsColumn) {
      if (!base?.multiple) {
        if (value !== sameAsValue) next = false;
      } else {
        if (value.length !== sameAsValue.length) next = false;
        if (!value.every((v) => sameAsValue.includes(v))) next = false;
      }

      if (!next) {
        const sameAsName = sameAsColumn.name || sameAs;
        errorMsg = ruleMsg['sameAs'] || `[${name}] 與 [${sameAsName}] 不相符。`;
      }
    }
  }

  return { flag: next, errorMsg };
};