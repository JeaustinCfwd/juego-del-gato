// Celdas y estado
const celdas = document.querySelectorAll(".celda");
const celdasArr = Array.from(celdas);

let turno = "X";
let juegoTerminado = false;
let modoJuego = null;
let juegoHabilitado = false;

const tablero = Array(9).fill("");

// CONTADOR DE MOVIMIENTOS (corregido - fuera de funciones)
let contadorMovimientos = {X: 0, O: 0};

// LOCALSTORAGE 
let estadisticas = {
  multijugador: {
    victoriasX: 0,
    victoriasO: 0,
    empates: 0
  },
  bot: {
    victoriasJugador: 0,
    victoriasBot: 0,
    empates: 0
  }
};

// RANKING SEPARADO (corregido - fuera del objeto estadisticas)
let ranking = [
  {nombre: "Jugador1", puntos: 150, victorias: 10},
  {nombre: "Jugador2", puntos: 120, victorias: 8}
];

function cargarEstadisticas() {
  const datosGuardados = localStorage.getItem('ticTacToeEstadisticas');
  if (datosGuardados) {
    try {
      estadisticas = JSON.parse(datosGuardados);
    } catch (error) {
      console.log('Error al cargar estadísticas, usando valores por defecto');
    }
  }
  
  // Cargar ranking
  const rankingGuardado = localStorage.getItem('ticTacToeRanking');
  if (rankingGuardado) {
    try {
      ranking = JSON.parse(rankingGuardado);
    } catch (error) {
      console.log('Error al cargar ranking, usando valores por defecto');
    }
  }
  
  actualizarMostrarEstadisticas();
}

function guardarEstadisticas() {
  localStorage.setItem('ticTacToeEstadisticas', JSON.stringify(estadisticas));
  localStorage.setItem('ticTacToeRanking', JSON.stringify(ranking));
}

function actualizarEstadisticas(resultado) {
  if (modoJuego === 'multijugador') {
    if (resultado === 'X') {
      estadisticas.multijugador.victoriasX++;
    } else if (resultado === 'O') {
      estadisticas.multijugador.victoriasO++;
    } else if (resultado === 'empate') {
      estadisticas.multijugador.empates++;
    }
  } else if (modoJuego === 'bot') {
    if (resultado === 'X') {
      estadisticas.bot.victoriasJugador++;
    } else if (resultado === 'O') {
      estadisticas.bot.victoriasBot++;
    } else if (resultado === 'empate') {
      estadisticas.bot.empates++;
    }
  }
  guardarEstadisticas();
  actualizarMostrarEstadisticas();
  actualizarContadorMovimientos(); // Nueva función
}

function actualizarMostrarEstadisticas() {
  const victoriasXEl = document.getElementById('victoriasX');
  const victoriasOEl = document.getElementById('victoriasO');
  const empatesEl = document.getElementById('empates');

  if (victoriasXEl) victoriasXEl.textContent = estadisticas.multijugador.victoriasX;
  if (victoriasOEl) victoriasOEl.textContent = estadisticas.multijugador.victoriasO;
  if (empatesEl) empatesEl.textContent = estadisticas.multijugador.empates;
}

// NUEVA FUNCIÓN: Actualizar contador visual
function actualizarContadorMovimientos() {
  const contadorXEl = document.getElementById('movimientosX');
  const contadorOEl = document.getElementById('movimientosO');
  
  if (contadorXEl) contadorXEl.textContent = contadorMovimientos.X;
  if (contadorOEl) contadorOEl.textContent = contadorMovimientos.O;
}

function resetearEstadisticas() {
  if (confirm('¿Estás seguro de que quieres resetear todas las estadísticas?')) {
    estadisticas = {
      multijugador: {
        victoriasX: 0,
        victoriasO: 0,
        empates: 0
      },
      bot: {
        victoriasJugador: 0,
        victoriasBot: 0,
        empates: 0
      }
    };
    
    // Resetear contador de movimientos
    contadorMovimientos = {X: 0, O: 0};
    
    guardarEstadisticas();
    actualizarMostrarEstadisticas();
    actualizarContadorMovimientos();
    alert('¡Estadísticas reseteadas!');
  }
}

// Event listeners
celdasArr.forEach(celda => celda.addEventListener("click", manejarClick));
document.getElementById("reinicioBtn").addEventListener("click", reiniciarJuego);
document.getElementById("Multijugador").addEventListener("click", () => seleccionarModo("multijugador"));
document.getElementById("Bot").addEventListener("click", () => seleccionarModo("bot"));

