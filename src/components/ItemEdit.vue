<template>
  <v-card>
    <v-card-title class="primary secondary--text justify-center primary--text">{{ !itemEditing.vuekey ? 'ADD' : 'EDIT' }} ITEM</v-card-title>
    <v-card-text class="d-flex flex-column pt-4">
      <v-text-field v-if="!item.vuekey" v-model="itemEditing.vuekey" color="primary" label="ISBN/Code"></v-text-field>
      <p v-else><strong>ISBN/CODE: </strong> {{ item.vuekey || '-' }}</p>
      <v-text-field v-model="itemEditing.title" color="primary" label="Title"></v-text-field>
      <v-text-field v-model="itemEditing.catalogUrl" color="primary" label="Title URL"></v-text-field>
      <v-text-field v-model="itemEditing.imageLinks.thumbnail" color="primary" label="Image SRC"></v-text-field>
      <v-textarea v-model="itemEditing.description" color="primary" label="Description"></v-textarea>
      <v-combobox v-model="itemEditing.categories" color="primary" :items="genres" label="Genres" multiple></v-combobox>
      <v-text-field v-model="itemEditing.publisher" color="primary" label="Publisher"></v-text-field>
      <v-text-field v-model="itemEditing.publishedDate" color="primary" label="Publish Year"></v-text-field>
    </v-card-text>
    <v-card-actions>
      <v-btn color="primary" text @click="$emit('close')">CANCEL</v-btn>
      <v-spacer></v-spacer>
      <v-btn color="success" text @click="saveItem">SAVE</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
  export default {
    name: 'ItemEdit',
    props: {
      item: {
        type: Object,
        required: true,
      },
    },
    data: () => ({
      genres: ['Action', 'Animated', 'Childrens', 'Comedy', 'Documentary', 'Drama', 'Family', 'Fantasty', 'Horror', 'Mystery', 'Romance', 'Sci-fi', 'Thriller', 'Western'],
      itemEditing: {
        catalogUrl: '',
        categories: [],
        description: '',
        imageLinks: { thumbnail: '' },
        length: '',
        // listCategory: '',
        publishedDate: '',
        publisher: '',
        title: '',
        vuekey: '',
      },
    }),
    methods: {
      saveItem() {
        this.$emit('save', this.itemEditing)
      },
    },
    mounted() {
      this.itemEditing = { ...this.itemEditing, ...this.item }
    },
  }
</script>

<style lang="scss" scoped></style>
