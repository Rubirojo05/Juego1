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

// Iniciar sesión con Google
document.getElementById('botonLogin').addEventListener('click', async () => {
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        console.log("Usuario autenticado:", user.displayName, user.email);

        userId = user.uid;
        await agregarJugador(user.displayName || "Anónimo", saldo);
        obtenerRanking();
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

// Girar los carretes
function girarCarretes() {
    if (saldo <= 0) {
        mostrarAviso("Saldo insuficiente. Recarga para seguir jugando.");
        return;
    }
    saldo -= 50;
    actualizarSaldo();
    agregarJugador("Usuario", saldo);
}

// Mostrar aviso
function mostrarAviso(texto) {
    const aviso = document.getElementById('aviso');
    aviso.textContent = texto;
    aviso.classList.add("mostrar");
    setTimeout(() => aviso.classList.remove("mostrar"), 3000);
}

// Evento de girar
document.getElementById('botonGirar').addEventListener('click', girarCarretes);

// Cambiar nombre
document.getElementById('botonCambiarNombre').addEventListener('click', () => {
    const nuevoNombre = document.getElementById('nombreUsuario').value.trim();
    if (nuevoNombre) {
        agregarJugador(nuevoNombre, saldo);
    } else {
        mostrarAviso('Por favor, introduce un nombre válido.');
    }
});
