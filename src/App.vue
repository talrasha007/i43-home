<template>
  <v-app>
    <v-app-bar
      app
      color="primary"
      dark
    >
      <div class="d-flex align-center">
        <h3>i43</h3>
      </div>

      <v-spacer />

      <v-btn text v-for="[url, name] of links" :key="url" :href="url">
        <span class="mr-2">{{name}}</span>
        <v-icon>mdi-open-in-new</v-icon>
      </v-btn>
    </v-app-bar>

    <v-content>
      <router-view />
    </v-content>
  </v-app>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      links: [
        ['#/', 'Home'],
        ['#/hash', 'Hash']
      ]
    };
  },
  beforeMount() {
    this.$store.commit('okex/init');
  }
};
</script>
