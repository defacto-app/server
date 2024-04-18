module.exports = {
    apps : [{
      name: "defacto-server",
      script: "app.ts",
      interpreter: "ts-node",
      watch: true,
      env: {
        NODE_ENV: "development"
      },
      env_production: {
        NODE_ENV: "production"
      }
    }]
  };
  