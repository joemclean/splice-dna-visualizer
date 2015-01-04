var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 4000 );

var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

camera.position.z = 120;
controls = new THREE.OrbitControls( camera, renderer.domElement );

var dnaColors = [
  0x3f3854, //purple
  0x25b79b, //teal
  0x497ed6, //blue
  0xff9500, //yellow
  0x15ba31  //green
];

var dnaDarkColors = [
  0x322d47,
  0x0ca386,
  0x426ba8,
  0xcf7528,
  0x21a540
];


var waveformColors = [
  0x202020,
  0x242424,
  0x262626
];

var highlightMaterial = new THREE.MeshBasicMaterial( { color: 0xffffff } );
var highlightDarkMaterial = new THREE.MeshBasicMaterial( { color: 0xdddddd } );

var lineMaterial = new THREE.LineBasicMaterial({
    color: 0x444444, linewidth: 2
});

var lineHighlightMaterial = new THREE.LineBasicMaterial({
    color: 0x777777, linewidth: 2
});


var stretchMultiplier = 1.3;
var xOffset = -1 * (songData.duration * stretchMultiplier / 2);
var yOffset = -1 * ((songData.tracks.length * 2.2) / 2);

var rotationAngle = ((Math.PI*2)/songData.tracks.length);
var circleRadius = 20;

var rotationRatio = (1/20);

var spheres = [];


window.onload = function() {

  var playButton = document.getElementById("play-button");
  var stopButton = document.getElementById("stop-button");

  //Set code to run when the link is clicked
  // by assigning a function to "onclick"
  playButton.onclick = function() {
    initiatePlay();
    return false;
  }

  stopButton.onclick = function() {
    stopPlay();
    return false;
  }
}



var DnaSphere = function(dnaColor, dnaDarkColor, sphere, line){
  this.dnaColor = dnaColor;
  this.dnaDarkColor = dnaDarkColor;
  this.sphere = sphere;
  this.line = line;
  this.elapsed = 0;
};

function drawSpheres() {

  //iterate over every track in the song
  for( var i=0; i<songData.tracks.length; i++) {
    var clips = songData.tracks[i].clips;
    console.log(songData.tracks[i].name);

    var dnaColor = new THREE.MeshBasicMaterial( { color: dnaColors[i % 5] } );
    var dnaDarkColor = new THREE.MeshBasicMaterial( { color: dnaDarkColors[i % 5] } );
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
        var sphere = new THREE.Mesh( sphere_geometry, dnaColor );
        sphere.position.set( xOffset + (clipObject.start + k) * stretchMultiplier , yPosition, zPosition );

        var line_geometry = new THREE.Geometry();
        line_geometry.vertices.push(new THREE.Vector3( (clipObject.start + k) * stretchMultiplier + xOffset, yPosition, zPosition ));
        line_geometry.vertices.push(new THREE.Vector3( (clipObject.start + k) * stretchMultiplier + xOffset, 0, 0));
        var line = new THREE.Line(line_geometry, lineMaterial);

        var dnaSphere = new DnaSphere(dnaColor, dnaDarkColor, sphere, line);

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
initiateChasers();
//initiatePlay();

function initiateChasers() {
  chaseInterval = setInterval(animate, 100);
}

function initiatePlay() {
  document.getElementById('bounce').currentTime = 0;
  document.getElementById('bounce').play();
  playInterval = setInterval(updateTrackLocation, 100);
}

var chaserCounter = 0;
function animate() {

  for(var i=0; i<spheres.length; i++) {

    dnaSphere = spheres[i]; 

    if ((Math.floor(dnaSphere.sphere.position.x - xOffset) % 6 == chaserCounter) && dnaSphere.elapsed == 0) {
      dnaSphere.sphere.material = dnaSphere.dnaDarkColor;
    } else if (dnaSphere.elapsed == 0) {
      dnaSphere.sphere.material = dnaSphere.dnaColor;
    }
  }

  chaserCounter++;
  if (chaserCounter > 5) {
    chaserCounter = 0;
  };

};

var xCounter = xOffset;
function updateTrackLocation() {

  for(var i=0; i<spheres.length; i++) {

    dnaSphere = spheres[i]; 
    if (dnaSphere.elapsed == 0 && Math.floor(dnaSphere.sphere.position.x) == Math.floor(xCounter)) {
      dnaSphere.elapsed = 1;
      dnaSphere.sphere.material = highlightMaterial;
      dnaSphere.line.material = lineHighlightMaterial;
      console.log("dnaSphere.sphere.elapsed");
    }

  }
  if (xCounter < -1*(xOffset)) {
    xCounter = xCounter + 0.1;
  };
};

function stopPlay() {
  document.getElementById('bounce').pause();
  clearInterval(playInterval);
  for(var i=0; i<spheres.length; i++) {
    dnaSphere = spheres[i];
    dnaSphere.elapsed = 0;
    dnaSphere.sphere.material = dnaSphere.dnaColor;
    dnaSphere.line.material = lineMaterial;
  }
  xCounter = xOffset;
}





// $("#johnny_button").click(function(){
//     document.getElementById('hallway').pause();
//     $("#johnny_image").animate({marginTop:"+=1000px"});
//     document.getElementById('aah').currentTime = 0;
//     document.getElementById('aah').play();
//   });

//   $("#johnny_image").click(function(){
//     document.getElementById('hallway').currentTime = 0;
//     document.getElementById('hallway').play();
//   });