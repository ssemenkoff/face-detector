<template>
  <div class="h-full w-full">
    <div
      v-if="state === states.Initial"
      class="h-full w-full flex items-center justify-center flex-col"
    >
      <div class="flex items-center justify-center flex-col flex-grow w-full">
        <div>
          {{ $t('welcome') }}
        </div>
        <button
          class="bg-blue-700 text-white py-2 px-4 rounded m-2"
          @click="startFaceRecognition"
        >
          {{ $t('start_recognition') }}
        </button>
      </div>
      <div class="text-center mb-8">
        <div>
          {{ $t('change_language') }}
        </div>
        <div class="flex justify-between">
          <button
            class="px-4 py-2 rounded m-1"
            :class="$root.$i18n.locale === 'ru' ? 'bg-blue-400' : 'bg-blue-200'"
            @click="$root.$i18n.locale = 'ru'"
          >
            Ru 🇷🇺
          </button>
          <button
            class="px-4 py-2 rounded m-1"
            :class="$root.$i18n.locale === 'en-US' ? 'bg-blue-400' : 'bg-blue-200'"
            @click="$root.$i18n.locale = 'en-US'"
          >
            En 🇬🇧
          </button>
        </div>
      </div>
    </div>
    <div
      v-else-if="state === states.Capture1"
      class="flex h-full w-full bg-black items-center justify-center flex-col"
    >
      <ScreenCaptureContainer
        v-if="!faceImage1"
        :threshold="$root.$data.$config.firstCaptureSize"
        :margin="$root.$data.$config.firstCaptureMargin"
        :req-detection-count="$root.$data.$config.requiredDetectionsCount"
        @FaceCaptured="onFace1Captured"
      />
      <div v-else>
        <img
          :src="faceImage1"
        />
        <div class="text-center mt-2">
          <button
            class="bg-green-700 text-white py-2 px-4 rounded m-2"
            @click="state = states.Capture2"
          >
            {{ $t('continue') }}
          </button>
          <button
            class="bg-red-700 text-white py-2 px-4 rounded m-2"
            @click="faceImage1 = null"
          >
            {{ $t('retake') }}
          </button>
        </div>
      </div>
    </div>
    <div
      v-else-if="state === states.Capture2"
      class="flex h-full w-full bg-black items-center justify-center flex-col"
    >
      <ScreenCaptureContainer
        v-if="!faceImage2"
        :threshold="$root.$data.$config.secondCaptureSize"
        :margin="$root.$data.$config.secondCaptureMargin"
        :req-detection-count="$root.$data.$config.requiredDetectionsCount"
        @FaceCaptured="onFace2Captured"
      />
      <div v-else>
        <img
          :src="faceImage2"
        />
        <div class="text-center mt-2">
          <button
            class="bg-green-700 text-white py-2 px-4 rounded m-2"
            @click="finishProcess"
          >
            {{ $t('continue') }}
          </button>
          <button
            class="bg-red-700 text-white py-2 px-4 rounded m-2"
            @click="faceImage2 = null"
          >
            {{ $t('retake') }}
          </button>
        </div>
      </div>
    </div>
    <div
      v-else-if="state === states.Finished"
      class="flex h-full w-full items-center justify-center flex-col"
    >
      <div>
        {{ $t('process_finished') }}
      </div>
      <div class="flex">
        <img
          class="w-1/2"
          :src="faceImage1"
        />
        <img
          class="w-1/2"
          :src="faceImage2"
        />
      </div>
    </div>
    <div
      v-else-if="state === states.Timeout"
      class="h-full w-full flex items-center justify-center flex-col"
    >
      <div class="flex items-center justify-center flex-col flex-grow w-full">
        <div>
          {{ $t('timeout') }}
        </div>
        <button
          class="bg-blue-700 text-white py-2 px-4 rounded m-2"
          @click="startFaceRecognition"
        >
          {{ $t('restart_recognition') }}
        </button>
      </div>
    </div>
    <div
      v-if="message"
      class="w-full flex fixed top-4 justify-center"
    >
      <div
        class="text-white px-8 py-2 rounded m-2"
        :class="{
          'bg-blue-700': message.type === 'default',
          'bg-green-700': message.type === 'success',
          'bg-red-700': message.type === 'error',
        }"
      >
        {{ $t(message.text) }}
      </div>
    </div>
    <div
      v-if="countDownInterval"
      class="fixed right-4 top-4 bg-red-600 text-white rounded px-4 py-2"
    >
      {{ countDownState }}
    </div>
  </div>
