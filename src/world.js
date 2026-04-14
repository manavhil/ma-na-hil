class World {
    constructor(scene) {
        this.scene = scene;
        this.obstacles = [];
        this.createTrack();
        this.createEnvironment();
        this.createRandomDecorations();
    }

    createTrack() {
        const grassGeo = new THREE.PlaneGeometry(1000, 1000);
        const grassMat = new THREE.MeshPhongMaterial({ color: 0x43b02a });
        const grass = new THREE.Mesh(grassGeo, grassMat);
        grass.rotation.x = -Math.PI / 2;
        grass.receiveShadow = true;
        this.scene.add(grass);

        const trackGeo = new THREE.TorusGeometry(80, 15, 2, 50);
        const trackMat = new THREE.MeshPhongMaterial({ color: 0x444444 });
        const track = new THREE.Mesh(trackGeo, trackMat);
        track.rotation.x = Math.PI / 2;
        track.position.y = 0.05;
        this.scene.add(track);
        
        const finishGeo = new THREE.PlaneGeometry(30, 5);
        const finishMat = new THREE.MeshPhongMaterial({ color: 0xffffff });
        const finish = new THREE.Mesh(finishGeo, finishMat);
        finish.rotation.x = -Math.PI / 2;
        finish.position.set(80, 0.1, 0);
        this.scene.add(finish);
    }

    createEnvironment() {
        const pipeGeo = new THREE.CylinderGeometry(1.5, 1.5, 3, 16);
        const pipeMat = new THREE.MeshPhongMaterial({ color: 0x00a859 });
        
        for (let i = 0; i < 20; i++) {
            const pipe = new THREE.Mesh(pipeGeo, pipeMat);
            const angle = Math.random() * Math.PI * 2;
            const dist = 60 + Math.random() * 40;
            pipe.position.set(Math.cos(angle)*dist, 1.5, Math.sin(angle)*dist);
            this.scene.add(pipe);
            this.obstacles.push(pipe);
        }

        const boxGeo = new THREE.BoxGeometry(2, 2, 2);
        const boxMat = new THREE.MeshPhongMaterial({ color: 0xfbd800 });
        for (let i = 0; i < 10; i++) {
            const box = new THREE.Mesh(boxGeo, boxMat);
            const angle = Math.random() * Math.PI * 2;
            box.position.set(Math.cos(angle)*80, 4, Math.sin(angle)*80);
            this.scene.add(box);
            this.obstacles.push(box);
        }
    }

    createRandomDecorations() {
        // Giant Rotating Star in the center
        const starGeo = new THREE.OctahedronGeometry(6, 0);
        const starMat = new THREE.MeshPhongMaterial({ color: 0xffea00, emissive: 0x333300 });
        const star = new THREE.Mesh(starGeo, starMat);
        star.position.set(0, 15, 0);
        star.onBeforeRender = () => {
            star.rotation.y += 0.03;
            star.position.y = 15 + Math.sin(Date.now() * 0.002) * 2;
        };
        this.scene.add(star);

        // Giant Mushrooms
        const mushStemGeo = new THREE.CylinderGeometry(1, 1.2, 3, 10);
        const mushCapGeo = new THREE.SphereGeometry(3, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2);
        const mushStemMat = new THREE.MeshPhongMaterial({ color: 0xffffff });
        const mushCapMatRed = new THREE.MeshPhongMaterial({ color: 0xff0000 });
        const mushCapMatGreen = new THREE.MeshPhongMaterial({ color: 0x00ff00 });

        for (let i = 0; i < 15; i++) {
            const mush = new THREE.Group();
            const stem = new THREE.Mesh(mushStemGeo, mushStemMat);
            const cap = new THREE.Mesh(mushCapGeo, Math.random() > 0.5 ? mushCapMatRed : mushCapMatGreen);
            cap.position.y = 1.5;
            mush.add(stem);
            mush.add(cap);

            const angle = Math.random() * Math.PI * 2;
            const dist = 110 + Math.random() * 50;
            mush.position.set(Math.cos(angle) * dist, 1.5, Math.sin(angle) * dist);
            mush.scale.setScalar(0.5 + Math.random() * 1.5);
            this.scene.add(mush);
            this.obstacles.push(mush);
        }

        // Floating Clouds
        const cloudGeo = new THREE.SphereGeometry(5, 8, 8);
        const cloudMat = new THREE.MeshPhongMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 });
        for (let i = 0; i < 12; i++) {
            const cloud = new THREE.Mesh(cloudGeo, cloudMat);
            const x = (Math.random() - 0.5) * 300;
            const z = (Math.random() - 0.5) * 300;
            cloud.position.set(x, 40 + Math.random() * 20, z);
            cloud.scale.set(2, 0.8, 1.2);
            this.scene.add(cloud);
        }
    }

    checkCollision(position) {
        const dist = Math.sqrt(position.x**2 + position.z**2);
        if (dist > 300) {
            position.set(0, 0.5, 0);
        }

        this.obstacles.forEach(obs => {
            const d = position.distanceTo(obs.position);
            const radius = (obs.geometry && obs.geometry.type === 'CylinderGeometry') ? 2.5 : 3.5;
            if (d < radius) {
                const pushDir = position.clone().sub(obs.position).normalize();
                position.add(pushDir.multiplyScalar(0.5));
            }
        });
    }
}