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

window.deleteGame = async (game) => {
	if (games.includes(game)) {
		await deleteDoc(doc(database, 'Games', game));
	}
	const users = (await getDocs(collection(database, 'Users'))).docs.map((doc) => doc.id);
	let userdata;
	users.forEach(async (el) => {
		userdata = (await getDoc(doc(database, 'Users', el))).data();
		if (userdata.games.includes(game)) {
			await updateDoc(doc(database, 'Users', el), {
				games: arrayRemove(game),
			});
		}
		if (userdata.invitations.map((elem) => elem.gameName).includes(game)) {
			let index = userdata.invitations.map((elem) => elem.gameName).indexOf(game);
			await updateDoc(doc(database, 'Users', el), {
				invitations: arrayRemove(userdata.invitations[index]),
			});
		}
	});
};
