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

// How much time passed since last pass
const countdown = setInterval(() => {
    let today = new Date();
    let timePassed = today - turnPassedTime;
    let remaining = turnTime * 3600 - timePassed / 1000;
    let remainingSeconds = Math.floor(remaining % 60);
    let remainingMinutes = Math.floor((remaining % 3600) / 60);
    let remainingHours = Math.floor(remaining / 3600);
    let timeString = remainingHours + ':' + remainingMinutes + ':' + remainingSeconds;
    console.log(timeString);
}, 1000);
