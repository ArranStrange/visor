module.exports = {
  apps: [
    {
      name: "visor-server",
      script: "index.js",
      instances: "max",
      exec_mode: "cluster",
      env: {
        NODE_ENV: "development",
        PORT: 4000,
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 4000,
      },

      log_file: "./logs/combined.log",
      out_file: "./logs/out.log",
      error_file: "./logs/error.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",

      max_memory_restart: "1G",
      min_uptime: "10s",
      max_restarts: 10,

      watch: false,
      ignore_watch: ["node_modules", "logs", "*.log"],

      env_file: ".env",
    },
  ],
};
