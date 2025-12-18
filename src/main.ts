import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import router from "./router/index.js";
import "ant-design-vue/dist/reset.css";
import { Button, Input, QRCode, Radio, Slider } from "ant-design-vue";

createApp(App)
.use(Button)
.use(router)
.use(Radio)
.use(Input)
.use(Slider)
.use(QRCode)
.mount("#app");
