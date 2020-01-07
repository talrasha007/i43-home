<template>
  <v-container>
    <okex-api-settings v-if="!$store.state.okex.loggedIn" />
    <v-row>
      <v-col cols="3">
        <v-select :items="coins" v-model="coin" item-text="0" :item-value="v => v" label="COIN" />
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" sm="6">
        <quotation-table :token="coin[0]" :digits="coin[1]" />
      </v-col>
      <v-col cols="12" sm="6">
        <positions :coin="coin[0]" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapState } from 'vuex'
import OkexApiSettings from '../components/OkexApiSettings'
import QuotationTable from '../components/QuotationTable'
import Positions from '../components/Positions'

export default {
  name: 'Trade',
  components: { OkexApiSettings, QuotationTable, Positions },
  computed: {
    ...mapState('okex', ['coins'])
  },
  data() {
    return {
      coin: ['BTC', 2]
    }
  }
}
</script>

<style scoped>

</style>