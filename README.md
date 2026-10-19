# Hotel Santo Amaro — Cansanção, Bahia

Site institucional e de reservas para o **Hotel Santo Amaro**, desenvolvido com base nas informações do [Google Maps](https://www.google.com/maps/place/Hotel+santo+amaro/@-10.667543,-39.5025691,17z/data=!4m13!1m2!2m1!1zSG90w6lpcw!3m9!1s0x7129bee7873abd1:0x381f4c22dafb9cd7!5m2!4m1!1i2!8m2!3d-10.667543!4d-39.4978055).

---

## 🌟 Características do Projeto

- **Estética Minimalista & Elegante:** Tipografia refinada (*Cormorant Garamond* e *Plus Jakarta Sans*), espaçamento generoso e elementos visuais sutis.
- **Paleta de Cores Neutras & Naturais:**
  - Fundo neutro acolhedor (`#FAFAF8`, `#F5F3EF`)
  - Textos de alto contraste e legibilidade (`#1A1A1A`, `#6B6B6B`)
  - Acentos orgânicos em verde floresta sóbrio (`#2C5F2D`) e toques dourados discretos (`#B8860B`).
- **Foco em Conversão (Call-to-Action):**
  - Barra de reserva rápida no topo (check-in, check-out e hóspedes com mensagem direta no WhatsApp).
  - Modal interativo de reserva detalhada.
  - Botão flutuante de atendimento via WhatsApp sempre visível.
  - Botão direto para traçar rota e abrir o local no Google Maps.
- **100% Responsivo:** Perfeita adaptação para celulares, tablets e telas de computador.
- **Zero Dependências Pesadas:** Desenvolvido em HTML5 semântico, CSS3 moderno e Vanilla JavaScript ultrarrápido.

---

## 📍 Informações do Estabelecimento

- **Nome:** Hotel Santo Amaro
- **Cidade:** Cansanção - Bahia
- **Endereço:** Rua Senhora de Santana / Centro — CEP 48840-000
- **Coordenadas:** `-10.667543, -39.4978055`
- **Link Google Maps:** [Ver localização no Google Maps](https://www.google.com/maps/place/Hotel+santo+amaro/@-10.667543,-39.5025691,17z/data=!4m13!1m2!2m1!1zSG90w6lpcw!3m9!1s0x7129bee7873abd1:0x381f4c22dafb9cd7!5m2!4m1!1i2!8m2!3d-10.667543!4d-39.4978055)

---

## 📁 Estrutura de Arquivos

```
hotel santo amaro/
├── index.html       # Estrutura completa, semântica e acessível
├── style.css        # Folha de estilos minimalista com variáveis CSS
├── script.js        # Lógica do formulário de reserva, modal, filtros e WhatsApp
└── README.md        # Documentação do projeto
```

---

## ⚠️ Antes de Publicar

As únicas informações verificadas a partir do link fornecido são o nome do estabelecimento e a localização aproximada no Google Maps. O telefone do WhatsApp, tarifas, quartos, comodidades, horários e opiniões não foram confirmados. Confira o arquivo `LEIA-ANTES.md` e substitua os dados demonstrativos no `index.html` e `script.js` antes de publicar. O formulário apenas abre uma mensagem no WhatsApp; não confirma reservas.

## ⚙️ Como Personalizar

### 1. Alterar o número de WhatsApp
No arquivo `script.js`, altere a linha 8:
```javascript
const HOTEL_WHATSAPP_NUMBER = '5575999999999'; // Insira o número com DDD e 55
```
E no `index.html`, substitua as ocorrências de `5575999999999` pelo seu número oficial.

### 2. Fotos e Imagens
As imagens utilizadas atualmente são de alta resolução via Unsplash (temática de hotelaria, quartos acolhedores e café da manhã). Para utilizar fotos reais do Hotel Santo Amaro, basta colocar os arquivos na pasta e alterar as tags `src="..."` no `index.html`.

---

## 🚀 Como Executar Localmente

Basta abrir o arquivo `index.html` em qualquer navegador web, ou usar um servidor local simples:

```bash
# Com Python 3:
cd "D:\IA - OMNIROUTE\hotel santo amaro"
python -m http.server 8000
```
Depois acesse `http://localhost:8000` no seu navegador.
