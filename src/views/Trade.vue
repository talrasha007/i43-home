<template>
  <v-container>
    <v-row align="center">
      <v-col cols="3">
        <v-select :items="coins" v-model="coin" item-text="0" :item-value="v => v" label="COIN" />
      </v-col>
      <v-col cols="3">
        <v-btn-toggle mandatory>
          <v-btn @click="ins = 'USD'">USD</v-btn>
          <v-btn @click="ins = 'USDT'">USDT</v-btn>
        </v-btn-toggle>
      </v-col>
      <v-col cols="3">
        <trade-dialog />
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <positions :coin="coin[0]" :ins="ins" :digits="coin[1]" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapState } from 'vuex'
import TradeDialog from '../components/TradeDialog'
import Positions from '../components/Positions'

export default {
  name: 'Trade',
  components: { TradeDialog, Positions },
  computed: {
    ...mapState('okex', ['coins'])
  },
  data() {
    return {
      coin: ['BTC', 2],
      ins: 'USD'
    }
  }
}
</script>

<style scoped>

</style>