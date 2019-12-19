<template>
  <v-simple-table v-slot:default>
    <thead><tr><th>INS</th><th>Ask</th><th>Bid</th></tr></thead>
    <tbody>
      <tr v-for="t of quotations" :key="t.instrument_id">
        <td>{{t.name}}</td>
        <td>{{t.ask.toFixed(digits)}}</td>
        <td>{{t.bid.toFixed(digits)}}</td>
      </tr>
    </tbody>
  </v-simple-table>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'QuotationTable',
  props: ['token', 'digits'],
  computed: {
    ...mapState('quotation', {
      quotations: function (state) {
        return state.quotations
          .filter(q => q.instrument_id.startsWith(this.$props.token))
          .map(q => ({
            instrument_id: q.instrument_id,
            name: q.instrument_id.substr(-6),
            ask: 1 * q.asks[0][0],
            bid: 1 * q.bids[0][0]
          }))
          .sort((q1, q2) => q1.name - q2.name);
      }
    })
  },
  beforeMount() {
    this.$store.commit('quotation/subscribe', this.$props.token);
  }
}
</script>

<style scoped>

</style>