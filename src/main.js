// ----------------------------
// Inicialización de Variables:
// ----------------------------
var scene = null,
    camera = null,
    renderer = null,
    controls = null,
    clock = null;

var sound1 = null,
    countPoints = null,
    modelPlay = null,
    modelWorld = null,
    light = null,
    figuresGeo = [],
    isVisible = true;


var points = 0;

var MovingCube          = null,
    collidableMeshList  = [],
    mesh = [],
    collectibleMeshList = [],
    lives               = 3,
    numberToCreate      = 11,
    cont = 0;

var color = new THREE.Color();

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
    createFrontera();
    initGUI();
}

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
    sound1.update(camera);
    movePlayer();
    collisionAnimate();
}

function initBasicElements() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ canvas: document.querySelector("#app") });
    clock = new THREE.Clock();

    // controls = new THREE.OrbitControls(camera, renderer.domElement);
    // controls.update();

    scene.background = new THREE.Color(0x0099ff);
    scene.fog = new THREE.Fog(0xffffff, 0, 750);

    /*var light = new THREE.HemisphereLight( 0xeeeeff, 0x777788, 0.75 );
    light.position.set( 0.5, 1, 0.75 );
    scene.add( light );
    light.CastShadow = true*/

    renderer.setSize(window.innerWidth, window.innerHeight - 4);
    document.body.appendChild(renderer.domElement);

    camera.position.x = 3;
    camera.position.y = 0.5;
    camera.position.z = 1;
}

function initSound() {
    sound1 = new Sound(["./songs/Tokyo_Drift.mp3"], 500, scene, { // radio(10)
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
                    object.scale.set(0.1, 0.1, 0.1);
                    object.position.y = 0;
                    object.position.x = 5;
                    break;

                case "player":
                    modelPlay = object;
                    figuresGeo.push(modelPlay);

                    object.scale.set(0.005, 0.005, 0.005);
                    //object.geometry.center();
                    object.position.x = MovingCube.position.x;
                    object.position.y = MovingCube.position.y;
                    object.position.z = MovingCube.position.z;
                    //object.translate(-0.5);
                    object.rotation.y = Math.PI / 2 + Math.PI / 2;
                    player = object;
                    console.log("Player creado");
                    scene.add(player);
                    //player.geometry.center();
                    //player.translate(-0.5, 0, 0);
                    playerCreated = true;
                    break;
            }
            scene.add(object);
        });

    });
}

function createSpotlight(color) {

    var newObj = new THREE.SpotLight(color, 2);

    newObj.castShadow = true;
    newObj.angle = 0.3;
    newObj.penumbra = 0.2;
    newObj.decay = 10;
    newObj.distance = 200;

    return newObj;

}

function createLight() {

    hemisphereLight = new THREE.HemisphereLight(0x330080, 0x9999ff, 0.3);
    scene.add(hemisphereLight);

    var spotLight1 = createSpotlight(0xcc00ff);
    var spotLight2 = createSpotlight(0x00e6e6);
    var spotLight3 = createSpotlight(0xff80bf);

    spotLight1.position.set(50, 20, 5);
    spotLight2.position.set(10, 10, 65);
    spotLight3.position.set(-70, 30, -45);

    //spotLight1.target = player;
    lightHelper1 = new THREE.SpotLightHelper(spotLight1);
    lightHelper2 = new THREE.SpotLightHelper(spotLight2);
    lightHelper3 = new THREE.SpotLightHelper(spotLight3);

    spotLight1.castShadow = true;
    spotLight2.castShadow = true;
    spotLight3.castShadow = true;

    scene.add(spotLight1, spotLight2);
    // spotLight3);
    scene.add(lightHelper1, lightHelper2, lightHelper3);
    console.log("luces creadas");
    /*var light2 = new THREE.AmbientLight(0xffffff);
    light2.position.set(10, 10, 10);
    scene.add(light2);
    light = new THREE.DirectionalLight(0xffffff, 0, 1000);
    scene.add(light);*/

    // var lighth = new THREE.HemisphereLight(0x99ccff, 0x99e699, 0.8);
    // scene.add(lighth);
    // Create a directional light
    //light = new THREE.DirectionalLight(0xffffdc, 0.5, 100);
    // move the light back and up a bit
    //light.position.set(20, 20, 20);
    // remember to add the light to the scene
    //scene.add(light);

    /*light2 = new THREE.DirectionalLight(0xffffdc, 0.2, 1000);
    light.position.set(20, 20, 20);
    scene.add(light2);*/
}

function initWorld() {
    // Create Island
    //createModel('./modelos/Town/', 'Level.mtl', 'Level.obj', 'world');
    createModel('./modelos/Town/', 'Level.mtl', 'Level.obj', 'world');
    createModel('./modelos/Car/', 'Cartoon_Lowpoly_Car.mtl', 'Cartoon_Lowpoly_Car.obj', 'player');
    // floor

    var floorGeometry = new THREE.PlaneBufferGeometry(2000, 2000, 100, 100);
    floorGeometry.rotateX(-Math.PI / 2);
    floorGeometry = floorGeometry.toNonIndexed(); // ensure each face has unique vertices

    var floorMaterial = new THREE.MeshBasicMaterial({ color: 0x2825FF });
    var floor = new THREE.Mesh(floorGeometry, floorMaterial);
    scene.add(floor);
}

