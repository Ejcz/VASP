// Firebase initialization
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js';
import { getFirestore, doc, getDoc, onSnapshot, setDoc } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js';

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
let gameName = localStorage.getItem('game');

// Is user logged in? If not go to log in page.
if (user == null) {
	window.location.href = 'log-in.html';
}

// Get user's data
const userData = (await getDoc(doc(database, 'Users', user))).data();

// Icon setting
document.querySelector('.acc-icon').style.backgroundImage = "url('" + userData.userInfo.photoURL + "')";

// In-game player numer
const players = (await getDoc(doc(database, 'Games', gameName))).data().players;
let playersT = [];
for (const k of players) {
	playersT.push(k.name);
}
const playerNumer = playersT.indexOf(userData.displayName);

// Importing biome data
const biomes = (await getDoc(doc(database, 'Games', gameName, 'Map', 'Terrain'))).data().terrain;

// Disabling right click
document.addEventListener('contextmenu', (event) => {
	event.preventDefault();
});

// Variables for map dragging
import { hex_rows, hex_columns } from './variables.js';

var current_row = 0;
var current_column = 0;

const map_drag = document.querySelector('.map-drag');
const map_supp = document.querySelector('.map-supp');
const pop_out = document.querySelector('.pop-out');

map_drag.insertAdjacentHTML('beforeend', '<div class="hex"></div>');

const hex_margin = parseFloat(window.getComputedStyle(document.querySelector('.hex')).margin);
const hex_width = parseFloat(window.getComputedStyle(document.querySelector('.hex')).width);
const hex_height = parseFloat(window.getComputedStyle(document.querySelector('.hex')).height);
const map_height = parseFloat(window.getComputedStyle(map_supp).height);
const map_width = parseFloat(window.getComputedStyle(map_supp).width);

const hex_wn = Math.ceil(map_width / (hex_width + 2 * hex_margin)) + 3;
const hex_hn = Math.ceil((map_height - hex_height / 4) / (2 * hex_margin + 0.75 * hex_height)) + 3;

// Cities data

const userCities = [];
const enemyCities = [];
const Cities = (await getDoc(doc(database, 'Games', gameName, 'Map', 'Cities'))).data();
for (const city in Cities) {
	if (Cities[city].owner == userData.displayName) {
		userCities.push(Cities[city]);
	} else {
		enemyCities.push(Cities[city])
	}
}
const userCitiesLocations = userCities.map((el) => el.location);
const enemyCitiesLocations = enemyCities.map((el) => el.location);

// Hex rendering function

function hex_gen(row, col) {
	map_drag.innerHTML = '';
	for (let i = 0; i < hex_hn; i++) {
		for (let j = 0; j < hex_wn; j++) {
			let id_x = (((row + i) % hex_rows) + hex_rows) % hex_rows;
			let id_y = (((col + j) % hex_columns) + hex_columns) % hex_columns;
			let nr = id_y + hex_columns * id_x;
			if (userCitiesLocations.includes(nr)) {
				var isUserCity = ' user_city';
			} else {
				var isUserCity = '';
			}
			if (enemyCitiesLocations.includes(nr)) {
				var isEnemyCity = ' enemy_city';
			} else {
				var isEnemyCity = '';
			}
			map_drag.insertAdjacentHTML('beforeend', '<div class="hex ' + biomes[nr] + isUserCity + isEnemyCity +'" id="' + nr + '">' + nr + '</div>');
				}
		map_drag.insertAdjacentHTML('beforeend', '<br />');
		if (i % 2 == ((current_row % 2) + 2) % 2) {
			map_drag.insertAdjacentHTML('beforeend', '<div class="hex-space"></div>');
		}
	}
	// Hex clicking callout
	document.querySelectorAll('.hex').forEach((ev) => {
		ev.addEventListener('click', (button) => {
			if (button.button == 0) {
				hex_clicked(ev.id);
			}
		});
	});
}

// Generating map in the beggining
hex_gen(current_row, current_column);

map_drag.style.top = `${-2 * hex_height - 4 * hex_margin}px`;
map_drag.style.left = `${-2 * hex_height - 4 * hex_margin}px`;

