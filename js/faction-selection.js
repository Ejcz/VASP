import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js';
import { getFirestore, doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js';

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

// Temporary
localStorage.setItem("game", "bestgameever")

// User id and game id
let user = localStorage.getItem("user");
let gameName = localStorage.getItem('game');

// Is user logged in? If not go to log in page.
if (user == null) {
	window.location.href = "log-page.html";
}

// Get user's data
const userData = (await getDoc(doc(database, 'Users', user))).data();

// Icon setting
document.querySelector('.acc-icon').style.backgroundImage = "url('" + userData.userInfo.photoURL + "')";
//------------------------------------------------------------------------------------------------------------------

// Getting game invite data
const gameRef = doc(database, "Games", gameName);
const gameDoc = (await getDoc(gameRef)).data();

// Who accepted and who did not
gameDoc.invitedUsers.forEach( (user) => {
    document.querySelector("#await").insertAdjacentHTML('beforeend', user + '<br>')
})

gameDoc.players.forEach( (user) => {
    document.querySelector("#players").insertAdjacentHTML('beforeend', user + '<br>')
})

document.querySelector('.game-btt').addEventListener('click', () => {
    console.log('yup')
})
//Did user choose a faction? Button

if (gameDoc.factionNotSelected.includes(user)) {
    document.querySelector('#faction-select').style.display = "none"
}

