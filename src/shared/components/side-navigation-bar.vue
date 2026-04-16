<template>
  <div :class="['side-nav', { collapsed: isCollapsed, 'is-mobile': isMobile }]">
    <!-- Logo, Title and Collapsed Icon -->
    <div class="logo-container">
      <img src="@/assets/images/logo.jpeg" alt="ThirstySeed Logo" class="logo" />
      <span v-if="!isCollapsed" class="logo-title">Thirsty Seed</span>
      <button class="toggle-button" v-if="!isCollapsed" @click="toggleSidebar">
        <i class="pi pi-bars"></i>
      </button>
    </div>

    <hr class="divider" />

    <!-- Collapsed button-->
    <button v-if="isCollapsed" class="toggle-button collapsed" @click="toggleSidebar">
      <i class="pi pi-bars"></i>
    </button>

    <!-- Navegación con soporte para i18n -->
    <ul>
      <li
          v-for="item in items"
          :key="item.label"
          :class="{ active: activeItem === item.label }"
          @click="selectItem(item.label)"
      >
        <RouterLink :to="item.to" class="nav-link">
          <i :class="getIconClass(item.label)" class="nav-icon"></i>
          <span v-if="!isCollapsed">{{ $t(item.label) }}</span>
        </RouterLink>
      </li>
    </ul>

    <!-- Botón de cambio de idioma -->
    <div class="language-toggle">
      <span class="language-label">Inglés</span>
      <label class="switch">
        <input type="checkbox" :checked="!isEnglish" @change="toggleLanguage" />
        <span class="slider"></span>
      </label>
      <span class="language-label">Español</span>
    </div>

    <!-- Logout -->
    <div class="logout">
      <RouterLink to="/" @click.prevent="handleLogout" class="nav-link logout-link">
        <i class="pi pi-sign-out nav-icon"></i>
        <span v-if="!isCollapsed">{{ $t('logout') }}</span>
      </RouterLink>
    </div>
  </div>
</template>

<script>
import { useI18n } from 'vue-i18n';
import { watch, ref, onMounted, onBeforeUnmount, computed } from 'vue';
import { useRoute } from 'vue-router';
import { plotService } from "@/plot/services/plot.service.js";

export default {
  name: 'SideNavigationBar',
  setup() {
    const { locale } = useI18n();
    const route = useRoute();

    const isCollapsed = ref(false);
    const isMobile = ref(window.innerWidth <= 768);
    const activeItem = ref('manage_parcels');
    const isEnglish = ref(true);
    const firstPlotId = ref(null);

    // Función para obtener el primer plotId
    const fetchFirstPlotId = async () => {
      try {
        const userId = localStorage.getItem('userId');
        if (!userId) return;

        const response = await plotService.getPlotsByUserId(userId);
        const plots = response.data;
        if (plots.length > 0) {
          firstPlotId.value = plots[0].id;
        }
      } catch (error) {
        console.error("Error al obtener los datos del primer plot:", error);
      }
    };

    // Computed para actualizar los ítems con el plotId
    const items = computed(() => [
      { label: 'manage_parcels', to: '/manage-parcels' },
      { label: 'view_parcels_status', to: firstPlotId.value ? `/plot-status/${firstPlotId.value}` : '/manage-parcels' },
      { label: 'scheduled_irrigations', to: '/schedule' },
      //{ label: 'irrigation_reports', to: '/irrigation-reports' },
      { label: 'account', to: '/account' },
      { label: 'support', to: '/support' }
    ]);

    // Función para actualizar isMobile al redimensionar la ventana
    const handleResize = () => {
      isMobile.value = window.innerWidth <= 768;
    };

    onMounted(() => {
      fetchFirstPlotId();
      window.addEventListener('resize', handleResize);
      locale.value = 'en';
      isEnglish.value = true;
      setActiveItemFromRoute();
    });

    onBeforeUnmount(() => {
      window.removeEventListener('resize', handleResize);
    });

    const setActiveItemFromRoute = () => {
      const currentPath = route.path;
      const activeMenuItem = items.value.find(item => item.to === currentPath);
      activeItem.value = activeMenuItem ? activeMenuItem.label : '';
    };

    watch(
        () => route.path,
        () => setActiveItemFromRoute(),
        { immediate: true }
    );

    return {
      locale,
      isCollapsed,
      isMobile,
      activeItem,
      isEnglish,
      items,
      setActiveItemFromRoute
    };
  },
  methods: {
    toggleSidebar() {
      this.isCollapsed = !this.isCollapsed;
      this.$emit('toggle-collapse');
    },
    selectItem(label) {
      this.activeItem = label;
    },
    getIconClass(label) {
      switch (label) {
        case 'manage_parcels':
          return 'pi pi-folder';
        case 'view_parcels_status':
          return 'pi pi-eye';
        case 'scheduled_irrigations':
          return 'pi pi-calendar';
        case 'irrigation_reports':
          return 'pi pi-file';
        case 'notifications':
          return 'pi pi-bell';
        case 'account':
          return 'pi pi-user';
        case 'support':
          return 'pi pi-info-circle';
        default:
          return '';
      }
    },
    toggleLanguage() {
      this.isEnglish = !this.isEnglish;
      this.$i18n.locale = this.isEnglish ? 'en' : 'es';
      localStorage.setItem('preferredLanguage', this.$i18n.locale);
    },
    handleLogout() {
      localStorage.removeItem('authToken');
      this.$router.push('/sign-in');
    }
  }
};
</script>

