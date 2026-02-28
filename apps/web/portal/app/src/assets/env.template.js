(function(window) {
  window.env = window.env || {};

  // API url
  window.env.apiUrl = '${API_URL}';

  // Whether or not to enable debug mode
  // Setting this to false will disable console output
  window.env.enableDebug = '${ENABLE_DEBUG}';
}(this));
