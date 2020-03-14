'use strict'

import {OrbitControls} from '../node_modules/three/examples/jsm/controls/OrbitControls.js';

let scene, renderer, camera;
let cube;
let cubes = [];
let controls;
let mouse, raycaster, intersects;
let targets = [];

let numOfCubes = 5;


init();
animate();

function init() {
	renderer = new THREE.WebGLRenderer({antialias:true});
	let width = window.innerWidth;
	let height = window.innerHeight;
	renderer.setSize (width, height);
	document.body.appendChild (renderer.domElement);

	scene = new THREE.Scene(); 
	scene.background = new THREE.Color('#f2f2f2');
	
	camera = new THREE.PerspectiveCamera (45, width/height, 1, 10000);
	camera.position.x = 20;
	camera.position.y = 20;
	camera.position.z = 100;
	camera.lookAt (new THREE.Vector3(0,0,0));

	controls = new OrbitControls (camera, renderer.domElement);

	for (let i = 0; i < numOfCubes; i++) {
		cubes.push(initCube());
	}
	console.log(cubes);

	renderer.render(scene, camera);

	raycaster = new THREE.Raycaster();
	mouse = new THREE.Vector2();

		
	window.addEventListener ('resize', onWindowResize, false);
	// document.addEventListener( 'mousemove', onDocumentMouseMove, false );
	document.addEventListener( 'mousedown', onDocumentMouseDown, false );
}

function onWindowResize ()
{
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize (window.innerWidth, window.innerHeight);
}

function animate()
{
	controls.update();
    requestAnimationFrame ( animate );  
	renderer.render (scene, camera);
}

// function onDocumentMouseMove( event ) {
// 	event.preventDefault();

// 	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
// 	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

// 	raycaster.setFromCamera(mouse, camera);
//     intersects = raycaster.intersectObjects(targets);
//     if (intersects.length > 0){
// 		intersects[0].object.geometry = new THREE.SphereBufferGeometry( 0.7, 32, 32 );
// 	}
// }

function onDocumentMouseDown( event ) {
	event.preventDefault();

	mouse.set( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1 );
	
	raycaster.setFromCamera(mouse, camera);
    intersects = raycaster.intersectObjects(targets);
    if (intersects.length > 0){
		// console.log(intersects[0].object.id);
		let color = intersects[0].object.material.color;
		let indexCube = (intersects[0].object.id - 12 - (intersects[0].object.id - 12) % 9) / 9;
		// console.log(indexCube);
		cubes[indexCube].material = new THREE.LineBasicMaterial({ color: color, linewidth: 2, });
	}
}

function initCube() {
	let geometry = new THREE.BoxBufferGeometry(10, 10, 10);
	let edgesGeometry = new THREE.EdgesGeometry( geometry );
	let material = new THREE.LineBasicMaterial({ color: 0x000, vertexColors: THREE.VertexColors, linewidth: 2, });
	cube = new THREE.LineSegments( edgesGeometry, material );

	scene.add(cube);
	cube.position.set(Math.random()*20, Math.random()*20, Math.random()*20);

	let position = cube.geometry.attributes.position;
	let vector = new THREE.Vector3();
	let arrayVertices = [];
	let color = new THREE.Color();
	let spheres = [];

	for (let i = 0, l = position.count; i < l; i ++){
		vector.fromBufferAttribute( position, i );
		vector.applyMatrix4( cube.matrixWorld );
		arrayVertices.push([ vector.x, vector.y, vector.z ]);
	}

	let unique = []; 
	arrayVertices.forEach( (item) => {
		let flag = [];
		if (unique.length === 0) {
			unique.push(item);
		}
		else {
			for (let el of unique) {
				if (!(el[0] === item[0] && el[1] === item[1] && el[2] === item[2])) {
					flag.push(true);
				}
				else {
					flag.push(false);
				}
			}
			if (flag.indexOf(false) === -1) {
				unique.push(item);
			}
		}
	} );

	unique.forEach( (item, index) => {
		color = Math.random() * 0x808008 + 0x808080;

		let sphereGeometry = new THREE.SphereBufferGeometry( 0.5, 32, 32 );
		let sphereMaterial = new THREE.MeshBasicMaterial({ color: color, opacity: 1 });
		spheres[index] = new THREE.Mesh( sphereGeometry, sphereMaterial );
		spheres[index].position.set( item[0] + cube.position.x, item[1] + cube.position.y, item[2] + cube.position.z );
		scene.add(spheres[index]);
		targets.push(spheres[index]);
	});

	// console.log(spheres);
	return cube;
}