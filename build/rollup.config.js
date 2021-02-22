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
import PurgeIcons from 'rollup-plugin-purge-icons';
import minimist from 'minimist';
import pkg from '../package.json';
import { pascalify } from './lib/helpers.js';
// import { external, globals } from './declination.js';

const argv = minimist(process.argv.slice(2));
const { PRODUCTION } = process.env;

const PATH_ROOT = path.resolve(__dirname, '..');
const PATH_SRC = path.resolve(PATH_ROOT, 'src').replace(/\\/gi, '/');
const PATH_NODE_MODULES = path.resolve(PATH_ROOT, 'node_modules').replace(/\\/gi, '/');

const { name, globals } = pkg.rollup_config;
const outputName = pascalify(name);
const external = Object.keys(pkg.peerDependencies);

// TODO: use argv
const isSingle = true;
const componentType = isSingle ? 'single' : 'library';
const inputPath = `src/entry/${componentType}/entry.js`;
const inputPath_ESM = `src/entry/${componentType}/entry.esm.js`;

const banner = (outputPath) =>
  '/*!\n' +
  ` * ${pkg.name} v${pkg.version} | ${pkg.license} License | ${pkg.repository.url}\n` +
  ` * https://unpkg.com/${pkg.name}@${pkg.version}/${outputPath}\n` +
  ' */';
// Get browserslist config and remove ie from es build targets
const esbrowserslist = fs
  .readFileSync('./.browserslistrc')
  .toString()
  .split('\n')
  .filter((entry) => entry && entry.substring(0, 2) !== 'ie');

const baseConfig = {
  input: inputPath,
  preserveModules: false,
  plugins: {
    preVue: [
      alias({
        entries: [
          {
            find: '@',
            replacement: PATH_SRC,
          },
        ],
        customResolver: resolve({
          extensions: ['.js', '.jsx', '.ts', '.tsx', '.vue'],
        }),
      }),
    ],
    replace: {
      'process.env.NODE_ENV': JSON.stringify(PRODUCTION ? 'production' : 'development'),
    },
    vue: {
      css: false,
      data: {
        // This helps to inject variables in each <style> tag of every Vue SFC
        scss: () => `@import "@/assets/scss/utils.scss";`,
        sass: () => `@import "@/assets/scss/utils.scss"`,
      },
      style: {
        preprocessOptions: {
          scss: {
            importer: [
              function (url, _prev) {
                return {
                  file: url.replace(/^~/, `${PATH_NODE_MODULES}/`).replace(/^@/, PATH_SRC), // ain't pretty, it can be easily improved
                };
              },
            ],
          },
        },
      },
      template: {
        isProduction: true,
      },
    },
    postVue: [
      css({ output: 'main.css' }),
      PurgeIcons({
        /* PurgeIcons Options */
      }),
    ],
    babel: {
      exclude: 'node_modules/**',
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.vue'],
      babelHelpers: 'bundled',
    },
  },
};

// Customize configs for individual targets
const buildFormats = [];
if (!argv.format || argv.format === 'esm') {
  const esConfig = {
    ...baseConfig,
    input: inputPath_ESM,
    external,
    output: {
      file: pkg.module,
      format: 'esm',
      exports: 'named',
      banner: banner(pkg.module),
    },
    plugins: [
      replace(baseConfig.plugins.replace),
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

const umdConfig = {
  ...baseConfig,
  external,
  output: {
    file: pkg.main,
    format: 'umd',
    exports: 'auto',
    name: outputName,
    globals,
    compact: true,
    banner: banner(pkg.main),
  },
  plugins: [
    replace(baseConfig.plugins.replace),
    ...baseConfig.plugins.preVue,
    vue({
      ...baseConfig.plugins.vue,
    }),
    ...baseConfig.plugins.postVue,
    babel({
      ...baseConfig.plugins.babel,
    }),
    commonjs(),
  ],
};

if (!argv.format || argv.format === 'umd') {
  buildFormats.push(umdConfig);
}

if (!argv.format || argv.format === 'unpkg') {
  const unpkgConfig = {
    ...umdConfig,
    output: {
      ...umdConfig.output,
      file: pkg.unpkg,
      banner: banner(pkg.unpkg),
    },
    plugins: [
      ...umdConfig.plugins,
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
