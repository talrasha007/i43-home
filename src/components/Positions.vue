<template>
  <v-data-table :headers="headers" :items="positions" item-key="name" :items-per-page="5" v-model="selected" :single-select="false" show-select hide-default-footer>
    <template v-slot:top>
      <v-btn class="primary" :disabled="selected.length !== 2">GO</v-btn>
    </template>
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
<!--  <div>{{positions}}</div>-->
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'Positions',
  props: ['coin', 'digits'],
  filters: {
    price(v, d) { return v && v.toFixed(d); }
  },
  beforeMount() {
    this.$store.commit('okex/subscribe', this.coin);
  },
  watch: {
    coin() { window.console.log(arguments); this.$store.commit('okex/subscribe', this.coin); }
  },
  data() {
    return {
      selected: [],
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
          value: 'long_qty'
        },
        {
          text: 'Short',
          align: 'left',
          sortable: false,
          value: 'short_qty'
        }
      ]
    }
  },
  computed: {
    ...mapState('okex', {
      positions(state) {
        const prefix = this.coin + '-USD-';
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