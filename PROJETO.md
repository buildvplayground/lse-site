# LSE — Engenharia Construtiva · Projeto de Site

- **Slug:** `lse` · **Repo:** `dev-buildv/lse-site` (privado)
- **Drive:** https://drive.google.com/drive/folders/1vzOSoinkDoyGULqTRVgn1LSyrs4Kb-WK
- **Hospedagem:** não informada → preparado para **Vercel (HTML estático)**
- **Atualizado:** 2026-08-27

## Quem é o cliente (fatos verificados — Proposta Comercial LSE2026024)

- **Razão:** LSE – Engenharia Construtiva · **CNPJ** 27.271.427/0001-80
- **Resp. técnico:** Eng. Civil **Lucas Longhini Seckler** — **CREA-PR 122275/D**
- Pós-graduação em **Patologias das Construções** (UTFPR) · **MBA em Gestão de Projetos** (FGV)
  · Graduação em Engenharia Civil (Universidade Positivo)
- **16 anos** de experiência em construção civil, com obras em diferentes estados do Brasil
- **Base:** Curitiba – PR · também atua em SP (Presidente Prudente)
- **Posicionamento:** *"oficina de engenharia"* — executa a solução técnica (≠ escritório, que faz
  projeto/laudo; ≠ construtora, equipe enxuta com supervisão direta do RT; > empreiteiro, entrega
  qualificação, garantia e responsabilidade técnica exigidas por norma)
- **Entrega padrão:** ART de execução, seguro de responsabilidade civil de obras, relatório de
  qualidade de execução ao fim da obra, M.O. + materiais + equipamentos inclusos

## Inventário do material (`_raw/` → classificado)

| Pasta | Conteúdo |
|---|---|
| `Marca/logo/` | 4 arquivos — 2 marcas: **LSE Engenharia Construtiva** (guindaste, vertical) e **LSE Consultoria & Gerenciamento de Projetos** (ponte, horizontal); versões com e sem fundo |
| `Marca/identidade/` | Proposta Comercial LSE2026024 (8 pág., PDF) — fonte principal de conteúdo |
| `imagens/originais/` | 19 fotos de obra reais (6 obras) + foto de perfil do Lucas |
| `Copys/` | 2 planilhas — **Aprofundamento em branco** (só o template) e template de leads |

### O que NÃO veio no Drive
- ❌ **Copy oficial** — a planilha de Aprofundamento está **em branco**. → copy **provisória**
  derivada exclusivamente da Proposta Comercial (nenhum fato inventado).
- ❌ **Backup do site antigo** — as pastas `03.01. Site (Copy + Backup Site Antigo)` e
  `03.02. Revisões e Criações` estão **vazias** no Drive.
- ❌ **Brandbook / manual de marca** — paleta e tipografia derivadas dos **logos reais**.

## Decisão do cliente (27/08/2026) — imagens

O cliente pediu, durante a etapa 5, para **não usar as fotos do Drive** e sim **banco de
imagens** com contexto do serviço descrito na proposta comercial. Adotado (fonte: Pexels,
licença comercial livre). Consequências assumidas, para o site não afirmar o que não pode
comprovar:

- Nenhuma foto de banco é legendada com o nome de uma obra real da LSE.
- O portfólio virou grade de **frentes de atuação**; as obras (Cosmopolitan, Ravi, Brighton
  House, Dr. Goulin, Trianon) viraram **lista de referências em texto**, com escopo e local.
- A seção de **antes/depois** foi removida — com foto de banco seria resultado fabricado.
- As 19 fotos reais seguem arquivadas em `imagens/originais/` e no Drive.

## Etapas

- [x] **1. Extrair do Drive** — 28 arquivos via rclone
- [x] **2. Organizar pastas / scaffold**
- [x] **2b. Repositório GitHub** — `dev-buildv/lse-site` (privado)
- [x] **3. Design system** — navy + dourado amostrados dos logos reais
- [x] **4. Copy estruturada** — provisória, 100% da Proposta Comercial
- [x] **5. Front-end** — `revisar-frontend`: **LIBERAR**, 0 bloqueantes em aberto
- [x] **6. Ajustes finais** — `.webp`, 0 overflow de 320→1920px, 0 falha de contraste AA
- [x] **7. Tags e módulos LGPD** — GTM-M2LBB4QV + cookies + privacidade + fornecedores
- [ ] **8. Revisão humana** 🛑 ← *aqui*
- [ ] **9. Deploy** 🛑

## Estrutura do site

