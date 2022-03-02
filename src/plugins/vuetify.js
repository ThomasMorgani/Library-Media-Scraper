import Vue from 'vue'
import Vuetify from 'vuetify/lib/framework'
Vue.use(Vuetify)
export default new Vuetify({
  icons: {
    iconfont: 'mdi',
  },
  theme: {
    dark: false,
    themes: {
      light: {
        background: '#fafafa',
        primary: '#2c4776',
        secondary: '#fff',
        accent: '#8c9eff',
        error: '#b71c1c',
      },
      dark: {
        background: '#fafafa',
        primary: '#2c4776',
        secondary: '#b0bec5',
        accent: '#8c9eff',
        error: '#b71c1c',
      },
    },
  },
})
