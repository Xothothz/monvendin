module.exports = {
  apps: [
    {
      name: "monvendin",
      cwd: "/var/www/monvendin/.next/standalone",
      script: "server.js",
      exec_mode: "fork",
      instances: 1,
      autorestart: true,
      watch: false,
      max_restarts: 20,
      restart_delay: 2000,
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
