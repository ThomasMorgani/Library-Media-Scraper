<template>
  <v-container>
    <v-row row wrap justify="center">
      <v-col cols="12" md="8" lg="7" class="text-xs-center">
        <v-card flat>
          <v-card-text>
            <v-form v-model="valid" ref="form" lazy-validation id="newArticleForm" enctype="multipart/form-data">
              <v-col cols="12" class="text-xs-center px-4">
                <v-select v-model="listCategory" label="CATEGORY" height="100%" :items="categories" :error="listCategory === null"></v-select>
              </v-col>
              <v-col class="text-xs-center px-4">
                <v-card flat>
                  <v-card-title class="primary--text text-body-2 pa-0">ITEM SOURCE</v-card-title>
                  <v-card-text class="pa-0">
                    <v-radio-group v-model="listSource" row @change="onListSourceChange">
                      <v-radio label="File" value="file"></v-radio>
                      <v-radio label="Server" value="server"></v-radio>
                      <v-radio label="Single" value="single"></v-radio>
                    </v-radio-group>
                  </v-card-text>
                </v-card>
                <v-text-field v-if="listSource === 'file'" v-model="fileName" label="Select List" @click.stop="pickFile" prepend-icon="mdi-file-upload"></v-text-field>
                <v-text-field v-if="listSource === 'server'" v-model="fileName" disabled label="Items will be retrieved from database." prepend-icon="mdi-download"></v-text-field>
                <v-text-field v-if="listSource === 'single'" v-model="fileName" autocomplete clearable label="Input ISBN/Barcode" prepend-icon="mdi-barcode"></v-text-field>
                <input type="file" style="display: none" ref="listFile" v-on:change="onFilePicked" />
              </v-col>
              <v-col class="d-flex align-center justify-center text-center px-4 py-0">
                <v-select v-model="scrapeMethod" color="primary" :disabled="listSource === 'server'" :items="scrapeMethodOptions" label="Data source"></v-select>
              </v-col>
              <v-col class="d-flex align-center justify-center text-center px-4 py-0">
                <!-- GET ITEM DETAILS -->
                <v-btn color="primary" tile @click="getItemDetails" :disabled="(listSource !== 'server' && !fileName) || !listCategory" :loading="itemsLoading" class="mx-2">
                  <v-icon left>mdi-cloud-download</v-icon>GET ITEM DETAILS
                </v-btn>
                <!-- RESET FORM -->
                <v-btn color="warning" tile width="200" @click="reset" class="mx-2"> <v-icon left small>mdi-undo</v-icon>RESET </v-btn>
                
              </v-col>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col sm="10" md="8" lg="6" class="text-xs-center">
        <template v-if="listFormatLoading">
          <v-card>
            <v-card-text>
              <v-row row wrap>
                <v-col>
                  <v-progress-linear v-if="listFormatLoading" color="purple" indeterminate></v-progress-linear>
                  <h4 class="font-weight-bold">FORMATTING LIST....{{ listFormatted.length }}</h4>
                  <p></p>
                  <v-divider></v-divider>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </template>
      </v-col>
      <template v-if="itemsLoading || listItemsFound.length > 0 || listItemsNotFound.length > 0">
        <v-col sm="10" md="10" lg="8" class="text-xs-center">
          <v-card>
            <v-card-text>
              <v-row row wrap>
                <v-col cols="12" class="text-center">
                  <v-progress-linear v-if="itemsLoading" :value="(listLinesProcessed / listFormatted.length) * 100" color="purple"></v-progress-linear>
                  <h4 class="font-weight-bold" :class="itemsLoading ? '' : 'success--text'">{{ itemsLoading ? 'LOADING ITEM DATA....' : 'COMPLETED' }}</h4>
                  <h5 class="font-weight-light" v-if="itemsLoading && itemCurrentSearch">
                    {{ itemsLoading && itemCurrentSearch ? `Currently Searching....${itemCurrentSearch}` : '' }}
                    <v-btn color="primary" text @click="cancelCurrentItemScrape(itemCurrentSearch)">
                      <v-icon color="primary" small left>mdi-chevron-double-right</v-icon>
                      <font class="primary--text font-weight-medium">SKIP ITEM</font>
                    </v-btn>
                  </h5>
                  <v-btn v-if="itemsLoading" color="error" outlined small tile   @click="cancelScrape()" class="ma-2"> <v-icon left small>mdi-stop-circle-outline</v-icon>CANCEL ALL </v-btn>
                  <p class="ma-2">
                    <v-icon color="success" class="mr-2" small v-show="listItemsFound.length > 0">mdi-check</v-icon>Data found for
                    <font class="font-weight-bold">{{ listItemsFound.length }} / {{ listFormatted.length }}</font> isbn(s).
                  </p>
                  <v-card v-if="listItemsNotFound.length > 0" flat>
                    <v-card-text class="pa-1">
                      <v-icon color="warning" left small class="mr-2">mdi-alert</v-icon>Data missing for <span class="font-weight-bold">{{ listItemsNotFound.length }}</span> isbn{{
                        listItemsNotFound.length === 1 ? '' : 's'
                      }}.
                      <v-btn color="primary" text @click="showMissing = !showMissing"
                        >{{ showMissing ? 'HIDE' : 'SHOW' }} <v-icon color="primary">{{ `mdi-chevron-${showMissing ? 'up' : 'down'}` }}</v-icon>
                      </v-btn>
                    </v-card-text>

                    <v-expand-transition>
                      <v-card-text v-show="showMissing">
                        <!-- <v-dialog v-model="modalErrors" scrollable width="500">
                          <template v-slot:activator="{ on, attrs }">
                            <v-btn v-bind="attrs" v-on="on" text color="primary "> DETAILS</v-btn>
                          </template>
                          <ErrorDetails :errors="listItemsErrors" @close="modalErrors = false"></ErrorDetails>
                        </v-dialog> -->
                        <p>Click rescan to use backup method or manually enter.</p>
                        <v-row>
                          <v-col cols="12" v-if="listItemsNotFound.length > 0 && !itemsLoading" class="text-center">
                            <v-btn block color="warning"  outlined tile @click="rescanListItemsNotFoundAll" class="mt-5"> <v-icon small left>mdi-sync</v-icon>RESCAN ALL </v-btn>
                          </v-col>
                          <v-col cols="12" md="6" lg="6" v-for="item in listItemsNotFound" :key="item">
                            <MissingItemCard
                              :key="item"
                              :error="listItemsErrorsByIsbn[item] || null"
                              :isbn="item"
                              :listCategory="listCategory"
                              @edit="onItemEdit"
                            ></MissingItemCard>
                            <v-divider></v-divider>
                          </v-col>
                        </v-row>
                      </v-card-text>
                    </v-expand-transition>
                  </v-card>
                  <v-divider></v-divider>
                </v-col>

                <v-col cols="12" class="text-center">
                  <p v-show="listItemsFound.length > 1" class="px-4" :class="listItemsFound.length > 0 ? '' : 'grey--text lighten-2'">
                    Click
                    <font class="font-weight-bold success--text" :class="listItemsFound.length > 0 ? '' : 'grey--text lighten-2'">SAVE</font> to upload list to website.
                    <br />
                    (previous {{ listCategory }} list will be overwritten)
                  </p>
                  <p v-show="listItemsFound.length < 1">No Valid Items to Save.</p>
                </v-col>
                <v-col cols="12" class="pa-y text-center">
                  <v-card :disabled="listItemsFound.length < 1 || listCategory === null || itemsLoading" flat>
                    <v-card-title class="primary--text text-body-2 pa-0">EXISTING LIST ACTION</v-card-title>
                    <v-card-text class="pa-0">
                      <v-radio-group v-model="uploadType" row>
                        <v-tooltip color="primary" max-width="400" top>
                          <template #activator="{ on }">
                            <v-radio v-on="on" label="Replace all" value="replace"></v-radio>
                          </template>
                          <span>All existing items will be removed and a new list will be created using the items below.</span>
                        </v-tooltip>
                        <v-tooltip color="primary" max-width="400" top>
                          <template #activator="{ on }">
                            <v-radio v-on="on" label="Update/Append" value="update"></v-radio>
                          </template>
                          <span>Any existing items will be updated with matching items below. Items below will be added to the updated list if they do not yet exist.</span>
                        </v-tooltip>
                      </v-radio-group>
                    </v-card-text>
                    <v-card-actions>
                      <v-btn block color="success" :loading="saveBtnLoading" tile @click="uploadList">
                        <v-icon left>mdi-content-save</v-icon>
                        {{ itemsLoading ? `Please wait...` : `SAVE ${listCategory} LIST` }}
                      </v-btn></v-card-actions
                    >
                  </v-card>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col sm="10" md="10" class="text-center px-6">
          <v-btn block color="primary" outlined tile @click="modalItemEdit = true" > <v-icon color="primary" left>mdi-plus </v-icon> ADD ITEM</v-btn>
        </v-col>
        <template v-if="listItemsFound.length > 0">
          <v-col sm="10" md="10" class="text-center">
            <new-material-list :listCategory="categories.find(c => c.value === listCategory)"  :items="listItemsDisplayed" :listItemDisplayLimit="listItemDisplayLimit" @deleteItem="onItemDelete" @editItem="onItemEdit" @setListItemDisplayLimit="listItemDisplayLimit = $event"></new-material-list>
          </v-col>
        </template>
      </template>
      <v-col v-if="listFormatted.length < 1" cols="12" md="8">
        <v-card>
          <v-card-text class="pa-4">
            <v-col md6 offset-md3 class="text-xs-left">
              <ul>
                <li>Select a list category and item source.</li>
                <li>If item list source is file, click input field to select a local file. If single, type in a single ISBN/Barcode.</li>
                <li>Optionally; select a source to retrieve item details from.</li>
                <li>Click "Get Item Details" button to find select item(s) details.</li>
                <li>Once completed, items will be displayed below for manual intervention and saving.</li>
              </ul>
            </v-col>
          </v-card-text>
        </v-card>
      </v-col>
      <!-- CONFIRM DELETE MODAL -->
      <v-dialog v-model="modalItemDelete" :key="`modalDelete${itemEditing && itemEditing.vuekey ? itemEditing.vuekey : ''}`" persistent width="600">
        <v-card v-if="modalItemDelete">
          <v-card-title class="primary secondary--text align-center justify-center"> CONFIRM DELETE </v-card-title>
          <v-card-text class="text-center pt-4">
            <p class="mb-0">Are you sure you want to confirm the following item?</p>
            <p>This cannot be undone</p>
            <v-card tile class="my-8">
              <v-card-text class="d-flex align-start justify-start">
                <v-sheet color="transparent" class="flex-shrink-1">
                <v-img :src="itemEditing.imageLinks && itemEditing.imageLinks.thumbnail ? itemEditing.imageLinks.thumbnail : ''"></v-img>
                </v-sheet>
                <v-sheet color="transparent" class="d-flex flex-column flex-grow-1 align-start justify-start text-left px-4">
                  <span class="text-h6 primary--text">{{ itemEditing.title }}</span>
                  <span><strong>{{ itemEditing.vuekey }}</strong></span>
                  <span>{{ !itemEditing.description ? '' : `${itemEditing.description.substring(0, 200)}${itemEditing.description.length > 200 ? '...' : ''}`   }}</span>
                </v-sheet>
              </v-card-text>
            </v-card>
            <v-btn block color="error" @click="deleteItem(itemEditing)" class="mt-8">DELETE</v-btn>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn text color="primary" @click="onCloseModalItemDelete"> CANCEL </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <!-- EDIT ITEM MODAL -->
      <v-dialog v-model="modalItemEdit" :key="`modalEdit${modalItemEdit + ''}${itemEditing && itemEditing.vuekey ? itemEditing.vuekey : ''}`" persistent width="500">
        <item-edit :item="itemEditing" @close="onCloseModalItemEdit" @save="onItemSave"></item-edit>
      </v-dialog>
    </v-row>

  </v-container>
  </v-container>
