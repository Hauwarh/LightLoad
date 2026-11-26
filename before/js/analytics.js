// "Analytics" bundle: formats timestamps with moment and builds a session object with lodash.
// Nothing on the page reads this. It is here because someone added it once.
(function () {
  if (typeof moment === "undefined" || typeof _ === "undefined") return;
  window.__session = _.merge({}, { started: moment().format(), locale: moment.locale() });
})();
