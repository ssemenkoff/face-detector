import commonjs from '@rollup/plugin-commonjs';
import vue from 'rollup-plugin-vue';
import { default as VueI18nPlugin } from '../../../packages/rollup-plugin-vue-i18n/lib/index';
import postcss from 'rollup-plugin-postcss';
import nodeResolve from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';
import replace from '@rollup/plugin-replace';

export default {
  input: 'src/wrapper.js', // Путь до относительного package.json
  output: {
    name: 'FaceDetector',
    file: "dist/bundle.js",
    exports: 'named'
  },
  plugins: [
    replace({
      'process.env.NODE_ENV': JSON.stringify( 'production' )
    }),
    vue({
      customBlocks: ['i18n'],
      defaultLang: {
        i18n: 'i18n'
      }
    }),
    commonjs(),
    json(),
    VueI18nPlugin({}),
    nodeResolve({
      browser: true
    }),
    postcss({
      extract: true
    }),
  ],
};