<template>
  <v-row align="center">
    <v-col cols="12" sm="3"><v-text-field v-model="apiKey" label="Api Key" /></v-col>
    <v-col cols="12" sm="3"><v-text-field v-model="apiSecret" type="password" label="Api Secret" /></v-col>
    <v-col cols="12" sm="3"><v-text-field v-model="passphrase" type="password" label="Passphrase" /></v-col>
    <v-col cols="3">
      <v-btn @click="save" v-if="apiKey && apiSecret && passphrase" class="primary">保存</v-btn>
    </v-col>
  </v-row>
</template>

<script>
export default {
  name: 'OkexApiSettings',
  methods: {
    save() {
      localStorage.setItem('okex', JSON.stringify([this.apiKey, this.apiSecret, this.passphrase]));
      location.reload();
    }
  },
  data() {
    let [apiKey, apiSecret, passphrase] = JSON.parse(localStorage.getItem('okex') || '[]');
    return { apiKey, apiSecret, passphrase };
  }
}
</script>

<style scoped>

</style>