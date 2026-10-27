# Estufa consolidada 0.7

Abra index.html por HTTP ou use Estufa-Laboratorio.html como cópia autônoma. Os dados de ar continuam vindo do receptor existente, sem comandos ao equipamento.

## O que mudou

- O histórico de toda a fornada alimenta a estimativa, independentemente da aba dos gráficos estar aberta.
- Temperatura e umidade medidas determinam o equilíbrio higroscópico e a taxa calculada de perda/reabsorção. Espessura, massa, canais de circulação, comando dos coolers e renovação do ar participam.
- O painel mostra umidade estimada, água estimada por dia, cobertura do histórico e limitante calculado.
- O futuro usa meteorologia horária Open-Meteo quando disponível; nos períodos sem cobertura meteorológica usa climatologia mensal NASA POWER, identificada na interface.
- O balanço futuro considera calor solar, perdas, aquecimento da carga e evaporação. Não há mais aproveitamento fixo de 25% no planejador ativo.
- O prazo é ancorado no último dado. Leituras antigas e lacunas suspendem a apresentação do prazo; falhas explícitas não são interpoladas. Dados anteriores a registros disponíveis não são inventados.
- CSV real importado no Histórico também pode alimentar a integração nesta sessão. A consulta à nuvem recupera registros mesmo após fechar e reabrir o navegador.
- Uma medição da madeira, informada manualmente ou recebida sob contrato válido de sonda calibrada, ancora o estado. Duas medições com histórico suficiente permitem ajustar o multiplicador cinético. Isso é ajuste experimental da carga, não validação independente.

## Operação

1. Abra Fornada, informe dimensões, quantidade, separadores, umidade inicial em base seca e meta.
2. Confirme local e direção, salve e acompanhe o painel.
3. Em Dados da estufa e ajuste do modelo, confirme os parâmetros que forem efetivamente conhecidos. Cada carga guarda os próprios parâmetros.
4. Registre medições independentes quando disponíveis. Nunca copie a umidade estimada pelo modelo para o campo de medição.
5. A indicação de meta estimada exige conferência da madeira. Uma amostra medida na meta também não certifica todas as tábuas.

## Dados, armazenamento e publicação

O navegador usa GET para leituras, POST para liberar edição e PUT autenticado com revisão para salvar fornadas. A senha permanece somente na memória da sessão. Os novos parâmetros e referências são campos opcionais dentro da fornada; o contrato existente do servidor aceita e preserva esses dados. A ESP32 e o Worker publicado não foram alterados por esta consolidação. O pacote é somente do site; não requer reinstalar o Worker de sincronização que já funciona. Publicar os arquivos na mesma origem GitHub já autorizada preserva a leitura. O acesso por localhost ou file pode ser bloqueado pelo CORS do receptor: isso é mostrado como indisponibilidade, sem proxy e sem dados falsos. Uma nova origem precisa ser autorizada pelo responsável pelo Worker.

As fornadas, parâmetros do cálculo e medições manuais de referência são sincronizados pela API /api/fornadas existente. A edição continua protegida por senha em memória e revisão contra alterações simultâneas. O localStorage existente (chave estufa-laboratorio-v2) é preservado como cópia local; a lixeira continua recuperável. A correção do formulário mantém os valores da carga selecionada e preserva rascunhos durante a sincronização. O histórico de ar é recuperado da Cloudflare e mantido em memória durante a sessão. Importações CSV são locais e não são transmitidas.

O banco atual não apaga registros. O índice /api/dias lista até 366 dias com dados e a consulta diária aceita até 5.000 leituras. Para cargas ou consultas além desse índice será necessária paginação do servidor. Uma carga com histórico incompleto permanece explicitamente parcial.

Acesso à meteorologia envia apenas latitude/longitude do local escolhido ao Open-Meteo e à NASA, sem dados das tábuas, leituras internas ou umidade da madeira.

## Precisão e parâmetros

Veja MODELO-E-FONTES.md. Esta implementação é um observador reduzido experimental, não um modelo validado para esta montagem. Os testes verificam cálculos e comportamento; não demonstram erro de previsão em uma fornada real. Sem medir vazões, identificar a cobertura e confrontar a madeira, a faixa pode ser bastante ampla.

## Verificação

Execute `node --test` neste diretório, usando o Node disponível no ambiente de desenvolvimento. Os testes abrangem EMC, psicrometria, balanço de massa, reabsorção, influência da espessura, coolers/separadores, fechamento das aberturas, relógio sem novos dados, falhas e lacunas, calibração, origem das leituras, cadastros e histórico.

`build.py` gera o HTML autônomo e o pacote de publicação a partir de index.html e dos módulos atuais. O antigo método model.estimate foi mantido exclusivamente como rotina legada para regressão; o painel chama planner.forecast, que usa drying-model.js. Ele não é mais o planejador ativo.


## Consolidação de 27/10/2026

Integra as pastas fornecidas Atualização site - Sincronização das fornadas e Correção formulario do site à versão 0.6 do cálculo. A segunda pasta já continha a sincronização e foi usada como base funcional de cadastro. O history-client.js sincronizado também foi preservado.

As novas referências da madeira ficam dentro da respectiva fornada, para não serem apagadas a cada atualização da nuvem. Editar dimensões conserva parâmetros e referências. Alterações dos parâmetros e medições obedecem à mesma senha e revisão do formulário. O cálculo usa o relógio de referência do servidor.

Este pacote substitui o Estufa-Integrada-v06.zip para publicação. Não se deve enviar os pacotes anteriores por cima dele. O ZIP contém somente arquivos do site, sem banco, credenciais, fixtures de teste ou código de Worker.
