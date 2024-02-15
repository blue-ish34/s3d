# s3d
A simple 3d API for rendering simple scenes in JavaScript and HTML

WIP
// currently, you can create a canvas element

const canvas = document.getElementById("glCanvas");

// set context

var s3d = s3dContext(canvas);

// call load with a fragment shader url

s3d.load("shader.frag");
