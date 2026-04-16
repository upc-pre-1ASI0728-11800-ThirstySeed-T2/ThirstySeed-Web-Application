import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import PrimeVue from 'primevue/config'
import 'primeicons/primeicons.css'
import 'primeflex/primeflex.css'
import ToastService from 'primevue/toastservice'
import Toolbar from 'primevue/toolbar';
import Divider from 'primevue/divider';
import Toast from 'primevue/toast'
import i18n from '@/i18n';
import 'sweetalert2/dist/sweetalert2.min.css';
const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(i18n);

// PrimeVue Configuration
app.use(PrimeVue)

// Registrar componentes
app.use(ToastService)
app.component('pv-toolbar', Toolbar)
app.component('pv-divider', Divider)
app.component('pv-toast', Toast)
app.mount('#app')
