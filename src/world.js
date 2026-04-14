class World {
    constructor(scene) {
        this.scene = scene;
        this.obstacles = [];
        this.createTrack();
        this.createEnvironment();
    }

    createTrack() {
        // Grass Ground
        const grassGeo = new THREE.PlaneGeometry(1000, 1000);
        const grassMat = new THREE.MeshPhongMaterial({ color: 0x43b02a });
        const grass = new THREE.Mesh(grassGeo, grassMat);
        grass.rotation.x = -Math.PI / 2;
        grass.receiveShadow = true;
        this.scene.add(grass);

        // Simple Circular Track
        const trackGeo = new THREE.TorusGeometry(80, 15, 2, 50);
        const trackMat = new THREE.MeshPhongMaterial({ color: 0x444444 });
        const track = new THREE.Mesh(trackGeo, trackMat);
        track.rotation.x = Math.PI / 2;
        track.position.y = 0.05;
        this.scene.add(track);
        
        // Finish Line
        const finishGeo = new THREE.PlaneGeometry(30, 5);
        const finishMat = new THREE.MeshPhongMaterial({ color: 0xffffff });
        const finish = new THREE.Mesh(finishGeo, finishMat);
        finish.rotation.x = -Math.PI / 2;
        finish.position.set(80, 0.1, 0);
        this.scene.add(finish);
    }

    createEnvironment() {
        // Pipes
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

        // Question Blocks
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

    checkCollision(position) {
        // Boundary check
        const dist = Math.sqrt(position.x**2 + position.z**2);
        if (dist > 200) {
            position.set(0, 0.5, 0);
        }

        this.obstacles.forEach(obs => {
            const d = position.distanceTo(obs.position);
            if (d < 2.5) {
                // Bounce back
                const pushDir = position.clone().sub(obs.position).normalize();
                position.add(pushDir.multiplyScalar(0.5));
            }
        });
    }
}