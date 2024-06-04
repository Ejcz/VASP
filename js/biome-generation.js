import { hex_rows, hex_columns } from "./consts.js";

const nrRows = hex_rows;
const nrColumns = hex_columns;
const nrHexes = nrRows * nrColumns;
const biomeTypes = ['desert', 'forest', 'plains', 'jungle', 'mountains', 'ocean'];
const biomeProportions = {
    desert: 1,
    forest: 1,
    plains: 1,
    jungle: 1,
    mountains: 1,
    ocean: 1
};
let biomePosition = {
    desert: [],
    forest: [],
    plains: [],
    jungle: [],
    mountains: [],
    ocean: []
};
let biomes = [];

for (let i = 0; i < nrHexes; i++) {
    biomes.push('')
}

biomeTypes.forEach((biome) => {
    for (let i = 0; i < biomeProportions[biome]; i++) {
        let a = Math.floor(Math.random() * nrHexes);
        biomePosition[biome].push(a)
        biomes[a] = biome
    }
})

function expand(b, isEnough) {
    biomePosition[b].forEach((position) => {                    // Marking adjacent hexes to each biome hex
        let adjacent = []
        let adjacentFiltered = []
        let pos1 = position - 1
        let pos2 = position + 1
        let pos4 = position - nrColumns
        let pos6 = position + nrColumns
        let pos3; let pos5;
        if (Math.trunc((position)/nrColumns)%2 == 0) {          // Checks whether the row is a bit to the left
            pos3 = position - nrColumns - 1
            pos5 = position + nrColumns - 1
        } else {
            pos3 = position - nrColumns + 1
            pos5 = position + nrColumns + 1
        }
        adjacent.push(pos1, pos2, pos3, pos4, pos5, pos6)
        adjacent.forEach((pos) => {
            if (biomes[pos] !== b) {
                adjacentFiltered.push(pos)
            }
        })
        adjacent = adjacentFiltered
        let a = Math.floor(Math.random() * adjacent.length);    // Randomizes one of the adjacent hexes
        if (isEnough == true) {
            if (biomes[adjacent[a]] == '') {
                biomes[adjacent[a]] = b
                biomePosition[b].push(adjacent[a])
            }
        } else {
            if (adjacent[a] >= 0 && adjacent[a] < nrHexes) {
                if (biomePosition[biomes[adjacent[a]]].length > 9) {
                    const index = biomePosition[biomes[adjacent[a]]].indexOf(adjacent[a])
                    if (index > -1) {
                        biomePosition[biomes[adjacent[a]]].splice(index, 1)
                        biomes[adjacent[a]] = b
                        biomePosition[b].push(adjacent[a])
                    }
                }
            }
        }
    })
}
for (let i= 0; i < 12; i++) {
    expand('desert', true)
    expand('forest', true)
    expand('plains', true)
    expand('jungle', true)
    expand('mountains', true)
    expand('ocean', true)
}

for (let i = 0; i < 5; i++) {
    biomeTypes.forEach((biome) => {
        if (biomePosition[biome].length < 15) {
            expand(biome, false)
        }
    })
}

export { biomes }

