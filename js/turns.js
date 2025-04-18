import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js';
import { getFirestore, doc, getDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js';

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
const gameData = (await getDoc(doc(database, 'Games', gameName))).data();
const turnPassedTime = gameData.turnPassedTime.toDate();
const turnTime = gameData.turnTime;
const players = gameData.players.map((player) => player.name);
let turnOfPlayer = gameData.turnOfPlayer;
const today = new Date();

// How much time passed since last pass
let timePassed = today - turnPassedTime;

console.log(turnPassedTime, turnTime, players, today);
