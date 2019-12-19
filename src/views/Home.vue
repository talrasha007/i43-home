<template>
  <v-container>
    <v-row>
      <v-col v-for="[t, d] of tokens" :key="t">
        <h4>{{t}}</h4>
        <quotation-table :token="t" :digits="d" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import QuotationTable from '@/components/QuotationTable.vue'

export default {
  name: 'home',
  components: {
    QuotationTable
  },
  data() {
    return {
      tokens: [['BTC', 2], ['ETH', 3], ['EOS', 3]]
    };
  }
}
</script>

<style scoped lang="scss">
table {
  font-family: Monospaced;
}
</style>
