import Vue from 'vue'
import App from './App.vue'
import './assets/styles/index.css';
import FaceDetection from './plugins/FaceDetection';
import VueI18n from 'vue-i18n'
import config from './config'

Vue.config.productionTip = false

Vue.use(FaceDetection);
Vue.use(VueI18n);
Vue.prototype.$setConfig = function (extConfig) { 
  console.log(this);
  this.$data.$config = { ...config, ...extConfig }
}

const i18n = new VueI18n({
  locale: 'ru',
})

const app = new Vue({
  i18n,
  render: h => h(App),
}).$mount('#app')

app.$setConfig();
