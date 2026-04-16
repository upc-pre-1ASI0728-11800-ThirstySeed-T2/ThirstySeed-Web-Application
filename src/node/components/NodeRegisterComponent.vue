<template>
  <div class="node-registration">
    <h2>Node Registration</h2>

    <div class="card">
      <div class="image-container">
        <img src="@/assets/images/images.png" alt="Sprinkler icon" />
      </div>

      <div class="form-container">
        <h3>First Node</h3>

        <div class="input-group">
          <label for="location">Location</label>
          <input type="text" v-model="location" id="location" placeholder="Location" />
        </div>

        <div class="input-group">
          <label for="moisture">Moisture</label>
          <input type="number" v-model="moisture" id="moisture" placeholder="Moisture" />
        </div>
        <div class="input-group">
          <label for="productcode">Product Code</label>
          <input type="text" v-model="productcode" id="productcode" placeholder="Productcode" />
        </div>

        <div class="input-group">
          <label for="indicator">Indicator</label>
          <input type="text" v-model="indicator" id="indicator" placeholder="Indicator" />
        </div>

        <div v-if="successMessage" class="success-message">
          {{ successMessage }}
        </div>

        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>

        <div class="buttons">
          <button class="primary-button" @click="registerNode">Confirm Node Registration</button>
          <button class="secondary-button" @click="registerAnotherNode">Register Another Node</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { nodeService } from '@/node/sevices/node.service.js';

export default {
  data() {
    return {
      location: '',
      moisture: 0,
      indicator: 'Water',
      successMessage: '',
      errorMessage: '',
      isActive: true,
      plotId: this.$route.params.id
    };
  },
  methods: {
    async registerNode() {
      try {
        const plotId = this.$route.params.id

        const nodes = await nodeService.getNodesByPlotId(plotId);
        const nodesData = nodes.data;





        const id = nodesData.length ? Math.max(...nodesData.map(node => node.id)) + 1 : 1;


        const status = this.moisture > 20 ? 'Correct' : 'Error';
        const statusClass = status === 'Correct' ? 'status-correct' : 'status-error';


        const newNode = {
          plotId,
          nodelocation: this.location,
          moisture: this.moisture,
          indicator: this.indicator,
          isActive: this.isActive,
          productcode: this.productcode
        };


        await nodeService.createNode(newNode);


        this.successMessage = 'Node registered successfully!';
        this.errorMessage = '';

        // Limpiar el formulario
        this.registerAnotherNode();
      } catch (error) {
        this.errorMessage = 'Error registering node. Please try again.';
        this.successMessage = '';
        console.error('Error registering node:', error);
      }
    },
    registerAnotherNode() {
      this.location = '';
      this.moisture = 0;
      this.indicator = 'Water';
      this.isActive = true;
    }
  }
};
</script>

<style scoped>
.node-registration {
  font-family: 'Arial', sans-serif;
  padding: 40px;
  background-color: #eafaf1;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  max-width: 600px;
  margin: 40px auto;
}

h2 {
  color: #2c3e50;
  margin-bottom: 20px;
  text-align: center;
}

.card {
  background-color: #ffffff;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.card:hover {
  transform: translateY(-5px);
}

.image-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 30px;
  background-color: #d1f2eb;
}

.image-container img {
  max-width: 100px;
}

.form-container {
  padding: 30px;
}

h3 {
  color: #27ae60;
  margin-bottom: 20px;
  text-align: center;
}

.input-group {
  margin-bottom: 20px;
}

.input-group label {
  display: block;
  font-weight: bold;
  margin-bottom: 5px;
  color: #34495e;
}

.input-group input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ced4da;
  border-radius: 6px;
  font-size: 18px;
  transition: border-color 0.2s;
}

.input-group input:focus {
  border-color: #27ae60;
  outline: none;
}

.success-message {
  color: #27ae60;
  margin-top: 10px;
  text-align: center;
}

.error-message {
  color: #c0392b;
  margin-top: 10px;
  text-align: center;
}

.buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 30px;
}

.primary-button, .secondary-button {
  padding: 12px 20px;
  border: none;
  border-radius: 6px;
  font-size: 18px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.primary-button {
  background-color: #27ae60;
  color: white;
}

.primary-button:hover {
  background-color: #219150;
}

.secondary-button {
  background-color: #7ed957;
  color: white;
}

.secondary-button:hover {
  background-color: #5dbb3a;
}

@media (max-width: 600px) {
  .buttons {
    flex-direction: column;
  }

  .buttons button {
    margin-bottom: 15px;
  }
}
</style>
