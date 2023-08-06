cd web
rm index.mjs; npx tsc && mv index.js index.mjs && node index.mjs | ts | tee -a ../log.txt
