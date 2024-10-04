module.exports = {
   apps: [
      {
         name: "defacto-app",
         script: "./app.ts",
         instances: "max", // Scales to maximum available CPUs
         exec_mode: "cluster", // Allows running in cluster mode for load balancing
         watch: false, // Watch for changes in files and automatically restart the app
         ignore_watch: ["node_modules", "logs","combined.log"], // Ignore specific folders
         max_memory_restart: "500M",
         env: {
            NODE_ENV: "development",
            PORT: 5700,
         },
         env_production: {
            NODE_ENV: "production",
            PORT: 5700,
         },
      },
   ],
};
