# Estufa Solar - versão paralela preparada para GitHub v0.4

Abra Estufa-Laboratorio.html com Edge ou Chrome, ou use a previa local ja aberta.
Nada foi publicado e nenhum comando e enviado a ESP32 em operacao.

## Uso
1. Abra Fornada. Informe dimensoes, quantidade, altura dos separadores, umidade inicial e meta.
2. Confirme a cidade e a direcao do coletor.
3. Clique em Salvar e acompanhar.
4. O Painel apresenta uma ampulheta em pixels com os dias estimados e a janela de datas.
5. Para outra cidade, clique em Buscar cidade e escolha o resultado. O clima e carregado automaticamente.
6. O menu Guardar meus cadastros permite salvar/abrir uma copia.

Os cadastros da versao anterior sao preservados. Separadores antigos sem altura declarada usam 15 mm.
Amostras sinteticas da antiga tela de simulacao nao sao convertidas em medicoes reais.
A aba Simulacao e seus parametros foram retirados da interface.

## Clima automatico
Sorocaba ja tem climatologia incluida, podendo funcionar sem internet para esse local.
A localizacao aproximada de outras cidades vem da busca Open-Meteo/GeoNames.
Temperatura, umidade e radiacao mensal: NASA POWER, periodo conforme o cabecalho retornado.
A copia de Sorocaba consultada em 25/10/2026 usa janeiro/2001 a dezembro/2025.
Nebulosidade auxiliar de Sorocaba: INMET 83851, normais 1991-2020, da planilha fornecida.
Nao ha substituicao silenciosa de estacoes. Nebulosidade nao e tratada como radiacao.
Sem clima valido, o mostrador fica aguardando, sem inventar prazo.
As fontes sao identificadas discretamente em Sobre a previsao.

## Estado da previsao
O prazo ainda e energetico preliminar, nao uma curva cinetica validada do Pinus.
Radiacao global e difusa mensais sao transpostas com geometria solar NOAA aproximada,
distribuicao direta suposta durante o dia e componente difusa isotropica.
As hipoteses internas atuais incluem fator solar 0,82, fracao util central 0,25,
densidade basica 500 kg/m3 e energia latente 0,667 kWh/kg.
A faixa usa 0,5 a 1,5 vezes a eficiencia central, sem significado estatistico.
A chapa e o desempenho real precisam de verificacao. Esses parametros nao sao campos do usuario.
A altura dos separadores recalcula a capacidade. Carga excedida fica sem prazo valido.
Passar da data prevista nao libera a carga como seca.
O painel consulta as leituras reais de ar e o comando dos coolers. As sondas da madeira ainda não instaladas ficam sem leitura. A previsão continua preliminar, sem ajuste pela umidade real da madeira.

## Rede e preservacao do sistema existente
Esta versão consulta, somente com GET, o receptor atual:
https://estufa-api.josequiriri132.workers.dev/api/estado
Além dele, consulta os serviços públicos de cidade e clima.
Nenhum comando é enviado à ESP32. Nenhum serviço remoto foi alterado ou publicado.

Verificação em 25/10/2026: o receptor permite CORS apenas para a origem atual
https://josequiriri132-coder.github.io . Uma origem diferente recebe JSON via HTTP,
mas não recebe Access-Control-Allow-Origin e o navegador bloqueia a leitura.
Antes da publicação sob nova conta, acrescentar https://NOVO-USUARIO.github.io
à lista de origens permitidas do Worker, PRESERVANDO a origem anterior.
Não alterar endpoint, autenticação de envio, armazenamento ou rotas existentes.
O caminho do repositório não faz parte da origem CORS.
Não usar no-cors nem um proxy público para contornar a restrição.
Após a mudança, verificar leitura no novo site e no antigo antes de concluir.

O receptor deve permanecer ativo mesmo após desativar a página antiga: a ESP32
continua enviando para ele. Não há necessidade de regravar a ESP32 para esta etapa.
Sem a liberação do novo domínio, o novo painel ficará sem conexão, sem dados fictícios.
Leituras com mais de 5 minutos deixam de ser apresentadas como atuais.
Cadastros de fornadas ficam neste navegador. Não são sincronizados entre aparelhos
ou contas GitHub. Use Guardar meus cadastros > Salvar uma cópia / Abrir uma cópia.
O histórico de gráficos ainda depende de CSV importado; não se cria um histórico
24 horas por dia apenas com uma página estática aberta ocasionalmente.

## Publicar em GitHub Pages
1. Criar um repositório público na nova conta (por exemplo, estufa-solar).
2. Extrair Estufa-GitHub.zip e enviar os arquivos da raiz, inclusive index.html e todos os JS.
3. Em Settings > Pages, selecionar Deploy from a branch > main > / (root).
4. Informar o endereço final para liberar sua origem no receptor, mantendo a antiga.
5. Abrir o novo endereço e conferir leituras e horários; manter o site antigo ativo.
Não colocar senhas nem tokens de envio da ESP32 no repositório público.

## Arquivos
Estufa-Laboratorio.html: aplicativo completo em um arquivo.
index.html, app.js, model.js, planner.js e climate-seed.js: fontes modulares; live-source.js faz a leitura do receptor.
model.test.cjs e planner.test.cjs: 15 testes de regras e calculos.
fonte-nasa.json: resposta publica usada no cache de Sorocaba.
contrato-telemetria-v1.json: rascunho da integracao futura, ainda nao conectado.

Testes: node --test model.test.cjs planner.test.cjs fornadas.test.cjs live-source.test.cjs

## Historico de fornadas
A lista fica no Historico, em linhas compactas, com Ver, Editar e Excluir.
Excluir move a fornada e as amostras relacionadas para uma lixeira local recuperavel.
Desfazer exclusao restaura a ultima exclusao, inclusive apos recarregar a pagina.
Exclusoes sucessivas podem ser desfeitas uma por vez. Nao ha exclusao permanente nesta versao.
A aba Fornada conserva somente cadastro e edicao. A estrutura antiga de armazenamento foi mantida para preservar cadastros.
Testes adicionais: node --test fornadas.test.cjs
