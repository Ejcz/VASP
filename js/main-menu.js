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
let user = localStorage.getItem('user');

// Is user logged in? If not go to log in page.
if (user == null) {
	window.location.href = 'log-in.html';
}

// Get user's data
let userData = (await getDoc(doc(database, 'Users', user))).data();

// Icon setting
document.querySelector('.acc-icon').style.backgroundImage = "url('" + userData.userInfo.photoURL + "')";

// Adding user's games
userData.games.forEach((game) => {
	document.querySelector('#your-games').insertAdjacentHTML('beforeend', '<button class="home-button game-button" id=' + game + '>' + game + '</button><br>');
	document.getElementById(game).addEventListener('click', async () => {
		localStorage.setItem('game', game);
		let isStarted = (await getDoc(doc(database, 'Games', game))).data().started;
		if (isStarted == true) {
			window.location.href = 'game.html';
		} else {
			window.location.href = 'faction-selection.html';
		}
	});
});

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
	const createBtt = document.getElementById('create-btt');
	createBtt.addEventListener('click', () => {
		document.querySelector('#creation-menu').style.transform = 'translate(-50%,-50%) scaleY(1)';
	});
}

function SubmitButton() {
	const submitBtt = document.getElementById('create-submit-btt');
	submitBtt.addEventListener('click', () => {
		GetCreateForm();
	});
}

let gameName;
let nrPeople;
let turnTime;
const invitedText = document.querySelector('#invited-text');
async function GetCreateForm() {
	gameName = document.querySelector('#game-name').value;
	nrPeople = document.querySelector("[name='people']:checked").value;
	turnTime = document.querySelector('#turn-time').value;
	invitedText.innerHTML = 'Invited Users 0/' + (nrPeople - 1) + ':';
	const gameNames = await getDocs(query(collection(database, 'Games'), where('gameName', '==', gameName)));
	if (gameNames._snapshot.docChanges.length == 0) {
		document.querySelector('#invitation-menu').style.transform = 'translate(-50%,-50%) scaleY(1)';
		document.querySelector('#name-taken').innerHTML = ' ';
	} else {
		document.querySelector('#name-taken').innerHTML = 'Name is already taken';
	}
}

let invitedCount = 0;
let invitedUsers = [];
let invitedUserId;
const noUser = document.querySelector('#no-user');
function InviteButton() {
	const inviteBtt = document.querySelector('#invite-btt');
	inviteBtt.addEventListener('click', async () => {
		let invite = document.querySelector('#invite-people').value;
		const invitedUser = await getDocs(query(collection(database, 'Users'), where('displayName', '==', invite)));
		if (invitedUser._snapshot.docChanges.length == 1) {
			invitedUser.forEach((doc) => {
				invitedUserId = doc.id;
				noUser.innerHTML = '';
			});
			if (invitedUserId != user) {
				const sfDocRef = doc(database, 'Users', invitedUserId);
				try {
					await runTransaction(database, async (transaction) => {
						const sfDoc = await transaction.get(sfDocRef);
						if (!sfDoc.data().invitations.some((e) => e.gameName == gameName)) {
							transaction.update(sfDocRef, { invitations: arrayUnion({ gameName: gameName, invitor: userData.displayName }) });
							document.querySelector('#invited').insertAdjacentHTML('beforeend', invite + '<br>');
							invitedCount += 1;
							invitedText.innerHTML = 'Invited Users ' + invitedCount + '/' + (nrPeople - 1) + ':';
							invitedUsers = invitedUsers.concat(invite);
							if (invitedCount == nrPeople - 1) {
								await updateDoc(doc(database, 'Users', user), {
									games: arrayUnion(gameName),
								});
								await setDoc(doc(database, 'Games', gameName), {
									gameName: gameName,
									started: false,
									invitedUsers: invitedUsers,
									factionNotSelected: [userData.displayName],
									players: [],
									factionsAvailable: ['faction1', 'faction2', 'faction3', 'faction4', 'faction5', 'faction6'],
									nrPlayers: nrPeople,
									turnTime: parseInt(turnTime),
								});
								location.reload();
							}
						} else {
							noUser.innerHTML = "You've already invited this user<br>";
						}
					});
				} catch (e) {
					console.error(e);
				}
			} else {
				noUser.innerHTML = "You can't invite yourself ;( Make some friends";
			}
		} else {
			noUser.innerHTML = 'There is no such user';
		}
	});
}

//Invitiations window close button
document.querySelector('#inv-close-btt').addEventListener('click', (ev) => {
	document.querySelector('.inv-window').classList.remove('inv-window-animation');
});

//Account menu log-out button
document.querySelector('#log-out-btt').addEventListener('click', (ev) => {
	window.location.href = 'log-in.html';
	localStorage.clear();
});

let invitations = userData.invitations;

//Invitation accepted function
async function InvitationDecision(index, option) {
	let tempInvite = invitations[index];
	let tempGames = userData.games;

	let userReference = doc(database, 'Users', user);
	let gameReference = doc(database, 'Games', tempInvite.gameName);

	let gameData = (await getDoc(gameReference)).data();
	let invited = gameData.invitedUsers;

	invitations.splice(index, 1);
	invited.splice(invited.indexOf(userData.displayName), 1);
	try {
		//Updating databse
		if (option == 1) {
			await updateDoc(userReference, {
				invitations: invitations,
				games: [].concat(tempGames, tempInvite.gameName),
			});

			await updateDoc(gameReference, {
				invitedUsers: invited,
				factionNotSelected: [].concat(gameData.factionNotSelected, userData.displayName),
			});
		} else {
			await updateDoc(userReference, {
				invitations: invitations,
			});

			await updateDoc(gameReference, {
				invitedUsers: invited,
			});
		}

		location.reload();
	} catch (e) {
		console.log(e);
	}
}

//Invitation window pop out and loading
const inv_content = document.querySelector('.inv-content');
const inv_options = document.querySelector('.inv-options');

document.querySelector('#inv-btt').addEventListener('click', (ev) => {
	document.querySelector('.inv-window').classList.add('inv-window-animation');
	inv_content.innerHTML = '';
	inv_options.innerHTML = '';

	if (invitations.length != 0) {
		invitations.forEach((inv) => {
			//Adding invitations to HTML structure (called DOM btw)
			let content1 = '<div class="invitation">' + inv.gameName + ' | ' + inv.invitor + '</div>';
			let index = invitations.indexOf(inv);
			let content2 = '<span class="inv-yes" id="y' + index + '">Y</span><span class="inv-no" id="n' + index + '">N</span>';
			inv_content.insertAdjacentHTML('beforeend', content1);
			inv_options.insertAdjacentHTML('beforeend', content2);

			//Binding yes/no buttons for accepting/rejecting invites
			document.getElementById('y' + index).addEventListener('click', (ev) => {
				InvitationDecision(index, 1);
			});
			document.getElementById('n' + index).addEventListener('click', (ev) => {
				InvitationDecision(index, 0);
			});
		});
	}
});

//Home box closing buttons
document.querySelector('#closing-button-1').addEventListener('click', (ev) => {
	document.querySelector('#creation-menu').style.transform = 'translate(-50%,-50%) scaleY(0)';
});
document.querySelector('#closing-button-2').addEventListener('click', (ev) => {
	document.querySelector('#invitation-menu').style.transform = 'translate(-50%,-50%) scaleY(0)';
});
