import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js';
import { getFirestore, doc, setDoc, updateDoc, getDoc } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js';
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
/*
const terrains = await getDoc(doc(database, 'map', 'terrain'));
const desert = terrains[tt[0]];
const jungle = terrains[tt[1]];
const meadow = terrains[tt[2]];
const mountains = terrains[tt[3]];
const steppe = terrains[tt[4]];
const swamps = terrains[tt[5]];
*/
