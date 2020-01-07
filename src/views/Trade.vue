<template>
  <v-container>
    <okex-api-settings v-if="!$store.state.okex.loggedIn" />
  </v-container>
</template>

<script>
import OkexApiSettings from "../components/OkexApiSettings";

export default {
  name: 'Trade',
  components: { OkexApiSettings },
  comments: {
    OkexApiSettings
  }
}
</script>

<style scoped>

</style>