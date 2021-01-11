<template>
  <div class="w-full h-full bg-black flex items-center justify-center flex-col">
    <div class="relative">
      <video
        ref="webcamStream"
        autoplay
        playsinline
        width
        height
        style="transform: scaleX(-1)"
      />
      <div class="absolute w-full h-full top-0 left-0">
        <svg viewBox="0 0 1000 100" preserveAspectRatio="xMidYMid slice" class="h-full w-full">
          <mask id="mask" x="0" y="0" width="80" height="30">
            <rect x="0" y="0" width="1000" height="100" fill="#fff"/>    
            <ellipse id="elipse" :ry="ellipseRY" :rx="ellipseRX" cy="50" cx="500" />
          </mask>
          <rect x="0" y="0" width="1000" height="100" mask="url(#mask)" fill-opacity="0.7"/>    
        </svg>
      </div>
    </div>
    <div class="text-white text-center w-full">
      {{ $t(message) }}
    </div>
  </div>
</template>

<script>
let continuosDetectionsCount = 0;

export default {
  props: {
    threshold: {
      type: Number,
      required: true,
    },
    margin: {
      type: Number,
      default: 0.05,
    },
    cMargin: {
      type: Number,
      default: 0.1,
    },
    reqDetectionCount: {
      type: Number,
      default: 3,
    }
  },
  data() {
    return {
      canvas: null,
      processingInterval: null,
      message: 'place_face',
    }
  },
  async mounted() {
    continuosDetectionsCount = 0;
    this.canvas = document.createElement('canvas');
    this.canvas.width = 640;
    this.canvas.height = 480;

    const stream = await navigator.mediaDevices.getUserMedia({video: true, audio: false});
    navigator.mediaDevices.getUserMedia({video: true, audio: false});
    this.$refs.webcamStream.srcObject = stream;
    await this.loadCascade();

    this.processingInterval = setInterval(() => {
      const det = this.processImage();
      continuosDetectionsCount = this.confirmDetection(det) ? continuosDetectionsCount + 1 : 0;
      if (continuosDetectionsCount === this.reqDetectionCount) {
        this.$emit('FaceCaptured', this.getCurrentImage());
      }
    }, 100);
  },
  destroyed() {
    clearInterval(this.processingInterval);
  },
  methods: {
    getCurrentImage() {
      return this.canvas.toDataURL();
    },
    async loadCascade() {
      await this.$faceDetector.initialize(this.$root.$data.$config.facefinderCascadeUrl);
    },
    processImage() {
      return this.$faceDetector.processImage(this.canvas.getContext('2d'), this.$refs.webcamStream);
    },
    confirmDetection(det) {
      if (!det) {
        this.message = 'place_face';
        return false;
      }

      if (det[0] >= 480 * (0.5 + this.cMargin) || det[0] <= 480 * (0.5 - this.cMargin)) {
        return false;
      }
      const detRadius = det[2];
      if (detRadius >= 480 * (this.threshold + this.margin)) {
        this.message = 'move_further';
        return false;
      }
      if (detRadius <= 480 * (this.threshold - this.margin)) {
        this.message = 'move_closer';
        return false;
      }
      this.message = 'stand_still';
      return true;
    },
  },
  computed: {
    ellipseRX() {
      return this.threshold * 50;
    },
    ellipseRY() {
      return this.ellipseRX * 1.2;
    },
  }
}
</script>

<i18n>
{
  "en": {
    "place_face": "Place your face in the circle",
    "move_further": "Move further from the camera",
    "move_closer": "Move closer to the camera",
    "stand_still": "Stand still"
  },
  "ru": {
    "place_face": "Поместите лицо в овал",
    "move_further": "Отдалитесь от камеры",
    "move_closer": "Приблизьтесь к камере",
    "stand_still": "Не двигайтесь"
  }
}
</i18n>