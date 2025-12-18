<template>
  <div id="app" class="flex h-screen w-screen justify-center items-center">
    <router-view />
  </div>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router';
import socket from './socket.ts'; // 引入 socket 实例

const router = useRouter();
const currentRoute = useRoute(); // 用于判断当前路由

</script>

<style>
#app {
  background-color: #eee;
}
</style>