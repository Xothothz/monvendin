module.exports = {
  apps: [
    {
      name: "monvendin",
      cwd: "/var/www/monvendin",
      script: ".next/standalone/server.js",
      interpreter: "/usr/bin/node",
      env: {
        NODE_ENV: "production",
        PORT: "3000",
        HOSTNAME: "0.0.0.0"
      },
      time: true,
      autorestart: true,
      max_restarts: 10,
      restart_delay: 2000
    }
  ]
}
