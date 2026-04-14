class Player {
    constructor(camera, scene) {
        this.camera = camera;
        this.scene = scene;
        this.velocity = new THREE.Vector3();
        this.moveSpeed = 0.25;
        this.jumpForce = 0.28;
        this.gravity = 0.01;
        this.isGrounded = false;
        
        this.keys = {};
        this.joystickDir = { x: 0, y: 0 };
        this.jumpRequested = false;

        window.addEventListener('keydown', (e) => this.keys[e.code] = true);
        window.addEventListener('keyup', (e) => this.keys[e.code] = false);

        // Player Visual Mesh (Local representation)
        const headGeo = new THREE.BoxGeometry(0.6, 0.6, 0.6);
        const headMat = new THREE.MeshPhongMaterial({ color: 0xffdbac });
        this.mesh = new THREE.Mesh(headGeo, headMat);
        this.scene.add(this.mesh);

        // Add some hair/accessories for style
        const hairGeo = new THREE.BoxGeometry(0.65, 0.2, 0.65);
        const hairMat = new THREE.MeshPhongMaterial({ color: 0xffff00 });
        const hair = new THREE.Mesh(hairGeo, hairMat);
        hair.position.y = 0.25;
        this.mesh.add(hair);
    }

    update(world) {
        const inputDir = new THREE.Vector3();
        
        if (this.keys['KeyW'] || this.keys['ArrowUp']) inputDir.z -= 1;
        if (this.keys['KeyS'] || this.keys['ArrowDown']) inputDir.z += 1;
        if (this.keys['KeyA'] || this.keys['ArrowLeft']) inputDir.x -= 1;
        if (this.keys['KeyD'] || this.keys['ArrowRight']) inputDir.x += 1;

        // Merge mobile joystick input
        inputDir.x += this.joystickDir.x;
        inputDir.z += this.joystickDir.y;

        if (inputDir.length() > 0.05) {
            inputDir.normalize();
            const rotation = new THREE.Euler(0, this.camera.rotation.y, 0, 'YXZ');
            inputDir.applyEuler(rotation);
            this.velocity.x = inputDir.x * this.moveSpeed;
            this.velocity.z = inputDir.z * this.moveSpeed;
        } else {
            this.velocity.x *= 0.85;
            this.velocity.z *= 0.85;
        }

        // Gravity
        this.velocity.y -= this.gravity;

        // Jump
        if ((this.keys['Space'] || this.jumpRequested) && this.isGrounded) {
            this.velocity.y = this.jumpForce;
            this.isGrounded = false;
            this.jumpRequested = false;
        }

        // Horizontal move
        this.camera.position.x += this.velocity.x;
        this.camera.position.z += this.velocity.z;
        
        // Vertical move
        this.camera.position.y += this.velocity.y;

        // Collision Check
        const collision = world.checkCollision(this.camera.position);
        if (collision.hit) {
            if (this.velocity.y < 0) {
                this.camera.position.y = collision.y;
                this.velocity.y = 0;
                this.isGrounded = true;
            }
        } else {
            this.isGrounded = false;
        }

        // Update visual mesh
        this.mesh.position.copy(this.camera.position);
        this.mesh.position.y -= 0.5;
        this.mesh.rotation.y = this.camera.rotation.y;

        // Respawn if fallen
        if (this.camera.position.y < -30) {
            this.camera.position.set(0, 10, 0);
            this.velocity.set(0, 0, 0);
        }
    }
}