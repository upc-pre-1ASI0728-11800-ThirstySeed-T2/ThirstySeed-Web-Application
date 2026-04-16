<template>
  <div class="schedule-form">
    <!-- Div contenedor para el dropdown -->
    <div class="dropdown-container">
      <label for="plot" class="dropdown-label">Select plot: <br/></label>
      <br/>
      <select id="plot" v-model="scheduleData.plotId" @change="updatePlotDetails" class="full-width-dropdown">
        <option value="" disabled>Select a plot</option>
        <option v-for="plot in plots" :key="plot.id" :value="plot.id">
          {{ plot.name }}
        </option>
      </select>
    </div>

    <!-- Datos del Plot + Toggle -->
    <div class="plot-info-row">
      <div class="plot-info">
        <img :src="selectedPlot?.imageUrl || 'https://via.placeholder.com/300'" alt="Plot image" class="plot-image" />
        <div>
          <h3>{{ selectedPlot?.name || 'Select a plot' }}</h3>
          <p>Size: {{ selectedPlot?.size || 'N/A' }} m²</p>
          <p>Location: {{ selectedPlot?.location || 'N/A' }}</p>
          <p>Status: {{ selectedPlot?.status || 'N/A' }}</p>
        </div>
      </div>
      <div class="toggle-container">
        <label>Automatic Water:</label>
        <label class="switch">
          <input type="checkbox" v-model="scheduleData.isAutomatic" @change="toggleAutomaticMode" />
          <span class="slider"></span>
        </label>
        <br/>
        <div class="button-group">
          <button @click="save">Save</button>
          <button @click="cancel">Cancel</button>
        </div>
      </div>
    </div>

    <!-- Formulario principal en dos columnas -->
    <div class="form-body">
      <div class="column">
        <div class="form-group">
          <label>Expected Moisture (%)</label>
          <input type="number" v-model.number="scheduleData.expectedMoisture" :disabled="scheduleData.isAutomatic" class="styled-input" />
        </div>
        <div class="form-group">
          <label>Water Amount (l)</label>
          <input type="number" v-model.number="scheduleData.waterAmount" :disabled="scheduleData.isAutomatic" class="styled-input" />
        </div>
        <div class="form-group">
          <label>Estimated Time (h)</label>
          <input type="number" v-model.number="scheduleData.estimatedTimeHours" :disabled="scheduleData.isAutomatic" class="styled-input" />
        </div>
      </div>
      <div class="column">
        <div class="form-group">
          <label>Set Time (hh:mm AM/PM)</label>
          <input type="text" v-model="scheduleData.setTime" :disabled="scheduleData.isAutomatic" class="styled-input" />
        </div>
        <div class="form-group">
          <label>Sprinkler Radius (m)</label>
          <input type="number" v-model.number="scheduleData.sprinklerRadius" :disabled="scheduleData.isAutomatic" class="styled-input" />
        </div>
        <div class="form-group">
          <label>Angle (degrees)</label>
          <input type="number" v-model.number="scheduleData.angle" :disabled="scheduleData.isAutomatic" class="styled-input" />
        </div>
        <div class="form-group">
          <label>Pressure (bar)</label>
          <input type="number" v-model.number="scheduleData.pressure" :disabled="scheduleData.isAutomatic" class="styled-input" />
        </div>
      </div>
    </div>
  </div>
</template>


<script lang="ts">
import { defineComponent } from 'vue';
import PlotService from '../services/plot-service.ts';
import ScheduleService from '../services/schedule-service.ts';
import type { Plot } from '../models/Plot';
import type { Schedule } from '../models/Schedule';

export default defineComponent({
  name: 'ScheduleFormComponent',
  data() {
    return {
      plots: [] as Plot[],
      selectedPlot: null as Plot | null,
      isEditMode: false,
      scheduleData: {
        plotId: null,
        expectedMoisture: 40,
        waterAmount: 500,
        estimatedTimeHours: 3,
        sprinklerRadius: 7,
        setTime: '08:15 PM',
        angle: 30,
        pressure: 50,
        isAutomatic: false,
      } as Schedule,
    };
  },
  methods: {
    async getAllPlots() {
      try {
        this.plots = await PlotService.getPlotsByCurrentUser();
      } catch (error) {
        console.error('Error al obtener las parcelas:', error);
      }
    },
    updatePlotDetails() {
      this.selectedPlot = this.plots.find(plot => plot.id === this.scheduleData.plotId) || null;
    },
    toggleAutomaticMode() {
      if (this.scheduleData.isAutomatic) {
        this.scheduleData = {
          ...this.scheduleData,
          expectedMoisture: 70,
          waterAmount: 500,
          estimatedTimeHours: 3,
          sprinklerRadius: 7,
          setTime: '08:15 PM',
          angle: 30,
          pressure: 50,
        };
      }
    },
    async save() {
      try {
        const scheduleData: Schedule = { ...this.scheduleData };
        if (this.isEditMode && this.scheduleData.id) {
          await ScheduleService.updateSchedule(String(this.scheduleData.id), scheduleData);
        } else {
          delete scheduleData.id;
          await ScheduleService.createSchedule(scheduleData);
        }
        this.$router.push({ name: 'schedule' });
      } catch (error) {
        console.error('Error al guardar el schedule:', error);
      }
    },
    cancel() {
      this.$router.push({ name: 'schedule' });
    },
  },
  mounted() {
    this.getAllPlots();
    const scheduleId = this.$route.params.id;
    if (scheduleId) {
      this.isEditMode = true;
      ScheduleService.getScheduleById(scheduleId)
        .then(schedule => {
          this.scheduleData = schedule;
          this.updatePlotDetails();
        })
        .catch(error => {
          console.error('Error al cargar el schedule:', error);
        });
    } else {
      this.isEditMode = false;
    }
  },
});
</script>

<style scoped>
/* General */
.schedule-form {
  color: #2b9846;
  flex: auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
  height: 100vh;
  font-family: 'Poppins', sans-serif;
}

/* Dropdown */
.dropdown-container {
  position: sticky;
  top: 0;
  z-index: 10;
  background-color: #ffffff;
  padding: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.dropdown-label {
  font-weight: bold;
}

.full-width-dropdown {
  width: 100%;
  padding: 10px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: #fff;
}

/* Toggle Switch */
.switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
}

.switch input {
  opacity: 0;
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
  background-color: #ccc;
  transition: 0.4s;
  border-radius: 34px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 26px;
  width: 26px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: 0.4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #28a745;
}

input:checked + .slider:before {
  transform: translateX(26px);
}

.slider:hover {
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
}

/* Plot Information */
.plot-info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  background-color: #f8f8f8;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.plot-info {
  display: flex;
  gap: 20px;
}

.plot-image {
  width: 20vw;
  object-fit: cover;
  border-radius: 8px;
}

.toggle-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* Formulario */
.form-body {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.column {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-weight: bold;
  margin-bottom: 5px;
}

.styled-input {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

/* Botones */
.button-group {
  display: flex;
  gap: 10px;
}

.button-group button {
  padding: 10px 20px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-size: 14px;
}

.button-group button:first-of-type {
  background-color: #28a745;
  color: white;
}

.button-group button:last-of-type {
  background-color: #dc3545;
  color: white;
}
</style>

