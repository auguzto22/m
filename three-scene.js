// Cena 3D do hero: logo da Blitz em vidro, estrelas cromadas e partículas.
import * as THREE from "./assets/vendor/three.module.min.js";
import { RoomEnvironment } from "./assets/vendor/RoomEnvironment.js";

const canvas = document.querySelector(".hero__3d");
const hero = document.querySelector(".hero");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function supportsWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch { return false; }
}

if (canvas && supportsWebGL()) init();

function roundedRect(w, h, r) {
  const s = new THREE.Shape();
  const x = -w / 2, y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

function starShape() {
  const s = new THREE.Shape();
  const k = 0.13;
  s.moveTo(0, 1);
  s.quadraticCurveTo(k, k, 1, 0);
  s.quadraticCurveTo(k, -k, 0, -1);
  s.quadraticCurveTo(-k, -k, -1, 0);
  s.quadraticCurveTo(-k, k, 0, 1);
  return s;
}

function init() {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.set(0, 0, 11);

  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  scene.add(new THREE.AmbientLight(0xffffff, 0.3));
  const violet = new THREE.PointLight(0x8b7dff, 60, 30);
  violet.position.set(-4, 3, 5);
  scene.add(violet);
  const white = new THREE.PointLight(0xffffff, 40, 30);
  white.position.set(4, -2, 6);
  scene.add(white);

  const root = new THREE.Group();
  scene.add(root);
  const logo = new THREE.Group();
  root.add(logo);

  // Ícone de vidro
  const depth = 0.45, bevel = 0.14;
  const boxGeo = new THREE.ExtrudeGeometry(roundedRect(3, 3, 0.78), {
    depth, bevelEnabled: true, bevelThickness: bevel, bevelSize: 0.12, bevelSegments: 10, curveSegments: 32,
  });
  boxGeo.center();
  const glass = new THREE.MeshPhysicalMaterial({
    color: 0x5446f0, roughness: 0.1, metalness: 0, transmission: 0.35, thickness: 1.4, ior: 1.45,
    clearcoat: 1, clearcoatRoughness: 0.04, iridescence: 0.5, iridescenceIOR: 1.3,
    emissive: 0x2a1fb8, emissiveIntensity: 0.45,
  });
  logo.add(new THREE.Mesh(boxGeo, glass));

  // Raio em fita (mesmas coordenadas do logo.svg, em escala)
  const s = 3 / 448;
  const front = depth / 2 + bevel;
  const boltMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.18, metalness: 0.05, clearcoat: 1, clearcoatRoughness: 0.05 });
  const backMat = new THREE.MeshPhysicalMaterial({ color: 0xd9d4ff, roughness: 0.25, transparent: true, opacity: 0.8, clearcoat: 1 });
  const seg = (a, b, r, mat, z) => {
    const ax = (a[0] - 256) * s, ay = -(a[1] - 256) * s;
    const bx = (b[0] - 256) * s, by = -(b[1] - 256) * s;
    const len = Math.hypot(bx - ax, by - ay);
    const m = new THREE.Mesh(new THREE.CapsuleGeometry(r * s, len, 16, 32), mat);
    m.position.set((ax + bx) / 2, (ay + by) / 2, z);
    m.rotation.z = Math.atan2(by - ay, bx - ax) - Math.PI / 2;
    logo.add(m);
  };
  seg([196, 268], [316, 244], 26, backMat, front + 0.05);
  seg([304, 116], [196, 268], 29, boltMat, front + 0.16);
  seg([316, 244], [208, 396], 29, boltMat, front + 0.16);

  // Estrelas cromadas
  const chrome = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.95, roughness: 0.16, envMapIntensity: 2.6, emissive: 0x2a2440, emissiveIntensity: 0.4 });
  const starGeo = new THREE.ExtrudeGeometry(starShape(), { depth: 0.12, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.05, bevelSegments: 6, curveSegments: 24 });
  starGeo.center();
  const stars = [
    { size: 0.62, radius: 2.6, speed: 0.35, phase: 0.4, tilt: 0.5 },
    { size: 0.38, radius: 2.9, speed: -0.25, phase: 2.6, tilt: -0.3 },
    { size: 0.24, radius: 2.6, speed: 0.5, phase: 4.4, tilt: 0.2 },
    { size: 0.18, radius: 3.1, speed: 0.2, phase: 1.5, tilt: -0.6 },
  ].map((o) => {
    const m = new THREE.Mesh(starGeo, chrome);
    m.scale.setScalar(o.size);
    root.add(m);
    return { m, ...o };
  });

  // Partículas
  const COUNT = 420;
  const pos = new Float32Array(COUNT * 3);
  const col = new Float32Array(COUNT * 3);
  const c1 = new THREE.Color(0x8b7dff), c2 = new THREE.Color(0xffffff);
  for (let i = 0; i < COUNT; i++) {
    const r = 3 + Math.random() * 6;
    const th = Math.random() * Math.PI * 2;
    const ph = Math.acos(2 * Math.random() - 1);
    pos[i * 3] = r * Math.sin(ph) * Math.cos(th);
    pos[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th);
    pos[i * 3 + 2] = r * Math.cos(ph) - 2;
    const c = Math.random() < 0.6 ? c1 : c2;
    col.set([c.r, c.g, c.b], i * 3);
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  pGeo.setAttribute("color", new THREE.BufferAttribute(col, 3));
  const points = new THREE.Points(pGeo, new THREE.PointsMaterial({
    size: 0.035, vertexColors: true, transparent: true, opacity: 0.8, depthWrite: false, blending: THREE.AdditiveBlending,
  }));
  scene.add(points);

  // Tamanho
  const resize = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    const fit = Math.min(1, (w / h) / 0.9);
    root.scale.setScalar(fit * 0.86);
  };
  resize();
  window.addEventListener("resize", resize);

  // Mouse
  let tx = 0, ty = 0, mx = 0, my = 0;
  window.addEventListener("pointermove", (e) => {
    tx = e.clientX / innerWidth - 0.5;
    ty = e.clientY / innerHeight - 0.5;
  }, { passive: true });

  // Pausa fora da tela
  let visible = true;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(canvas);

  // Intro: o logo gira e cresce
  const born = performance.now();
  const clock = new THREE.Clock();

  const render = () => {
    requestAnimationFrame(render);
    if (!visible) return;
    const t = clock.getElapsedTime();
    const intro = Math.min((performance.now() - born) / 1800, 1);
    const ease = 1 - Math.pow(1 - intro, 4);
    const sp = window.__heroProgress || 0;

    mx += (tx - mx) * 0.05;
    my += (ty - my) * 0.05;

    const motion = reduceMotion ? 0 : 1;
    logo.rotation.y = (1 - ease) * Math.PI * 1.5 + motion * (mx * 0.9 + Math.sin(t * 0.6) * 0.18) + sp * Math.PI * 1.2;
    logo.rotation.x = motion * (my * 0.6 + Math.cos(t * 0.5) * 0.08) + sp * 0.6;
    logo.rotation.z = -0.08 + Math.sin(t * 0.4) * 0.04 * motion;
    logo.position.y = Math.sin(t * 1.1) * 0.12 * motion - sp * 1.2;
    logo.scale.setScalar((0.4 + 0.6 * ease) * (1 - sp * 0.35));

    stars.forEach((o) => {
      const a = o.phase + t * o.speed * motion;
      o.m.position.set(Math.cos(a) * o.radius, Math.sin(a) * o.radius * 0.75 + o.tilt, Math.sin(a) * 1.2);
      o.m.rotation.set(t * 0.3, t * (0.8 + o.size), t * 0.2);
      o.m.scale.setScalar(o.size * ease);
    });

    points.rotation.y = t * 0.03 * motion + mx * 0.3;
    points.rotation.x = my * 0.2;

    camera.position.x += (mx * 0.8 - camera.position.x) * 0.05;
    camera.position.y += (-my * 0.5 - camera.position.y) * 0.05;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
  };
  render();
  hero.classList.add("has-3d");
}
