'use strict'

import {OrbitControls} from '../node_modules/three/examples/jsm/controls/OrbitControls';

let scene, renderer, camera;
let cube;
let cubes = [];
let controls;
let mouse, raycaster, intersects;
let targets = [];

let numOfCubes = 5; //change count of cubes in scene

let verticesForEdges = {
    0: [0, 6, 8],
    1: [0, 2, 24],
    2: [4, 6, 12],
    3: [2, 4, 28],
    4: [8, 10, 16],
    5: [16, 18, 24],
    6: [10, 12, 20],
    7: [18, 20, 28],
};
let backgroundColor = 0xf2f2f2;

init();
animate();

function init() {
	renderer = new THREE.WebGLRenderer({antialias:true});
	let width = window.innerWidth;
	let height = window.innerHeight;
	renderer.setSize (width, height);
	document.body.appendChild (renderer.domElement);

	scene = new THREE.Scene(); 
    scene.background = new THREE.Color(backgroundColor);
	
	camera = new THREE.PerspectiveCamera (45, width/height, 1, 10000);
	camera.position.x = 20;
	camera.position.y = 20;
	camera.position.z = 100;
	camera.lookAt (new THREE.Vector3(0,0,0));

    controls = new OrbitControls (camera, renderer.domElement);

	for (let i = 0; i < numOfCubes; i++) {
		cubes.push(drawCube());
    }

	renderer.render(scene, camera);

	raycaster = new THREE.Raycaster();
	mouse = new THREE.Vector2();
		
	window.addEventListener ('resize', onWindowResize, false);
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

let oldIndex = -1;
let col = new THREE.Color();

function highlightSegment(idx, indexCube, color) {
	setColor(idx, indexCube, color);
    oldIndex = idx;
}

function setColor(idx, indexCube, color) {
	let idxNear = idx % 2 === 0 ? idx + 1: idx - 1;
    col.set(color);
    let colors = cubes[indexCube].geometry.attributes.color;
    colors.setXYZ(idx, col.r, col.g, col.b);
    colors.setXYZ(idxNear, col.r, col.g, col.b);
    colors.needsUpdate = true;
}

function onDocumentMouseDown( event ) {
	event.preventDefault();

	mouse.set( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1 );
	
	raycaster.setFromCamera(mouse, camera);
    intersects = raycaster.intersectObjects(targets);
    if (intersects.length > 0) {
        let firstId = cubes[0].id;
		let numberCube = (intersects[0].object.id - firstId - (intersects[0].object.id - firstId) % 9) / 9;
        let numOfVertex = intersects[0].object.id - firstId - 1 - 9 * numberCube;
        let color = intersects[0].object.material.color;
        let idx = verticesForEdges[numOfVertex];
        idx.forEach( (id_) => {
            highlightSegment(id_, numberCube, color);
        });
    }
}

function drawCube() {
    let lengthEdge = 10;

    let verticesCube = [
        new THREE.Vector3( 0, 0, 0 ),
        new THREE.Vector3( lengthEdge, 0, 0 ),
        new THREE.Vector3( 0, lengthEdge, 0 ),
        new THREE.Vector3( lengthEdge, lengthEdge, 0 ),
        new THREE.Vector3( 0, 0, -lengthEdge ),
        new THREE.Vector3( lengthEdge, 0, -lengthEdge ),
        new THREE.Vector3( 0, lengthEdge, -lengthEdge ),
        new THREE.Vector3( lengthEdge, lengthEdge, -lengthEdge ),
    ];

    let vertexOrder = [0, 1, 1, 3, 3, 2, 2, 0, 0, 4, 4, 6, 6, 2, 2, 4, 4, 5, 5, 7, 7, 6, 6, 1, 1, 5, 5, 3, 3, 7];

    let material = new THREE.LineBasicMaterial({ linewidth: 1.5, vertexColors: THREE.VertexColors });
    let points = [];

    vertexOrder.forEach( (item) => {
        points.push(verticesCube[item]);
    });

    let initColor = new Float32Array(Array(vertexOrder.length * 3).fill(0, 0, vertexOrder.length * 3));
    let changeColor = [14, 15, 22, 23, 26, 27];

    let geometry = new THREE.BufferGeometry().setFromPoints( points );
    geometry.setAttribute("color", new THREE.BufferAttribute(initColor, 3));
    geometry.setAttribute("colorBase", new THREE.BufferAttribute(initColor, 3));

    cube = new THREE.Line( geometry, material );
    scene.add( cube );
    cube.position.set(Math.random()*20, Math.random()*20, Math.random()*20);

    changeColor.forEach( (idx) => {
        cube.geometry.attributes.color.setXYZ(idx, scene.background.r, scene.background.g, scene.background.b);
    })

    let spheres = [];
	let color = new THREE.Color();

    verticesCube.forEach( (item, index) => {
        color = Math.random() * 0x808008 + 0x808080;

		let sphereGeometry = new THREE.SphereBufferGeometry( 0.5, 32, 32 );
		let sphereMaterial = new THREE.MeshBasicMaterial({ color: color, opacity: 1 });
		spheres[index] = new THREE.Mesh( sphereGeometry, sphereMaterial );
		spheres[index].position.set( item.x + cube.position.x, item.y + cube.position.y, item.z + cube.position.z );
        scene.add(spheres[index]);
        targets.push(spheres[index]);
    });
    return cube;
}