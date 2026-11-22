# Antes de publicar

O site foi criado a partir do link do Google Maps fornecido. O link confirma o nome do local e as coordenadas; não forneceu telefone, tarifas, fotos oficiais, lista de quartos ou comodidades.

**Importante:** atualize os dados demonstrativos antes de publicar:

1. Substitua `5575999999999` pelo WhatsApp oficial do hotel em `index.html` e `script.js`.
2. Confirme o endereço apresentado e todos os serviços antes de mantê-los como fatos. A localização usada é próxima à Rua Senhora de Santana, Cansanção–BA; confirme o endereço exato com o estabelecimento.
3. Remova ou troque imagens ilustrativas do Unsplash por fotos autorizadas do hotel.
4. Não publique como reais avaliações, nota, depoimentos, horários, política de pagamento, tipos de quarto, café da manhã ou comodidades sem confirmação do hotel. Esses itens devem ser confirmados e editados no `index.html`.
5. O formulário encaminha a solicitação para o WhatsApp; não confirma disponibilidade nem efetua reserva automaticamente.

## Registro de solicitações no Supabase (REST API direta)

O formulário grava os pedidos de reserva diretamente na tabela `public.reservation_requests` via REST API do Supabase, sem depender de Edge Function.

1. No painel Supabase (**SQL Editor**), execute o arquivo `supabase/migrations/202611210001_create_reservation_requests.sql`. Ele cria a tabela e a política de RLS que permite somente INSERT anônimo.
2. Em **Project Settings → API**, copie:
   - **Project URL** (ex: `https://qjdnaycpxuzhswaepgcb.supabase.co`)
   - **anon public key** (o token JWT que começa com `eyJ...`)
3. No `script.js`, configure `SUPABASE_URL` e `SUPABASE_ANON_KEY` com esses valores. Nunca use a chave `service_role` no site.
4. Caso a gravação no banco falhe por instabilidade de rede ou chave expirada, o site exibe um aviso e abre o WhatsApp com a mensagem pronta para que o contato do cliente não seja perdido.

## Arquivos

- `index.html` — página do site.
- `style.css` — estilo responsivo e paleta neutra.
- `script.js` — menu, filtros, modal e links de contato.
