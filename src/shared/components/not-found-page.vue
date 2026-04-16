<template>
  <div class="not-found-page">
    <div class="content">
      <h1>404</h1>
      <p>Oops! The page you're looking for doesn't exist.</p>
      <img src="https://cdn-icons-png.flaticon.com/512/497/497738.png" alt="Lost" />
      <br>
      <button @click="goToAccount">Go to Sign In</button>
    </div>
  </div>
</template>

<script>
export default {
  methods: {
    goToAccount() {
      this.$router.push('/sign-in');
    }
  }
};
</script>

<style scoped>
.not-found-page {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f0f8ff;
  font-family: 'Poppins', sans-serif;
}

.content {
  text-align: center;
}

h1 {
  font-size: 96px;
  margin: 0;
  color: #2B9846;
}

p {
  font-size: 24px;
  color: #333;
}

img {
  margin-top: 20px;
  max-width: 300px;
  width: 100%;
}

button {
  margin-top: 20px;
  background-color: #4caf50;
  color: white;
  border: none;
  padding: 10px 20px;
  font-size: 18px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

button:hover {
  background-color: #388e3c;
}
</style>