</template>

<script>
import ScreenCaptureContainer from './ScreenCaptureContainer.vue'

const AppStates = {
  Initial: 'Initial',
  Capture1: 'Capture1',
  Capture2: 'Capture2',
  Finished: 'Finished',
  Timeout: 'Timeout',
}

export default {
  name: 'App',
  components: {
    ScreenCaptureContainer
  },
  data() {
    return {
      state: AppStates.Initial,
      states: AppStates,
      message: null,
      faceImage1: null,
      faceImage2: null,
      countDownInterval: null,
      countDownState: null,
    }
  },
  methods: {
    startFaceRecognition() {
      this.startCountDown();
      this.state = AppStates.Capture1
    },
    startCountDown() {
      this.countDownRunning = true;
      const timeoutTimestamp = new Date();
      timeoutTimestamp.setSeconds(timeoutTimestamp.getSeconds() + this.$root.$data.$config.processTimeout);
      const now = new Date().getTime();
      this.countDownState = this.getReadableRemainingTime(timeoutTimestamp, now);

      this.countDownInterval = setInterval(() => {
        const now = new Date().getTime();
        this.countDownState = this.getReadableRemainingTime(timeoutTimestamp, now);

        if (timeoutTimestamp - now < 0) {
          clearInterval(this.countDownInterval);
          this.countDownInterval = null;
          this.onTimeout();
        }
      }, 200);
    },
    // Should be moved to ~/utils/date
    getReadableRemainingTime(timeoutTimestamp, now) {
      const distance = timeoutTimestamp - now;
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      return this.$t('time_left', { minutes, seconds });
    },
    async onFace1Captured(image) {
      this.sendMessage('face_detected', 'success');
      this.faceImage1 = image;
    },
    async onFace2Captured(image) {
      this.sendMessage('face_detected', 'success');
      this.faceImage2 = image;
    },
    sendMessage(message, type = 'default') {
      this.message = {
        text: message,
        type
      };
      setTimeout(() => { this.message = null }, 3000);
    },
    finishProcess() {
      clearInterval(this.countDownInterval);
      this.countDownInterval = null;
      this.state = AppStates.Finished;
    },
    onTimeout() {
      this.state = AppStates.Timeout;
      this.faceImage1 = null;
      this.faceImage2 = null;
      this.message = null;
    },
  },
};
</script>
<i18n>
{
  "en": {
    "welcome": "Welcome",
    "start_recognition": "Start recognition process",
    "face_detected": "Face detected",
    "process_finished": "Face detection process finished",
    "change_language": "Change language",
    "continue": "Continue",
    "retake": "Retake",
    "time_left": "{minutes}m {seconds}s left",
    "timeout": "You have run out of time",
    "restart_recognition": "Try recognition process again"
  },
  "ru": {
    "welcome": "Добро пожаловать",
    "start_recognition": "Начать процесс обнаружения лица",
    "face_detected": "Лицо обнаружено",
    "process_finished": "Процесс обнаружения лица завершен",
    "change_language": "Сменить язык",
    "continue": "Продолжить",
    "retake": "Повторить",
    "time_left": "Осталось {minutes}м {seconds}с",
    "timeout": "Время на прохождение процесса истекло",
    "restart_recognition": "Повторить попытку обнаружения лица"
  }
}
</i18n>