class World {
    constructor(scene) {
        this.scene = scene;
        this.platforms = [];
        this.createBasePlate();
        this.createEnvironment();
    }

    createBasePlate() {
        const geometry = new THREE.PlaneGeometry(600, 600);
        const material = new THREE.MeshPhongMaterial({ 
            color: 0xfff0f5, 
            shininess: 100, 
            specular: 0xffffff 
        });
        const base = new THREE.Mesh(geometry, material);
        base.rotation.x = -Math.PI / 2;
        base.receiveShadow = true;
        this.scene.add(base);
        
        const grid = new THREE.GridHelper(600, 60, 0xff69b4, 0xffc0cb);
        grid.position.y = 0.02;
        this.scene.add(grid);
    }

    createEnvironment() {
        const colors = [0xff1493, 0xff69b4, 0xffb6c1, 0xffffff, 0xdda0dd, 0xffd700];
        
        for (let i = 0; i < 40; i++) {
            const w = Math.random() * 8 + 4;
            const h = Math.random() * 25 + 5;
            const d = Math.random() * 8 + 4;
            const geometry = new THREE.BoxGeometry(w, h, d);
            const material = new THREE.MeshPhongMaterial({
                color: colors[Math.floor(Math.random() * colors.length)],
                shininess: 80
            });
            const cube = new THREE.Mesh(geometry, material);
            
            cube.position.x = (Math.random() - 0.5) * 300;
            cube.position.z = (Math.random() - 0.5) * 300;
            cube.position.y = h / 2;
            cube.castShadow = true;
            cube.receiveShadow = true;
            
            this.scene.add(cube);
            this.platforms.push(cube);
        }

        for (let i = 0; i < 10; i++) {
            const geometry = new THREE.BoxGeometry(6, 1, 6);
            const material = new THREE.MeshPhongMaterial({ 
                color: i % 2 === 0 ? 0xff1493 : 0xffffff
            });
            const platform = new THREE.Mesh(geometry, material);
            platform.position.set(60 + i * 10, 3 + i * 2.5, (Math.sin(i) * 10));
            this.scene.add(platform);
            this.platforms.push(platform);
        }
    }

    checkCollision(position) {
        // Default floor height
        if (position.y < 1.6) return { hit: true, y: 1.6 };
        
        const playerBox = new THREE.Box3( 
            new THREE.Vector3(position.x - 0.5, position.y - 1.6, position.z - 0.5),
            new THREE.Vector3(position.x + 0.5, position.y + 0.2, position.z + 0.5)
        );

        for (let plat of this.platforms) {
            const box = new THREE.Box3().setFromObject(plat);
            
            if (box.intersectsBox(playerBox)) {
                // If we are mostly above the platform, snap to top
                if (position.y - 1.6 > box.max.y - 1.0) {
                    return { hit: true, y: box.max.y + 1.6 };
                }
            }
        }
        return { hit: false };
    }
}