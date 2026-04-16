<template>
  <div class="schedules-view">
    <!-- Toolbar con dos botones -->
    <pv-toolbar class="toolbar">
      <template #start>
        <h2>Schedules</h2>
      </template>
      <template #end>
        <button @click="createNewSchedule" class="add-button">Add New Schedule</button>
        <button @click="activateAllSprinklers" class="sprinkler-button">Activate Sprinklers</button>
      </template>
    </pv-toolbar>

    <!-- Divider -->
    <br />
    <pv-divider class="divider" />

    <!-- Lista de Schedules -->
    <div class="content">
      <ScheduleListComponent />
    </div>
  </div>
</template>

<script>
import ScheduleListComponent from './ScheduleListComponent.vue';
import Swal from 'sweetalert2';

export default {
  name: 'SchedulesViewComponent',
  components: {
    ScheduleListComponent,
  },
  data() {
    return {
      progress: 0,
      intervalId: null,
    };
  },
  methods: {
    createNewSchedule() {
      this.$router.push({ name: 'scheduleform' });
    },
    activateAllSprinklers() {
      this.progress = 0;
      this.showProgressToast();
      this.animateProgress();
    },
    animateProgress() {
      this.intervalId = setInterval(() => {
        if (this.progress < 100) {
          this.progress += 10;
          this.updateToast();
        } else {
          clearInterval(this.intervalId);
          Swal.close();
        }
      }, 500);
    },
    showProgressToast() {
      Swal.fire({
        title: 'Sprinklers Activated!',
        html: `All sprinklers that operate manually will be activated until the expected moisture level is reached. <br><br> Progress: <strong id="progress-value">${this.progress}%</strong>`,
        icon: 'info',
        timer: 10000,
        timerProgressBar: true,
        didOpen: () => {
          Swal.showLoading();
        },
        willClose: () => {
          clearInterval(this.intervalId);
        },
      });
    },
    updateToast() {
      const progressElement = Swal.getHtmlContainer()?.querySelector('#progress-value');
      if (progressElement) {
        progressElement.textContent = `${this.progress}%`;
      }
    },
  },
};
</script>

<style scoped>

.schedules-view {
  flex: auto;
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  padding: 10px;
}

.toolbar h2 {
  margin: 0;
  font-size: 24px;
  color: #12723d;
}

.add-button,
.sprinkler-button {
  padding: 10px 20px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s ease;
  margin-left: 10px;
}

.add-button:hover,
.sprinkler-button:hover {
  background-color: #45a049;
}

pv-divider {
  color: #12723d;
}

.content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.content > * {
  width: 100%;
}
</style>
