// Firebase initialization
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js';
import { getFirestore, collection, doc, onSnapshot, getDoc } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js';

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
	window.location.href = 'log-page.html';
}

// Get user's data
const userData = (await getDoc(doc(database, 'Users', user))).data();

// Icon setting
document.querySelector('.acc-icon').style.backgroundImage = "url('" + userData.userInfo.photoURL + "')";

//Importing biome data
import { terrain } from './biomes.js';

//Disabling right click
document.addEventListener('contextmenu', (event) => {
	event.preventDefault();
});

//Variables for map dragging
const hex_rows = 15;
const hex_columns = 15;

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

//Live fetching city data
const cityRef = doc(database, 'map', 'cities');
let cityLocations = ['0_0', '3_3', '3_4'];
getDoc(cityRef).then((doc) => {
	cityLocations = doc.data().allCityLocations;
});

//hex rendering function

function hex_gen(row, col) {
	map_drag.innerHTML = '';
	for (let i = 0; i < hex_hn; i++) {
		for (let j = 0; j < hex_wn; j++) {
			let id_x = (((row + i) % hex_rows) + hex_rows) % hex_rows;
			let id_y = (((col + j) % hex_columns) + hex_columns) % hex_columns;
			let nr = hex_columns * id_y + id_x;
			let isCity = '';
			if (cityLocations.includes(id_x + '_' + id_y)) {
				isCity = ' city';
			}
			map_drag.insertAdjacentHTML('beforeend', '<div class="hex ' + terrain[nr] + isCity + '" id="' + id_x + '_' + id_y + '"></div>');
		}
		map_drag.insertAdjacentHTML('beforeend', '<br />');
		if (i % 2 == ((current_row % 2) + 2) % 2) {
			map_drag.insertAdjacentHTML('beforeend', '<div class="hex-space"></div>');
		}
	}
	//Hex clicking callout
	document.querySelectorAll('.hex').forEach((ev) => {
		ev.addEventListener('click', (button) => {
			if (button.button == 0) {
				hex_clicked(ev.id);
			}
		});
	});
}

//Generating map in the beggining
hex_gen(current_row, current_column);

map_drag.style.top = `${-2 * hex_height - 4 * hex_margin}px`;
map_drag.style.left = `${-2 * hex_height - 4 * hex_margin}px`;

//Hex clicking function
function hex_clicked(hex_id) {
	pop_out.classList.toggle('pop-out-animation');
	map_supp.classList.toggle('map-animation');
	pop_out.insertAdjacentHTML('beforeend', '<br />ID: ' + hex_id);
}

//Map dragging:
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

//Map drag function bind
map_supp.addEventListener('mousedown', (ev) => {
	if (ev.button == '2') {
		map_supp.addEventListener('mousemove', onMouseDrag);
	}
});
document.addEventListener('mouseup', () => {
	map_supp.removeEventListener('mousemove', onMouseDrag);
});

//Pop out interaction
document.querySelector('.close-button').addEventListener('click', (ev) => {
	if (ev.button == 0) {
		pop_out.classList.toggle('pop-out-animation');
		map_supp.classList.toggle('map-animation');
	}
});

//Account menu buttons functions
document.querySelector('#games-btt').addEventListener('click', (ev) => {
	window.location.href = 'main-menu.html';
});
document.querySelector('#log-out-btt').addEventListener('click', (ev) => {
	window.location.href = 'log-page.html';
	localStorage.clear();
});