// Map dragging:
function onMouseDrag({ movementX, movementY }) {
	let getStyle = window.getComputedStyle(map_drag);
	let leftValue = parseInt(getStyle.left);
	let topValue = parseInt(getStyle.top);
	let outX = leftValue + movementX;
	let outY = topValue + movementY;

	if (outY > -1 * hex_height - 2 * hex_margin) {
		current_row -= 1;
		hex_gen(current_row, current_column);
		map_drag.style.top = `${outY - 0.75 * hex_height - 2 * hex_margin}px`;
	} else if (outY < map_height - (hex_hn - 2) * (hex_height * 0.75 + 2 * hex_margin) - hex_height - 2 * hex_margin) {
		current_row += 1;
		hex_gen(current_row, current_column);
		map_drag.style.top = `${outY + 0.75 * hex_height + 2 * hex_margin}px`;
	} else {
		map_drag.style.top = `${outY}px`;
	}

	if (outX > -1 * hex_width - 2 * hex_margin) {
		current_column -= 1;
		hex_gen(current_row, current_column);
		map_drag.style.left = `${outX - hex_width - 2 * hex_margin}px`;
	} else if (outX < map_width - (hex_wn - 1) * (hex_width + 2 * hex_margin)) {
		current_column += 1;
		hex_gen(current_row, current_column);
		map_drag.style.left = `${outX + hex_width + 2 * hex_margin}px`;
	} else {
		map_drag.style.left = `${outX}px`;
	}
}

// Map drag function bind
map_supp.addEventListener('mousedown', (ev) => {
	if (ev.button == '2') {
		map_supp.addEventListener('mousemove', onMouseDrag);
	}
});
document.addEventListener('mouseup', () => {
	map_supp.removeEventListener('mousemove', onMouseDrag);
});

// Account menu buttons functions
document.querySelector('#games-btt').addEventListener('click', (ev) => {
	window.location.href = 'main-menu.html';
});
document.querySelector('#log-out-btt').addEventListener('click', (ev) => {
	window.location.href = 'log-in.html';
	localStorage.clear();
});

// Resources statistics

const resourcesListener = onSnapshot(doc(database, 'Games', gameName, 'GameInfo', 'Resources'), async (docSnap) => {
	let resources = docSnap.data()['p' + playerNumer];
	for (let r in resources) {
		document.querySelector('.' + r + '-stat').innerHTML = resources[r];
	}
});

// Navigation bar buttons - animation
const nav_ref = document.getElementsByClassName('nav-button');

function clear_nav() {
	[].forEach.call(nav_ref, function (element2) {
		element2.classList.remove('nav-button-clicked');
	});
}

[].forEach.call(nav_ref, function (element) {
	element.addEventListener('click', (ev) => {
		clear_nav();
		element.classList.add('nav-button-clicked');
	});
});

// Hex clicking function

let hex_mark = 'map-view'; //The variable which determines what happens when you press a hex tile, by default "map-view" = open the details of the hex (e.g. city view)

function hex_clicked(hex_id) {
	switch (hex_mark) {
		case 'map-view':
			if (document.getElementById(hex_id).classList.contains('user_city')) {
				pop_out_open();
			}
	}
}

//General pop-out functions

function pop_out_open() {
	clear_nav();
	document.querySelector('#city-button').classList.add('nav-button-clicked');
	pop_out.classList.toggle('pop-out-transition');
	pop_out.classList.toggle('pop-out-animation');
	map_supp.classList.toggle('map-transition');
	map_supp.classList.toggle('map-animation');
}

function pop_out_close() {
	pop_out.classList.toggle('pop-out-transition');
	pop_out.classList.toggle('pop-out-animation');
	map_supp.classList.toggle('map-transition');
	map_supp.classList.toggle('map-animation');
}

//Nav bar map button clicked

document.querySelector('#map-button').addEventListener('click', () => {
	if (pop_out.classList.contains('pop-out-animation')) {
		pop_out_close();
	}
});
setTimeout(() => {
	document.querySelector('.loader-wheel').style.display = 'none';
}, 1000);
