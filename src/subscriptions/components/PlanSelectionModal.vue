  <template>
    <div>
      <!-- Modal para seleccionar plan -->
      <div v-if="!selectedPlan" class="modal-overlay">
        <div class="modal-content">
          <h2>Select Your Plan</h2>
          <div class="plans">
            <div class="plan-card" @click="selectPlan('premium')">
              <h3>PREMIUM</h3>
              <h2>$7</h2>
            </div>
            <div class="plan-card" @click="selectPlan('plus')">
              <h3>PLUS</h3>
              <h2>$15</h2>
            </div>
          </div>
        </div>
      </div>

      <!-- Formulario de pago -->
      <PaymentForm
          v-if="selectedPlan"
          :selectedPlan="selectedPlan"
          :userId="userId"
          @success="handleSuccess"
          @error="handleError"
      />
    </div>
  </template>

  <script>
  import PaymentForm from './PaymentForm.vue';

  export default {
    components: { PaymentForm },
    props: {
      userId: { type: String, required: true },
    },
    data() {
      return {
        selectedPlan: '',
      };
    },
    methods: {
      selectPlan(plan) {
        this.selectedPlan = plan;
      },
      handleSuccess() {
        this.$router.push('/account');
      },
      handleError(error) {
        alert(`Error: ${error}`);
      },
    },
  };
  </script>

  <style scoped>
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 999;
  }

  .modal-content {
    background-color: white;
    padding: 2rem;
    border-radius: 8px;
    width: 80%;
    max-width: 600px;
    text-align: center;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
  }

  .plans {
    display: flex;
    justify-content: space-around;
    margin: 2rem 0;
  }

  .plan-card {
    background-color: #2e7d32;
    color: white;
    padding: 1rem;
    border-radius: 8px;
    cursor: pointer;
    width: 40%;
    text-align: center;
    transition: transform 0.3s ease;
  }

  .plan-card:hover {
    transform: scale(1.05);
  }
  </style>

