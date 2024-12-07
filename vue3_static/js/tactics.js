import * as THREE from './../lib/three/three.module.js';
import * as view from './three/view.js';

const loader = new THREE.TextureLoader();

// slab
// things already set: x, y, width, length
// things to set: z, height, type, texture, top angle
var slab = {
    "z": 0,
    "height": 0.5,
    //"type": "wireframe",
    "type": "basic",
    "basic": {map: loader.load('./img/slab.png')},
    "top": [0, 0, 0, 0],
};

// lights - mostly just effects the reflections in the orb
var light1 = new THREE.PointLight(0xffffff, 1, 0, 10);
light1.position.set(10, 1, 10);
view.scene.add(light1);
var light2 = new THREE.PointLight(0xffffff, 1, 0, 10);
light2.position.set(-10, 1, 10);
view.scene.add(light2);
var light3 = new THREE.PointLight(0xffffff, 1, 0, 10);
light3.position.set(10, 1, -10);
view.scene.add(light3);
var light4 = new THREE.PointLight(0xffffff, 1, 0, 10);
light4.position.set(-10, 1, -10);
view.scene.add(light4);

// Skybox/fog - again mostly just effects the reflection in the orb
var materialArray = [
    new THREE.MeshBasicMaterial({
        map: loader.load('img/blue.png')
    }),
    new THREE.MeshBasicMaterial({
        map: loader.load('img/blue.png')
    }),
    new THREE.MeshBasicMaterial({
        map: loader.load('img/blue.png')
    }),
    new THREE.MeshBasicMaterial({
        map: loader.load('img/blue.png')
    }),
    new THREE.MeshBasicMaterial({
        map: loader.load('img/blue.png')
    }),
    new THREE.MeshBasicMaterial({
        map: loader.load('img/blue.png')
    })
];
for (var i = 0; i < 6; i++) {
    materialArray[i].side = THREE.BackSide;
}
var skyboxGeom = new THREE.BoxGeometry(500, 500, 500, 1, 1, 1);
var skybox = new THREE.Mesh(skyboxGeom, materialArray);
view.scene.add(skybox);

// map
const map_json = [ // z
    [ // y
        [ // x
            slab, slab, slab, slab, slab, slab, slab, slab, slab, slab
        ],
        [ slab, false, slab, slab, slab, slab, slab, slab, false, slab ],
        [ slab, slab, slab, slab, slab, slab, slab, slab, slab, slab ],
        [ slab, slab, slab, {
            "z": 0,
            "height": 1,
            "type": "basic",
            "basic": { color: 0x888888 },
            "top": [0, 0.5, 0.5, 1.0],
        }, slab, slab, slab, slab, slab, slab ],
        [ slab, slab, slab, slab, slab, slab, slab, slab, slab, slab ],
        [ slab, slab, slab, slab, slab, slab, slab, slab, slab, slab ],
        [ slab, slab, slab, slab, slab, slab, {
            "z": 0,
            "height": 1,
            "type": "maps",
            "basic": [
                loader.load('./img/cathedril.png'),
                loader.load('./img/desert.jpg'),
                loader.load('./img/ouroboros.png'),
                loader.load('./img/temple.jpg'),
                loader.load('./img/village.jpg'),
                loader.load('./img/waterfall 1.jpg'),
            ],
            "top": [1.0, 0.5, 0.5, 0.0],
        }, slab, slab, slab ],
        [ slab, slab, slab, slab, slab, slab, slab, slab, slab, slab ],
        [ slab, false, slab, slab, slab, slab, slab, slab, false, slab ],
        [ slab, slab, slab, slab, slab, slab, slab, slab, slab, slab ],
    ],
    [
        [ false, false, false, false, false, false, false, false, false, false],
        [ false, false, false, false, false, false, false, false, false, false],
        [ false, false, false, false, false, false, false, false, false, false],
        [ false, false, false, false, false, false, false, false, false, false],
        [ false, false, false, false, false, false, false, false, false, false],
        [ false, false, false, false, false, {
            "z": 4,
            "height": 0.5,
            "type": "basic",
            "basic": {map: loader.load('./img/woodland.jpg')},
        }, false, false, false, false],
        [ false, false, false, false, false, false, false, false, false, false],
        [ false, false, false, false, false, false, false, false, false, false],
        [ false, false, false, false, false, false, false, false, false, false],
        [ false, false, false, false, false, false, false, false, false, false],
    ]
];

