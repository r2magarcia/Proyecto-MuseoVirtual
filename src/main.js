// ----------------------------
// Inicialización de Variables:
// ----------------------------
var scene = null,
    camera = null,
    renderer = null,
    controls = null,
    clock = null,
    ambientLight=null,
    interval = 5000;

var sound1 = null,
    countPoints = null,
    modelPlay = null,
    modelWorld = null,
    light = null,
    figuresGeo = [],
    isVisible = true;
var dirLight;

var MovingCube          = null,
    collidableMeshList  = [],
    mesh = [],
    collectibleMeshList = [],
    lives               = 3,
    numberToCreate      = 11,
    cont = 0;

var color = new THREE.Color();
var gamewon = false;

var scale = 1;
var rotSpd = 0.05;
var spd    = 0.05;
var input  = {left:0,right:0, up: 0, down: 0};
var pickupCreated = null;
var modelpick = [];
var pickupNum = 0;
var posiblePos = [10,13,2,5,-5,1,15,1,16,-3,-13,-4,21,1];
var dxpos=0;
var dypos=0;

var posX = 3;
var posY = 0.5;
var posZ = 1;
var player = null;
var playerCreated = false;

var
    hemisphereLight;
// ----------------------------
// Funciones de creación init:
// ----------------------------
function start() {
    window.onresize = onWindowResize;
    initScene();
    animate();
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function initScene() {
    initBasicElements(); // Scene, Camera and Render
    createMultiplyPick();
    initSound();         // To generate 3D Audio
    createLight();       // Create light
    initWorld();
    createPlayerMove();
    // initGUI();
}

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
    sound1.update(camera);
    movePlayer();
    // collisionAnimate();

}

function initBasicElements() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ canvas: document.querySelector("#app") });
    clock = new THREE.Clock();

    scene.background = new THREE.Color(0xdfdfdf);;
    scene.fog = new THREE.Fog(0xffffff, 0, 750);

    renderer.setSize(window.innerWidth, window.innerHeight - 4);
    document.body.appendChild(renderer.domElement);

    camera.position.x = 3;
    camera.position.y = 0.5;
    camera.position.z = 1;
}

function initSound() {
    sound1 = new Sound(["./songs/Tokyo_Drift.mp3"], 500, scene, {
        debug: true,
        position: { x: camera.position.x, y: camera.position.y + 10, z: camera.position.z }
    });
}

function createModel(generalPath, pathMtl, pathObj, whatTodraw) {
    var mtlLoader = new THREE.MTLLoader();
    mtlLoader.setTexturePath(generalPath);
    mtlLoader.setPath(generalPath);
    mtlLoader.load(pathMtl, function(materials) {

        materials.preload();

        var objLoader = new THREE.OBJLoader();
        objLoader.setMaterials(materials);
        objLoader.setPath(generalPath);
        objLoader.load(pathObj, function(object) {

            // world/player
            switch (whatTodraw) {
                case "world":
                    modelWorld = object;
                    object.scale.set(0.03, 0.03, 0.03);
                    object.position.y = 0;
                    object.position.x = 5;
                    break;

                case "player":
                    modelPlay = object;
                    figuresGeo.push(modelPlay);

                    object.scale.set(0.005, 0.005, 0.005);
                    object.position.x = MovingCube.position.x;
                    object.position.y = MovingCube.position.y;
                    object.position.z = MovingCube.position.z+2;
                    object.rotation.y = Math.PI / 2 + Math.PI / 2;
                    player = object;
                    
                    scene.add(player);
                    playerCreated = true;
                    break;
            }
            scene.add(object);
        });

    });
}


function createLight() {
    const hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.6 );
    hemiLight.color.setHSL( 0.6, 1, 0.6 );
    hemiLight.groundColor.setHSL( 0.095, 1, 0.75 );
    hemiLight.position.set( 0, 50, 0 );
    scene.add( hemiLight );

    const hemiLightHelper = new THREE.HemisphereLightHelper( hemiLight, 10 );
    scene.add( hemiLightHelper );

    //

    dirLight = new THREE.DirectionalLight( 0xffffff, 1 );
    dirLight.color.setHSL( 0.1, 1, 0.95 );
    dirLight.position.set( - 1, 1.75, 1 );
    dirLight.position.multiplyScalar( 30 );
    scene.add( dirLight );

    dirLight.castShadow = true;

    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;

    const d = 50;

    dirLight.shadow.camera.left = - d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = - d;

    dirLight.shadow.camera.far = 3500;
    dirLight.shadow.bias = - 0.0001;

    const dirLightHelper = new THREE.DirectionalLightHelper( dirLight, 10 );
    scene.add( dirLightHelper );
}

