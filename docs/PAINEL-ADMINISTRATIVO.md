# Painel de conteúdo — Iasmin Portugal

## Usar no computador de desenvolvimento

O painel fica em `http://localhost:3000/admin`. O servidor é iniciado com `npm run dev`.
O acesso local foi gerado em `.cms/ACESSO-LOCAL.md`. Esse arquivo e `.env.local` são privados e não devem ser publicados. O login usa usuário e senha; não é necessário cadastrar e-mail.

1. Entre no painel.
2. Abra **Conteúdo do site** e escolha a seção. A busca encontra textos entre todas as seções.
3. Altere textos, fotos e descrições de acessibilidade. Nas fotos de apresentação, escolha o enquadramento.
4. Clique em **Salvar rascunho**. Isso ainda não muda o site público.
5. Confira **Prévia**, escolhendo página inicial, percurso ou privacidade e tela de computador ou celular.
6. Clique em **Publicar** e revise as seções alteradas antes de confirmar.

**Perguntas frequentes** permite adicionar, remover e ordenar até 20 perguntas. **Galeria de reflexões** permite adicionar, remover e ordenar até 12 imagens. Os textos dentro de uma arte são alterados substituindo a imagem. A biblioteca aceita JPG, PNG e WebP de até 3 MB. Prefira imagens com tamanho próximo ao exibido no site; para logos, use PNG ou WebP com fundo transparente.

O histórico guarda as 30 versões publicadas anteriores. **Restaurar rascunho** recupera uma versão sem publicá-la automaticamente. **Restaurar original** recupera o conteúdo inicial de um campo. A cópia JSON exportada contém textos e referências; os arquivos de imagem ficam no armazenamento e não estão dentro dessa cópia.

Textos repetidos entre páginas são compartilhados. Os nomes dos temas também aparecem na página inicial. As perguntas e alternativas do percurso podem mudar de redação, mas seus identificadores, cinco perguntas por tema e lógica de pontuação permanecem fixos. Assim, as respostas enviadas ao servidor continuam sendo validadas pelo mesmo modelo. Mudanças clínicas na lógica precisam de uma atualização técnica específica. Revise a política de privacidade de acordo com a operação real; a retenção dos dados do percurso continua sendo de 180 dias.

## Gestão de usuários

Administradores encontram **Usuários** na navegação do painel. Clique em **Adicionar usuário**, informe o nome, um usuário único e uma senha de 8 a 128 caracteres. Compartilhe o acesso por um canal privado. O painel não envia convites por e-mail.

- **Editor:** pode editar, salvar, publicar, restaurar versões e enviar imagens.
- **Administrador:** possui os mesmos recursos e também cria usuários, altera permissões, redefine senhas e revoga ou reativa acessos.
- **Último acesso:** mostra o último login bem-sucedido, no horário da Bahia. Novas contas aparecem com “Nenhum login registrado” até a primeira entrada.
- Não é possível revogar o próprio acesso ou mudar a própria permissão. Sempre deve existir pelo menos um administrador ativo. A revogação preserva o histórico de acesso e pode ser revertida.
- A alteração de usuário, permissão ou senha invalida as sessões dessa pessoa. A pessoa pode alterar sua própria senha em **Minha conta**.

Contas antigas são migradas automaticamente para administradores, mantendo a senha e os conteúdos. O usuário é a parte anterior ao `@` do e-mail, em minúsculas, restrita a letras sem acento, números, ponto, hífen e sublinhado, com até 32 caracteres; se ficar com menos de 3 caracteres, usa `admin`. A migração não inventa datas de acessos anteriores. Sessões do modelo antigo precisam entrar novamente. Os dados continuam no mesmo arquivo ou registro do banco, sem apagar conteúdo. O painel permite até 50 usuários.

## Respostas da jornada

O sino na barra superior mostra os envios ainda não vistos pelo administrador conectado. Ele consulta novos envios a cada 45 segundos enquanto a página está visível e ao voltar para a aba. Abrir a lista não marca tudo como visto: a leitura é registrada somente ao abrir os detalhes de um envio. Cada administrador tem seu próprio contador. A falha de consulta é indicada no sino; não é tratada como ausência de respostas.

