<script setup lang="ts">
import './assets/main.css';
import { ref, computed } from 'vue';
import { RouterView, useRoute } from 'vue-router';
import SideNavigationBar from './shared/components/side-navigation-bar.vue';

const route = useRoute();
const isCollapsed = ref(false);
const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value;
};

// Condición para mostrar el sidebar solo si no está en la ruta de login
const showSidebar = computed(() => !['/sign-up', '/sign-in', '/complete-profile', '/plan-selection', '/payment'].includes(route.path));
</script>

<template>
  <!-- Sidebar solo si no está en login -->
  <SideNavigationBar v-if="showSidebar" @toggle-collapse="toggleSidebar" :is-collapsed="isCollapsed" />

  <!-- Ajusta el margen de la main-content dependiendo del estado del sidebar -->
  <div :class="['main-content', { collapsed: isCollapsed, 'no-sidebar': !showSidebar }]">
    <RouterView />
  </div>
</template>

<style scoped>
/* Estilos globales para asegurar que cubran todo el viewport */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body, #app {
  height: 100%;
  width: 100%;
  overflow: hidden;
}

#app {
  display: flex;
  flex-direction: column; /* Ajuste para asegurar que el contenido esté en columna */
}

/* Ajuste principal del contenido */
.main-content {
  transition: margin-left 0.3s ease, padding 0.3s ease;
  padding: 0; /* Asegura que no haya padding adicional */
  margin-left: 250px; /* Ancho inicial del sidebar desplegado */
  width: calc(100% - 250px); /* Ajusta el ancho para ocupar el espacio restante */
  height: 100vh;
}

/* Cuando el sidebar está colapsado */
.main-content.collapsed {
  margin-left: 80px;
  width: calc(100% - 80px);
  padding: 0;
}

/* Cuando no hay sidebar (pantalla de login) */
.main-content.no-sidebar {
  margin-left: 0;
  width: 100%;
  padding: 0;
}

/* Diseño responsivo para pantallas pequeñas */
@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
    padding: 10px;
    width: 100%;
  }
}
</style>