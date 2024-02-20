//onload function:

function setup() {
	const mapa = document.querySelector('.map-drag');
	for (let i = 0; i < 7; i++) {
		for (let j = 0; j < 20; j++) {
			mapa.insertAdjacentHTML('beforeend', '<div class="hex">' + i + j + '</div>');
		}
		mapa.insertAdjacentHTML('beforeend', '<br />');
		if (i % 2 == 0) {
			mapa.insertAdjacentHTML('beforeend', '<div class="hex-space"></div>');
		}
	}
}

//map drag:

const map_drag = document.querySelector('.map-drag');
function onMouseDrag({ movementX, movementY }) {
	let getStyle = window.getComputedStyle(map_drag);
	let leftValue = parseInt(getStyle.left);
	let topValue = parseInt(getStyle.top);
	map_drag.style.left = `${leftValue + movementX}px`;
	map_drag.style.top = `${topValue + movementY}px`;
}
map_drag.addEventListener('mousedown', () => {
	map_drag.addEventListener('mousemove', onMouseDrag);
});
document.addEventListener('mouseup', () => {
	map_drag.removeEventListener('mousemove', onMouseDrag);
});
