// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDdQmMGAQdo1cQuNdheThPoJI_L7ZsRsG4",
  authDomain: "terra-web-game.firebaseapp.com",
  projectId: "terra-web-game",
  storageBucket: "terra-web-game.appspot.com",
  messagingSenderId: "675854572141",
  appId: "1:675854572141:web:651060965259561ebbfd64",
  measurementId: "G-7MSF961YVM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

//disabling right click

document.addEventListener('contextmenu', (event) => {
	event.preventDefault();
});

//global variables

const hex_rows = 15;
const hex_columns = 15;

var current_row = 0;
var current_column = 0;

const map_drag = document.querySelector('.map-drag');
const map_supp = document.querySelector('.map-supp');

map_drag.insertAdjacentHTML('beforeend', '<div class="hex"></div>');

const hex_margin = parseFloat(window.getComputedStyle(document.querySelector('.hex')).margin);
const hex_width = parseFloat(window.getComputedStyle(document.querySelector('.hex')).width);
const hex_height = parseFloat(window.getComputedStyle(document.querySelector('.hex')).height);
const map_height = parseFloat(window.getComputedStyle(map_supp).height);
const map_width = parseFloat(window.getComputedStyle(map_supp).width);

const hex_wn = Math.ceil(map_width / (hex_width + 2 * hex_margin)) + 3;
const hex_hn = Math.ceil((map_height - hex_height / 4) / (2 * hex_margin + 0.75 * hex_height)) + 3;

//hex rendering function

function hex_gen(row, col) {
	map_drag.innerHTML = '';
	for (let i = 0; i < hex_hn; i++) {
		for (let j = 0; j < hex_wn; j++) {
			let id_x = (((row + i) % hex_rows) + hex_rows) % hex_rows;
			let id_y = (((col + j) % hex_columns) + hex_columns) % hex_columns;
			map_drag.insertAdjacentHTML('beforeend', '<div class="hex" id="' + id_x + ',' + id_y + '">' + id_x + ',' + id_y + '</div>');
		}
		map_drag.insertAdjacentHTML('beforeend', '<br />');
		if (i % 2 == ((current_row % 2) + 2) % 2) {
			map_drag.insertAdjacentHTML('beforeend', '<div class="hex-space"></div>');
		}
	}
}

hex_gen(current_row, current_column);
map_drag.style.top = `${-2 * hex_height - 4 * hex_margin}px`;
map_drag.style.left = `${-2 * hex_height - 4 * hex_margin}px`;

//map dragging:

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

map_supp.addEventListener('mousedown', (ev) => {
	if (ev.button == '2') {
		map_supp.addEventListener('mousemove', onMouseDrag);
	}
});
document.addEventListener('mouseup', () => {
	map_supp.removeEventListener('mousemove', onMouseDrag);
});