</template>

<script>
  // import axios from 'axios'
  import api from '@/api.js'
  const { apiGet, apiPost } = api
  import Vue2Filters from 'vue2-filters'
  // import ErrorDetails from '@/components/ErrorDetails'
  // import ItemEdit from '@/components/ItemEdit'
  import MissingItemCard from '@/components/MissingItemCard'
  import NewMaterialList from '@/components/NewMaterialList'

  export default {
    name: 'NewMaterial',
    components: {
      // ErrorDetails,
      ItemEdit: () => import('@/components/ItemEdit'),
      MissingItemCard,
      NewMaterialList,
    },
    mixins: [Vue2Filters.mixin],
    data: () => ({
      axiosControllers: {},
      categories: [
        {
          defaultImage: 'audiobook.jpg',
          defaultScrapeMethod: 'livebrary',
          isBook: false,
          listCategory: '',
          text: 'AUDIO BOOKS',
          value: 'audiobook',
        },
        {
          defaultImage: 'disc.jpg',
          defaultScrapeMethod: 'livebrary',
          isBook: false,
          listCategory: '',
          text: 'BLU-RAY',
          value: 'bluray',
        },
        {
          defaultImage: 'disc.jpg',
          defaultScrapeMethod: 'livebrary',
          isBook: false,
          listCategory: '',
          text: 'DVDs',
          value: 'dvd',
        },
        {
          defaultImage: 'book.jpg',
          defaultScrapeMethod: 'google',
          isBook: true,
          listCategory: '',
          text: 'FICTION',
          value: 'fiction',
        },
        {
          defaultImage: 'book.jpg',
          defaultScrapeMethod: 'google',
          isBook: true,
          listCategory: '',
          text: 'LARGE PRINT',
          value: 'largeprint',
        },
        {
          defaultImage: 'disc.jpg',
          defaultScrapeMethod: 'livebrary',
          isBook: false,
          listCategory: '',
          text: 'MUSIC CDs',
          value: 'musiccd',
        },
        {
          defaultImage: 'book.jpg',
          defaultScrapeMethod: 'google',
          isBook: true,
          listCategory: '',
          value: 'nonfiction',
          text: 'NON-FICTION',
        },
        {
          defaultImage: 'book.jpg',
          defaultScrapeMethod: 'google',
          isBook: true,
          listCategory: '',
          text: 'YA BOOKS',
          value: 'ya',
        },
      ],
      file: null,
      fileInput: null,
      fileName: null,
      fileUrl: null,
      itemCurrentSearch: null,
      itemEditing: {},
      itemsLoading: false,
      listCategory: 'dvd', //'fiction'
      listDuplicatesFound: 0,
      listFormatted: [],
      listFormatLoading: false,
      listItemDisplayLimit: 15,
      listItemsErrors: [],
      listItemsFound: [],
      listItemsNotFound: [],
      listItemsSkipped: [],
      listLinesProcessed: 0,
      listSource: 'file',
      listValidLinesCount: 0,
      livebraryMethod: false,
      modalErrors: false,
      modalItemDelete: false,
      modalItemEdit: false,
      rescanListItemsNotFound: false,
      saveBtnLoading: false,
      scrapeCancelled: false,
      scrapeMethod: 'default',
      scrapeMethodOptions: [
        {
          text: 'Default',
          value: 'default',
        },
        {
          text: 'Google Books',
          value: 'google',
        },
        {
          text: 'Live-brary',
          value: 'livebrary',
        },
      ],
      scrapeTimeoutIds: [],
      showMissing: false,
      uploadType: 'replace',
      valid: true,
    }),
    computed: {
      libraryImage() {
        if (this.$vuetify.breakpoint.name === 'xs' || this.$vuetify.breakpoint.name === 'sm') {
          return '/images/sm/library_front.jpg'
        } else {
          return '/images/lg/library_front.jpg'
        }
      },
      listItemsDisplayed() {
        return this.orderBy(this.listItemsFound, 'title')
      },
      listItemsErrorsByIsbn() {
        return this.listItemsErrors.reduce((acc, curr) => {
          return { ...acc, [curr.item]: curr.error }
        }, {})
      },
    },
    methods: {
      cancelCurrentItemScrape(item) {
        if (this.axiosControllers[item]) {
          this.axiosControllers[item].abort('Item Skipped')
          this.listItemsSkipped = [...this.listItemsSkipped, item]
          delete this.axiosControllers[item]
        }
      },
      cancelScrape() {
        const defaultVals = {
          listFormatLoading: false,
          itemCurrentSearch: null,
          itemsLoading: false,
          // listFormatted: [],
          // listItemDisplayLimit: 15,
          // listItemsFound: [],
          // listItemsNotFound: [],
          listLinesProcessed: 0,
          listValidLinesCount: 0,
          saveBtnLoading: false,
          scrapeTimeoutIds: []
        }
        this.scrapeCancelled = true
        this.scrapeTimeoutIds.forEach(id => clearTimeout(id))
        Object.keys(this.axiosControllers).forEach(k => this.cancelCurrentItemScrape(k))
        //TODO: FINISH ? ADD ITEMS TO NOT FOUND LIST?
        // const remainingItems = this.listFormatted.filter(x => !this.listItemsFound.includes(x));
        // console.log(remainingItems)
        // console.log([...this.listItemsErrors])
        // console.log([...this.listItemsNotFound])
        // remainingItems.forEach(i => {
        //   this.listItemsErrors = [...this.listItemsErrors, {item: i, error: 'cancelled'}]
        //   this.listItemsNotFound = [...this.listItemsNotFound, i]
        // })
        Object.keys(defaultVals).forEach(k => (this[k] = defaultVals[k]))
        this.scrapeCancelled = false
      },
      deleteItem(item) {
        this.listItemsNotFound = this.listItemsNotFound.filter(i => i.vuekey !== item.vuekey)
        this.listItemsFound = this.listItemsFound.filter(i => i.vuekey !== item.vuekey)
        this.itemEditing = {}
        this.modalItemDelete = false
        this.$emit('snackbar', {color: 'success' , text: 'Item removed'})
      },      
      determineScrapeMethod() {
        const category = this.categories.find(c => c.value === this.listCategory)
        switch (this.scrapeMethod) {
          case 'google': {
            return 'scrapeGoogle'
          }
          case 'livebrary': {
            return 'scrapeCatalog'
          }
          case 'default': {
            return category?.isBook ? 'scrapeGoogle' : 'scrapeCatalog'
          }
        }
      },
      formatBookData(item) {
        const itemData = {
          title: '',
          authors: [],
          categories: [],
          vuekey: '',
          description: '',
          catalogUrl: '',
          imageLinks: [],
          length: '',
          publishedDate: '',
          publisher: '',
        }
        //TRY TO SET KEY AS ISBN 13
        if (!item.vuekey || item.vuekey === null) {
          if (item.industryIdentifiers && item.industryIdentifiers.length > 0) {
            item.industryIdentifiers.forEach((identifier, key) => {
              if (identifier.type === 'ISBN_13') {
                itemData.vuekey = identifier.identifier
              }
            })
            if (itemData.vuekey === null) {
              itemData.vuekey = item.industryIdentifiers['0'].identifier
            }
          } else if (item.key && item.key !== null) {
            itemData.vuekey = item.key
          } else {
            itemData.vuekey = item.pageCount + item.publishedDate
          }
        } else {
          itemData['vuekey'] = item['vuekey']
        }

        const category = this.categories.find(c => c.value === this.listCategory)
        if (category?.isBook) {
          itemData.length = item.pageCount + ' pages' || null
        } else {
          itemData.length = item.length
        }

        itemData.title = item.title || null
        itemData.authors = item.authors || itemData.authors.push(null)
        itemData.categories = item.categories || itemData.categories.push(null)
        itemData.description = item.description || null
        itemData.catalogUrl = itemData.catalogUrl ? itemData.catalogUrl : process.env.VUE_APP_CATALOG_ENDPOINT.replaceAll('[placeholder]', itemData.vuekey)
        itemData.imageLinks = item.imageLinks || itemData.imageLinks.push(null)
        itemData.publishedDate = item.publishedDate || null
        itemData.publisher = item.publisher || null

        return itemData
      },
      formatList(file) {
        return new Promise((resolve, reject) => {
          this.listFormatted = []
          this.listDuplicatesFound = 0
          this.listFormatLoading = true
          this.saveBtnLoading = true

          if (this.listSource === 'single') {
            this.listFormatted.push(this.fileName)
            this.listValidLinesCount++
            resolve()
            return
          }

          let preFormatList = []
          let item = ''
          let workingItem = ''
          let itemCleanup = null
          const fr = new FileReader()
          fr.readAsText(this.file)
          fr.addEventListener('load', () => {
            this.fileUrl = fr.result
            const formattedFile = this.fileUrl.replace(/[\n\r]/g, '\r').split('\r')
            formattedFile.forEach(item1 => {
              //CHECK FOR MULTIPLE ITEMS ON ONE LINE
              workingItem = item1.replace(/\"/g, '').split(';')
              if (encodeURIComponent(workingItem).search('%09') > -1) {
                itemCleanup = encodeURIComponent(workingItem).split('%09')
                itemCleanup.forEach(item2 => {
                  if (item2 !== '') {
                    preFormatList.push(item2)
                  }
                })
              } else {
                preFormatList.push(workingItem['0'])
              }
            })

            preFormatList.forEach((line, key) => {
              if (encodeURIComponent(line) !== 'ISBN%20%23s' && line !== '') {
                item = line.trim()
                if (!isNaN(item) && item.length > 6) {
                  if (this.listFormatted.indexOf(item) < 0) {
                    this.listFormatted.push(item)
                    this.listValidLinesCount++
                  } else {
                    this.listDuplicatesFound++
                  }
                }
              }
            })
            resolve(this.formattedFile)
          })
        })
      },
      async getItemDetails() {
        this.itemsLoading = true
        this.listItemsFound = []
        if (this.listSource === 'server') {
          apiGet(process.env.VUE_APP_BASE_ENPOINT + 'getList/' + this.listCategory).then(
            resp => {
              if (resp?.data && Array.isArray(resp.data)) {
                this.listFormatted = resp.data.map(i => i.vuekey)
                this.listItemsFound = [...resp.data] || []
                this.listLinesProcessed = resp.data.length || 0
                this.itemsLoading = false
              }
            }).catch(err => console.log(err))
          return;
        }
        //RESET EXISTING VALUES
        if (!this.rescanListItemsNotFound) {
          this.listLinesProcessed = 0
          this.listItemsFound = []
          this.listItemsNotFound = []
          try {
            await this.setFile()
          } catch (err) {
            console.log('error setting file')
            console.log(err)
          }
        }
        await this.formatList(this.fileUrl)
        this.listFormatLoading = false
        this.saveBtnLoading = false
        let workingItem = {}
        const scrapeMethodName = this.determineScrapeMethod()
        const scrapeMethod = this[scrapeMethodName]

        //throttle requests 
        //warning! google books api  quota 100req/min (1000 max a day)
        // DISABLED TO 1 REQ/SEC for demo
        // const reqPerSec = 5
        // const reqPerMin = 60
        // const reqThrottle = scrapeMethodName === 'scrapeGoogle' ? reqPerMin : reqPerSec
        let timeout = 0
        for (let idx in this.listFormatted) {
          //if cancelled, eject
          if (this.scrapeCancelled) {
            break
          }

          //throttle
          timeout += 1000
          // if (idx > 0 && idx % reqThrottle  === 0 ) {
          //   timeout += scrapeMethodName === 'scrapeGoogle' ? 60000 : 1000
          // } 

          const timeoutId = setTimeout(async () => {
            const line = this.listFormatted[idx].trim()
            this.itemCurrentSearch = line
            try {
              const resp = await scrapeMethod(line)
              if (resp.error) {
                console.log(resp)
                this.listItemsErrors = [...this.listItemsErrors, { error: resp.error, item: line }]
                this.listItemsNotFound = [...this.listItemsNotFound, line]
                // if (resp?.error === 'canceled') this.listItemsSkipped = [...this.listItemsSkipped, line]
                // if (resp.statusText && resp.statusText !== 'OK') throw new Error(resp?.status)
                // if (resp?.data.itemsNotFound.length > 0) throw new Error(resp.data.itemsNotFound)
              }
              if (resp?.data) {
                if (resp?.data?.itemsNotFound?.length > 0) {
                  this.listItemsErrors = [...this.listItemsErrors, { error: 'Unable to find item', item: line }]
                  this.listItemsNotFound = [...this.listItemsNotFound, line]
                } else {
                  const workingItem = resp.data.itemsData[0]
                  this.listItemsFound = [...this.listItemsFound, workingItem]
                }
              }
            } catch (error) {
              //handle misc errors
              console.log('error from getItemDetails catch')
              console.dir(error)
            }
            this.listLinesProcessed++

            if (this.axiosControllers[line]) delete this.axiosControllers[line]
            if (this.listLinesProcessed === this.listFormatted.length) {
              this.itemsLoading = false
            }
          }, timeout)
          this.scrapeTimeoutIds.push(timeoutId)
        }
      },
      onCloseModalItemDelete() {
        this.modalItemDelete = false
        this.itemEditing = {}
      },
      onCloseModalItemEdit() {
        this.modalItemEdit = false
        this.itemEditing = {}
      },
      onFilePicked(e) {
        const files = e.target.files
        if (files[0] !== undefined) {
          this.fileName = files[0].name
          this.file = files[0]
          if (this.fileName.lastIndexOf('.') <= 0) {
            console.log('onFilePicked all ifs passed, returned')
            return true
          }
        }
        return false
      },
      onItemDelete(item) {
        this.itemEditing = { ...item }
        this.modalItemDelete = true
      },
      onItemEdit(item) {
        this.itemEditing = { ...item }
        this.modalItemEdit = true
      },
      onItemSave(item) {
        this.listItemsNotFound = this.listItemsNotFound.filter(i => i.vuekey !== item.vuekey)
        this.listItemsFound = [...this.listItemsFound.filter(i => i.vuekey !== item.vuekey), item]
        const savedItemIdx = this.listItemsDisplayed.findIndex(i => i.vuekey === item.vuekey)
        if (savedItemIdx + 1 > this.listItemDisplayLimit) this.listItemDisplayLimit = savedItemIdx + 5 //ensure save item visible in list (with 5 item buffer) to scroll to
        this.$emit('snackbar', {color: 'success' , text: 'Item updated'})
        this.modalItemEdit = false
        this.itemEditing = {}
        //TODO: set items showing to items found length, then scroll to
        //TODO: clean up console logs, api.js, 48, 49 and others... new material 502, 505 554

        this.$nextTick(() => this.$vuetify.goTo('#i' + item.vuekey))
      },
      onListSourceChange(listSource) {
        this.fileInput = ''
        this.fileName = ''
        if (listSource === 'single') this.uploadType = 'update'
      },
      pickFile() {
        this.$refs.listFile.click()
      },
      rescanListItemsNotFoundAll() {
        this.livebraryMethod = true
        this.rescanListItemsNotFound = true
        this.fileUrl = this.listItemsNotFound
        this.listLinesProcessed = 0
        this.getItemDetails()
      },
      resetScanType() {
        this.livebraryMethod = false
        this.rescanListItemsNotFound = false
        this.fileUrl = null
        this.listLinesProcessed = 0
      },
      reset() {
        const defaultVals = {
          expandedPanel: null,
          fileInput: null,
          fileName: null,
          fileUrl: null,
          file: null,
          listFormatLoading: false,
          itemCurrentSearch: null,
          itemEditing: {},
          itemsLoading: false,
          listCategory: '',
          listFormatted: [],
          listItemDisplayLimit: 15,
          listItemsFound: [],
          listItemsNotFound: [],
          listLinesProcessed: 0,
          listSource: 'file',
          listValidLinesCount: 0,
          saveBtnLoading: false,
          valid: true,
        }
        this.cancelScrape()
        Object.keys(defaultVals).forEach(k => (this[k] = defaultVals[k]))
        this.$refs.listFile.value = ''
      },

      async scrapeCatalog(item) {
        return new Promise(async (resolve, reject) => {
          this.axiosControllers[item] = new AbortController()
          const url = process.env.VUE_APP_CATALOG_SCRAPER_ENDPOINT + this.listCategory
          const response = await apiPost(
            url,
            {
              itemList: [item],
            },
            this.axiosControllers[item],
          )
          resolve(response)
        })
      },
      scrapeGoogle(item) {
        return new Promise(async (resolve, reject) => {
        const apiKey = process.env.VUE_APP_G_BOOKS_API_KEY
        const apiUrl = `https://www.googleapis.com/books/v1/volumes?q=isbn:${item}&key=${apiKey}`
        this.axiosControllers[item] = new AbortController()
        let itemData = {}
         apiGet(apiUrl, this.axiosControllers[item], false).then(
            resp => {
              if (resp) {
                this.source = null
                //MAP CONSTANT
                const itemDetails = resp.data.totalItems > 0 ? this.formatBookData(resp.data.items[0].volumeInfo) : false
                //getItemDetails expects this format {data:{itemsData: [{objOfItemData}], itemsNotFound: ['arrayOfISBNStrings']}}
                const data = {
                  data:{
                    itemsData: itemDetails ? [itemDetails] : [],
                    itemsNotFound: itemDetails ? [] : [item],
                  }
                }
                resolve(data)
              }
            }).catch(err => console.log(err))
        })
      },
      setFile() {
        return new Promise((res, rej) => {
          if (!this.file) {
            res()
          }
          const fr = new FileReader()
          fr.readAsText(this.file)
          fr.addEventListener('load', () => {
            this.fileUrl = fr.result
            res()
          })
        })
      },
      uploadList() {
        this.saveBtnLoading = true
        let data = new FormData()
        data.append('listItems', JSON.stringify(this.listItemsFound))
        data.append('cat', this.listCategory)
        const url = `${process.env.VUE_APP_UPLOAD_ENDPOINT}/${this.uploadType}`
        apiPost(url, data, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }).then(response => {
            this.saveBtnLoading = false
            if (response.data.status === 'login') {
              console.log('login returned as response')
            }
            const status = response?.data?.status || 'primary'
            const text = response?.data?.message || '-'
            this.$emit('snackbar', {color: status , text: text})
          })
          .catch(e => {
            console.log(e)
          })
      },
    },
  }
</script>
<style scoped>
  p {
    margin: 0 !important;
  }
</style>
