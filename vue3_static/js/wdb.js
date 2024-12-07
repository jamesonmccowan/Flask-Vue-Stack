import * as THREE from './../lib/three/three.module.js';
import * as view from './three/view.js';

const loader = new THREE.TextureLoader();

const loadModule = window['vue3-sfc-loader'].loadModule;

const moduleOptions = {
  moduleCache: {
    vue: Vue,
  },
  getFile(url) {
    return fetch(url).then((resp) =>
      resp.ok ? resp.text() : Promise.reject(resp)
    );
  },
  addStyle(styleStr) {
    const style = document.createElement('style');
    style.textContent = styleStr;
    const ref = document.head.getElementsByTagName('style')[0] || null;
    document.head.insertBefore(style, ref);
  },
  log(type, ...args) {
    console.log(type, ...args);
  },
};

const app = Vue.createApp({
}).mount('#app');