function initGUI() {
  // alert("Esta es nuestra interfaz");
  var gui = new dat.GUI(),
      speed = 0.1;

  parametros ={
      a: "Mario",     // Slect to load different model
      b: true,        // True or False to see the model
      d: 1,f:1,g:1    // Slider intensity light
  };

  // Add parametros to Screen
  //var loadGUI      = gui.add(parametros, 'a', ['Mario','Luigi']).name('Select player');
  var showGUI      = gui.add(parametros, 'b').name('Show Model');
  var intensityGUI = gui.add(parametros, 'd').min(0).max(2).step(speed).name('Intensity Light');

  // Change
  // Select
  

  // true/false
  showGUI.onChange(function(jar){
      isVisible = jar;
      figuresGeo[0].visible =  jar; 
  });

  // Slider
  intensityGUI.onChange(function(jar) {
      light.intensity = jar;
  });

  gui.close();
}
// ----------------------------------
// Función Para mover al jugador:
// ----------------------------------
function movePlayer() {
    var delta = clock.getDelta(); // seconds.
    var moveDistance = 3 * delta; // 200 pixels per second
    var rotateAngle = Math.PI / 2 * delta; // pi/2 radians (90 degrees) per second

    if (figuresGeo.length <= 0)
        movTra = false; // ("No hay player")
    else
        movTra = true; // ("Hay player")

    if (input.right == 1) {
        //camera.rotation.y -= rotSpd;
        MovingCube.rotation.y -= rotSpd;
        player.rotation.y -= rotSpd;
        moveModelAround(movTra, 0.01, 1);
        // modelPlay.rotation.y  -= rotSpd;
    }
    if (input.left == 1) {
        //camera.rotation.y += rotSpd;
        MovingCube.rotation.y += rotSpd;
        player.rotation.y += rotSpd;
        moveModelAround(movTra, 0.01, 2);
        // modelPlay.rotation.y  += rotSpd;
    }

    if (input.up == 1) {
        MovingCube.translateZ(-moveDistance);
        MovingCube.translateZ(-moveDistance);
        // camera.position.z -= Math.cos(camera.rotation.y) * spd;
        // camera.position.x -= Math.sin(camera.rotation.y) * spd;

        // MovingCube.position.z -= Math.cos(camera.rotation.y) * spd;
        // MovingCube.position.x -= Math.sin(camera.rotation.y) * spd;

        // moveModelAround(movTra, 0.01, 3);
        // modelPlay.position.z -= Math.cos(camera.rotation.y) * spd;
        // modelPlay.position.x -= Math.sin(camera.rotation.y) * spd;
    }
    if (input.down == 1) {
        MovingCube.translateZ(moveDistance);
        // camera.position.z += Math.cos(camera.rotation.y) * spd;
        // camera.position.x += Math.sin(camera.rotation.y) * spd;

        // MovingCube.position.z += Math.cos(camera.rotation.y) * spd;
        // MovingCube.position.x += Math.sin(camera.rotation.y) * spd;

        moveModelAround(movTra, 0.01, 4);
        // modelPlay.position.z += Math.cos(camera.rotation.y) * spd;
        // modelPlay.position.x += Math.sin(camera.rotation.y) * spd;
    }

    if (playerCreated) player.position.set(MovingCube.position.x, MovingCube.position.y, MovingCube.position.z)
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

function moveModelAround(movTra, rotationT, caseToDo) {
    /*if (movTra == true)
        caseToDo = caseToDo;
    else
        caseToDo = 0;

    switch (caseToDo) {
        case 1:
            modelPlay.rotation.y -= rotationT;
            modelPlay.position.x = camera.position.x;
            break;
        case 2:
            modelPlay.rotation.y += rotationT;
            break;
        case 3:
            modelPlay.position.z -= Math.cos(camera.rotation.y) * spd;
            modelPlay.position.x -= Math.sin(camera.rotation.y) * spd;
            break;
        case 4:
            modelPlay.position.z += Math.cos(camera.rotation.y) * spd;
            modelPlay.position.x += Math.sin(camera.rotation.y) * spd;
            break;
        default:
            break;
    }
    */
}
// ----------------------------------
// Funciones llamadas desde el index:
// ----------------------------------
function go2Play() {
    document.getElementById('blocker').style.display = 'none';
    document.getElementById('cointainerOthers').style.display = 'block';
    playAudio(x);
    initialiseTimer();
}

function initialiseTimer() {
    var sec = 0;

    function pad(val) { return val > 9 ? val : "0" + val; }

    setInterval(function() {
        document.getElementById("seconds").innerHTML = String(pad(++sec % 60));
        document.getElementById("minutes").innerHTML = String(pad(parseInt(sec / 60, 10)));

        /*if((sec >= 7)){
          if(points<10){
            // console.log("perdio");
            document.getElementById("lost").style.display = "block";
          }else{
            // console.log("gano!");
            document.getElementById("win").style.display = "block";
          }
        }*/
    }, 1000);
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
  //10,13,2,5,-5,1,15,1,16,-3,-13,-4,21,1
  for(k=0;k<10;k++){
      createPickUp(posiblePos[0+xPos],posiblePos[1+yPos]);
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
  
  //  Create texture loader
  //const textureLoader = new THREE.TextureLoader();
  //const texture =  textureLoader.load('./img/boxText.jpg');

  /*const material = new THREE.MeshStandardMaterial( { 
      map: texture,
      wireframe:false 
  } );*/
  const material = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe:false, transparent: true, opacity: 0.5 });

  // create a Mesh containing the geometry and material
  mesh[pickupNum] = new THREE.Mesh( geometry, material );
  

  var randomIdentify = Math.floor(Math.random() * 101);
  mesh[pickupNum].name = cont;
  mesh[pickupNum].id   = "modelToPick"+randomIdentify;
  cont++;

  mesh[pickupNum].position.x = (camera.position.x-2)+xPos;
  mesh[pickupNum].position.y = camera.position.y;
  mesh[pickupNum].position.z = camera.position.z-zPos;
  // add the mesh to the scene object
  collectibleMeshList.push(mesh[pickupNum]);
  scene.add(mesh[pickupNum]);
  console.log(pickupNum);
  console.log(mesh.name);
  //console.log(mesh[pickupNum]);
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
      //scene.add(modelpick[pickupNum]);
      //modelpick[pickupNum].visible = false;
      scene.add(object);
      object.name = 'drop'+pick;
      console.log(object.name);

        });

    });
}
// ----------------------------------
// Funciones llamadas desde el index:
// ----------------------------------
function createPlayerMove() {
    var cubeGeometry = new THREE.CubeGeometry(1, 1, 1, 1, 1, 1);
    var wireMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: false, transparent: true, opacity: 0.5 });
    MovingCube = new THREE.Mesh(cubeGeometry, wireMaterial);
    MovingCube.position.set(camera.position.x, camera.position.y, camera.position.z);
    scene.add(MovingCube);
}

