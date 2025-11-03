const config = require("../config");

const isDevelopment = config.NODE_ENV === "development";

const isLocalNetwork = (origin) => {
  if (!origin) return false;

  const url = new URL(origin);
  const hostname = url.hostname;

  // Allow localhost
  if (hostname === "localhost" || hostname === "127.0.0.1") return true;

  // Allow local network IPs (192.168.x.x, 10.x.x.x, 172.16-31.x.x)
  const localNetworkPatterns = [
    /^192\.168\.\d+\.\d+$/,
    /^10\.\d+\.\d+\.\d+$/,
    /^172\.(1[6-9]|2[0-9]|3[0-1])\.\d+\.\d+$/,
  ];

  return localNetworkPatterns.some((pattern) => pattern.test(hostname));
};

module.exports = {
  origin: (origin, callback) => {
    if (isDevelopment) {
      // In development, allow localhost and local network IPs
      if (!origin || isLocalNetwork(origin)) {
        callback(null, true);
      } else if (config.ALLOWED_ORIGINS.development.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    } else {
      // In production, only allow specific origins
      if (config.ALLOWED_ORIGINS.production.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Origin",
    "X-Requested-With",
    "Content-Type",
    "Accept",
    "Authorization",
  ],
};
