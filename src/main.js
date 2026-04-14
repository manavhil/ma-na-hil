let scene, camera, renderer, world, player, bots = [];
let clock = new THREE.Clock();
let isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

const botNames = ["Barbie", "Ken", "Skipper", "Midge", "Chelsea"];
const botMessages = ["Hi Barbie!", "Fabulous day!", "So pink!", "Let's go!", "✨💖✨", "Love your outfit!", "Want to visit the DreamHouse?"];

function init() {
    try {
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0xffc0cb);
        scene.fog = new THREE.Fog(0xffc0cb, 40, 400);

        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(0, 5, 15);
        camera.rotation.order = 'YXZ';

        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.shadowMap.enabled = true;
        document.body.appendChild(renderer.domElement);

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
        scene.add(ambientLight);
        const sun = new THREE.DirectionalLight(0xffffff, 0.7);
        sun.position.set(50, 100, 50);
        sun.castShadow = true;
        scene.add(sun);

        world = new World(scene);
        player = new Player(camera, scene);

        createBots();
        setupControls();
        
        window.addEventListener('resize', onWindowResize, false);
        animate();
        
        console.log("BarbieVerse Initialized Successfully! 💖");
    } catch (e) {
        console.error("Initialization Error:", e);
    }
}

function createBots() {
    botNames.forEach((name) => {
        const group = new THREE.Group();
        const body = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.5, 0.5), new THREE.MeshPhongMaterial({ color: 0xff1493 }));
        body.position.y = 0.75;
        group.add(body);
        
        const head = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), new THREE.MeshPhongMaterial({ color: 0xffdbac }));
        head.position.y = 1.75;
        group.add(head);

        group.position.set((Math.random()-0.5)*150, 0, (Math.random()-0.5)*150);
        scene.add(group);
        bots.push({ mesh: group, name: name, nextChat: Math.random()*5000+5000 });
    });
}

function setupControls() {
    const startBtn = document.getElementById('start-btn');
    const inst = document.getElementById('instructions');
    const jumpBtn = document.getElementById('jump-btn');
    const chatInput = document.getElementById('chat-input');
    
    startBtn.onclick = () => {
        inst.classList.add('hidden');
        if (!isMobile) renderer.domElement.requestPointerLock();
    };

    // Touch Camera Rotation
    let touchX, touchY;
    document.addEventListener('touchstart', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON' || e.target.id === 'joystick-base' || e.target.id === 'joystick-knob') return;
        touchX = e.touches[0].pageX;
        touchY = e.touches[0].pageY;
    }, { passive: false });

    document.addEventListener('touchmove', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON' || e.target.id === 'joystick-base' || e.target.id === 'joystick-knob') return;
        const dx = e.touches[0].pageX - touchX;
        const dy = e.touches[0].pageY - touchY;
        camera.rotation.y -= dx * 0.005;
        camera.rotation.x -= dy * 0.005;
        camera.rotation.x = Math.max(-Math.PI/2, Math.min(Math.PI/2, camera.rotation.x));
        touchX = e.touches[0].pageX;
        touchY = e.touches[0].pageY;
    }, { passive: false });

    // Mouse Camera Rotation
    document.addEventListener('mousemove', (e) => {
        if (document.pointerLockElement === renderer.domElement) {
            camera.rotation.y -= e.movementX * 0.002;
            camera.rotation.x -= e.movementY * 0.002;
            camera.rotation.x = Math.max(-Math.PI/2, Math.min(Math.PI/2, camera.rotation.x));
        }
    });

    // Joystick Logic
    const joyBase = document.getElementById('joystick-base');
    const joyKnob = document.getElementById('joystick-knob');
    
    joyBase.addEventListener('touchstart', (e) => {
        e.preventDefault();
    }, { passive: false });

    joyBase.addEventListener('touchmove', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const rect = joyBase.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        let dx = touch.clientX - centerX;
        let dy = touch.clientY - centerY;
        const dist = Math.min(40, Math.sqrt(dx*dx + dy*dy));
        const angle = Math.atan2(dy, dx);
        
        const knobX = Math.cos(angle) * dist;
        const knobY = Math.sin(angle) * dist;
        joyKnob.style.transform = `translate(${knobX}px, ${knobY}px)`;
        
        player.joystickDir.x = knobX / 40;
        player.joystickDir.y = knobY / 40;
    }, { passive: false });

    joyBase.addEventListener('touchend', () => {
        joyKnob.style.transform = `translate(0, 0)`;
        player.joystickDir = { x: 0, y: 0 };
    });

    jumpBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        player.jumpRequested = true;
    }, { passive: false });

    jumpBtn.onclick = () => {
        if (!isMobile) player.jumpRequested = true;
    };
    
    chatInput.onfocus = () => { if(!isMobile) document.exitPointerLock(); };
    chatInput.onkeydown = (e) => {
        if (e.key === 'Enter' && chatInput.value.trim()) {
            addChatMessage("You", chatInput.value);
            chatInput.value = "";
            chatInput.blur();
            if (!isMobile) renderer.domElement.requestPointerLock();
        }
    };
}

function addChatMessage(sender, msg) {
    const chatMessages = document.getElementById('chat-messages');
    const div = document.createElement('div');
    div.style.marginBottom = "5px";
    div.innerHTML = `<strong style="color:#ff1493">${sender}:</strong> ${msg}`;
    chatMessages.prepend(div);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    
    if (player) player.update(world);
    
    bots.forEach(bot => {
        bot.nextChat -= 16; // Approx ms per frame
        if (bot.nextChat <= 0) {
            addChatMessage(bot.name, botMessages[Math.floor(Math.random()*botMessages.length)]);
            bot.nextChat = 10000 + Math.random()*15000;
        }
        // Simple bot bobbing
        bot.mesh.position.y = Math.sin(Date.now() * 0.002) * 0.2;
    });

    renderer.render(scene, camera);
}

try { init(); } catch (e) { console.error("Global error:", e); }