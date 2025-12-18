import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import fs from "fs";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), tailwindcss()],
  server: {
    https: {
      key: fs.readFileSync(path.resolve(__dirname, "certs/server.key")),
      cert: fs.readFileSync(path.resolve(__dirname, "certs/server.crt")),
    },
    host: true, // 允许局域网访问
    port: 5173, // 自定义端口
    proxy: {
      // 1. 匹配所有以 '/socket.io' 开头的请求路径
      "/socket.io": {
        // 2. 代理目标地址 (后台接口地址)
        target: "https://localhost:3000",

        // 3. 允许跨域 (改变请求头中的 Origin 字段)
        changeOrigin: true,
      },
    },
  },
});
