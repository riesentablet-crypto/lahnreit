/* Lahnreit 1956 · 3D-Figuren
   Lädt three.js erst, wenn eine Figur geöffnet wird. Jede Figur liegt als modelle/<Schlüssel>.js
   (das GLB als Base64), damit es auch ohne Server aus dem Ordner läuft. */
(function () {
  'use strict';
  const LIBS = ['lib/three.min.js', 'lib/GLTFLoader.js', 'lib/OrbitControls.js', 'lib/meshopt_decoder.js'];
  let libsBereit = null;
  let jetzt = null; // { renderer, controls, figur, frame, ... }

  function skript(src) {
    return new Promise((ok, fehler) => {
      const s = document.createElement('script');
      s.src = src;
      s.onload = ok;
      s.onerror = () => fehler(new Error('Datei fehlt: ' + src));
      document.head.appendChild(s);
    });
  }
  function ladeLibs() {
    if (!libsBereit) libsBereit = LIBS.reduce((p, src) => p.then(() => skript(src)), Promise.resolve());
    return libsBereit;
  }
  function ladeDaten(key) {
    window.LAHNREIT_MODELL_DATEN = window.LAHNREIT_MODELL_DATEN || {};
    if (window.LAHNREIT_MODELL_DATEN[key]) return Promise.resolve(window.LAHNREIT_MODELL_DATEN[key]);
    return skript('modelle/' + key + '.js').then(() => window.LAHNREIT_MODELL_DATEN[key]);
  }
  function base64ZuPuffer(b64) {
    const bin = atob(b64);
    const u = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
    return u.buffer;
  }

  function stopp() {
    if (!jetzt) return;
    cancelAnimationFrame(jetzt.frame);
    jetzt.ro.disconnect();
    jetzt.controls.dispose();
    jetzt.figur.traverse((o) => {
      if (o.geometry) o.geometry.dispose();
      if (o.material) o.material.dispose();
    });
    jetzt.renderer.dispose();
    jetzt.renderer.domElement.remove();
    jetzt = null;
  }

  function zeige(buehne, key) {
    stopp();
    const status = buehne.querySelector('.mb-status');
    const meldung = (t) => { if (status) status.textContent = t; };
    meldung('Lädt die Figur …');
    return Promise.all([ladeLibs(), ladeDaten(key)]).then(([, b64]) => new Promise((ok, fehler) => {
      if (!b64) throw new Error('Keine Daten für ' + key);
      const loader = new THREE.GLTFLoader();
      loader.setMeshoptDecoder(MeshoptDecoder);
      loader.parse(base64ZuPuffer(b64), '', (gltf) => ok(gltf), fehler);
    })).then((gltf) => {
      if (!buehne.isConnected) return;
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.outputEncoding = THREE.sRGBEncoding;
      buehne.appendChild(renderer.domElement);
      const szene = new THREE.Scene();
      szene.add(new THREE.HemisphereLight(0xfff4e6, 0x3a3226, 1.15));
      const licht = new THREE.DirectionalLight(0xffffff, 0.75);
      licht.position.set(1.5, 2.5, 2.5);
      szene.add(licht);
      const rueck = new THREE.DirectionalLight(0xcfe0ff, 0.35);
      rueck.position.set(-2, 1.5, -2);
      szene.add(rueck);

      const figur = gltf.scene;
      const box = new THREE.Box3().setFromObject(figur);
      const groesse = box.getSize(new THREE.Vector3());
      const mitte = box.getCenter(new THREE.Vector3());
      figur.position.sub(new THREE.Vector3(mitte.x, box.min.y, mitte.z));
      const dreher = new THREE.Group();
      dreher.add(figur);
      szene.add(dreher);

      const kamera = new THREE.PerspectiveCamera(30, 1, 0.01, 100);
      const h = groesse.y;
      const abstand = (h * 0.62) / Math.tan((30 * Math.PI) / 360);
      kamera.position.set(0, h * 0.58, abstand);
      const controls = new THREE.OrbitControls(kamera, renderer.domElement);
      controls.target.set(0, h * 0.5, 0);
      controls.enablePan = false;
      controls.enableDamping = true;
      controls.minDistance = abstand * 0.35;
      controls.maxDistance = abstand * 1.8;
      controls.minPolarAngle = Math.PI * 0.2;
      controls.maxPolarAngle = Math.PI * 0.62;
      controls.autoRotateSpeed = 1.4;
      controls.update();

      const groesseSetzen = () => {
        const w = buehne.clientWidth, hh = buehne.clientHeight;
        if (!w || !hh) return;
        renderer.setSize(w, hh, false);
        kamera.aspect = w / hh;
        kamera.updateProjectionMatrix();
      };
      const ro = new ResizeObserver(groesseSetzen);
      ro.observe(buehne);
      groesseSetzen();

      jetzt = { renderer, controls, figur, dreher, ro, frame: 0, drehung: null };
      const schleife = (zeit) => {
        if (!jetzt) return;
        const d = jetzt.drehung;
        if (d) {
          const t = Math.min(1, (zeit - d.start) / d.dauer);
          const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
          dreher.rotation.y = d.von + (d.nach - d.von) * e;
          if (t >= 1) jetzt.drehung = null;
        }
        controls.update();
        renderer.render(szene, kamera);
        jetzt.frame = requestAnimationFrame(schleife);
      };
      jetzt.frame = requestAnimationFrame(schleife);
      if (status) status.remove();
    }).catch((e) => {
      meldung('Die Figur ließ sich nicht laden. ' + (e && e.message ? e.message : ''));
    });
  }

  function umdrehen() {
    if (!jetzt) return;
    const von = jetzt.dreher.rotation.y;
    jetzt.drehung = { von, nach: von + Math.PI, start: performance.now(), dauer: 1600 };
  }
  function vonHinten() {
    if (!jetzt) return;
    jetzt.drehung = null;
    jetzt.dreher.rotation.y = Math.PI;
  }
  function langsam(an) {
    if (jetzt) jetzt.controls.autoRotate = an;
  }

  window.LahnreitModell = { zeige, stopp, umdrehen, vonHinten, langsam };
})();
