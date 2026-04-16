<template>
  <div class="login-container">
    <div class="login-image"></div>
    <div class="login-form">
      <img src="../../assets/images/NewLogo.jpg" alt="Thirsty Seed Logo" class="logo" />
      <h2>Welcome to Thirsty Seed</h2>
      <form @submit.prevent="onSubmit">
        <div class="input-field">
          <label for="email">Email</label>
          <input v-model="email" type="email" id="email" placeholder="Enter your email" required />
        </div>
        <div class="input-field">
          <label for="password" >Password</label>
          <input v-model="password" type="password" id="password" placeholder="Enter your password" required />
        </div>

        <router-link to="/forgot-password" class="forgot-password">¿Forgot password?</router-link>

        <div class="button-group">
          <button type="submit" class="btn">Log In</button>
          <button @click="goToSignUp" type="button" class="btn secondary">Sign In</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      email: '',
      password: ''
    };
  },
  methods: {
    // Modificación en el método onSubmit de Login.vue
    async onSubmit() {
      try {
        const response = await fetch('http://localhost:3000/users');
        const users = await response.json();

        // Normaliza el correo ingresado a minúsculas para la comparación
        const normalizedEmail = this.email.toLowerCase();

        // Encuentra el usuario comparando el correo en minúsculas y la contraseña
        const user = users.find(
            user => user.email.toLowerCase() === normalizedEmail && user.password === this.password
        );

        if (user) {
          console.log('Autenticación exitosa');
          localStorage.setItem('authToken', 'authenticated');
          localStorage.setItem('userEmail', user.email);
          console.log('Email guardado en localStorage:', user.email);
          this.$router.push({ path: '/manage-parcels' });
        } else {
          alert('Credenciales incorrectas. Por favor, intente nuevamente.');
        }
      } catch (error) {
        console.error('Error al intentar iniciar sesión:', error);
        alert('Hubo un problema al iniciar sesión. Inténtelo de nuevo más tarde.');
      }
    }, // <-- Faltaba esta coma

    goToSignUp() {
      this.$router.push('/sign-up');
    }
  }
};
</script>


<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@100;200;300;400;500;600;700;800;900&display=swap');

* {
  font-family: 'Poppins', sans-serif;
}

.login-container {
  display: flex;
  height: 100vh;
  width: 100vw;
}

.login-image {
  flex: 1;
  background-image: url('../../assets/images/sprinkler-image.jpg');
  background-size: cover;
  background-position: center;
}

.login-form {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  background-color: #fff;
  height: 100vh;
}

.logo {
  width: 120px;
  margin-bottom: 1rem;
}

h2 {
  font-size: 1.6rem;
  color: rgba(43, 152, 70, 1);
  margin-bottom: 1rem;
  text-align: center;
}

.input-field {
  width: 100%;
  margin-bottom: 1rem;
}

input {
  width: 100%;
  padding: 0.6rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

label {
  font-size: 0.9rem;
  color: black; /* Cambia el color de las etiquetas a negro */
}

.forgot-password {
  font-size: 0.9rem;
  color: rgba(43, 152, 70, 1);
  margin-bottom: 1rem;
  text-align: center; /* Centra el texto de "Forgot password" */
  display: block; /* Asegura que el enlace ocupe el ancho del contenedor */
}

.button-group {
  display: flex;
  justify-content: space-between;
  width: 100%;
}

.btn {
  width: 48%;
  padding: 0.6rem;
  background-color: rgba(43, 152, 70, 1);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.btn.secondary {
  background-color: transparent;
  border: 1px solid rgba(43, 152, 70, 1);
  color: rgba(43, 152, 70, 1);
}

.btn:hover {
  background-color: rgba(43, 152, 70, 1);
  color: white;
}

</style>