Administradores encontram **Respostas da jornada** no menu. A lista permite buscar por nome, e-mail ou WhatsApp, filtrar por tema e navegar por páginas de 25 envios. **Ver respostas** abre os contatos, a data do envio no horário da Bahia, as cinco escolhas, a devolutiva e o registro do consentimento. **Atualizar respostas** consulta os novos envios; a tela não faz atualização automática. Editores de conteúdo não têm acesso a esses dados, inclusive pela API.

Novos envios guardam uma cópia das perguntas, das alternativas escolhidas e da devolutiva, usando o conteúdo publicado no momento do recebimento. Editar a jornada depois não muda essa cópia. Envios anteriores sem essa cópia são identificados: os códigos das escolhas permanecem, e a redação exibida é a original do sistema quando ainda reconhecida.

As respostas são consultadas na mesma tabela `journey_submissions` usada pelo formulário público; não há importação manual. O painel não exibe envios excluídos ou fora do prazo de retenção, mesmo antes da execução do cron. A anonimização também elimina a cópia dos textos. O consentimento para a jornada não autoriza contato promocional.

Sem `DATABASE_URL`, somente em desenvolvimento, o formulário público salva os envios em `.cms/journey-submissions.json`; o painel mostra um aviso de ambiente local. Esses dados não são enviados para o site oficial. Em produção, o banco é obrigatório e a gravação em arquivo permanece bloqueada.

## Publicação e produção

Esta entrega está implementada e validada localmente. A instalação em produção precisa das variáveis abaixo no ambiente do projeto e de um novo deploy. O painel não usa o disco temporário da Vercel para salvar conteúdo.

Ao iniciar com `DATABASE_URL`, o servidor aplica automaticamente as migrações aditivas da jornada até a versão 004. `src/lib/journey-schema.ts` usa uma transação com bloqueio entre instâncias, registra a versão em `site_schema_migrations` e preserva os dados existentes. Em caso de falha, a inicialização pode ser repetida. A conexão deve permitir criar e alterar essas tabelas. Os arquivos `sql/001` a `sql/004` continuam disponíveis para aplicação manual por um operador; não execute a criação inicial sobre uma tabela já existente. Configure também `CRON_SECRET` para a rotina de retenção já definida em `vercel.json`. Use bancos separados entre produção e ambientes de teste.

O editor envia as alterações para `/api/admin`. **Salvar rascunho** grava `draft`; **Publicar** guarda a versão anterior e atualiza `published` no banco. As páginas públicas leem `published` dinamicamente. Após o sucesso, novos carregamentos recebem a versão publicada, sem commit, push ou novo deploy. Uma aba já aberta precisa ser recarregada. No armazenamento local, a confirmação informa que a publicação vale somente para este computador.

## Navegação e iPad

O botão de recolher alterna entre a barra completa e uma coluna de ícones com o monograma. A escolha é lembrada neste navegador. Entre 768 e 1199 pixels, a barra começa compacta quando ainda não existe uma preferência; o editor apresenta a prévia acima dos controles. O painel é validado em 810 × 1080 e 1080 × 810 pixels para o iPad de 9ª geração. Abaixo de 768 pixels, o menu funciona como um painel sobreposto. A animação GSAP dura 260 ms, usa transformação e opacidade e respeita movimento reduzido; ações por teclado são imediatas.

- `DATABASE_URL`: conexão PostgreSQL/Neon com permissão para criar `site_cms` e `site_media`. As tabelas são criadas na primeira conexão. Não há alteração da tabela de respostas do percurso.
- `ADMIN_SESSION_SECRET`: segredo aleatório com pelo menos 32 caracteres. Use um valor diferente em cada ambiente.
- `ADMIN_SETUP_TOKEN`: código aleatório de ativação, também com pelo menos 32 caracteres. Guarde-o com o responsável pelo projeto, fora de arquivos públicos.

Gere valores independentes com `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`. Nunca copie os segredos locais para um repositório ou para uma mensagem pública.

