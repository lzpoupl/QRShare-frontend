<template>
  <div class="flex flex-col bg-white p-4 rounded-2xl w-2/3 h-1/4 resp">
    <p class="text-center">二维码系统登录</p>
    <div class="flex-auto mb-1">
      <a-input v-model:value="username" size="large" placeholder="用户名" />
    </div>

    <div class="flex">
      <a-radio-group v-model:value="role" class="flex-auto">
        <a-radio-button value="receiver">接收者</a-radio-button>
        <a-radio-button value="sender">发送者</a-radio-button>
      </a-radio-group>

      <span>{{ error }}</span>
      <a-button type="primary" @click="handleLogin()">登录</a-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import socket from '../socket.ts';
import { message } from 'ant-design-vue';

const username = ref('');
const role = ref('receiver'); // 默认接收者
const error = ref('');
const router = useRouter();

onMounted(() => {
  socket.connect();
});

const handleLogin = () => {
  if (!username.value) {
    error.value = '用户名不能为空';
    return;
  }

  // 发送登录请求
  socket.emit('login', { username: username.value, role: role.value }, (response: { success: boolean }) => {
    if (response.success === true) {
      if (role.value === 'sender') {
        router.replace('/sender');
      } else {
        router.replace('/receiver');
      }
    } else {
      message.error("登录失败！")
    }
  });
};
</script>

<style>
.resp {
  @media (width >=64rem) {
    width: 33%;
  }

  @media (height <=32rem) {
    height: fit-content;
  }
}
</style>