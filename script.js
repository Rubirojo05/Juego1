//FIREBASE

// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-analytics.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyD2KJ0N0FksQJl658h-HdvkAO8CsLue1vw",
    authDomain: "juego1-ca38d.firebaseapp.com",
    projectId: "juego1-ca38d",
    storageBucket: "juego1-ca38d.firebasestorage.app",
    messagingSenderId: "416427181010",
    appId: "1:416427181010:web:eb9f244b8a504f6c713e0b",
    measurementId: "G-60ZB046P0X"
};

// Inicializar Firebase
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Variables globales
const carrete1 = document.getElementById('carrete1');
const carrete2 = document.getElementById('carrete2');
const carrete3 = document.getElementById('carrete3');
const botonGirar = document.getElementById('botonGirar');
const mensaje = document.getElementById('mensaje');
const saldoElemento = document.getElementById('saldo');
const rankingContainer = document.getElementById('ranking');
const aviso = document.getElementById('aviso');

const simbolos = ['💎', '👑', '💰', '🏆', '⭐', '🎲'];

// Cargar el saldo desde el almacenamiento de sesión
let saldo = sessionStorage.getItem('saldo') ? parseInt(sessionStorage.getItem('saldo')) : 1000;
actualizarSaldo();

// Función para obtener un símbolo aleatorio
function obtenerSimboloAleatorio() {
    return simbolos[Math.floor(Math.random() * simbolos.length)];
}

// Función para girar los carretes
function girarCarretes() {
    if (saldo <= 0) {
        mostrarAviso("Saldo insuficiente. Recarga para seguir jugando.");
        return;
    }
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

// Función para determinar el resultado
function determinarResultado() {
    const resultado1 = carrete1.textContent;
    const resultado2 = carrete2.textContent;
    const resultado3 = carrete3.textContent;

    if (resultado1 === resultado2 && resultado2 === resultado3) {
        saldo += 500;
        mensaje.textContent = "🎉 ¡Jackpot! ¡Has ganado 500€!";
        mensaje.style.color = "#d4af37";
    } else {
        saldo -= 50;
        mensaje.textContent = "💔 No has ganado esta vez.";
        mensaje.style.color = "#fff";
    }

    sessionStorage.setItem('saldo', saldo);
    actualizarSaldo();
    actualizarRanking();
}

// Función para actualizar el saldo en pantalla
function actualizarSaldo() {
    saldoElemento.textContent = `Saldo: ${saldo}€`;
    botonGirar.disabled = saldo <= 0;
}

// Función para mostrar el aviso de saldo insuficiente
function mostrarAviso(texto) {
    aviso.textContent = texto;
    aviso.classList.add("mostrar");
    setTimeout(() => {
        aviso.classList.remove("mostrar");
    }, 3000);
}

// Función para obtener y mostrar el ranking
function obtenerRanking() {
    db.collection("ranking")
        .orderBy("saldo", "desc")
        .limit(5)
        .get()
        .then((querySnapshot) => {
            rankingContainer.innerHTML = ''; // Limpiar el ranking
            querySnapshot.forEach((doc) => {
                const jugador = doc.data();
                const div = document.createElement('div');
                div.textContent = `${jugador.nombre}: ${jugador.saldo}€`;
                rankingContainer.appendChild(div);
            });
        })
        .catch((error) => {
            console.error("Error obteniendo el ranking: ", error);
        });
}

// Función para agregar un jugador al ranking
function agregarJugador(nombre, saldo) {
    const docRef = db.collection("ranking").doc(nombre);
    docRef.set({
        nombre: nombre,
        saldo: saldo
    }, { merge: true })
    .then(() => {
        console.log("Jugador agregado/actualizado");
        obtenerRanking();
    })
    .catch((error) => {
        console.error("Error agregando/actualizando jugador: ", error);
    });
}

// Cargar el ranking al cargar la página
document.addEventListener('DOMContentLoaded', obtenerRanking);

// Vincular el evento de clic al botón "Girar"
botonGirar.addEventListener('click', girarCarretes);
