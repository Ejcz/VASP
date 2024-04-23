import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js';
import { getFirestore, doc, getDoc, query, collection, where, getDocs, updateDoc, arrayUnion, runTransaction, setDoc } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js';

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
let user = localStorage.getItem("user");

// Is user logged in? If not go to log in page.
if (user == null) {
	window.location.href = "log-page.html";
}

// Get user's data
const userData = (await getDoc(doc(database, 'Users', user))).data();

// Icon setting
document.querySelector('.acc-icon').style.backgroundImage = "url('" + userData.userInfo.photoURL + "')";

// Adding user's games
const yourGames = document.querySelector('#your-games')
userData.games.forEach( (game) => {
	yourGames.insertAdjacentHTML('beforeend', '<button class="game-btt" id=' + game + '>' + game + '</button><br>')
	document.getElementById(game).addEventListener('click', () => {
		localStorage.setItem("game", game);
		window.location.href = "game.html"
	})
})

// Intializing forms and buttons
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

let gameName;
let nrPeople;
let turnTime;
const invitedText = document.querySelector('#invited-text');
async function GetCreateForm() {
	gameName = document.querySelector('#game-name').value;
	nrPeople = document.querySelector("[name='people']:checked").value;
	turnTime = document.querySelector('#turn-time').value;
	invitedText.innerHTML = 'Invited Users 0/' + (nrPeople-1) + ':';
	const gameNames = await getDocs(query(collection(database, "Games"), where("gameName", "==", gameName)));
	if (gameNames._snapshot.docChanges.length == 0) {
		document.querySelector("#invitation-menu").style.display = "inline-block";
		document.querySelector('#name-taken').innerHTML = " "
	} else {
		document.querySelector('#name-taken').innerHTML = "Name is already taken"
	}

}

let invitedCount = 0;
let invitedUsers = [];
let invitedUserId;
const noUser = document.querySelector("#no-user")
function InviteButton() {
	const inviteBtt = document.querySelector('#invite-btt')
	inviteBtt.addEventListener('click', async () => {
		let invite = document.querySelector('#invite-people').value;
		const invitedUser = await getDocs(query(collection(database, "Users"), where("displayName", "==", invite)));
		if (invitedUser._snapshot.docChanges.length == 1) {
			invitedUser.forEach( (doc) => {
				invitedUserId = doc.id
				noUser.innerHTML = ""
			});
			if (invitedUserId != user) {
				const sfDocRef = doc(database, "Users", invitedUserId);
				try {
					await runTransaction(database, async (transaction) => {
						const sfDoc = await transaction.get(sfDocRef);
						if (!sfDoc.data().invitations.some(e => e.gameName == gameName)) {
							transaction.update(sfDocRef, {invitations: arrayUnion( {gameName: gameName, invitor: userData.displayName} )});
							document.querySelector("#invited").insertAdjacentHTML('beforeend', invite + "<br>");
							invitedCount += 1;
							invitedText.innerHTML = 'Invited Users ' + invitedCount + '/' + (nrPeople-1) + ':'
							invitedUsers = invitedUsers.concat(invite);
							if (invitedCount == nrPeople - 1) {
								await updateDoc(doc(database, "Users", user), {
									games: arrayUnion(gameName)
								});
								await setDoc(doc(database, "Games", gameName), {
									gameName: gameName,
									started: false,
									invitedUsers: invitedUsers,
									players: [userData.displayName]
								})
								location.reload()
							}
						} else {
							noUser.innerHTML = "You've already invited this user<br>"
						}
					});
				} catch (e) {
					console.error(e);
				}
			} else {
				noUser.innerHTML = "You can't invite yourself ;( Make some friends"
			}
		} else {
			noUser.innerHTML = "There is no such user"
		}
	})
}