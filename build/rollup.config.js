// rollup.config.js
import fs from 'fs';
import path from 'path';
import babel from '@rollup/plugin-babel'; // babel外掛用於處理es6程式碼的轉換，使轉換出來的程式碼可以用於不支援es6的環境使用
import resolve from '@rollup/plugin-node-resolve'; // resolve將我們編寫的原始碼與依賴的第三方庫進行合併
import commonjs from '@rollup/plugin-commonjs'; // 解決rollup.js無法識別CommonJS模組
import replace from '@rollup/plugin-replace'; // 全域性替換變數比如process.env
import alias from '@rollup/plugin-alias';
import { terser } from 'rollup-plugin-terser'; // 壓縮打包程式碼
import vue from 'rollup-plugin-vue';
import css from 'rollup-plugin-css-only';
import minimist from 'minimist';
import { pascalify } from './lib/helpers.js';
import { external, globals } from './declination.js';
import pkg from '../package.json';

const { name: pkgName, version, repository, license } = pkg;
const outputName = pascalify('form-builder');

const prod = process.env.PRODUCTION;
//const mode = prod ? 'production' : 'development';

const banner =
  '/*!\n' +
  ` * ${pkgName} v${version} | ${license} License | ${repository.url}\n` +
  //` * https://unpkg.com/${pkgName}@${version}/${pkg.unpkg}\n` +
  ' */';

// Get browserslist config and remove ie from es build targets
const esbrowserslist = fs
  .readFileSync('./.browserslistrc')
  .toString()
  .split('\n')
  .filter((entry) => entry && entry.substring(0, 2) !== 'ie');

const argv = minimist(process.argv.slice(2));

const projectRoot = path.resolve(__dirname, '..');

const baseConfig = {
  input: 'src/entry.js',
  plugins: {
    preVue: [
      alias({
        entries: [
          {
            find: '@',
            replacement: `${path.resolve(projectRoot, 'src')}`,
          },
        ],
        customResolver: resolve({
          extensions: ['.js', '.jsx', '.ts', '.tsx', '.vue'],
        }),
      }),
    ],
    replace: {
      'process.env.NODE_ENV': JSON.stringify(prod ? 'production' : 'development'),
    },
    vue: {
      css: false,
      template: {
        isProduction: true,
      },
    },
    postVue: [css({ output: 'main.css' })],
    babel: {
      exclude: 'node_modules/**',
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.vue'],
      babelHelpers: 'bundled',
    },
  },
};

// Customize configs for individual targets
const buildFormats = [];
if (!argv.format || argv.format === 'es') {
  const esConfig = {
    ...baseConfig,
    input: 'src/entry.esm.js',
    external,
    output: {
      file: pkg.module,
      format: 'esm',
      exports: 'named',
    },
    plugins: [
      replace({ ...baseConfig.plugins.replace }),
      ...baseConfig.plugins.preVue,
      vue({
        ...baseConfig.plugins.vue,
      }),
      ...baseConfig.plugins.postVue,
      babel({
        ...baseConfig.plugins.babel,
        presets: [
          [
            '@babel/preset-env',
            {
              targets: esbrowserslist,
            },
          ],
        ],
      }),
      commonjs(),
    ],
  };
  buildFormats.push(esConfig);
}

if (!argv.format || argv.format === 'cjs') {
  const umdConfig = {
    ...baseConfig,
    external,
    output: {
      compact: true,
      file: pkg.main,
      format: 'cjs',
      name: outputName,
      exports: 'auto',
      globals,
    },
    plugins: [
      replace({ ...baseConfig.plugins.replace }),
      ...baseConfig.plugins.preVue,
      vue({
        ...baseConfig.plugins.vue,
        template: {
          ...baseConfig.plugins.vue.template,
          optimizeSSR: true,
        },
      }),
      ...baseConfig.plugins.postVue,
      babel({ ...baseConfig.plugins.babel }),
      commonjs(),
    ],
  };
  buildFormats.push(umdConfig);
}

if (!argv.format || argv.format === 'iife') {
  const unpkgConfig = {
    ...baseConfig,
    external,
    output: {
      compact: true,
      file: pkg.unpkg,
      format: 'iife',
      name: outputName,
      exports: 'auto',
      globals,
      banner,
    },
    plugins: [
      replace({ ...baseConfig.plugins.replace }),
      ...baseConfig.plugins.preVue,
      vue({ ...baseConfig.plugins.vue }),
      ...baseConfig.plugins.postVue,
      babel({ ...baseConfig.plugins.babel }),
      commonjs(),
      terser({
        output: {
          ecma: 5,
        },
      }),
    ],
  };
  buildFormats.push(unpkgConfig);
}

// Export config
export default buildFormats;
