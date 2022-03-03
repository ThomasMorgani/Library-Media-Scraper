<template>
  <v-app>
    <v-app-bar app color="primary" dark>
      <v-app-bar-title>NEW MATERIALS</v-app-bar-title>
    </v-app-bar>
    <v-main class="pb-8" v-scroll="onScroll">
      <NewMaterials @snackbar="onSnackBar" ref="newMaterial" />
    </v-main>
    <!-- SNACKBAR -->
    <v-snackbar v-model="snackbar.show" app :color="snackbar.color" tile top>
      {{ snackbar.text }}
      <template v-slot:action="{ attrs }">
        <v-btn icon v-bind="attrs" @click="snackbar.show = false">
          <v-icon color="secondary">mdi-close</v-icon>
        </v-btn>
        <!-- SCROLL TO TOP BUTTON-->
      </template>
    </v-snackbar>
    <v-fab-transition>
      <v-btn app fixed fab bottom color="primary" right v-show="scrollTopBtn" style="z-index: 5" @click="$vuetify.goTo(scrollTopTarget, scrollTopOptions)">
        <v-icon color="secondary">mdi-chevron-double-up</v-icon>
      </v-btn>
    </v-fab-transition>
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
      scrollTopOptions: {
        duration: 300,
        offset: 0,
        easing: 'easeInOutCubic',
      },
      scrollTopBtn: false,
      scrollTopTarget: 0,
      snackbar: {
        color: 'primary',
        show: false,
        text: '',
      },
    }),
    computed: {
      test() {
        console.log(this.$refs.newMaterial)
        return this.$refs
      },
    },
    methods: {
      onScroll(e) {
        this.scrollTopBtn = e?.srcElement?.scrollingElement?.scrollTop > 500
      },
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