function createFrontera() {
    var cubeGeometry = new THREE.CubeGeometry(12, 5, 12, 1, 1, 1);
    var wireMaterial = new THREE.MeshBasicMaterial({ color: 0xff00ff, wireframe: true, transparent: true, opacity: 0.0 });
    worldWalls = new THREE.Mesh(cubeGeometry, wireMaterial);
    worldWalls.position.set(5, 0, 0);
    //scene.add( worldWalls );
    //collidableMeshList.push(worldWalls);
}

function collisionAnimate() {
    // console.table(collectibleMeshList.name = collectibleMeshList[0], ["name"]);

    var originPoint = MovingCube.position.clone();

    for (var vertexIndex = 0; vertexIndex < MovingCube.geometry.vertices.length; vertexIndex++) {
        var localVertex = MovingCube.geometry.vertices[vertexIndex].clone();
        var globalVertex = localVertex.applyMatrix4(MovingCube.matrix);
        var directionVector = globalVertex.sub(MovingCube.position);

        var ray = new THREE.Raycaster(originPoint, directionVector.clone().normalize());
        var collisionResults = ray.intersectObjects(collidableMeshList);
        var collisionRCollect = ray.intersectObjects(collectibleMeshList);

        if ((collisionResults.length > 0 && collisionResults[0].distance < directionVector.length())) {
            conditionWorld();
        } else {
            document.getElementById("lives").innerHTML = lives; // 'no toco';  
        }

        if (collisionRCollect.length > 0 && collisionRCollect[0].distance < directionVector.length()) {
            document.getElementById("points").innerHTML = points; //"clear "+collisionRCollect[0].object.name;//points;
            //console.log("clear "+collisionRCollect[0].object.id);
            var toErase = scene.getObjectByName('drop'+collisionRCollect[0].object.name);
            toErase.visible = false;
            collisionRCollect[0].object.visible = false;
            //modelpick[cont].visible = false;
            console.log(collisionRCollect[0].object.name);
            playAudio(c);
            points += 1;
            // console.log(points);
        } else {
            document.getElementById("points").innerHTML = points;
        }
    }
}

function conditionWorld() {
    document.getElementById("lives").innerHTML = lives; //'toco, '+ JSON.stringify(collisionResults[0].object.name);//points;
    MovingCube.position.set(posX, 1, posZ);
    if (figuresGeo.length > 0)
        modelPlay.position.set(3, 0.2, 0.6);

    lives = lives - 1;
    if (lives == 0) {
        document.getElementById("lost").style.display = "block";
        document.getElementById("cointainerOthers").style.display = "none";
        pauseAudio(x);
        playAudio(y);
    }
}