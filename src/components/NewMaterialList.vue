<template>
  <v-sheet color="transparent" width="100%">
    <v-expansion-panels popout v-model="itemExpanded">
      <item-expansion-panel
        v-for="(item, idx) in limitBy(items, listItemDisplayLimit)"
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
    <v-card outlined @click="incrementListItemDisplayLimit" class="my-4">
      <v-card-text class="text-center primary--text font-weight-medium">
        <p class="ma-0">SHOWING {{ items.length >= listItemDisplayLimit ? listItemDisplayLimit : items.length }}/{{ items.length }} ITEMS</p>
        <p v-if="listItemDisplayLimit < items.length">CLICK TO LOAD MORE</p>
      </v-card-text>
    </v-card>
    <v-spacer></v-spacer>
  </v-sheet>
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
    }),
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

<style></style>
