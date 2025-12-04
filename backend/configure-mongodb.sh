#!/bin/bash

# Script para configurar MongoDB Atlas no arquivo .env

echo "🔧 Configurando MongoDB Atlas..."
echo ""

# Solicitar senha
read -sp "Digite a senha do MongoDB Atlas: " PASSWORD
echo ""

# Criar string de conexão
MONGODB_URI="mongodb+srv://projetos_formind:${PASSWORD}@clusterformind.qvcqlmc.mongodb.net/kanban?retryWrites=true&w=majority"

# Atualizar arquivo .env
if [ -f .env ]; then
    # Backup do arquivo original
    cp .env .env.backup
    echo "✅ Backup criado: .env.backup"
    
    # Atualizar MONGODB_URI
    if grep -q "MONGODB_URI=" .env; then
        # Windows (Git Bash)
        if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
            sed -i "s|MONGODB_URI=.*|MONGODB_URI=${MONGODB_URI}|" .env
        else
            # Linux/Mac
            sed -i '' "s|MONGODB_URI=.*|MONGODB_URI=${MONGODB_URI}|" .env
        fi
    else
        echo "MONGODB_URI=${MONGODB_URI}" >> .env
    fi
    
    echo "✅ Arquivo .env atualizado!"
    echo ""
    echo "📋 String configurada:"
    echo "MONGODB_URI=mongodb+srv://projetos_formind:***@clusterformind.qvcqlmc.mongodb.net/kanban?retryWrites=true&w=majority"
else
    echo "❌ Arquivo .env não encontrado!"
    echo "Criando arquivo .env..."
    cat > .env << EOF
PORT=5000
MONGODB_URI=${MONGODB_URI}
JWT_SECRET=seu_jwt_secret_super_seguro_aqui_mude_em_producao
NODE_ENV=development
EOF
    echo "✅ Arquivo .env criado!"
fi

echo ""
echo "🎉 Configuração concluída!"
echo "Agora você pode iniciar o servidor com: npm start"