| Seção | Tipo | Fundo |
|---|---|---|
| Hero | foto full-bleed + coluna à esquerda | navy escuro |
| Credenciais | faixa de 4 colunas, contador em "16 anos" | navy |
| Posicionamento | split texto + foto | bone |
| Citação de valor | faixa de imagem full-bleed com parallax | navy escuro |
| Frentes de atuação | grade 3/2/1 + lightbox de galeria | navy |
| Por que a LSE | tabela comparativa → cartões rotulados em ≤560px | bone |
| — | faixa de imagem (respiro) | — |
| Obras de referência | lista editorial com divisórias | branco |
| Responsável técnico | split invertido foto + formação | bone |
| Incluso em toda proposta | faixa de 5 itens com divisórias | navy |
| Como solicitar | 3 passos animados + botão WhatsApp + ficha da empresa | branco |
| Rodapé | 3 colunas | navy escuro |

**Páginas:** `index.html` · `privacidade.html` · `fornecedores.html`

## Pendências

Ver `state.json` → `pendencias` (9 itens). As de maior impacto: **número real de WhatsApp**,
**domínio** e **importar o repositório no Vercel**.

## Revisão de qualidade — 2026-08-28

Rodada de auditoria por **medição** (Playwright), não por inspeção visual.

### Corrigido
- **Colisão de variável `bar`** — o arquivo é um único IIFE e `var` é escopado à
  função: o `var bar` do banner de cookies reatribuía o `bar` da barra de leitura.
  A barra nunca andava e o `scaleX()` era escrito no banner. Renomeado para
  `progressBar` / `cookieBar`, e `chrome()` → `updateChrome()` (sombreava `window.chrome`).
- **Imagens que apareciam depois que o scroll já tinha passado** — três causas
  somadas: gatilho tardio (`rootMargin -12%`), cortina longa (1,2s) e imagem `lazy`
  que só começava a baixar na hora. Agora: observador próprio para mídia (dispara 8%
  antes de entrar), cortina de 0,7s, pré-aquecimento 800px antes e a cortina só abre
  sobre imagem já decodificada. Verificado a 400, 850 e 1200 px/s.
- **Espaçamento ícone/texto dos botões** — o `viewBox` da seta tinha folga interna,
  então o vão ótico não era o `gap`. `viewBox` justo ao traço + `gap` 12px + padding
  direito maior (a seta pesa menos que o texto) + avanço no hover de 4→3px.
- **Entradas no fim do scroll** — `bottomGuard()` assenta o que estiver pendente ou
  em curso ao chegar no rodapé; `settle()` usa classe (e não `style.transition`) para
  alcançar palavras do título e filhos escalonados.
- **Espaçamento** — 36 valores avulsos → 12, todos na grade de 4px; tokens por papel
  (`--pad-card`, `--row-y`, `--head-gap`); a faixa "incluso" colava no título (0 vs 48px).
- **Quebras de linha** — `text-wrap:pretty` no corpo, `&nbsp;` curtos nos títulos
  (cadeias longas viram token inquebrável e estouram a grade em 320px).
- **WCAG** — alvos de toque ≥24px; breakpoints convertidos de `px` para `em` (idênticos
  a 16px, mas acompanham a fonte do navegador — é o que faz a nav virar hambúrguer a
  1024px com texto a 200% em vez de estourar); `min-width:0` nas listas em grid
  (grid blowout); foco no header o traz de volta quando recolhido (2.4.11).

### Estado verificado
| Critério | Resultado |
|---|---|
| Overflow horizontal | 0 em 42 combinações (320→1920px) |
| Contraste AA | 0 violações |
| Texto a 200% (1.4.4) | 0 overflow, 320→1440px |
| Reflow (1.4.10) | OK em 320px e 640px |
| Alvo de toque (2.5.8) | 0 abaixo de 24px |
| Movimento no fim do scroll | 0 pendentes / 0 em curso (3 rodadas) |
| `prefers-reduced-motion` | sem movimento, conteúdo íntegro |

> Aviso conhecido e aceito: o auditor estático lista `lb-close` como "classe sem regra
> CSS" — é modificador de `.lb-btn` usado como gancho de JS, não precisa de regra.

### Ajuste — CTA da navbar (2026-08-28)
- **A seta do CTA caía para baixo do texto.** Causa: `.nav-menu a` (especificidade
  0,1,1) vencia `.btn` (0,1,0) e impunha `display:block` + padding próprio. A regra
  de link da nav agora é `:not(.btn)` — como a versão mobile já era. O sublinhado
  animado (`::after`) também deixou de ser desenhado dentro do botão.
- CTA da barra ganhou variante compacta (44px de altura, contra 55px do hero) —
  proporção de navbar, mantendo o alvo de toque confortável.
- **Achado no caminho:** no drawer mobile a logo do header aparecia POR CIMA do
  painel. O `.nav-drawer` é filho do header, e o `z-index:90` do header cria um
  contexto de empilhamento: dentro dele, `.brand` (96) ficava acima do painel (95).
  `.brand` foi para 94. O botão continua acima (é o "fechar") e agora inverte as
  cores sobre o painel navy.

