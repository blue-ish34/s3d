var scene = new Shape("box", [1, 1, 1], [.4,1,1]);
scene.intersect("sphere", [1.3], [1,1,.4]);
scene.difference("cylinder", [3, 0.5], [.4,1,1]);
var c = new Shape("cylinder", [3, 0.5], [.4,1,1]).rotate(90, 0);
scene.differenceShape(c);
var c0 = new Shape("cylinder", [3, 0.5], [.4,1,1]).rotate(0, 90);
scene.differenceShape(c0);

var s = new Shape("sphere", [0.4], [.4,1,.4]).move("sin(u_time*2.)/2.-1.5",0,0);
var i = new Shape("sphere", [2.2], [.4,1,1]).move("sin(u_time*2.)/2.-1.5",0,0);

var s0 = new Shape("sphere", [0.4], [.4,1,.4]).move(0,"sin(u_time*2.)/2.-1.5",0);
var i0 = new Shape("sphere", [2.2], [.4,1,1]).move(0,"sin(u_time*2.)/2.-1.5",0);

var s1 = new Shape("sphere", [0.4], [.4,1,.4]).move(0,0,"sin(u_time*2.)/2.-1.5");
var i1 = new Shape("sphere", [2.2], [.4,1,1]).move(0,0,"sin(u_time*2.)/2.-1.5");

var s2 = new Shape("sphere", [0.4], [.4,1,.4]).move("-sin(u_time*2.)/2.+1.5",0,0);
var i2 = new Shape("sphere", [2.2], [.4,1,1]).move("-sin(u_time*2.)/2.+1.5",0,0);

var s3 = new Shape("sphere", [0.4], [.4,1,.4]).move(0,"-sin(u_time*2.)/2.+1.5",0);
var i3 = new Shape("sphere", [2.2], [.4,1,1]).move(0,"-sin(u_time*2.)/2.+1.5",0);

var s4 = new Shape("sphere", [0.4], [.4,1,.4]).move(0,0,"-sin(u_time*2.)/2.+1.5");
var i4 = new Shape("sphere", [2.2], [.4,1,1]).move(0,0,"-sin(u_time*2.)/2.+1.5");

scene.intersectShape(i);
scene.intersectShape(i0);
scene.intersectShape(i1);
scene.intersectShape(i2);
scene.intersectShape(i3);
scene.intersectShape(i4);
scene.unionShape(s);
scene.unionShape(s0);
scene.unionShape(s1);
scene.unionShape(s2);
scene.unionShape(s3);
scene.unionShape(s4);

scene.rotate("u_time*45.", 30);

const canvas = document.getElementById("glCanvas");
var s3d = s3dContext(canvas);
s3d.load_shape(scene);
