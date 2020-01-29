<template>
  <v-simple-table v-slot:default>
    <thead><tr><th>INS</th><th>Ask</th><th>Bid</th><th></th></tr></thead>
    <tbody>
      <tr v-for="t of quotations" :key="t.instrument_id">
        <td>{{t.name}}</td>
        <td :class="t.askClass">{{t.ask.toFixed(digits)}}</td>
        <td :class="t.bidClass">{{t.bid.toFixed(digits)}}</td>
        <td :class="t.deltaClass">{{t.delta && t.delta.toFixed(digits)}}</td>
      </tr>
    </tbody>
  </v-simple-table>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'QuotationTable',
  props: ['token', 'ins', 'digits'],
  computed: {
    ...mapState('okex', {
      quotations: function (state) {
        return state.quotations
          .filter(q => q.instrument_id.startsWith(`${this.token}-${this.ins}-`))
          .map(q => ({
            instrument_id: q.instrument_id,
            name: q.instrument_id.replace(`${this.token}-${this.ins}-`, ''),
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

            return v;
          });
      }
    })
  },
  beforeMount() {
    this.$store.commit('okex/subscribe', this.$props.token);
  }
}
</script>

<style scoped lang="scss">
td {
  font-family: Monospaced;

  &.neg {
    color: green;
  }

  &.pos {
    color: red;
  }
}
</style>