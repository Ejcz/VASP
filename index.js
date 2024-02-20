//onload hex generating:

const hex_rows = 20;
const hex_columns = 20;

const mapa = document.querySelector('.map-drag');
for (let i = 1; i <= hex_rows; i++) {
	for (let j = 1; j <= hex_columns; j++) {
		mapa.insertAdjacentHTML('beforeend', '<div class="hex">' + i + ',' + j + '</div>');
	}
	mapa.insertAdjacentHTML('beforeend', '<br />');
	if (i % 2 == 1) {
		mapa.insertAdjacentHTML('beforeend', '<div class="hex-space"></div>');
	}
}

//map drag:

const map_drag = document.querySelector('.map-drag');
const map_supp = document.querySelector('.map-supp');

const hex_margin = parseFloat(window.getComputedStyle(document.querySelector('.hex')).margin);
const hex_width = parseFloat(window.getComputedStyle(document.querySelector('.hex')).width);
const hex_height = parseFloat(window.getComputedStyle(document.querySelector('.hex')).height);
const map_height = parseFloat(window.getComputedStyle(map_supp).height);
const map_width = parseFloat(window.getComputedStyle(map_supp).width);

console.log(hex_width);

const left_limit = 15;
const top_limit = 15;
const right_limit = -1 * (15 + hex_columns * hex_width + (hex_columns + 1) * hex_margin * 2 - map_width + hex_width * 0.5);
const bottom_limit = -1 * (15 + hex_rows * hex_height * 0.75 + hex_rows * 2 * hex_margin + hex_height * 0.25 - map_height);

map_drag.style.top = `${bottom_limit / 2}px`;
map_drag.style.left = `${right_limit / 2}px`;

console.log(right_limit);

function onMouseDrag({ movementX, movementY }) {
	let getStyle = window.getComputedStyle(map_drag);
	let leftValue = parseInt(getStyle.left);
	let topValue = parseInt(getStyle.top);
	if (left_limit >= leftValue + movementX && leftValue + movementX >= right_limit) {
		map_drag.style.left = `${leftValue + movementX}px`;
	}
	if (top_limit >= topValue + movementY && topValue + movementY >= bottom_limit) {
		map_drag.style.top = `${topValue + movementY}px`;
	}
}
map_supp.addEventListener('mousedown', () => {
	map_supp.addEventListener('mousemove', onMouseDrag);
});
document.addEventListener('mouseup', () => {
	map_supp.removeEventListener('mousemove', onMouseDrag);
});
