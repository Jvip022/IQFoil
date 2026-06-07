module.exports = {
  apps: [{
    name: 'iqfoil-backend',
    script: 'run.py',               
    interpreter: 'python3',
    args: '',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      FLASK_ENV: 'production'
    },
    env_production: {
      FLASK_ENV: 'production'
    }
  }]
};