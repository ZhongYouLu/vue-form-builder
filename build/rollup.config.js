// rollup.config.js
import fs from 'fs';
import path from 'path';
import vue from 'rollup-plugin-vue';
import alias from '@rollup/plugin-alias';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import babel from '@rollup/plugin-babel';
import { terser } from 'rollup-plugin-terser';
import css from 'rollup-plugin-css-only';
import minimist from 'minimist';
import { external, globals } from './declination.js';
import pkg from '../package.json';

const { name, version } = pkg;
const prod = process.env.PRODUCTION;
//const mode = prod ? 'production' : 'development';

// Get browserslist config and remove ie from es build targets
const esbrowserslist = fs
  .readFileSync('./.browserslistrc')
  .toString()
  .split('\n')
  .filter((entry) => entry && entry.substring(0, 2) !== 'ie');

// Convert kebab-case to camelCase
const camelize = (s) => s.replace(/-./g, (x) => x[1].toUpperCase());

// Convert kebab-case to Capital
const capitalize = (s) => {
  const temp = camelize(s);
  return temp[0].toUpperCase() + temp.substring(1);
};

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
    postVue: [css({ output: `${name}.css` })],
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
      name: capitalize(name),
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
      name: capitalize(pkg.name),
      exports: 'auto',
      globals,
      banner:
        '/*!\n' +
        ` * ${name} v${version} | MIT License | https://github.com/{author}/{repo}\n` +
        ` * https://unpkg.com/${name}@${version}/${pkg.unpkg}\n` +
        ' */',
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
