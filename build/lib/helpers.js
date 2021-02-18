// Helpers for creating kebab-case/PascalCase versions of string
export const pascalify = (str) => {
  const camelized = str.replace(/-([a-z])/g, (c) => c[1].toUpperCase());
  return camelized.charAt(0).toUpperCase() + camelized.slice(1);
};

export default {
  pascalify,
};
