// Selecciona todas las celdas
const celdas = document.querySelectorAll(".celda");
let turno = "X";

celdas.forEach(celda => {
  celda.addEventListener("click", manejarClick);
});


const tablero = Array(9).fill("");

function manejarClick(evento) {
  const celda = evento.target;
  const indice = parseInt(celda.dataset.index);

  if (juegoTerminado || isNaN(indice) || celda.textContent !== "") return;

  jugar(celda, turno);
  tablero[indice] = turno;

  console.log(`Celda clickeada: ${indice}`);

  evaluarEstadoDelJuego();

  turno = turno === "X" ? "O" : "X";
  actualizarTurnoVisual();
}



// Función para jugar en una celda
function jugar(celda, jugador) {
 if (celda.textContent === "" || !["X", "O"].includes(celda.textContent)) {
   celda.textContent = jugador;
 } else {
  console.log("La celda ya está ocupada");
 }
}

function reiniciarJuego() {
  celdas.forEach(celda => {
    celda.textContent = "";
  });
  for (let i = 0; i < tablero.length; i++) {
   tablero[i] = "";
  }
  turno = "X";
  actualizarTurnoVisual();
  juegoTerminado = false;
}

document.getElementById("reinicioBtn").addEventListener("click", reiniciarJuego);


function actualizarTurnoVisual() {
  document.getElementById("jugadorX").textContent = turno === "X" ? "⬅️" : "";
  document.getElementById("jugadorO").textContent = turno === "O" ? "⬅️" : "";
}



const combinacionesGanadoras = [
 [0, 1, 2],
 [3, 4, 5],
 [6, 7, 8],
 [0, 3, 6],
 [1, 4, 7],
 [2, 5, 8],
 [0, 4, 8],
 [2, 4, 6]
];


function evaluarEstadoDelJuego() {
  const hayGanador = verificarGanador(tablero, combinacionesGanadoras);

  if (hayGanador) {
    console.log("¡Hay un ganador!");
    juegoTerminado = true;
  } else if (tablero.every(casilla => casilla !== '')) {
    console.log("¡Empate!");
    juegoTerminado = true;
  } else {
    console.log("Sigue jugando");
  }
}


function verificarGanador(tablero, combinaciones) {
  return combinaciones.some(comb => {
    const [a, b, c] = comb;
    return (
      tablero[a] &&
      tablero[a] === tablero[b] &&
      tablero[a] === tablero[c]
    );
  });
}



let juegoTerminado = false;

