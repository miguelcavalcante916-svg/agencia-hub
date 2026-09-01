# Briefing 7 — QA visual

A captura de Arrival em 1440 px mantém o palco escuro, a headline em planos distintos e a grade de coordenadas com leitura de tensão. A captura de Think/Create/Scale mostra `PENSAR` como elemento gráfico de escala grande, com símbolos editoriais em profundidade e copy curta; o scrub não reduz a cena a um fade de entrada. O motor global recebe estados `arrival` e `think/create/scale`, com fallback nativo quando GSAP/ScrollTrigger ou movimento completo não estão disponíveis.

A cena do Portal mostra a interface em layers e a transição claro→escuro como mudança de atmosfera, embora a captura de alta rolagem atravesse a borda entre Portal e Knight Move. O mobile mantém a headline e o canvas com baixa densidade sem overflow horizontal; o header e o CTA continuam operáveis.

Com `?debugMotion=1`, o painel confirma `scene: think/create/scale` e `scene: portal/no black box`, com progresso e velocidade reportados. O painel cobre parte do texto no screenshot mobile somente por ser um overlay de diagnóstico; ele não é criado sem o parâmetro de debug. O Knight Move mobile mantém a headline grande, a trajetória em L e os nós visíveis.
