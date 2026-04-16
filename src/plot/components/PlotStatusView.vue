<template>
  <div class="plot-status-view">
    <div v-if="plot" class="plot-info">

      <div class="plot-image-container">
        <img :src="plot.imageUrl" alt="Plot Image" class="plot-image" />
      </div>
      <div class="plot-details">
        <p><strong>Plot name:</strong> <span class="highlight">{{ plot.name }}</span></p>
        <p><strong>Plot size:</strong> <span class="highlight">{{ plot.size }} m²</span></p>
        <p><strong>Installed nodes:</strong> <span class="highlight">{{ plot.nodes !== undefined ? plot.nodes : 0 }}</span></p>


      </div>


      <div class="add-node-button-container">
        <router-link :to="'/register-node/' + plot.id" class="add-node-link">
          <button class="add-node-button">Agregar Nodo</button>
        </router-link>
      </div>
    </div>

    <div class="node-status-container" v-if="nodes.length">
      <div class="top-layout">
        <div class="left-node">
          <h3>Node status</h3>
          <div class="full-width-line"></div>
          <div class="node-cards">
            <NodeStatusCard v-for="(node, index) in nodes" :key="index" :node="node" />
          </div>
        </div>
        <div class="right-button">
          <router-link to="/irrigation-schedule">
            <button class="irrigation-button">Schedule irrigation</button>
          </router-link>
        </div>
      </div>

      <div class="bottom-layout">
        <p class="error-message">One or more nodes in your plot have an error. Contact support.</p>
        <button class="support-button">Contact support</button>
      </div>
    </div>
  </div>
</template>

<script>
import { plotService } from "@/plot/services/plot.service.js";
import { nodeService } from "@/node/sevices/node.service.js";
import NodeStatusCard from "@/node/components/NodeStatusCard.vue";

export default {
  name: 'PlotStatusView',
  components: {
    NodeStatusCard
  },
  data() {
    return {
      plot: null,
      nodes: []
    };
  },
  methods: {
    formatDate(dateString) {
      const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
      return new Date(dateString).toLocaleDateString('en-GB', options);
    },
    async fetchPlotAndNodes() {
      try {
        const plotId = this.$route.params.id;

        const plotResponse = await plotService.getPlotById(plotId);
        this.plot = plotResponse.data;

        const nodesResponse = await nodeService.getNodesByPlotId(plotId);
        this.nodes = nodesResponse.data;


        this.plot.nodes = this.nodes.length;
      } catch (error) {
        console.error('Error fetching plot and nodes:', error);
      }
    }
  },
  mounted() {
    this.fetchPlotAndNodes();
  }
};
</script>

<style scoped>
.plot-status-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background-color: #f0f4f8;
  border-radius: 15px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.plot-info {
  display: flex;
  align-items: center;
  justify-content: space-between; /* Alineación de la imagen y la información */
  width: 100%;
}

.plot-image-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.plot-image {
  width: 150px;
  height: auto;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.plot-details {
  background-color: #e9f5f9;
  padding: 15px;
  border-radius: 10px;
  margin-right: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.highlight {
  background-color: #d5f3e3;
  padding: 5px 10px;
  border-radius: 5px;
}

/* Botón "Agregar Nodo" alineado a la derecha */
.add-node-button-container {
  display: flex;
  justify-content: flex-end; /* Alineamos el botón a la derecha */
  margin-left: auto; /* Alineación a la derecha */
  margin-top: 10px; /* Espacio para que no se superponga con la información */
}

.add-node-button {
  background-color: #007bff;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  margin-top: 10px; /* Para darle un poco de espacio desde la parte superior */
}

.node-status-container {
  width: 100%;
  display: flex;
  flex-direction: column;
}

.top-layout {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  width: 100%;
}

.left-node {
  flex: 1;
}

.full-width-line {
  border-bottom: 2px solid #2B9846;
  width: 110%;
  margin: 0;
}

.node-cards {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  gap: 20px;
  margin-top: 10px;
}

.right-button {
  align-self: flex-start;
}

.irrigation-button {
  margin-top: 10px;
}

.bottom-layout {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-top: 20px;
}

.error-message {
  color: #dc3545;
  font-weight: bold;
}

.irrigation-button, .support-button {
  background-color: #28a745;
  color: #fff;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
}

.support-button {
  background-color: #dc3545;
}
</style>
