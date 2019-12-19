import { HttpApi, WsApi } from 'okex-api';

const httpApi = new HttpApi(null, null, null, { url: 'https://api.i43.io' });
const wsApi = new WsApi();

export default {
  namespaced: true,
  state: {
    initialized: false,
    tokens: ['a'],
    subscribed: new Set(),
    quotations: []
  },
  mutations: {
    async init(state) {
      if (!state.initialized) {
        state.tokens = await httpApi.futures.getAllTokens();
        state.initialized = true;
        wsApi.on('futures/depth5', quotations => {
          quotations.forEach(q => {
            const old = state.quotations.find(v => v.instrument_id === q.instrument_id);

            if (old) Object.assign(old, q);
            else state.quotations.push(q);
          });
        });
      }
    },

    async subscribe(state, token) {
      while (!state.initialized) await new Promise(resolve => setTimeout(resolve, 500));

      state.tokens.filter(t => t.startsWith(token + '-USD-')).forEach(t => {
        if (!state.subscribed.has(t)) {
          wsApi.subscribe('futures/depth5:' + t);
          state.subscribed.add(t);
        }
      });
    }
  }
}
