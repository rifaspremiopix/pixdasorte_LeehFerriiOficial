const WHATSAPP_NUMBER = "5511960671570";
const PIX_KEY = "11960671570";
const ADMIN_PASSWORD = "Ccjj9842#";

const RIFAS_DATA = [
  { 
    id: 1, 
    nome: "Pix da Sorte Premium", 
    premios: { primeiro: 500, segundo: 200 },
    preco: 15, 
    total: 100 
  }
];

document.getElementById('year').textContent = new Date().getFullYear();

const brl = v => v.toLocaleString('pt-BR',{style:'currency', currency:'BRL'});

let adminOrders = JSON.parse(localStorage.getItem('rifaAdminOrders') || '[]');
let adminState = JSON.parse(localStorage.getItem('rifaAdminState') || '{"numbers":{}}');

function saveAdminData() {
  localStorage.setItem('rifaAdminOrders', JSON.stringify(adminOrders));
  localStorage.setItem('rifaAdminState', JSON.stringify(adminState));
  localStorage.setItem('rifaPublicState', JSON.stringify(adminState));
  localStorage.setItem('rifaLastUpdate', Date.now().toString());
  window.dispatchEvent(new Event('rifaStateChanged'));
  
  // Broadcast para outras abas/dispositivos
  if (window.BroadcastChannel) {
    const channel = new BroadcastChannel('rifaUpdates');
    channel.postMessage({
      type: 'stateUpdate',
      timestamp: Date.now(),
      adminState: adminState
    });
  }
}

function addAdminOrder(numbers, metadata) {
  const order = {
    id: Date.now(),
    numbers: numbers,
    timestamp: metadata.timestamp,
    status: 'pending',
    customerName: metadata.customerName,
    customerWhatsApp: metadata.customerWhatsApp
  };
  
  numbers.forEach(num => {
    adminState.numbers[num] = {
      status: 'pending',
      orderId: order.id,
      timestamp: order.timestamp,
      customerName: metadata.customerName,
      customerWhatsApp: metadata.customerWhatsApp
    };
  });
  
  adminOrders.push(order);
  saveAdminData();
}

window.addAdminOrder = addAdminOrder;

function toggleAdmin() {
  const panel = document.getElementById('adminPanel');
  panel.style.display = panel.style.display === 'block' ? 'none' : 'block';
  if(panel.style.display === 'block') {
    document.getElementById('adminEmail').focus();
  }
}

function loginAdmin() {
  const email = document.getElementById('adminEmail').value;
  const password = document.getElementById('adminPassword').value;
  if(password === ADMIN_PASSWORD) {
    document.getElementById('adminLogin').style.display = 'none';
    document.getElementById('adminContent').style.display = 'block';
    updateAdminPanel();
  } else {
    alert('Senha incorreta!');
  }
}

function logoutAdmin() {
  document.getElementById('adminLogin').style.display = 'block';
  document.getElementById('adminContent').style.display = 'none';
  document.getElementById('adminEmail').value = '';
  document.getElementById('adminPassword').value = '';
  toggleAdmin();
}

function confirmPayment(orderId) {
  const order = adminOrders.find(o => o.id === orderId);
  if(order) {
    order.status = 'confirmed';
    order.numbers.forEach(num => {
      adminState.numbers[num] = {
        status: 'paid',
        orderId: orderId,
        timestamp: order.timestamp,
        customerName: order.customerName,
        customerWhatsApp: order.customerWhatsApp
      };
    });
    saveAdminData();
    updateAdminPanel();
    alert('Pagamento confirmado!');
  }
}

function cancelOrder(orderId) {
  const order = adminOrders.find(o => o.id === orderId);
  if(order && confirm('Cancelar pedido?')) {
    order.status = 'cancelled';
    order.numbers.forEach(num => {
      if(adminState.numbers[num] && adminState.numbers[num].orderId === orderId) {
        delete adminState.numbers[num];
      }
    });
    saveAdminData();
    updateAdminPanel();
    alert('Pedido cancelado!');
  }
}