const resetStatsBtn = document.getElementById("resetStats");
if (resetStatsBtn) {
  resetStatsBtn.addEventListener("click", resetearEstadisticas);
}

document.addEventListener("DOMContentLoaded", cargarEstadisticas);

function seleccionarModo(modo) {
  modoJuego = modo;
  console.log(`Modo de juego seleccionado: ${modoJuego}`);
  reiniciarJuego();
  juegoHabilitado = true;
  actualizarTurnoVisual();
}

function manejarClick(evento) {
  const celda = evento.currentTarget;
  const indice = parseInt(celda.dataset.index, 10);

  if (!juegoHabilitado || !modoJuego) return;
  if (juegoTerminado || Number.isNaN(indice) || tablero[indice] !== "") return;

  // INCREMENTAR CONTADOR (corregido)
  contadorMovimientos[turno]++;
  actualizarContadorMovimientos();

  jugar(celda, turno);
  tablero[indice] = turno;
  evaluarEstadoDelJuego();
  if (juegoTerminado) return;

  if (modoJuego === "multijugador") {
    turno = turno === "X" ? "O" : "X";
    actualizarTurnoVisual();
  } else if (modoJuego === "bot") {
    turno = "O";
    actualizarTurnoVisual();

    juegoHabilitado = false;
    setTimeout(() => {
      const mov = movimientoAI(tablero);
      if (mov !== -1 && tablero[mov] === "") {
        // Incrementar contador para el bot también
        contadorMovimientos[turno]++;
        actualizarContadorMovimientos();
        
        jugar(celdasArr[mov], "O");
        tablero[mov] = "O";
        evaluarEstadoDelJuego();
      }
      if (!juegoTerminado) {
        turno = "X";
        actualizarTurnoVisual();
        juegoHabilitado = true;
      }
    }, 300);
  }
}

function jugar(celda, jugador) {
  if (celda.textContent === "") {
    celda.textContent = jugador;
    // Agregar animación de entrada
    celda.classList.add("celda-nueva");
    setTimeout(() => celda.classList.remove("celda-nueva"), 300);
  } else {
    console.log("La celda ya está ocupada");
  }
}

function reiniciarJuego() {
  celdasArr.forEach(celda => { 
    celda.textContent = ""; 
    celda.classList.remove("winner", "celda-nueva", "tie-effect");
  });
  tablero.fill("");
  turno = "X";
  juegoTerminado = false;
  
  // Resetear contador de movimientos para la partida
  contadorMovimientos = {X: 0, O: 0};
  actualizarContadorMovimientos();
  actualizarTurnoVisual();
}

function actualizarTurnoVisual() {
  const x = document.getElementById("jugadorX");
  const o = document.getElementById("jugadorO");
  if (!x || !o) return;
  
  // Limpiar clases anteriores
  x.classList.remove("turno-activo");
  o.classList.remove("turno-activo");
  
  if (turno === "X") {
    x.textContent = "✖️";
    x.classList.add("turno-activo");
    o.textContent = "";
  } else {
    o.textContent = "⭕";
    o.classList.add("turno-activo");
    x.textContent = "";
  }
}

const combinacionesGanadoras = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6]
];

function evaluarEstadoDelJuego() {
  const resultado = obtenerGanadorConIndices(tablero, combinacionesGanadoras);
  
  if (resultado) {
    const { jugador, indices } = resultado;
    console.log(`¡${jugador} ha ganado!`);
    actualizarEstadisticas(jugador);
    resaltarCeldasGanadoras(indices);
    juegoTerminado = true;
    juegoHabilitado = false;
  } else if (tablero.every(casilla => casilla !== "")) {
    console.log("¡Empate!");
    // Agregar efecto visual de empate
    celdasArr.forEach(celda => celda.classList.add("tie-effect"));
    actualizarEstadisticas('empate');
    juegoTerminado = true;
    juegoHabilitado = false;
  }
}

function obtenerGanadorConIndices(tablero, combinaciones) {
  for (const [a, b, c] of combinaciones) {
    if (tablero[a] && tablero[a] === tablero[b] && tablero[a] === tablero[c]) {
      return { jugador: tablero[a], indices: [a, b, c] };
    }
  }
  return null;
}

function resaltarCeldasGanadoras(combinacion) {
  combinacion.forEach(indice => {
    const celda = celdasArr[indice];
    if (celda) {
      celda.classList.add("winner");
    }
  });
}

function movimientoAI(board) {
  const libres = [];
  for (let i = 0; i < board.length; i++) {
    if (board[i] === "") libres.push(i);
  }
  if (libres.length === 0) return -1;
  const idx = Math.floor(Math.random() * libres.length);
  return libres[idx];
}