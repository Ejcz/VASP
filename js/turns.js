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
let turnOfPlayer = gameData.turnOfPlayer;

// How much time passed since last pass, display in time left
const countdown = setInterval(() => {
    let today = new Date();
    let timePassed = today - turnPassedTime;
    let remaining = turnTime * 3600 - timePassed / 1000;
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
}, 1000);

// Checking whose turn is it