<style scoped>

li.active .nav-link {
  background-color: #dfffda;
  color: #2b9846; /* Asegúrate de que el color se aplica para el texto */
}

.side-nav {
  width: 250px;
  background-color: #ffffff;
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  box-shadow: 2px 0px 5px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.side-nav.collapsed {
  width: 80px;
}

.logo-container {
  display: flex;
  align-items: center;
  padding: 15px;
  text-align: left;
}

.logo {
  max-width: 40px;
  margin-right: 10px;
}

.logo-title {
  color: #2b9846;
  font-size: 18px;
  font-weight: bold;
  flex-grow: 1;
}

.toggle-button {
  background: none;
  border: none;
  color: #2b9846;
  font-size: 24px;
  margin-left: auto;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
}

.toggle-button.collapsed {
  margin: 0;
  width: 100%;
  padding: 10px 0;
  justify-content: center;
}

.divider {
  border: none;
  border-bottom: 2px solid #2b9846;
  margin: 10px 0;
}

ul {
  list-style: none;
  padding: 0;
  margin: 0;
  flex-grow: 1;
}

li {
  margin: 15px 0;
}

.nav-link {
  text-decoration: none;
  color: #2b9846;
  font-weight: normal;
  display: flex;
  align-items: center;
  padding: 10px 20px;
}

.nav-icon {
  margin-right: 10px;
  font-size: 20px;
}

li.active .nav-link {
  background-color: #dfffda;
}

/* Estilos para el toggle button de idioma */
.language-toggle {
  padding: 10px 20px;
  text-align: left;
  display: flex;
  align-items: center;
}

.switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
  margin-right: 10px; /* Espacio entre el botón y la etiqueta */
}

.switch input {
  opacity: 0; /* Esconde el checkbox */
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc; /* Color de fondo por defecto */
  transition: .4s;
  border-radius: 34px; /* Bordes redondeados */
}

.slider:before {
  position: absolute;
  content: "";
  height: 26px;
  width: 26px;
  left: 4px;
  bottom: 4px;
  background-color: white; /* Color del círculo */
  border-radius: 50%; /* Círculo perfecto */
  transition: .4s;
}

input:checked + .slider {
  background-color: #4caf50; /* Color cuando está ON */
}

input:checked + .slider:before {
  transform: translateX(26px); /* Mueve el círculo hacia la derecha */
}

.language-label {
  color: #2b9846;
  font-weight: bold; /* Estilo de la etiqueta de idioma */
}

.language-toggle .language-label:first-child {
  margin-right: 10px; /* Ajusta este valor según el espacio que necesites */
}

.logout {
  margin-top: auto;
  padding-bottom: 20px;
}

.logout-link {
  color: #2b9846;
}

.side-nav.is-mobile {
  width: 80px;
}

@media (max-width: 768px) {
  .side-nav {
    width: 80px;
  }

  .side-nav.collapsed {
    width: 80px;
  }

  .side-nav .toggle-button {
    display: none;
  }
}
</style>
