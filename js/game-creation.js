import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js';
import { getFirestore, doc, getDoc, updateDoc, arrayRemove, arrayUnion, deleteField, setDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js';
import { biomes, biomePosition, adjacent } from './biome-generation.js';
import { factionBiome, hex_columns, defaultBuildingsCount, resourceNames } from './variables.js';

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

// User id and game id
let user = localStorage.getItem('user');

//------------------------------------------------------------------------------------------------------------------

// Function responsible for starting the game

export async function startGame(gameName) {
    const gameRef = doc(database, 'Games', gameName);
    const gameDoc = (await getDoc(gameRef)).data();
    // Randomizing city locations
    let playerCity = {};
    gameDoc.players.forEach((p) => {
        let pBiome = factionBiome[p.faction];
        let randPosition = biomePosition[pBiome][Math.floor(Math.random() * biomePosition[pBiome].length)];
        Object.defineProperty(playerCity, p.name, { value: randPosition });
    });

    //Starting game
    await updateDoc(gameRef, {
        started: true,
        turnPassedTime: serverTimestamp(),
        turnOfPlayer: gameDoc.players[Math.floor(Math.random() * gameDoc.nrPlayers)].name,
        factionNotSelected: deleteField(),
        factionsAvailable: deleteField(),
        invitedUsers: deleteField(),
    });

    // Adding starting resources and known hexes
    // Creating armies array in UserData
    gameDoc.players.forEach(async (player) => {
        let adjacentHexes = adjacent(playerCity[player.name]);

        const globalResources = resourceNames.reduce((accumulator, currentResourceName) => {
            accumulator[currentResourceName] = 0;
            return accumulator;
        }, {});

        await setDoc(
            doc(database, 'Games', gameName, 'UserData', player.name),
            {
                armies: [],
                faction: player.faction,
                cityLocations: [playerCity[player.name]],
                discoveredHexes: adjacentHexes.concat(playerCity[player.name]),
                resources: globalResources,
            },
            { merge: true }
        );
    });

    // Adding Changes document
    await setDoc(
        doc(database, 'Games', gameName, 'UserData', 'Changes'),
        {
            armies: [],
            cities: [],
            discoveredHexes: [],
            resources: [],
        },
        { merge: true }
    );

    //Adding map terrain, cities etc.
    await setDoc(
        doc(database, 'Games', gameName, 'Map', 'Terrain'),
        {
            terrain: biomes,
        },
        { merge: true }
    );
    let ifDone = 0;
    //Deleting array players
    await updateDoc(gameRef, {
        players: gameDoc.players.map((obj) => obj.name),
    });

    //Creating starting cities
    gameDoc.players.forEach(async (p) => {
        let cityName = 'capital' + p.name;
        ifDone = ifDone + 1;
        await setDoc(
            doc(database, 'Games', gameName, 'Map', 'Cities'),
            {
                [cityName]: {
                    owner: p.name,
                    location: playerCity[p.name],
                    buildings: defaultBuildingsCount,
                },
            },
            { merge: true }
        );
        //If the forEach is done go to game
        if (ifDone == gameDoc.nrPlayers) {
            localStorage.setItem('game', gameDoc.gameName);
            window.location.href = 'game.html';
        }
    });
}
