<template>
  <div class="signin-container">
    <div class="form-wrapper">
      <h2>Welcome Back!</h2>
      <p>Please sign in to continue.</p>
      <form @submit.prevent="handleSignIn">
        <div class="form-group">
          <label for="username">Username</label>
          <input
              type="text"
              id="username"
              v-model="username"
              placeholder="Enter your username"
              required
          />
        </div>
        <div class="form-group">
          <label for="password">Password</label>
          <input
              type="password"
              id="password"
              v-model="password"
              placeholder="Enter your password"
              required
          />
        </div>
        <button type="submit" class="btn-primary">Sign In</button>
      </form>
      <div class="signup-link">
        <p>Not registered yet? <a @click.prevent="goToSignUp" href="#">Sign Up</a></p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import AuthenticationService from "@/iam/services/authentication-service";

export default defineComponent({
  name: "SignIn",
  data() {
    return {
      username: "",
      password: "",
    };
  },
  methods: {
    async handleSignIn() {
      try {
        const user = {
          username: this.username,
          password: this.password,
        };
        const response = await AuthenticationService.signIn(user);

        console.log("Sign in successful:", response.data);

        const token = response.data.token;
        const userId = response.data.id;

        // Guardar token y userId en localStorage
        localStorage.setItem("authToken", token);
        localStorage.setItem("userId", userId);

        // Redirigir al perfil del usuario
        this.$router.push("/account");
      } catch (error) {
        console.error("Error during sign in:", error);
      }
    },
    goToSignUp() {
      this.$router.push("/sign-up");
    },
  },
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600&display=swap');

* {
  font-family: 'Poppins', sans-serif;
  box-sizing: border-box;
}

html,
body {
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden; /* Evita el scroll */
}

/* Contenedor principal */
.signin-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100vw; /* Ocupa todo el ancho del viewport */
  height: 100vh; /* Ocupa todo el alto del viewport */
  margin: 0;
  padding: 0;
  background-color: transparent; /* Transparente para que herede el color del padre */
  box-sizing: border-box;
}

/* Ajustes para el formulario */
.form-wrapper {
  background: #ffffff;
  padding: 30px 40px;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
  max-width: 400px;
  width: 100%;
}

h2 {
  margin-bottom: 10px;
  font-size: 24px;
  color: #333;
}

p {
  margin-bottom: 20px;
  font-size: 14px;
  color: #666;
}

.form-group {
  margin-bottom: 15px;
  text-align: left;
}

label {
  display: block;
  font-size: 14px;
  font-weight: bold;
  color: #555;
  margin-bottom: 5px;
}

input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 14px;
}

input:focus {
  outline: none;
  border-color: #2B9846;
  box-shadow: 0 0 4px rgba(0, 123, 255, 0.2);
}

.btn-primary {
  width: 100%;
  padding: 10px;
  background-color: #2B9846;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn-primary:hover {
  background-color: #12723D;
}

.signup-link {
  margin-top: 20px;
}

.signup-link p {
  font-size: 14px;
  color: #666;
}

.signup-link a {
  color: #2B9846;
  text-decoration: none;
  font-weight: bold;
  cursor: pointer;
}

.signup-link a:hover {
  text-decoration: underline;
}
</style>