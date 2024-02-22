var scene = new ComplexShape(new BasicShape("sphere", [2.3], [0.131,0.217,0.980]));
scene.difference(new BasicShape("plane", [0,0,1], [0.131,0.217,0.980]));
scene.difference(new BasicShape("sphere", [2], [0.131,0.217,0.980]));

var shape = new ComplexShape(new BasicShape("sphere", [2], [0.980,0.121,0.417]));
shape.difference(new BasicShape("plane", [0,0,1], [0.980,0.121,0.417]));
shape.difference(new BasicShape("sphere", [1.7], [0.980,0.121,0.417]));
shape.rotate("radians(u_time*20.)", "radians(u_time*45.)");
scene.union(shape);

const canvas = document.getElementById("glCanvas");
var s3d = s3dContext(canvas);
s3d.load_shape(scene);
