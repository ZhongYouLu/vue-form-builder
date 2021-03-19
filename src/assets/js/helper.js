// https://github.com/ai/nanoid
export const nanoid = (t = 21) => {
  let e = '',
    r = crypto.getRandomValues(new Uint8Array(t));
  for (; t--; ) {
    let n = 63 & r[t];
    e += n < 36 ? n.toString(36) : n < 62 ? (n - 26).toString(36).toUpperCase() : n < 63 ? '_' : '-';
  }
  return e;
};

// 千位符
export const thousandSeparator = (val) => {
  if (!val) return val;
  const parts = val.toString().split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
  // return Number(val).toLocaleString();
};

// If you use JavaScript according to ECMAScript 2020 or later, see optional chaining.
export const getSafe = (fn, defaultVal) => {
  try {
    return fn ? fn() : defaultVal;
  } catch (e) {
    return defaultVal;
  }
};

// 深拷貝
export const deepCopy = (obj) => {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }
  if (obj instanceof Date) {
    return new Date(obj.getTime());
  }
  if (obj instanceof Array) {
    return obj.reduce((arr, item, i) => {
      arr[i] = deepCopy(item);
      return arr;
    }, []);
  }
  if (obj instanceof Object) {
    return Object.keys(obj).reduce((newObj, key) => {
      newObj[key] = deepCopy(obj[key]);
      return newObj;
    }, {});
  }
};

// obj Array 轉 obj
export const arr2ObjByKey = (arr, key = 'id') => {
  return arr.reduce((acc, obj) => {
    const v = obj[key];
    if (!v) return acc;
    acc[v] = acc[v] ? { ...acc[v], ...obj } : obj;
    return acc;
  }, {});
};

// nested obj 轉 key-value pairs
export const nested2Pairs = (obj, propKey) => {
  return Object.entries(obj).reduce((acc, [k, v]) => ({ ...acc, [k]: v[propKey] }), {});
};

// key-value pairs 轉 obj Array
export const pairs2Arr = (obj, vKey, kKey = 'id') => {
  return Object.entries(obj).reduce((acc, [k, v]) => acc.concat({ [kKey]: k, [vKey]: v }), []);
};

// obj 轉 obj Array
export const obj2Arr = (obj, vKeys = [], kKey = 'id') => {
  return Object.entries(obj).reduce((acc, [k, v]) => {
    return acc.concat(vKeys.reduce((tempObj, key) => ({ ...tempObj, [key]: v[key] }), { [kKey]: k }));
  }, []);
};

export function isEmpty(obj) {
  // null and undefined are "empty"
  if (obj == null) return true;

  // it's a number
  if (typeof obj === 'number') return false;

  // Assume if it has a length property with a non-zero value
  // that that property is correct.
  if (obj.length > 0) return false;
  if (obj.length === 0) return true;

  // If it isn't an object at this point
  // it is empty, but it can't be anything *but* empty
  // Is it empty?  Depends on your application.
  if (typeof obj !== 'object') return true;

  // Otherwise, does it have any properties of its own?
  // Note that this doesn't handle
  // toString and valueOf enumeration bugs in IE < 9
  for (var key in obj) {
    if (hasOwnProperty.call(obj, key)) return false;
  }

  return true;
}

export function clearEmpties(obj) {
  Object.entries(obj).forEach(
    ([key, val]) =>
      (val && typeof val === 'object' && clearEmpties(val)) ||
      (val && val instanceof File) ||
      (isEmpty(val) && delete obj[key])
  );

  return isEmpty(obj) ? null : obj;
}

// eslint-disable-next-line no-unused-vars
export const removeProperty = (propKey, { [propKey]: propValue, ...rest }) => rest;

export function arrRemoveValue(arr, val) {
  return arr.filter((item) => item !== val);
}

export function arrRemoveValueByKey(arr, key, val) {
  return arr.filter((obj) => obj[key] !== val);
}

export function arrRemoveByIdx(arr, idx) {
  const length = arr.length;
  if (idx === 0) {
    arr = arr.slice(1);
  } else if (idx === length - 1) {
    arr = arr.slice(0, length - 1);
  } else {
    arr = [...arr.slice(0, idx), ...arr.slice(idx + 1)];
  }
  return arr;
}

export function arrRemoveItem(arr, val) {
  const idx = arr.findIndex((item) => item === val);
  return arrRemoveByIdx(arr, idx);
}

export function arrRemoveItemByKey(arr, key, val) {
  const idx = arr.findIndex((obj) => obj[key] === val);
  return arrRemoveByIdx(arr, idx);
}

export function arrUpdateItemByKey(array, key, val, newObj) {
  const idx = array.findIndex((obj) => obj[key] === val);
  return idx >= 0 ? [...array.slice(0, idx), { ...array[idx], ...newObj }, ...array.slice(idx + 1)] : array;
}

export const intersection = (arr1, arr2) => arr1.filter((x) => arr2.includes(x));
export const difference = (arr1, arr2) => arr1.filter((x) => !arr2.includes(x));
export const symmetricDifference = (arr1, arr2) => difference(arr1, arr2).concat(difference(arr2, arr1));
