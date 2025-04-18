const terrain_types = ['desert', 'forest', 'plains', 'jungle', 'mountains', 'ocean'];
const hex_rows = 10;
const hex_columns = 10;

const factionDescriptions = {
    faction1: 'lorem ipsum1',
    faction2: 'lorem ipsum2',
    faction3: 'lorem ipsum3',
    faction4: 'lorem ipsum4',
    faction5: 'lorem ipsum5',
    faction6: 'lorem ipsum6',
};

const factionBiome = {
    faction1: 'desert',
    faction2: 'forest',
    faction3: 'plains',
    faction4: 'jungle',
    faction5: 'mountains',
    faction6: 'ocean',
};


// Default buildings settings

const buildingsCollection = [
    {
        name: 'barracs',
        initialCount: 0,
        cost:1
    },
    {
        name: 'school',
        initialCount: 0,
        cost:1
    },
    {
        name: 'farm',
        initialCount: 0,
        cost:1
    }
];

const defaultBuildingsCount = buildingsCollection.reduce((accumulator,currentBuilding) => {
    accumulator[currentBuilding.name]= currentBuilding.cost;
    return accumulator;
}, {});

export { factionDescriptions, hex_rows, hex_columns, factionBiome, buildingsCollection, defaultBuildingsCount};


