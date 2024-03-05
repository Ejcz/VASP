import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js';
import { getFirestore, collection, doc, setDoc, getDocs, updateDoc } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js';
import {} from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js';

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

const mapa = collection(database, 'MapEjcz');
const terr = doc(database,'MapEjcz','terrarins');

getDocs(mapa).then((e) => {
	e.docs.forEach((f) => {
			var biomes = f.data().biomes;
	});
});
let biome = ["grasslands", "forest"];


await updateDoc(terr,{'biomes': biomes.concat([0,1,1,1,1,12,33,23],biome)});