function initWorld() {

    createModel('./modelos/Museo/', 'MuseoProyecto.mtl', 'MuseoProyecto.obj', 'world');
    // createModel('./modelos/Car/', 'Cartoon_Lowpoly_Car.mtl', 'Cartoon_Lowpoly_Car.obj', 'player');

    // floor
    var floorGeometry = new THREE.PlaneBufferGeometry(2000, 2000, 100, 100);
    floorGeometry.rotateX(-Math.PI / 2);
    floorGeometry = floorGeometry.toNonIndexed(); // ensure each face has unique vertices

    var floorMaterial = new THREE.MeshBasicMaterial({ color: 0x383535 });
    var floor = new THREE.Mesh(floorGeometry, floorMaterial);
    scene.add(floor);
}

function initGUI() {

  var gui = new dat.GUI(),
      speed = 0.1;

  parametros ={
      b: 1000,
      d: 1    // Slider intensity light
  };

  // Add parametros to Screen
  var tipmiliseconds = gui.add(parametros, 'b').min(2000).max(7000).step(speed).name("Tip interval")
  var intensityGUI = gui.add(parametros, 'd').min(0).max(2).step(speed).name('Intensity Light');

  intensityGUI.onChange(function(jar) {
      ambientLight.intensity = jar;
  });

  tipmiliseconds.onChange(function(jar){
      interval = jar;
  });

  gui.close();
}
// ----------------------------------
// Función Para mover al jugador:
// ----------------------------------
function movePlayer() {
    var delta = clock.getDelta(); // seconds.
    var moveDistance = 3 * delta; // 200 pixels per second
    if (figuresGeo.length <= 0)
        movTra = false; // ("No hay player")
    else
        movTra = true; // ("Hay player")

    if (input.right == 1) {
        //camera.rotation.y -= rotSpd;
        MovingCube.rotation.y -= rotSpd;
        // player.rotation.y -= rotSpd;
        // modelPlay.rotation.y  -= rotSpd;
    }
    if (input.left == 1) {
        //camera.rotation.y += rotSpd;
        MovingCube.rotation.y += rotSpd;
        // player.rotation.y += rotSpd;
        // modelPlay.rotation.y  += rotSpd;
    }

    if (input.up == 1) {
        MovingCube.translateZ(-moveDistance);
        MovingCube.translateZ(-moveDistance);
    }
    if (input.down == 1) {
        MovingCube.translateZ(moveDistance);
    }

    if (playerCreated){ 
        player.position.set(MovingCube.position.x, MovingCube.position.y, MovingCube.position.z)
        player.translateX(0.6);
    }
    var relativeCameraOffset = new THREE.Vector3(0, 1.5, 3);

    var cameraOffset = relativeCameraOffset.applyMatrix4(MovingCube.matrixWorld);

    camera.position.x = cameraOffset.x;
    camera.position.y = cameraOffset.y;
    camera.position.z = cameraOffset.z;
    camera.lookAt(MovingCube.position);
}

window.addEventListener('keydown', function(e) {
    switch (e.keyCode) {
        case 68:
            input.right = 1;
            break;
        case 65:
            input.left = 1;
            break;
        case 87:
            input.up = 1;
            break;
        case 83:
            input.down = 1;
            break;
        case 27:
            document.getElementById("blocker").style.display = 'block';
            break;
    }
});


window.addEventListener('keyup', function(e) {
    switch (e.keyCode) {
        case 68:
            input.right = 0;
            break;
        case 65:
            input.left = 0;
            break;
        case 87:
            input.up = 0;
            break;
        case 83:
            input.down = 0;
            break;
    }
});

// ----------------------------------
// Funciones llamadas desde el index:
// ----------------------------------
function go2Play() {
    document.getElementById('blocker').style.display = 'none';
    document.getElementById('cointainerOthers').style.display = 'block';
    playAudio(song);
    fuelInteractions();
}

function showInfoCreator() {
    if (document.getElementById("myNameInfo").style.display == "none")
        document.getElementById("myNameInfo").style.display = "block";
    else
        document.getElementById("myNameInfo").style.display = "none";

}

function createMultiplyPick() {
  var xPos = 0
  var yPos = 0

  for(k=0;k<10;k++){
    //   createPickUp(posiblePos[0+xPos],posiblePos[1+yPos]);
      xPos +=2;
      yPos +=2;
  }
}

function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}

