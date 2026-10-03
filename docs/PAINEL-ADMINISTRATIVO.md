# Painel de conteúdo — Iasmin Portugal

## Usar no computador de desenvolvimento

O painel fica em `http://localhost:3000/admin`. O servidor é iniciado com `npm run dev`.
O acesso local foi gerado em `.cms/ACESSO-LOCAL.md`. Esse arquivo e `.env.local` são privados e não devem ser publicados. O e-mail do acesso local é apenas um identificador; não cria uma caixa de e-mail.

1. Entre no painel.
2. Abra **Conteúdo do site** e escolha a seção. A busca encontra textos entre todas as seções.
3. Altere textos, fotos e descrições de acessibilidade. Nas fotos de apresentação, escolha o enquadramento.
4. Clique em **Salvar rascunho**. Isso ainda não muda o site público.
5. Confira **Prévia**, escolhendo página inicial, percurso ou privacidade e tela de computador ou celular.
6. Clique em **Publicar** e revise as seções alteradas antes de confirmar.

**Perguntas frequentes** permite adicionar, remover e ordenar até 20 perguntas. **Galeria de reflexões** permite adicionar, remover e ordenar até 12 imagens. Os textos dentro de uma arte são alterados substituindo a imagem. A biblioteca aceita JPG, PNG e WebP de até 3 MB. Prefira imagens com tamanho próximo ao exibido no site; para logos, use PNG ou WebP com fundo transparente.

O histórico guarda as 30 versões publicadas anteriores. **Restaurar rascunho** recupera uma versão sem publicá-la automaticamente. **Restaurar original** recupera o conteúdo inicial de um campo. A cópia JSON exportada contém textos e referências; os arquivos de imagem ficam no armazenamento e não estão dentro dessa cópia.

Textos repetidos entre páginas são compartilhados. Os nomes dos temas também aparecem na página inicial. As perguntas e alternativas do percurso podem mudar de redação, mas seus identificadores, cinco perguntas por tema e lógica de pontuação permanecem fixos. Assim, as respostas enviadas ao servidor continuam sendo validadas pelo mesmo modelo. Mudanças clínicas na lógica precisam de uma atualização técnica específica. Revise a política de privacidade de acordo com a operação real; a retenção dos dados do percurso continua sendo de 180 dias.

## Configurar na Vercel

Esta entrega está implementada e validada localmente. A instalação em produção precisa das variáveis abaixo no ambiente do projeto e de um novo deploy. O painel não usa o disco temporário da Vercel para salvar conteúdo.

- `DATABASE_URL`: conexão PostgreSQL/Neon com permissão para criar `site_cms` e `site_media`. As tabelas são criadas na primeira conexão. Não há alteração da tabela de respostas do percurso.
- `ADMIN_SESSION_SECRET`: segredo aleatório com pelo menos 32 caracteres. Use um valor diferente em cada ambiente.
- `ADMIN_SETUP_TOKEN`: código aleatório de ativação, também com pelo menos 32 caracteres. Guarde-o com o responsável pelo projeto, fora de arquivos públicos.

Gere valores independentes com `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`. Nunca copie os segredos locais para um repositório ou para uma mensagem pública.

Após o deploy, abra `https://iasminportugal.com.br/admin`, informe o código de ativação e crie o e-mail e a senha definitiva do cliente. A ativação só funciona antes da primeira conta. Remova ou rotacione `ADMIN_SETUP_TOKEN` depois da ativação. A senha local não é importada automaticamente para produção.

Em produção, textos, versões, hash da senha e metadados de mídia ficam em PostgreSQL; os arquivos de imagem ficam na tabela `site_media`. Verifique a capacidade e o backup do banco contratado. Configure backups do banco para recuperar também as imagens; o histórico do painel e o arquivo JSON não substituem um backup completo. As imagens antigas são mantidas para não quebrar versões anteriores.

No desenvolvimento, sem `DATABASE_URL`, os dados ficam em `.cms/state.json` e `.cms/media/`. Copiar o projeto sem essa pasta não copia as edições locais. Nunca apague essa pasta sem um backup. Em produção, a ausência de banco desabilita o painel; as páginas públicas preservam o conteúdo original.

## Proteção e limites

- Senhas com scrypt e salt aleatório; nenhuma senha fica no conteúdo enviado ao navegador.
- Sessões de até 8 horas com assinatura HMAC; cookie HttpOnly, SameSite Strict e Secure em produção.
- Alterar senha ou sair invalida as sessões anteriores.
- Leitura de rascunho, edição, publicação, restauração e upload exigem autenticação no servidor.
- Mutações verificam a origem da requisição. Cinco tentativas incorretas bloqueiam o login por 15 minutos.
- Validação dos campos e URLs; textos são renderizados como texto, sem HTML executável.
- Imagens têm assinatura de arquivo verificada; uploads SVG não são aceitos. URLs de mídia são públicas porque servem as fotos do site; não envie documentos pessoais ou arquivos privados para essa biblioteca.
- Gravação com controle de revisão impede que uma janela sobrescreva silenciosamente outra. Se aparecer o aviso de conflito, copie seus textos recentes e atualize o painel antes de continuar.
- A prévia usa o rascunho salvo. Links para outras páginas abrem a versão pública. Não use o percurso da prévia para coletar dados de pessoas reais.

## Design e cobertura

O painel acompanha a identidade existente: marfim `#f5eee3`, creme `#fff9f1`, areia `#eadbc8`, terracota `#b65e3d`, espresso `#402419` e oliva `#72754c`. Mantém Plus Jakarta Sans para títulos, formulários e navegação. O conteúdo fica alinhado à esquerda; a barra lateral organiza as tarefas, a barra superior mantém prévia e publicação próximas, e o editor divide o site por seções reais. No celular, a navegação se recolhe e os campos passam para uma coluna. Foco de teclado, rótulos de formulário, diálogos e movimento reduzido foram contemplados.

Foram auditados cabeçalho, abertura, reconhecimento, apresentação profissional, formação, pilares do atendimento, temas de escuta, conteúdo editorial, convite ao quiz, FAQ, contato, rodapé, redes sociais, logos, transições, telas do percurso, 20 enunciados, 80 alternativas, 28 devolutivas, imagens, privacidade e metadados de busca. O catálogo está em `src/lib/cms/catalog.json`; a conexão dos campos ao site está em `src/components/cms/content.tsx` e nos componentes das páginas. Novos campos estruturais precisam ser adicionados ao catálogo e ao componente que os exibe.

## Verificar alterações técnicas

Execute `npm run lint`, `npx tsc --noEmit`, `npm test` e `npm run build`. Os testes do CMS cobrem acesso, ativação, senha, limitação de tentativas, validação, rascunho, publicação, histórico, conflito de revisão, conteúdo exibido e persistência de imagens. A gravação em Neon precisa ser validada no ambiente configurado; a suíte local usa uma pasta temporária isolada.
