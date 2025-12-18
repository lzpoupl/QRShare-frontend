<template>
  <div class="bg-white p-4 rounded-2xl w-5/6 h-5/6">
    <div class="status-bar">
      <p>当前监听人数: <strong>{{ listenerCount }}</strong> 人</p>
    </div>

    <div id="reader" class="w-auto h-auto mb-4"></div>
    <span>缩放：</span>
    <a-slider v-model:value="zoomRatio" :min="zoomMin" :max="zoomMax" :step="zoomStep" />
    <a-button v-if="isCameraOn" @click="pauseCamera()" size="large">暂停</a-button>
    <a-button v-else @click="resumeCamera()" size="large">恢复</a-button>
  </div>
</template>

<script setup lang="ts">
import { Html5Qrcode, type CameraDevice } from 'html5-qrcode';
import { onMounted, onUnmounted, ref, watch } from 'vue';
import socket from '../socket.ts';
import router from '../router';

const listenerCount = ref(0);

const cameraSelect = ref(1);
const zoomRatio = ref(1);
const zoomMax = ref(1);
const zoomMin = ref(1);
const zoomStep = ref(0.25);
const isCameraOn = ref(true);
let data = '';

const frameConfig = {
  fps: 10,
  qrbox: { width: 250, height: 250 },
};
const onScanSuccess = (decodedText: string) => {
  if (data === decodedText) {
    return;
  }
  data = decodedText;
  socket.emit('newQRCode', decodedText);
};

watch(zoomRatio, () => {
  setZoom(zoomRatio.value)
})

let setZoom = (_:number) => { };
let resumeCamera = () => { }
let pauseCamera = () => { };

onUnmounted(() => {
  socket.disconnect();
});

onMounted(() => {
  // 如果没有建立连接，重定向到login页
  if (!socket.connected) {
    router.replace('/');
    return;
  }
  socket.on('countUpdate', (count: number) => {
    listenerCount.value = count;
  });
  Html5Qrcode.getCameras().then((devices: CameraDevice[]) => {
    const cameraId = devices[cameraSelect.value]?.id;
    return cameraId
  }).then((cameraId) => {
    const reader: Html5Qrcode = new Html5Qrcode('reader');
    if (!cameraId) {
      throw Error("camera not found")
    }
    reader.start(
      cameraId,
      frameConfig,
      onScanSuccess,
      undefined
    ).then(() => {
      setZoom = (ratio: number) => {
        reader.applyVideoConstraints({
          advanced: [{ zoom: ratio }]
        })
      }
      pauseCamera = () => {
        reader.pause()
        isCameraOn.value = false;
      }
      resumeCamera = () => {
        reader.resume()
        isCameraOn.value = true;
      }
      let zoomAblity = reader.getRunningTrackCameraCapabilities().zoomFeature();
      zoomMax.value = zoomAblity.max()
      zoomMin.value = zoomAblity.min()
      zoomStep.value = zoomAblity.step()
    })
  }).catch((e) => {
    console.error(e)
  });
});

</script>