### WhatsApp real aplicado (2026-08-28)
- Cliente informou **(41) 9 9973-3209**. Aplicado em `WA_NUMBER` = `5541999733209`
  (`Site/` e `deploy-vercel/`), o ponto único de onde os 4 CTAs leem.
- O cliente escreveu "+55 41 9973-3209" (8 dígitos). Celular brasileiro tem 9, e a
  proposta comercial trazia `"Whatsapp: 9 9973-32"` — o `9` separado é o nono
  dígito. Por isso o número montado é 55 + 41 + **9**9973-3209.
- Pendência de WhatsApp encerrada no `state.json`.

### Ajustes do cliente — hero e CTAs (2026-08-28)
- **Hero virou split**: texto à esquerda (alinhado à logo) e a obra à direita, com
  legenda. Antes era foto de fundo com overlay e o texto por cima.
- **A foto do hero era de banco de imagens** (operário genérico em andaime). Não dá
  para legendar uma foto de estoque com nome de obra real — seria credencial
  fabricada. Trocada pela foto real do **Ed. Cosmopolitan** (instalação de fachada
  técnica metálica), recortada em 4:5 de `imagens/originais/`. A legenda agora é
  verdadeira e a `hero.webp` de estoque saiu do entregável.
- ⚠️ **Desvio registrado**: o requisito BuildV pede hero com foto de FUNDO + overlay.
  O cliente pediu a imagem ao lado do texto. A exigência de fundo foi trocada por
  foto real em destaque no hero — a intenção do requisito continua atendida.
- **CTAs ao longo da página**: havia só 2 no corpo (hero e `#contato`). Criado o
  componente `.section-cta` (filete + frase de contexto + botão) no fim de
  `#atuacao`, `#comparativo`, `#obras` e `#lse`. Home passou de 2 para 6 CTAs, todos
  para o WhatsApp, com texto pré-preenchido específico da seção.

### Proporção do hero por altura de tela (2026-08-28)
- **Problema:** o hero tinha ~860px fixos, calculados só pela LARGURA. Num notebook
  1366x657 (tamanho comum) só o `h1` cabia: lede, botões, foto e legenda ficavam
  todos abaixo da dobra. Em 1280x610 era pior.
- **Correção:** nova seção 21 do CSS — a tipografia e os respiros do hero passam a
  ser função da **altura** disponível (`min(--fs-hero, 7.4vh)`), e a foto ganhou
  `max-height:calc(100svh - var(--hero-chrome))` com `object-fit:cover`, então ela
  recorta em vez de empurrar o hero para fora.
- **Ordem importa:** as regras por altura precisam vir DEPOIS das regras por
  largura no arquivo — mesma especificidade, vence a ordem. A primeira tentativa
  ficou no meio do CSS e era sobrescrita pelo bloco `≤35em`.
- **Resultado medido** (lede, CTA, foto e legenda dentro da tela):
  1024x600, 1280x610, 1366x657, 1536x730, 1440x780, 1920x955 — todos OK.
  No mobile o CTA principal cabe de 320x568 para cima; a foto fica abaixo da
  dobra, que é o normal em tela de celular.
- Em telas de celular baixas (≤720px) o botão secundário "Ver frentes de atuação"
  é ocultado: é só navegação, existe no menu e a seção vem logo abaixo. Empilhar
  dois botões custava 122px de altura.

### Fundo do hero com a foto desfocada (2026-08-28)
- O navy chapado atrás do texto virou a **mesma foto da obra**, desfocada e em
  largura total, com véu em gradiente por cima. A foto nítida continua à direita.
- **Custo perto de zero:** a fonte do fundo é `hero-bg.webp` de **160x90 px (1,3 KB)**.
  Ampliada pelo navegador ela já vira um borrão suave — evita `blur()` sobre um
  bitmap grande, que é caro no paint. `transform:scale(1.08)` esconde a borda
  clareada pelo desfoque, e o `.hero-bg` tem `overflow:hidden`.
- **Véu assimétrico:** denso à esquerda (94%), onde fica o texto, e fraco à direita
  (34%), onde a foto respira. É o que mantém o contraste sem matar a imagem.
- **Contraste verificado por AMOSTRAGEM DE PIXEL**, não por `getComputedStyle` —
  com fundo de imagem o valor calculado não significa nada. Script
  `hero_contrast.py`: esconde só o texto, tira print, e mede o PIOR pixel atrás de
  cada bloco. Pior caso 5,36:1 (mínimo AA 4,5). 0 falhas em 6 tamanhos de tela.
- Achado no caminho: o rótulo "OBRA EXECUTADA" caía na faixa translúcida do
  gradiente da legenda, sobre as nuvens claras — contraste de 1,3:1. A rampa do
  gradiente foi encurtada e o texto ganhou folga no topo; foi para 4,9-5,2:1.
