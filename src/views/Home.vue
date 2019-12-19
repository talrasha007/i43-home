<template>
  <v-container>
    <v-row>
      <v-col v-for="t of tokens" :key="t">
        <h4>{{t}}</h4>
        <quotation-table :token="t" />
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
      tokens: ['BTC', 'ETH', 'EOS']
    };
  }
}
</script>
