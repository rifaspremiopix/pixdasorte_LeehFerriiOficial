function renderRifa(data){
  const rifa = { ...data, vendidos: new Set(), vencedores: null };

  const wrap = document.createElement('div');
  wrap.className = 'card rifa';
  wrap.innerHTML = `
    <div class="row">
      <h2>${rifa.nome}</h2>
    </div>

    <div class="share-buttons" style="margin:12px 0; display:flex; gap:10px; flex-wrap: wrap;">
      <button class="btn btn-ghost share-whatsapp" style="background:#25D366; color:white;">WhatsApp</button>
      <button class="btn btn-ghost share-facebook" style="background:#1877F2; color:white;">Facebook</button>
      <button class="btn btn-ghost share-twitter" style="background:#1DA1F2; color:white;">Twitter</button>
      <button class="btn btn-ghost share-instagram" style="background: radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%); color:white;">Instagram</button>
      <button class="btn btn-ghost share-tiktok" style="background:#000000; color:white;">TikTok</button>
    </div>

    <div class="pill">Valor: <strong>${brl(rifa.preco)}</strong></div>

    <div class="meta">
      <span class="pill" style="background: linear-gradient(135deg, #FFD700, #FFA500); color: #1a1208;">🥇 ${brl(rifa.premios.primeiro)}</span>
      <span class="pill" style="background: linear-gradient(135deg, #C0C0C0, #A8A8A8); color: #1a1208;">🥈 ${brl(rifa.premios.segundo)}</span>
    </div>
    <div class="meta">
      <span class="pill" id="cap-${rifa.id}"></span>
      <span class="pill" id="org-${rifa.id}"></span>
    </div>

    <div class="pix-info">
      <h4 style="margin:0 0 8px 0;color:#0a1b0f">💳 PIX para Pagamento</h4>
      <div class="pix-key">
        <span>${PIX_KEY}</span>
        <button class="copy-btn" onclick="copyPixKey()">Copiar</button>
      </div>
      <p style="margin:8px 0 4px 0;color:#0a1b0f;font-size:13px">
        ✅ Após pagar, envie comprovante no WhatsApp<br>
        ⏱️ Números reservados por 30 minutos
      </p>
    </div>

    <div class="legend">
      <span><span class="dot" style="background:#ffffff;border:1px solid #ccc"></span>Disponível</span>
      <span><span class="dot" style="background:linear-gradient(180deg,var(--accent),var(--accent-2))"></span>Selecionado</span>
      <span><span class="dot" style="background:#ffa500"></span>Aguardando</span>
      <span><span class="dot" style="background:#22c55e"></span>Pago</span>
    </div>

    <div class="row">
      <div class="status" id="status-${rifa.id}"></div>
      <div class="total" id="total-${rifa.id}"></div>
    </div>
    <div class="progress"><span id="pb-${rifa.id}"></span></div>

    <div class="numbers" id="nums-${rifa.id}"></div>

    <div class="toolbar" style="display:grid;gap:10px;">
      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;">
        <input id="qtd-${rifa.id}" type="number" min="1" max="${rifa.total}" value="1" />
        <button class="btn btn-ghost" id="gerar-${rifa.id}">Gerar</button>
      </div>
      <div style="display:grid;gap:8px;">
        <input id="nome-${rifa.id}" type="text" placeholder="Seu nome completo" style="width:100%;background:transparent;border:1px solid rgba(255,255,255,.3);border-radius:10px;padding:8px 10px;color:var(--text)" required />
        <input id="whatsapp-${rifa.id}" type="tel" placeholder="WhatsApp (11999999999)" style="width:100%;background:transparent;border:1px solid rgba(255,255,255,.3);border-radius:10px;padding:8px 10px;color:var(--text)" required />
      </div>
      <button class="btn btn-primary" id="comprar-${rifa.id}">Comprar Números</button>
    </div>
  `;

  document.getElementById('rifas').appendChild(wrap);

  const numsEl = wrap.querySelector('#nums-'+rifa.id);
  const statusEl = wrap.querySelector('#status-'+rifa.id);
  const totalEl = wrap.querySelector('#total-'+rifa.id);
  const pbEl = wrap.querySelector('#pb-'+rifa.id);
  const capEl = wrap.querySelector('#cap-'+rifa.id);
  const orgEl = wrap.querySelector('#org-'+rifa.id);
  const qtdEl = wrap.querySelector('#qtd-'+rifa.id);

  const selecionados = new Set();

  for(let i=1;i<=rifa.total;i++){
    const b = document.createElement('button');
    b.type='button';
    b.className='num available';
    b.textContent = i;
    b.dataset.n = i;
    b.addEventListener('click', ()=>{
      if(b.classList.contains('sold') || b.classList.contains('pending')) return;
      const n = Number(b.dataset.n);
      if(selecionados.has(n)){
        selecionados.delete(n);
        b.classList.remove('selected');
        b.classList.add('available');
      }else{
        selecionados.add(n);
        b.classList.remove('available');
        b.classList.add('selected');
      }
      atualizarTotais();
    });
    numsEl.appendChild(b);
  }

  function disponiveis(){
    const arr=[];
    numsEl.querySelectorAll('.num.available').forEach(el=> arr.push(Number(el.dataset.n)));
    return arr;
  }

  function atualizarStatus(){
    const vendidos = numsEl.querySelectorAll('.num.sold').length;
    const pendentes = numsEl.querySelectorAll('.num.pending').length;
    const disp = numsEl.querySelectorAll('.num.available').length;
    const pct = Math.round((vendidos / rifa.total)*100);
    
    statusEl.textContent = `Disponíveis: ${disp} • Vendidos: ${vendidos} • Aguardando: ${pendentes}`;
    pbEl.style.width = pct + '%';
    
    const arrecadacao = vendidos * rifa.preco;
    const saldo = arrecadacao - 700;
    capEl.textContent = `Arrecadação: ${brl(arrecadacao)}`;
    orgEl.textContent = `Lucro: ${brl(saldo)}`;
  }

  function atualizarTotais(){
    const qtd = Number(qtdEl.value)||0;
    totalEl.textContent = `Selecionados: ${selecionados.size} • Total: ${brl(rifa.preco * Math.max(qtd, selecionados.size||0))}`;
    atualizarStatus();
  }

  wrap.querySelector('#gerar-'+rifa.id).addEventListener('click', ()=>{
    const qtd = Math.max(1, Math.min(Number(qtdEl.value)||1, rifa.total));
    selecionados.clear();
    numsEl.querySelectorAll('.num.selected').forEach(el=>{
      el.classList.remove('selected'); el.classList.add('available');
    });
    const disp = disponiveis();
    if(disp.length < qtd){
      alert('Quantidade indisponível.');
      return;
    }
    for(let i=0;i<qtd;i++){
      const idx = Math.floor(Math.random()*disp.length);
      const n = disp.splice(idx,1)[0];
      selecionados.add(n);
      const btn = numsEl.querySelector(`[data-n="${n}"]`);
      btn.classList.remove('available'); 
      btn.classList.add('selected');
    }
    atualizarTotais();
  });

  wrap.querySelector('#comprar-'+rifa.id).addEventListener('click', ()=>{
    const nomeInput = wrap.querySelector('#nome-'+rifa.id);
    const whatsappInput = wrap.querySelector('#whatsapp-'+rifa.id);
    const nome = nomeInput.value.trim();
    const whatsapp = whatsappInput.value.trim();

    if(!nome) {
      alert('Por favor, informe seu nome completo.');
      nomeInput.focus();
      return;
    }

    if(!whatsapp || !/^\d{10,15}$/.test(whatsapp.replace(/\D/g,''))) {
      alert('Por favor, informe um número de WhatsApp válido (apenas números, 10 a 15 dígitos).');
      whatsappInput.focus();
      return;
    }

    const qtdDesejada = Math.max(1, Math.min(Number(qtdEl.value)||1, rifa.total));
    let escolhidos = Array.from(selecionados);

    if(escolhidos.length < qtdDesejada){
      const faltam = qtdDesejada - escolhidos.length;
      const disp = disponiveis().filter(n => !selecionados.has(n));
      if(disp.length < faltam){
        alert('Números insuficientes.');
        return;
      }
      for(let i=0;i<faltam;i++){
        const idx = Math.floor(Math.random()*disp.length);
        escolhidos.push(disp.splice(idx,1)[0]);
      }
    }

    escolhidos.forEach(n=>{
      const el = numsEl.querySelector(`[data-n="${n}"]`);
      el.classList.remove('available','selected'); 
      el.classList.add('pending');
      selecionados.delete(n);
    });

    if(window.addAdminOrder) {
      window.addAdminOrder(escolhidos, {
        timestamp: new Date().toISOString(),
        customerName: nome,
        customerWhatsApp: whatsapp
      });
    }

    const total = escolhidos.length * rifa.preco;
    const msg = [
      `*${rifa.nome}*`,
      `Números: ${escolhidos.sort((a,b)=>a-b).join(', ')}`,
      `Qtde: ${escolhidos.length}`,
      `*Total: ${brl(total)}*`,
      ``,
      `🥇 ${brl(rifa.premios.primeiro)} | 🥈 ${brl(rifa.premios.segundo)}`,
      ``,
      `PIX: ${PIX_KEY}`,
      `Envie o comprovante aqui!`
    ].join('\n');

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');

    alert('Números reservados! Complete o pagamento via WhatsApp.');
    atualizarTotais();
  });

  // Funções dos botões de compartilhamento
  function shareWhatsApp() {
    const text = encodeURIComponent(`Participe da rifa *${rifa.nome}*! São 100 números por ${brl(rifa.preco)}, com prêmios de ${brl(rifa.premios.primeiro)} e ${brl(rifa.premios.segundo)}. Compre seu número e boa sorte! Link: ${window.location.href}`);
    const url = `https://wa.me/?text=${text}`;
    window.open(url, '_blank');
  }

  function shareFacebook() {
    const url = encodeURIComponent(window.location.href);
    const fbShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
    window.open(fbShareUrl, '_blank');
  }

  function shareTwitter() {
    const text = encodeURIComponent(`Participe da rifa ${rifa.nome}! Prêmios incríveis e muita sorte. Confira:`);
    const url = encodeURIComponent(window.location.href);
    const twitterUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
    window.open(twitterUrl, '_blank');
  }

  function copyLink() {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      alert('Link copiado para a área de transferência!');
    }).catch(() => {
      alert('Copie o link manualmente: ' + url);
    });
  }

  function shareInstagram() {
    copyLink();
  }

  function shareTikTok() {
    copyLink();
  }

  wrap.querySelector('.share-whatsapp').onclick = shareWhatsApp;
  wrap.querySelector('.share-facebook').onclick = shareFacebook;
  wrap.querySelector('.share-twitter').onclick = shareTwitter;
  wrap.querySelector('.share-instagram').onclick = shareInstagram;
  wrap.querySelector('.share-tiktok').onclick = shareTikTok;

  // Sistema de atualização em tempo real
  function loadRifaState() {
    const savedState = localStorage.getItem('rifaPublicState');
    if(savedState) {
      try {
        const state = JSON.parse(savedState);
        updateRifaDisplay(state);
      } catch(e) {}
    }
  }

  function updateRifaDisplay(adminState) {
    if(!adminState || !adminState.numbers) return;
    
    Object.keys(adminState.numbers).forEach(numStr => {
      const num = parseInt(numStr);
      const numState = adminState.numbers[numStr];
      const numEl = numsEl.querySelector(`[data-n="${num}"]`);
      
      if(numEl && numState) {
        numEl.classList.remove('available', 'pending', 'sold', 'selected');
        
        if(numState.status === 'pending') {
          numEl.classList.add('pending');
        } else if(numState.status === 'paid') {
          numEl.classList.add('sold');
        } else {
          numEl.classList.add('available');
        }
      }
    });
    
    setTimeout(atualizarTotais, 100);
  }

  window.addEventListener('storage', function(e) {
    if(e.key === 'rifaPublicState') {
      loadRifaState();
    }
  });

  window.addEventListener('rifaStateChanged', loadRifaState);

  // Sistema de broadcast para sincronização entre abas/dispositivos
  if (window.BroadcastChannel) {
    const channel = new BroadcastChannel('rifaUpdates');
    channel.addEventListener('message', function(event) {
      if (event.data.type === 'stateUpdate') {
        updateRifaDisplay(event.data.adminState);
      }
    });
  }

  // Verificação de atualizações mais inteligente
  let lastUpdateCheck = localStorage.getItem('rifaLastUpdate') || '0';
  
  function smartRefresh() {
    const currentUpdate = localStorage.getItem('rifaLastUpdate') || '0';
    if (currentUpdate !== lastUpdateCheck) {
      lastUpdateCheck = currentUpdate;
      loadRifaState();
    }
  }

  document.addEventListener('DOMContentLoaded', function() {
    setTimeout(loadRifaState, 500);
  });

  setInterval(smartRefresh, 1000); // Verificação a cada 1 segundo
  setInterval(loadRifaState, 5000); // Refresh completo a cada 5 segundos

  atualizarTotais();
}