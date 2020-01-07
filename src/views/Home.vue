<template>
  <v-container>
    <v-row>
      <v-col cols="12" md="6" lg="4" v-for="[t, d] of coins" :key="t">
        <h4>{{t}}</h4>
        <quotation-table :token="t" :digits="d" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapState } from 'vuex'
import QuotationTable from '@/components/QuotationTable.vue'

export default {
  name: 'home',
  components: {
    QuotationTable
  },
  computed: {
    ...mapState('okex', ['coins'])
  }
}
</script>