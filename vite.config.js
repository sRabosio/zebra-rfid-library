import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { flowPlugin, esbuildFlowPlugin } from "@bunchtogether/vite-plugin-flow";
import { viteCommonjs, esbuildCommonjs } from "@originjs/vite-plugin-commonjs";
import babel from "vite-plugin-babel";
import commonjs from "@rollup/plugin-commonjs";
import requireTransform from "vite-plugin-require-transform";

// https://vitejs.dev/config/
export default defineConfig({
  optimizeDeps: {
    esbuildOptions: {
      plugins: [esbuildCommonjs(["react-s3"]), esbuildFlowPlugin()],
    },
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
      exclude: [
        "node_modules/lodash-es/**",
        "node_modules/@types/lodash-es/**",
      ],
    },
  },
  server: {
    port: 10300,
    https: false,
    strictPort: true,
    open: false,
    host: "rfid.it-sol.it",
    watch: {
      ignored: ["!eb.it-sol/**"],
    },
  },
  plugins: [
    react(),
    flowPlugin(),
    babel({
      babelConfig: {
        babelrc: true,
        configFile: false,
      },
    }),
    requireTransform({}),
    viteCommonjs(),
    commonjs(),
  ],
});
