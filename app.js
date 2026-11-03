// Virtual Hospital - Interaction & Presence Logic

document.addEventListener('DOMContentLoaded', () => {
  const scene = document.querySelector('a-scene');
  const introPanel = document.getElementById('intro-panel');
  const startBtn = document.getElementById('start-btn');
  const servicePanel = document.getElementById('service-panel');
  const serviceTitle = document.getElementById('service-title');
  const serviceDesc = document.getElementById('service-desc');
  const closeServiceBtn = document.getElementById('close-service');
  const hud = document.getElementById('hud');
  const locationEl = document.getElementById('location');

  let started = false;

  // Start experience
  startBtn.addEventListener('click', () => {
    introPanel.style.display = 'none';
    if (hud) hud.classList.add('visible');
    started = true;
  });

  // Close service panel
  if (closeServiceBtn) {
    closeServiceBtn.addEventListener('click', () => {
      servicePanel.classList.add('hidden');
    });
  }

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      servicePanel.classList.add('hidden');
      if (document.pointerLockElement) {
        document.exitPointerLock();
      }
    }
  });

  // Interaction handler
  function handleInteraction(el) {
    if (!started) return;

    const title = el.getAttribute('data-title') || 'Service Station';
    const desc = el.getAttribute('data-desc') || 'Service information unavailable.';
    const service = el.getAttribute('data-service') || 'general';

    serviceTitle.textContent = title;
    serviceDesc.textContent = desc;
    servicePanel.classList.remove('hidden');

    const locationMap = {
      reception: 'Reception / Lobby',
      consultation: 'Consultation Room',
      pharmacy: 'Pharmacy',
      emergency: 'Emergency / Triage',
      lab: 'Laboratory',
      patient: 'Patient Ward',
      cafeteria: 'Cafeteria',
      info: 'Information Kiosk'
    };
    if (locationEl) locationEl.textContent = locationMap[service] || 'Hospital';

    // Visual feedback
    el.setAttribute('animation__pulse', {
      property: 'scale',
      to: '1.4 1.4 1.4',
      dur: 200,
      dir: 'alternate',
      loop: 2
    });
  }

  // Scene click (desktop + VR)
  scene.addEventListener('click', (evt) => {
    const el = evt.detail && evt.detail.intersectedEl ? evt.detail.intersectedEl : evt.target;
    if (el && el.classList && el.classList.contains('interactive')) {
      handleInteraction(el);
    }
  });

  // Direct click support
  document.querySelectorAll('.interactive').forEach((el) => {
    el.addEventListener('click', () => handleInteraction(el));
  });

  // Location tracking
  const rig = document.getElementById('rig');
  const zones = [
    { name: 'Lobby / Reception', minX: -10, maxX: 10, minZ: -12, maxZ: 12 },
    { name: 'Main Corridor', minX: -5, maxX: 5, minZ: -25, maxZ: -12 },
    { name: 'Consultation Area', minX: 4, maxX: 12, minZ: -25, maxZ: -14 },
    { name: 'Pharmacy', minX: -12, maxX: -4, minZ: -25, maxZ: -14 },
    { name: 'Emergency', minX: 4, maxX: 13, minZ: -36, maxZ: -25 },
    { name: 'Laboratory', minX: -12, maxX: -4, minZ: -36, maxZ: -25 },
    { name: 'Patient Ward', minX: -6, maxX: 6, minZ: -42, maxZ: -32 },
    { name: 'Cafeteria', minX: 10, maxX: 19, minZ: -17, maxZ: -6 }
  ];

  function updateLocation() {
    if (!rig || !started || !locationEl) return;
    const pos = rig.object3D.position;
    let current = 'Hospital Grounds';

    for (const z of zones) {
      if (pos.x >= z.minX && pos.x <= z.maxX && pos.z >= z.minZ && pos.z <= z.maxZ) {
        current = z.name;
        break;
      }
    }
    locationEl.textContent = current;
  }

  setInterval(updateLocation, 500);

  // Subtle camera bob for presence
  let lastPos = { x: 0, z: 0 };
  const camera = document.getElementById('camera');

  function subtleBob() {
    if (!camera || !started || !rig) return;
    const pos = rig.object3D.position;
    const dx = pos.x - lastPos.x;
    const dz = pos.z - lastPos.z;
    const moving = Math.abs(dx) > 0.01 || Math.abs(dz) > 0.01;

    if (moving && !AFRAME.utils.device.isMobile()) {
      const t = performance.now() * 0.008;
      const bob = Math.sin(t) * 0.015;
      camera.object3D.position.y = 1.6 + bob;
    } else {
      camera.object3D.position.y = 1.6;
    }
    lastPos = { x: pos.x, z: pos.z };
  }

  setInterval(subtleBob, 30);

  console.log('%cVirtual Hospital loaded', 'color:#4fc3f7; font-weight:bold');
  console.log('Controls: WASD + Mouse (PC) | Controllers (VR)');
  console.log('Click / trigger glowing stations to use services.');
});