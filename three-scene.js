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
  const rim = new THREE.PointLight(0xd4d6dc, 60, 30);
  rim.position.set(-4, 3, 5);
  scene.add(rim);
  const white = new THREE.PointLight(0xffffff, 40, 30);
  white.position.set(4, -2, 6);
  scene.add(white);

  const root = new THREE.Group();
  scene.add(root);
  const logo = new THREE.Group();
  root.add(logo);

  // Logo "b" em fita 3D (coordenadas medidas na imagem original da logo)
  const S = 3.6 / 672;
  const P = (x, y) => new THREE.Vector3((x - 634) * S, -(y - 611) * S, 0);
  const ribbon = new THREE.MeshPhysicalMaterial({
    color: 0xffffff, roughness: 0.22, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.08,
    sheen: 1, sheenRoughness: 0.4, sheenColor: new THREE.Color(0xffffff),
  });

  // Haste vertical (fica atrás do laço)
  const top = P(527, 381), bottom = P(527, 660);
  const stem = new THREE.Mesh(new THREE.CapsuleGeometry(62 * S, top.distanceTo(bottom), 24, 48), ribbon);
  stem.position.set(top.x, (top.y + bottom.y) / 2, -0.12);
  logo.add(stem);

  // Laço arredondado (fica na frente)
  const loopCurve = new THREE.CatmullRomCurve3([
    P(470, 742), P(545, 640), P(652, 577), P(745, 632),
    P(808, 706), P(722, 792), P(582, 866), P(500, 818),
  ], true, "centripetal");
  const loop = new THREE.Mesh(new THREE.TubeGeometry(loopCurve, 220, 40 * S, 32, true), ribbon);
  loop.position.z = 0.12;
  logo.add(loop);

  // Quadrado de grafite em volta do "b", como um ícone de app
  const tile = new THREE.Mesh(
    new THREE.ExtrudeGeometry(roundedRect(4.4, 4.4, 1.05), {
      depth: 0.5, bevelEnabled: true, bevelThickness: 0.16, bevelSize: 0.14, bevelSegments: 12, curveSegments: 40,
    }).center(),
    new THREE.MeshPhysicalMaterial({
      color: 0x1c1c20, metalness: 0.35, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.06,
      envMapIntensity: 1.4,
    }),
  );
  tile.position.z = -0.95;
  logo.add(tile);

  // Achata levemente para parecer uma fita
  logo.scale.z = 0.6;

  // Estrelas cromadas
  const chrome = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.95, roughness: 0.16, envMapIntensity: 2.6, emissive: 0x222226, emissiveIntensity: 0.4 });
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
  const c1 = new THREE.Color(0xd4d6dc), c2 = new THREE.Color(0xffffff);
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
    root.scale.setScalar(fit * 0.74);
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
    const k = (0.4 + 0.6 * ease) * (1 - sp * 0.35);
    logo.scale.set(k, k, k * 0.6);

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