function createPickUp(xPos,zPos) {
  // create a geometry
  const geometry = new THREE.BoxBufferGeometry( 0.3, 0.3, 0.3 );
  
  //  Create texture 
  const material = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe:false, transparent: true, opacity: 0.0 });

  // create a Mesh
  mesh[pickupNum] = new THREE.Mesh( geometry, material );
  

  var randomIdentify = Math.floor(Math.random() * 101);
  mesh[pickupNum].name = cont;
  mesh[pickupNum].id   = "modelToPick"+randomIdentify;
  cont++;

  mesh[pickupNum].position.x = (camera.position.x-2)+xPos;
  mesh[pickupNum].position.y = camera.position.y;
  mesh[pickupNum].position.z = camera.position.z-zPos;

  // add the mesh to the scene collisions object
  collectibleMeshList.push(mesh[pickupNum]);
  scene.add(mesh[pickupNum]);
  makeDrop(pickupNum, xPos, zPos);
  

  pickupNum++;
  
}

function makeDrop(pick, xPos, zPos){
  var mtlLoader = new THREE.MTLLoader();
    mtlLoader.setTexturePath("./modelos/Drop/");
    mtlLoader.setPath("./modelos/Drop/");
    mtlLoader.load("Drop.mtl", function (materials) {
      
      materials.preload();
      var objLoader = new THREE.OBJLoader();
      objLoader.setMaterials(materials);
      objLoader.setPath("./modelos/Drop/");
      objLoader.load("Drop.obj", function (object) {
      object.scale.set(0.2, 0.2, 0.2);
      object.position.x = (camera.position.x-2)+xPos;
      object.position.y = 0.6;
      object.position.z = camera.position.z-zPos-3;
      modelpick[pick]=object;
      scene.add(object);
      object.name = 'drop'+pick;

        });

    });
}
// ----------------------------------
// Funciones llamadas desde el index:
// ----------------------------------
function createPlayerMove() {
    var cubeGeometry = new THREE.CubeGeometry(1, 1.6, 2.1, 1, 1, 1);
    var wireMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: false, transparent: true, opacity: 0.0 });
    MovingCube = new THREE.Mesh(cubeGeometry, wireMaterial);
    MovingCube.position.set(camera.position.x, camera.position.y, camera.position.z);
    scene.add(MovingCube);
}

// function collisionAnimate() {

//     var originPoint = MovingCube.position.clone();

//     for (var vertexIndex = 0; vertexIndex < MovingCube.geometry.vertices.length; vertexIndex++) {
//         var localVertex = MovingCube.geometry.vertices[vertexIndex].clone();
//         var globalVertex = localVertex.applyMatrix4(MovingCube.matrix);
//         var directionVector = globalVertex.sub(MovingCube.position);

//         var ray = new THREE.Raycaster(originPoint, directionVector.clone().normalize());
//         var collisionResults = ray.intersectObjects(collidableMeshList);
//         var collisionRCollect = ray.intersectObjects(collectibleMeshList);

//         if (collisionRCollect.length > 0 && collisionRCollect[0].distance < directionVector.length()) {
//             document.getElementById("points").innerHTML = points;
//             var toErase = scene.getObjectByName('drop'+collisionRCollect[0].object.name);
//             toErase.visible = false;
//             collisionRCollect[0].object.visible = false;
//             playAudio(pick);
//             points += 1;
//             if(points == 7){
//                 document.getElementById("win").style.display = "block";
//                 pauseAudio(song);
//                 playAudio(wins);
//                 gamewon=true;
//             }
//             i += 20;
//         } else {
//             document.getElementById("points").innerHTML = points;
//         }
//     }
// }

var i = 100;

function fuelInteractions() {
    if (i == 100 && !gamewon) {
        i = 99;
        var elem = document.getElementById("myBar");
        var width = 99;
        var id = setInterval(frame, 100);

        function frame() {
            if (width <= 0) {
                clearInterval(id);
                i = 0;
                //you loose
                document.getElementById("lost").style.display = "block";
                if(gamewon==false){
                    pauseAudio(song);
                    playAudio(end);
                }
            } else {
                i--;
                width = i;
                elem.style.width = width + "%";
            }
        }
    }

}

// function autoRefreshTip() {
//     var pos = getRandomArbitrary(0, 3);
//     document.getElementById("tips").innerHTML = tips[pos];

// }
// setInterval(autoRefreshTip, interval); // Time is set in milliseconds
// function getRandomArbitrary(min, max) {
//     return Math.floor(Math.random() * (max - min)) + min;
// }