<template>
  <v-app>
    <v-app-bar app color="primary" dark>
      <div class="d-flex align-center">
        <h3>i43</h3>
      </div>

      <v-tabs right background-color="transparent">
        <v-tab v-for="[url, name, icon] of links" :key="url" :to="url">{{name}}<v-icon>{{icon}}</v-icon></v-tab>
      </v-tabs>
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
        ['/', '', 'mdi-home'],
        ['/trade', '', 'mdi-finance'],
        ['/hash', '', 'mdi-tools'],
        ['/settings', '', 'mdi-settings']
      ]
    };
  },
  beforeMount() {
    this.$store.commit('okex/init');
  }
};
</script>
