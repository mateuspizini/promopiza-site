# Setup do tracking de cliques (`/go`)

O `/go/[id]` agora aceita `?canal=` e envia cada clique para um webhook (sem atrasar o redirect). Falta só criar o webhook — 5 minutos no Google Apps Script.

## 1. Criar a aba de cliques

Na planilha `Promopiza - Produtos`, crie uma aba chamada **Cliques** com o cabeçalho na linha 1:

```
ts | id | canal | loja | categoria | titulo
```

## 2. Criar o Apps Script

Na planilha: **Extensões → Apps Script**, cole:

```javascript
function doPost(e) {
  var dados = JSON.parse(e.postData.contents);
  var aba = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Cliques");
  aba.appendRow([
    dados.ts || new Date().toISOString(),
    dados.id || "",
    dados.canal || "",
    dados.loja || "",
    dados.categoria || "",
    dados.titulo || ""
  ]);
  return ContentService.createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

## 3. Publicar

**Implantar → Nova implantação → App da Web**:

- Executar como: **eu**
- Quem tem acesso: **Qualquer pessoa**

Copie a URL gerada (`https://script.google.com/macros/s/.../exec`).

## 4. Configurar na Vercel

Em **Settings → Environment Variables** do projeto:

```
PROMOPIZA_CLICK_WEBHOOK_URL = <URL do Apps Script>
```

Variáveis opcionais da página `/links` e do banner:

```
NEXT_PUBLIC_PROMOPIZA_WHATSAPP_URL  = https://whatsapp.com/channel/0029Vb8QUIx0AgWApxc17N2s (já é o padrão)
NEXT_PUBLIC_PROMOPIZA_TELEGRAM_URL  = link do seu canal Telegram
NEXT_PUBLIC_PROMOPIZA_INSTAGRAM_URL = link do seu Instagram
```

Redeploy e pronto.

## 5. Usar nos posts (n8n)

Trocar o link publicado de `link_afiliado` para:

```
https://SEU-DOMINIO/go/{{id}}?canal=whatsapp   (ou telegram, facebook, instagram)
```

Sem `?canal=`, o clique é registrado como `site`.

## Teste rápido

1. `https://SEU-DOMINIO/go/UM-ID-ATIVO?canal=teste` → deve redirecionar para a loja
2. Conferir se a linha apareceu na aba **Cliques**
3. ID inexistente → redireciona para a home (sem registrar)
