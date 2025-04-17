import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js';
import { getFirestore, doc, getDoc, onSnapshot, setDoc, collection, getDocs, deleteDoc, updateDoc, arrayRemove } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js';

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
const games = (await getDocs(collection(database, 'Games'))).docs.map((doc) => doc.id);

//Delete all traces of a game command

window.deleteGame = async (game) => {
	const docRef = doc(database, 'Games', game);
	const subcollectionNames = ['GameInfo', 'Map'];
	for (const subName of subcollectionNames) {
		const subSnapshot = await getDocs(collection(docRef, subName));
		for (const subDoc of subSnapshot.docs) {
			// Recursively delete sub-subcollections if needed
			await deleteDoc(`${database}/Games/${game}/${subName}/${subDoc.id}`);
		}
	}
	await deleteDoc(docRef);

	const users = (await getDocs(collection(database, 'Users'))).docs.map((doc) => doc.id);
	let userdata;
	users.forEach(async (el) => {
		const userRef = doc(database, 'Users', el);
		userdata = (await getDoc(userRef)).data();
		if (userdata.games.includes(game)) {
			await updateDoc(userRef, {
				games: arrayRemove(game),
			});
		}
		if (userdata.invitations.map((elem) => elem.gameName).includes(game)) {
			let index = userdata.invitations.map((elem) => elem.gameName).indexOf(game);
			await updateDoc(userRef, {
				invitations: arrayRemove(userdata.invitations[index]),
			});
		}
	});
};

//Command for quickly creating a game

window.createGame = async (gameName, listOfPlayers, turnTime) => {
	if (typeof gameName === 'string' && Array.isArray(listOfPlayers) && Number.isInteger(turnTime)) {
		//Picks random factions for the players
		const randomFactions = ['faction1', 'faction2', 'faction3', 'faction4', 'faction5', 'faction6']
			.map((val) => ({ val, sort: Math.random() }))
			.sort((a, b) => a.sort - b.sort)
			.slice(0, listOfPlayers.length)
			.map(({ val }) => val);
	} else {
		return 'incorrect data provided';
	}
};
