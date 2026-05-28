import { defineConfig } from 'vite';
import browserslist from 'browserslist';
import { browserslistToTargets } from 'lightningcss';
import browserslistToEsbuild from 'browserslist-to-esbuild';
import solid from 'vite-plugin-solid';
import { fileURLToPath, URL } from 'node:url';

const browsers = browserslist();

export default defineConfig({
    cacheDir: '.vite',
    server: {
        // auto-open the default browser on server start
        open: true,
        // if 5173 is in use, fail instead of picking another port
        strictPort: true,
        // listen on this port
        port: 5173,
    },
    preview: { port: 4173 },
    plugins: [solid()],
    css: {
        transformer: 'lightningcss',
        lightningcss: {
            targets: browserslistToTargets(browsers),
            drafts: {
                customMedia: true,
            },
        },
    },
    build: {
        target: browserslistToEsbuild(browsers),
        sourcemap: true,
        cssMinify: 'lightningcss',
        minify: 'oxc', // use 'terser' for max compression
    },
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
});
