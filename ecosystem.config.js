module.exports = {
  apps: [{
      name: "defacto-server",
      script: "app.ts",      
      interpreter: "ts-node", 
      env: {
          NODE_ENV: "development"
      },
      env_production: {
          NODE_ENV: "production"
      }
  }]
};