const actors = [
    {
        "name": "Orb",
        "position": {"x": -2.5, "y": 1.5, "z": 1.1},
        "stats": {
            "Lv.": 0,
            "EXP.": 0,
            "HP": 0,
            "MP": 0,
            "CT": 0,
            "Bravery": 0,
            "Faith": 0,
            "Move": 0,
            "Jump": 0,
            "Speed": 0,
            "Weapon Power": 0,
            "ATK": 0,
            "C-EV": 0,
            "S-EV": 0,
            "A-EV": 0,
	},
        "init": function (scene) {
            const geometry = new THREE.SphereGeometry(0.5, 10, 10);

            const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(128, {
                generateMipmaps: true,
                minFilter: THREE.LinearMipmapLinearFilter
            });

            const orbCamera = new THREE.CubeCamera(0.1, 1000, cubeRenderTarget);
            scene.add(orbCamera);

            const material = new THREE.MeshLambertMaterial({
                color: 0xffffff,
                envMap: cubeRenderTarget.texture,
            });

            const orb = new THREE.Mesh(geometry, material);
            // orb.castShadow = true;
            // orb.receiveShadow = true;
            orb.add(orbCamera);

            orb.position.x = this.position.x;
            orb.position.y = this.position.z;
            orb.position.z = this.position.y;
            this.mesh = orb;
            this.camera = orbCamera;
            scene.add(orb);
            window.clickable.push(this);
        },
        "mesh": null,
        "camera": null,
        "animations": {
            "attack": {
                "play": function (target, step, actor) {
                },
                "frames": 60,
            },
            "cast": {
                "play": function (target, step, actor) {
                },
                "frames": 60,
            },
            "evade": {
                "play": function (target, step, actor) {
                },
                "frames": 60,
            },
            "move": {
                "play": function (target, step, actor) {
                },
                "frames": 60,
            },
            "idle": {
                "play": function (target, step, actor) {
                    actor.mesh.position.y = actor.position.z -
                      (Math.cos(step * 2 * Math.PI / actor.animations.idle.frames) - 1) / 8;

                    actor.mesh.visible = false;
                    actor.camera.update(view.renderer, view.scene);
                    actor.mesh.visible = true;
                },
                "frames": 240,
            },
            "hit": {
                "play": function (target, step, actor) {
                },
                "frames": 60,
            },
            "injured": {
                "play": function (target, step, actor) {
                },
                "frames": 60,
            },
        }
    }
];
actors.map(function (a) {
    a.init(view.scene);
});

function generate_map(map_json, scene) {
    let width = map_json[0].length;
    let length = map_json[0][0].length;
    // [-0.5, 0.5] = 2/2 = [0,   1  ] = 1   - 0.5 = 0.5;
    // [-1, 0, 1] =  3/2 = [0.5, 1.5] = 1.5 - 0.5 =   1;
    for (let z = 0; z < map_json.length; z++) {
        for (let y = 0; y < width; y++) {
            for (let x = 0; x < length; x++) {
                if (map_json[z][y][x]) {
                    let square = map_json[z][y][x];
                    let geometry = new THREE.BoxGeometry(1, square.height || 1, 1);

                    if (square.top && square.top.length == 4) {
                        let positionAttribute = geometry.attributes.position;
                        for (let i = 0; i < positionAttribute.count; i ++) {
                            // access single vertex (x,y,z)
                            var px = positionAttribute.getX(i);
                            var py = positionAttribute.getY(i);
                            var pz = positionAttribute.getZ(i);

                            if (py > 0) {
                                if (px > 0) {
                                    if (pz > 0) {
                                      py += square.top[0];
                                    } else {
                                      py += square.top[1];
                                    }
                                } else {
                                    if (pz > 0) {
                                      py += square.top[2];
                                    } else {
                                      py += square.top[3];
                                    }
                                }
                                // write data back to attribute
                                positionAttribute.setXYZ(i, px, py, pz);
                            }
                        }
                    }

                    if (square.type == "basic") {
                        let basic = square.basic || { color: 0xeeeeee };
                        let material = new THREE.MeshBasicMaterial(basic);
                        let cube = new THREE.Mesh(geometry, material);
                        cube.position.x = x - (length/2) - 0.5;
                        cube.position.y = square.z + square.height / 2;
                        cube.position.z = y - (width/2) - 0.5;
                        scene.add(cube);
                    } else if (square.type == "maps") {
                        let basic = square.basic || [];
                        let cube = new THREE.Mesh(geometry, [
                            new THREE.MeshBasicMaterial({map: square.basic[0]}),
                            new THREE.MeshBasicMaterial({map: square.basic[1]}),
                            new THREE.MeshBasicMaterial({map: square.basic[2]}),
                            new THREE.MeshBasicMaterial({map: square.basic[3]}),
                            new THREE.MeshBasicMaterial({map: square.basic[4]}),
                            new THREE.MeshBasicMaterial({map: square.basic[5]}),
                        ]);
                        cube.position.x = x - (length/2) - 0.5;
                        cube.position.y = square.z + square.height / 2;
                        cube.position.z = y - (width/2) - 0.5;
                        scene.add(cube);
                    } else { // if (square.type == "wireframe" || !square.type) {
                        let geo = new THREE.EdgesGeometry(geometry); // or WireframeGeometry(geometry)
                        let basic = square.basic || { color: 0xffffff, linewidth: 2 };
                        let mat = new THREE.LineBasicMaterial(basic);
                        let wireframe = new THREE.LineSegments(geo, mat);
                        wireframe.position.x = x - (length/2) - 0.5;
                        wireframe.position.y = square.z + square.height / 2;
                        wireframe.position.z = y - (width/2) - 0.5;
                        scene.add(wireframe);
                    }
                }
            }
        }
    }
}
generate_map(map_json, view.scene);

/*
var text2 = document.createElement('div');
text2.style.position = 'absolute';
//text2.style.zIndex = 1;    // if you still don't see the label, try uncommenting this
text2.style.width = 100;
text2.style.height = 100;
text2.innerHTML = "hi there!";
text2.style.top = 200 + 'px';
text2.style.left = 200 + 'px';
document.body.appendChild(text2);
*/

var frame = 0;
view.animate(function () {
    actors.map(function (a) {
        a.animations.idle.play({"x": 0, "y": 0, "z": 0}, frame, a);
    });

    frame++;
    if (frame > 60 * 60) {
        frame = 0;
    }
});

