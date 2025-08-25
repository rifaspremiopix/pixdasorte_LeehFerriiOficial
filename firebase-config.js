import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-database.js";

// 🔥 Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBF1xQbleoK8_0TbpE9Yh0ACn1wMTHL73U",
  authDomain: "rifa-pix-sorte.firebaseapp.com",
  projectId: "rifa-pix-sorte",
  storageBucket: "rifa-pix-sorte.appspot.com",
  messagingSenderId: "435456208272",
  appId: "1:435456208272:web:d1d5eaec194462eb99d715",
  measurementId: "G-MFEHG9F97H",
  databaseURL: "https://rifa-pix-sorte-default-rtdb.firebaseio.com/"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const grid = document.getElementById("grid");
const adminPanel = document.getElementById("adminPanel");
let isAdmin = false;

// --- Criar os números 1 a 100 (se necessário usar Firebase)
function initializeFirebaseNumbers() {
  for (let i = 1; i <= 100; i++) {
    const div = document.createElement("div");
    div.className = "numero";
    div.textContent = i;
    div.id = "num-" + i;
    div.onclick = () => reservarNumero(i);
    if (grid) grid.appendChild(div);
  }
}

// --- Reservar número via Firebase
function reservarNumero(numero) {
  if (isAdmin) {
    alternarStatusAdmin(numero);
    return;
  }
  const nome = prompt("Digite seu nome/apelido para reservar o número " + numero + ":");
  if (!nome) return;
  set(ref(db, "rifa/numeros/" + numero), {
    status: "reservado",
    participante: nome,
    timestamp: Date.now()
  });
}

// --- Admin alterna status via Firebase
function alternarStatusAdmin(numero) {
  const refNum = ref(db, "rifa/numeros/" + numero);
  onValue(refNum, (snapshot) => {
    const atual = snapshot.val();
    let novoStatus = "reservado";
    if (!atual) {
      novoStatus = "reservado";
    } else if (atual.status === "reservado") {
      novoStatus = "pago";
    } else if (atual.status === "pago") {
      // libera
      set(refNum, null);
      return;
    }
    set(refNum, {
      status: novoStatus,
      participante: atual?.participante || "Admin",
      timestamp: Date.now()
    });
  }, { onlyOnce: true });
}

// --- Atualizar interface em tempo real via Firebase
function setupFirebaseSync() {
  onValue(ref(db, "rifa/numeros"), (snapshot) => {
    const data = snapshot.val() || {};
    for (let i = 1; i <= 100; i++) {
      const div = document.getElementById("num-" + i);
      if (div) {
        div.className = "numero";
        if (data[i]) {
          if (data[i].status === "reservado") {
            div.classList.add("reservado");
            div.title = "Reservado por: " + data[i].participante;
          } else if (data[i].status === "pago") {
            div.classList.add("pago");
            div.title = "Pago por: " + data[i].participante;
          }
        } else {
          div.title = "Disponível";
        }
      }
    }
  });
}

// Export functions for global use if needed
window.firebaseApp = app;
window.firebaseDb = db;
window.initializeFirebaseNumbers = initializeFirebaseNumbers;
window.setupFirebaseSync = setupFirebaseSync;