import FaceDetectionProcess from './components/FaceDetectionProcess.vue';
import './assets/styles/index.css';
import FaceDetection from './plugins/FaceDetection';
import i18n from 'vue-i18n';
import config from './config'

export function install(Vue) {
	if (install.installed) return;
	install.installed = true;
	Vue.use(FaceDetection);
	Vue.use(i18n);
	Vue.component('FaceDetector', FaceDetectionProcess);
	Vue.prototype.$setConfig = function (extConfig) {
		this.$data.$config = { ...config, ...extConfig }
	}
}

const plugin = {
	install
};

let GlobalVue = null;
if (typeof window !== 'undefined') {
	GlobalVue = window.Vue;
} else if (typeof global !== 'undefined') {
	GlobalVue = global.Vue;
}
if (GlobalVue) {
	GlobalVue.use(plugin);
	console.log('plugin inited');
}

export default FaceDetectionProcess;