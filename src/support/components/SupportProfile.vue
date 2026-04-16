<template>
  <div class="support-container">
    <div class="header">
      <h2>Contact with our team</h2>
      <hr class="header-line" />
    </div>
    <div class="support-content">
      <!-- Imagen de Soporte -->
      <div class="support-image">
        <img src="@/assets/images/support-image.jpg" alt="Support Image" />
      </div>

      <!-- Formulario de Soporte -->
      <div class="support-form">
        <form @submit.prevent="handleSubmit">
          <!-- Selección de Plot -->
          <div class="form-group">
            <label for="plotName">Plot name</label>
            <select id="plotName" v-model="selectedPlot" @change="updateNodes">
              <option v-for="plot in availablePlots" :key="plot.id" :value="plot.id">
                {{ plot.name }} - {{ plot.location }}
              </option>
            </select>
          </div>
          <!-- Campo de Nodos -->
          <div class="form-group">
            <label for="installedNodes">Installed nodes</label>
            <input type="text" id="installedNodes" v-model="fixedNodes" disabled />
          </div>
          <!-- Detalle -->
          <div class="form-group">
            <label for="detail">Detail</label>
            <textarea id="detail" v-model="detail" placeholder="Describe your issue here..."></textarea>
          </div>
          <!-- Botón de Envío -->
          <div class="button-group">
            <button type="submit" class="submit-btn">Submit</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { plotService } from "@/plot/services/plot.service.js";
import { nodeService } from '@/node/sevices/node.service.js'

export default {
  data() {
    return {
      selectedPlot: "",
      fixedNodes: 0,
      detail: "",
      availablePlots: [], // Plots filtrados por usuario
    };
  },
  methods: {
    async fetchUserPlots() {
      try {
        const user = await plotService.getCurrentUser();
        if (!user) throw new Error("User not found");

        const plotsResponse = await plotService.getPlotsByUserId(user.id);
        this.availablePlots = plotsResponse.data;
      } catch (error) {
        console.error("Error fetching user plots:", error);
      }
    },
    async updateNodes() {
      try {
        if (!this.selectedPlot) {
          this.fixedNodes = 0;
          return;
        }

        const nodesResponse = await nodeService.getNodesByPlotId(this.selectedPlot);
        this.fixedNodes = nodesResponse.data.length; // Actualiza la cantidad de nodos instalados
      } catch (error) {
        console.error("Error fetching nodes for plot:", error);
      }
    },
    handleSubmit() {
      console.log("Formulario enviado:", {
        plotId: this.selectedPlot,
        installedNodes: this.fixedNodes,
        detail: this.detail,
      });
      alert("Support request sent successfully!");
      this.detail = "";
    },
  },
  created() {
    this.fetchUserPlots(); // Carga los plots al crear el componente
  },
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@100;200;300;400;500;600;700;800;900&display=swap');
* {
  font-family: 'Poppins', sans-serif;
  box-sizing: border-box;
}
.support-container {
  display: flex;
  flex-direction: column;
  align-items: flex-start; /* Alinea el contenido a la izquierda */
  padding: 20px;
}

.header {
  text-align: left; /* Alineación a la izquierda */
  width: 100%; /* Asegura que ocupe todo el ancho */
}

.header h2 {
  color: #2B9846;
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 8px; /* Espacio entre el título y la línea */
}

.header-line {
  border: none;
  height: 2px;
  background-color: #2B9846;
  margin-top: 0; /* Elimina el margen superior para pegarlo al encabezado */
  width: 100%; /* Extiende la línea de extremo a extremo */
}

.support-content {
  display: flex;
  flex-direction: column; /* Cambiado a columna para centrar la imagen y el formulario */
  align-items: center; /* Centra horizontalmente la imagen y el formulario */
  width: 100%; /* Ocupar todo el ancho disponible */
  margin-top: 20px; /* Espacio entre el header y el contenido */
}

.support-form {
  width: 100%;
  max-width: 400px; /* Ajusta el ancho del formulario */
  margin-top: 20px; /* Espacio entre la imagen y el formulario */
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  font-weight: 600;
  color: #2B9846;
  display: block;
  margin-bottom: 5px;
}

input[type="text"],
textarea,
select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #DEF6D9;
}

textarea {
  height: 100px;
  resize: none;
}

.button-group {
  display: flex; /* Usa flexbox para alinear el botón */
  justify-content: flex-end; /* Alinea el botón a la derecha */
}

.submit-btn {
  padding: 10px 20px;
  background-color: #2B9846;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.3s ease;
}

.submit-btn:hover {
  background-color: #248c3a;
}

.support-image {
  display: flex;
  align-items: center; /* Centra la imagen verticalmente */
  margin-bottom: 10px; /* Espacio debajo de la imagen */
}

.support-image img {
  width: 600px; /* Ajusta el tamaño de la imagen */
  max-height: 600px;
  object-fit: contain;
}
</style>
