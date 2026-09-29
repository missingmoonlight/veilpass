import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export interface VelarisProps extends React.HTMLAttributes<HTMLDivElement> {
  speed?: number;
  intensity?: number;
  noiseScale?: number;
  grainAmount?: number;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  backgroundColor?: string;
  interactive?: boolean;
}

// Convert hex string "#RRGGBB" to normalized [r, g, b] array (0.0 to 1.0)
function hexToRGB(hex: string): [number, number, number] {
  const cleanHex = hex.replace("#", "");
  const bigint = parseInt(
    cleanHex.length === 3
      ? cleanHex
          .split("")
          .map((c) => c + c)
          .join("")
      : cleanHex,
    16
  );
  const r = ((bigint >> 16) & 255) / 255;
  const g = ((bigint >> 8) & 255) / 255;
  const b = (bigint & 255) / 255;
  return [r, g, b];
}

const VERTEX_SHADER_SOURCE = `
  attribute vec2 position;
  varying vec2 vUv;
  void main() {
    vUv = position * 0.5 + 0.5;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const FRAGMENT_SHADER_SOURCE = `
  precision highp float;
  varying vec2 vUv;
  uniform float u_time;
  uniform vec2 u_resolution;
  uniform vec2 u_mouse;
  uniform vec3 u_color_bg;
  uniform vec3 u_color_primary;
  uniform vec3 u_color_secondary;
  uniform vec3 u_color_accent;
  uniform float u_intensity;
  uniform float u_noise_scale;
  uniform float u_grain;

  // Simplex 2D noise
  vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }

  float snoise(vec2 v){
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
             -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy) );
    vec2 x0 = v -   i + dot(i, C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod(i, 289.0);
    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
    + i.x + vec3(0.0, i1.x, 1.0 ));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m ;
    m = m*m ;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  // Fractional Brownian Motion (Layered Octaves)
  float fbm(vec2 st) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 0.0;
    for (int i = 0; i < 4; i++) {
        value += amplitude * snoise(st);
        st *= 2.1;
        amplitude *= 0.45;
    }
    return value;
  }

  // Subtle Pseudo-random film grain
  float random(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
  }

  void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    st.x *= u_resolution.x / u_resolution.y;

    vec2 mouseOffset = (u_mouse - 0.5) * 0.2;
    vec2 q = vec2(0.0);
    q.x = fbm(st * u_noise_scale + 0.08 * u_time + mouseOffset);
    q.y = fbm(st * u_noise_scale + vec2(1.0) + 0.05 * u_time);

    vec2 r = vec2(0.0);
    r.x = fbm(st + 1.0 * q + vec2(1.7, 9.2) + 0.12 * u_time);
    r.y = fbm(st + 1.0 * q + vec2(8.3, 2.8) + 0.10 * u_time);

    float f = fbm(st + r * u_intensity);

    // Multi-color mixing
    vec3 color = mix(u_color_bg, u_color_primary, clamp((f*f)*4.0, 0.0, 1.0));
    color = mix(color, u_color_secondary, clamp(length(q), 0.0, 1.0));
    color = mix(color, u_color_accent, clamp(length(r.x), 0.0, 1.0) * 0.35);

    // Soft radial vignette glow
    vec2 center = vec2(0.5, 0.5);
    float dist = distance(vUv, center);
    float vignette = smoothstep(0.9, 0.2, dist);
    color *= (0.65 + 0.35 * vignette);

    // Subtle film grain
    float grain = (random(vUv * u_time) - 0.5) * u_grain;
    color += grain;

    gl_FragColor = vec4(color, 1.0);
  }
