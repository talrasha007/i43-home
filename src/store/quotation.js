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
        wsApi.socket.onopen = () => state.initialized = true;
        state.tokens = await httpApi.futures.getAllTokens();

        const process = quotations => {
          quotations.forEach(q => {
            const old = state.quotations.find(v => v.instrument_id === q.instrument_id);

            if (old) Object.assign(old, q);
            else state.quotations.push(q);
          });
        };

        wsApi.on('futures/depth5', process);
        wsApi.on('swap/depth5', process);
      }
    },

    async subscribe(state, token) {
      while (!state.initialized || state.tokens.length === 0) await new Promise(resolve => setTimeout(resolve, 500));

      const swap = token + '-USD-SWAP';
      if (!state.subscribed.has(swap)) {
        wsApi.subscribe('swap/depth5:' + swap);
        state.subscribed.add(swap);
      }

      state.tokens.filter(t => t.startsWith(token + '-USD-')).forEach(t => {
        if (!state.subscribed.has(t)) {
          wsApi.subscribe('futures/depth5:' + t);
          state.subscribed.add(t);
        }
      });
    }
  }
}
