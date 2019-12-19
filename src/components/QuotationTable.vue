<template>
  <v-simple-table v-slot:default>
    <thead><tr><th>INS</th><th>Ask</th><th>Bid</th></tr></thead>
    <tbody>

    </tbody>
  </v-simple-table>
</template>

<script>
export default {
  name: 'QuotationTable',
  props: ['token']
}
</script>

<style scoped>

</style>