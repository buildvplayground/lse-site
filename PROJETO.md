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
