<template>
  <v-dialog max-width="500px">
    <template v-slot:activator="{ on }">
      <v-btn :disabled="tradePair.length !== 2" class="primary" v-on="on">交易</v-btn>
    </template>

    <v-card>
      <v-card-title primary-title>
        交易
      </v-card-title>
      <v-card-text v-if="tradePair.length === 2">
        <div v-for="[long, short] of [[0, 1], [1,0]]" :key="'open' + long">
          <v-simple-table v-slot:default v-if="tradePair[long].ask < tradePair[short].bid">
            <thead><tr><th/><th>价格</th><th>%</th></tr></thead>
            <tbody>
              <tr>
                <td>{{tradePair[long].name}}</td>
                <td>{{tradePair[long].ask}}</td>
                <td></td>
              </tr>
              <tr>
                <td>{{tradePair[short].name}}</td>
                <td class="pos">{{tradePair[short].bid}}</td>
                <td class="pos">{{tradePair[short].bid / tradePair[long].ask | percent}}</td>
              </tr>
              <tr>
                <td></td>
                <td class="pos">{{tradePair[short].bid - tradePair[long].ask | price}}</td>
                <td class="pos">{{(tradePair[short].bid - tradePair[long].ask) / tradePair[long].ask | percent}}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td colspan="2"><v-text-field v-model="openCont" type="number" label="数量" /><td>
                <td><v-btn :disabled="executing" @click="open(long, short)" class="primary">开仓</v-btn></td>
              </tr>
            </tfoot>
          </v-simple-table>
        </div>

        <div v-for="[long, short] of [[0, 1], [1,0]]" :key="'close' + long">
          <v-simple-table v-slot:default v-if="canClose(long, short)">
            <thead><tr><th></th><th>价格</th><th>开仓价</th><th>持仓</th><th>%</th></tr></thead>
            <tbody>
              <tr>
                <td>{{tradePair[long].name}}</td>
                <td>{{tradePair[long].ask}}</td>
                <td>{{tradePair[long].short_avg_cost | price}}</td>
                <td>{{tradePair[long].short_avail_qty}}</td>
                <td></td>
              </tr>
              <tr>
                <td>{{tradePair[short].name}}</td>
                <td>{{tradePair[short].bid}}</td>
                <td>{{tradePair[short].long_avg_cost | price}}</td>
                <td>{{tradePair[short].long_avail_qty}}</td>
                <td></td>
              </tr>
              <tr>
                <td></td>
                <td :class="{ pos: getPosCloseDiff(long, short) > 0, neg: getPosCloseDiff(long, short) < 0}">
                  {{getPosCloseDiff(long, short) | price}}
                </td>
                <td :class="{ pos: getPosOpenDiff(long, short) > 0, neg: getPosOpenDiff(long, short) < 0}">
                  {{getPosOpenDiff(long, short) | price}}
                </td>
                <td :class="{ pos: posProfit(long, short) > 0, neg: posProfit(long, short) < 0}">
                  {{posProfit(long, short) | price}}
                </td>
                <td :class="{ pos: posProfit(long, short) > 0, neg: posProfit(long, short) < 0}">
                  {{posProfit(long, short) / tradePair[long].ask | percent}}
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3"><v-text-field v-model="closeCont" type="number" label="数量" /><td>
                <td><v-btn :disabled="executing" @click="close(long, short)" class="primary">平仓</v-btn></td>
              </tr>
            </tfoot>
          </v-simple-table>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapState } from 'vuex'
import { httpApi } from '../store/okex'

export default {
  name: 'TradeDialog',
  methods: {
    canClose(long, short) {
      return this.tradePair[long].short_avail_qty > 0 && this.tradePair[short].long_avail_qty > 0;
    },
    getPosOpenDiff(long, short) {
      return this.tradePair[long].short_avg_cost - this.tradePair[short].long_avg_cost;
    },
    getPosCloseDiff(long, short) {
      return this.tradePair[short].bid - this.tradePair[long].ask;
    },
    posProfit(long, short) {
      return this.getPosOpenDiff(long, short) + this.getPosCloseDiff(long, short);
    },
    async order(idx, type, size) {
      const { instrument_id } = this.tradePair[idx];
      if (instrument_id.endsWith('SWAP')) {
        await httpApi.swap.order(instrument_id, type, 0, size, 1);
      } else {
        await httpApi.futures.order(instrument_id, type, 0, size, 1);
      }
    },
    async open(long, short) {
      this.executing = true;
      await this.order(long, 1, this.openCont);
      await this.order(short, 2, this.openCont);
      this.executing = false;
    },
    async close(long, short) {
      this.executing = true;
      await this.order(long, 4, this.closeCont);
      await this.order(short, 3, this.closeCont);
      this.executing = false;
    }
  },
  filters: {
    price(v) { return v && (v * 1).toFixed(3); },
    percent(v) { return v && (v * 100).toFixed(1) + '%'; }
  },
  data() {
    return {
      executing: false,
      openCont: 0,
      closeCont: 0
    };
  },
  computed: {
    ...mapState('okex', {
      tradePair(state) {
        return state.tradePair.map(p => ({
          ...p,
          ...state.quotations
            .filter(v => p.instrument_id === v.instrument_id)
            .map(q => ({ ask: q.asks[0][0], bid: q.bids[0][0]}))[0],
          ...state.positions.find(v => p.instrument_id === v.instrument_id)
        }));
      }
    })
  }
}
</script>

<style scoped>
.neg {
  color: green;
}

.pos {
  color: red;
}
</style>