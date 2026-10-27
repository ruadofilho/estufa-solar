# Modelo integrado e origem dos parâmetros

## Estrutura das contas

1. Massa seca estimada = volume cadastrado × densidade básica. A umidade está em base seca. Água restante = massa seca × (umidade estimada - meta)/100.
2. O equilíbrio de umidade usa a equação Hailwood-Horrobin/Simpson em Celsius. Não é a umidade atual da tábua.
3. O estado médio segue uma aproximação de difusão pela espessura com resistência superficial em série. A difusividade varia com temperatura e com o regime acima/abaixo da saturação das fibras. É uma redução de ordem, não uma solução espacial do interior da tábua.
4. A resistência superficial usa uma correlação laminar de Sherwood. A velocidade é estimada pela circulação informada e pela seção dos canais calculada a partir dos separadores e do empilhamento. Giro, vazão e distribuição pelos canais não são medidos pelo simples comando elétrico.
5. Nos intervalos históricos, temperatura e umidade internas medidas são impostas como condições de contorno. A perda calculada é limitada por transferência de calor para evaporação e pela capacidade de renovação/armazenamento de vapor no ar. A renovação natural depende de áreas livres, diferença de temperatura e altura das aberturas; vazão forçada adicional pode ser informada.
6. A meteorologia externa horária é modelada pelo Open-Meteo, não uma medição de sensor externo na propriedade. Onde faltar, entram médias mensais identificadas. A radiação é usada no balanço futuro; ela não é medida pelo AHT20.
7. O futuro resolve balanço sensível/latente e renovação em passos horários, com capacidade térmica aproximada da madeira, água e ar. A inclinação de 28 graus e a orientação afetam a radiação transposta. Massa da estrutura/isolamento, pontes térmicas detalhadas, vento, histerese de sorção, empenamento, tensões internas, condensação nas paredes e distribuição tridimensional não são identificados pelos dados disponíveis e não são simulados detalhadamente.
8. O comando dos coolers vem de cada registro quando disponível; se o registro não o incluir, usa-se o horário programado 09h–18h, explicitamente como hipótese. O futuro pressupõe esse programa.
9. Uma leitura calibrada da madeira atualiza o estado. O ajuste por duas ou mais medições usa bisseção sobre o multiplicador cinético, exigindo queda mínima de 0,5 ponto, 6 horas de intervalo e 90% de cobertura de ar. Recusa intervalos sem sensibilidade cinética identificável. A amostra não comprova uniformidade da carga.
10. As integrações usam pares de amostras separados por até 15 minutos; falha explícita rompe o intervalo. A cobertura mínima de 90% e a validade de 5 minutos são regras de software, não garantias físicas.

## Parâmetros e o que realmente se sabe

| Parâmetro | Valor inicial | Origem e condição |
|---|---:|---|
| Cobertura útil | 0,66442 × 1,220 m | Dimensões do memorial fornecido |
| Inclinação | 28 graus | Projeto fornecido |
| Volume da câmara | 0,4743 m³ | Geometria do memorial |
| UA da envoltória | 5,8059166 W/K | Estimativa do memorial; sem validação de pontes e vedações |
| Aberturas de entrada/saída | 0,01 m² cada | Quatro escotilhas de 100 × 50 mm, duas por função, hipótese de operação |
| Fração livre das aberturas | 0,5 | Cenário de tela/obstrução, não medido |
| Circulação pelos canais ligada | 100 m³/h | Cenário ilustrativo do memorial, não vazão deduzida da corrente dos coolers |
| Renovação forçada adicional | 0 m³/h | Nenhuma vazão adicional confirmada; renovação natural permanece modelada |
| Fator solar g | 0,55 | Cenário intermediário comparável do memorial; a chapa real não foi identificada. Cenários de prazo variam aproximadamente 0,24–0,82 |
| Densidade básica | 500 kg/m³ | Hipótese da carga; substituir por ensaio ou fonte específica adequada |
| Difusividade de referência | 1,25 × 10^-10 m²/s a 25 °C | Valor de inicialização de cenário, não curva experimental comprovada para Pinus elliottii nesta estufa |
| Energia de ativação | 25.000 J/mol | Hipótese inicial ajustável, não medida na sua madeira |
| Saturação das fibras | 30% | Aproximação de regime; varia com material e condições |
| Multiplicador acima da saturação | 4 | Simplificação inspirada em modelagem de dois regimes; não relação validada para esta carga |
| Calor específico seco / água | 1.500 / 4.180 J/(kg.K) | Aproximações físicas para capacidade térmica, sem calorimetria do conjunto |

Portanto, o código integra os dados disponíveis, mas não transforma parâmetros não medidos em fatos. Os coeficientes de cinética precisam de ajuste e validação posterior; a faixa entre cenários não é um intervalo de confiança estatístico. O antigo 25% fixo de aproveitamento não é usado no novo planejador.

## Fontes

- Memorial_de_calculo_Estufa_Solar_Pinus.pdf, fornecido pelo proprietário: geometria, cobertura, áreas, perdas e cenários de ventilação. Os valores de vazão e transmissão nele também são identificados como hipóteses/referências comparáveis.
- USDA FPL, Investigation of Historic Equilibrium Moisture Content Data: https://www.fpl.fs.usda.gov/documnts/fplgtr/fpl_gtr229.pdf — formulação de equilíbrio; não calibração da taxa nesta montagem.
- Nadler, Choong e Wetzel (1985), Mathematical Modeling of the Diffusion of Water in Wood During Drying: https://wfs.swst.org/index.php/wfs/article/view/514 — interação entre espessura, umidade, temperatura, difusão e velocidade do ar. A implementação aqui é reduzida e não reproduz integralmente o estudo, nem usa sua validação como validação de Pinus elliottii.
- Youngman et al. (1999), Use of combined constant rate and diffusion model to simulate kiln-drying of Pinus radiata timber: https://silvafennica.fi/article/652 — importância de determinar coeficientes por curvas experimentais do material e secador. Outra espécie e outro equipamento.
- NASA POWER: https://power.larc.nasa.gov/ — médias mensais e radiação da localização escolhida.
- Open-Meteo: https://open-meteo.com/en/docs e https://open-meteo.com/en/docs/historical-weather-api — meteorologia horária modelada e reanálise. Atribuição dos dados: Open-Meteo, CC BY 4.0, incluindo provedores indicados pelo serviço.

Os testes de software e a execução com histórico real demonstram o caminho dos dados e as contas; não substituem comparação entre a umidade estimada e a madeira efetiva.
