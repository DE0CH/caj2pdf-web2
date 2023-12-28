source caj2pdf/venv/bin/activate
cd web
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion
rm index.mjs; npx tsc && mv index.js index.mjs && node index.mjs | ts | tee -a ../log.txt