function updateAdminPanel() {
  const ordersEl = document.getElementById('adminOrders');
  const statsEl = document.getElementById('adminStats');
  
  const pendingOrders = adminOrders.filter(o => o.status === 'pending');
  ordersEl.innerHTML = pendingOrders.length === 0 ? 
    '<p style="opacity:0.7">Nenhum pedido pendente</p>' :
    pendingOrders.map(order => `
      <div class="admin-order">
        <div class="order-header">
          <strong>Pedido #${order.id}</strong>
          <small>${new Date(order.timestamp).toLocaleString('pt-BR')}</small>
        </div>
        <div class="order-numbers">
          ${order.numbers.map(n => `<span class="order-number">${n}</span>`).join('')}
        </div>
        <p><strong>Total: ${brl(order.numbers.length * 15)}</strong></p>
        <p><strong>Cliente:</strong> ${order.customerName} • <strong>WhatsApp:</strong> ${order.customerWhatsApp}</p>
        <div class="order-actions">
          <button class="btn btn-success" onclick="confirmPayment(${order.id})">Confirmar</button>
          <button class="btn btn-danger" onclick="cancelOrder(${order.id})">Cancelar</button>
        </div>
      </div>
    `).join('');
  
  const paidNumbers = Object.values(adminState.numbers).filter(n => n.status === 'paid').length;
  const pendingNumbers = Object.values(adminState.numbers).filter(n => n.status === 'pending').length;
  const revenue = paidNumbers * 15;
  
  statsEl.innerHTML = `
    <div class="row">
      <div>Vendidos: <strong>${paidNumbers}/100</strong></div>
      <div>Pendentes: <strong>${pendingNumbers}</strong></div>
    </div>
    <div class="row" style="margin-top:8px">
      <div>Arrecadação: <strong>${brl(revenue)}</strong></div>
      <div>Lucro: <strong>${brl(revenue - 700)}</strong></div>
    </div>
  `;
  
  // Atualizar resultado do sorteio se existir
  const drawResults = localStorage.getItem('rifaDrawResults');
  if (drawResults) {
    document.getElementById('drawResults').innerHTML = drawResults;
  }
}

// Função para limpar números pagos
function clearPaidNumbers() {
  if (confirm('Tem certeza que deseja limpar todos os números pagos? Eles ficarão disponíveis para compra novamente.')) {
    // Remove apenas números com status 'paid', mantém os 'pending'
    Object.keys(adminState.numbers).forEach(num => {
      if (adminState.numbers[num].status === 'paid') {
        delete adminState.numbers[num];
      }
    });
    
    // Remove pedidos confirmados do histórico
    adminOrders = adminOrders.filter(order => order.status !== 'confirmed');
    
    saveAdminData();
    updateAdminPanel();
    alert('Números pagos foram limpos e estão disponíveis novamente!');
  }
}

// Função para resetar a rifa completa
function resetRaffle() {
  if (confirm('ATENÇÃO: Isso irá resetar TODA a rifa, removendo todos os pedidos e números. Continuar?')) {
    if (confirm('Esta ação é IRREVERSÍVEL. Confirma o reset completo da rifa?')) {
      adminState = { numbers: {} };
      adminOrders = [];
      localStorage.removeItem('rifaDrawResults');
      saveAdminData();
      updateAdminPanel();
      alert('Rifa resetada completamente! Todos os números estão disponíveis.');
    }
  }
}

