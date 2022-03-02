<template>
  <v-card>
    <v-card-title class="justify-center align-center text-h5 primary--text"> ERROR DETAILS </v-card-title>
    <v-card-text style="height: 300px">
      <v-list three-line>
        <v-list-item v-for="error in errors" :key="error.item">
          <v-list-item-content>
            <v-list-item-title>{{ error.item }}</v-list-item-title>
            <v-list-item-subtitle>{{ error.error }}</v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn color="primary" text @click="$emit('close')"> CLOSE </v-btn>
    </v-card-actions>
  </v-card>
</template>
<script>
  export default {
    name: 'ErrorDetails',
    props: {
      errors: {
        type: Array,
        default: () => [],
      },
    },
  }
</script>
<style lang="scss" scoped></style>
