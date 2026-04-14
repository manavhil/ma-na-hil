class Kart {
    constructor(scene, color = 0xe60012) {
        this.mesh = new THREE.Group();
        
        // Chassis
        const body = new THREE.Mesh(
            new THREE.BoxGeometry(1.2, 0.5, 2),
            new THREE.MeshPhongMaterial({ color: color })
        );
        body.position.y = 0.4;
        this.mesh.add(body);

        // Seat
        const seat = new THREE.Mesh(
            new THREE.BoxGeometry(0.8, 0.6, 0.5),
            new THREE.MeshPhongMaterial({ color: 0x333333 })
        );
        seat.position.set(0, 0.8, -0.2);
        this.mesh.add(seat);

        // Wheels
        this.wheels = [];
        const wheelGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.2, 12);
        const wheelMat = new THREE.MeshPhongMaterial({ color: 0x111111 });
        const wheelPos = [
            [-0.7, 0.3, 0.7], [0.7, 0.3, 0.7],
            [-0.7, 0.3, -0.7], [0.7, 0.3, -0.7]
        ];

        wheelPos.forEach(pos => {
            const wheel = new THREE.Mesh(wheelGeo, wheelMat);
            wheel.rotation.z = Math.PI / 2;
            wheel.position.set(...pos);
            this.mesh.add(wheel);
            this.wheels.push(wheel);
        });

        scene.add(this.mesh);
    }

    updateWheels(speed = 0) {
        this.wheels.forEach(w => w.rotation.x += speed * 2);
    }
}

class Player {
    constructor(camera, scene) {
        this.camera = camera;
        this.scene = scene;
        this.kart = new Kart(scene, 0xe60012);
        
        this.velocity = 0;
        this.maxSpeed = 0.6;
        this.acceleration = 0.015;
        this.friction = 0.98;
        this.steering = 0;
        this.angle = 0;
        
        this.keys = {};
        this.joystickDir = { x: 0, y: 0 };

        window.addEventListener('keydown', (e) => this.keys[e.code] = true);
        window.addEventListener('keyup', (e) => this.keys[e.code] = false);
    }

    useItem() {
        // Visual effect for "jump/item"
        this.kart.mesh.position.y = 2;
        setTimeout(() => this.kart.mesh.position.y = 0.5, 200);
    }

    update(world) {
        // Acceleration
        if (this.keys['KeyW'] || this.keys['ArrowUp'] || this.joystickDir.y < -0.2) {
            this.velocity += this.acceleration;
        } else if (this.keys['KeyS'] || this.keys['ArrowDown'] || this.joystickDir.y > 0.2) {
            this.velocity -= this.acceleration;
        } else {
            this.velocity *= this.friction;
        }

        this.velocity = Math.max(-this.maxSpeed/2, Math.min(this.maxSpeed, this.velocity));

        // Steering
        if (Math.abs(this.velocity) > 0.01) {
            const steerDir = this.velocity > 0 ? 1 : -1;
            if (this.keys['KeyA'] || this.keys['ArrowLeft'] || this.joystickDir.x < -0.2) {
                this.angle += 0.04 * steerDir;
            }
            if (this.keys['KeyD'] || this.keys['ArrowRight'] || this.joystickDir.x > 0.2) {
                this.angle -= 0.04 * steerDir;
            }
        }

        // Movement
        this.kart.mesh.position.x += Math.sin(this.angle) * this.velocity;
        this.kart.mesh.position.z += Math.cos(this.angle) * this.velocity;
        this.kart.mesh.rotation.y = this.angle;

        // Camera Follow
        const camOffset = new THREE.Vector3(0, 4, -8);
        camOffset.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.angle);
        this.camera.position.lerp(this.kart.mesh.position.clone().add(camOffset), 0.1);
        this.camera.lookAt(this.kart.mesh.position);

        this.kart.updateWheels(this.velocity);

        // Collision
        world.checkCollision(this.kart.mesh.position);
    }
}