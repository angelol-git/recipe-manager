module.exports = {
  apps: [{
    // App name (shown in pm2 list)
    name: 'ai-recipe-manager',
    
    // Working directory - relative to where you run pm2 start
    cwd: './server',
    
    // Entry point script
    script: './server.js',
    
    // Production mode
    exec_mode: 'fork',
    instances: 1,
    
    // Auto-restart on failure
    autorestart: true,
    
    // Don't watch files (disable for production)
    watch: false,
    
    // Max memory before restart (prevent memory leaks)
    max_memory_restart: '500M',
    
    // Environment variables
    env: {
      NODE_ENV: 'production',
      PORT: 8080,
      // Add any other env vars needed, or PM2 will use your .env file
    },
    
    // Logging configuration
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    
    // Restart settings
    min_uptime: '10s',
    max_restarts: 5,
    
    // Kill timeout
    kill_timeout: 5000,
    
    // Wait for ready signal (if your app emits 'ready')
    wait_ready: false,
    
    // Listen timeout
    listen_timeout: 10000
  }]
};
