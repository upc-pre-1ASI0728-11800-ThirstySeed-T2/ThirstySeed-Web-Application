<template>
  <div class="payment-form-container">
    <h2>Confirm Your Payment</h2>
    <form @submit.prevent="handlePayment">
      <button type="submit" class="btn">Pay Now</button>
      <div v-if="paymentSuccess" class="success-message">¡Pago realizado con éxito!</div>
      <div v-if="error" class="error-message">{{ error }}</div>
    </form>
  </div>
</template>

<script>
import SubscriptionService from '@/subscriptions/services/subscription-service.ts'

export default {
  props: {
    selectedPlan: { type: String, required: true }
  },
  data() {
    return {
      paymentSuccess: false,
      error: null
    }
  },
  methods: {
    async handlePayment() {
      try {
        const currentUser = await SubscriptionService.getCurrentUser();
        const userId = currentUser?.id;

        console.log('User ID:', userId);

        if (!userId) {
          console.error('Error: No se pudo obtener el ID de usuario');
          throw new Error('User ID not found. Please log in.');
        }

        const planDetails =
          this.selectedPlan === 'premium'
            ? { planType: 'PREMIUM', nodeCount: 12 }
            : { planType: 'PLUS', nodeCount: 5 };

        const subscriptionData = {
          userId: userId,
          planType: planDetails.planType,
          nodeCount: planDetails.nodeCount,
          validationCode: 'TSeed-XWPXNDYL',
        };

        console.log('Datos enviados al backend:', subscriptionData);

        const response = await SubscriptionService.createSubscription(subscriptionData);

        console.log('Respuesta del servidor:', response);

        // Cambiar validación del código de estado
        if (response.status === 200 || response.status === 201) {
          this.paymentSuccess = true;
          this.$emit('success');
        } else {
          console.error('Error en la respuesta del servidor:', response.data);
          this.error = `Pago fallido: ${response.data.message || 'Error desconocido'}`;
        }
      } catch (error) {
        if (error.response) {
          console.error('Error en la respuesta del servidor:', error.response.data);
          this.error = error.response.data.message || 'Error al procesar el pago.';
        } else if (error.request) {
          console.error('No se recibió respuesta del servidor:', error.request);
          this.error = 'No se recibió respuesta del servidor. Verifique su conexión.';
        } else {
          console.error('Error al procesar la solicitud:', error.message);
          this.error = `Error: ${error.message}`;
        }
      }
    }
  }
}
</script>

<style scoped>
.payment-form-container {
  font-family: 'Poppins', sans-serif;
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  margin: auto;
  text-align: center;
}

.error-message {
  color: red;
  margin-top: 1rem;
}

.success-message {
  color: #28a745;
  font-weight: bold;
  margin-top: 1rem;
}

.btn {
  width: 100%;
  padding: 0.75rem;
  background-color: #4caf50;
  color: white;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 1rem;
}
</style>
