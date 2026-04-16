<template>
  <div class="plots-status">
    <div class="header-container">
      <h1 class="plots-header">{{ $t('plotsStatus.registeredPlots') }}</h1>
      <button class="register-plot-btn" @click="goToRegisterPlot">
        {{ $t('plotsStatus.registerPlot') }}
      </button>
    </div>

    <div v-if="isLoading" class="spinner-container">
      <div class="spinner"></div>
    </div>

    <p v-if="plots && !plots.length" class="no-plots-message">
      {{ $t('plotsStatus.noPlotsRegistered') }}
    </p>

    <div v-else class="plots">
      <div class="plot" v-for="plot in plots" :key="plot.id">
        <!-- Mostrar la imagen -->
        <img
          :src="plot.imageUrl || 'https://via.placeholder.com/150'"
          :alt="`${$t('plotsStatus.imageAlt')} ${plot.name || $t('plotsStatus.notAvailable')}`"
          class="plot-image"
        />

        <div class="plot-details">
          <!-- Campo para editar el enlace de la imagen (solo visible en edición) -->
          <div v-if="plot.isEditing" class="edit-image-url">
            <label>{{ $t('plotsStatus.imageUrl') }}</label>
            <input
              v-model="plot.imageUrl"
              type="text"
              :placeholder="$t('plotsStatus.enterImageUrl')"
              class="edit-input"
            />
          </div>

          <p>
            <strong>{{ $t('plotsStatus.landName') }}:</strong>
            <span v-if="!plot.isEditing">{{ plot.name || $t('plotsStatus.notAvailable') }}</span>
            <input
              v-else
              type="text"
              v-model="plot.name"
              class="edit-input"
              :placeholder="$t('plotsStatus.enterLandName')"
            />
          </p>
          <p>
            <strong>{{ $t('plotsStatus.location') }}:</strong>
            <span v-if="!plot.isEditing">{{ plot.location || $t('plotsStatus.notAvailable') }}</span>
            <input
              v-else
              type="text"
              v-model="plot.location"
              class="edit-input"
              :placeholder="$t('plotsStatus.enterLocation')"
            />
          </p>
          <p>
            <strong>{{ $t('plotsStatus.extensionOfLand') }}:</strong>
            <span v-if="!plot.isEditing">{{ plot.extension ? plot.extension + ' m²' : $t('plotsStatus.notAvailable') }}</span>
            <input
              v-else
              type="number"
              v-model="plot.extension"
              class="edit-input"
              :placeholder="$t('plotsStatus.enterExtension')"
            />
          </p>
          <p>
            <strong>{{ $t('plotsStatus.size') }}:</strong>
            <span v-if="!plot.isEditing">{{ plot.size || 0 }}</span>
            <input
              v-else
              type="number"
              v-model="plot.size"
              class="edit-input"
              :placeholder="$t('plotsStatus.enterSize')"
            />
          </p>

          <!-- Botones -->
          <div class="buttons-container">
            <button v-if="!plot.isEditing" @click="enableEditMode(plot)" class="edit-plot-btn">
              {{ $t('plotsStatus.edit') }}
            </button>
            <button v-else @click="savePlot(plot)" class="save-plot-btn">
              {{ $t('plotsStatus.save') }}
            </button>
            <button class="delete-plot-btn" @click="deletePlot(plot.id)">
              {{ $t('plotsStatus.deletePlot') }}
            </button>
            <button class="install-node-btn" @click="openInstallNodeModal">
              {{ $t('plotsStatus.installNode') }}
            </button>
            <button class="status-plot-btn" @click="goToPlotStatus(plot.id)">
              {{ $t('plotsStatus.statusPlot') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal para instalar nodo -->
    <div v-if="showInstallNodeModal" class="modal-overlay">
      <div class="modal">
        <h2>{{ $t('plotsStatus.installNode') }}</h2>
        <p>{{ $t('plotsStatus.enterCode') }}</p>
        <input
          type="text"
          v-model="installNodeCode"
          :placeholder="$t('plotsStatus.enterCodePlaceholder')"
        />
        <div class="modal-buttons">
          <button @click="confirmInstallNode">{{ $t('plotsStatus.confirm') }}</button>
          <button @click="closeInstallNodeModal">{{ $t('plotsStatus.cancel') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { plotService } from "@/plot/services/plot.service.js";

export default {
  data() {
    return {
      plots: [],
      isLoading: false,
      showInstallNodeModal: false,
      installNodeCode: "",
    };
  },
  created() {
    this.fetchPlots();
  },
  methods: {
    async fetchPlots() {
      this.isLoading = true;
      try {
        const userId = localStorage.getItem("userId");
        const response = await plotService.getPlotsByUserId(userId);
        this.plots = response.data.map((plot) => ({
          ...plot,
          isEditing: false,
        }));
      } catch (error) {
        console.error("Error al obtener los datos de los plots:", error.response?.data || error.message);
      } finally {
        this.isLoading = false;
      }
    },
    goToRegisterPlot() {
      this.$router.push("/register-plot");
    },
    enableEditMode(plot) {
      plot.isEditing = true;
    },
    async savePlot(plot) {
      try {
        const updatedPlot = {
          name: plot.name,
          location: plot.location,
          extension: plot.extension,
          size: plot.size || 0,
          imageUrl: plot.imageUrl || '',
        };

        await plotService.updatePlot(plot.id, updatedPlot);
        plot.isEditing = false;
        alert(this.$t('plotsStatus.plotUpdated'));
      } catch (error) {
        console.error("Error al actualizar el plot:", error.response?.data || error.message);
        alert(this.$t('plotsStatus.errorUpdatingPlot'));
      }
    },
    async deletePlot(plotId) {
      if (!confirm(this.$t('plotsStatus.confirmDelete'))) return;

      try {
        await plotService.deletePlot(plotId);
        this.plots = this.plots.filter((plot) => plot.id !== plotId);
        alert(this.$t('plotsStatus.plotDeleted'));
      } catch (error) {
        console.error("Error al eliminar el plot:", error.response?.data || error.message);
        alert(this.$t('plotsStatus.errorDeletingPlot'));
      }
    },
    openInstallNodeModal() {
      this.showInstallNodeModal = true;
    },
    closeInstallNodeModal() {
      this.showInstallNodeModal = false;
      this.installNodeCode = "";
    },
    confirmInstallNode() {
      if (this.installNodeCode === "TSeed-XWPXNDYL") {
        this.$router.push("/register-plot");
      } else {
        alert(this.$t('plotsStatus.invalidCode'));
      }
    },
    goToPlotStatus(plotId) {
      this.$router.push({ path: `/plot-status/${plotId}` });
    },
  },
};
</script>

<style scoped>
/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  padding: 20px;
  border-radius: 10px;
  width: 400px;
  text-align: center;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}

.modal input {
  width: 80%;
  padding: 10px;
  margin: 10px 0;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.modal-buttons button {
  margin: 10px;
  padding: 10px 20px;
  border: none;
  cursor: pointer;
  border-radius: 5px;
}

.modal-buttons button:first-child {
  background: #3d703b;
  color: white;
}

.modal-buttons button:last-child {
  background: #e74c3c;
  color: white;
}


@import url("https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600&display=swap");

* {
  font-family: "Poppins", sans-serif;
  box-sizing: border-box;
}

.plots-status {
  width: 100%;
  max-width: 100%;
  margin: 0 auto;
  padding: 10px;
}

.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.plots-header {
  font-size: 1.8rem;
  color: #333;
  font-weight: bold;
}

.register-plot-btn {
  background-color: #3d703b;
  color: white;
  padding: 10px 20px;
  font-size: 1rem;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.register-plot-btn:hover {
  background-color: #2c522a;
}

.plots {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.plot {
  background-color: #F7FFF0;
  border-radius: 10px;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
  padding: 20px;
  text-align: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.plot:hover {
  transform: translateY(-5px);
  box-shadow: 0px 6px 15px rgba(0, 0, 0, 0.2);
}

.plot-image {
  width: 100%;
  height: 180px;
  object-fit: cover;
  border-radius: 10px;
  margin-bottom: 15px;
}

.plot-details p {
  margin: 8px 0;
  font-size: 0.9rem;
  color: #555;
}

.edit-input {
  width: 100%;
  padding: 8px;
  margin-top: 5px;
  border: 1px solid #ccc;
  border-radius: 5px;
}
.status-plot-btn,
.install-node-btn,
.edit-plot-btn,
.save-plot-btn,
.delete-plot-btn {
  margin: 10px 5px 0 5px;
  padding: 8px 12px;
  border-radius: 5px;
  font-size: 0.9rem;
  cursor: pointer;
  border: none;
  color: #fff;
  transition: background-color 0.3s ease;
}



.edit-plot-btn {
  background-color: #ffc107;
}

.edit-plot-btn:hover {
  background-color: #e0a800;
}
.install-node-btn{
  background-color: #0082cf;
}
.install-node-btn:hover{
  background-color: #00639a;
}
.status-plot-btn{
  background-color: #8f00ff;
}
.status-plot-btn:hover{
  background-color: #5000bf;
}
.save-plot-btn {
  background-color: #28a745;
}
.save-plot-btn:hover {
  background-color: #218838;
}
.delete-plot-btn {
  background-color: #e74c3c;
}
.delete-plot-btn:hover {
  background-color: #c0392b;
}
.no-plots-message {
  font-size: 1rem;
  color: #666;
  text-align: center;
  margin-top: 20px;
}
</style>
