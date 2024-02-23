# s3d
A simple 3d API for rendering simple scenes in JavaScript and HTML

WIP

For simple loading of a fragment shader:

const canvas = document.getElementById("glCanvas");

// set context

var s3d = s3dContext(canvas);

// call load with a fragment shader url

s3d.load_url("shader.frag");

or

s3d.load_string("string");

else, if you don't want to touch glsl, you can create a new Shape()

Shape("type", [data], [color])

type = ["sphere", "plane", "box", "cylinder"]

data:

"sphere": [radius]

"plane": [vectorX, vectorY, vectorZ] // must be normalized

"box": [vectorX, vectorY, vectorZ] // defines the corner relative to box center

"cylinder": [radius, height]

ex.

var s = new Shape("sphere", [2], [.5,.5,.5]);

color is between 0.0 and 1.0

Modifiers:

s.rotate(x, y); s.move(x, y, z); can be used as transformations

x, y, z can be strings but all numbers in string must be floats or uniforms ex. s.rotate("u_time*45.", 0);

currently, "u_time" u_mouse" "u_resolution" are the only ones alowed (uMouse is also available as defined as (u_mouse.xy/u_resolution.xy)*2.-1.))

custom uniform support is to be added at a later date

Ineractions between shapes:

s.union("type", [data], [color]); s.difference("type", [data], [color]); s.intersect("type", [data], [color]);

you can also call s.unionShape(); s.differenceShape(); s.intersectShape(); passing in any Shape() object;

then, to load the end shape you've created:
s3d.load_shape(s);
