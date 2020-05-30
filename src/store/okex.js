import { HttpApi, WsApi } from 'okex-api';

const httpApi = new HttpApi(...JSON.parse(localStorage.getItem('okex') || '[null, null, null]'), { url: 'https://api.i43.io' });
const wsApi = new WsApi(...JSON.parse(localStorage.getItem('okex') || '[null,null,null]'), { httpApi });
wsApi.socket.setMaxListeners(32);

export { httpApi, wsApi }

export default {
  namespaced: true,
  state: {
    tradePair: [],
    coins: [['BTC', 2], ['ETH', 3], ['EOS', 3]],
    loggedIn: false,
    instruments: [],
    subscribed: new Set(),
    quotations: [],
    positions: [],
    accounts: []
  },
  mutations: {
    async init(state) {
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

      wsApi.once('login', () => wsApi.trade.load());
      wsApi.trade.on('position', () => state.positions = wsApi.trade.positions);
      wsApi.trade.on('account', () => state.accounts = wsApi.trade.accounts);

      state.instruments = await httpApi.futures.getInstruments();

      const process = quotations => {
        quotations.forEach(q => {
          const old = state.quotations.find(v => v.instrument_id === q.instrument_id);

          if (old) Object.assign(old, q);
          else state.quotations.push(q);
        });
      };

      wsApi.futures.depth.addListener(process);
      wsApi.swap.depth.addListener(process);
    },

    async subscribe(state, token) {
      while (state.instruments.length === 0 || (wsApi.apiKey && !state.loggedIn)) await new Promise(resolve => setTimeout(resolve, 500));

      for (const c of ['USD', 'USDT']) {
        const swap = `${token}-${c}-SWAP`;
        if (!state.subscribed.has(swap)) {
          await wsApi.swap.depth.subscribe(swap);
          state.subscribed.add(swap);
        }

        for (const t of state.instruments.filter(t => t.startsWith(`${token}-${c}-`))) {
          if (!state.subscribed.has(t)) {
            await wsApi.futures.depth.subscribe(t);
            state.subscribed.add(t);
          }
        }
      }
    }
  }
}
