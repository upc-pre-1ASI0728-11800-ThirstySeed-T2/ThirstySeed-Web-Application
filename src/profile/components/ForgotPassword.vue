<template>
  <div class="forgot-password-container">
    <div class="content-wrapper">
      <div class="header-container">
        <img src="../../assets/images/Logo-Animado.png" alt="Thirsty Seed Logo" class="logo"/>
        <span class="project-name">Thirsty Seed</span>
      </div>
      <div class="forgot-password-card">
        <h2>Forgot your password?</h2>
        <p>We'll email you instructions on how to reset it.</p>
        <form @submit.prevent="onSubmit">
          <div class="input-field">
            <input v-model="email" type="email" id="email" placeholder="Email" required />
          </div>
          <button type="submit" class="btn">Reset Password</button>
        </form>
        <router-link to="/login" class="return-link">Return to login</router-link>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      email: ''
    };
  },
  methods: {
    onSubmit() {
      console.log('Reset password for:', this.email);
    }
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600&display=swap');

.forgot-password-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #ffffff;
  font-family: 'Poppins', sans-serif;
}

.content-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.header-container {
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
}

.logo {
  width: 60px;
  margin-right: 10px;
}

.project-name {
  font-size: 1.2rem;
  font-weight: 800;
  color: #2b9846;
}

.forgot-password-card {
  background-color: rgba(255, 255, 249, 1);
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-radius: 16px;
  width: 360px;
  text-align: left;
  font-family: 'Poppins', sans-serif;
}

h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
  text-align: left;
  font-family: 'Poppins', sans-serif;
}

p {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 1.5rem;
  text-align: left;
}

.input-field {
  width: 100%;
  margin-bottom: 1.5rem;
  font-family: 'Poppins', sans-serif;
}

input {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 0.9rem;
  font-family: 'Poppins', sans-serif;
}

.btn {
  width: 100%;
  padding: 0.8rem;
  background-color: #4caf50;
  color: white;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.return-link {
  display: block;
  margin-top: 1rem;
  font-size: 0.9rem;
  color: #4caf50;
  text-decoration: none;
  text-align: left;
  font-family: 'Poppins', sans-serif;
}

.return-link:hover {
  text-decoration: underline;
}
</style>