function s3dContext(canvas)
{
    var gl = null;
    // Vertex Shader
    var vertexShaderSource = `
        attribute vec4 a_position;
        void main() {
            gl_Position = a_position;
        }
    `;
    
    // init
    var init = function()
    {
        // Create WebGL context
        gl = canvas.getContext("webgl");
    
        if (!gl) {
            alert("Unable to initialize WebGL. Your browser may not support it.");
        }
    }
    
    init();
    
    // Compile shaders
    var compileShader = function(gl, source, type) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error("An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }

        return shader;
    }
    
    var initializeWebGL = function(fragmentShaderSource) {

        const vertexShader = compileShader(gl, vertexShaderSource, gl.VERTEX_SHADER);
        const fragmentShader = compileShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER);
    
        // Create shader program
        const shaderProgram = gl.createProgram();
        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);
        gl.linkProgram(shaderProgram);
    
        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
            console.error("Unable to initialize the shader program: " + gl.getProgramInfoLog(shaderProgram));
        }
    
        gl.useProgram(shaderProgram);
    
        // Create buffer
        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    
        const positions = [
            -1.0,  1.0,
             1.0,  1.0,
            -1.0, -1.0,
             1.0, -1.0,
        ];
    
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    
        // Specify attribute
        const positionAttributeLocation = gl.getAttribLocation(shaderProgram, "a_position");
        gl.enableVertexAttribArray(positionAttributeLocation);
        gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);
        
        // Set resolution uniform
        const resolutionUniformLocation = gl.getUniformLocation(shaderProgram, "u_resolution");
        gl.uniform2f(resolutionUniformLocation, canvas.width, canvas.height);
    
        // Set mouse uniform
        const mouseUniformLocation = gl.getUniformLocation(shaderProgram, "u_mouse");
        gl.uniform2f(mouseUniformLocation, 0, 0); // initialize mouse position
    
        // Render loop
        let then = 0;
        function render(now) {
            now *= 0.001;  // convert to seconds
            const deltaTime = now - then;
            then = now;
    
            gl.clearColor(0.0, 0.0, 0.0, 1.0);
            gl.clear(gl.COLOR_BUFFER_BIT);
    
            const timeUniformLocation = gl.getUniformLocation(shaderProgram, "u_time");
            gl.uniform1f(timeUniformLocation, now);
    
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    
            requestAnimationFrame(render);
        }
        requestAnimationFrame(render);
    
        // Update mouse position
        canvas.addEventListener('mousemove', e => {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = rect.bottom - e.clientY; // Flip the y-coordinate
            gl.uniform2f(mouseUniformLocation, x, y);
        });
    }
    
    // Public API Methods and Constants
    return context =
    {
        load_url: function(url)
        {
            // Fetch fragment shader source from file
            fetch(url)
                .then(response => response.text())
                .then(fragmentShaderSource => {
                    initializeWebGL(fragmentShaderSource);
                })
                .catch(error => console.error('Error loading url:', error));
        },
        
        load_string: function(string)
        {
            if(!(string instanceof String))
                throw new TypeError('invalid type entered');
            initializeWebGL(string);
        },
        
        load_shape: function(shape)
        {
            if(!(shape instanceof ComplexShape))
                throw new TypeError('invalid type entered');
            initializeWebGL(`
            // Author: Blue
            // Title: Ray Marching SDF testing
            
            #ifdef GL_ES
            precision mediump float;
            #endif
            
            uniform vec2 u_resolution;
            uniform vec2 u_mouse;
            uniform float u_time;
            
            float rand(vec2 co){
                return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
            }
            
            mat3 rotateX(float theta) {
                float c = cos(theta);
                float s = sin(theta);
                return mat3(
                    vec3(c, 0, s),
                    vec3(0, 1, 0),
                    vec3(-s, 0, c)
                );
            }
            
            mat3 rotateY(float theta) {
                float c = cos(theta);
                float s = sin(theta);
                return mat3(
                    vec3(1, 0, 0),
                    vec3(0, c, -s),
                    vec3(0, s, c)
                );
            }
            
            vec4 uSDF(vec4 a, vec4 b) {
                return a.w < b.w? a : b;
            }
            
            vec4 dSDF(vec4 a, vec4 b) {
                return a.w > -b.w? a : vec4(b.xyz, -b.w);
            }
            
            vec4 iSDF(vec4 a, vec4 b) {
                return a.w > b.w? a : b;
            }
            
            float DE(vec3 pos, float Power) {
            	vec3 z = pos;
            	float dr = 1.0;
            	float r = 0.0;
            	for (int i = 0; i < 30 ; i++) {
            		r = length(z);
            		if (r>2.0) break;
            		
            		// convert to polar coordinates
            		float theta = acos(z.z/r);
            		float phi = atan(z.y,z.x);
            		dr =  pow( r, Power-1.0)*Power*dr + 1.0;
            		
            		// scale and rotate the point
            		float zr = pow( r,Power);
            		theta = theta*Power;
            		phi = phi*Power;
            		
            		// convert back to cartesian coordinates
            		z = zr*vec3(sin(theta)*cos(phi), sin(phi)*sin(theta), cos(theta));
            		z+=pos;
            	}
            	return 0.5*log(r)*r/dr;
            }
            
            //https://iquilezles.org/articles/distfunctions/
            float sphereSDF( vec3 p, float s )
            {
              return length(p)-s;
            }
            
            float boxFrameSDF( vec3 p, vec3 b, float e )
            {
                  p = abs(p  )-b;
              vec3 q = abs(p+e)-e;
              return min(min(
                  length(max(vec3(p.x,q.y,q.z),0.0))+min(max(p.x,max(q.y,q.z)),0.0),
                  length(max(vec3(q.x,p.y,q.z),0.0))+min(max(q.x,max(p.y,q.z)),0.0)),
                  length(max(vec3(q.x,q.y,p.z),0.0))+min(max(q.x,max(q.y,p.z)),0.0));
            }
            
            float planeSDF( vec3 p, vec3 n)
            {
              // n must be normalized
              //return p.z;
              return dot(p,n);
            }
            
            vec4 SceneSDF(vec3 cameraPos)
            {
            
                vec2 uMouse = (u_mouse.xy/u_resolution.xy)*2.-1.;
                
                return ${shape.encode(shape.tree)};
            
            }
            vec3 findNormal(vec3 hitPoint)
            {
                vec2 offset = vec2(0.001, 0.0);
                
                float gradientX = (SceneSDF(hitPoint+offset.xyy)-SceneSDF(hitPoint-offset.xyy)).w;
                float gradientY = (SceneSDF(hitPoint+offset.yxy)-SceneSDF(hitPoint-offset.yxy)).w;
                float gradientZ = (SceneSDF(hitPoint+offset.yyx)-SceneSDF(hitPoint-offset.yyx)).w;
                
                return normalize(vec3(gradientX, gradientY, gradientZ));
            }
            
            float shadowMarch(vec3 cameraPos, vec3 ray, float Max_Distance)
            {
                const float Min_Distance = 0.001;
                const int Num_Steps = 128;
                
                float distanceTraveled = 0.;
                vec4 closest;
                float shaded = 1.;
                
                for(int i=0; i<Num_Steps; i++)
                {
                    
                    vec3 currentPos = cameraPos + distanceTraveled*ray;
                    
                    // find distance to travel next loop
                    closest = SceneSDF(currentPos);
                    
                    // go past the light
                    if(distanceTraveled > Max_Distance)
                    {
                        return 1.;
                        //return shaded;
                    }
                    
                    // hit object
                    if(closest.w < Min_Distance)
                    {
                        return 0.5;
                        //break;
                    }
                    
                    // move along ray
                    distanceTraveled += max(closest.w, 0.02);
                    
                    shaded = min(shaded, (closest.w/distanceTraveled));
                }
                return 0.5;
            }
            
            
            vec3 rayMarch(vec3 cameraPos, vec3 ray)
            {
                vec2 uMouse = (u_mouse.xy/u_resolution.xy)*2.-1.;
                float Max_Distance = 64.;
                const float Min_Distance = .01;
                const int Num_Steps = 256;
                
                float distanceTraveled = 0.0;
                vec4 closest;
                
                for(int i=0; i<Num_Steps; i++)
                {
                    
                    vec3 currentPos = cameraPos + distanceTraveled*ray;
                    
                    // find distance to travel next loop
                    closest = SceneSDF(currentPos);
                    
                    // hit object
                    if(closest.w < Min_Distance)
                    {
                        vec3 color = closest.xyz;
                        
                        //surface normal
                        vec3 normal = findNormal(currentPos);
                        
                        //light position
                        vec3 light = vec3(2.0, 2.0, -2.);
                        vec3 lightColor = vec3(1.);
                        
                        light *= rotateX(radians(-uMouse.x*180.));
                        light.zxy *= rotateX(radians(clamp(uMouse.y, -.5,.2))*100.);
                        
                        //vector facing the light
                        vec3 directionToLight = normalize(light-currentPos);
                        
                        
                        // ambient
                        float ambientStrength = 0.1;
                        float ambient = ambientStrength;
                        
                        //diffuse lighting
                        
                        float diffuseStrength = .75;
                        float diffIntensity = max(0.0, dot(normal, directionToLight));
                        float diffuse = diffuseStrength * diffIntensity;
                        
                        //specular lighting
                        
                        float specularStrength = 0.25;
                        float specIntensity = max(0.0, dot(directionToLight, normalize(reflect(ray, normal))));
                        float specular = specularStrength * pow(specIntensity, 32.);
                        
                        color *= (ambient+diffuse+specular)*lightColor;
                        
                        //shadows
                        
                        float dist = shadowMarch(currentPos+normal*.1, directionToLight, length(light-currentPos));
                        
                        /*
                        //if it didn't hit the light
                        if(dist < length(light-currentPos))
                        {
                            color *= .5;
                        }
                        */
                        
                        color *= dist;
                        
                        //gamma correction
                        color = pow(color, vec3(1./2.2));//*3.;///distanceTraveled;
                        
                        return color;
                    }
                    
                    // out of bounds
                    if(distanceTraveled > Max_Distance)
                    {
                        return vec3(0., .6, 0.6);
                    }
                    
                    // move along ray
                    distanceTraveled += closest.w;
                }
                return vec3(0.);
            }
            
            
            
            void main()
            {
                // Normalized pixel coordinates (from -1 to 1)
                vec2 uv = (gl_FragCoord.xy/u_resolution.xy)*2.0-1.0;
                uv*=vec2(u_resolution.x/u_resolution.y, 1.0);
            
                vec3 col = rayMarch(vec3(0.0, 0.0, -5.0), normalize(vec3(uv, 1.0))).xyz;
            
                // Output to screen
                gl_FragColor = vec4(col,1.0);
            }
            `);
        }
    }
}

