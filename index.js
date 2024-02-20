function setup() {
	let mapa = document.getElementsByClassName('map-supp')[0];
	for (let i = 0; i < 5; i++) {
		for (let j = 0; j < 20; j++) {
			mapa.insertAdjacentHTML('beforeend', '<div class="hex">' + i + j + '</div>');
		}
		mapa.insertAdjacentHTML('beforeend', '<br />');
		if (i % 2 == 0) {
			mapa.insertAdjacentHTML('beforeend', '<div class="hex-space"></div>');
		}
	}
}
