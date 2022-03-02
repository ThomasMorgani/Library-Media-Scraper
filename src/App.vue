<template>
  <v-app>
    <v-app-bar app color="primary" dark>
      <v-app-bar-title>NEW MATERIALS</v-app-bar-title>
    </v-app-bar>
    <v-main class="pb-8">
      <NewMaterials @snackbar="onSnackBar" />
    </v-main>
    <!-- SNACKBAR -->
    <v-snackbar v-model="snackbar.show" app :color="snackbar.color" tile top>
      {{ snackbar.text }}
      <template v-slot:action="{ attrs }">
        <v-btn icon v-bind="attrs" @click="snackbar.show = false">
          <v-icon color="secondary">mdi-close</v-icon>
        </v-btn>
      </template>
    </v-snackbar>
  </v-app>
</template>
<script>
  import api from '@/api.js'
  const { apiGet } = api
  import NewMaterials from '@/views/NewMaterials'
  export default {
    name: 'App',
    components: {
      NewMaterials,
    },
    data: () => ({
      snackbar: {
        color: 'primary',
        show: false,
        text: '',
      },
    }),
    methods: {
      onSnackBar({ color = 'primary', text = '' }) {
        this.snackbar = {
          color,
          show: true,
          text,
        }
      },
    },
    async created() {
      //TEST AUTH
      try {
        const resp = await apiGet(process.env.VUE_APP_AUTH)
        if (resp?.status == 401) window.location.replace(process.env.VUE_APP_BASE_URL + 'login/?dest=http://localhost:8080')
      } catch (err) {
        if (err?.message == 401) window.location.replace(process.env.VUE_APP_BASE_URL + 'login/?dest=http://localhost:8080')
        else console.log(err) //display err message
      }
    },
  }
</script>
