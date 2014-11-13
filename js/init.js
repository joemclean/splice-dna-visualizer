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

var material = new THREE.MeshBasicMaterial( { color: colors[0] } );

var xOffset = -1 * (songData.duration / 2);
var yOffset = -1 * ((songData.tracks.length * 2.2) / 2);

for( var i=0; i<songData.tracks.length; i++) {
  var clips = songData.tracks[i].clips;
  var trackHeight = i * 2.2;
  console.log(songData.tracks[i].name);

  var material = new THREE.MeshBasicMaterial( { color: colors[i % 5] } );

  for( var j=0; j<clips.length; j++ ) {
    var clipObject = clips[j];
    var geometry = new THREE.BoxGeometry( (clipObject.end - clipObject.start), 2, 1 );
    var clipMesh = new THREE.Mesh( geometry, material );
    clipMesh.position.set( (xOffset + clipObject.start*1.3 ) , yOffset + trackHeight, 0);
    scene.add( clipMesh );
  }
}

var render = function () {
  requestAnimationFrame( render );
  renderer.render(scene, camera);
};


render();