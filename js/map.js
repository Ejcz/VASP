// Firebase initialization
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js';
import { getFirestore, doc, getDoc, onSnapshot, setDoc, updateDoc, arrayUnion, getDocs, collection } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js';

//Import global variables
import { defaultBuildingsCount, resourceNames, buildingsCollection } from './variables.js';

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

// Importing biome data
const biomes = (await getDoc(doc(database, 'Games', gameName, 'Map', 'Terrain'))).data().terrain;

// Disabling right click
document.addEventListener('contextmenu', (event) => {
    event.preventDefault();
});

// Variables for map dragging
import { hex_rows, hex_columns } from './variables.js';
import { adjacent } from './biome-generation.js';

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

//User that is currently playing data
let userDoc = (await getDoc(doc(database, 'Games', gameName, 'UserData', userData.displayName))).data();

//Whose turn is it?
import { turnOfPlayer, alertMessage } from './turns.js';

//Variables for fetching map data
let userCitiesLocations = [];
let enemyCitiesLocations = [];
let userArmyLocations = [];
let enemyArmyLocations = [];
let cities;

async function getCurrentData(whatToGet) {
    //Fetching cities data
    if (whatToGet.includes('city')) {
        cities = (await getDoc(doc(database, 'Games', gameName, 'Map', 'Cities'))).data();
        for (const city in cities) {
            if (cities[city].owner == userData.displayName) {
                userCitiesLocations.push(cities[city].location);
            } else {
                enemyCitiesLocations.push(cities[city].location);
            }
        }
    }
    //Fetching armies data
    if (whatToGet.includes('army')) {
        const usersDocs = (await getDocs(collection(database, 'Games', gameName, 'UserData'))).docs;
        const armies = usersDocs.map((ele) => ({ armies: ele.data().armies, user: ele.id }));
        armies.forEach((ele) => {
            if (ele.user == userData.displayName) {
                userArmyLocations = userArmyLocations.concat(ele.armies.map((army) => army.location));
            } else {
                enemyArmyLocations = enemyArmyLocations.concat(ele.armies.map((army) => army.location));
            }
        });
    }
}

await getCurrentData(['city', 'army']);

// Known hexes data
let knownHexes = userDoc.discoveredHexes;
const knownHexesSnapshot = onSnapshot(doc(database, 'Games', gameName, 'UserData', userData.displayName), async (docSnap) => {
    knownHexes = docSnap.data().discoveredHexes;
});

// Hex rendering function

