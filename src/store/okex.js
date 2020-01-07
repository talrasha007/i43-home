import { HttpApi, WsApi } from 'okex-api';

const httpApi = new HttpApi(...JSON.parse(localStorage.getItem('okex') || '[]'), { url: 'https://api.i43.io' });
const wsApi = new WsApi(...JSON.parse(localStorage.getItem('okex') || '[]'));
wsApi.socket.setMaxListeners(32);

export default {
  namespaced: true,
  state: {
    coins: [['BTC', 2], ['ETH', 3], ['EOS', 3]],
    loggedIn: false,
    instruments: [],
    subscribed: new Set(),
    quotations: [],
    swapPositions: [],
    futuresPositions: []
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
      while (state.instruments.length === 0 || (wsApi.apiKey && !state.loggedIn)) await new Promise(resolve => setTimeout(resolve, 500));

      const swap = token + '-USD-SWAP';
      if (!state.subscribed.has(swap)) {
        await wsApi.swap.depth.subscribe(swap);
        state.subscribed.add(swap);

        if (state.loggedIn) {
          const res = await httpApi.swap.getPositions(swap);
          res.holding.forEach(p => state.swapPositions.push(p));
          await wsApi.swap.position.subscribe(swap);
        }
      }

      for (const t of state.instruments.filter(t => t.startsWith(token + '-USD-'))) {
        if (!state.subscribed.has(t)) {
          await wsApi.futures.depth.subscribe(t);
          state.subscribed.add(t);

          if (state.loggedIn) {
            const res = await httpApi.futures.getPositions(t);
            res.holding.forEach(p => state.futuresPositions.push(p));
            await wsApi.futures.position.subscribe(t);
          }
        }
      }
    }
  }
}