class BasicShape
{
    constructor(type, data, color)
    {
        for(var e=0; e<data.length; e++)
        {
            data[e] = (data[e]%1==0)?(data[e]+".0"):(data[e]+"");
        }
        for(var e=0; e<color.length; e++)
        {
            color[e] = (color[e]%1==0)?(color[e]+".0"):(color[e]+"");
        }
        this.type = type;
        this.data = data;
        this.color = color;
        this.pos = "cameraPos";
    }
}

class ComplexShape
{
    constructor(obj)
    {
        if(!(obj instanceof BasicShape)) throw new TypeError("invalid type entered");
        this.tree = obj;
    }
    
    difference(obj)
    {
        if(obj instanceof BasicShape)
        {
            this.tree = {type:"difference", child1:this.tree, child2:obj};
        }else if(obj instanceof ComplexShape)
        {
            this.tree = {type:"difference", child1:this.tree, child2:obj.tree};
        }else
        {
            throw new TypeError("invalid type entered");
        }
    }
    
    union(obj)
    {
        if(obj instanceof BasicShape)
        {
            this.tree = {type:"union", child1:this.tree, child2:obj};
        }else if(obj instanceof ComplexShape)
        {
            this.tree = {type:"union", child1:this.tree, child2:obj.tree};
        }else
        {
            throw new TypeError("invalid type entered");
        }
    }
    
    rotate(x,y)
    {
        x = (x%1==0)?(x+".0"):(x+"");
        y = (y%1==0)?(y+".0"):(y+"");
        this.translate(this.tree, `*rotateY(${y})*rotateX(${x})`);
    }
    
    translate(node, translation)
    {
        if(node.child1 != null)
        {
            this.translate(node.child1, translation);
            this.translate(node.child2, translation);
        }else
        {
            //at a leaf
            node.pos += translation;
        }
    }
    
    encode(node)
    {
        if(node.child1 != null)
        {
            var one = this.encode(node.child1);
            var two = this.encode(node.child2);
        }else
        {
            //at a leaf
            if(node.type == "sphere")
                return `vec4(${node.color[0]}, ${node.color[1]}, ${node.color[2]}, sphereSDF(${node.pos}, ${node.data[0]}))`;
            if(node.type == "plane")
                return `vec4(${node.color[0]}, ${node.color[1]}, ${node.color[2]}, planeSDF(${node.pos}, vec3(${node.data[0]}, ${node.data[1]}, ${node.data[2]})))`;
        }
        //not a leaf
        if(node.type == "union")
            return `uSDF(${one}, ${two})`;
        if(node.type == "difference")
            return `dSDF(${one}, ${two})`;
    }
}
