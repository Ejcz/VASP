import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js';
import { getFirestore, doc, getDoc, updateDoc, arrayRemove, arrayUnion, deleteField, setDoc } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js';

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

// User id and game id
let user = localStorage.getItem('user');
let gameName = localStorage.getItem('game');

// Is user logged in? If not go to log in page.
if (user == null) {
	window.location.href = 'log-in.html';
}

// Get user's data
const userData = (await getDoc(doc(database, 'Users', user))).data();

// Icon setting
document.querySelector('.acc-icon').style.backgroundImage = "url('" + userData.userInfo.photoURL + "')";
//------------------------------------------------------------------------------------------------------------------

// Faction descriptions
import { factionDescriptions } from './variables.js';

// Getting game invite data
const gameRef = doc(database, 'Games', gameName);
const gameDoc = (await getDoc(gameRef)).data();

// If game is started, go to game
if (gameDoc.started == true) {
	window.location.href = 'game.html';
}

// Map size
import { biomes } from './biome-generation.js';

// If all users have chosen a faction, go to game
if (gameDoc.players.length == gameDoc.nrPlayers) {
	//Starting game
	await updateDoc(gameRef, {
		started: true,
		factionNotSelected: deleteField(),
		factionsAvailable: deleteField(),
		invitedUsers: deleteField(),
	});
	//Adding starting reasources
	for (let i = 0; i < gameDoc.nrPlayers; i++) {
		let player = 'p' + i;
		await setDoc(
			doc(database, 'Games', gameName, 'GameInfo', 'Resources'),
			{
				[player]: {
					cash: 0,
					people: 0,
					stone: 0,
					wood: 0,
					food: 0,
					metals: 0,
				},
			},
			{ merge: true }
		);
	}
	//Adding map terrain, cities etc.
	await setDoc(
		doc(database, 'Games', gameName, 'Map', 'Terrain'),
		{
			terrain: biomes,
		},
		{ merge: true }
	);
	window.location.href = 'game.html';
}

// Who accepted and who did not
gameDoc.invitedUsers.forEach((user) => {
	document.querySelector('#await').insertAdjacentHTML('beforeend', user + '<br>');
});

gameDoc.factionNotSelected.forEach((user) => {
	document.querySelector('#not-selected').insertAdjacentHTML('beforeend', user + '<br>');
});

gameDoc.players.forEach((player) => {
	document.querySelector('#players').insertAdjacentHTML('beforeend', player.name + '<br>');
});

document.querySelector('#faction-select-btt').addEventListener('click', () => {
	document.querySelector('#faction-select-menu').style.transform = 'translate(-50%,-50%) scaleY(1)';
});

// Adding buttons for factions
let chosenFaction;
gameDoc.factionsAvailable.forEach((faction) => {
	document.querySelector('#faction-select-menu').insertAdjacentHTML('beforeend', '<button class="home-button faction-btt" id="btt-' + faction + '">' + faction + '</button><br>');
	document.querySelector('#btt-' + faction).addEventListener('click', () => {
		chosenFaction = faction;
		document.querySelector('#faction-description-box').style.transform = 'translate(-50%,-50%) scaleY(1)';
		document.querySelector('#faction-description').innerHTML = factionDescriptions[faction];
		document.querySelector('#faction-chosen').innerHTML = 'Choose ' + faction;
	});
});

// Faction chosen
document.querySelector('#faction-chosen').addEventListener('click', async () => {
	await updateDoc(gameRef, {
		factionNotSelected: arrayRemove(userData.displayName),
		factionsAvailable: arrayRemove(chosenFaction),
		players: arrayUnion({
			name: userData.displayName,
			faction: chosenFaction,
		}),
	});
	location.reload();
});

// Did user choose a faction? Button
if (gameDoc.factionNotSelected.includes(userData.displayName)) {
	document.querySelector('#faction-select-btt').style.display = 'inline-block';
}

// Home box closing buttons
document.querySelector('#closing-button-1').addEventListener('click', (ev) => {
	document.querySelector('#faction-select-menu').style.transform = 'translate(-50%,-50%) scaleY(0)';
});
document.querySelector('#closing-button-2').addEventListener('click', (ev) => {
	document.querySelector('#faction-description-box').style.transform = 'translate(-50%,-50%) scaleY(0)';
});

//Account menu buttons functions
document.querySelector('#games-btt').addEventListener('click', (ev) => {
	window.location.href = 'main-menu.html';
});
document.querySelector('#log-out-btt').addEventListener('click', (ev) => {
	window.location.href = 'log-in.html';
	localStorage.clear();
});
