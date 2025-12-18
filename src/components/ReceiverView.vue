<template>
  <div class="bg-white p-4 rounded-2xl w-5/6 h-5/6 grid grid-cols-2">
    <div class="sender-list border-r w-1/3">
      <ul>
        <li v-for="(sender, i) in senderList" :key="i"
          @click="currentSender == i ? currentSender = undefined : currentSender = i"
          :class="{ active: currentSender === i }" class="cursor-pointer p-2">
          {{ sender }}
        </li>
      </ul>
      <p v-if="senderList.length === 0">暂无在线发送者...</p>
    </div>

    <div class="display-area">
      <div v-if="currentSender !== undefined">
        <h3>正在接收 [{{ currentSenderName }}] 二维码:</h3>
        <div class="qr-content" v-if="lastQrData">
          <a-qrcode :value="lastQrData" />
          <div class=" mt-3">接收时间: {{ lastQrTime }}</div>
        </div>
        <div v-else>等待扫码...</div>
      </div>
      <div v-else>
        请先在左侧选择一个发送者进入房间
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import socket from '../socket.ts';
import router from '../router';

const senderList = ref<string[]>([]);
const currentSender = ref<number | undefined>();
const currentSenderName = ref<string>('');
const lastQrData = ref('');
const lastQrTime = ref('');

watch(currentSender, (newVal) => {
  // 离开旧房间
  if (currentSenderName.value !== '') {
    socket.emit('leaveRoom', currentSenderName.value);
  }
  if (newVal === undefined) {
    currentSenderName.value = '';
    return;
  }
  currentSenderName.value = senderList.value[newVal] ?? '';
  // 加入新房间
  socket.emit('joinRoom', currentSenderName.value, (response: { data: string, timestamp: number }) => {
    lastQrData.value = response.data;
    lastQrTime.value = new Date(response.timestamp).toLocaleString();
  });
});

onMounted(() => {
  // 如果没有建立连接，重定向到login页
  if (!socket.connected) {
    router.replace('/');
    return;
  }
  // 请求当前在线发送者列表
  socket.emit('fetchSenderList', (response: { senders: string[] }) => {
    senderList.value = response.senders;
  });

  // 监听列表更新
  socket.on('newSender', (name: string) => {
    if (!senderList.value.includes(name)) {
      senderList.value.push(name);
    }
  });

  socket.on('removeSender', (name: string) => {
    senderList.value = senderList.value.filter(sender => sender !== name);
    // 如果当前房间的发送者下线，清空显示
    if (currentSenderName.value === name) {
      currentSender.value = undefined;
    }
  });

  // 监听二维码数据
  socket.on('qrCode', (data, senderName) => {
    console.log("Received QR code from ", senderName, data);
    if (senderName !== currentSenderName.value) {
      console.log("QR code sender does not match current sender, ignoring.");
      return;
    }
    lastQrData.value = data;
    lastQrTime.value = new Date().toLocaleString();
  });
});


onUnmounted(() => {
  socket.disconnect();
});
</script>

<style scoped>
.active {
  background-color: #e2e2e2;
}

li:hover {
  background-color: #e2e2e2;
}

.qr-content h1 {
  color: #2c3e50;
  font-size: 2em;
  word-break: break-all;
}
</style>