// Função para realizar sorteio
function conductDraw() {
  const paidNumbers = Object.keys(adminState.numbers).filter(num => 
    adminState.numbers[num].status === 'paid'
  ).map(num => parseInt(num));
  
  if (paidNumbers.length < 3) {
    alert('É necessário pelo menos 3 números pagos para realizar o sorteio.');
    return;
  }
  
  if (confirm(`Realizar sorteio com ${paidNumbers.length} números pagos?`)) {
    // Embaralhar números
    const shuffled = [...paidNumbers].sort(() => Math.random() - 0.5);
    
    const primeiro = shuffled[0];
    const segundo = shuffled[1];
    const terceiro = shuffled[2];
    
    // Buscar informações dos ganhadores
    const getPrizeInfo = (num) => {
      const info = adminState.numbers[num];
      return info ? `${info.customerName} (${info.customerWhatsApp})` : 'N/A';
    };
    
    const drawResult = `
      <div style="background:linear-gradient(135deg,#FFD700,#FFA500);color:#1a1208;padding:15px;border-radius:12px;margin:10px 0;">
        <h4 style="margin:0 0 10px 0;">🏆 RESULTADO DO SORTEIO</h4>
        <p style="margin:4px 0;"><strong>🥇 1º Lugar (R$ 500):</strong> Número ${primeiro}<br>
        <small>${getPrizeInfo(primeiro)}</small></p>
        <p style="margin:4px 0;"><strong>🥈 2º Lugar (R$ 200):</strong> Número ${segundo}<br>
        <small>${getPrizeInfo(segundo)}</small></p>
        <p style="margin:4px 0;"><strong>🥉 3º Lugar:</strong> Número ${terceiro}<br>
        <small>${getPrizeInfo(terceiro)}</small></p>
        <small style="opacity:0.8;">Sorteio realizado em: ${new Date().toLocaleString('pt-BR')}</small>
      </div>
    `;
    
    localStorage.setItem('rifaDrawResults', drawResult);
    document.getElementById('drawResults').innerHTML = drawResult;
    
    alert(`Sorteio realizado!\n🥇 1º: ${primeiro}\n🥈 2º: ${segundo}\n🥉 3º: ${terceiro}`);
  }
}

// Limpa pedidos pendentes expirados (mais de 30 minutos)
function limparPedidosExpirados() {
  const agora = Date.now();
  const limite = 30 * 60 * 1000; // 30 minutos em ms
  let mudou = false;

  adminOrders.forEach(order => {
    if (order.status === 'pending') {
      const timestampPedido = new Date(order.timestamp).getTime();
      if (agora - timestampPedido > limite) {
        order.status = 'cancelled';
        order.numbers.forEach(num => {
          if (adminState.numbers[num] && adminState.numbers[num].orderId === order.id) {
            delete adminState.numbers[num];
          }
        });
        mudou = true;
      }
    }
  });

  if (mudou) {
    saveAdminData();
    updateAdminPanel();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  limparPedidosExpirados();
  setInterval(limparPedidosExpirados, 300000); // 5 minutos
});

function copyPixKey() {
  navigator.clipboard.writeText(PIX_KEY).then(() => {
    const btn = event.target;
    btn.textContent = 'Copiado!';
    btn.style.background = 'rgba(34, 197, 94, 0.3)';
    setTimeout(() => {
      btn.textContent = 'Copiar';
      btn.style.background = 'rgba(0,0,0,.2)';
    }, 2000);
  }).catch(() => {
    alert('Chave PIX: ' + PIX_KEY);
  });
}

// Mostrar resultado do sorteio na página pública
function showPublicDrawResults() {
  const drawResults = localStorage.getItem('rifaDrawResults');
  const publicResultsEl = document.getElementById('publicDrawResults');
  const publicContentEl = document.getElementById('publicDrawContent');
  
  if (drawResults && publicResultsEl && publicContentEl) {
    publicContentEl.innerHTML = drawResults;
    publicResultsEl.style.display = 'block';
  }
}

// Verificar resultados do sorteio periodicamente
setInterval(showPublicDrawResults, 3000);
document.addEventListener('DOMContentLoaded', showPublicDrawResults);

// Initialize the raffle rendering
RIFAS_DATA.forEach(renderRifa);