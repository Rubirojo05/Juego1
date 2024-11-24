// Firebase Configuración
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, collection, query, orderBy, limit, getDocs, setDoc, doc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyD2KJ0N0FksQJl658h-HdvkAO8CsLue1vw",
    authDomain: "juego1-ca38d.firebaseapp.com",
    projectId: "juego1-ca38d",
    storageBucket: "juego1-ca38d.appspot.com",
    messagingSenderId: "416427181010",
    appId: "1:416427181010:web:eb9f244b8a504f6c713e0b",
    measurementId: "G-60ZB046P0X"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Variables globales
let userId = null;
let saldo = 1000;
let lastNameChange = null;

// Iniciar sesión con Google
document.getElementById('botonLogin').addEventListener('click', async () => {
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        console.log("Usuario autenticado:", user.displayName, user.email);

        userId = user.uid;
        await agregarJugador(user.displayName || "Anónimo", saldo);
        obtenerRanking();
        document.getElementById('botonLogin').style.display = 'none';
        document.querySelector('.cambiar-nombre').style.display = 'block';
        lastNameChange = localStorage.getItem('lastNameChange') || null;
        checkNameChangeAvailability();
    } catch (error) {
        console.error("Error al iniciar sesión con Google:", error);
    }
});

// Actualizar saldo
function actualizarSaldo() {
    const saldoElemento = document.getElementById('saldo');
    saldoElemento.textContent = `Saldo: ${saldo}€`;
    document.getElementById('botonGirar').disabled = saldo <= 0;
}

// Obtener ranking
async function obtenerRanking() {
    const rankingContainer = document.getElementById('ranking');
    const q = query(collection(db, "ranking"), orderBy("saldo", "desc"), limit(5));
    const querySnapshot = await getDocs(q);

    rankingContainer.innerHTML = '';
    let posicion = 1;
    querySnapshot.forEach((doc) => {
        const jugador = doc.data();
        if (jugador.nombre && jugador.saldo !== undefined) {
            const div = document.createElement('div');
            div.textContent = `${posicion}. ${jugador.nombre}: ${jugador.saldo}€`;
            rankingContainer.appendChild(div);
            posicion++;
        }
    });
}

// Agregar jugador al ranking
async function agregarJugador(nombre, saldo) {
    if (!nombre || nombre.trim() === "") {
        mostrarAviso("Por favor, introduce un nombre válido.");
        return;
    }

    try {
        await setDoc(doc(db, "ranking", userId), { nombre, saldo }, { merge: true });
        console.log("Jugador actualizado:", { nombre, saldo });
        obtenerRanking();
    } catch (error) {
        console.error("Error al guardar el jugador:", error);
    }
}

// Función para obtener un símbolo aleatorio
function obtenerSimboloAleatorio() {
    const simbolos = ['🍒', '🍋', '🍊', '🍉', '🔔', '⭐'];
    return simbolos[Math.floor(Math.random() * simbolos.length)];
}

// Girar los carretes
function girarCarretes() {
    if (saldo <= 0) {
        mostrarAviso("Saldo insuficiente. Recarga para seguir jugando.");
        return;
    }
    saldo -= 50;
    actualizarSaldo();
    agregarJugador("Usuario", saldo);

    botonGirar.disabled = true;
    mensaje.textContent = "Girando...";
    let giros = 20;
    let intervalo = setInterval(() => {
        carrete1.textContent = obtenerSimboloAleatorio();
        carrete2.textContent = obtenerSimboloAleatorio();
        carrete3.textContent = obtenerSimboloAleatorio();
        giros--;
        if (giros === 0) {
            clearInterval(intervalo);
            determinarResultado();
            botonGirar.disabled = saldo <= 0;
        }
    }, 100);
}

// Determinar resultado de los carretes
function determinarResultado() {
    const simbolo1 = carrete1.textContent;
    const simbolo2 = carrete2.textContent;
    const simbolo3 = carrete3.textContent;

    if (simbolo1 === simbolo2 && simbolo2 === simbolo3) {
        const premio = 200;
        saldo += premio;
        mostrarAviso(`¡Felicidades! Ganaste ${premio}€`);
    } else {
        mostrarAviso("¡Inténtalo de nuevo!");
    }
    actualizarSaldo();
}

// Mostrar aviso
function mostrarAviso(texto) {
    const aviso = document.getElementById('aviso');
    aviso.textContent = texto;
    aviso.classList.add("mostrar");
    setTimeout(() => aviso.classList.remove("mostrar"), 3000);
}

// Verificar disponibilidad de cambio de nombre
function checkNameChangeAvailability() {
    const now = new Date();
    if (lastNameChange) {
        const lastChangeDate = new Date(lastNameChange);
        const timeDifference = now - lastChangeDate;
        const hoursDifference = timeDifference / (1000 * 60 * 60);
        if (hoursDifference < 24) {
            document.querySelector('.cambiar-nombre').style.display = 'none';
        }
    }
}

// Evento de girar
document.getElementById('botonGirar').addEventListener('click', girarCarretes);

// Cambiar nombre
document.getElementById('botonCambiarNombre').addEventListener('click', () => {
    const nuevoNombre = document.getElementById('nombreUsuario').value.trim();
    if (nuevoNombre) {
        agregarJugador(nuevoNombre, saldo);
        localStorage.setItem('lastNameChange', new Date().toISOString());
        document.querySelector('.cambiar-nombre').style.display = 'none';
    } else {
        mostrarAviso('Por favor, introduce un nombre válido.');
    }
});