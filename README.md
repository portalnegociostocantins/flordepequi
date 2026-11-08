# Flor de Pequi Churrascaria: landing page

Site estático (HTML, CSS e JavaScript puros), sem build e sem dependências. Funciona no GitHub Pages.

## Como publicar no GitHub Pages

1. Envie todos os arquivos desta pasta para a raiz do repositório.
2. No GitHub, abra **Settings > Pages**.
3. Em **Build and deployment**, escolha **Deploy from a branch**, selecione a branch `main` e a pasta `/ (root)`, e clique em **Save**.
4. Em alguns minutos o site fica em `https://SEU-USUARIO.github.io/NOME-DO-REPOSITORIO/`.

Para usar um domínio próprio, preencha **Custom domain** na mesma tela.

## Estrutura

```
index.html          página pública
admin.html          painel para editar o conteúdo
css/style.css       estilos da página
css/admin.css       estilos do painel
js/content.js       TODO o conteúdo do site (textos, links, telefone, fotos)
js/main.js          monta a página a partir do content.js
js/auth.js          senha do painel (código embaralhado)
js/login.js         tela de entrada do painel
js/admin.js         lógica do painel
assets/logo.png     logo
assets/favicon.png  ícone da aba
assets/fotos/       fotos da galeria
robots.txt          orienta buscadores a ignorar o painel
.nojekyll           faz o GitHub Pages servir os arquivos como estão
```

## Como editar o conteúdo (painel admin)

Abra `https://SEU-SITE/admin.html` (há um link discreto "Admin" no rodapé do site) e entre com a senha. O painel edita praticamente tudo:

- título e descrição do Google, logo e texto do rodapé
- faixa de aviso no topo (promoções)
- ordem, visibilidade e nome no menu de cada seção
- cores do site
- textos do topo, selo e botões
- WhatsApp (número, mensagem pronta, botão flutuante)
- cardápio: adicionar, remover e reordenar blocos
- galeria de fotos
- picolés e bomboniere, cartões e vales
- delivery: apps com links, app próprio (Google Play e App Store), telefone
- endereço, horários, link do Google Maps e redes sociais

Seus ajustes ficam salvos como rascunho no navegador. **Pré-visualizar** abre o site com o rascunho, sem publicar.

### Publicar as mudanças

O GitHub Pages só hospeda arquivos, então há dois caminhos:

**A) Baixar e colar (sem configurar nada).** Clique em **Baixar content.js**, abra `js/content.js` no GitHub, clique no lápis, cole o conteúdo e faça o commit. Fotos novas vão para `assets/fotos` (Add file > Upload files).

**B) Publicar direto pelo painel.** Em "Publicar direto no GitHub", informe usuário, repositório, branch e um token. Para criar o token: GitHub > Settings > Developer settings > Personal access tokens > Fine-grained tokens, escolha só este repositório e dê a permissão **Contents: Read and write**. Depois disso, **Publicar no GitHub** grava o `js/content.js`, e o envio de fotos e logo pelo painel já vai para o repositório (as fotos são reduzidas para 1600 px). O token fica só no navegador; marque "Lembrar" apenas em um computador seu.

O botão **Salvar alterações**, no final do painel, guarda o rascunho e publica no GitHub (ou baixa o `content.js`, se a publicação direta não estiver configurada).

### Senha do painel

A senha fica em `js/auth.js` apenas como código embaralhado (SHA-256 com sal), nunca em texto. Ela só afasta curiosos: como o site é estático, quem entende de navegador consegue abrir a tela do painel. O que protege o site de verdade é o token do GitHub, porque sem ele ninguém publica mudanças.

Para trocar a senha, gere um novo `salt` e `hash` e substitua em `js/auth.js`. Com Python:

```python
import hashlib, secrets
salt = secrets.token_hex(16)
print(salt, hashlib.sha256((salt + "NOVA_SENHA").encode()).hexdigest())
```

O primeiro valor impresso vai em `salt` e o segundo em `hash`.

Também é possível editar `js/content.js` direto no GitHub.

## Pendências de conteúdo

- Endereço completo e horários de funcionamento (hoje o endereço aparece só como "Palmas, Tocantins" e os horários ficam ocultos até serem preenchidos).
- Link do Tonolucro e da App Store do Chefinho Delivery (campos opcionais no painel).
- Conferir o telefone (63) 98501-1530.
- Fotos próprias da churrascaria para a galeria.
- Se quiser que o site apareça melhor no Google, troque o endereço no bloco `application/ld+json` do `index.html` quando tiver o endereço completo.

## Links usados

- Instagram: https://www.instagram.com/flordepequichurrascaria/
- Facebook: https://www.facebook.com/p/Churrascaria-flor-de-pequi-100045992337211/
- Google Maps: configurado em `mapsUrl`, no `js/content.js`.
- WhatsApp (encurtado): `https://wa.me/5563985011530?text=...`, montado a partir do número e da mensagem no painel.
- Chefinho Delivery (Google Play), iFood (Google Play) e James Delivery: lista de apps do delivery.

As fontes (Alfa Slab One e Figtree) vêm do Google Fonts. Sem internet, o navegador usa fontes de reserva.
