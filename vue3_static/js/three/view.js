import * as THREE from './../../lib/three/three.module.js';
import { OrbitControls } from './OrbitControls.js';

const scene = new THREE.Scene();

const camera_settings = {
    // fov:    45,
    fov:    75,
    // aspect: 2,  // the canvas default
	aspect: window.innerWidth / window.innerHeight,
    near:   0.1,
    far:    100
};

const canvas = document.getElementById("view");

const camera = new THREE.PerspectiveCamera(...(Object.values(camera_settings)));
camera.position.set(0, 10, 20);

const controls = new OrbitControls(camera, canvas);
controls.target.set(0, 5, 0);
controls.update();


const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true // alpha set to true lets the background be managed through css
});
// renderer.setSize(500, 300);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

function animate(step) {
    function loop() {
        requestAnimationFrame(loop);
        if (typeof step === "function") {
            step();
        }
        renderer.render(scene, camera);
    }
    loop();
}

export {scene, camera_settings, camera, controls, renderer, animate};

// update camera-aspect and renderer-size on window resize
window.addEventListener("resize", function() {
  var winHeight = window.innerHeight,
  winWidth = window.innerWidth;
  camera.aspect = winWidth / winHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(winWidth, winHeight);
}, false);


// find intersections
var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();
window.clickable = [];
window.close_parent = function (btn) {
    btn.parentNode.parentNode.removeChild(btn.parentNode);
} 

// mouse listener
document.addEventListener('mousedown', function(event) {
    var rect = renderer.domElement.getBoundingClientRect();
    mouse.x  =   ( ( event.clientX - rect.left ) / ( rect.width - rect.left ) ) * 2 - 1;
    mouse.y  = - ( ( event.clientY - rect.top  ) / ( rect.bottom - rect.top ) ) * 2 + 1;
  
    raycaster.setFromCamera( mouse, camera );
    const intersects = raycaster.intersectObjects(
        window.clickable.map((c) => c.mesh)
    );

    var selected = document.getElementById("selected");
    if (intersects.length > 0) {
        var clicked = window.clickable.filter(
            (c) => intersects.filter((i) => i.object.uuid == c.mesh.uuid).length > 0
        );

        if (!selected) {
            selected = document.createElement("div");
            selected.className = "hud-elem";
            selected.id = "selected";
            document.body.append(selected);
        }

        var html = "<b>" + clicked[0].name + "</b><button style=\"position: relative; float: right;\" onclick=\"close_parent(this)\">X</button>";
        if (typeof clicked[0].stats === "object") {
            html += "<table>";
            Object.keys(clicked[0].stats).map(function (k) {
                html += "<tr><th>" + k + "</th><td>" + clicked[0].stats[k] + "</td></tr>";
            });
            html += "</table>";
        }
        selected.innerHTML = html;
    } else {
        // if (selected) {
        //     document.body.removeChild(selected);
        // }
    }
}, false );
