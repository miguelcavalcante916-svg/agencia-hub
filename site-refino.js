/* Agência Cavalcante — refino de execução
   Abertura, cursor e divisão de títulos. Três coisas que as referências têm e
   que não dependem de biblioteca nenhuma além do que já está carregado.

   Regra que vale para as três: nada aqui pode esconder conteúdo de quem lê com
   leitor de tela, de quem desligou movimento, ou do robô do Google. Tudo é
   camada por cima de um HTML que já está completo. */
(() => {
  'use strict';
  const root = document.documentElement;
  const semMovimento = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ponteiroFino = matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ==========================================================
     1) ABERTURA — a cortina que revela o herói
     ========================================================== */
  const abrir = () => {
    /* Uma vez por sessão: quem volta da página de privacidade não assiste de
       novo. E nunca sob movimento reduzido. */
    let jaViu = false;
    try { jaViu = sessionStorage.getItem('cav:abertura') === '1'; } catch {}
    if (semMovimento || jaViu) { root.classList.add('abriu'); return; }

    /* Conexão ruim já sofreu o bastante: se a página demorou, entra direto. */
    const t0 = performance.now();
    if (t0 > 2500) { root.classList.add('abriu'); return; }

    const cortina = document.createElement('div');
    cortina.className = 'abertura';
    cortina.setAttribute('aria-hidden', 'true');
    cortina.innerHTML =
      '<div class="abertura-marca">' +
      '<img src="app/img/logo.svg" width="34" height="54" alt="">' +
      '<span>CAVALCANTE</span></div>' +
      '<i class="abertura-regua"></i>';
    document.body.appendChild(cortina);
    root.classList.add('abrindo');

    const fim = () => {
      root.classList.remove('abrindo');
      root.classList.add('abriu');
      try { sessionStorage.setItem('cav:abertura', '1'); } catch {}
      setTimeout(() => cortina.remove(), 900);
    };
    /* 760ms de marca + a cortina subindo. Curto de propósito: abertura longa
       é vaidade do estúdio, não serviço para quem chegou. */
    setTimeout(() => { cortina.classList.add('saindo'); fim(); }, 760);
  };

  /* ==========================================================
     2) CURSOR — só em ponteiro fino
     ========================================================== */
  const cursor = () => {
    if (!ponteiroFino || semMovimento) return;

    const anel = document.createElement('div');
    anel.className = 'cursor-anel';
    anel.setAttribute('aria-hidden', 'true');
    const ponto = document.createElement('div');
    ponto.className = 'cursor-ponto';
    ponto.setAttribute('aria-hidden', 'true');
    document.body.append(anel, ponto);
    root.classList.add('cursor-proprio');

    let alvoX = innerWidth / 2, alvoY = innerHeight / 2;
    let anelX = alvoX, anelY = alvoY, pendente = false;

    addEventListener('pointermove', ev => {
      alvoX = ev.clientX; alvoY = ev.clientY;
      ponto.style.transform = `translate3d(${alvoX}px,${alvoY}px,0)`;
      if (!pendente) { pendente = true; requestAnimationFrame(seguir); }
    }, { passive: true });

    function seguir() {
      pendente = false;
      /* O anel persegue com atraso — é o atraso que dá a sensação de peso.
         0.16 por quadro: chega em ~6 quadros, perceptível sem parecer lento. */
      anelX += (alvoX - anelX) * 0.16;
      anelY += (alvoY - anelY) * 0.16;
      anel.style.transform = `translate3d(${anelX}px,${anelY}px,0)`;
      if (Math.hypot(alvoX - anelX, alvoY - anelY) > 0.4) {
        pendente = true; requestAnimationFrame(seguir);
      }
    }

    /* Cresce sobre qualquer coisa clicável — delegação, um listener só */
    const clicavel = 'a,button,[role="button"],input,textarea,select,summary';
    addEventListener('pointerover', ev => {
      if (ev.target.closest?.(clicavel)) anel.classList.add('perto');
    }, { passive: true });
    addEventListener('pointerout', ev => {
      if (ev.target.closest?.(clicavel)) anel.classList.remove('perto');
    }, { passive: true });
    addEventListener('pointerdown', () => anel.classList.add('pressionado'), { passive: true });
    addEventListener('pointerup', () => anel.classList.remove('pressionado'), { passive: true });
    /* Sai da janela: some, senão fica um ponto morto no canto */
    document.addEventListener('mouseleave', () => root.classList.add('cursor-fora'));
    document.addEventListener('mouseenter', () => root.classList.remove('cursor-fora'));
  };

  /* ==========================================================
     3) TÍTULOS LETRA A LETRA
     ========================================================== */
  const dividir = () => {
    const h1 = document.querySelector('.hero-copy h1');
    if (!h1) return;

    /* O leitor de tela lê o aria-label e ignora as letras soltas. Sem isso,
       alguns leitores soletram o título inteiro.
       As linhas vêm em <span> separados e o textContent do h1 as concatena SEM
       espaço — daria "Sua marcanão precisa demais conteúdo". Juntamos linha a
       linha com espaço, que é como a frase se lê em voz alta. */
    const frase = [...h1.querySelectorAll('span')]
      .map(l => l.textContent.trim())
      .filter(Boolean)
      .join(' ')
      .replace(/\s+/g, ' ');
    h1.setAttribute('aria-label', frase);

    /* O rotulo acima vale SEMPRE — a concatenacao sem espaco esta no HTML, nao
       na animacao. Dividir em letras, nao: so quando ha movimento permitido. */
    if (semMovimento) return;

    let n = 0;
    h1.querySelectorAll('span').forEach(linha => {
      const texto = linha.textContent;
      linha.textContent = '';
      linha.setAttribute('aria-hidden', 'true');
      for (const ch of texto) {
        if (ch === ' ') { linha.append(' '); n++; continue; }
        const letra = document.createElement('i');
        letra.className = 'letra';
        letra.textContent = ch;
        /* Teto em 620ms: sem isso a última letra de um título de 60
           caracteres entraria quase um segundo depois da primeira. */
        letra.style.setProperty('--atraso', Math.min(n * 17, 620) + 'ms');
        linha.appendChild(letra);
        n++;
      }
    });
    root.classList.add('titulo-dividido');
  };

  dividir();
  cursor();
  if (document.readyState === 'loading') addEventListener('DOMContentLoaded', abrir, { once: true });
  else abrir();
})();
