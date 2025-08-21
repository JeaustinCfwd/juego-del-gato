// Constantes y elementos del DOM
const celdas = document.querySelectorAll(".celda");
const celdasArr = Array.from(celdas);
const reinicioBtn = document.getElementById("reinicioBtn");
const multijugadorBtn = document.getElementById("Multijugador");
const botBtn = document.getElementById("Bot");
const resetStatsBtn = document.getElementById("resetStats");

// Estado del juego
let turno = "X";
let juegoTerminado = false;
let modoJuego = null;
let juegoHabilitado = false;
const tablero = Array(9).fill("");
let contadorMovimientos = { X: 0, O: 0 };

// Estadísticas
let estadisticas = {
    multijugador: { victoriasX: 0, victoriasO: 0, empates: 0 },
    bot: { victoriasJugador: 0, victoriasBot: 0, empates: 0 }
};

let ranking = [
    { nombre: "Jugador1", puntos: 150, victorias: 10 },
    { nombre: "Jugador2", puntos: 120, victorias: 8 }
];

// Combinaciones ganadoras
const combinacionesGanadoras = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
];

// Inicialización
function inicializarJuego() {
    cargarEstadisticas();
    configurarEventListeners();
    actualizarTurnoVisual();
}

// Event Listeners
function configurarEventListeners() {
    celdasArr.forEach(celda => celda.addEventListener("click", manejarClick));
    reinicioBtn.addEventListener("click", reiniciarJuego);
    multijugadorBtn.addEventListener("click", () => seleccionarModo("multijugador"));
    botBtn.addEventListener("click", () => seleccionarModo("bot"));
    
    if (resetStatsBtn) {
        resetStatsBtn.addEventListener("click", resetearEstadisticas);
    }
}

// Gestión de estadísticas
function cargarEstadisticas() {
    const datosGuardados = localStorage.getItem('ticTacToeEstadisticas');
    if (datosGuardados) {
        try {
            estadisticas = JSON.parse(datosGuardados);
        } catch (error) {
            console.log('Error al cargar estadísticas, usando valores por defecto');
        }
    }
    
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
    if (!modoJuego) return;
    
    const modo = estadisticas[modoJuego];
    
    if (resultado === 'X') {
        modoJuego === 'multijugador' ? modo.victoriasX++ : modo.victoriasJugador++;
    } else if (resultado === 'O') {
        modoJuego === 'multijugador' ? modo.victoriasO++ : modo.victoriasBot++;
    } else if (resultado === 'empate') {
        modo.empates++;
    }
    
    guardarEstadisticas();
    actualizarMostrarEstadisticas();
    actualizarContadorMovimientos();
}

function actualizarMostrarEstadisticas() {
    const elementos = {
        victoriasX: document.getElementById('victoriasX'),
        victoriasO: document.getElementById('victoriasO'),
        empates: document.getElementById('empates')
    };
    
    Object.keys(elementos).forEach(key => {
        if (elementos[key]) {
            elementos[key].textContent = estadisticas.multijugador[key];
        }
    });
}

function actualizarContadorMovimientos() {
    const elementos = {
        movimientosX: document.getElementById('movimientosX'),
        movimientosO: document.getElementById('movimientosO')
    };
    
    Object.keys(elementos).forEach(key => {
        if (elementos[key]) {
            const tipo = key.replace('movimientos', '');
            elementos[key].textContent = contadorMovimientos[tipo];
        }
    });
}

function resetearEstadisticas() {
    if (confirm('¿Estás seguro de que quieres resetear todas las estadísticas?')) {
        estadisticas = {
            multijugador: { victoriasX: 0, victoriasO: 0, empates: 0 },
            bot: { victoriasJugador: 0, victoriasBot: 0, empates: 0 }
        };
        
        contadorMovimientos = { X: 0, O: 0 };
        
        guardarEstadisticas();
        actualizarMostrarEstadisticas();
        actualizarContadorMovimientos();
        alert('¡Estadísticas reseteadas!');
    }
}

// Lógica del juego
function seleccionarModo(modo) {
    modoJuego = modo;
    reiniciarJuego();
    juegoHabilitado = true;
    actualizarTurnoVisual();
}

function manejarClick(evento) {
    const celda = evento.currentTarget;
    const indice = parseInt(celda.dataset.index, 10);

    if (!juegoHabilitado || !modoJuego) return;
    if (juegoTerminado || Number.isNaN(indice) || tablero[indice] !== "") return;

    contadorMovimientos[turno]++;
    actualizarContadorMovimientos();

    jugar(celda, turno);
    tablero[indice] = turno;
    evaluarEstadoDelJuego();
    if (juegoTerminado) return;

    if (modoJuego === "multijugador") {
        cambiarTurno();
    } else if (modoJuego === "bot") {
        turno = "O";
        actualizarTurnoVisual();
        juegoHabilitado = false;
        
        setTimeout(() => {
            const mov = movimientoAI(tablero);
            if (mov !== -1 && tablero[mov] === "") {
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
        celda.classList.add("celda-nueva");
        setTimeout(() => celda.classList.remove("celda-nueva"), 300);
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
    
    contadorMovimientos = { X: 0, O: 0 };
    actualizarContadorMovimientos();
    actualizarTurnoVisual();
}

function cambiarTurno() {
    turno = turno === "X" ? "O" : "X";
    actualizarTurnoVisual();
}

function actualizarTurnoVisual() {
    const jugadorX = document.getElementById("jugadorX");
    const jugadorO = document.getElementById("jugadorO");
    
    if (!jugadorX || !jugadorO) return;
    
    jugadorX.classList.remove("turno-activo");
    jugadorO.classList.remove("turno-activo");
    
    if (turno === "X") {
        jugadorX.textContent = "✖️";
        jugadorX.classList.add("turno-activo");
        jugadorO.textContent = "";
    } else {
        jugadorO.textContent = "⭕";
        jugadorO.classList.add("turno-activo");
        jugadorX.textContent = "";
    }
}

function evaluarEstadoDelJuego() {
    const resultado = obtenerGanadorConIndices(tablero, combinacionesGanadoras);
    
    if (resultado) {
        const { jugador, indices } = resultado;
        actualizarEstadisticas(jugador);
        resaltarCeldasGanadoras(indices);
        juegoTerminado = true;
        juegoHabilitado = false;
    } else if (tablero.every(casilla => casilla !== "")) {
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
    const libres = board
        .map((valor, indice) => valor === "" ? indice : -1)
        .filter(indice => indice !== -1);
    
    if (libres.length === 0) return -1;
    
    const idx = Math.floor(Math.random() * libres.length);
    return libres[idx];
}

// Iniciar el juego cuando el DOM esté cargado
document.addEventListener("DOMContentLoaded", inicializarJuego);