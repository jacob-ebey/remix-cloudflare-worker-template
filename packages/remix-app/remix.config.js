/** @type {import("@remix-run/dev").AppConfig} */
let config = {
  serverBuildTarget: "cloudflare-workers",
  ignoredRouteFiles: ["**/.*"],
  devServerBroadcastDelay: 1000,
};

module.exports = config;
