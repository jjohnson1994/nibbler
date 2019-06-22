const store = require('./store');

Vue.use(Vuetify);

const app = new Vue({
  el: '#app',
  data: {
    message: 'Hello Vue!',
    proxyStatus: '',
  },
  computed: {
    filteredLogs() {
      return store.getters.filteredLogs;
    },
    logsFilter() {
      return store.getters.logsFilter;
    },
    selectedLog() {
      return store.getters.selectedLog;
    },
    rules() {
      return store.getters.rules;
    },
    selectedRule() {
      return store.getters.selectedRule;
    },
  },
  created() {
    store.dispatch('startProxyServer');
  },
  methods: {
    startProxy() {
      store.dispatch('startProxyServer');
    },
    stopProxy() {
      store.dispatch('closeProxyServer');
    },
    setLogFilter(filter) {
      store.dispatch('filterLogs', filter);
    },
    setSelectedLog(log) {
      store.dispatch('selectLog', log);
    },
    setSelectedRule(rule) {
      store.dispatch('selectRule', rule);
    },
  },
});
