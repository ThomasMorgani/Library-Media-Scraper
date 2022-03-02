<template>
  <v-card class="d-flex align-center justify-space-between mt-2">
    <v-tooltip color="primary" :disabled="!error" top>
      <template #activator="{ on }">
        <v-sheet v-on="on" class="d-flex align-center justify-start flex-grow-1">
          <p grow class="text-xs-left font-weight-black px-2 mb-0">{{ isbn }}</p>
        </v-sheet>
      </template>
      <span>{{ error || '' }}</span>
    </v-tooltip>
    <v-sheet class="d-flex flex-nowrap align-center justify-end flex-shrink-1">
      <v-tooltip color="primary" top>
        <template #activator="{ on }">
          <v-btn v-on="on" icon text small color="primary" :href="`https://www.google.com/search?q=${encodeURIComponent(listCategory)}+${isbn}`" target="blank" class>
            <v-icon>mdi-magnify</v-icon>
          </v-btn>
        </template>
        <span>Google ISBN/UPC in new tab</span>
      </v-tooltip>
      <v-tooltip color="primary" top>
        <template #activator="{ on }">
          <v-icon v-on="on" color="success" class="pa-2">mdi-autorenew</v-icon>
        </template>
        <span>Rescan (coming soon)</span>
      </v-tooltip>
      <v-tooltip color="primary" top>
        <template #activator="{ on }">
          <v-btn v-on="on" color="warning" icon @click="$emit('edit', { vuekey: isbn })" class="pa-2"> <v-icon color="warning">mdi-square-edit-outline</v-icon> </v-btn>
        </template>
        <span>Manual Edit</span>
      </v-tooltip>
    </v-sheet>
  </v-card>
</template>

<script>
  export default {
    name: 'MissingItemCard',
    props: {
      isbn: {
        type: String,
        required: true,
      },
      error: {
        type: String,
        required: false,
      },
      listCategory: {
        type: String,
        required: true,
      },
    },
  }
</script>

<style lang="scss" scoped></style>
