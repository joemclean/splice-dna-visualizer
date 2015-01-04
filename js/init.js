var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 4000 );

var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

camera.position.z = 120;
controls = new THREE.OrbitControls( camera, renderer.domElement );

var dnaColors = [
  0x3f3854,
  0x25b79b,
  0x497ed6,
  0xff9500,
  0x15ba31
];

var waveformColors = [
  0x202020,
  0x242424,
  0x262626
];

var highlightMaterial = new THREE.MeshBasicMaterial( { color: 0xffffff } );

var lineMaterial = new THREE.LineBasicMaterial({
    color: 0x444444, linewidth: 2
});


var stretchMultiplier = 1.3;
var xOffset = -1 * (songData.duration * stretchMultiplier / 2);
var yOffset = -1 * ((songData.tracks.length * 2.2) / 2);

var rotationAngle = ((Math.PI*2)/songData.tracks.length);
var circleRadius = 20;

var rotationRatio = (1/20);

var spheres = [];

var DnaSphere = function(defaultColor, sphere){
  this.defaultColor = defaultColor;
  this.sphere = sphere;
};

function drawSpheres() {

  //iterate over every track in the song
  for( var i=0; i<songData.tracks.length; i++) {
    var clips = songData.tracks[i].clips;
    console.log(songData.tracks[i].name);

    var material = new THREE.MeshBasicMaterial( { color: dnaColors[i % 5] } );
    radiusOffset = (Math.random()*10);

    //iterate over every clip in the track
    for( var j=0; j<clips.length; j++ ) {

      var clipObject = clips[j];
      var clipLength = clipObject.end - clipObject.start;
      
      //draw a chain of spheres and lines for each clip
      for( var k=0; k<clipLength; k++ ) {

        var yPosition = (Math.sin((rotationAngle * i) + (clipObject.start + k) * rotationRatio)) * (circleRadius + radiusOffset);
        var zPosition = (Math.cos((rotationAngle * i) + (clipObject.start + k) * rotationRatio)) * (circleRadius + radiusOffset);
        
        var sphere_geometry = new THREE.SphereGeometry( 0.7, 8, 8 );
        var sphere = new THREE.Mesh( sphere_geometry, material );
        sphere.position.set( xOffset + (clipObject.start + k) * stretchMultiplier , yPosition, zPosition );

        var dnaSphere = new DnaSphere(material, sphere);

        var line_geometry = new THREE.Geometry();
        line_geometry.vertices.push(new THREE.Vector3( (clipObject.start + k) * stretchMultiplier + xOffset, yPosition, zPosition ));
        line_geometry.vertices.push(new THREE.Vector3( (clipObject.start + k) * stretchMultiplier + xOffset, 0, 0));
        var line = new THREE.Line(line_geometry, lineMaterial);

        scene.add(line);
        scene.add(sphere);

        spheres.push(dnaSphere);
      }
    }
  }
};

//TODO: Render waveform for real

function addWaveform() {
  for ( var i=0; i<songData.duration; i++ ) {
    waveformHeight = (Math.random()*10);
    var geometry = new THREE.CylinderGeometry( waveformHeight, waveformHeight, 1, 32 );
    var material = new THREE.MeshBasicMaterial( {color: waveformColors[i % 3]} );
    var cylinder = new THREE.Mesh( geometry, material );
    cylinder.rotation.z = Math.PI/2
    cylinder.position.set( xOffset+(i*stretchMultiplier), 0,0);
    scene.add( cylinder );
  }
};

var render = function () {
  requestAnimationFrame( render );
  renderer.render(scene, camera);
};

var xAxis = new THREE.Vector3(1, 0, 0);

addWaveform();
drawSpheres();
render();
changeColor();

function changeColor() {
  nIntervId = setInterval(animate, 100);
}


var xCounter = 0;
function animate() {
  console.log("trigger");

  for(var i=0; i<spheres.length; i++) {

    dnaSphere = spheres[i]; 

    if (Math.floor(dnaSphere.sphere.position.x - xOffset) % 6 == xCounter) {
      dnaSphere.sphere.material = highlightMaterial;
    } else {
      dnaSphere.sphere.material = dnaSphere.defaultColor;
    }

  }
  xCounter = xCounter + 1;
  if (xCounter > 5) {
    xCounter = 0;
  };
};

// var xCounter = xOffset;
// function animate() {
//   console.log("trigger");

//   for(var i=0; i<spheres.length; i++) {

//     dnaSphere = spheres[i]; 

//     if (Math.floor(dnaSphere.sphere.position.x) == Math.floor(xCounter)) {
//       dnaSphere.sphere.material = highlightMaterial;
//     } else {
//       dnaSphere.sphere.material = dnaSphere.defaultColor;
//     }

//   }
//   xCounter = xCounter + 1;
//   if (xCounter > -1*(xOffset) {
//     xCounter = xOffset;
//   };
// };
