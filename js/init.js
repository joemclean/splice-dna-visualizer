var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );

var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

camera.position.z = 60;
controls = new THREE.OrbitControls( camera, renderer.domElement );

var colors = [
  0x3f3854,
  0x25b79b,
  0x497ed6,
  0xff9500,
  0x15ba31
];

var darkColors = [
  0x202020,
  0x242424,
  0x262626
];

var material = new THREE.MeshBasicMaterial( { color: colors[0] } );

var xOffset = -1 * (songData.duration * 1.3 / 2);
var yOffset = -1 * ((songData.tracks.length * 2.2) / 2);

var rotationAngle = ((Math.PI*2)/songData.tracks.length);
var circleRadius = 20;

var spheres = [];


function drawSpheres() {
  for( var i=0; i<songData.tracks.length; i++) {
    var clips = songData.tracks[i].clips;
    var trackHeight = i * 2.2;
    console.log(songData.tracks[i].name);

    var material = new THREE.MeshBasicMaterial( { color: colors[i % 5] } );
    radiusOffset = (Math.random()*10);

    for( var j=0; j<clips.length; j++ ) {
      var clipObject = clips[j];

      var clipLength = clipObject.end - clipObject.start;
      
      for( var k=0; k<clipLength; k++ ) {
        //var geometry = new THREE.BoxGeometry( 1,2,2 );
        var geometry = new THREE.SphereGeometry( 0.7, 8, 8 );
        var sphere = new THREE.Mesh( geometry, material );

        var yPosition = Math.sin((rotationAngle * i) + (clipObject.start + k)/20) * (circleRadius + radiusOffset);
        var zPosition = Math.cos((rotationAngle * i) + (clipObject.start + k)/20) * (circleRadius + radiusOffset);
        
        sphere.position.set( xOffset + (clipObject.start + k) * 1.3 , yPosition, zPosition );
        sphere.rotation.x = rotationAngle *  -i;

        scene.add( sphere );

        spheres.push(sphere);
      }
    }
  }
};

function updateSpheres() { 
  
  for(var i=0; i<spheres.length; i++) {
 
    sphere = spheres[i]; 
 
    //sphere.rotation.x +=  0.1;

  }
 
};

function addWaveform() {
  for ( var i=0; i<songData.duration; i++ ) {
    waveformHeight = (Math.random()*10);
    var geometry = new THREE.CylinderGeometry( waveformHeight, waveformHeight, 1, 32 );
    var material = new THREE.MeshBasicMaterial( {color: darkColors[i % 3]} );
    var cylinder = new THREE.Mesh( geometry, material );
    cylinder.rotation.z = Math.PI/2
    cylinder.position.set( xOffset+(i*1.3), 0,0);
    scene.add( cylinder );
  }
};

var render = function () {
  updateSpheres();
  requestAnimationFrame( render );
  renderer.render(scene, camera);
};

var xAxis = new THREE.Vector3(1, 0, 0);

addWaveform();
drawSpheres();
render();