`;

export function Velaris({
  className,
  children,
  speed = 0.6,
  intensity = 1.0,
  noiseScale = 1.8,
  grainAmount = 0.025,
  primaryColor = "#6C47FF", // Midnight Violet
  secondaryColor = "#00E5FF", // Electric Cyan
  accentColor = "#A855F7", // Neon Purple
  backgroundColor = "#08090d", // Cyber Obsidian
  interactive = true,
  ...props
}: VelarisProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef<[number, number]>([0.5, 0.5]);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", {
      alpha: false,
      antialias: true,
      powerPreference: "high-performance",
    });

    if (!gl) return;

    // Helper: compile shader
    function createShader(glCtx: WebGLRenderingContext, type: number, source: string) {
      const shader = glCtx.createShader(type);
      if (!shader) return null;
      glCtx.shaderSource(shader, source);
      glCtx.compileShader(shader);
      if (!glCtx.getShaderParameter(shader, glCtx.COMPILE_STATUS)) {
        glCtx.deleteShader(shader);
        return null;
      }
      return shader;
    }

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER_SOURCE);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER_SOURCE);
    if (!vertexShader || !fragmentShader) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      return;
    }

    gl.useProgram(program);

    // Geometry: Fullscreen quad
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );

    const positionLocation = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    // Uniform locations
    const uTimeLoc = gl.getUniformLocation(program, "u_time");
    const uResolutionLoc = gl.getUniformLocation(program, "u_resolution");
    const uMouseLoc = gl.getUniformLocation(program, "u_mouse");
    const uColorBgLoc = gl.getUniformLocation(program, "u_color_bg");
    const uColorPrimaryLoc = gl.getUniformLocation(program, "u_color_primary");
    const uColorSecondaryLoc = gl.getUniformLocation(program, "u_color_secondary");
    const uColorAccentLoc = gl.getUniformLocation(program, "u_color_accent");
    const uIntensityLoc = gl.getUniformLocation(program, "u_intensity");
    const uNoiseScaleLoc = gl.getUniformLocation(program, "u_noise_scale");
    const uGrainLoc = gl.getUniformLocation(program, "u_grain");

    const bgRgb = hexToRGB(backgroundColor);
    const primaryRgb = hexToRGB(primaryColor);
    const secondaryRgb = hexToRGB(secondaryColor);
    const accentRgb = hexToRGB(accentColor);

    gl.uniform3f(uColorBgLoc, bgRgb[0], bgRgb[1], bgRgb[2]);
    gl.uniform3f(uColorPrimaryLoc, primaryRgb[0], primaryRgb[1], primaryRgb[2]);
    gl.uniform3f(uColorSecondaryLoc, secondaryRgb[0], secondaryRgb[1], secondaryRgb[2]);
    gl.uniform3f(uColorAccentLoc, accentRgb[0], accentRgb[1], accentRgb[2]);
    gl.uniform1f(uIntensityLoc, intensity);
    gl.uniform1f(uNoiseScaleLoc, noiseScale);
    gl.uniform1f(uGrainLoc, grainAmount);

    let startTime = performance.now();

    function resize() {
      if (!canvas || !gl) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = canvas.clientWidth * dpr;
      const height = canvas.clientHeight * dpr;

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
      }
    }

    resize();
    window.addEventListener("resize", resize);

    const handleMouseMove = (e: MouseEvent) => {
      if (!interactive || !canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = 1.0 - (e.clientY - rect.top) / rect.height;
      mouseRef.current = [x, y];
    };

    if (interactive) {
      window.addEventListener("mousemove", handleMouseMove);
    }

    function render() {
      if (!gl || !canvas) return;
      const elapsed = (performance.now() - startTime) * 0.001 * speed;

      gl.uniform1f(uTimeLoc, elapsed);
      gl.uniform2f(uResolutionLoc, canvas.width, canvas.height);
      gl.uniform2f(uMouseLoc, mouseRef.current[0], mouseRef.current[1]);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
      animationFrameRef.current = requestAnimationFrame(render);
    }

    render();

    return () => {
      window.removeEventListener("resize", resize);
      if (interactive) {
        window.removeEventListener("mousemove", handleMouseMove);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [
    speed,
    intensity,
    noiseScale,
    grainAmount,
    primaryColor,
    secondaryColor,
    accentColor,
    backgroundColor,
    interactive,
  ]);

  return (
    <div className={cn("relative overflow-hidden w-full", className)} {...props}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 size-full pointer-events-none opacity-80"
        style={{ zIndex: 0 }}
      />
      <div className="relative z-10 w-full">{children}</div>
    </div>
  );
}

export default Velaris;
