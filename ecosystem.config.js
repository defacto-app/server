module.exports = {
  apps: [{
      name: "defacto-server",
      script: "app.ts",       // Your TypeScript file
      interpreter: "ts-node", // Specifies ts-node as the interpreter
      watch: true,            // Watch for file changes
      env: {
          NODE_ENV: "development"
      },
      env_production: {
          NODE_ENV: "production"
      }
  }]
};
