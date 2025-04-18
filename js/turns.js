import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js';
import { getFirestore, doc, getDoc, updateDoc, serverTimestamp, onSnapshot } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js';

const firebaseConfig = {
    apiKey: 'AIzaSyAItcEpeYj3eosPypuPnfSILDqWdnAWWbo',
    authDomain: 'terragame-e41cc.firebaseapp.com',
    projectId: 'terragame-e41cc',
    storageBucket: 'terragame-e41cc.appspot.com',
    messagingSenderId: '469628303439',
    appId: '1:469628303439:web:7406b5440d9dc77a85d23a',
};

const app = initializeApp(firebaseConfig);
const database = getFirestore(app);

// User id
let user = localStorage.getItem('user');
let gameName = localStorage.getItem('game');

// All the values needed
const gameRef = doc(database, 'Games', gameName);
const gameData = (await getDoc(gameRef)).data();
let turnPassedTime = gameData.turnPassedTime.toDate();
let turnTime = gameData.turnTime;
let players = gameData.players;
let turnOfPlayer = gameData.turnOfPlayer;

const gameDataSnapshot = onSnapshot(gameRef, async (docSnap) => {
    let data = docSnap.data();
    turnPassedTime = data.turnPassedTime.toDate();
    turnTime = data.turnTime;
    players = data.players;
    turnOfPlayer = data.turnOfPlayer;
});

const today = new Date();

let timePassed = (today - turnPassedTime) / 1000;
if (timePassed > turnTime) {
    let howManyTurnsPassed = Math.floor(timePassed / turnTime);
    let howMuchTimeInTurn = timePassed % turnTime;
    passTurn(turnOfPlayer, howManyTurnsPassed);

    let whenLastPassed = new Date(today - howMuchTimeInTurn * 1000);
    turnPassedTime = whenLastPassed;

    await updateDoc(gameRef, {
        turnPassedTime: turnPassedTime,
    });
}
// How much time passed since last pass, display in time left
const countdown = setInterval(() => {
    let today = new Date();
    let timePassed = today - turnPassedTime;
    let remaining = turnTime - timePassed / 1000;
    let remainingSeconds = Math.floor(remaining % 60);

    if (remainingSeconds < 10) {
        remainingSeconds = '0' + remainingSeconds;
    }

    let remainingMinutes = Math.floor((remaining % 3600) / 60);
    if (remainingMinutes < 10) {
        remainingMinutes = '0' + remainingMinutes;
    }

    let remainingHours = Math.floor(remaining / 3600);
    if (remainingHours < 10) {
        remainingHours = '0' + remainingHours;
    }

    let timeString;
    if (remainingHours == 0) {
        if (remainingMinutes == 0) {
            timeString = remainingSeconds;
        } else {
            timeString = remainingMinutes + ':' + remainingSeconds;
        }
    } else {
        timeString = remainingHours + ':' + remainingMinutes + ':' + remainingSeconds;
    }
    document.querySelector('#remaining-time').innerHTML = timeString;
    if (remaining < 1) {
        passTurn(turnOfPlayer, 1);
    }
}, 1000);

async function passTurn(currentPlayer, howManyTimes) {
    let currentPlayerNumber = players.indexOf(currentPlayer);
    let nextPlayerNumber = (currentPlayerNumber + howManyTimes) % players.length;
    turnOfPlayer = players[nextPlayerNumber];
    turnPassedTime = new Date();
    await updateDoc(gameRef, {
        turnPassedTime: turnPassedTime,
        turnOfPlayer: turnOfPlayer,
    });
}
