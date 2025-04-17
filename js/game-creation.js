import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js';
import { getFirestore, doc, getDoc, updateDoc, arrayRemove, arrayUnion, deleteField, setDoc } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js';
import { biomes, biomePosition, adjacent } from './biome-generation.js';
import { factionBiome, hex_columns } from './variables.js';

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

// Is user logged in? If not go to log in page.
if (user == null) {
	window.location.href = 'log-in.html';
}

// Get user's data
const userData = (await getDoc(doc(database, 'Users', user))).data();

// Icon setting
document.querySelector('.acc-icon').style.backgroundImage = "url('" + userData.userInfo.photoURL + "')";
//------------------------------------------------------------------------------------------------------------------
// Function responsible for starting the game

export async function startGame(gameName) {
	const gameRef = doc(database, 'Games', gameName);
	const gameDoc = (await getDoc(gameRef)).data();
	// Randomizing city locations
	let playerCity = {};
	gameDoc.players.forEach((p) => {
		let pBiome = factionBiome[p.faction];
		let randPosition = biomePosition[pBiome][Math.floor(Math.random() * biomePosition[pBiome].length)];
		Object.defineProperty(playerCity, p.name, { value: randPosition });
	});
	//Starting game
	await updateDoc(gameRef, {
		started: true,
		factionNotSelected: deleteField(),
		factionsAvailable: deleteField(),
		invitedUsers: deleteField(),
	});
	//Adding known hexes
	gameDoc.players.forEach(async (player) => {
		let adjacentHexes = adjacent(playerCity[player.name]);
		await setDoc(
			doc(database, 'Games', gameName, 'GameInfo', 'DiscoveredHexes'),
			{
				[player.name]: {
					cityLocations: [playerCity[player.name]],
					knownHexes: adjacentHexes.concat(playerCity[player.name]),
				},
			},
			{ merge: true }
		);
	});
	//Adding starting reasources
	gameDoc.players.forEach(async (player) => {
		await setDoc(
			doc(database, 'Games', gameName, 'GameInfo', 'Resources'),
			{
				[player.name]: {
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
	});
	//Adding map terrain, cities etc.
	await setDoc(
		doc(database, 'Games', gameName, 'Map', 'Terrain'),
		{
			terrain: biomes,
		},
		{ merge: true }
	);
	let ifDone = 0;
	gameDoc.players.forEach(async (p) => {
		let cityName = 'capital' + p.name;
		ifDone = ifDone + 1;
		await setDoc(
			doc(database, 'Games', gameName, 'Map', 'Cities'),
			{
				[cityName]: {
					owner: p.name,
					location: playerCity[p.name],
				},
			},
			{ merge: true }
		);
		//If the forEach is done go to game
		if (ifDone == gameDoc.nrPlayers) {
			window.location.href = 'game.html';
		}
	});
}
