<template>
  <div class="profile-container">
    <h2>Complete Your Profile</h2>
    <form @submit.prevent="handleCompleteProfile">
      <div class="input-group">
        <input
            v-model="firstName"
            type="text"
            placeholder="First Name"
            required
        />
        <input
            v-model="lastName"
            type="text"
            placeholder="Last Name"
            required
        />
      </div>
      <div class="input-field">
        <input
            v-model="email"
            type="email"
            placeholder="Email"
            required
        />
      </div>
      <div class="input-field">
        <input
            v-model="phoneNumber"
            type="tel"
            placeholder="Phone Number (e.g., +51 XXX-XXX-XXXX)"
            required
        />
      </div>
      <div class="input-field">
        <input
            v-model="location"
            type="text"
            placeholder="Location"
            required
        />
      </div>
      <div class="input-field">
        <input
            v-model="profileImage"
            type="text"
            placeholder="Profile Image URL"
        />
      </div>
      <button type="submit" class="btn">Complete Profile</button>
    </form>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import ProfileService from '@/profile/services/profile-service';

export default defineComponent({
  name: 'ProfileComponent',
  data() {
    return {
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      location: '',
      profileImage: '',
    };
  },
  methods: {
    async handleCompleteProfile() {
      try {
        // Obtener el ID del usuario desde localStorage
        const userId = localStorage.getItem('userId');
        if (!userId) {
          throw new Error('User ID not found');
        }

        // Preparar los datos del perfil
        const profileData = {
          userId: parseInt(userId),
          firstName: this.firstName,
          lastName: this.lastName,
          email: this.email.toLowerCase(),
          phoneNumber: this.phoneNumber,
          profileImage: this.profileImage || 'https://randomuser.me/api/portraits/men/60.jpg',
          location: this.location,
        };

        // Llamar al servicio para crear el perfil del usuario
        const response = await ProfileService.createProfile(profileData);

        // Verificar si el perfil se creó correctamente
        if (response.status === 201) {
          console.log('Profile completed successfully:', response.data);

          // Redirigir a la página /selectplan después de completar el perfil
          this.$router.push('/plan-selection');
        } else {
          throw new Error('Failed to create profile');
        }
      } catch (error) {
        console.error('Error completing profile:', error);
      }
    },
  },
});
</script>
<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600&display=swap');

* {
  font-family: 'Poppins', sans-serif;
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.profile-container {
  max-width: 450px;
  margin: 50px auto;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #ffffff;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
}

h2 {
  font-size: 1.8rem;
  font-weight: 600;
  color: #333;
  text-align: center;
  margin-bottom: 2rem;
}

.input-group {
  display: flex;
  gap: 10px;
  margin-bottom: 1rem;
}

.input-group input {
  flex: 1;
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 0.9rem;
  transition: border-color 0.3s ease;
}

.input-field {
  margin-bottom: 1.5rem;
}

.input-field input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 0.9rem;
  transition: border-color 0.3s ease;
}

input:focus {
  border-color: #2B9846;
  outline: none;
  box-shadow: 0 0 4px rgba(43, 152, 70, 0.3);
}

.btn {
  width: 100%;
  padding: 14px;
  background-color: #2B9846;
  color: white;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.btn:hover {
  background-color: #1e7a36;
}

.profile-container input::placeholder {
  color: #999;
}

.profile-container input:focus::placeholder {
  color: transparent;
}

.profile-container input, .btn {
  font-family: 'Poppins', sans-serif;
}

@media (max-width: 480px) {
  .input-group {
    flex-direction: column;
    gap: 0;
  }

  .input-group input {
    margin-bottom: 1rem;
  }
}

</style>
