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
        VERTEX_SHADER: vertexShaderSource,
        
        load: function(url)
        {
            // Fetch fragment shader source from file
            fetch(url)
                .then(response => response.text())
                .then(fragmentShaderSource => {
                    initializeWebGL(fragmentShaderSource);
                })
                .catch(error => console.error('Error loading fragment shader:', error));
        }
    }
}
