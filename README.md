# INDER IQFoil
# Requeriments 
## version 
- npm  10.9.2
- nodejs 18.20.7
- angular-cli 19.2.4
# Comandos
- ng start
- ng serve -o

#
 
- **Dandole forma**


# Ver procesos de Node
ps aux | grep node

# Matar proceso en puerto 4200 si está ocupado
sudo kill -9 $(sudo lsof -t -i:4200)

# Limpiar cache de npm si hay problemas
npm cache clean --force

# Reinstalar node_modules si es necesario
rm -rf node_modules package-lock.json
npm install