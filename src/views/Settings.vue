<template>
  <v-container>
    <okex-api-settings />
  </v-container>
</template>

<script>
import OkexApiSettings from '../components/OkexApiSettings'

export default {
  name: 'Settings',
  components: {
    OkexApiSettings
  }
}
</script>
