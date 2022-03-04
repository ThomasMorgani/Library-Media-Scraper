<template>
  <v-card flat tile min-height="1000" width="100%">
    <v-card-title class="searchSheet align-center justify-space-between primary secondary--text">
      <p class="ma-0">RESULTS</p>
      <v-sheet ref="xx" color="transparent" class="d-flex align-center">
        <v-text-field v-model="search" clearable dense hide-details prepend-inner-icon="mdi-magnify" placeholder="Search results" rounded solo> </v-text-field>

        <v-tooltip color="primary" top>
          <template #activator="{ on }">
            <v-btn v-on="on" color="primary" min-width="0px" :width="$vuetify.breakpoint.mdAndUp ? 64 : 36" text @click="$emit('editItem', {})" class="ml-2 px-1 secondary--text">
              <v-icon color="secondary">mdi-plus-box-outline</v-icon>{{ $vuetify.breakpoint.mdAndUp ? ' ADD' : '' }}
            </v-btn>
          </template>
          <span>Add new</span>
        </v-tooltip>
      </v-sheet>
    </v-card-title>
    <v-card-text class="px-0 pt-16">
      <v-expansion-panels v-model="itemExpanded">
        <item-expansion-panel
          v-for="(item, idx) in limitBy(itemList, listItemDisplayLimit)"
          :key="item.vuekey"
          :id="'i' + item.vuekey"
          :isActivePanel="itemExpanded === idx"
          :item="item"
          :listCategory="listCategory"
          :showBtns="true"
          @delete="$emit('deleteItem', item)"
          @edit="$emit('editItem', item)"
        ></item-expansion-panel>
      </v-expansion-panels>
    </v-card-text>
    <v-card-actions>
      <v-card outlined width="100%" @click="incrementListItemDisplayLimit" class="my-4">
        <v-card-text class="text-center primary--text font-weight-medium">
          <p class="font-weight-bold ma-0">SHOWING {{ itemList.length >= listItemDisplayLimit ? listItemDisplayLimit : itemList.length }}/{{ itemList.length }} ITEMS</p>
          <p class="ma-0 mt-2" v-if="listItemDisplayLimit < itemList.length">CLICK TO LOAD MORE</p>
        </v-card-text>
      </v-card>
    </v-card-actions>
  </v-card>
</template>

<script>
  import Vue2Filters from 'vue2-filters'
  import ItemExpansionPanel from '@/components/NewMaterialExpansionPanel'
  export default {
    mixins: [Vue2Filters.mixin],
    components: {
      ItemExpansionPanel,
    },
    props: {
      items: {
        type: Array,
        default: () => [],
      },
      listCategory: {
        type: Object,
        required: true,
      },
      listItemDisplayLimit: {
        type: Number,
        required: true,
      },
    },
    data: () => ({
      itemExpanded: null,
      search: '',
    }),
    computed: {
      reffs() {
        return this.$refs.xx
      },
      itemList() {
        if (!this.search) this.search = '' //ensure falsey vals are empty string for  parsing
        return this.items.filter(i => {
          return (
            JSON.stringify(i.authors || '')
              .toLowerCase()
              .includes(this.search.toLowerCase()) ||
            JSON.stringify(i.categories || '')
              .toLowerCase()
              .includes(this.search.toLowerCase()) ||
            JSON.stringify(i.description || '')
              .toLowerCase()
              .includes(this.search.toLowerCase()) ||
            JSON.stringify(i.publisher || '')
              .toLowerCase()
              .includes(this.search.toLowerCase()) ||
            JSON.stringify(i.title || '')
              .toLowerCase()
              .includes(this.search.toLowerCase())
          )
        })
      },
      vtfy() {
        return this.$vuetify
      },
    },
    methods: {
      incrementListItemDisplayLimit() {
        if (this.incrementListItemDisplayLimit >= this.items.length) {
          return
        }
        if (this.listItemDisplayLimit + 10 > this.items.length) {
          //emit set limit
          this.$emit('setListItemDisplayLimit', this.items.length)
          // this.listItemDisplayLimit = this.items.length
        } else {
          this.$emit('setListItemDisplayLimit', this.listItemDisplayLimit + 15)
          // this.listItemDisplayLimit += 10
        }
      },
    },
  }
</script>

<style>
  .mainCard {
    overflow: visible;
  }

  .mainTitle {
    overflow: visible;
  }
  .searchSheet {
    position: -webkit-sticky; /* for safari */
    position: sticky !important;
    top: 0;
    z-index: 22;
  }
</style>
