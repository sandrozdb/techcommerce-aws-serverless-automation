# Publicação e manutenção do repositório

Este repositório contém o código-fonte do laboratório **TechCommerce Serverless**.

## Clonar e validar

```bash
git clone https://github.com/sandrozdb/techcommerce-aws-serverless-automation.git
cd techcommerce-aws-serverless-automation
npm install
npm run check
npm test
npm run demo:local
```

## Enviar atualizações

```bash
git add .
git commit -m "docs: atualizar evidências da implantação AWS"
git push origin main
```

Antes de publicar, confira que não há credenciais AWS, `.env`, números de conta, dados reais de clientes ou capturas sensíveis.

O repositório **não** substitui a implantação prática exigida pela disciplina. Consulte `docs/implantacao-aws.md` para testar na nuvem.