Após o deploy, o responsável pela entrega deve abrir `https://iasminportugal.com.br/admin/ativar`, informar o código de ativação e criar o usuário e a senha definitiva do cliente. A ativação só funciona antes da primeira conta; depois disso, essa rota redireciona para `/admin`. O login em `/admin` exibe apenas usuário e senha. Remova ou rotacione `ADMIN_SETUP_TOKEN` depois da ativação. A senha local não é importada automaticamente para produção.

Em produção, textos, versões, hash da senha e metadados de mídia ficam em PostgreSQL; os arquivos de imagem ficam na tabela `site_media`. Verifique a capacidade e o backup do banco contratado. Configure backups do banco para recuperar também as imagens; o histórico do painel e o arquivo JSON não substituem um backup completo. As imagens antigas são mantidas para não quebrar versões anteriores.

No desenvolvimento, sem `DATABASE_URL`, os dados ficam em `.cms/state.json` e `.cms/media/`. Copiar o projeto sem essa pasta não copia as edições locais. Nunca apague essa pasta sem um backup. Em produção, a ausência de banco desabilita o painel; as páginas públicas preservam o conteúdo original.

## Proteção e limites

- Senhas com scrypt e salt aleatório; nenhuma senha fica no conteúdo enviado ao navegador.
- Sessões de até 8 horas com assinatura HMAC; cookie HttpOnly, SameSite Strict e Secure em produção.
- Alterar senha ou sair invalida as sessões anteriores apenas daquela pessoa. Revogar acesso também encerra suas sessões.
- Leitura de rascunho, edição, publicação, restauração e upload exigem autenticação no servidor.
- Mutações verificam a origem da requisição. Cinco tentativas incorretas bloqueiam o login daquele usuário por 15 minutos; isso não bloqueia as outras contas.
- Validação dos campos e URLs; textos são renderizados como texto, sem HTML executável.
- Imagens têm assinatura de arquivo verificada; uploads SVG não são aceitos. URLs de mídia são públicas porque servem as fotos do site; não envie documentos pessoais ou arquivos privados para essa biblioteca.
- Gravação com controle de revisão impede que uma janela sobrescreva silenciosamente outra. Se aparecer o aviso de conflito, copie seus textos recentes e atualize o painel antes de continuar.
- A prévia usa o rascunho salvo. Links para outras páginas abrem a versão pública. Não use o percurso da prévia para coletar dados de pessoas reais.

## Design e cobertura

O painel acompanha a identidade existente: marfim `#f5eee3`, creme `#fff9f1`, areia `#eadbc8`, terracota `#b65e3d`, espresso `#402419` e oliva `#72754c`. Mantém Plus Jakarta Sans para títulos, formulários e navegação. O conteúdo fica alinhado à esquerda; a barra lateral organiza as tarefas, a barra superior mantém prévia e publicação próximas, e o editor divide o site por seções reais. No celular, a navegação se recolhe e os campos passam para uma coluna. Foco de teclado, rótulos de formulário, diálogos e movimento reduzido foram contemplados.

Foram auditados cabeçalho, abertura, reconhecimento, apresentação profissional, formação, pilares do atendimento, temas de escuta, conteúdo editorial, convite ao quiz, FAQ, contato, rodapé, redes sociais, logos, transições, telas do percurso, 20 enunciados, 80 alternativas, 28 devolutivas, imagens, privacidade e metadados de busca. O catálogo está em `src/lib/cms/catalog.json`; a conexão dos campos ao site está em `src/components/cms/content.tsx` e nos componentes das páginas. Novos campos estruturais precisam ser adicionados ao catálogo e ao componente que os exibe.

## Verificar alterações técnicas

Execute `npm run lint`, `npx tsc --noEmit`, `npm test` e `npm run build`. Os testes do CMS cobrem acesso, ativação, senha, limitação de tentativas, validação, rascunho, publicação, histórico, conflito de revisão, conteúdo exibido e persistência de imagens. A gravação em Neon precisa ser validada no ambiente configurado; a suíte local usa uma pasta temporária isolada.
