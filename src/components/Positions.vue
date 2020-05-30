<template>
   <div>
<!--    {{swapAccount}}<br/>-->
<!--    {{futuresAccount}}<br/>-->
    <v-row>
      <v-col cols="12" sm="6">Swap Equity: {{swapAccount.equity | price(2)}} Liqui: {{swapAccount.liquiPrice | price(2)}}</v-col>
      <v-col cols="12" sm="6">Futures Equity: {{futuresAccount.equity | price(2)}} Liqui: {{futuresAccount.liquiPrice | price(2)}}</v-col>
    </v-row>
    <v-data-table :headers="headers" :items="positions" item-key="name" :items-per-page="5" v-model="$store.state.okex.tradePair" :single-select="false" show-select hide-default-footer>
      <template v-slot:header.data-table-select />
      <template v-slot:item.ask="{ item }">
        <span :class="item.askClass">{{item.ask | price(digits)}}</span>
      </template>
      <template v-slot:item.bid="{ item }">
        <span :class="item.bidClass">{{item.bid | price(digits)}}</span>
      </template>
      <template v-slot:item.delta="{ item }">
        <span :class="item.deltaClass">{{item.delta | price(digits)}}</span>
      </template>
    </v-data-table>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'Positions',
  props: ['coin', 'ins', 'digits'],
  filters: {
    price(v, d) { return v && (v * 1).toFixed(d); }
  },
  beforeMount() {
    this.$store.commit('okex/subscribe', this.coin);
  },
  watch: {
    coin() {
      this.$store.state.okex.tradePair.splice(0);
      this.$store.commit('okex/subscribe', this.coin);
    }
  },
  data() {
    return {
      headers: [
        {
          text: '',
          align: 'left',
          sortable: false,
          value: 'name'
        },
        {
          text: 'Ask',
          align: 'left',
          sortable: false,
          value: 'ask'
        },
        {
          text: 'Bid',
          align: 'left',
          sortable: false,
          value: 'bid'
        },
        {
          text: '',
          align: 'right',
          sortable: false,
          value: 'delta'
        },
        {
          text: 'Long',
          align: 'left',
          sortable: false,
          value: 'long_avail_qty'
        },
        {
          text: 'Short',
          align: 'left',
          sortable: false,
          value: 'short_avail_qty'
        }
      ]
    }
  },
  computed: {
    ...mapState('okex', {
      swapAccount(state) {
        const acc = state.accounts.find(v => v.instrument_id && v.underlying.startsWith(this.coin) && v.currency === (this.ins === 'USDT' ? 'USDT' : this.coin));
        if (acc) {
          acc.liquiPrice = this.positions
            .filter(p => p.instrument_id === `${this.coin}-${this.ins}-SWAP`)
            .map(p => p.liquidation_price)
            .reduce((m, v) => Math.max(m, v || 0), 0);
        }

        return acc || {};
      },
      futuresAccount(state) {
        const acc = state.accounts.find(v => !v.instrument_id && v.underlying.startsWith(this.coin) && v.currency === (this.ins === 'USDT' ? 'USDT' : this.coin)) || {};
        if (acc) {
          acc.liquiPrice = this.positions
            .filter(p => p.instrument_id.startsWith(`${this.coin}-${this.ins}-`) && !p.instrument_id.endsWith('SWAP'))
            .map(p => p.liquidation_price)
            .reduce((m, v) =>Math.max(m, v || 0), 0);
        }

        return acc || {};
      },
      positions(state) {
        const prefix = `${this.coin}-${this.ins}-`;
        return state.quotations
          .filter(q => q.instrument_id.startsWith(prefix))
          .map(q => ({
            instrument_id: q.instrument_id,
            name: q.instrument_id.replace(prefix, ''),
            ask: 1 * q.asks[0][0],
            bid: 1 * q.bids[0][0]
          }))
          .sort((q1, q2) => q1.name - q2.name)
          .map((v, idx, arr) => {
            if (idx > 0) {
              if (v.ask > arr[0].bid) v.askClass = 'neg';
              if (v.ask < arr[0].bid) v.askClass = 'pos';
              if (v.bid > arr[0].ask) v.bidClass = 'pos';
              if (v.bid < arr[0].ask) v.bidClass = 'neg';

              v.delta = Math.max(arr[0].bid - v.ask, v.bid - arr[0].ask);
              if (v.delta > 0) v.deltaClass = 'pos';
              if (v.delta < 0) v.deltaClass = 'neg';
            }

            return { ...v, ...state.positions.find(p => p.instrument_id === v.instrument_id) };
          });
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