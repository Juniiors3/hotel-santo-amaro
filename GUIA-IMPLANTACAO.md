# 🚀 Guia de Implantação e Publicação — Hotel Santo Amaro

Este guia orienta o processo de implantação em produção do site do **Hotel Santo Amaro** e do **Painel Administrativo de Consultas**.

---

## 🔒 Relatório de Segurança e Anti-SQL Injection

A arquitetura do banco de dados e da API foi construída seguindo as melhores práticas do PostgreSQL e do Supabase:

1. **Proteção Total contra SQL Injection**:
   - **PostgREST Parametrizado**: As solicitações enviadas pelo formulário (`script.js`) para a API REST do Supabase (`/rest/v1/reservation_requests`) utilizam **consultas parametrizadas nativas** (*prepared statements*). Caracteres como `'`, `;`, `--` ou `UNION SELECT` são tratados estritamente como literais de texto e jamais como comandos executáveis.
   - **RPC com Tipagem Forte**: A consulta do painel administrativo (`get_reservation_requests`) recebe `p_password text`. O PostgreSQL compara o valor diretamente sem interpolação de strings nem execução dinâmica (`EXECUTE format(...)`), eliminando vetores de injeção.
2. **Princípio do Menor Privilégio (Least Privilege)**:
   - A role pública (`anon`) tem **exclusivamente permissão de `INSERT`**.
   - `SELECT`, `UPDATE` e `DELETE` diretos na tabela estão revogados para `anon`. Ninguém na internet consegue ler, alterar ou apagar dados diretamente pela URL da API.
3. **Privacidade e LGPD**:
   - Apenas quem fornece a senha correta no painel administrativo tem acesso aos nomes, telefones e datas dos hóspedes.
4. **Proteção contra Search Path Hijacking**:
   - A função RPC está configurada com `set search_path = public`, impedindo que usuários maliciosos sequestrem esquemas do PostgreSQL.
5. **Validação de Integridade (Check Constraints)**:
   - Regras impedem check-out anterior ao check-in e limitam o tamanho dos campos de texto, prevenindo sobrecarga de dados.

---

## 📦 Opções de Hospedagem e Publicação

A aplicação é 100% estática (HTML5, CSS3, JS) e não precisa de servidor Node.js ou PHP para rodar. Você pode escolher qualquer uma das opções abaixo:

### Opção 1: Vercel (Recomendada — Grátis e com SSL automático)
1. Acesse [vercel.com](https://vercel.com) e crie uma conta (com GitHub ou e-mail).
2. Clique em **Add New Project**.
3. Se o código estiver no GitHub, importe o repositório. Ou instale o CLI (`npm i -g vercel`) e execute `vercel` na pasta do projeto.
4. O arquivo `vercel.json` incluído já configura cabeçalhos de segurança e cache automaticamente.
5. Em segundos, seu site estará no ar com HTTPS e CDN mundial.

### Opção 2: Netlify (Arrastar e Soltar — 30 segundos)
1. Acesse [app.netlify.com/drop](https://app.netlify.com/drop).
2. Arraste a pasta do projeto (ou o arquivo ZIP gerado) diretamente na janela do navegador.
3. O arquivo `netlify.toml` já aplicará as configurações ideais de segurança.
4. O site estará online imediatamente com link provisório e opção de configurar seu domínio próprio.

### Opção 3: Hospedagem Tradicional (cPanel / Hostinger / Locaweb / Apache)
1. Acesse o **Gerenciador de Arquivos** da sua hospedagem.
2. Navegue até a pasta pública (geralmente `public_html` ou `www`).
3. Envie os arquivos:
   - `index.html`
   - `admin.html`
   - `style.css`
   - `script.js`
   - `admin.js`
   - `.htaccess`
4. O arquivo `.htaccess` protegerá arquivos de configuração, ativará compressão GZIP e cabeçalhos de proteção contra cliques indevidos (clickjacking/nosniff).

### Opção 4: Servidor VPS Próprio / Docker
Se você gerencia uma VPS (Ubuntu/Debian) com Docker:
```bash
docker compose up -d --build
```
O site responderá na porta configurada (padrão `8080`), com Nginx Alpine de alta performance e baixo consumo de memória (~10MB RAM).

---

## 🛠️ Checklist Final Antes do Lançamento Oficial

- [ ] **WhatsApp Oficial**: Verifique se o número do hotel foi atualizado no `script.js` (linha 8: `const HOTEL_WHATSAPP_NUMBER = '5575999999999';`) e nos links do `index.html`.
- [ ] **Senha do Painel**: A senha padrão configurada é `santoamaro2026`. Se quiser alterá-la, basta alterar no SQL Editor do Supabase na linha `p_password <> 'NOVA_SENHA'` e atualizar o script da migração.
- [ ] **Teste de Reserva**:
  1. Abra o site `index.html`.
  2. Preencha um pedido de reserva no formulário do modal.
  3. Verifique se o pedido aparece imediatamente no `admin.html`.
  4. Teste o botão de contato direto por WhatsApp no painel.
