import { HttpApi, WsApi } from 'okex-api';

const httpApi = new HttpApi(null, null, null, { url: 'https://api.i43.io' });
const wsApi = new WsApi(...JSON.parse(localStorage.getItem('okex') || '[]'));
wsApi.socket.setMaxListeners(32);

export default {
  namespaced: true,
  state: {
    coins: [['BTC', 2], ['ETH', 3], ['EOS', 3]],
    loggedIn: false,
    instruments: [],
    subscribed: new Set(),
    quotations: []
  },
  mutations: {
    async init(state) {
      state.instruments = await httpApi.futures.getAllTokens();

      const process = quotations => {
        quotations.forEach(q => {
          const old = state.quotations.find(v => v.instrument_id === q.instrument_id);

          if (old) Object.assign(old, q);
          else state.quotations.push(q);
        });
      };

      wsApi.futures.depth.addListener(process);
      wsApi.swap.depth.addListener(process);

      wsApi.socket.on('open', async () => {
        if (wsApi.apiKey) {
          try {
            await wsApi.login();
            state.loggedIn = true;
          } catch (e) {
            state.loggedIn = false;
          }
        }

        state.subscribed.forEach(v => {
          if (v.endsWith('SWAP')) wsApi.swap.depth.subscribe(v);
          else wsApi.futures.depth.subscribe(v);
        });
      });
    },

    async subscribe(state, token) {
      while (state.instruments.length === 0) await new Promise(resolve => setTimeout(resolve, 500));

      const swap = token + '-USD-SWAP';
      if (!state.subscribed.has(swap)) {
        await wsApi.swap.depth.subscribe(swap);
        state.subscribed.add(swap);
      }

      state.instruments.filter(t => t.startsWith(token + '-USD-')).forEach(t => {
        if (!state.subscribed.has(t)) {
          wsApi.futures.depth.subscribe(t);
          state.subscribed.add(t);
        }
      });
    }
  }
}
