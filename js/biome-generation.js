import { hex_rows, hex_columns } from './variables.js';

const nrRows = hex_rows;
const nrColumns = hex_columns;
const nrHexes = nrRows * nrColumns;
const biomeTypes = ['desert', 'forest', 'plains', 'jungle', 'mountains', 'ocean'];
const biomeProportions = {
	// Here you can modify how many of each biome generates first, randomly.
	desert: 1,
	forest: 1,
	plains: 1,
	jungle: 1,
	mountains: 1,
	ocean: 1,
};
let biomePosition = {
	// All the positions where a biome is located
	desert: [],
	forest: [],
	plains: [],
	jungle: [],
	mountains: [],
	ocean: [],
};
let biomes = []; // The result is passed here

for (let i = 0; i < nrHexes; i++) {
	// It is first filled up with blank hexes for easier use later
	biomes.push('');
}

biomeTypes.forEach((biome) => {
	//Randomly generating biomes according to biomeProportions
	for (let i = 0; i < biomeProportions[biome]; i++) {
		let a = Math.floor(Math.random() * nrHexes);
		biomePosition[biome].push(a);
		biomes[a] = biome;
	}
});

// isEnough is a boolean that we mark true if we want to generate the map without overwriting already generated hexes
// and false if we want them overwritten
// Later, for balancing the map I make sure to have at least 15 hexes of each type
// And that is where the false comes in, overwriting the biomes which have too many hexes and replacing them with the ones
// That have too little
// b is the biome you want to expand
function expand(b, isEnough) {
	biomePosition[b].forEach((position) => {
		// Marking adjacent hexes to each biome hex
		let adjacent = [];
		let adjacentFiltered = [];
		let pos1 = position - 1;
		let pos2 = position + 1;
		let pos4 = position - nrColumns;
		let pos6 = position + nrColumns;
		let pos3;
		let pos5;
		if (Math.trunc(position / nrColumns) % 2 == 0) {
			// Checks whether the row is a bit to the left
			pos3 = position - nrColumns - 1;
			pos5 = position + nrColumns - 1;
		} else {
			pos3 = position - nrColumns + 1;
			pos5 = position + nrColumns + 1;
		}
		if (position < nrColumns) {
			pos4 = nrHexes - nrColumns + position
			pos3 = pos4 - 1
		} else if (position > (nrHexes - nrColumns)) {
			pos5 = position - nrHexes + nrColumns
			pos6 = pos5 + 1
		}
		adjacent.push(pos1, pos2, pos3, pos4, pos5, pos6);
		adjacent.forEach((pos) => {
			// Checks if one of the adjacent positions is the biome type that we want to expand, then filters it out.
			if (biomes[pos] !== b) {
				adjacentFiltered.push(pos);
			}
		});
		adjacent = adjacentFiltered;
		let a = Math.floor(Math.random() * adjacent.length); // Randomizes one of the filtered adjacent hexes
		if (isEnough == true) {
			if (biomes[adjacent[a]] == '') {
				// Not overwriting
				biomes[adjacent[a]] = b;
				biomePosition[b].push(adjacent[a]);
			}
		} else {
			// Overwriting
			if (adjacent[a] >= 0 && adjacent[a] < nrHexes) {
				// Is the adjacent hex in the array or not
				if (biomePosition[biomes[adjacent[a]]].length > 9) {
					// Does the overwritten biome also have too little hexes
					const index = biomePosition[biomes[adjacent[a]]].indexOf(adjacent[a]);
					if (index > -1) {
						biomePosition[biomes[adjacent[a]]].splice(index, 1); // Deleting the overwritten hex
						biomes[adjacent[a]] = b; // Replacing it with another biome
						biomePosition[b].push(adjacent[a]);
					}
				}
			}
		}
	});
}
for (let i = 0; i < 12; i++) {
	// Expanding each biome 11 times, with 10 it sometimes doesn't fill up the whole map
	expand('desert', true);
	expand('forest', true);
	expand('plains', true);
	expand('jungle', true);
	expand('mountains', true);
	expand('ocean', true);
}

for (let i = 0; i < 5; i++) {
	// 4 times expanding the biomes with too little hexes. More times will produce a lot of lone hexes
	biomeTypes.forEach((biome) => {
		if (biomePosition[biome].length < 15) {
			// Expanding each biome if it has less than 15 hexes. Will have to change if we increase the size of the map.
			expand(biome, false);
		}
	});
}

export { biomes, biomePosition, nrHexes};
