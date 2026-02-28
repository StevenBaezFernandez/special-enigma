export const PLUGIN_POLICY = {
  egress: {
    allowlist: [
      'api.virteex.io',
      'auth.virteex.io',
      'trusted-partner.com',
    ],
    denyByDefault: true,
  },
  limits: {
    memoryMb: 128,
    timeoutMs: 1000,
    cpuPercentage: 10,
  }
};
