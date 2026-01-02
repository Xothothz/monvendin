module.exports = {
  apps: [
    {
      name: "monvendin",
      cwd: "/var/www/monvendin/.next/standalone",
      script: "server.js",
      exec_mode: "fork",
      instances: 1,
      env: {
        NODE_ENV: "production",
        PORT: "3000",
        HOSTNAME: "127.0.0.1"
      }
    }
  ]
};
