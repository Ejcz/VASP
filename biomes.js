//Random terrain generation
const terrain_types = ["desert","forest","plains","jungle","mountains","ocean"]
var terrain = []

for (let i = 0; i<225; i++) {
	let a = terrain_types[Math.floor(Math.random() * terrain_types.length)]
	terrain.push(a);
} 
console.log(terrain);
export { terrain };