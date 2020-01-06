<template>
  <v-container>
    <v-row align="center">
      <v-col cols="12"><v-text-field label="content" v-model="content" /></v-col>
      <v-col cols="12" sm="4"><v-select label="hash method" v-model="hashMethod" :items="hashMethods" /></v-col>
      <v-col cols="12" sm="4"><v-select label="hash method" v-model="encoding" :items="['base64', 'hex']" /></v-col>
      <v-col cols="12" sm="4"><v-text-field label="length" type="number" v-model="length" /></v-col>
    </v-row>
    <v-row align="center">
      <v-col cols="8" sm="4" ref="result"><v-text-field readonly v-model="result" label="result" /></v-col>
      <v-col cols="4" sm="8"><v-btn @click="copyToClipboard" class="primary" v-if="result">复制</v-btn></v-col>
    </v-row>
  </v-container>
</template>

<script>
import hashUtil from 'hash-util';

export default {
  name: 'Hash',
  computed: {
    result() {
      const hash = this.content && hashUtil[this.hashMethod](this.content, this.encoding);
      return this.length > 0 ? hash.substr(0, this.length) : hash;
    }
  },
  methods: {
    copyToClipboard() {
      const textToCopy = this.$refs.result.querySelector('input');
      textToCopy.select();
      document.execCommand("copy");
    }
  },
  data() {
    return {
      hashMethods: ['md5', 'sha1', 'sha256', 'sha512'],
      hashMethod: 'md5',
      encoding: 'base64',
      content: '',
      length: 10
    };
  }
}
</script>

<style scoped>

</style>