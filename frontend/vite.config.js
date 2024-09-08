import { fileURLToPath, URL } from 'node:url'
import { createHtmlPlugin } from 'vite-plugin-html'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode, isSsrBuild, isPreview }) => {
    return {
        server: {
            port: 43431,
            proxy: { '/api': { target: 'http://localhost:43430', changeOrigin: true, secure: false, ws: true } },
        },
        build: {
            input: { app: 'src/main.js' },
            cssCodeSplit: false,
            rollupOptions: {
                lib: {
                    entry: 'src/main.js',
                    formats: [ 'iife' ],
                    name: 'main',
                    fileName: 'public.js'
                },
                output: {
                    manualChunks: false,
                    inlineDynamicImports: true,
                    entryFileNames: '[name].js',
                    assetFileNames: '[name].[ext]',
                }
            },
            copyPublicDir: true,
            assetsDir: 'src/assets',
            outDir: 'dist',
        },
        plugins: [
            vue(),
            createHtmlPlugin({
                minify: true,
                inject: {
                    injectScript: 'public.js',
                    injectCss: 'public.css'
                },
            }),
        ],
        resolve: {
            alias: {
                '@': fileURLToPath(new URL('./src', import.meta.url))
            }
        },
    };
})
