<template>
  <div class="profile" v-if="profile && subscription">
    <div class="profile-container">
      <!-- Imagen de perfil -->
      <div class="profile-picture-container">
        <img :src="profile.profileImage || '../../assets/images/default-profile.png'" alt="User profile picture" class="profile-picture" />
      </div>

      <!-- Información básica de la cuenta -->
      <div class="details">
        <p><i class="fas fa-user"></i><span class="shaded-text">{{ profile.fullName }}</span></p>
        <p><i class="fas fa-phone-alt"></i><span class="shaded-text">{{ profile.phoneNumber }}</span></p>
        <p><i class="fas fa-envelope"></i><span class="shaded-text">{{ profile.email }}</span></p>
        <p><i class="fas fa-map-marker-alt"></i><span class="shaded-text">{{ profile.location }}</span></p>
      </div>

      <!-- Botón para editar el perfil -->
      <button class="edit-profile-btn" @click="showEditModal = true">{{ $t('profile.editProfile') }}</button>

      <!-- Tarjeta de información del plan de suscripción -->
      <div class="plan-card">
        <h3>{{ $t('profile.subscribedPlan') }}</h3>
        <p>{{ $t('profile.planType') }}: {{ subscription.planType }}</p>
        <p>{{ $t('profile.nodeCount') }}: {{ subscription.nodeCount }}</p>
        <p>{{ $t('profile.validationCode') }}: {{ subscription.validationCode }}</p>
        <button @click="copyCode">{{ $t('profile.copyCode') }}</button>
      </div>
    </div>

    <!-- Modal para editar el perfil -->
    <div v-if="showEditModal" class="modal-overlay">
      <div class="modal-card">
        <h3>Editar Perfil</h3>
        <div class="modal-content">
          <label>{{ $t('profile.name') }}:</label>
          <input v-model="editableUser.fullName" type="text" class="input-field" />

          <label>{{ $t('profile.telephone') }}:</label>
          <input
            v-model="editableUser.phoneNumber"
            type="tel"
            placeholder="+51 XXX-XXX-XXX"
            required
            @input="validateTelephone"
            class="input-field"
          />

          <label>{{ $t('profile.email') }}:</label>
          <input v-model="editableUser.email" type="email" class="input-field" />

          <label>{{ $t('profile.city') }}:</label>
          <input v-model="editableUser.location" type="text" class="input-field" />

          <label>{{ $t('profile.profileImage') }} (URL):</label>
          <input v-model="editableUser.profileImage" type="text" class="input-field" placeholder="Ingrese URL de la imagen" />

          <label>{{ $t('profile.uploadNewProfileImage') }}:</label>
          <input type="file" @change="onFileChange" class="input-field" />

          <!-- Mensaje de error -->
          <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>

          <div class="modal-actions">
            <button @click="saveProfile">{{ $t('profile.save') }}</button>
            <button @click="showEditModal = false; errorMessage = ''">{{ $t('profile.cancel') }}</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Sección de parcelas registradas -->
    <div class="plots-section">
      <div class="header-container">
        <h3><i class="fas fa-seedling"></i> {{ $t('profile.registeredPlots') }}</h3>
        <!-- Cambia el botón para redirigir a la vista de manejo de parcelas -->
        <button class="see-more-btn" @click="goToManageParcels">{{ $t('profile.seeMore') }}</button>
      </div>
      <hr class="green-line" />
      <div class="plots">
        <div class="plot" v-for="plot in userPlots" :key="plot.id">
          <div class="plot-card">
            <img :src="plot.imageUrl" alt="Plot Image" />
            <p>{{ plot.name }}</p>
            <p>{{ plot.location }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import axios from 'axios';
import ProfileService from '@/profile/services/profile-service';

export default {
  name: 'AccountComponent',
  data() {
    return {
      profile: null,
      subscription: null,
      userPlots: [],
      showEditModal: false,
      editableUser: {},
      errorMessage: "",
      selectedFile: null,
    };
  },
  async mounted() {
    try {
      // Obtener el ID del usuario desde localStorage y convertirlo a número
      const userId = localStorage.getItem('userId');
      if (!userId) {
        console.error('No se encontró el userId en localStorage.');
        this.$router.push('/login'); // Redirigir si no se encuentra el ID
        return;
      }

      // Convertir el userId a número
      const userIdNumber = parseInt(userId);

      // Obtener el perfil del usuario
      const response = await ProfileService.getAllProfiles();
      const profiles = response.data;
      const userProfile = profiles.find(profile => profile.userId === userIdNumber);

      if (userProfile) {
        this.profile = userProfile;
        this.editableUser = { ...userProfile }; // Inicializa el perfil editable
      } else {
        console.error('Usuario no encontrado.');
        this.$router.push('/complete-profile');
        return;
      }

      // Obtener la suscripción del usuario
      const subscriptionResponse = await axios.get(`https://thirstyseedapi-production.up.railway.app/api/v1/subscriptions/user/${userIdNumber}`);
      this.subscription = subscriptionResponse.data;

      // Obtener los plots del usuario
      const plotsResponse = await axios.get(`https://thirstyseedapi-production.up.railway.app/api/v1/plot/user/${userIdNumber}`);
      this.userPlots = plotsResponse.data;

    } catch (error) {
      console.error('Error al obtener el perfil o la suscripción:', error);
    }
  },
  methods: {
    goToManageParcels() {
      this.$router.push('/manage-parcels');
    },
    // Copiar código de validación (comentado porque no es necesario en este caso)
    copyCode() {
      // navigator.clipboard.writeText(this.subscription.validationCode)
      //   .then(() => {
      //     alert("Código copiado al portapapeles");
      //   })
      //   .catch(err => {
      //     console.error("Error al copiar el texto: ", err);
      //   });
    },

    // Lógica para editar perfil (comentada para que puedas personalizarla internamente)
    async saveProfile() {
      // Validación y actualización del perfil
      // this.profile = { ...this.editableUser };
      // this.showEditModal = false;
      // alert('Perfil actualizado correctamente');
    },

    // Lógica para cambiar la foto de perfil
    onFileChange(event) {
      const file = event.target.files[0];
      if (file && file.type.startsWith("image/")) {
        this.selectedFile = file;
      } else {
        alert("Por favor selecciona una imagen válida.");
      }
    }
  }
};
</script>

<style scoped>
.plan-card {
  background-color: #f5ffee;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
  width: 350px;
  margin-left: 20px;
  color: #2B9846;
  font-family: 'Poppins', sans-serif;
}

.plan-card button {
  background-color: #2B9846; /* Cambia el color de fondo del botón */
  color: white; /* Color del texto */
  padding: 10px 20px; /* Ajusta el relleno para hacer el botón más grande */
  border: none; /* Quita el borde del botón */
  border-radius: 4px; /* Bordes redondeados */
  cursor: pointer;
  font-family: 'Poppins', sans-serif;
  font-weight: bold; /* Para resaltar el texto */
}

.plan-card button:hover {
  background-color: #3D703B; /* Color al pasar el cursor */
  color: #ffffff; /* Color de texto al pasar el cursor */
}
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: 'Poppins', sans-serif;
}

