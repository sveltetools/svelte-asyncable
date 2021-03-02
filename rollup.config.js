import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import { terser } from 'rollup-plugin-terser';
import sourceMaps from "rollup-plugin-sourcemaps";

import pkg from './package.json';

const extensions = ['.js', '.mjs',];

const pkgname = pkg.name.replace(/^(@\S+\/)?(svelte-)?(\S+)/, '$3');
const clsname = pkgname.replace(/-\w/g, m => m[1].toUpperCase());

const external = [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
];

const appendMin = file => file.replace(/(\.[\w\d_-]+)$/i, '.min$1');
const replaceFilename = (file, name) => file.replace(/(.*)\/.*(\.[\w\d_-]+)/i, `$1/${name}$2`);

const pkgMain = replaceFilename(pkg.main, pkgname);
const pkgModule = replaceFilename(pkg.module, pkgname);

const input = 'src/index.js';

const files = {
    npm: {
        esm: { file: pkg.module, format: 'esm', },
        umd: { file: pkg.main, format: 'umd', name: clsname, },
        esmMin: {
            file: appendMin(pkg.module),
            format: 'esm',
            sourcemap: true,
        },
        umdMin: {
            file: appendMin(pkg.main),
            format: 'umd',
            sourcemap: true,
            name: clsname,
        },
    },
    cdn: {
        esm: { file: pkgModule, format: 'esm', },
        iife: { file: pkgMain, format: 'iife', name: clsname, },
        esmMin: {
            file: appendMin(pkgModule),
            format: 'esm',
            sourcemap: true,
        },
        iifeMin: {
            file: appendMin(pkgMain),
            format: 'iife',
            sourcemap: true,
            name: clsname,
        },
    }
};

const terserConfig = {
    format: {
        comments: false,
    },
};

const cdnPlugins = [
    resolve({ browser: true, extensions, }),
    commonjs({ include: 'node_modules/**', extensions, }),
];

export default [{ // esm && umd bundles for npm/yarn
    input,
    output: [
        files.npm.esm,
        files.npm.umd,
    ],
    external,
}, { // esm && umd bundles for npm/yarn (min)
    input,
    output: [
        files.npm.esmMin,
        files.npm.umdMin,
    ],
    external,
    plugins: [
        sourceMaps(),
        terser(terserConfig),
    ],
}, { // esm bundle for cdn/unpkg
    input,
    output: files.cdn.esm,
    plugins: cdnPlugins,
}, { // iife bundle for cdn/unpkg
    input,
    output: files.cdn.iife,
    plugins: [
        ...cdnPlugins,
        babel({ babelHelpers: 'bundled' }),
    ],
}, { // esm bundle from cdn/unpkg (min)
    input,
    output: files.cdn.esmMin,
    plugins: [
        ...cdnPlugins,
        sourceMaps(),
        terser(terserConfig),
    ],
}, { // iife bundle for cdn/unpkg (min)
    input,
    output: files.cdn.iifeMin,
    plugins: [
        ...cdnPlugins,
        sourceMaps(),
        babel({ babelHelpers: 'bundled' }),
        terser(terserConfig),
    ],
},];