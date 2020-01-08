import _ from 'lodash';
import { HttpApi, WsApi } from 'okex-api';

const httpApi = new HttpApi(...JSON.parse(localStorage.getItem('okex') || '[]'), { url: 'https://api.i43.io' });
const wsApi = new WsApi(...JSON.parse(localStorage.getItem('okex') || '[]'));
wsApi.socket.setMaxListeners(32);

const ignoreFields = ['side', 'timestamp', 'maint_margin_ratio'];
const keyMap = {
  long: {
    position: 'long_qty',
    avail_position: 'long_avail_qty',
    avg_cost: 'long_avg_cost',
    margin: 'long_margin',
    settled_pnl: 'long_settled_pnl',
    realized_pnl: 'long_pnl',
    unrealized_pnl: 'long_unrealised_pnl',
    settlement_price: 'long_settlement_price'
  },
  short: {
    position: 'short_qty',
    avail_position: 'short_avail_qty',
    avg_cost: 'short_avg_cost',
    margin: 'short_margin',
    settled_pnl: 'short_settled_pnl',
    realized_pnl: 'short_pnl',
    unrealized_pnl: 'short_unrealised_pnl',
    settlement_price: 'short_settlement_price'
  }
};

function etlSwapPosition(p) {
  const { margin_mode, holding } = p;
  const etlResult = holding
    .map((v, idx) => _.chain(v)
      .toPairs()
      .filter(p => ignoreFields.indexOf(p[0]) < 0)
      .map(p => (p[0] = keyMap[holding[idx].side][p[0]] || p[0]) && p)
      .fromPairs()
      .value()
    )
    .reduce((a, b) => ({ ...a, ...b, margin_mode }));

  etlResult.instrument_id = etlResult.instrument_id || p.instrument_id;
  etlResult.realised_pnl = (etlResult.long_pnl * 1 || 0) + (etlResult.short_pnl * 1 || 0) + '';
  return etlResult;
}

export default {
  namespaced: true,
  state: {
    tradePair: [],
    coins: [['BTC', 2], ['ETH', 3], ['EOS', 3]],
    loggedIn: false,
    instruments: [],
    subscribed: new Set(),
    quotations: [],
    positions: []
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

      wsApi.futures.position.addListener(p => {
        p.forEach(v => {
          const old = state.positions.find(sp => sp.instrument_id === v.instrument_id);

          if (old) Object.assign(old, v);
          else state.positions.push(v);
        });
      });

      wsApi.swap.position.addListener(p => {
        p.forEach(v => {
          if (v.holding.length > 0) {
            const newVal = etlSwapPosition(v);
            const old = state.positions.find(sp => sp.instrument_id === newVal.instrument_id);

            if (old) Object.assign(old, newVal);
            else state.positions.push(newVal);
          }
        });
      });

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
          state.positions.push(etlSwapPosition(await await httpApi.swap.getPositions(swap)));
          await wsApi.swap.position.subscribe(swap);
        }
      }

      for (const t of state.instruments.filter(t => t.startsWith(token + '-USD-'))) {
        if (!state.subscribed.has(t)) {
          await wsApi.futures.depth.subscribe(t);
          state.subscribed.add(t);

          if (state.loggedIn) {
            const res = await httpApi.futures.getPositions(t);
            res.holding.forEach(p => state.positions.push(p));
            await wsApi.futures.position.subscribe(t);
          }
        }
      }
    }
  }
}