.modal-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 400px;
  text-align: center;
  font-family: 'Poppins', sans-serif;
}

.modal-content label {
  display: block;
  margin: 10px 0 5px;
  font-family: 'Poppins', sans-serif;
}

.modal-content input {
  width: 100%;
  padding: 8px;
  margin-bottom: 15px;
  border-radius: 4px;
  border: 1px solid #ccc;
  font-family: 'Poppins', sans-serif;
}

.input-field{
  background: #e1e1e1;
}

.modal-actions {
  display: flex;
  justify-content: space-around;
}

.modal-actions button {
  background-color: #3D703B;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-family: 'Poppins', sans-serif;
}

.modal-actions button:hover {
  background-color: #2B9846;
}

.modal-actions button:nth-child(2) {
  background-color: #999;
}

.modal-actions button:nth-child(2):hover {
  background-color: #666;
}

.edit-profile-btn {
  background-color: #4A90E2; /* Color del botón */
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 10px;
  margin-left: -90px;
  font-family: 'Poppins', sans-serif;
}

.edit-profile-btn:hover {
  background-color: #007BFF; /* Color al pasar el cursor */
}

.profile {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 20px;
}

/* Contenedor de la información de perfil, foto y proveedor de agua */
.profile-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: 1300px;
  margin-bottom: 30px;
  text-align: center;
}

