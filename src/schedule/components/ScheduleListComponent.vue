<template>
  <div class="schedule-grid">
    <!-- Mensaje cuando no hay schedules -->
    <div v-if="schedules.length === 0" class="no-schedules-message">
      🌱 Aún no tienes riegos planificados, ¡programa uno ahora! 🌞
    </div>

    <!-- Lista de schedules -->
    <ScheduleCardComponent
      v-for="schedule in schedules"
      :key="schedule.id"
      :schedule="schedule"
      @edit="editSchedule"
      @delete="deleteSchedule"
    />
  </div>
</template>

<script>
import ScheduleService from '../services/schedule-service.ts';
import PlotService from '../services/plot-service.ts'; // Importa el servicio del plot
import ScheduleCardComponent from './ScheduleCardComponent.vue';

export default {
  name: 'ScheduleListComponent',
  components: {
    ScheduleCardComponent
  },
  data() {
    return {
      schedules: []
    };
  },
  methods: {
    async loadSchedules() {
      try {
        const schedules = await ScheduleService.getSchedulesByCurrentUser();
        
        const enrichedSchedules = await Promise.all(
          schedules.map(async (schedule) => {
            const plot = await PlotService.getPlotById(schedule.plotId);
            return {
              ...schedule,
              plotName: plot.name
            };
          })
        );

        this.schedules = enrichedSchedules;
      } catch (error) {
        console.error('Error al obtener los schedules o plots:', error);
      }
    },
    editSchedule(schedule) {
      this.$router.push({ name: 'scheduleform', params: { id: schedule.id } });
    },
    deleteSchedule(scheduleId) {
      ScheduleService.deleteSchedule(scheduleId)
        .then(() => {
          this.loadSchedules();
        })
        .catch(error => {
          console.error('Error al eliminar el schedule:', error);
        });
    }
  },
  mounted() {
    this.loadSchedules();
  }
};

</script>

<style scoped>
/* Estilo del contenedor del grid */
.schedule-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); /* Múltiples columnas dinámicas */
  gap: 20px; /* Espaciado entre las tarjetas */
  margin-top: 20px;
}

.no-schedules-message {
  text-align: center;
  font-size: 18px;
  color: #2b9846; /* Verde */
  margin: 20px 0;
  font-weight: bold;
}

@media (max-width: 600px) {
  .schedule-grid {
    grid-template-columns: 1fr; /* Una columna en pantallas pequeñas */
  }
}
</style>
