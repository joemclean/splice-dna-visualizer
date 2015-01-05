var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 4000 );

var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

camera.position.z = 120;
controls = new THREE.OrbitControls( camera, renderer.domElement );

var defaultMaterials = [
  0x3f3854, //purple
  0x25b79b, //teal
  0x497ed6, //blue
  0xff9500, //yellow
  0x15ba31  //green
];

var darkMaterials = [
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

var discDefaultMaterial = new THREE.MeshBasicMaterial( { color: 0x202020 } );
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

var dnaNodes = [];

window.onload = function() {

  var playButton = document.getElementById("play-button");
  var stopButton = document.getElementById("stop-button");

  var bounce = document.getElementById('bounce');

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

var DnaNode = function(time, defaultMaterial, darkMaterial, sphere, line){
  var self = this;

  this.nodeTime = nodeTime;
  this.defaultMaterial = defaultMaterial;
  this.darkMaterial = darkMaterial;
  this.sphere = sphere;
  this.line = line;
  this.elapsed = 0;

  this.highlight = function(){
    self.sphere.material = highlightMaterial;
    self.line.material = lineHighlightMaterial;
  };

  this.unhighlight = function(){
    self.sphere.material = defaultMaterial;
    self.line.material = lineMaterial;
  };

  this.chaseOn = function(){
    self.sphere.material = darkMaterial;
  };

  this.chaseOff = function(){
    self.sphere.material = defaultMaterial;
  };
};

var Waveform = function(bounce) {
  var self = this;

  this.waveformDiscs = [];
  this.bounce = bounce;

  //TODO render waveform for real (it's a mockup now)
  this.build = function(){
    for ( var i=0; i<songData.duration; i++ ) {
      waveformHeight = (Math.random()*10);
      var geometry = new THREE.CylinderGeometry( waveformHeight, waveformHeight, 1, 32 );
      //TODO: bring this back
      //var material = new THREE.MeshBasicMaterial( {color: waveformColors[i % 3]} );
      var waveformDisc = new THREE.Mesh( geometry, discDefaultMaterial );
      waveformDisc.rotation.z = Math.PI/2
      waveformDisc.position.set( (i*stretchMultiplier) + xOffset, 0,0);
      scene.add( waveformDisc );
      self.waveformDiscs.push(waveformDisc);
    }
  }

  this.update = function(){
    for ( var i=0; i<self.waveformDiscs.length; i++) {
      waveformDisc = self.waveformDiscs[i];
      //TODO: clean this up
      if (self.bounce.currentTime > 0 && Math.floor((waveformDisc.position.x/stretchMultiplier) + songData.duration/2) < self.bounce.currentTime) {
        waveformDisc.material = highlightMaterial;
      } else {
        waveformDisc.material = discDefaultMaterial;
      }
    }
  };

}



function drawDnaNodes() {

  //iterate over every track in the song
  for( var i=0; i<songData.tracks.length; i++) {
    var clips = songData.tracks[i].clips;
    console.log(songData.tracks[i].name);

    var defaultMaterial = new THREE.MeshBasicMaterial( { color: defaultMaterials[i % 5] } );
    var darkMaterial = new THREE.MeshBasicMaterial( { color: darkMaterials[i % 5] } );
    radiusOffset = (Math.random()*10);

    //iterate over every clip in the track
    for( var j=0; j<clips.length; j++ ) {

      var clipObject = clips[j];
      var clipLength = clipObject.end - clipObject.start;
      
      //draw a chain of dnaNodes (sphere + line) for each clip
      for( var k=0; k<clipLength; k++ ) {

        nodeTime = clipObject.start + k;

        var xPosition = xOffset + (nodeTime * stretchMultiplier);
        var yPosition = (Math.sin((rotationAngle * i) + (nodeTime * rotationRatio))) * (circleRadius + radiusOffset);
        var zPosition = (Math.cos((rotationAngle * i) + (nodeTime * rotationRatio))) * (circleRadius + radiusOffset);
        
        var sphere_geometry = new THREE.SphereGeometry( 0.7, 8, 8 );
        var sphere = new THREE.Mesh( sphere_geometry, defaultMaterial );
        sphere.position.set( xPosition, yPosition, zPosition );

        var line_geometry = new THREE.Geometry();
        line_geometry.vertices.push(new THREE.Vector3( (clipObject.start + k) * stretchMultiplier + xOffset, yPosition, zPosition ));
        line_geometry.vertices.push(new THREE.Vector3( (clipObject.start + k) * stretchMultiplier + xOffset, 0, 0));
        var line = new THREE.Line(line_geometry, lineMaterial);

        var dnaNode = new DnaNode(nodeTime, defaultMaterial, darkMaterial, sphere, line);

        scene.add(line);
        scene.add(sphere);

        dnaNodes.push(dnaNode);
      }
    }
  }
};

//TODO: smarter play w/ pause

function initiatePlay() {
  bounce.currentTime = 0;
  bounce.play();
  playInterval = setInterval(updateTrackLocation, 100);
}


function stopPlay() {
  bounce.pause();
  bounce.currentTime = 0;
  clearInterval(playInterval);
  waveform.update();
  for(var i=0; i<dnaNodes.length; i++) {
    dnaNode = dnaNodes[i];
    dnaNode.elapsed = 0;
    dnaNode.unhighlight();
  }
  xCounter = xOffset;
}

function updateTrackLocation() {
  updateDnaNodes(bounce.currentTime);
  waveform.update();
};

function updateDnaNodes(elapsedTime) {
  console.log(elapsedTime);
  for(var i=0; i<dnaNodes.length; i++) {
    dnaNode = dnaNodes[i]; 
    if (dnaNode.elapsed == 0 && Math.floor(dnaNode.nodeTime) == Math.floor(elapsedTime)) {
      dnaNode.elapsed = 1;
      dnaNode.highlight();
    }
  };
};

function initiateChasers() {
  chaseInterval = setInterval(chase, 100);
}

var chaserCounter = 0;
function chase() {
  for(var i=0; i<dnaNodes.length; i++) {
    dnaNode = dnaNodes[i]; 
    if ((Math.floor(dnaNode.sphere.position.x - xOffset) % 6 == chaserCounter) && dnaNode.elapsed == 0) {
      dnaNode.chaseOn();
    } else if (dnaNode.elapsed == 0) {
      dnaNode.chaseOff();
    }
  }
  chaserCounter++;
  if (chaserCounter > 5) {
    chaserCounter = 0;
  };
};



var render = function () {
  requestAnimationFrame( render );
  renderer.render(scene, camera);
};

waveform = new Waveform(bounce);
waveform.build();
render();
drawDnaNodes();
initiateChasers();