/* Imagen de perfil rectangular */
.profile-picture-container {
  flex: 1;
  display: flex;
  justify-content: flex-start;
}

.profile-picture {
  width: 400px;
  height: 300px;
  object-fit: cover;
  border-radius: 8px;
}

/* Información de la cuenta, centrada */
.details {
  flex: 2;
  text-align: left;
  margin-left: 20px;
  margin-right: 20px;
  padding-top: 20px;
  padding-bottom: 20px;
}

.details p {
  font-size: 18px; /* Ajusta el tamaño de fuente del nombre y detalles */
  margin-bottom: 25px; /* Agrega espacio entre los elementos */
}

.details p:last-child {
  margin-bottom: 0; /* Asegura que no haya espacio extra después del último párrafo */
}


i {
  margin-right: 10px; /* Espacio entre el ícono y el texto */
  vertical-align: middle; /* Alinea el ícono con el texto */
}

/* Sección de las parcelas */
.plots-section {
  width: 100%;
  max-width: 1300px;
  margin-top: 20px;
}

/* Encabezado de la sección de parcelas */
.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.green-line {
  border: none;
  height: 1px;
  background-color: #2B9846; /* Color de la línea */
  margin-top: -5px;
  margin-bottom: 25px;
}

.see-more-btn {
  background-color: #3D703B; /* Color del botón */
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-family: 'Poppins', sans-serif;
}

.see-more-btn:hover {
  background-color: #2B9846; /* Color al pasar el cursor */
}

/* Contenedor de los plots */
.plots {
  display: flex;
  justify-content: center; /* Alinea las tarjetas al centro */
  gap: 20px; /* Espacio entre cada tarjeta */
  flex-wrap: wrap; /* Permite que las tarjetas se ajusten en múltiples filas en pantallas pequeñas */
}

.plot-card {
  background-color: #F6F6F6;
  border-radius: 8px;
  padding: 10px;
  text-align: center;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
  width: 300px;
  margin: 10px 0;
  overflow: hidden; /* Evita que el contenido se salga de los bordes */
}

.plot img {
  width: 100%; /* Asegura que la imagen ocupe el ancho completo de la tarjeta */
  height: 150px; /* Ajusta la altura de la imagen */
  object-fit: cover; /* Recorta la imagen para ajustarse al contenedor sin deformarse */
  border-radius: 8px; /* Aplica el borde redondeado */
}

.error-message {
  color: red;
  font-weight: bold;
  margin-top: 10px;
}
.plot p {
  text-align: center;
  margin-top: 10px;
  font-size: 16px;
  color: #2B9846; /* Color del texto */
  font-weight: 650;
}

.details, .water-supplier h3 {
  color: #2B9846; /* Cambia el color del texto */

}

i {
  margin-right: 10px; /* Espacio entre el ícono y el texto */
  vertical-align: middle; /* Alinea el ícono con el texto */
  color: #000000; /* Todos los íconos en negro */
}

.shaded-text {
  background-color: #DEF6D9; /* Color de fondo del texto */
  border-radius: 25px; /* Bordes redondeados */
  padding: 10px 20px; /* Relleno interno para mayor espacio alrededor del texto */
  display: inline-block; /* Mantener el texto en bloque para el fondo */
  width: 300px; /* Ajusta el ancho a un valor fijo para todos */
  margin-bottom: 15px; /* Espacio entre cada línea de detalles */
  text-align: left; /* Alinea el texto hacia la izquierda */
}
</style>
