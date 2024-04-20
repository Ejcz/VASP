import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js';
import { getFirestore, doc, getDoc, query, collection, where, getDocs } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js';

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

//User id
let user = localStorage.getItem("user");

//Is user logged in? If not go to log in page.
if (user == null) {
	window.location.href = "log-page.html";
}

const userData = (await getDoc(doc(database, 'Users', user))).data().userInfo;

//Icon setting
document.querySelector('.acc-icon').style.backgroundImage = "url('" + userData.photoURL + "')";

// Create button animation
if (document.readyState !== 'loading') {
    CreateButton();
	SubmitButton();
	InviteButton();
} else {
    document.addEventListener('DOMContentLoaded', function () {
        CreateButton();
		SubmitButton();
		InviteButton();
    });
}
function CreateButton() {
	const createBtt = document.getElementById("create-btt");
	createBtt.addEventListener('click', () => {
		document.querySelector("#creation-menu").style.display = "inline-block";
	})
}

function SubmitButton() {
	const submitBtt = document.getElementById("create-submit-btt");
	submitBtt.addEventListener('click', () => {
		GetCreateForm();
	})
}

function GetCreateForm() {
	var gameName = document.querySelector('#game-name').value;
	var nrPeople = document.querySelector("[name='people']:checked").value;
	var turnTime = document.querySelector('#turn-time').value;
	document.querySelector("#invitation-menu").style.display = "inline-block";
}

function InviteButton() {
	const inviteBtt = document.querySelector('#invite-btt')
	var invite = document.querySelector('#game-name').value;
	inviteBtt.addEventListener('click', () => {
		const invitedUser = query(collection(database, "Users"), where("displayName", "==", "EjcZo0"));
		console.log(getDocs(invitedUser));
	})
}