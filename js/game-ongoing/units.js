// Firebase initialization
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js';
import { getFirestore, doc, getDoc, onSnapshot, setDoc, updateDoc, arrayUnion } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js';

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

// Get user's data
const userData = (await getDoc(doc(database, 'Users', user))).data();

import { adjacent } from '../pre-game/biome-generation.js';
import { occupiedHexes, current_column, current_row, hex_gen } from './map.js';
let activeHexes = [];

// Function that highlights where a unit can move
function whereToMove(hex_id) {
    const availableHexes = adjacent(hex_id).filter((ele) => !occupiedHexes.includes(ele));
    activeHexes.push(...availableHexes);
}

let armyId;

//Moving an army function
import { clickedHexId, userArmyLocations, hexClickFunction, getCurrentData } from './map.js';
import { alertMessage } from './alert.js';
import { hex_rows } from '../variables.js';
document.querySelector('.move-army').addEventListener('click', (ev) => {
    if (userArmyLocations.includes(parseInt(clickedHexId))) {
        hexClickFunction('unit-view');
        whereToMove(parseInt(clickedHexId));
        armyId = clickedHexId;
    } else {
        alert_display("This hex doesn't contain your army");
    }
    document.querySelector('.noncity-popout').style.display = 'none';
});

//Moves the army to a neighbouring square
export async function moveArmy() {
    if (activeHexes.includes(parseInt(clickedHexId))) {
        //Changes back to map-view
        hexClickFunction('map-view');
        activeHexes = [];
        let userRef = doc(database, 'Games', gameName, 'UserData', userData.displayName);
        let armies = (await getDoc(userRef)).data().armies;
        let armyIndex = armies.map((ele) => ele.location).indexOf(parseInt(armyId));
        armies[armyIndex] = { location: parseInt(clickedHexId) };
        console.log(clickedHexId);
        await updateDoc(userRef, {
            armies: armies,
            discoveredHexes: arrayUnion(parseInt(clickedHexId)),
        });
        armyId = '';

        await getCurrentData(['army', 'discovered']);
        hex_gen(current_row, current_column);
    } else {
        alert_display("You can't move there");
    }
}
