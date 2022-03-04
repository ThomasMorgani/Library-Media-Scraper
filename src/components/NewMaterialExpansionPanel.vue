<template>
  <v-expansion-panel style="width: 100%">
    <v-expansion-panel-header>
      <v-row row wrap align-center>
        <v-col cols="2" class="d-flex align-center justify-center">
          <v-img :src="thumbnailSrc" contain min-height="60px" max-height="100px" min-width="60px" max-width="100px"></v-img>
        </v-col>
        <v-col cols="10" class="d-flex flex-column align-start justify-start pa-3">
          <a @click.stop target="_blank" :href="item.catalogUrl" class="text-xs-left font-weight-medium title">{{ item.title }}</a>
          <p class="text-xs-left font-weight-light font-italic subheading">{{ item.authors ? item.authors[0] : item.author }}</p>
          <div v-if="item.description" class="descFlex text-xs-left body-1" v-html="isActivePanel ? item.description : item.description.substring(0, 200) + '...'"></div>
        </v-col>
      </v-row>
    </v-expansion-panel-header>
    <v-expansion-panel-content>
      <v-col cols="10" offset="2" class="d-flex flex-column align-start justify-start px-0">
        <span>
          <font class="font-weight-bold mr-2">GENRE:</font>
          <font v-for="(category, catKey) in item.categories" :key="catKey">{{ catKey === item.categories.length - 1 ? category : category + ',' }}</font>
        </span>
        <span>
          <font class="font-weight-bold mr-2">LENGTH:</font>
          <font>{{ item.length }}</font>
        </span>
        <span>
          <font class="font-weight-bold mr-2">PUBLISHING:</font>
          <font>{{ `${item.publisher || ''}${item.publisher && item.publishedDate ? ', ' : ''}${item.publishedDate || ''}` }}</font>
        </span>
      </v-col>
      <v-col v-if="showBtns" cols="10" offset="2" class="d-flex align-end justify-end px-0">
        <v-tooltip color="primary" top>
          <template #activator="{ on }">
            <v-btn v-on="on" color="error" icon text @click.prevent="$emit('delete', item)" class="mr-2"><v-icon>mdi-trash-can</v-icon></v-btn>
          </template>
          <span>Delete</span>
        </v-tooltip>
        <v-tooltip color="primary" top>
          <template #activator="{ on }">
            <v-btn v-on="on" color="warning" icon text @click.prevent="$emit('edit', item)"><v-icon>mdi-application-edit-outline</v-icon></v-btn>
          </template>
          <span>Edit</span>
        </v-tooltip>
      </v-col>
    </v-expansion-panel-content>
  </v-expansion-panel>
</template>
<script>
  export default {
    name: 'newItemExpansionPanel',
    props: {
      item: {
        type: Object,
        required: true,
      },
      isActivePanel: {
        type: Boolean,
        default: () => false,
      },
      listCategory: {
        type: Object,
        required: true,
      },
      showBtns: {
        type: Boolean,
        default: () => false,
      },
    },
    computed: {
      thumbnailSrc() {
        if (this.item.imageLinks) {
          if (this.item.imageLinks.thumbnail && typeof this.item.imageLinks.thumbnail === 'string') {
            return this.item.imageLinks.thumbnail
          }
          if (this.item.imageLinks['0'] && typeof this.item.imageLinks['0'] === 'string') {
            return this.item.imageLinks['0']
          }
        }
        return `/assets/images/${this.listCategory.defaultImage}`
      },
      thumbnailMaxHeight() {
        return this.listCategory.isBook ? 100 : 50
      },
    },
  }
</script>