function hex_gen(row, col) {
    map_drag.innerHTML = '';
    for (let i = 0; i < hex_hn; i++) {
        for (let j = 0; j < hex_wn; j++) {
            let id_x = (((row + i) % hex_rows) + hex_rows) % hex_rows;
            let id_y = (((col + j) % hex_columns) + hex_columns) % hex_columns;
            let nr = id_y + hex_columns * id_x;
            if (knownHexes.includes(nr)) {
                var known = biomes[nr];
                if (enemyCitiesLocations.includes(nr)) {
                    var isCity = ' enemy_city';
                } else if (userCitiesLocations.includes(nr)) {
                    var isCity = ' user_city';
                } else {
                    var isCity = '';
                }
                if (userArmyLocations.includes(nr)) {
                    var isArmy = ' user_army';
                } else if (enemyArmyLocations.includes(nr)) {
                    var isArmy = ' enemy_army';
                } else {
                    var isArmy = '';
                }
            } else {
                var known = ' unknown_hex';
                var isCity = '';
                var isArmy = '';
            }

            map_drag.insertAdjacentHTML('beforeend', '<div class="hex ' + known + isCity + isArmy + '" id="' + nr + '">' + nr + '</div>');
        }
        map_drag.insertAdjacentHTML('beforeend', '<br />');
        if (i % 2 == ((current_row % 2) + 2) % 2) {
            map_drag.insertAdjacentHTML('beforeend', '<div class="hex-space"></div>');
        }
    }
    // Hex clicking callout
    document.querySelectorAll('.hex').forEach((hex) => {
        hex.addEventListener('click', (event) => {
            event.stopPropagation();
            nonCityPopout.style.display = 'none';
            if (event.button == 0) {
                hex_clicked(hex.id, event.clientX, event.clientY);
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
    nonCityPopout.style.display = 'none';
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
let resources;
const resourcesListener = onSnapshot(doc(database, 'Games', gameName, 'UserData', userData.displayName), async (docSnap) => {
    resources = docSnap.data().resources;
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
let clickedHexId;
function hex_clicked(hex_id, cursorX, cursorY) {
    clickedHexId = hex_id;
    switch (hex_mark) {
        case 'map-view':
            if (document.getElementById(hex_id).classList.contains('user_city')) {
                city_popout_open(hex_id);
            } else if (document.getElementById(hex_id).classList.contains('enemy_city')) {
            } else if (!document.getElementById(hex_id).classList.contains('unknown_hex')) {
                if (userData.displayName == turnOfPlayer) {
                    noncity_pop_out_open(cursorX, cursorY);
                }
            }
    }
}

//General pop-out functions
function city_popout_open(location) {
    let city;
    let nameCity;
    for (const c in cities) {
        if (cities[c].location == location) {
            city = cities[c];
            nameCity = c;
        }
    }

    for (const building in city.buildings) {
        document.querySelector('.city-grid').insertAdjacentHTML(
            'beforeend',
            `
            <div class="city-building" id="${building}">
                <div>${building}</div>
                <div class="city-building-count" id="${building}-count">${city.buildings[building]}</div>
            </div>
            `
        );
        if (city.buildings[building] >= 1) {
            document.querySelector('#' + building).classList.add('city-building-built');
        }
        document.querySelector('#' + building).addEventListener('click', () => {
            if (userData.displayName == turnOfPlayer) {
                if (checkIfCanAfford(building)) {
                    buildABuilding(building, nameCity, city);
                }
            } else {
                alertMessage("It's not your turn");
            }
        });
    }
    clear_nav();
    pop_out.classList.toggle('pop-out-transition');
    pop_out.classList.toggle('pop-out-animation');
    //map_supp.classList.toggle('map-transition');
    //map_supp.classList.toggle('map-animation');
}

function city_popout_close() {
    document.querySelector('.city-grid').innerHTML = '';
    pop_out.classList.toggle('pop-out-transition');
    pop_out.classList.toggle('pop-out-animation');
    //map_supp.classList.toggle('map-transition');
    //map_supp.classList.toggle('map-animation');
}

// Nav bar map button clicked

document.querySelector('#map-button').addEventListener('click', () => {
    if (pop_out.classList.contains('pop-out-animation')) {
        city_popout_close();
    }
});

const nonCityPopout = document.querySelector('.noncity-popout');
nonCityPopout.addEventListener('click', (event) => {
    //If non city popout is clicked, doesn't hide it
    event.stopPropagation();
});

// Open pop out where a cursor is
function noncity_pop_out_open(cursorX, cursorY) {
    nonCityPopout.style.left = `${cursorX}px`;
    nonCityPopout.style.top = `${cursorY}px`;
    nonCityPopout.style.display = 'block';
}
document.addEventListener('click', function () {
    // Hides non city popout when clicked anywhere
    nonCityPopout.style.display = 'none';
});

//|-------------------------------------------------------------------------------------------------|
//|                        Player changing game data - interactions                                 |
//|-------------------------------------------------------------------------------------------------|

// Function checking if you can afford to build a certain building

function checkIfCanAfford(buildingType) {
    const buildingCost = buildingsCollection[buildingType].cost;
    return Object.entries(buildingCost).every(([materialType, cost]) => resources[materialType] >= cost);
}

//Function building a building

async function buildABuilding(buildingType, cityName, city) {
    //Updating firebase
    const buildingCost = buildingsCollection[buildingType].cost; //Extracts the building cost array
    for (const r in buildingCost) {
        resources[r] -= buildingCost[r];
    } //Loop updating local player reasources
    await updateDoc(doc(database, 'Games', gameName, 'UserData', userData.displayName), {
        resources: resources,
    });

    //Updating local and firebase resources
    cities[cityName].buildings[buildingType] += 1;
    await updateDoc(doc(database, 'Games', gameName, 'Map', 'Cities'), {
        [`${cityName}.buildings.${buildingType}`]: cities[cityName].buildings[buildingType],
    });

    //Updating user HTML
    const updatedCity = cities[cityName];
    const countHTML = document.getElementById(`${buildingType}-count`);
    countHTML.innerHTML = '';
    countHTML.innerHTML = `${updatedCity.buildings[buildingType]}`;
    //Updating building HTML if this is the first time build of that type
    document.querySelector('#' + buildingType).classList.add('city-building-built');
}

// Building cities
document.querySelector('.build-city').addEventListener('click', async () => {
    //Checks if an army is occupying this hex
    if (userArmyLocations.includes(parseInt(clickedHexId)) || enemyArmyLocations.includes(parseInt(clickedHexId))) {
        alert.innerHTML = 'An army is occupying this hex';
        alert.style.transitionDuration = '0.3s';
        alert.classList.add('alert-box-highlight');
        setTimeout(() => {
            alert.style.transitionDuration = '2s';
            alert.classList.remove('alert-box-highlight');
        }, 1800);
        //Checks for enough resources and builts the city
    } else if (resources.wood >= 100 && resources.people >= 20 && resources.metals >= 5) {
        let known = userDoc;
        const knownAfter = [...new Set([...known.discoveredHexes, ...adjacent(parseInt(clickedHexId))])];
        const addedHexes = adjacent(parseInt(clickedHexId)).filter((item) => !known.discoveredHexes.includes(item));
        addedHexes.forEach((hex) => {
            document.getElementById(hex).classList.add(biomes[hex]);
        });
        if (!known.cityLocations.includes(parseInt(clickedHexId))) {
            await updateDoc(doc(database, 'Games', gameName, 'UserData', userData.displayName), {
                discoveredHexes: knownAfter,
                cityLocations: known.cityLocations.concat(parseInt(clickedHexId)),
            });
            let cityName = userData.displayName + 'city' + (known.cityLocations.length + 1);
            await setDoc(
                doc(database, 'Games', gameName, 'Map', 'Cities'),
                {
                    [cityName]: {
                        owner: userData.displayName,
                        location: parseInt(clickedHexId),
                        buildings: defaultBuildingsCount,
                    },
                },
                { merge: true }
            );
            await updateDoc(doc(database, 'Games', gameName, 'UserData', userData.displayName), {
                resources: {
                    ...resources,
                    wood: resources.wood - 100,
                    metals: resources.metals - 5,
                },
            });
            document.getElementById(clickedHexId).classList.add('user_city');
            await getCurrentData(['city']);
        }
    } else {
        alertMessage("You don't have enough resources to build a city");
    }
    document.querySelector('.noncity-popout').style.display = 'none';
});

//Loader (must be last in the file!)

setTimeout(() => {
    document.querySelector('.loader-wheel').style.display = 'none';
}, 1000);
