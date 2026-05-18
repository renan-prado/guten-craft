# CLAUDE.md — plugin-mesa-gutenberg

Plugin WordPress independente para blocos Gutenberg customizados do iConnections. Compilado localmente e instalado via upload de ZIP no painel do WordPress.

---

## Estrutura do projeto

```
plugin-mesa-gutenberg/
├── plugin-mesa-gutenberg.php   ← entry point PHP (cabeçalho do plugin)
├── includes/
│   └── register-blocks.php     ← registra automaticamente todo bloco em build/blocks/*/
├── src/
│   └── blocks/
│       └── example-block/      ← template de bloco (copie para criar novos)
│           ├── block.json      ← metadata: nome, atributos, supports
│           ├── index.js        ← registerBlockType
│           ├── edit.js         ← componente do editor (React)
│           ├── save.js         ← output serializado no post
│           ├── style.scss      ← estilos frontend + editor
│           └── editor.scss     ← estilos exclusivos do editor
├── build/                      ← gerado pelo webpack — NÃO editar manualmente
├── dist/                       ← ZIPs versionados prontos para upload
├── scripts/
│   └── zip.js                  ← script que builda e empacota o ZIP
├── package.json
└── webpack.config.js           ← não utilizado (wp-scripts faz auto-discovery)
```

---

## WordPress local

- **URL:** `http://iconnections.local/`
- **Painel:** `http://iconnections.local/wp-admin/`
- **Raiz dos arquivos:** `C:\Users\Renan Prado\Local Sites\iconnections\app\public\`
- **Plugin instalado:** `…\wp-content\plugins\plugin-mesa-gutenberg\`
- **Log de erros:** `…\wp-content\debug.log`
- **Configuração PHP/debug:** `…\wp-config.php`
- **Ambiente:** Local by Flywheel, PHP 8.1/8.2

### Habilitar debug

No `wp-config.php`, o bloco de debug fica em torno da linha 90:

```php
if ( ! defined( 'WP_DEBUG' ) ) {
    define( 'WP_DEBUG', true );
    define( 'WP_DEBUG_LOG', true );
    define( 'WP_DEBUG_DISPLAY', false );
}
```

Com `WP_DEBUG_LOG` ativo, erros PHP são gravados em `wp-content/debug.log`.

---

## Comandos de desenvolvimento

```bash
# Instalar dependências (só na primeira vez ou após atualizar package.json)
npm install

# Watch mode durante desenvolvimento
npm run start

# Build de produção
npm run build

# Gerar ZIP versionado para upload no WordPress
npm run zip
```

---

## Skill `/plugin-zip`

Disponível no Claude Code deste projeto. Automatiza o ciclo completo:

1. Faz o build (`npm run build`)
2. Cria `dist/plugin-mesa-gutenberg-{version}.zip` com apenas os arquivos necessários para o WordPress (`plugin-mesa-gutenberg.php`, `includes/`, `build/`)
3. Exclui automaticamente `src/`, `node_modules/`, configs de build

**Uso:**
```
/plugin-zip           → usa versão atual do package.json
/plugin-zip 1.2.0     → atualiza versão em package.json e plugin.php, builda e gera ZIP
```

**Upload no WordPress:** Plugins → Adicionar novo → Enviar plugin → selecionar o `.zip`.

---

## Adicionando um novo bloco

1. Copie `src/blocks/example-block/` para `src/blocks/meu-bloco/`
2. Edite `block.json` — mude `"name"` para `"mesa-gutenberg/meu-bloco"`
3. Implemente `edit.js` e `save.js`
4. Rode `/plugin-zip` para gerar o ZIP

O webpack (`@wordpress/scripts`) descobre automaticamente todos os blocos via `block.json`. O PHP em `includes/register-blocks.php` registra automaticamente qualquer bloco que aparecer em `build/blocks/`.

---

## Armadilhas conhecidas

### `*/` dentro de comentários PHP
Nunca use `*/` dentro de um comentário `/* */` — o `*/` fecha o bloco prematuramente causando parse error fatal. Isso se aplica especialmente a padrões glob como `build/blocks/*/block.json` em docblocks. Use `{block-name}` como substituto descritivo.

**Errado:**
```php
/** Lê build/blocks/*/block.json */
```
**Correto:**
```php
/** Lê build/blocks/{block-name}/block.json */
```

### `glob()` retornando `false` no PHP 8
Em PHP 8, `foreach (false as ...)` lança `TypeError` fatal. Sempre use `?: []` ou verifique com `empty()` antes do `foreach`.

### `register_block_type` com diretório
Requer WordPress 5.8+. Lê o `block.json` e resolve automaticamente os `file:` references para registrar scripts e estilos. O arquivo `index.asset.php` gerado pelo webpack é obrigatório e contém as dependências.
