'use strict'
import * as THREE from '../node_modules/three/build/three.module.js';

import Stats from '../node_modules/three/examples/jsm/libs/stats.module.js';
import { GUI } from '../node_modules/three/examples/jsm/libs/dat.gui.module.js';
import { OrbitControls } from "../node_modules/three/examples/jsm/controls/OrbitControls.js";

var camera, scene, renderer, stats;

var mesh;
var amount = parseInt( window.location.search.substr( 1 ) ) || 10;
var count = Math.pow( amount, 3 );

var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2( 1, 1 );

var rotationMatrix = new THREE.Matrix4().makeRotationY( 0.1 );
var instanceMatrix = new THREE.Matrix4();
var matrix = new THREE.Matrix4();

init();
animate();

function init() {

    camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 100 );
    camera.position.set( amount, amount, amount );
    camera.lookAt( 0, 0, 0 );

    scene = new THREE.Scene();

    var light = new THREE.HemisphereLight( 0xffffff, 0x000088 );
    light.position.set( - 1, 1.5, 1 );
    scene.add( light );

    var light = new THREE.HemisphereLight( 0xffffff, 0x880000, 0.5 );
    light.position.set( - 1, - 1.5, - 1 );
    scene.add( light );

    var geometry = new THREE.SphereBufferGeometry( 0.5 );
    var material = new THREE.MeshPhongMaterial( { flatShading: true } );

    mesh = new THREE.InstancedMesh( geometry, material, count );

    var i = 0;
    var offset = ( amount - 1 ) / 2;

    var transform = new THREE.Object3D();

    for ( var x = 0; x < amount; x ++ ) {

        for ( var y = 0; y < amount; y ++ ) {

            for ( var z = 0; z < amount; z ++ ) {

                transform.position.set( offset - x, offset - y, offset - z );
                transform.updateMatrix();

                mesh.setMatrixAt( i ++, transform.matrix );

            }

        }

    }

    scene.add( mesh );

    //

    var gui = new GUI();
    gui.add( mesh, 'count', 0, count );

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );

    new OrbitControls( camera, renderer.domElement );

    stats = new Stats();
    document.body.appendChild( stats.dom );

    window.addEventListener( 'resize', onWindowResize, false );
    document.addEventListener( 'mousemove', onMouseMove, false );

}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}

function onMouseMove( event ) {

    event.preventDefault();

    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

}

function animate() {

    requestAnimationFrame( animate );

    render();

}

function render() {
    raycaster.setFromCamera( mouse, camera );
    var intersection = raycaster.intersectObject( mesh );

    if ( intersection.length > 0 ) {

        var instanceId = intersection[ 0 ].instanceId;

        mesh.getMatrixAt( instanceId, instanceMatrix );
        matrix.multiplyMatrices( instanceMatrix, rotationMatrix );

        mesh.setMatrixAt( instanceId, matrix );
        mesh.instanceMatrix.needsUpdate = true;

    }

    renderer.render( scene, camera );

    stats.update();
}