const hoxy = require('hoxy');

const store = new Vuex.Store({
  state: {
    proxyServer: '',
    logs: [],
    logsFilter: '',
    selectedLog: '',
    rules: [
      {
        regex: /GitHub.com/i,
        cheerio: "res.$('title').text('☠️'); res.$title.body('pwn');",
      },
      {
        regex: /example.com/i,
        cheerio: 'res.statusCode =  404;',
      },
    ],
    selectedRule: '',
  },
  getters: {
    logs: state => state.logs,
    filteredLogs: state => state.logs.filter((log) => {
      if (!state.selectedRule && !state.selectedRule.regex) {
        return true;
      }

      if (['request', 'request-sent'].indexOf(log.phase) !== -1) {
        if (state.selectedRule.regex.test(log._data.hostname)) {
          return true;
        }
      }

      if (['response', 'response-sent'].indexOf(log.phase !== -1)) {
        if (state.selectedRule.regex.test(log._data.headers.server)) {
          return true;
        }
      }

      return false;
    }),
    selectedLog: state => state.selectedLog,
    rules: state => state.rules,
    selectedRule: state => state.selectedRule,
  },
  mutations: {
    setProxyServer(state, server) {
      state.proxyServer = server;
    },
    closeProxyServer(state) {
      state.proxyServer.close();
    },
    addToLog(state, log) {
      state.logs = [...state.logs, log];
    },
    setLogsFilter(state, filter) {
      state.logsFilter = filter;
    },
    setSelectedLog(state, log) {
      state.selectedLog = log;
    },
    addRule(state, rule) {
      state.rules = [...state.rules, rule];
    },
    setSelectedRule(state, rule) {
      if (state.selectedRule && state.selectedRule.regex === rule.regex) {
        state.selectedRule = '';
      } else {
        state.selectedRule = rule;
      }
    },
  },
  actions: {
    startProxyServer({ commit, state }) {
      const proxy = hoxy.createServer().listen(8080, () => {});

      proxy.intercept(
        {
          phase: 'request',
          as: '$',
        },
        (req, res) => {
          commit('addToLog', { type: 'request', ...req });

          state.rules.forEach((rule) => {
            if (rule.regex.test(req.hostname)) {
              eval(rule.cheerio);
            }
          });
        },
      );

      proxy.intercept(
        {
          phase: 'response',
          as: '$',
        },
        (req, res) => {
          commit('addToLog', res);

          state.rules.forEach((rule) => {
            if (rule.regex.test(res.headers.server)) {
              eval(rule.cheerio);
            }
          });
        },
      );


      commit('setProxyServer', proxy);
    },
    closeProxyServer({ commit }) {
      commit('closeProxyServer');
    },
    filterLogs({ commit }, filter) {
      commit('setLogsFilter', filter);
    },
    selectLog({ commit }, log) {
      commit('setSelectedLog', log);
    },
    saveNewRule({ commit }, rule) {
      commit('addRule', rule);
    },
    selectRule({ commit }, rule) {
      commit('setSelectedRule', rule);
    },
  },
});

module.exports = store;
