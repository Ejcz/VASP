import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js';
import { getFirestore, doc, setDoc } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js';

const firebaseConfig = {
	apiKey: 'AIzaSyAItcEpeYj3eosPypuPnfSILDqWdnAWWbo',
	authDomain: 'terragame-e41cc.firebaseapp.com',
	projectId: 'terragame-e41cc',
	storageBucket: 'terragame-e41cc.appspot.com',
	messagingSenderId: '469628303439',
	appId: '1:469628303439:web:7406b5440d9dc77a85d23a',
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app)
const database = getFirestore(app);

const provider = new GoogleAuthProvider();

const googleLoginButton = document.getElementById('googleLoginButton');

googleLoginButton.addEventListener('click', () => {
    signInWithPopup(auth, provider)
    .then((result) => {
      // This gives you a Google Access Token. You can use it to access the Google API.
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential.accessToken;
      // The signed-in user info.
        const user = result.user;
      // IdP data available using getAdditionalUserInfo(result)
        setDoc(doc(database, "Users", user.uid), {
            userdata: {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL
            }
        });
        localStorage.setItem("user", user.uid);
        document.getElementById("log-in").innerHTML = "YOU'RE ALREADY LOGGED IN";
        window.location.href = "main-menu.html"
    }).catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      const credential = GoogleAuthProvider.credentialFromError(error);
    });
  })

if (localStorage.getItem("user") != null) {
  window.location.href = "main-menu.html"
}