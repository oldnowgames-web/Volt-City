/* VOLT CITY — Cidade Aberta | logica do jogo (Three.js r128) */"use strict";

function buildScooter(THREE, scene) {
/* =====================================================
       MATERIAIS
    ===================================================== */

    function mat(color, roughness = 0.4, metalness = 0.3, extra = {}) {
        return new THREE.MeshStandardMaterial({
            color,
            roughness,
            metalness,
            ...extra
        });
    }

    const rubber = mat(0x101419, 0.9, 0.02);
    const rubberDetail = mat(0x293139, 0.84, 0.04);
    const black = mat(0x101820, 0.34, 0.25);
    const darkPlastic = mat(0x222c35, 0.4, 0.35);
    const frameMetal = mat(0x35454f, 0.26, 0.84);
    const titanium = mat(0x8b9da8, 0.24, 0.87);
    const silver = mat(0xcbd9df, 0.18, 0.9);
    const darkMetal = mat(0x202a34, 0.3, 0.82);
    const paint = mat(0x172631, 0.25, 0.72);

    const cyan = mat(0x24d8c2, 0.24, 0.64, {
        emissive: 0x003b34,
        emissiveIntensity: 0.4
    });

    const amber = mat(0xffa927, 0.25, 0.18, {
        emissive: 0x8b3500,
        emissiveIntensity: 0.7
    });

    const headlightMat = mat(0xffffff, 0.18, 0.1, {
        emissive: 0xcaffef,
        emissiveIntensity: 1.9
    });

    const redLightMat = mat(0xff254b, 0.22, 0.08, {
        emissive: 0xff002b,
        emissiveIntensity: 1.8
    });

    const body = new THREE.Group();
    body.name = "VOLT CITY COM PILOTO";
    scene.add(body);

    /* =====================================================
       FUNÇÕES GEOMÉTRICAS
    ===================================================== */

    function mesh(parent, geometry, material, position) {
        const object = new THREE.Mesh(geometry, material);

        if (position) object.position.set(...position);

        object.castShadow = true;
        object.receiveShadow = true;
        parent.add(object);

        return object;
    }

    function box(parent, w, h, d, material, position, rotation) {
        const object = mesh(
            parent,
            new THREE.BoxGeometry(w, h, d),
            material,
            position
        );

        if (rotation) {
            object.rotation.set(
                rotation[0] || 0,
                rotation[1] || 0,
                rotation[2] || 0
            );
        }

        return object;
    }

    function sphere(parent, radius, material, position, scale) {
        const object = mesh(
            parent,
            new THREE.SphereGeometry(radius, 24, 16),
            material,
            position
        );

        if (scale) object.scale.set(...scale);
        return object;
    }

    function cylinderX(parent, radius, depth, x, y, z, material, segments = 32) {
        const object = mesh(
            parent,
            new THREE.CylinderGeometry(
                radius, radius, depth, segments
            ),
            material,
            [x, y, z]
        );

        object.rotation.z = Math.PI / 2;
        return object;
    }

    function rod(parent, a, b, radius, material, segments = 16, endRadius = radius) {
        const start = new THREE.Vector3(...a);
        const end = new THREE.Vector3(...b);
        const direction = end.clone().sub(start);

        const object = mesh(
            parent,
            new THREE.CylinderGeometry(
                endRadius, radius, direction.length(), segments
            ),
            material,
            start.clone().add(end).multiplyScalar(0.5).toArray()
        );

        object.quaternion.setFromUnitVectors(
            new THREE.Vector3(0, 1, 0),
            direction.normalize()
        );

        return object;
    }

    function tube(parent, points, radius, material, segments = 28) {
        const curve = new THREE.CatmullRomCurve3(
            points.map(p => new THREE.Vector3(...p))
        );

        return mesh(
            parent,
            new THREE.TubeGeometry(curve, segments, radius, 8, false),
            material
        );
    }

    function torusX(parent, radius, thickness, x, y, z, material) {
        const object = mesh(
            parent,
            new THREE.TorusGeometry(radius, thickness, 10, 48),
            material,
            [x, y, z]
        );

        object.rotation.y = Math.PI / 2;
        return object;
    }

    function alignedRing(parent, position, direction, radius, thickness, material) {
        const object = mesh(
            parent,
            new THREE.TorusGeometry(radius, thickness, 8, 32),
            material,
            position
        );

        object.quaternion.setFromUnitVectors(
            new THREE.Vector3(0, 0, 1),
            new THREE.Vector3(...direction).normalize()
        );

        return object;
    }

    function canvasTexture(width, height, draw) {
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        draw(ctx, width, height);

        const texture = new THREE.CanvasTexture(canvas);
        texture.encoding = THREE.sRGBEncoding;

        return texture;
    }

    /* =====================================================
       TEXTURAS FEITAS POR CÓDIGO
    ===================================================== */

    const gripTexture = canvasTexture(512, 512, ctx => {
        ctx.fillStyle = "#1b252d";
        ctx.fillRect(0, 0, 512, 512);

        for (let i = -512; i < 1024; i += 16) {
            ctx.strokeStyle = i % 32 === 0 ? "#35434b" : "#111920";
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i + 512, 512);
            ctx.stroke();
        }

        for (let y = 0; y < 512; y += 24) {
            ctx.strokeStyle = "#10171d";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(512, y);
            ctx.stroke();
        }
    });

    const floorTexture = canvasTexture(512, 512, ctx => {
        ctx.fillStyle = "#101720";
        ctx.fillRect(0, 0, 512, 512);

        ctx.strokeStyle = "#1a2631";
        ctx.lineWidth = 1;

        for (let i = 0; i <= 512; i += 64) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, 512);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(512, i);
            ctx.stroke();
        }
    });

    floorTexture.wrapS = THREE.RepeatWrapping;
    floorTexture.wrapT = THREE.RepeatWrapping;
    floorTexture.repeat.set(30, 30);

    const logoTexture = canvasTexture(512, 160, ctx => {
        ctx.fillStyle = "#eaf6ff";
        ctx.font = "900 94px Arial";
        ctx.fillText("VOLT", 12, 106);

        ctx.fillStyle = "#36f1d0";
        ctx.fillRect(330, 28, 13, 79);
        ctx.fillRect(353, 48, 13, 59);
    });

    const displayTexture = canvasTexture(512, 256, ctx => {
        ctx.fillStyle = "#06171b";
        ctx.fillRect(0, 0, 512, 256);

        ctx.strokeStyle = "#1d574f";
        ctx.lineWidth = 4;
        ctx.strokeRect(8, 8, 496, 240);

        ctx.fillStyle = "#50ffdc";
        ctx.font = "bold 24px Arial";
        ctx.fillText("VOLT / CITY", 25, 43);

        ctx.font = "bold 88px Arial";
        ctx.fillText("36.8", 24, 146);

        ctx.font = "bold 26px Arial";
        ctx.fillText("KM/H", 340, 142);

        ctx.fillStyle = "#b9fff0";
        ctx.font = "20px Arial";
        ctx.fillText("BATTERY", 25, 213);

        ctx.fillStyle = "#1b544b";
        ctx.fillRect(135, 188, 320, 23);

        ctx.fillStyle = "#36f1d0";
        ctx.fillRect(140, 192, 245, 15);
    });

    
/* =====================================================
       RODAS DO PATINETE
    ===================================================== */

    const wheel = {
        frontZ: -1.05,
        rearZ: 1.14,
        y: 0.28
    };

    function createWheel(centerZ, isFront) {
        const group = new THREE.Group();
        group.position.set(0, wheel.y, centerZ);
        body.add(group);

        // Pneu de borracha.
        const tire = mesh(
            group,
            new THREE.CylinderGeometry(0.255, 0.255, 0.14, 64),
            rubber,
            [0, 0, 0]
        );

        tire.rotation.z = Math.PI / 2;

        torusX(group, 0.224, 0.046, 0.055, 0, 0, rubber);
        torusX(group, 0.224, 0.046, -0.055, 0, 0, rubber);

        // Sulcos de aderência.
        for (let i = 0; i < 36; i++) {
            const a = i / 36 * Math.PI * 2;

            const tread = box(
                group,
                0.105, 0.018, 0.035,
                rubberDetail,
                [0, Math.cos(a) * 0.263, Math.sin(a) * 0.263]
            );

            tread.rotation.x = a;
        }

        // Aros, raios e discos nas duas faces.
        for (const side of [-1, 1]) {
            cylinderX(
                group, 0.186, 0.014,
                side * 0.073, 0, 0, darkMetal, 48
            );

            torusX(
                group, 0.172, 0.009,
                side * 0.083, 0, 0, titanium
            );

            torusX(
                group, 0.121, 0.004,
                side * 0.085, 0, 0, frameMetal
            );

            for (let i = 0; i < 10; i++) {
                const a = i / 10 * Math.PI * 2;

                rod(
                    group,
                    [
                        side * 0.086,
                        Math.sin(a) * 0.044,
                        Math.cos(a) * 0.044
                    ],
                    [
                        side * 0.086,
                        Math.sin(a + 0.22) * 0.16,
                        Math.cos(a + 0.22) * 0.16
                    ],
                    0.0055,
                    silver,
                    8
                );
            }
        }

        // Disco de freio perfurado.
        cylinderX(
            group, 0.132, 0.009,
            0.095, 0, 0, titanium, 64
        );

        torusX(group, 0.124, 0.004, 0.101, 0, 0, silver);

        for (let i = 0; i < 12; i++) {
            const a = i / 12 * Math.PI * 2;

            cylinderX(
                group, 0.007, 0.005,
                0.103,
                Math.cos(a) * 0.105,
                Math.sin(a) * 0.105,
                darkMetal,
                12
            );
        }

        cylinderX(
            group, 0.061, 0.17,
            0, 0, 0, darkMetal, 32
        );

        cylinderX(
            group, 0.043, 0.013,
            0.094, 0, 0, cyan, 32
        );

        cylinderX(
            group, 0.035, 0.013,
            -0.094, 0, 0, titanium, 32
        );

        for (let i = 0; i < 6; i++) {
            const a = i / 6 * Math.PI * 2;

            sphere(
                group,
                0.009,
                silver,
                [0.096, Math.sin(a) * 0.153, Math.cos(a) * 0.153],
                [1, 0.7, 1]
            );
        }

        // Pinça de freio.
        box(
            group, 0.045, 0.082, 0.084,
            black, [0.13, 0.064, 0.094]
        );

        box(
            group, 0.009, 0.045, 0.05,
            isFront ? cyan : amber,
            [0.155, 0.066, 0.094]
        );

        return group;
    }

    const wheelFront = createWheel(wheel.frontZ, true);
    const wheelRear = createWheel(wheel.rearZ, false);

    /* =====================================================
       PARALAMAS CURVOS
    ===================================================== */

    function createFender(centerZ, front) {
        const radius = 0.33;
        const steps = 40;
        const width = 0.105;
        const vertices = [];
        const indices = [];

        for (let i = 0; i <= steps; i++) {
            const a = -Math.PI / 2 + i / steps * Math.PI;
            const y = wheel.y + Math.cos(a) * radius;
            const z = centerZ + Math.sin(a) * radius;

            vertices.push(-width, y, z);
            vertices.push(width, y, z);
        }

        for (let i = 0; i < steps; i++) {
            const a = i * 2;
            indices.push(a, a + 2, a + 1);
            indices.push(a + 1, a + 2, a + 3);
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute(
            "position",
            new THREE.Float32BufferAttribute(vertices, 3)
        );
        geometry.setIndex(indices);
        geometry.computeVertexNormals();

        mesh(
            body,
            geometry,
            mat(front ? 0x131e27 : 0x151b23, 0.28, 0.42, {
                side: THREE.DoubleSide
            })
        );

        for (const x of [-width, width]) {
            const points = [];

            for (let i = 0; i <= steps; i++) {
                const a = -Math.PI / 2 + i / steps * Math.PI;

                points.push([
                    x,
                    wheel.y + Math.cos(a) * radius,
                    centerZ + Math.sin(a) * radius
                ]);
            }

            tube(body, points, 0.008, darkMetal, steps);
        }

        const stripe = [];

        for (let i = 12; i <= 28; i++) {
            const a = -Math.PI / 2 + i / steps * Math.PI;

            stripe.push([
                0,
                wheel.y + Math.cos(a) * (radius + 0.003),
                centerZ + Math.sin(a) * (radius + 0.003)
            ]);
        }

        tube(body, stripe, 0.004, front ? cyan : redLightMat, 18);
    }

    createFender(wheel.frontZ, true);
    createFender(wheel.rearZ, false);

    /* =====================================================
       PLATAFORMA ANTIDERRAPANTE
    ===================================================== */

    const deckY = 0.425;

    const gripMaterial = mat(0xffffff, 0.82, 0.16, {
        map: gripTexture
    });

    box(body, 0.32, 0.115, 1.46, paint, [0, deckY, 0.07]);

    box(
        body, 0.272, 0.012, 1.32,
        gripMaterial, [0, deckY + 0.064, 0.07]
    );

    box(
        body, 0.286, 0.026, 0.095,
        black, [0, deckY + 0.052, -0.60]
    );

    box(
        body, 0.286, 0.028, 0.105,
        darkPlastic, [0, deckY + 0.052, 0.76]
    );

    box(
        body, 0.235, 0.045, 1.19,
        darkMetal, [0, deckY - 0.079, 0.08]
    );

    for (let z = -0.44; z <= 0.62; z += 0.26) {
        box(
            body, 0.25, 0.023, 0.035,
            frameMetal, [0, deckY - 0.105, z]
        );
    }

    for (const side of [-1, 1]) {
        box(
            body, 0.014, 0.026, 1.20,
            darkMetal, [side * 0.16, deckY, 0.08]
        );

        box(
            body, 0.007, 0.012, 1.06,
            cyan, [side * 0.168, deckY + 0.004, 0.08]
        );

        for (const z of [-0.47, -0.19, 0.11, 0.41, 0.66]) {
            cylinderX(
                body, 0.009, 0.008,
                side * 0.169, deckY, z, silver, 16
            );
        }

        box(
            body, 0.012, 0.027, 0.078,
            amber, [side * 0.169, deckY, -0.54]
        );
    }

    const logo = mesh(
        body,
        new THREE.PlaneGeometry(0.31, 0.075),
        new THREE.MeshStandardMaterial({
            map: logoTexture,
            transparent: true,
            side: THREE.DoubleSide,
            roughness: 0.45,
            metalness: 0.2,
            depthWrite: false
        }),
        [0.171, deckY + 0.005, 0.02]
    );

    logo.rotation.y = Math.PI / 2;

    /* =====================================================
       MOTOR E BRAÇO TRASEIRO
    ===================================================== */

    for (const side of [-1, 1]) {
        rod(
            body,
            [side * 0.085, 0.37, 0.60],
            [side * 0.078, 0.28, wheel.rearZ],
            0.025, darkMetal, 12, 0.019
        );

        sphere(
            body, 0.03, titanium,
            [side * 0.08, 0.30, wheel.rearZ]
        );
    }

    cylinderX(
        body, 0.105, 0.14,
        0, wheel.y, wheel.rearZ, darkMetal, 48
    );

    for (const side of [-1, 1]) {
        cylinderX(
            body, 0.082, 0.015,
            side * 0.078, wheel.y, wheel.rearZ,
            frameMetal, 40
        );
    }

    for (let i = 0; i < 7; i++) {
        cylinderX(
            body, 0.091, 0.007,
            -0.045 + i * 0.015, wheel.y, wheel.rearZ,
            titanium, 40
        );
    }

    /* =====================================================
       GARFO E COLUNA DIANTEIRA
    ===================================================== */

    for (const side of [-1, 1]) {
        rod(
            body,
            [side * 0.078, 0.29, wheel.frontZ],
            [side * 0.077, 0.78, -0.88],
            0.035, darkMetal, 20, 0.043
        );

        rod(
            body,
            [side * 0.078, 0.32, wheel.frontZ - 0.005],
            [side * 0.077, 0.58, -0.98],
            0.038, titanium, 20
        );

        rod(
            body,
            [side * 0.077, 0.60, -0.97],
            [side * 0.077, 0.78, -0.88],
            0.042, black, 20
        );

        sphere(
            body, 0.046, frameMetal,
            [side * 0.077, 0.75, -0.89],
            [1, 0.75, 1]
        );
    }

    cylinderX(
        body, 0.031, 0.24,
        0, wheel.y, wheel.frontZ, titanium, 24
    );

    rod(
        body, [-0.09, 0.69, -0.93],
        [0.09, 0.69, -0.93],
        0.022, frameMetal, 12
    );

    const stemStart = [0, 0.64, -0.88];
    const stemEnd = [0, 1.535, -0.56];

    const stemDirection = new THREE.Vector3(
        stemEnd[0] - stemStart[0],
        stemEnd[1] - stemStart[1],
        stemEnd[2] - stemStart[2]
    ).normalize();

    rod(
        body, stemStart, stemEnd,
        0.045, black, 32, 0.039
    );

    rod(
        body,
        [0, 0.82, -0.815],
        [0, 1.47, -0.583],
        0.024, frameMetal, 24
    );

    rod(
        body,
        [0.040, 0.81, -0.818],
        [0.035, 1.455, -0.584],
        0.0055, cyan, 10
    );

    for (const t of [0.12, 0.88]) {
        const p = new THREE.Vector3(...stemStart).lerp(
            new THREE.Vector3(...stemEnd), t
        );

        alignedRing(
            body,
            p.toArray(),
            stemDirection.toArray(),
            0.047,
            0.009,
            titanium
        );
    }

    sphere(
        body, 0.063, darkMetal,
        [0, 1.53, -0.56], [1.15, 0.75, 1]
    );

    box(
        body, 0.15, 0.07, 0.105,
        frameMetal, [0, 1.535, -0.56]
    );

    /* =====================================================
       GUIDÃO E MANOPLAS
    ===================================================== */

    const handleY = 1.568;
    const handleZ = -0.56;

    cylinderX(
        body, 0.026, 0.91,
        0, handleY, handleZ, titanium, 32
    );

    box(
        body, 0.17, 0.055, 0.087,
        black, [0, 1.574, handleZ]
    );

    box(
        body, 0.105, 0.009, 0.066,
        cyan, [0, 1.605, handleZ]
    );

    for (const side of [-1, 1]) {
        const gripX = side * 0.305;

        cylinderX(
            body, 0.034, 0.235,
            gripX, handleY, handleZ, rubber, 32
        );

        for (let i = 0; i < 10; i++) {
            torusX(
                body,
                0.032,
                0.0035,
                gripX - 0.1 + i * 0.022,
                handleY,
                handleZ,
                rubberDetail
            );
        }

        cylinderX(
            body, 0.038, 0.025,
            side * 0.435, handleY, handleZ, darkMetal, 28
        );

        cylinderX(
            body, 0.025, 0.028,
            side * 0.45, handleY, handleZ, titanium, 28
        );

        tube(
            body,
            [
                [side * 0.205, 1.556, -0.572],
                [side * 0.235, 1.535, -0.592],
                [side * 0.250, 1.490, -0.622],
                [side * 0.265, 1.445, -0.657],
                [side * 0.275, 1.432, -0.673]
            ],
            0.009, silver, 20
        );
    }

    // Cabos dos freios.
    tube(
        body,
        [
            [0.245, 1.54, -0.58],
            [0.28, 1.48, -0.63],
            [0.25, 1.28, -0.65],
            [0.20, 1.06, -0.75],
            [0.15, 0.84, -0.86],
            [0.12, 0.67, -0.96],
            [0.115, 0.48, -1.04]
        ],
        0.0075, rubber, 40
    );

    tube(
        body,
        [
            [-0.24, 1.54, -0.58],
            [-0.28, 1.46, -0.61],
            [-0.23, 1.25, -0.69],
            [-0.16, 1.04, -0.77],
            [-0.11, 0.82, -0.87]
        ],
        0.006, darkMetal, 30
    );

    /* =====================================================
       PAINEL DIGITAL
    ===================================================== */

    box(
        body, 0.225, 0.052, 0.16,
        black, [0, 1.612, -0.56]
    );

    box(
        body, 0.204, 0.012, 0.145,
        darkMetal, [0, 1.641, -0.56]
    );

    const displayMaterial = mat(0xffffff, 0.22, 0.1, {
        map: displayTexture,
        emissive: 0x238f7f,
        emissiveIntensity: 0.28
    });

    const display = mesh(
        body,
        new THREE.PlaneGeometry(0.184, 0.087),
        displayMaterial,
        [0, 1.648, -0.56]
    );

    display.rotation.x = -Math.PI / 2;

    /* =====================================================
       FAROL E LANTERNA
    ===================================================== */

    box(
        body, 0.19, 0.105, 0.075,
        black, [0, 0.775, -0.98]
    );

    box(
        body, 0.158, 0.071, 0.015,
        titanium, [0, 0.779, -1.020]
    );

    box(
        body, 0.139, 0.051, 0.010,
        headlightMat, [0, 0.781, -1.031]
    );

    for (let i = -2; i <= 2; i++) {
        box(
            body, 0.004, 0.039, 0.003,
            silver, [i * 0.024, 0.781, -1.037]
        );
    }

    for (const side of [-1, 1]) {
        sphere(
            body, 0.018, amber,
            [side * 0.101, 0.747, -0.978],
            [1, 0.7, 0.55]
        );
    }

    box(
        body, 0.145, 0.063, 0.035,
        black, [0, 0.305, 1.448]
    );

    box(
        body, 0.12, 0.041, 0.012,
        redLightMat, [0, 0.307, 1.469]
    );

    for (let i = -2; i <= 2; i++) {
        box(
            body, 0.0035, 0.029, 0.003,
            amber, [i * 0.020, 0.307, 1.477]
        );
    }

    /* =====================================================
       DESCANSO LATERAL
    ===================================================== */

    sphere(body, 0.034, titanium, [-0.18, 0.37, 0.47]);

    rod(
        body,
        [-0.19, 0.35, 0.47],
        [-0.27, 0.045, 0.49],
        0.017, titanium, 16, 0.012
    );

    box(
        body, 0.078, 0.022, 0.105,
        black, [-0.27, 0.025, 0.49]
    );

    /* =====================================================
       PILOTO 3D
    ===================================================== */

    function createRider() {
        const rider = new THREE.Group();
        rider.name = "PILOTO COM CAPACETE";
        body.add(rider);

        // Materiais das roupas.
        const skin = mat(0xc9916e, 0.72, 0.02);
        const skinShade = mat(0x936044, 0.78, 0.02);
        const jacket = mat(0x172431, 0.72, 0.05);
        const jacketLight = mat(0x30434f, 0.58, 0.1);
        const jacketDark = mat(0x0d151d, 0.65, 0.05);
        const pants = mat(0x202832, 0.85, 0.02);
        const pantsDetail = mat(0x35434e, 0.72, 0.08);
        const armor = mat(0x111a23, 0.35, 0.48);
        const armorEdge = mat(0x647783, 0.27, 0.65);
        const glove = mat(0x11171d, 0.88, 0.02);
        const shoes = mat(0x171e25, 0.64, 0.08);
        const sole = mat(0x05090d, 0.92, 0.02);
        const shoeDetail = mat(0x8295a0, 0.4, 0.32);
        const helmetMat = mat(0x111b25, 0.24, 0.55);
        const helmetEdge = mat(0x526573, 0.22, 0.7);
        const hair = mat(0x201913, 0.9, 0.01);
        const eyes = mat(0x17110d, 0.45, 0.03);

        const reflect = mat(0x28e2cc, 0.28, 0.55, {
            emissive: 0x034c43,
            emissiveIntensity: 0.35
        });

        /* PERNAS E CALÇADOS */

        const legInfo = [
            { side: -1, footZ: 0.40, kneeZ: 0.27 },
            { side:  1, footZ: 0.12, kneeZ: 0.13 }
        ];

        for (const leg of legInfo) {
            const s = leg.side;

            const hip = [s * 0.105, 1.055, 0.20];
            const knee = [s * 0.12, 0.785, leg.kneeZ];
            const ankle = [s * 0.11, 0.59, leg.footZ + 0.055];

            rod(rider, hip, knee, 0.078, pants, 22, 0.061);
            rod(rider, knee, ankle, 0.060, pants, 22, 0.044);

            sphere(
                rider, 0.074, pants, hip, [1, 0.92, 0.95]
            );

            // Joelheira rígida.
            sphere(
                rider, 0.061, armor,
                [knee[0], knee[1], knee[2] - 0.037],
                [1, 1.05, 0.45]
            );

            box(
                rider, 0.075, 0.008, 0.012,
                armorEdge,
                [knee[0], knee[1] + 0.018, knee[2] - 0.065]
            );

            // Costura lateral da calça.
            tube(
                rider,
                [
                    [s * 0.158, 0.98, 0.20],
                    [s * 0.176, 0.88, 0.24],
                    [s * 0.174, 0.80, leg.kneeZ]
                ],
                0.003, pantsDetail, 12
            );

            // Bolsinho lateral.
            box(
                rider, 0.012, 0.074, 0.09,
                jacketDark, [s * 0.173, 0.94, 0.20]
            );

            box(
                rider, 0.013, 0.006, 0.035,
                armorEdge, [s * 0.181, 0.966, 0.20]
            );

            // Tornozelo e cano do calçado.
            sphere(
                rider, 0.049, pants,
                [s * 0.11, 0.585, leg.footZ + 0.045],
                [1, 1.12, 1]
            );

            box(
                rider, 0.125, 0.072, 0.105,
                shoes, [s * 0.11, 0.555, leg.footZ + 0.037]
            );

            // Sola com padrão de tração.
            box(
                rider, 0.137, 0.023, 0.226,
                sole, [s * 0.11, 0.505, leg.footZ]
            );

            box(
                rider, 0.126, 0.066, 0.194,
                shoes, [s * 0.11, 0.538, leg.footZ - 0.005]
            );

            sphere(
                rider, 0.066, shoes,
                [s * 0.11, 0.541, leg.footZ - 0.068],
                [1, 0.62, 1.02]
            );

            box(
                rider, 0.086, 0.038, 0.027,
                armor,
                [s * 0.11, 0.548, leg.footZ + 0.081]
            );

            box(
                rider, 0.006, 0.009, 0.135,
                reflect,
                [s * 0.177, 0.512, leg.footZ + 0.005]
            );

            // Cadarços.
            for (let i = 0; i < 4; i++) {
                box(
                    rider,
                    0.066, 0.004, 0.005,
                    shoeDetail,
                    [
                        s * 0.11,
                        0.575 - i * 0.009,
                        leg.footZ - 0.025 + i * 0.021
                    ]
                );
            }

            box(
                rider, 0.045, 0.011, 0.067,
                armor,
                [s * 0.11, 0.579, leg.footZ - 0.005]
            );

            box(
                rider, 0.007, 0.013, 0.046,
                shoeDetail,
                [s * 0.174, 0.543, leg.footZ - 0.01]
            );

            for (let i = 0; i < 4; i++) {
                box(
                    rider, 0.088, 0.003, 0.009,
                    pantsDetail,
                    [
                        s * 0.11,
                        0.492,
                        leg.footZ - 0.075 + i * 0.045
                    ]
                );
            }
        }

        /* CINTURA E JAQUETA */

        sphere(
            rider, 1, pants,
            [0, 1.065, 0.18], [0.175, 0.12, 0.14]
        );

        box(
            rider, 0.30, 0.047, 0.225,
            jacketDark, [0, 1.066, 0.17]
        );

        box(
            rider, 0.053, 0.037, 0.018,
            armorEdge, [0, 1.065, 0.045]
        );

        box(
            rider, 0.025, 0.016, 0.009,
            reflect, [0, 1.065, 0.033]
        );

        const torso = sphere(
            rider, 1, jacket,
            [0, 1.295, 0.05], [0.216, 0.267, 0.151]
        );

        torso.rotation.x = -0.19;

        const upperTorso = sphere(
            rider, 1, jacketLight,
            [0, 1.395, 0.015], [0.216, 0.133, 0.148]
        );

        upperTorso.rotation.x = -0.16;

        box(
            rider, 0.151, 0.176, 0.019,
            jacketDark, [0, 1.319, -0.093], [-0.17, 0, 0]
        );

        // Zíper.
        rod(
            rider,
            [0, 1.21, -0.116],
            [0, 1.438, -0.088],
            0.004, armorEdge, 8
        );

        sphere(
            rider, 0.009, reflect, [0, 1.229, -0.115]
        );

        // Faixa refletiva em V.
        rod(
            rider,
            [-0.155, 1.408, -0.066],
            [0, 1.359, -0.112],
            0.007, reflect, 10, 0.006
        );

        rod(
            rider,
            [0, 1.359, -0.112],
            [0.155, 1.408, -0.066],
            0.007, reflect, 10, 0.006
        );

        // Bolsos e seus fechos.
        for (const s of [-1, 1]) {
            box(
                rider, 0.077, 0.064, 0.015,
                jacketLight,
                [s * 0.115, 1.222, -0.085],
                [-0.12, 0, 0]
            );

            box(
                rider, 0.052, 0.004, 0.008,
                armorEdge, [s * 0.115, 1.249, -0.096]
            );

            box(
                rider, 0.005, 0.027, 0.006,
                reflect, [s * 0.145, 1.219, -0.094]
            );
        }

        // Gola alta.
        rod(
            rider,
            [0, 1.466, -0.018],
            [0, 1.55, -0.016],
            0.068, jacketDark, 24, 0.057
        );

        tube(
            rider,
            [
                [-0.045, 1.51, -0.068],
                [0, 1.495, -0.087],
                [0.045, 1.51, -0.068]
            ],
            0.006, jacketLight, 12
        );

        // Painéis de proteção nas laterais do tronco.
        for (const s of [-1, 1]) {
            sphere(
                rider, 0.085, jacketLight,
                [s * 0.178, 1.29, 0.025],
                [0.48, 1.18, 0.88]
            );

            box(
                rider, 0.011, 0.085, 0.042,
                reflect, [s * 0.203, 1.294, -0.015]
            );
        }

        /* MOCHILA */

        box(
            rider, 0.225, 0.295, 0.082,
            jacketDark, [0, 1.30, 0.196], [-0.17, 0, 0]
        );

        box(
            rider, 0.176, 0.151, 0.015,
            jacketLight, [0, 1.294, 0.243], [-0.17, 0, 0]
        );

        for (const s of [-1, 1]) {
            tube(
                rider,
                [
                    [s * 0.105, 1.40, 0.21],
                    [s * 0.106, 1.30, 0.244],
                    [s * 0.088, 1.19, 0.225]
                ],
                0.0035, armorEdge, 12
            );
        }

        box(
            rider, 0.13, 0.018, 0.008,
            reflect, [0, 1.31, 0.255]
        );

        rod(
            rider,
            [0.073, 1.363, 0.25],
            [0.073, 1.235, 0.229],
            0.0035, armorEdge, 8
        );

        sphere(
            rider, 0.008, silver, [0.073, 1.235, 0.229]
        );

        /* BRAÇOS E PROTEÇÕES */

        for (const s of [-1, 1]) {
            const shoulder = [s * 0.185, 1.421, 0.005];
            const elbow = [s * 0.245, 1.338, -0.245];
            const wrist = [s * 0.315, 1.548, -0.515];
            const hand = [s * 0.315, 1.557, -0.555];

            sphere(
                rider, 0.069, jacket, shoulder, [1.05, 1.1, 1]
            );

            // Ombreira rígida.
            sphere(
                rider, 0.074, armor,
                [s * 0.195, 1.435, -0.018],
                [1.02, 0.8, 1.03]
            );

            box(
                rider, 0.042, 0.009, 0.012,
                reflect,
                [s * 0.205, 1.446, -0.077],
                [0, 0, s * -0.18]
            );

            rod(
                rider, shoulder, elbow,
                0.061, jacket, 22, 0.052
            );

            sphere(
                rider, 0.054, jacketLight,
                elbow, [1.05, 1, 1]
            );

            // Cotoveleira.
            sphere(
                rider, 0.057, armor,
                [elbow[0], elbow[1], elbow[2] - 0.025],
                [1.04, 0.9, 0.5]
            );

            box(
                rider, 0.048, 0.008, 0.01,
                armorEdge,
                [elbow[0], elbow[1] + 0.012, elbow[2] - 0.052],
                [0, 0, s * 0.12]
            );

            rod(
                rider, elbow, wrist,
                0.049, jacket, 22, 0.039
            );

            sphere(
                rider, 0.044, jacketLight,
                [s * 0.283, 1.438, -0.36],
                [1, 1.05, 0.92]
            );

            tube(
                rider,
                [
                    [s * 0.282, 1.416, -0.311],
                    [s * 0.294, 1.452, -0.37],
                    [s * 0.305, 1.492, -0.426]
                ],
                0.0045, reflect, 12
            );

            rod(
                rider,
                [s * 0.303, 1.512, -0.46],
                wrist,
                0.041, jacketDark, 16, 0.037
            );

            // Luva.
            sphere(
                rider, 0.052, glove,
                hand, [1.16, 0.85, 1.12]
            );

            // Proteção da luva.
            sphere(
                rider, 0.035, armor,
                [s * 0.315, 1.579, -0.55],
                [1.15, 0.45, 0.85]
            );

            // Dedos envolvendo a região da manopla.
            for (let i = 0; i < 4; i++) {
                sphere(
                    rider, 0.013, glove,
                    [
                        s * 0.315 + (i - 1.5) * 0.018,
                        1.538,
                        -0.579
                    ],
                    [0.76, 1, 1.15]
                );
            }

            rod(
                rider,
                [s * 0.315 - s * 0.043, 1.559, -0.544],
                [s * 0.315 - s * 0.021, 1.531, -0.574],
                0.017, glove, 12, 0.013
            );

            box(
                rider, 0.045, 0.006, 0.016,
                reflect, [s * 0.315, 1.586, -0.55]
            );
        }

        /* PESCOÇO E CABEÇA */

        rod(
            rider,
            [0, 1.515, -0.015],
            [0, 1.629, -0.035],
            0.054, skin, 20, 0.058
        );

        sphere(
            rider, 1, skin,
            [0, 1.689, -0.043],
            [0.111, 0.143, 0.105]
        );

        // Orelhas.
        for (const s of [-1, 1]) {
            sphere(
                rider, 0.025, skin,
                [s * 0.107, 1.69, -0.025],
                [0.55, 1, 0.78]
            );

            sphere(
                rider, 0.013, skinShade,
                [s * 0.118, 1.69, -0.026],
                [0.5, 1, 0.8]
            );
        }

        // Cabelo atrás do rosto.
        sphere(
            rider, 1, hair,
            [0, 1.706, 0.005],
            [0.108, 0.125, 0.095]
        );

        sphere(
            rider, 1, skin,
            [0, 1.685, -0.079],
            [0.095, 0.12, 0.069]
        );

        // Sobrancelhas e olhos.
        for (const s of [-1, 1]) {
            box(
                rider, 0.036, 0.008, 0.006,
                hair,
                [s * 0.037, 1.713, -0.141],
                [0, 0, s * -0.12]
            );

            sphere(
                rider, 0.012, eyes,
                [s * 0.037, 1.695, -0.144],
                [1, 0.68, 0.42]
            );

            sphere(
                rider, 0.0038, silver,
                [s * 0.034, 1.698, -0.149],
                [1, 1, 0.4]
            );
        }

        // Nariz e boca.
        sphere(
            rider, 0.019, skin,
            [0, 1.674, -0.15],
            [0.75, 1.15, 0.8]
        );

        tube(
            rider,
            [
                [-0.024, 1.644, -0.143],
                [0, 1.640, -0.151],
                [0.024, 1.644, -0.143]
            ],
            0.003, skinShade, 8
        );

        /* CAPACETE COMPACTO */

        const dome = mesh(
            rider,
            new THREE.SphereGeometry(
                1, 40, 24, 0, Math.PI * 2, 0, Math.PI / 2
            ),
            helmetMat,
            [0, 1.785, -0.035]
        );

        dome.scale.set(0.148, 0.139, 0.17);

        // Borda e aro inferior do capacete.
        box(
            rider, 0.278, 0.019, 0.245,
            helmetEdge, [0, 1.786, -0.037]
        );

        box(
            rider, 0.263, 0.014, 0.231,
            helmetMat, [0, 1.796, -0.037]
        );

        // Aba frontal curta.
        box(
            rider, 0.238, 0.017, 0.062,
            helmetMat, [0, 1.784, -0.158]
        );

        box(
            rider, 0.201, 0.004, 0.022,
            helmetEdge, [0, 1.775, -0.171]
        );

        // Faixa central decorativa.
        tube(
            rider,
            [
                [0, 1.798, -0.195],
                [0, 1.847, -0.162],
                [0, 1.898, -0.104],
                [0, 1.923, -0.037],
                [0, 1.899, 0.033],
                [0, 1.849, 0.094]
            ],
            0.007, reflect, 20
        );

        // Entradas de ventilação.
        for (const s of [-1, 1]) {
            box(
                rider, 0.009, 0.012, 0.048,
                helmetEdge,
                [s * 0.137, 1.827, -0.047],
                [0, s * 0.12, 0]
            );

            box(
                rider, 0.009, 0.012, 0.035,
                helmetEdge,
                [s * 0.123, 1.846, 0.012],
                [0, s * 0.12, 0]
            );

            sphere(
                rider, 0.019, helmetEdge,
                [s * 0.137, 1.784, -0.036],
                [0.55, 0.65, 1]
            );

            sphere(
                rider, 0.012, reflect,
                [s * 0.145, 1.784, -0.036],
                [0.4, 0.6, 0.8]
            );

            // Tiras de fixação.
            tube(
                rider,
                [
                    [s * 0.113, 1.77, -0.008],
                    [s * 0.114, 1.719, -0.018],
                    [s * 0.090, 1.653, -0.064],
                    [s * 0.040, 1.624, -0.082]
                ],
                0.006, glove, 16
            );
        }

        // Fecho sob o queixo.
        box(
            rider, 0.043, 0.022, 0.016,
            armorEdge, [0.025, 1.624, -0.087]
        );

        sphere(
            rider, 0.008, reflect,
            [0.025, 1.624, -0.097]
        );

        // Marca lateral do capacete.
        box(
            rider, 0.008, 0.035, 0.055,
            reflect, [0.147, 1.818, -0.079], [0, 0.15, 0]
        );

        /* ACABAMENTO DO PILOTO */

        for (const s of [-1, 1]) {
            tube(
                rider,
                [
                    [s * 0.16, 1.45, -0.045],
                    [s * 0.187, 1.385, -0.06],
                    [s * 0.195, 1.31, -0.06]
                ],
                0.0035, armorEdge, 12
            );

            sphere(
                rider, 0.013, armorEdge,
                [s * 0.292, 1.465, -0.397],
                [0.8, 1, 0.55]
            );
        }

        // Painel refletivo na parte traseira da jaqueta.
        box(
            rider, 0.155, 0.035, 0.009,
            reflect, [0, 1.355, 0.197], [-0.18, 0, 0]
        );

        // Emblema no peito.
        box(
            rider, 0.065, 0.026, 0.008,
            armor, [0.083, 1.397, -0.104], [-0.15, 0, 0]
        );

        box(
            rider, 0.037, 0.004, 0.004,
            reflect, [0.083, 1.398, -0.11]
        );

        // Proteção de punho.
        for (const s of [-1, 1]) {
            cylinderX(
                rider, 0.043, 0.035,
                s * 0.315, 1.548, -0.515,
                armor, 20
            );
        }

        return rider;
    }

    createRider();

    return { body, wheelFront, wheelRear, headlightMat, redLightMat };
}


const loadingScreen = document.getElementById("loading");
function showError(msg){ loadingScreen.classList.remove("hidden"); loadingScreen.classList.add("error"); loadingScreen.textContent = msg; }
function loadScript(url){
  return new Promise((res, rej) => {
    const s = document.createElement("script");
    s.src = url; s.async = true;
    s.onload = () => (window.THREE||0) ? res() : rej(new Error("Three.js nao encontrado"));
    s.onerror = () => { s.remove(); rej(new Error("Falha ao carregar biblioteca 3D")); };
    document.head.appendChild(s);
  });
}
async function startApp(){
  try { await loadScript("https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.min.js"); }
  catch(e){
    try { await loadScript("https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"); }
    catch(e2){ showError("NAO FOI POSSIVEL CARREGAR O THREE.JS. Verifique a conexao e recarregue."); return; }
  }
  try { await loadScript("https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js"); }
  catch(e){ try { await loadScript("https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/examples/js/loaders/GLTFLoader.js"); } catch(e2){ console.warn("GLTFLoader indisponivel"); } }
  setTimeout(() => {
    try { main(); }
    catch(err){ console.error(err); showError("ERRO AO CRIAR A CIDADE: " + (err.message || "veja F12 > Console")); }
  }, 80);
}


function main(){
const THREE = window.THREE;
const isMobile = /Android|iPhone|iPad|Mobi/i.test(navigator.userAgent);
const clamp = (v,a,b) => Math.max(a, Math.min(b, v));
const lerp = (a,b,t) => a + (b-a)*t;

/* ===================== RENDERER / CENA ===================== */
const viewer = document.getElementById("viewer");
const renderer = new THREE.WebGLRenderer({ antialias: !isMobile, powerPreference: "high-performance" });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.25 : 1.5));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
viewer.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0xbcd9ee, 80, 480);
const camera = new THREE.PerspectiveCamera(58, window.innerWidth/window.innerHeight, 0.2, 1800);
const maxAniso = Math.min(8, renderer.capabilities.getMaxAnisotropy ? renderer.capabilities.getMaxAnisotropy() : 1);

/* ===================== RNG ===================== */
function rng(seed){ return function(){ seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const R = rng(20260);
const rr = (a,b) => a + R()*(b-a);
const ri = (a,b) => Math.floor(rr(a, b+1));
const pick = a => a[Math.floor(R()*a.length)];

/* ===================== TEXTURAS PROCEDURAIS ===================== */
function ctex(w, h, draw, opts){
  opts = opts || {};
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  const ctx = c.getContext("2d"); draw(ctx, w, h);
  const t = new THREE.CanvasTexture(c);
  t.encoding = THREE.sRGBEncoding;
  if (opts.repeat !== false){ t.wrapS = t.wrapT = THREE.RepeatWrapping; }
  t.anisotropy = maxAniso;
  return t;
}
function speckle(ctx, w, h, n, cols, smin, smax){
  for (let i=0;i<n;i++){ ctx.fillStyle = cols[(Math.random()*cols.length)|0]; const s = smin + Math.random()*(smax-smin); ctx.fillRect(Math.random()*w, Math.random()*h, s, s); }
}
function asphaltBase(ctx, w, h){
  ctx.fillStyle = "#2c2f34"; ctx.fillRect(0,0,w,h);
  speckle(ctx,w,h,w*h/16,["rgba(255,255,255,.05)","rgba(0,0,0,.12)","rgba(120,125,130,.10)","rgba(0,0,0,.2)"],1,2.4);
  ctx.strokeStyle = "rgba(10,10,12,.35)"; ctx.lineWidth = 1;
  for (let i=0;i<4;i++){ ctx.beginPath(); let x=Math.random()*w, y=Math.random()*h; ctx.moveTo(x,y); for(let k=0;k<6;k++){ x+= (Math.random()-.5)*50; y+=(Math.random()-.5)*50; ctx.lineTo(x,y);} ctx.stroke(); }
}
function drawRoadLines(ctx){
  // textura 256x256 = 16m x 16m, eixo horizontal = ao longo da via
  ctx.fillStyle = "#e3b724"; ctx.fillRect(0,121,256,3); ctx.fillRect(0,132,256,3);
  ctx.fillStyle = "#e9ecee"; ctx.fillRect(0,78,256,3); ctx.fillRect(0,175,256,3);
  ctx.fillRect(0,2,256,3); ctx.fillRect(0,251,256,3);
  for (const x of [0,128,256]){ ctx.fillRect(x-1,5,3,73); ctx.fillRect(x-1,178,3,73); }
  speckle(ctx,256,256,500,["rgba(0,0,0,.35)"],1,2);
}
function roadTex(vertical){
  return ctex(256,256,(ctx,w,h)=>{
    asphaltBase(ctx,w,h);
    ctx.save();
    if (vertical){ ctx.translate(w,0); ctx.rotate(Math.PI/2); }
    drawRoadLines(ctx);
    ctx.restore();
  });
}
const asphaltTex = ctex(256,256,asphaltBase);
const sidewalkTex = ctex(256,256,(ctx,w,h)=>{
  ctx.fillStyle="#a9a9a3"; ctx.fillRect(0,0,w,h);
  for(let y=0;y<4;y++)for(let x=0;x<4;x++){ const v=150+Math.random()*28|0; ctx.fillStyle=`rgb(${v},${v},${v-4})`; ctx.fillRect(x*64+1.5,y*64+1.5,61,61); }
  speckle(ctx,w,h,1800,["rgba(0,0,0,.08)","rgba(255,255,255,.08)"],1,2);
});
const brickPathTex = ctex(256,256,(ctx,w,h)=>{
  ctx.fillStyle="#6e5a4c"; ctx.fillRect(0,0,w,h);
  for(let y=0;y<16;y++)for(let x=0;x<8;x++){ const off=(y%2)*16; const v=Math.random(); ctx.fillStyle=`rgb(${150+v*40|0},${88+v*28|0},${72+v*20|0})`; ctx.fillRect(x*32+off-16+1,y*16+1,30,14); }
});
const grassTex = ctex(256,256,(ctx,w,h)=>{
  ctx.fillStyle="#3f7a3a"; ctx.fillRect(0,0,w,h);
  speckle(ctx,w,h,5000,["#4c8c42","#357033","#5a9a4a","#2f6a30","#6aa656"],1,3);
});
const stuccoTex = ctex(128,128,(ctx,w,h)=>{
  ctx.fillStyle="#f2f2f2"; ctx.fillRect(0,0,w,h);
  speckle(ctx,w,h,1400,["rgba(0,0,0,.07)","rgba(255,255,255,.35)","rgba(0,0,0,.04)"],1,3);
});
const roofTex = ctex(128,128,(ctx,w,h)=>{
  ctx.fillStyle="#f0f0f0"; ctx.fillRect(0,0,w,h);
  for(let y=0;y<8;y++){ for(let x=0;x<8;x++){ const off=(y%2)*8; const v=215+Math.random()*30|0; ctx.fillStyle=`rgb(${v},${v},${v})`; ctx.fillRect(x*16+off-8+.5,y*16+.5,15,15); } ctx.fillStyle="rgba(0,0,0,.28)"; ctx.fillRect(0,y*16+14,w,2); }
});
const fenceTex = ctex(128,64,(ctx,w,h)=>{
  ctx.clearRect(0,0,w,h);
  ctx.fillStyle="#f4f1e8";
  for(let i=0;i<8;i++){ const x=i*16+2; ctx.beginPath(); ctx.moveTo(x,64); ctx.lineTo(x,12); ctx.lineTo(x+6,4); ctx.lineTo(x+12,12); ctx.lineTo(x+12,64); ctx.fill(); }
  ctx.fillStyle="#d9d4c6"; ctx.fillRect(0,22,w,4); ctx.fillRect(0,46,w,4);
});
const garageTex = ctex(128,128,(ctx,w,h)=>{
  ctx.fillStyle="#d8d8d4"; ctx.fillRect(0,0,w,h);
  for(let i=0;i<5;i++){ ctx.fillStyle="#b9b9b4"; ctx.fillRect(0,i*26+22,w,3); ctx.fillStyle="#c5c5c0"; ctx.fillRect(10,i*26+4,40,14); ctx.fillRect(78,i*26+4,40,14); }
});
const woodTex = ctex(128,128,(ctx,w,h)=>{
  ctx.fillStyle="#8c5d37"; ctx.fillRect(0,0,w,h);
  for(let i=0;i<40;i++){ ctx.strokeStyle=`rgba(${Math.random()<.5?'60,35,15':'190,140,90'},.25)`; ctx.beginPath(); const y=Math.random()*h; ctx.moveTo(0,y); ctx.lineTo(w,y+Math.random()*4-2); ctx.stroke(); }
});
const barkTex = ctex(64,64,(ctx,w,h)=>{
  ctx.fillStyle="#5a4130"; ctx.fillRect(0,0,w,h);
  for(let i=0;i<30;i++){ ctx.fillStyle=Math.random()<.5?"rgba(0,0,0,.3)":"rgba(255,230,200,.1)"; ctx.fillRect(Math.random()*w,0,1+Math.random()*2,h); }
});
const waterTex = ctex(256,256,(ctx,w,h)=>{
  ctx.fillStyle="#2f90b8"; ctx.fillRect(0,0,w,h);
  for(let i=0;i<90;i++){ ctx.strokeStyle=`rgba(255,255,255,${Math.random()*.25})`; ctx.lineWidth=1+Math.random()*2; ctx.beginPath(); const x=Math.random()*w,y=Math.random()*h; ctx.arc(x,y,4+Math.random()*16,0,Math.PI*2); ctx.stroke(); }
});
const glowTex = ctex(128,128,(ctx,w,h)=>{
  const g=ctx.createRadialGradient(64,64,0,64,64,64); g.addColorStop(0,"rgba(255,235,190,1)"); g.addColorStop(.25,"rgba(255,210,140,.45)"); g.addColorStop(1,"rgba(255,200,120,0)");
  ctx.fillStyle=g; ctx.fillRect(0,0,w,h);
},{repeat:false});
const poolTex = ctex(128,128,(ctx,w,h)=>{
  const g=ctx.createRadialGradient(64,64,0,64,64,64); g.addColorStop(0,"rgba(255,220,150,.9)"); g.addColorStop(.5,"rgba(255,200,120,.3)"); g.addColorStop(1,"rgba(255,200,120,0)");
  ctx.fillStyle=g; ctx.fillRect(0,0,w,h);
},{repeat:false});
const cloudTex = ctex(256,128,(ctx,w,h)=>{
  for(let i=0;i<26;i++){ const x=40+Math.random()*176,y=44+Math.random()*40,r=18+Math.random()*30; const g=ctx.createRadialGradient(x,y,0,x,y,r); g.addColorStop(0,"rgba(255,255,255,.55)"); g.addColorStop(1,"rgba(255,255,255,0)"); ctx.fillStyle=g; ctx.fillRect(0,0,w,h); }
},{repeat:false});
const stripeTexFor = c => ctex(64,64,(ctx,w,h)=>{ for(let i=0;i<8;i++){ ctx.fillStyle=i%2?"#f3efe6":c; ctx.fillRect(i*8,0,8,h);} });

/* ===== fachadas (4 vaos x 4 andares = 14m x 14m) ===== */
function facadeSet(style){
  const S=512, C=128;
  const lit=[]; for(let i=0;i<16;i++) lit.push(R()<0.5 ? (R()<0.75 ? "#ffd89a" : "#cfe8ff") : null);
  const brickWall = (ctx,x,y)=>{
    ctx.fillStyle="#8a4636"; ctx.fillRect(x,y,C,C);
    for(let r=0;r<16;r++){ const off=(r%2)*16; for(let b=-1;b<5;b++){ const v=Math.random(); ctx.fillStyle=`rgb(${128+v*30|0},${64+v*14|0},${48+v*10|0})`; ctx.fillRect(x+b*32+off+1,y+r*8+1,30,6); } }
  };
  const glassGrad = (ctx,x,y,w,h)=>{ const g=ctx.createLinearGradient(x,y,x+w,y+h); g.addColorStop(0,"#79a6bf"); g.addColorStop(.5,"#3d6177"); g.addColorStop(1,"#1d3547"); ctx.fillStyle=g; ctx.fillRect(x,y,w,h); ctx.fillStyle="rgba(255,255,255,.1)"; ctx.beginPath(); ctx.moveTo(x,y+h); ctx.lineTo(x+w*.5,y); ctx.lineTo(x+w*.75,y); ctx.lineTo(x+w*.25,y+h); ctx.fill(); };
  const win = {
    glass:[4,4,C-8,C-34], concrete:[24,24,80,70], brick:[26,24,76,76], resid:[34,18,60,72]
  }[style];
  const draw = (ctx, em)=>{
    ctx.fillStyle = em ? "#000" : "#ccc"; ctx.fillRect(0,0,S,S);
    for(let r=0;r<4;r++)for(let c=0;c<4;c++){
      const x=c*C, y=r*C, L=lit[r*4+c];
      if(!em){
        if(style==="glass"){
          ctx.fillStyle="#26323b"; ctx.fillRect(x,y,C,C);
          glassGrad(ctx,x+4,y+4,C-8,C-34);
          ctx.fillStyle="#9aa8b2"; ctx.fillRect(x,y,4,C); ctx.fillRect(x,y,C,4); ctx.fillRect(x+C/2-2,y+4,3,C-34);
          ctx.fillStyle="#34424c"; ctx.fillRect(x,y+C-30,C,30); ctx.fillStyle="#52626d"; ctx.fillRect(x,y+C-30,C,3);
        } else if(style==="concrete"){
          ctx.fillStyle="#d6d1c7"; ctx.fillRect(x,y,C,C); speckle(ctx,C,C,0,[],1,1);
          ctx.fillStyle="#f4f1ea"; ctx.fillRect(x+19,y+19,90,80);
          glassGrad(ctx,x+24,y+24,80,70);
          ctx.fillStyle="#e9e5dc"; ctx.fillRect(x+62,y+24,4,70); ctx.fillRect(x+24,y+58,80,3);
          ctx.fillStyle="#b3ad9f"; ctx.fillRect(x+14,y+99,100,7); ctx.fillStyle="#bfb9ae"; ctx.fillRect(x,y+C-5,C,5);
        } else if(style==="brick"){
          brickWall(ctx,x,y);
          ctx.fillStyle="#cdc6b6"; ctx.fillRect(x+20,y+14,88,8);
          ctx.fillStyle="#efe9da"; ctx.fillRect(x+22,y+22,84,82);
          glassGrad(ctx,x+26,y+26,76,74);
          ctx.fillStyle="#efe9da"; ctx.fillRect(x+62,y+26,4,74); ctx.fillRect(x+26,y+60,76,4);
          ctx.fillStyle="#b9b2a1"; ctx.fillRect(x+16,y+104,96,7);
        } else {
          ctx.fillStyle="#e9dfcc"; ctx.fillRect(x,y,C,C);
          ctx.fillStyle="#ffffff"; ctx.fillRect(x+30,y+14,68,80);
          glassGrad(ctx,x+34,y+18,60,72);
          ctx.fillStyle="#ffffff"; ctx.fillRect(x+62,y+18,3,72);
          ctx.fillStyle="#c9c1b0"; ctx.fillRect(x+8,y+C-20,112,9);
          ctx.fillStyle="#3a4048"; for(let b=0;b<14;b++) ctx.fillRect(x+12+b*8,y+C-56,2,36); ctx.fillRect(x+8,y+C-58,112,4);
        }
      } else if (L){
        const g=ctx.createLinearGradient(0,y+win[1],0,y+win[1]+win[3]); g.addColorStop(0,L); g.addColorStop(1,"#d99a4c");
        ctx.globalAlpha=.9; ctx.fillStyle=g; ctx.fillRect(x+win[0],y+win[1],win[2],win[3]); ctx.globalAlpha=1;
        ctx.fillStyle="rgba(0,0,0,.45)"; ctx.fillRect(x+win[0]+win[2]/2-2,y+win[1],3,win[3]);
      }
    }
  };
  return { map: ctex(S,S,(c)=>draw(c,false)), emi: ctex(S,S,(c)=>draw(c,true)) };
}
const facadeCache = {};
function facadeSetCached(style){ return facadeCache[style] || (facadeCache[style] = facadeSet(style)); }

function shopTex(colA, name, seed){
  const names = ["CAFE","MERCADO","FARMACIA","PIZZA","BANCO","LIVROS","MODA","PADARIA","VOLT","ELETRO","FLORES","SORVETE"];
  const make = (em)=> ctex(512,128,(ctx,w,h)=>{
    ctx.fillStyle = em ? "#000" : "#30353b"; ctx.fillRect(0,0,w,h);
    const rn = rng(seed);
    for(let b=0;b<3;b++){
      const x=b*170+8;
      if(!em){
        ctx.fillStyle="#202327"; ctx.fillRect(x-8,0,6,h);
        const g=ctx.createLinearGradient(0,34,0,h); g.addColorStop(0,"#f1dcb0"); g.addColorStop(1,"#b98a52"); ctx.fillStyle=g; ctx.fillRect(x,34,152,h-40);
        ctx.fillStyle="rgba(120,160,190,.35)"; ctx.fillRect(x,34,152,h-40);
        ctx.fillStyle="#1b1e22"; ctx.fillRect(x+74,34,4,h-40);
        ctx.fillStyle=colA; ctx.fillRect(x-4,2,160,28);
        ctx.fillStyle="#fff"; ctx.font="bold 19px Arial"; ctx.textAlign="center"; ctx.fillText(names[Math.floor(rn()*names.length)],x+76,23);
      } else {
        ctx.fillStyle="#f6d79b"; ctx.fillRect(x,38,152,h-46);
        ctx.fillStyle=colA; ctx.fillRect(x-4,2,160,28);
        ctx.fillStyle="#fff"; ctx.font="bold 19px Arial"; ctx.textAlign="center"; ctx.fillText(names[Math.floor(rn()*names.length)],x+76,23);
      }
    }
  });
  return { map: make(false), emi: make(true) };
}
function billboardTex(txt, a, b){
  return ctex(512,192,(ctx,w,h)=>{
    const g=ctx.createLinearGradient(0,0,w,h); g.addColorStop(0,a); g.addColorStop(1,b); ctx.fillStyle=g; ctx.fillRect(0,0,w,h);
    ctx.fillStyle="#fff"; ctx.font="900 70px Arial"; ctx.textAlign="center"; ctx.fillText(txt,w/2,100);
    ctx.font="700 24px Arial"; ctx.fillText("A CIDADE E SUA",w/2,150);
    ctx.strokeStyle="rgba(255,255,255,.7)"; ctx.lineWidth=6; ctx.strokeRect(6,6,w-12,h-12);
  },{repeat:false});
}

/* ===================== MATERIAIS ===================== */
const M = (c, r, m, o) => new THREE.MeshStandardMaterial(Object.assign({ color:c, roughness: r===undefined?.8:r, metalness: m||0 }, o||{}));
const emisList = []; // { m, base, floor } -> emissiveIntensity = base*(floor + (1-floor)*night)
function emis(m, base, floor){ emisList.push({m, base, floor: floor||0}); return m; }
function flat(m){ m.userData.noCast = true; return m; }
function decal(m){ m.polygonOffset = true; m.polygonOffsetFactor = -2; m.polygonOffsetUnits = -2; return flat(m); }

const asphaltMat = flat(M(0xffffff,.92,.02,{map:asphaltTex}));
const roadHMat = flat(M(0xffffff,.9,.02,{map:roadTex(false)}));
const roadVMat = flat(M(0xffffff,.9,.02,{map:roadTex(true)}));
const sidewalkMat = M(0xffffff,.88,.02,{map:sidewalkTex});
const brickPathMat = decal(M(0xffffff,.9,.02,{map:brickPathTex}));
const pavePlazaMat = decal(M(0xd9d6cc,.8,.05,{map:sidewalkTex}));
const grassMat = flat(M(0xffffff,.95,0,{map:grassTex}));
const stripeMat = decal(M(0xf0f0ea,.75,.02));
const manholeMat = decal(M(0x24272b,.45,.8));
const patchMat = decal(M(0x1f2226,.95,0));
const poolGlowMat = decal(new THREE.MeshBasicMaterial({map:poolTex,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false}));
const concreteMat = M(0xb9b6ae,.9,.02,{map:stuccoTex});
const darkConcrete = M(0x6d6e70,.9,.02);
const gravelMat = M(0x585b60,.95,0);
const metalDark = M(0x2a2e34,.45,.75);
const metalLight = M(0x9aa5ad,.3,.85);
const stoneMat = M(0xa4a39c,.9,.02,{map:stuccoTex});
const marbleMat = M(0xdedcd5,.35,.1);
const woodMat = M(0xffffff,.75,0,{map:woodTex});
const barkMat = M(0xffffff,.95,0,{map:barkTex});
const trimMat = M(0xf3f1ea,.7,0);
const glassWin = [ emis(M(0x16273a,.12,.6,{emissive:0xffc980,emissiveIntensity:0}),1.6,0), M(0x182a3e,.12,.7) ];
const glassBlue = M(0x203a52,.1,.75);
const busGlass = M(0x9fd0e6,.1,.5,{transparent:true,opacity:.38,side:THREE.DoubleSide}); busGlass.userData.noCast=true;
const wallMats = [0xe8dcc4,0xd9b99b,0xb9c9d3,0xe3e0d6,0xc9d6b9,0xe8c9c1,0x9fb0c4,0xf0e9da,0xd7c2a2].map(c=>M(c,.92,0,{map:stuccoTex,side:THREE.DoubleSide}));
const roofMats = [0x8a3b2b,0x5b4a40,0x3f4650,0x6e5b4a,0x7a3d32].map(c=>M(c,.8,.05,{map:roofTex,side:THREE.DoubleSide}));
const doorMats = [0x7a2f2f,0x244b6b,0x2f5a3a,0x3a3a3f,0xb7822f].map(c=>M(c,.6,.1));
const shutterMats = [0x2f5a3a,0x244b6b,0x7a2f2f,0x3a3a3f].map(c=>M(c,.7,0));
const garageMat = M(0xffffff,.6,.2,{map:garageTex});
const brickMat = M(0x8d4a3a,.9,0);
const fenceMat = flat(M(0xffffff,.8,0,{map:fenceTex,transparent:true,alphaTest:.5,side:THREE.DoubleSide}));
const hedgeMat = M(0x2f6b34,.95,0,{flatShading:true});
const leaves = [0x3e8a3a,0x4a9a44,0x2f7a3c,0x58a04a,0x6aa84e,0x3a7a2f].map(c=>M(c,.85,0,{flatShading:true}));
const autumn = [0xc9742a,0xb8452d,0xd9a42f].map(c=>M(c,.85,0,{flatShading:true}));
const pineMat = [0x1f5a3a,0x2a6b44].map(c=>M(c,.9,0,{flatShading:true}));
const flowerMats = [0xff4f7a,0xffd23f,0xffffff,0xb06bff,0xff8a3c].map(c=>M(c,.7,0,{flatShading:true}));
const soilMat = M(0x4a3626,1,0);
const sandMat = M(0xd9c48f,1,0);
const waterMat = M(0xffffff,.05,.2,{map:waterTex,transparent:true,opacity:.85,emissive:0x0b3a4d,emissiveIntensity:.35});
const poolWaterMat = M(0x35b9d9,.05,.2,{emissive:0x0b6d86,emissiveIntensity:.5});
const lampHeadMat = emis(M(0xfff0cf,.3,.1,{emissive:0xffd9a0,emissiveIntensity:.1}),3.2,.04);
const porchLightMat = emis(M(0xfff0cf,.3,.1,{emissive:0xffd9a0,emissiveIntensity:0}),2.5,0);
const beaconMat = M(0xff2020,.3,0,{emissive:0xff1010,emissiveIntensity:1});
const tlMats = [0,1].map(()=>({
  r:M(0x220808,.3,0,{emissive:0xff2a2a,emissiveIntensity:.1}), y:M(0x221a08,.3,0,{emissive:0xffbb22,emissiveIntensity:.1}), g:M(0x082210,.3,0,{emissive:0x22ff66,emissiveIntensity:.1})
}));
const carPaints = [0xc0392b,0x2b6cb0,0xe5e7e9,0x222428,0xd9a41e,0x3f7d4e,0x8c93a0,0xe8734a,0x5c3f87].map(c=>M(c,.3,.55));
const carGlass = M(0x121c26,.08,.85);
const tireMat = M(0x111214,.9,0);
const headMat = M(0xffffff,.2,.1,{emissive:0xfff2cc,emissiveIntensity:.4});
const tailMat = M(0x330000,.2,.1,{emissive:0xff1a1a,emissiveIntensity:.5});
const poolStone = decal(M(0xa4a39c,.9,.02,{map:stuccoTex}));
const curbMat = M(0xc8c7c0,.8,0);
const plateMat = M(0xeeeeee,.5,0);
const busPaint = M(0xe5b61a,.35,.4);
const skinMats = [0xc9916e,0x8d5a3b,0xf0c9a5,0x6b4228].map(c=>M(c,.8,0));
const clothMats = [0xc0392b,0x2b6cb0,0xe5e7e9,0x2c3e50,0xd9a41e,0x3f7d4e,0x8e44ad,0xe67e22,0x16a085].map(c=>M(c,.85,0));
const pantsMats = [0x222a33,0x394a5c,0x4a3b2c,0x1b1b1f].map(c=>M(c,.9,0));
const billboards = [["VOLT CITY","#0b7a6a","#12304a"],["URBAN RIDE","#a02a5a","#35124a"],["CAFE CENTRAL","#b8641c","#4a2410"]].map(a=>{ const t=billboardTex(a[0],a[1],a[2]); return emis(M(0xffffff,.5,0,{map:t,emissiveMap:t,emissive:0xffffff,emissiveIntensity:.3}),.9,.35); });
const redMark = M(0xc0392b,.6,0);
const hydrantMat = M(0xc2272d,.5,.3);
const binMat = M(0x2d4a3a,.6,.4);
const mailMat = M(0x1b4f9c,.5,.4);
const signGreen = M(0x1d6b3d,.5,.2);
const shirtSign = M(0xf2f2f2,.5,0);

/* ===== fachadas: materiais com tinta ===== */
const facadeMats = {};
function facadeMat(style, tint){
  const k = style+tint; if (facadeMats[k]) return facadeMats[k];
  const s = facadeSetCached(style);
  const m = M(tint, style==="glass"?.2:.85, style==="glass"?.65:.04, { map:s.map, emissiveMap:s.emi, emissive:0xffffff, emissiveIntensity:0 });
  emis(m,1.5,0); return (facadeMats[k]=m);
}
const roofSlabMat = M(0x6b6e73,.95,0);
const shopSets = [["#c0392b",11],["#1f6fb0",22],["#2d8a4e",33],["#8e44ad",44]].map(a=>{ const t=shopTex(a[0],"",a[1]); return emis(M(0xffffff,.55,.1,{map:t.map,emissiveMap:t.emi,emissive:0xffffff,emissiveIntensity:.25}),1.2,.25); });
const awningMats = ["#c0392b","#1f6fb0","#2d8a4e","#d9a41e"].map(c=>M(0xffffff,.8,0,{map:stripeTexFor(c),side:THREE.DoubleSide}));

/* ===================== ILUMINACAO / CEU ===================== */
const hemi = new THREE.HemisphereLight(0xcfe8ff,0x4a5a44,1.1); scene.add(hemi);
const ambient = new THREE.AmbientLight(0xffffff,0.25); scene.add(ambient);
const sun = new THREE.DirectionalLight(0xfff2dc,2.6);
sun.castShadow = true;
const SM = isMobile ? 1024 : 2048;
sun.shadow.mapSize.set(SM,SM);
const SH = 64;
Object.assign(sun.shadow.camera,{left:-SH,right:SH,top:SH,bottom:-SH,near:1,far:420});
sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.04;
scene.add(sun); scene.add(sun.target);

const skyMat = new THREE.ShaderMaterial({
  side:THREE.BackSide, depthWrite:false, fog:false,
  uniforms:{ top:{value:new THREE.Color()}, bot:{value:new THREE.Color()}, sunDir:{value:new THREE.Vector3(0,1,0)}, sunCol:{value:new THREE.Color()}, sunAmt:{value:1} },
  vertexShader:"varying vec3 vP; void main(){ vP=normalize(position); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }",
  fragmentShader:"uniform vec3 top; uniform vec3 bot; uniform vec3 sunCol; uniform vec3 sunDir; uniform float sunAmt; varying vec3 vP; void main(){ float h=clamp(vP.y,0.0,1.0); vec3 c=mix(bot,top,pow(h,0.55)); float s=max(dot(normalize(vP),normalize(sunDir)),0.0); c+=sunCol*(pow(s,700.0)*2.2+pow(s,10.0)*0.28*sunAmt); gl_FragColor=vec4(c,1.0); }"
});
const sky = new THREE.Mesh(new THREE.SphereGeometry(1400,32,16), skyMat); sky.renderOrder = -10; scene.add(sky);

const starGeo = new THREE.BufferGeometry(); { const p=[]; for(let i=0;i<900;i++){ const a=Math.random()*Math.PI*2, b=Math.acos(Math.random()*.95+.04); p.push(Math.sin(b)*Math.cos(a)*1300,Math.cos(b)*1300,Math.sin(b)*Math.sin(a)*1300);} starGeo.setAttribute("position",new THREE.Float32BufferAttribute(p,3)); }
const starMat = new THREE.PointsMaterial({color:0xffffff,size:3.2,sizeAttenuation:false,transparent:true,opacity:0,fog:false,depthWrite:false});
const stars = new THREE.Points(starGeo,starMat); scene.add(stars);

const clouds = []; { const cm = new THREE.MeshBasicMaterial({map:cloudTex,transparent:true,depthWrite:false,fog:false,opacity:.85});
  for(let i=0;i<22;i++){ const c=new THREE.Mesh(new THREE.PlaneGeometry(rr(220,420),rr(110,200)),cm); c.position.set(rr(-1000,1000),rr(210,330),rr(-1000,1000)); c.rotation.x=Math.PI/2; scene.add(c); clouds.push(c);} 
  clouds.mat = cm; }

const STATES = [
  { name:"DIA", top:0x2f7fd6, bot:0xbfe0f5, sun:0xfff2dc, sunI:2.7, hs:0xcfe8ff, hg:0x4a5a44, hI:1.1, amb:.3, dir:[.55,.72,.42], night:0, star:0, expo:1.0, cloud:.85 },
  { name:"POR DO SOL", top:0x37478f, bot:0xff9a5a, sun:0xffa466, sunI:2.1, hs:0xffc9a0, hg:0x3b3040, hI:.8, amb:.25, dir:[-.85,.2,.5], night:.4, star:.12, expo:1.05, cloud:.7 },
  { name:"NOITE", top:0x040813, bot:0x1b2745, sun:0x8fb4ff, sunI:.6, hs:0x3a5486, hg:0x0d1118, hI:.6, amb:.22, dir:[-.4,.65,-.5], night:1, star:1, expo:1.2, cloud:.18 },
  { name:"AMANHECER", top:0x3b5a9a, bot:0xffb98a, sun:0xffc48a, sunI:2.0, hs:0xffd9b8, hg:0x3b3a40, hI:.8, amb:.25, dir:[.85,.2,.5], night:.35, star:.1, expo:1.05, cloud:.75 }
];
const cur = { top:new THREE.Color(), bot:new THREE.Color(), sun:new THREE.Color(), hs:new THREE.Color(), hg:new THREE.Color(), sunI:0, hI:0, amb:0, dir:new THREE.Vector3(), night:0, star:0, expo:1, cloud:1 };
let stateIdx = 0;
function setStateInstant(i){ const s=STATES[i]; cur.top.setHex(s.top); cur.bot.setHex(s.bot); cur.sun.setHex(s.sun); cur.hs.setHex(s.hs); cur.hg.setHex(s.hg); cur.sunI=s.sunI; cur.hI=s.hI; cur.amb=s.amb; cur.dir.set(...s.dir).normalize(); cur.night=s.night; cur.star=s.star; cur.expo=s.expo; cur.cloud=s.cloud; }
const _c = new THREE.Color();
function blendState(dt){
  const s=STATES[stateIdx], k=1-Math.exp(-dt*(F2.auto()?.45:1.6));
  cur.top.lerp(_c.setHex(s.top),k); cur.bot.lerp(_c.setHex(s.bot),k); cur.sun.lerp(_c.setHex(s.sun),k); cur.hs.lerp(_c.setHex(s.hs),k); cur.hg.lerp(_c.setHex(s.hg),k);
  cur.sunI=lerp(cur.sunI,s.sunI,k); cur.hI=lerp(cur.hI,s.hI,k); cur.amb=lerp(cur.amb,s.amb,k); cur.night=lerp(cur.night,s.night,k); cur.star=lerp(cur.star,s.star,k); cur.expo=lerp(cur.expo,s.expo,k); cur.cloud=lerp(cur.cloud,s.cloud,k);
  cur.dir.lerp(_c2.set(...s.dir).normalize(),k).normalize();
}
const _c2 = new THREE.Vector3();
function applyEnv(){
  skyMat.uniforms.top.value.copy(cur.top); skyMat.uniforms.bot.value.copy(cur.bot);
  skyMat.uniforms.sunDir.value.copy(cur.dir); skyMat.uniforms.sunCol.value.copy(cur.sun); skyMat.uniforms.sunAmt.value = 1-cur.night*.7;
  scene.fog.color.copy(cur.bot).convertSRGBToLinear();
  hemi.color.copy(cur.hs); hemi.groundColor.copy(cur.hg); hemi.intensity=cur.hI; ambient.intensity=cur.amb;
  sun.color.copy(cur.sun); sun.intensity=cur.sunI; renderer.toneMappingExposure=cur.expo;
  starMat.opacity = cur.star; clouds.mat.opacity = cur.cloud*.85; clouds.mat.color.setScalar(.35+.65*(1-cur.night*.85));
  poolGlowMat.opacity = clamp(cur.night*.75,0,.75);
  glowPoints.material.opacity = clamp(cur.night*1.1,0,1);
  for (const e of emisList) e.m.emissiveIntensity = e.base*(e.floor + (1-e.floor)*cur.night);
  headSpot.intensity = cur.night*3.2;
}

/* ===================== BATCHER (geometria estatica mesclada) ===================== */
const F = {x:0,z:0,ry:0,s:0,c:1};
function setFrame(x,z,ry){ F.x=x; F.z=z; F.ry=ry; F.s=Math.sin(ry); F.c=Math.cos(ry); }
function W(lx,lz){ return [F.x+lx*F.c+lz*F.s, F.z-lx*F.s+lz*F.c]; }
function sub(lx,lz,ry,fn){ const o={x:F.x,z:F.z,ry:F.ry}; const w=W(lx,lz); setFrame(w[0],w[1],o.ry+ry); fn(); setFrame(o.x,o.z,o.ry); }
const buckets = new Map();
const chunk = (x,z) => Math.floor((x+420)/200)*10 + Math.floor((z+420)/200);
function bucket(m,x,z){ const k=m.uuid+"|"+chunk(x,z); let b=buckets.get(k); if(!b){ b={mat:m,pos:[],nor:[],uv:[]}; buckets.set(k,b);} return b; }
const baseCache = new Map();
function nonIdx(g){ let r=baseCache.get(g); if(!r){ r = g.index ? g.toNonIndexed() : g; baseCache.set(g,r);} return r; }
const _m4=new THREE.Matrix4(), _q=new THREE.Quaternion(), _e=new THREE.Euler(), _v=new THREE.Vector3(), _s=new THREE.Vector3(), _n3=new THREE.Matrix3(), _p=new THREE.Vector3();
const UB = new THREE.BoxGeometry(1,1,1);
const UC = new THREE.CylinderGeometry(1,1,1,12);
const UC6 = new THREE.CylinderGeometry(1,1,1,6);
const UCone = new THREE.ConeGeometry(1,1,10);
const UI = new THREE.IcosahedronGeometry(1,1);
const USph = new THREE.SphereGeometry(1,12,8);
function put(m,geo,x,y,z,sx,sy,sz,rx,ry,rz,uvS){
  const g = nonIdx(geo); const w = W(x,z);
  _e.set(rx||0,(ry||0)+F.ry,rz||0,"YXZ"); _q.setFromEuler(_e); _v.set(w[0],y,w[1]); _s.set(sx,sy,sz);
  _m4.compose(_v,_q,_s); _n3.getNormalMatrix(_m4);
  const b = bucket(m,w[0],w[1]);
  const pa=g.attributes.position.array, na=g.attributes.normal.array, ua=g.attributes.uv?g.attributes.uv.array:null;
  const n=pa.length/3;
  for(let i=0;i<n;i++){
    _p.set(pa[i*3],pa[i*3+1],pa[i*3+2]).applyMatrix4(_m4); b.pos.push(_p.x,_p.y,_p.z);
    _p.set(na[i*3],na[i*3+1],na[i*3+2]).applyMatrix3(_n3).normalize(); b.nor.push(_p.x,_p.y,_p.z);
    let u=ua?ua[i*2]:0, v=ua?ua[i*2+1]:0;
    if(uvS && geo===UB){ const f=Math.floor(i/6); if(f<2){u*=sz/uvS[0];v*=sy/uvS[1];} else if(f<4){u*=sx/uvS[0];v*=sz/uvS[1];} else {u*=sx/uvS[0];v*=sy/uvS[1];} }
    b.uv.push(u,v);
  }
}
function box(m,w,h,d,x,y0,z,ry,uv,rx,rz){ put(m,UB,x,y0+h/2,z,w,h,d,rx||0,ry||0,rz||0,uv); }
function cyl(m,r,h,x,y0,z,seg6){ put(m,seg6?UC6:UC,x,y0+h/2,z,r,h,r); }
function cone(m,r,h,x,y0,z){ put(m,UCone,x,y0+h/2,z,r,h,r); }
function ico(m,r,x,y,z,sx,sy,sz,ry){ put(m,UI,x,y,z,r*(sx||1),r*(sy||1),r*(sz||1),0,ry||0,0); }
function sph(m,r,x,y,z,sx,sy,sz){ put(m,USph,x,y,z,r*(sx||1),r*(sy||1),r*(sz||1)); }
function raw(m,tris,uvs){
  const w0=W(tris[0][0],tris[0][2]); const b=bucket(m,w0[0],w0[1]);
  const P=tris.map(t=>{ const w=W(t[0],t[2]); return [w[0],t[1],w[1]]; });
  for(let t=0;t<P.length;t+=3){
    const A=P[t],B=P[t+1],C=P[t+2];
    let ax=B[0]-A[0],ay=B[1]-A[1],az=B[2]-A[2],bx=C[0]-A[0],by=C[1]-A[1],bz=C[2]-A[2];
    let nx=ay*bz-az*by, ny=az*bx-ax*bz, nz=ax*by-ay*bx; const l=Math.hypot(nx,ny,nz)||1; nx/=l;ny/=l;nz/=l;
    for(let k=0;k<3;k++){ const p=P[t+k]; b.pos.push(p[0],p[1],p[2]); b.nor.push(nx,ny,nz); const uv=uvs?uvs[t+k]:[0,0]; b.uv.push(uv[0],uv[1]); }
  }
}
function quad(m,y,x,z,w,d,tile,centered){
  const hw=w/2,hd=d/2; const pts=[[x-hw,z-hd],[x-hw,z+hd],[x+hw,z+hd],[x+hw,z-hd]];
  const wp=pts.map(p=>W(p[0],p[1]));
  const uvf=(i)=> centered ? [(pts[i][0]-x)/tile+.5,(pts[i][1]-z)/tile+.5] : [wp[i][0]/tile,wp[i][1]/tile];
  const b=bucket(m,wp[0][0],wp[0][1]);
  for(const idx of [0,1,2,0,2,3]){ b.pos.push(wp[idx][0],y,wp[idx][1]); b.nor.push(0,1,0); const uv=uvf(idx); b.uv.push(uv[0],uv[1]); }
}
function vquad(m,x1,z1,x2,z2,y0,h,tu,tv){
  const a=W(x1,z1), c=W(x2,z2); const len=Math.hypot(c[0]-a[0],c[1]-a[1]);
  const b=bucket(m,a[0],a[1]);
  const dx=c[0]-a[0], dz=c[1]-a[1]; const l=Math.hypot(dx,dz)||1; const nx=-dz/l, nz=dx/l;
  const V=[[a[0],y0,a[1],0,0],[c[0],y0,c[1],len/tu,0],[c[0],y0+h,c[1],len/tu,h/tv],[a[0],y0,a[1],0,0],[c[0],y0+h,c[1],len/tu,h/tv],[a[0],y0+h,a[1],0,h/tv]];
  for(const v of V){ b.pos.push(v[0],v[1],v[2]); b.nor.push(nx,0,nz); b.uv.push(v[3],v[4]); }
}
function flushBuckets(){
  for(const b of buckets.values()){
    const g=new THREE.BufferGeometry();
    g.setAttribute("position",new THREE.Float32BufferAttribute(b.pos,3));
    g.setAttribute("normal",new THREE.Float32BufferAttribute(b.nor,3));
    g.setAttribute("uv",new THREE.Float32BufferAttribute(b.uv,2));
    g.computeBoundingSphere();
    const mesh=new THREE.Mesh(g,b.mat); mesh.castShadow=!b.mat.userData.noCast; mesh.receiveShadow=true; scene.add(mesh);
  }
  buckets.clear();
}

/* ===================== COLISOES ===================== */
const cols = []; const colHash = new Map();
const hkey = (i,j) => (i+200)*1000 + (j+200);
function addCol(c){
  cols.push(c);
  const x0=c.t===0?c.x-c.hw:c.x-c.r, x1=c.t===0?c.x+c.hw:c.x+c.r, z0=c.t===0?c.z-c.hd:c.z-c.r, z1=c.t===0?c.z+c.hd:c.z+c.r;
  for(let i=Math.floor(x0/16);i<=Math.floor(x1/16);i++)for(let j=Math.floor(z0/16);j<=Math.floor(z1/16);j++){ const k=hkey(i,j); let a=colHash.get(k); if(!a){a=[];colHash.set(k,a);} a.push(c); }
}
function colBox(lx,lz,w,d,ht){ const p=W(lx,lz); const sw=Math.abs(F.s)>.5; addCol({t:0,x:p[0],z:p[1],hw:(sw?d:w)/2,hd:(sw?w:d)/2,ht:ht||3}); }
function colCirc(lx,lz,r,ht){ const p=W(lx,lz); addCol({t:1,x:p[0],z:p[1],r:r,ht:ht||4}); }

/* ===================== OBJETOS DA CIDADE ===================== */
const G = 0.17; // altura da calcada
let GY=G; const PL={bench:[],lamp:[],hyd:[],mail:[],bin:[],bag:[],tree0:[],tree1:[],tree2:[],tree3:[],palm0:[],palm1:[],palm2:[],palm3:[],palm4:[],car0:[],car1:[],car2:[],car3:[],car4:[],car5:[],car6:[],car7:[],car8:[],car9:[],car10:[]}; const PARK=[1,3,5,6,7,9], TRAF=[0,1,2,3,4,5,6,7,9,10], CARLEN=[4.4,4.5,4.0,5.2,4.6,4.2,4.2,4.2,9.5,5.0,4.6], CT={}; const FARM=[], TFAR=isMobile?170:260;
const lampGlowPts = []; const lampPoolList = [];

let GTREES=0; const NOP=()=>{};
function tree(lx,lz,kind){
  const w=W(lx,lz); const sc=rr(.85,1.4); const ry=R()*6.28;
  const x=lx, z=lz;
  const glb=true; if(kind==="glb") kind=null;
  kind = kind || pick(["round","round","round","pine","birch"]);
  const th = 2.2*sc;
  const draw=(cyl,cone,ico)=>{
    if(kind==="pine"){
      cyl(barkMat,.2*sc,1.2*sc,x,G,z,true);
      const m=pick(pineMat);
      for(let i=0;i<4;i++) cone(m,(2.0-i*.4)*sc,(2.2-i*.2)*sc,x,G+(1.0+i*1.25)*sc,z);
    } else {
      cyl(barkMat,.2*sc,th,x,G,z,true);
      const lm=R()<.12?pick(autumn):pick(leaves);
      const lm2=R()<.12?lm:pick(leaves);
      const r0=(kind==="birch"?1.5:2.0)*sc;
      ico(lm,r0,x,G+th+r0*.55,z,1,.9,1,ry);
      ico(lm2,r0*.72,x+r0*.55,G+th+r0*.2,z+r0*.2,1,.9,1,ry+1);
      ico(lm,r0*.7,x-r0*.5,G+th+r0*.28,z-r0*.3,1,.9,1,ry+2);
      ico(lm2,r0*.6,x+r0*.1,G+th+r0*.95,z-r0*.5,1,.9,1,ry+3);
    }
  };
  if(glb){ draw(NOP,NOP,NOP); GTREES++; PL["tree"+((Math.random()*4)|0)].push([w[0],w[1],ry,GY,sc*.85]); }
  else draw(cyl,cone,ico);
  colCirc(x,z,.42,12);
}
function bush(lx,lz,r){ const m=pick(leaves); ico(m,r||.6,lx,G+(r||.6)*.7,lz,1,.8,1,R()*6); }
function flowerBed(lx,lz,w,d){
  box(stoneMat,w+.4,.3,d+.4,lx,G,lz); box(soilMat,w,.34,d,lx,G,lz);
  const n=Math.floor(w*d*2.2);
  for(let i=0;i<n;i++){ const m=flowerMats[(Math.random()*flowerMats.length)|0]; sph(m,.14,lx+rr(-w/2,w/2),G+.5,lz+rr(-d/2,d/2)); }
  for(let i=0;i<Math.floor(n/2);i++) ico(leaves[2],.16,lx+rr(-w/2,w/2),G+.36,lz+rr(-d/2,d/2));
}
function bench(lx,lz,ry){ const w=W(lx,lz); PL.bench.push([w[0],w[1],F.ry+ry,GY]); sub(lx,lz,ry,()=>colBox(0,0,1.9,.8,1)); }
function trashBag(lx,lz){ const w=W(lx,lz); PL.bag.push([w[0],w[1],Math.random()*6.28,GY]); }
function trashBin(lx,lz,mdl){ if(mdl){ const w=W(lx,lz); PL.bin.push([w[0],w[1],0,GY]); colCirc(lx,lz,.4,1); return; } cyl(binMat,.28,.85,lx,G,lz); cyl(metalDark,.3,.06,lx,G+.85,lz); cyl(metalDark,.04,.06,lx,G+.91,lz); colCirc(lx,lz,.3,1); }
function hydrant(lx,lz){ const w=W(lx,lz); PL.hyd.push([w[0],w[1],0,GY]); colCirc(lx,lz,.25,1); }
function mailbox(lx,lz){ const w=W(lx,lz); PL.mail.push([w[0],w[1],F.ry,GY]); colCirc(lx,lz,.3,1.4); }
function lamp(lx,lz,ry){
  const wp=W(lx,lz); PL.lamp.push([wp[0],wp[1],F.ry+ry,GY]);
  colCirc(lx,lz,.25,7);
  const hp=[wp[0]+Math.cos(ry)*2.0, GY+6.3, wp[1]-Math.sin(ry)*2.0];
  lampGlowPts.push(hp[0],hp[1],hp[2]);
  lampPoolList.push([hp[0],hp[2]]);
}
function parkLamp(lx,lz){
  cyl(metalDark,.18,.4,lx,G,lz); cyl(metalDark,.05,3.4,lx,G+.4,lz); sph(lampHeadMat,.28,lx,G+3.9,lz);
  box(metalDark,.5,.06,.5,lx,G+3.62,lz); cone(metalDark,.34,.2,lx,G+4.12,lz);
  const w=W(lx,lz); lampGlowPts.push(w[0],G+3.9,w[1]); lampPoolList.push([w[0],w[1]]);
  colCirc(lx,lz,.22,4);
}
function trafficLight(lx,lz,sx,sz){
  // poste no canto + cabecas voltadas para as duas vias
  cyl(metalDark,.09,5.2,lx,G,lz); cyl(metalDark,.18,.4,lx,G,lz);
  const heads = [ [sx,0,0], [0,sz,1] ]; // dir da via de aproximacao: eixo 0 = x, 1 = z
  for(const h of heads){
    const dx=h[0], dz=h[1], ax=h[2];
    const hx=lx+dx*.35, hz=lz+dz*.35, ry = dx? (dx>0?Math.PI/2:-Math.PI/2) : (dz>0?0:Math.PI);
    sub(hx,hz,ry,()=>{});
    const o={x:F.x,z:F.z,ry:F.ry}; const w=W(hx,hz); setFrame(w[0],w[1],o.ry+ry);
    box(metalDark,.34,1.05,.3,0,G+3.75,0);
    box(metalDark,.44,.06,.36,0,G+4.8,0);
    sph(tlMats[ax].r,.11,0,G+4.5,.17,1,1,.5); sph(tlMats[ax].y,.11,0,G+4.2,.17,1,1,.5); sph(tlMats[ax].g,.11,0,G+3.9,.17,1,1,.5);
    setFrame(o.x,o.z,o.ry);
  }
  colCirc(lx,lz,.25,5);
}
function carSpecs(kind){
  const T = { sedan:{L:4.4,W:1.82,bh:.62,ch:.52,cl:2.1,cz:.25,col:0}, hatch:{L:3.9,W:1.75,bh:.66,ch:.58,cl:2.3,cz:.35,col:0}, van:{L:5.1,W:2.0,bh:1.25,ch:.7,cl:3.6,cz:.3,col:0} }[kind];
  return T;
}
function carBatch(lx,lz,ry,kind,paint){ const w=W(lx,lz); const i=PARK[(Math.random()*PARK.length)|0]; if(Math.random()<.5) return false; PL["car"+i].push([w[0],w[1],F.ry+ry+(Math.random()<.5?Math.PI:0),.02]); return true; }
function carMeshGroup(kind,paint){ const i=TRAF[(Math.random()*TRAF.length)|0]; const g=new THREE.Group(); g.userData.wheels=[]; g.userData.L=CARLEN[i]; g.userData.mdl=i; return g; }
function busMeshGroup(){ const g=new THREE.Group(); g.userData.wheels=[]; g.userData.L=CARLEN[8]; g.userData.mdl=8; return g; }
function busStop(lx,lz,ry){
  sub(lx,lz,ry,()=>{
    for(const x of [-1.7,1.7]) box(metalDark,.08,2.5,.08,x,G,0);
    box(metalDark,3.8,.12,1.4,0,G+2.5,.2);
    box(busGlass,3.6,2.2,.04,0,G+.2,-.55);
    box(busGlass,.04,2.2,1.2,-1.75,G+.2,.1);
    box(woodMat,2.4,.08,.5,0,G+.5,-.25); box(metalDark,.06,.5,.4,-1,G,-.25); box(metalDark,.06,.5,.4,1,G,-.25);
    cyl(metalDark,.04,3,2.4,G,.8); box(signGreen,.5,.5,.05,2.4,G+2.7,.8);
  });
  sub(lx,lz,ry,()=>colBox(0,0,3.8,1.4,2.6));
}
/* ---- casas ---- */
function gableRoof(roofM,wallM,w,d,h,x,y0,z){
  const oh=.45, hw=w/2+.35, D=d/2+oh, sl=Math.hypot(h,D), S=2.2;
  const P0=[x-hw,y0,z+D],P1=[x+hw,y0,z+D],P2=[x+hw,y0+h,z],P3=[x-hw,y0+h,z];
  const uF=2*hw/S, vF=sl/S;
  raw(roofM,[P0,P1,P2,P0,P2,P3],[[0,0],[uF,0],[uF,vF],[0,0],[uF,vF],[0,vF]]);
  const Q0=[x+hw,y0,z-D],Q1=[x-hw,y0,z-D],Q2=[x-hw,y0+h,z],Q3=[x+hw,y0+h,z];
  raw(roofM,[Q0,Q1,Q2,Q0,Q2,Q3],[[0,0],[uF,0],[uF,vF],[0,0],[uF,vF],[0,vF]]);
  const hg=h;
  raw(wallM,[[x+w/2,y0,z+d/2],[x+w/2,y0,z-d/2],[x+w/2,y0+hg,z]],[[0,0],[1,0],[.5,.6]]);
  raw(wallM,[[x-w/2,y0,z-d/2],[x-w/2,y0,z+d/2],[x-w/2,y0+hg,z]],[[0,0],[1,0],[.5,.6]]);
  box(trimMat,2*hw,.12,.3,x,y0+h-.04,z);
}
function houseWindow(lx,ly,lz,ry,w,h,shutters,sm){
  sub(lx,lz,ry,()=>{
    box(trimMat,w+.22,h+.22,.12,0,ly-.11,0);
    box(pick(glassWin),w,h,.16,0,ly,0);
    box(trimMat,w+.06,.05,.06,0,ly+h*.5,.08); box(trimMat,.05,h,.06,0,ly,.08);
    box(stoneMat,w+.5,.09,.32,0,ly-.17,.08);
    if(shutters){ box(sm,.4,h+.1,.06,-(w/2+.4),ly-.05,.02); box(sm,.4,h+.1,.06,(w/2+.4),ly-.05,.02); }
  });
}
function fenceRun(x1,z1,x2,z2,solid){
  vquad(fenceMat,x1,z1,x2,z2,G,1.15,2,1.15);
  const dx=x2-x1,dz=z2-z1,len=Math.hypot(dx,dz);
  const n=Math.max(1,Math.round(len/3));
  for(let i=0;i<=n;i++){ const t=i/n; box(trimMat,.14,1.3,.14,x1+dx*t,G,z1+dz*t); }
  const mx=(x1+x2)/2,mz=(z1+z2)/2; const horiz=Math.abs(dx)>Math.abs(dz);
  colBox(mx,mz,horiz?len:.25,horiz?.25:len,1.2);
}
function house(lotSeed){
  // coordenadas locais: frente em +z, lote de -14 a 14
  const w=ri(10,15), d=ri(8,11), hz=-2.5;
  const type = pick(["gable2","gable2","gable1","modern","gable1"]);
  const wall=pick(wallMats), roof=pick(roofMats), door=pick(doorMats), sm=pick(shutterMats);
  const floors = type==="gable1"?1:2, wh = floors*3.0+.2;
  const y0=G;
  const frontZ=hz+d/2;
  let garageX=null;
  box(darkConcrete,w+.3,.5,d+.3,0,y0,hz);
  if(type==="modern"){
    box(wall,w,3.1,d,0,y0+.3,hz);
    box(M(0xe9e6df,.8,0),w*.78,3.1,d*.86,w*.1,y0+3.4,hz-.5);
    box(woodMat,w*.34,3.1,.12,-w*.28,y0+3.4,hz+d*.43-.5+.1);
    box(gravelMat,w+.5,.3,d+.5,0,y0+3.4+3.1,hz); box(trimMat,w*.78+.4,.15,d*.86+.4,w*.1,y0+3.4+3.1,hz-.5);
    box(darkConcrete,w+.4,.2,d+.4,0,y0+3.4,hz);
    // vidro grande
    box(glassBlue,w*.5,2.2,.1,w*.12,y0+.8,frontZ+.02); box(metalDark,w*.5+.15,.1,.14,w*.12,y0+3.0,frontZ+.02);
    for(let i=0;i<4;i++) box(metalDark,.06,2.2,.14,w*.12-w*.25+i*w*.167,y0+.8,frontZ+.03);
    box(glassBlue,w*.55,1.7,.1,w*.14,y0+4.0,hz+d*.43-.5+.04); box(metalDark,w*.55+.12,.08,.14,w*.14,y0+5.7,hz+d*.43-.5+.04);
    colBox(0,hz,w+.3,d+.3,6.8);
  } else {
    box(wall,w,wh-.2,d,0,y0+.3,hz,0,[4,4]);
    gableRoof(roof,wall,w,d,type==="gable1"?2.0:2.6,0,y0+wh+.1,hz);
    colBox(0,hz,w+.3,d+.3,wh+3);
    // chamine
    box(brickMat,.8,2.6,.8,w*.28,y0+wh-.4,hz-d*.2); box(darkConcrete,1,.15,1,w*.28,y0+wh+2.2,hz-d*.2);
    // janelas
    const nWin=Math.max(2,Math.floor(w/3.6)); const doorX=-w/2+2.0;
    for(let r=0;r<floors;r++){
      for(let i=0;i<nWin;i++){ const x=-w/2+(i+.5)*(w/nWin); if(r===0&&Math.abs(x-doorX)<1.5) continue; houseWindow(x,y0+.3+r*3.0+.95,frontZ+.0,0,1.25,1.4,R()<.6,sm); }
      for(let i=0;i<2;i++){ houseWindow(w/2,y0+.3+r*3.0+.95,hz-d*.25+i*d*.4,Math.PI/2,1.2,1.4,false,sm); houseWindow(-w/2,y0+.3+r*3.0+.95,hz-d*.25+i*d*.4,-Math.PI/2,1.2,1.4,false,sm); houseWindow(-w*.2+i*w*.4,y0+.3+r*3.0+.95,hz-d/2,Math.PI,1.25,1.4,false,sm); }
    }
    // porta + alpendre
    box(door,1.05,2.15,.14,doorX,y0+.4,frontZ+.02); sph(metalLight,.05,doorX+.38,y0+1.4,frontZ+.12);
    box(trimMat,1.35,.1,.2,doorX,y0+2.58,frontZ+.05); box(trimMat,.14,2.2,.2,doorX-.6,y0+.4,frontZ+.05); box(trimMat,.14,2.2,.2,doorX+.6,y0+.4,frontZ+.05);
    box(concreteMat,3.2,.22,1.9,doorX,y0+.02,frontZ+.9); box(concreteMat,2.2,.12,.5,doorX,y0+0,frontZ+2.0);
    for(const s of [-1.45,1.45]) cyl(trimMat,.1,2.6,doorX+s,y0+.24,frontZ+1.7);
    box(roof,3.6,.18,2.2,doorX,y0+2.82,frontZ+1.0); box(porchLightMat,.18,.22,.12,doorX+.9,y0+2.0,frontZ+.1);
    lampGlowPts.push(...W(doorX+.9,frontZ+.2).slice(0,1),y0+2.1,W(doorX+.9,frontZ+.2)[1]);
    box(M(0x2d3036,.5,.4),.3,.15,.04,doorX-.4,y0+2.1,frontZ+.1);
    // garagem
    if(R()<.7){
      const gx=w/2+2.3; garageX=gx;
      box(wall,4.4,3.0,6,gx,y0+.3,hz+.5); box(roof,4.9,.2,6.5,gx,y0+3.3,hz+.5);
      box(garageMat,3.4,2.4,.1,gx,y0+.3,hz+3.5+.02); box(trimMat,3.7,.18,.15,gx,y0+2.7,hz+3.5+.02);
      colBox(gx,hz+.5,4.5,6,3.4);
      quad(pavePlazaMat,y0+.002,gx,hz+3.5+(14-(hz+3.5))/2,4.2,14-(hz+3.5),4,false);
      if(R()<.5) carBatch(gx,hz+9,Math.PI,pick(["sedan","hatch"]),pick(carPaints));
    }
  }
  // gramado e plantas
  quad(brickPathMat,G+.004,0,0,1.5,0.1,3,false);
  const px=-w/2+2.0; quad(brickPathMat,G+.01,px,(frontZ+1.6+14)/2,1.4,14-(frontZ+1.6),2.5,false);
  for(let i=0;i<ri(2,4);i++) bush(pick([-w/2+.7,w/2-.7,-w/2+4.4,w/2-3]),frontZ+.7,rr(.45,.75));
  if(R()<.6) flowerBed(rr(-w/2+4.6,w/2-1),frontZ+.8,2,.6);
  tree(rr(-12,-6),rr(4,11),"glb"); if(R()<.5) tree(rr(8,12),rr(-12,-6),"glb");
  if(R()<.25){ // piscina
    quad(poolStone,G+.01,6,-10.2,8,5,3,false); quad(poolWaterMat,G+.03,6,-10.2,6.6,3.6,3,false);
  }
  if(R()<.4){ box(wall,2.6,2.2,2.2,-10.5,y0,-11); gableRoof(roof,wall,2.6,2.2,1.0,-10.5,y0+2.2,-11); colBox(-10.5,-11,2.7,2.3,3); }
  // cerca
  const gapA=px, gapB=-w/2+10; // caminho e entrada garagem
  const fz=13.4;
  { const gaps=[[px-1.0,px+1.0]]; if(garageX!==null) gaps.push([garageX-2.4,garageX+2.4]); gaps.sort((a,b)=>a[0]-b[0]);
    let x0=-13.4; for(const g of gaps){ if(g[0]-x0>.5) fenceRun(x0,fz,g[0],fz); x0=Math.max(x0,g[1]); } if(13.4-x0>.5) fenceRun(x0,fz,13.4,fz); }
  fenceRun(-13.4,-13.4,-13.4,fz); fenceRun(13.4,-13.4,13.4,fz); fenceRun(-13.4,-13.4,13.4,-13.4);
  box(metalDark,.5,.35,.06,13.0,G+1.0,fz-.2); mailbox(-13.2,fz+.5);
}
/* ---- predios ---- */
function skyscraper(cx,cz,w,d,floors,style,tint,opts){
  opts=opts||{};
  setFrame(0,0,0);
  const fm=facadeMat(style,tint), sm=pick(shopSets);
  const sw=w+.8, sd=d+.8;
  const y0=G;
  box(sm,sw,3.5,sd,cx,y0,cz,0,[14,3.5]);
  box(trimMat,sw+.4,.25,sd+.4,cx,y0+3.5,cz);
  // toldos
  for(const s of [1,-1]){ box(pick(awningMats),Math.min(sw*.6,10),.1,1.5,cx,y0+2.9,cz+s*(sd/2+.65),0,[2,2],.32*s,0); }
  colBox(cx,cz,sw,sd,floors*3.5+4);
  // corpo em camadas
  const tiers = floors>16 ? [[1,.62],[.8,.26],[.56,.12]] : floors>8 ? [[1,.7],[.82,.3]] : [[1,1]];
  let y=y0+3.75, tw=w, td=d, topY=y;
  for(let t=0;t<tiers.length;t++){
    const fl=Math.max(1,Math.round(floors*tiers[t][1])); const h=fl*3.5;
    tw=w*tiers[t][0]; td=d*tiers[t][0];
    const yy=y-.25+ (t===0?.25:0);
    box(fm,tw,h,td,cx,y,cz,0,[14,14]);
    // beiral / cornija
    box(trimMat,tw+.3,.3,td+.3,cx,y+h,cz);
    // parapeito
    for(const s of [-1,1]){ box(concreteMat,tw+.3,.7,.25,cx,y+h+.3,cz+s*(td/2+.02)); box(concreteMat,.25,.7,td+.3,cx+s*(tw/2+.02),y+h+.3,cz); }
    box(gravelMat,tw-.2,.12,td-.2,cx,y+h+.2,cz);
    // pilastras nos cantos
    if(style!=="glass") for(const sx of [-1,1])for(const sz of [-1,1]) box(concreteMat,.35,h,.35,cx+sx*tw/2,y,cz+sz*td/2);
    y+=h; topY=y;
  }
  // topo: equipamentos
  const rx=tw*.5-1.5, rz=td*.5-1.5;
  for(let i=0;i<ri(2,4);i++){ const ax=cx+rr(-rx,rx), az=cz+rr(-rz,rz); box(metalLight,rr(1.4,2.4),.9,rr(1.2,2),ax,topY+.3,az); cyl(metalDark,.45,.15,ax,topY+1.2,az); }
  box(concreteMat,2.4,2.2,2.4,cx-rx*.6,topY+.3,cz+rz*.5);
  if(R()<.5){ cyl(woodMat,1.1,1.8,cx+rx*.6,topY+2.2,cz-rz*.5); cone(metalDark,1.2,.7,cx+rx*.6,topY+4.0,cz-rz*.5); for(const a of [0,1,2,3]) box(metalDark,.1,2,.1,cx+rx*.6+Math.cos(a*1.57+.7)*.8,topY+.3,cz-rz*.5+Math.sin(a*1.57+.7)*.8); }
  if(floors>14){
    cyl(metalDark,.07,10,cx,topY+.4,cz); sph(beaconMat,.25,cx,topY+10.5,cz); lampGlowPts.push(cx,topY+10.5,cz);
    for(let i=0;i<4;i++) box(metalDark,.05,5,.05,cx+Math.cos(i*1.57)*.8,topY+.4,cz+Math.sin(i*1.57)*.8,0,null,Math.sin(i*1.57)*.3,Math.cos(i*1.57)*-.3);
  }
  if(opts.heli){ cyl(darkConcrete,4.6,.2,cx,topY+.3,cz); cyl(redMark,4.1,.22,cx,topY+.3,cz); cyl(darkConcrete,3.8,.24,cx,topY+.3,cz); box(trimMat,.4,.05,2.6,cx-.9,topY+.55,cz); box(trimMat,.4,.05,2.6,cx+.9,topY+.55,cz); box(trimMat,2.2,.05,.4,cx,topY+.55,cz); }
  if(opts.billboard){
    const bm=pick(billboards); const bz=cz+td/2-1;
    for(const x of [-3.6,3.6]) box(metalDark,.25,3.2,.25,cx+x,topY+.3,bz);
    box(metalDark,8.6,3.6,.3,cx,topY+3.0,bz); 
    sub(cx,bz+.2,0,()=>{ box(bm,8.2,3.2,.08,0,topY+3.2,0); });
  }
}
function parkBlock(cx,cz,variant){
  setFrame(cx,cz,0);
  quad(grassMat,G+.001,0,0,56,56,8,false);
  // caminhos cruzados
  quad(pavePlazaMat,G+.012,0,0,4.2,56,3,false); quad(pavePlazaMat,G+.012,0,0,56,4.2,3,false);
  for(const a of [0.785,-0.785]){ for(let i=-4;i<=4;i++){ if(Math.abs(i)<3) continue; const px=i*3.1*Math.sign(1), pz=i*3.1*a/Math.abs(a); if(Math.abs(px)<26) quad(brickPathMat,G+.014,px,pz,2.4,2.4,2.4,false); } }
  // plaza central circular
  const plaza=new THREE.Group();
  cyl(pavePlazaMat,11,.02,0,G+.0,0); cyl(stoneMat,11.3,.1,0,G+0,0,false);
  cyl(pavePlazaMat,10.8,.13,0,G+.0,0);
  for(let i=0;i<24;i++){ const a=i/24*6.2832; box(stoneMat,.9,.12,.5,Math.cos(a)*11.3,G,Math.sin(a)*11.3,-a); }
  if(variant===0){
    // fonte
    cyl(stoneMat,5.2,.9,0,G+.1,0);
    for(let i=0;i<20;i++){ const a=i/20*6.2832; box(marbleMat,1.7,.16,.7,Math.cos(a)*5.1,G+.95,Math.sin(a)*5.1,-a); }
    cyl(M(0x1a3a4a,.4,.2),4.6,.05,0,G+.97,0);
    cyl(marbleMat,1.1,.6,0,G+.95,0); cyl(marbleMat,.5,2.2,0,G+1.4,0); cyl(marbleMat,2.1,.25,0,G+1.9,0); cyl(marbleMat,1.4,.18,0,G+3.0,0); sph(marbleMat,.5,0,G+3.6,0);
    colCirc(0,0,5.4,1.2);
    for(let i=0;i<8;i++){ const a=i/8*6.2832; bench(Math.cos(a)*8.5,Math.sin(a)*8.5, Math.atan2(-Math.cos(a),-Math.sin(a))); }
  } else {
    // estatua / obelisco
    box(marbleMat,3.2,.5,3.2,0,G+.1,0); box(marbleMat,2.4,.5,2.4,0,G+.6,0); box(marbleMat,1.6,3.2,1.6,0,G+1.1,0); box(marbleMat,1.9,.2,1.9,0,G+4.3,0);
    cone(marbleMat,.9,3.0,0,G+4.5,0);
    box(metalLight,1.2,.5,.05,0,G+2.2,.83);
    colBox(0,0,3.3,3.3,8);
    for(const s of [[7,0],[-7,0],[0,7],[0,-7]]) bench(s[0],s[1],Math.atan2(-s[0],-s[1]));
  }
  for(const s of [[1,1],[1,-1],[-1,1],[-1,-1]]) flowerBed(s[0]*15,s[1]*15,4,4);
  // bancos e postes ao longo dos caminhos
  for(const t of [-20,-14,14,20]){ bench(t,2.9,Math.PI); bench(t,-2.9,0); bench(2.9,t,-Math.PI/2); bench(-2.9,t,Math.PI/2); parkLamp(t,-3.6); parkLamp(3.6,t); parkLamp(-t,3.6); parkLamp(-3.6,-t); }
  for(const t of [-9,9]){ parkLamp(t*1.3,7); }
  trashBin(3.3,-8,1); trashBin(-3.3,8,1); trashBin(-8,-3.3,1); trashBin(8,3.3,1);
  // quadrantes
  const qs=[[1,1],[1,-1],[-1,1],[-1,-1]];
  for(const q of qs){
    const kind = variant===0 ? (q[0]>0&&q[1]>0?"play":(q[0]<0&&q[1]<0?"pav":"trees")) : (q[0]<0&&q[1]>0?"pond":(q[0]>0&&q[1]<0?"picnic":"trees"));
    const qx=q[0]*17, qz=q[1]*17;
    if(kind==="play"){
      box(sandMat,7,.25,6,qx,G,qz); 
      // balanço
      for(const s of [-2.4,2.4]){ box(metalDark,.12,3,.12,qx+s,G,qz-1.6,0,null,0,.0); box(metalDark,.12,3,.12,qx+s,G,qz+1.6); }
      box(metalDark,5.4,.14,.14,qx,G+3,qz-1.6); box(metalDark,5.4,.14,.14,qx,G+3,qz+1.6);
      for(const s of [-1,1]){ box(woodMat,.9,.08,.4,qx+s*1.0,G+.75,qz); box(metalLight,.03,2.3,.03,qx+s*1.0-.4,G+.8,qz); box(metalLight,.03,2.3,.03,qx+s*1.0+.4,G+.8,qz); }
      // escorregador
      box(woodMat,1.6,.15,1.6,qx-9+4,G+1.8,qz+6,0); 
      box(redMark,.9,.1,3,qx+5.3,G+.9,qz+7.6,0,null,.5); box(metalDark,.1,1.8,.1,qx+4.6,G,qz+6); box(metalDark,.1,1.8,.1,qx+6,G,qz+6);
      colBox(qx,qz,7,6,3);
    }
    if(kind==="pav"){
      for(const sx of [-1,1])for(const sz of [-1,1]) cyl(trimMat,.22,3.6,qx+sx*3,G,qz+sz*3);
      box(M(0x3a3f45,.6,.3),7.6,.3,7.6,qx,G+3.6,qz); cone(roofMats[0],5.8,1.8,qx,G+3.9,qz);
      box(stoneMat,8,.25,8,qx,G,qz); bench(qx,qz-2.4,0); bench(qx,qz+2.4,Math.PI);
      for(const sx of [-1,1])for(const sz of [-1,1]) colCirc(qx+sx*3,qz+sz*3,.3,4);
    }
    if(kind==="pond"){
      cyl(stoneMat,7.2,.35,qx,G,qz); cyl(M(0x1d6a86,.05,.3,{emissive:0x0b3a4d,emissiveIntensity:.4}),6.8,.3,qx,G,qz);
      for(let i=0;i<14;i++){ const a=i/14*6.28; sph(stoneMat,.45,qx+Math.cos(a)*7,G+.2,qz+Math.sin(a)*7,1,.7,1); }
      for(let i=0;i<6;i++) cyl(M(0x3d8a42,.8,0),.5,.03,qx+rr(-4,4),G+.43,qz+rr(-4,4));
      colCirc(qx,qz,7.2,.5);
    }
    if(kind==="picnic"){
      for(let i=0;i<3;i++){ const px=qx-4+i*4, pz=qz+rr(-3,3); box(woodMat,2,.08,.8,px,G+.75,pz); box(woodMat,2,.06,.3,px,G+.45,pz-.7); box(woodMat,2,.06,.3,px,G+.45,pz+.7); box(metalDark,.1,.75,.9,px-.8,G,pz); box(metalDark,.1,.75,.9,px+.8,G,pz); colBox(px,pz,2.2,1.9,1); }
    }
    // arvores nos quadrantes
    const nT = kind==="trees"?9:4;
    for(let i=0;i<nT;i++){ let tx,tz,tries=0; do{ tx=qx+rr(-12,12); tz=qz+rr(-12,12); tries++; } while((Math.hypot(tx,tz)<13.5||Math.abs(tx)<4||Math.abs(tz)<4||(kind==="pond"&&Math.hypot(tx-qx,tz-qz)<8.5)||(kind==="play"&&Math.abs(tx-qx)<7&&Math.abs(tz-qz)<6.5))&&tries<20); if(tries<20) tree(tx,tz,"glb"); }
    for(let i=0;i<5;i++) bush(qx+rr(-12,12),qz+rr(-12,12),rr(.4,.8));
  }
  // cerca viva na borda
  for(const s of [-1,1]){ box(hedgeMat,56,.9,.7,0,G,s*27.7); box(hedgeMat,.7,.9,56,s*27.7,G,0); }
  setFrame(0,0,0);
}
function skateBlock(cx,cz){
  setFrame(cx,cz,0);
  quad(pavePlazaMat,G+.001,0,0,58,58,8,false);
  const pa=[decal(M(0xe0822a,.8,0)),decal(M(0x1f6fb0,.8,0))];
  for(const z of [-27,27]) quad(pa[z>0?1:0],G+.02,0,z,58,1.2,1,false);
  for(const x of [-27,27]) quad(pa[x>0?0:1],G+.02,x,0,1.2,58,1,false);
  for(const c of [[-26,-26],[26,-26],[-26,26],[26,26]]){ parkLamp(c[0],c[1]); }
  bench(-10,-26,0); bench(10,-26,0); bench(-10,26,Math.PI); bench(10,26,Math.PI);
  trashBin(24,-24,1); trashBin(-24,24,1);
  box(metalDark,.2,3.4,.2,-2.9,G,-27.8); box(metalDark,.2,3.4,.2,2.9,G,-27.8);
  const w=W(0,-27.8), sg=new THREE.Mesh(new THREE.PlaneGeometry(6,2.25),new THREE.MeshBasicMaterial({map:billboardTex("SKATE PARK","#1f6fb0","#e0822a")}));
  sg.position.set(w[0],3.1,w[1]); sg.rotation.y=Math.PI; scene.add(sg);
}
function ringProps(cx,cz,type){
  setFrame(0,0,0);
  const dirs=[[0,-1],[0,1],[-1,0],[1,0]];
  for(const d of dirs){
    const t=[-d[1],d[0]];
    const P=(dist,s)=>[cx+d[0]*dist+t[0]*s, cz+d[1]*dist+t[1]*s];
    const lry=Math.atan2(-d[1],d[0]);
    for(const s of [-24,-8,8,24]){ const p=P(31.1,s); lamp(p[0],p[1],lry); }
    if(type!=="park") for(const s of [-16,0,16]){ const p=P(29.4,s); tree(p[0],p[1],R()<.15?"birch":"round"); }
    if(type!=="house"){ for(const s of [-12,12]) if(R()<.6){ const p=P(29.6,s); bench(p[0],p[1],Math.atan2(d[0],d[1])); } }
    if(R()<.7){ const p=P(30.6,pick([-4,4])); trashBin(p[0],p[1]); }
    if(R()<.55){ const p=P(31.4,pick([-20,20])); hydrant(p[0],p[1]); }
    if(R()<.12){ const p=P(30,pick([-18,18])); busStop(p[0],p[1],Math.atan2(d[0],d[1])); }
  }
}
function sidewalkRing(cx,cz){
  setFrame(0,0,0);
  box(sidewalkMat,64,G,4,cx,0,cz-30,0,[4,4]); box(sidewalkMat,64,G,4,cx,0,cz+30,0,[4,4]);
  box(sidewalkMat,4,G,56,cx-30,0,cz,0,[4,4]); box(sidewalkMat,4,G,56,cx+30,0,cz,0,[4,4]);
  for(const s of [-1,1]){ box(curbMat,64,.03,.25,cx,G,cz+s*31.88); box(curbMat,.25,.03,56,cx+s*31.88,G,cz); }
}
function towersBlock(cx,cz,kind,i,j){
  setFrame(0,0,0);
  quad(pavePlazaMat,G+.001,cx,cz,56,56,4,false);
  const styles=["glass","concrete","brick","resid"]; const tints=[0xffffff,0xe9e4d8,0xcfd8de,0xf0dcc0,0xd8e4d8,0xbfc7d0];
  const down = kind==="down";
  const layout = down ? pick(["one","four","four","two"]) : pick(["four","two","four"]);
  const fl = ()=> down ? ri(14,40) : ri(3,9);
  const fixedStyle = down ? pick(["glass","glass","concrete"]) : pick(["brick","resid","concrete"]);
  const place=(x,z,w,d,fls,heli,bb)=>{ skyscraper(x,z,w,d,fls,R()<.8?fixedStyle:pick(styles),pick(tints),{heli,billboard:bb}); };
  if(layout==="one"){ place(cx,cz,34,34,ri(30,48),true,false); for(const s of [[-1,-1],[1,-1],[-1,1],[1,1]]){ setFrame(0,0,0); tree(cx+s[0]*23,cz+s[1]*23,"glb"); flowerBed(cx+s[0]*23,cz+s[1]*14,3,3); } }
  else if(layout==="two"){ place(cx,cz-14.5,rr(34,46),rr(19,23),fl(),false,R()<.5); place(cx,cz+14.5,rr(34,46),rr(19,23),fl(),down&&R()<.5,false); }
  else { const tall=ri(0,3); let n=0; for(const sx of [-1,1])for(const sz of [-1,1]){ place(cx+sx*14.2+rr(-.6,.6),cz+sz*14.2+rr(-.6,.6),rr(20,25),rr(20,25),fl(),down&&n===tall,R()<.18); n++; } }
  setFrame(0,0,0);
  // arvores/vasos entre predios
  for(let k=0;k<4;k++){ const a=k*1.57+.78; /* centro */ }
}
function housesBlock(cx,cz){
  setFrame(0,0,0);
  quad(grassMat,G+.001,cx,cz,56,56,8,false);
  for(const sx of [-1,1])for(const sz of [-1,1]){
    const lx=cx+sx*14, lz=cz+sz*14;
    const ry = R()<.5 ? (sz>0?0:Math.PI) : (sx>0?Math.PI/2:-Math.PI/2);
    setFrame(lx,lz,ry); house(); setFrame(0,0,0);
  }
}

/* ===================== MONTAR A CIDADE ===================== */
const CELL=80, NBLK=4;
const lines=[]; for(let k=-NBLK;k<=NBLK;k++) lines.push(k*CELL);
const blockInfo=[];
function blockType(i,j){
  if(i===0&&j===0) return ["park",0]; if(i===-2&&j===1) return ["park",1]; if(i===2&&j===-3) return ["skate"];
  const d=Math.hypot(i+.5,j+.5); if(d<2.4) return ["down"]; if(d<3.7) return ["mid"]; return ["house"];
}
// chao externo
{
  const g=grassTex.clone(); g.needsUpdate=true; g.repeat.set(2600/8,2600/8);
  const m=M(0xffffff,1,0,{map:g}); const gm=new THREE.Mesh(new THREE.PlaneGeometry(2600,2600),m); gm.rotation.x=-Math.PI/2; gm.position.y=-.06; gm.receiveShadow=true; scene.add(gm);
}
// vias
for(const a of lines){
  for(let k=-NBLK-1;k<=NBLK;k++){
    const c=k*CELL+40;
    quad(roadHMat,.012,c,a,64,16,16,true);   // via ao longo de x em z=a
    quad(roadVMat,.012,a,c,16,64,16,true);   // via ao longo de z em x=a
  }
}
for(const a of lines)for(const b of lines){
  quad(asphaltMat,.013,a,b,16,16,8,false);
}
// faixas de pedestres e linhas de retencao
for(const a of lines)for(const b of lines){
  for(const s of [-1,1]){
    for(let i=-6;i<=6;i++){ if(Math.abs(i)<0&&false) continue; const o=i*1.0; quad(stripeMat,.02,a+s*(8+2),b+o,2.4,.5,1,false); quad(stripeMat,.02,a+o,b+s*(8+2),.5,2.4,1,false); }
    quad(stripeMat,.02,a+s*12.2,b+s*2.7*-1,.45,3.6,1,false); // x-approach
    quad(stripeMat,.02,a+s*2.7,b+s*12.2,3.6,.45,1,false);
  }
}
// remendos e bueiros
for(let i=0;i<150;i++){ const a=pick(lines), c=rr(-380,380), side=R()<.5; const off=rr(-6,6); const px=side?c:a+off, pz=side?a+off:c; if(R()<.55) quad(patchMat,.021,px,pz,rr(.8,2.6),rr(.8,2.6),1,false); else cyl(manholeMat,.42,.02,px,.012,pz); }
// quarteiroes
const minimapBlocks=[];
for(let i=-NBLK;i<NBLK;i++)for(let j=-NBLK;j<NBLK;j++){
  const cx=i*CELL+40, cz=j*CELL+40; const bt=blockType(i,j);
  sidewalkRing(cx,cz);
  if(bt[0]==="park"){ parkBlock(cx,cz,bt[1]); }
  else if(bt[0]==="skate"){ skateBlock(cx,cz); }
  else if(bt[0]==="house"){ housesBlock(cx,cz); }
  else { towersBlock(cx,cz,bt[0],i,j); }
  ringProps(cx,cz,bt[0]==="house"?"house":bt[0]==="park"?"park":"town");
  minimapBlocks.push([cx,cz,bt[0]]);
}
// semaforos
for(const a of lines)for(const b of lines){ setFrame(0,0,0); for(const sx of [-1,1])for(const sz of [-1,1]) trafficLight(a+sx*9.6,b+sz*9.6,sx,sz); }
// carros estacionados
for(const a of lines)for(let k=-NBLK;k<NBLK;k++){
  const c=k*CELL+40;
  for(const side of [-1,1]){
    for(let slot=-3;slot<=2;slot++){
      const s=c+slot*8+4;
      if(R()<.3){ setFrame(0,0,0); const kind=pick(["sedan","hatch","sedan","van"]); if(carBatch(s,a+side*6.4,Math.PI/2*(R()<.5?1:1),kind,pick(carPaints))) colBox(s,a+side*6.4,4.6,2,1.6); }
      if(R()<.3){ setFrame(0,0,0); const kind=pick(["sedan","hatch","sedan","van"]); if(carBatch(a+side*6.4,s,0,kind,pick(carPaints))) colBox(a+side*6.4,s,2,4.6,1.6); }
    }
  }
}
setFrame(0,0,0);


/* ===================== PRAIA + PRACA DA ORLA ===================== */
const beachUpd=(()=>{
  setFrame(0,0,0); GY=.03;
  const dec=(c,r,o)=>decal(M(c,r===undefined?1:r,0,o));
  const sandTex=ctex(512,512,(ctx,w,h)=>{ ctx.fillStyle="#dfca93"; ctx.fillRect(0,0,w,h);
    for(let i=0;i<60;i++){ const x=Math.random()*w,y=Math.random()*h,r=30+Math.random()*80; const gr=ctx.createRadialGradient(x,y,0,x,y,r); gr.addColorStop(0,Math.random()<.5?"rgba(190,160,100,.16)":"rgba(255,240,200,.18)"); gr.addColorStop(1,"rgba(0,0,0,0)"); ctx.fillStyle=gr; ctx.fillRect(x-r,y-r,2*r,2*r); }
    ctx.lineWidth=1.2; for(let i=0;i<46;i++){ const y=Math.random()*h; ctx.strokeStyle="rgba(120,95,50,.10)"; ctx.beginPath(); for(let x=0;x<=w;x+=16) ctx.lineTo(x,y+Math.sin(x*.05+i)*5); ctx.stroke(); ctx.strokeStyle="rgba(255,250,225,.12)"; ctx.beginPath(); for(let x=0;x<=w;x+=16) ctx.lineTo(x,y+3+Math.sin(x*.05+i)*5); ctx.stroke(); }
    speckle(ctx,w,h,5000,["#cdb67c","#e9d8a6","#c2aa70","#f0e2b8","#b89f66"],1,2.4); });
  const wetTex=ctex(64,8,(ctx,w,h)=>{ const gr=ctx.createLinearGradient(0,0,w,0); gr.addColorStop(0,"rgba(150,125,80,0)"); gr.addColorStop(.6,"rgba(120,98,62,.75)"); gr.addColorStop(1,"rgba(95,78,50,.9)"); ctx.fillStyle=gr; ctx.fillRect(0,0,w,h); });
  const sandM=decal(M(0xffffff,1,0,{map:sandTex})), wetM=decal(M(0xffffff,1,0,{map:wetTex,transparent:true})), boardM=decal(M(0xffffff,.8,0,{map:woodTex}));
  for(const a of [-80,0,80]) quad(roadHMat,.012,344,a,64,16,16,true);
  quad(sandM,.014,446,0,140,800,14,false); quad(wetM,.016,496,0,32,800,32,true);
  quad(boardM,.02,384,0,16,800,4,false);
  for(const z of [-80,0,80]) quad(asphaltMat,.021,384,z,16,16,8,false);
  // mar: ondas por shader, espuma, vai-e-vem na areia, brilhos
  const mkWT=rep_=>{ const t=waterTex.clone(); t.needsUpdate=true; t.repeat.set(rep_,rep_); return t; };
  const seaTexN=mkWT(34), seaTexF=mkWT(60), seaU={uT:{value:0}};
  const seaProps=(map)=>({color:0x5fc9e6,map,roughness:.18,metalness:.15,transparent:true,opacity:.92,emissive:0x0b4256,emissiveIntensity:.35,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1});
  const seaNearM=new THREE.MeshStandardMaterial(seaProps(seaTexN));
  seaNearM.onBeforeCompile=sh=>{ sh.uniforms.uT=seaU.uT;
    sh.vertexShader='uniform float uT; varying float vH;\n'+sh.vertexShader.replace('#include <begin_vertex>',`
      float wx=position.x+632.0;
      float env=smoothstep(535.0,600.0,wx)*(1.0-smoothstep(690.0,750.0,wx));
      float d=(sin(wx*.21+uT*1.35)*.17+sin(position.y*.33-uT*1.1)*.09+sin((wx*.7+position.y*.5)*.16+uT*.8)*.18)*env;
      vH=d; vec3 transformed=vec3(position.x,position.y,position.z+d);`);
    sh.fragmentShader='varying float vH;\n'+sh.fragmentShader.replace('#include <dithering_fragment>','#include <dithering_fragment>\n gl_FragColor.rgb=mix(gl_FragColor.rgb,vec3(1.0),smoothstep(.2,.4,vH)*.55);'); };
  const seaNear=new THREE.Mesh(new THREE.PlaneGeometry(240,800,120,200),seaNearM); seaNear.rotation.x=-Math.PI/2; seaNear.position.set(632,.03,0); seaNear.frustumCulled=false; scene.add(seaNear);
  const seaFar=new THREE.Mesh(new THREE.PlaneGeometry(900,1500),new THREE.MeshStandardMaterial(seaProps(seaTexF))); seaFar.rotation.x=-Math.PI/2; seaFar.position.set(1200,.03,0); scene.add(seaFar);
  const swashTex=ctex(64,4,(ctx,w,h)=>{ const gr=ctx.createLinearGradient(0,0,w,0); gr.addColorStop(0,"rgba(215,240,245,0)"); gr.addColorStop(.12,"rgba(195,235,245,.55)"); gr.addColorStop(.35,"rgba(90,200,225,.7)"); gr.addColorStop(1,"rgba(60,180,215,.8)"); ctx.fillStyle=gr; ctx.fillRect(0,0,w,h); },{repeat:false});
  const swashM=new THREE.MeshBasicMaterial({map:swashTex,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-3});
  const swash=new THREE.Mesh(new THREE.PlaneGeometry(44,800),swashM); swash.rotation.x=-Math.PI/2; swash.position.set(522,.04,0); scene.add(swash);
  const foamTex=ctex(128,32,(ctx,w,h)=>{ for(let i=0;i<320;i++){ ctx.fillStyle="rgba(255,255,255,"+(.25+Math.random()*.6)+")"; ctx.beginPath(); ctx.arc(Math.random()*w,Math.random()*h,1+Math.random()*3,0,6.3); ctx.fill(); }
    ctx.globalCompositeOperation="destination-in"; const gr=ctx.createLinearGradient(0,0,w,0); gr.addColorStop(0,"rgba(0,0,0,0)"); gr.addColorStop(.5,"rgba(0,0,0,1)"); gr.addColorStop(1,"rgba(0,0,0,0)"); ctx.fillStyle=gr; ctx.fillRect(0,0,w,h); });
  foamTex.repeat.set(1,60);
  const foams=[0,1,2].map(()=>{ const m=new THREE.MeshBasicMaterial({map:foamTex,transparent:true,opacity:0,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-4}); const f=new THREE.Mesh(new THREE.PlaneGeometry(3.2,800),m); f.rotation.x=-Math.PI/2; f.position.set(520,.045,0); scene.add(f); return f; });
  const gp=new Float32Array(180*3); for(let i=0;i<180;i++){ gp[i*3]=rr(540,720); gp[i*3+1]=.4; gp[i*3+2]=rr(-380,380); }
  const glintG=new THREE.BufferGeometry(); glintG.setAttribute("position",new THREE.BufferAttribute(gp,3));
  const glint=new THREE.Points(glintG,new THREE.PointsMaterial({map:glowTex,size:1.1,color:0xffffff,transparent:true,opacity:.8,depthWrite:false,blending:THREE.AdditiveBlending})); glint.frustumCulled=false; scene.add(glint);
  // props
  function palm(x,z){ const w=W(x,z); PL["palm"+((Math.random()*5)|0)].push([w[0],w[1],Math.random()*6.28,GY,rr(.85,1.2)]); colCirc(x,z,.4,6); }
  for(let z=-370;z<=370;z+=28) palm(397+rr(-1.5,1.5),z+rr(-4,4));
  for(let z=-380;z<=380;z+=40){ bench(377.6,z,Math.PI/2); lamp(376.6,z+20,0); }
  for(let z=-360;z<=360;z+=80){ trashBin(378.5,z+10,1); trashBag(378.9,z+10.8); }
  // quiosques
  const kio=M(0xf2ead8,.85), roof=M(0xb8934a,1,0,{flatShading:true});
  for(const z of [-250,-40,230]){ const x=414;
    box(kio,6,2.8,5,x,GY,z); box(woodMat,6.4,.3,1.6,x-3.7,GY+1.1,z); cone(roof,5.6,2.6,x,GY+2.8,z); colBox(x,z,6,5,3);
    for(const dz of [-1.6,0,1.6]){ cyl(metalDark,.25,.7,x-4.6,GY,z+dz); box(redMark,.6,.08,.6,x-4.6,GY+.7,z+dz); } }
  // guarda-sois, cadeiras, toalhas, pranchas
  const cols=[0xff5b5b,0xffd34d,0x4db6ff,0xf5f5f5,0xff8c42,0x7be07b].map(c=>M(c,.85,0,{flatShading:true}));
  for(let i=0;i<26;i++){ const x=rr(425,488), z=rr(-340,340); if([-250,-40,230].some(k=>Math.abs(z-k)<12&&x<425)) continue;
    cyl(metalLight,.04,2.3,x,GY,z); cone(cols[i%6],1.7,.65,x,GY+2.1,z);
    box(cols[(i+2)%6],1.1,.03,2.2,x+1.6,GY,z+.3); box(woodMat,.7,.12,1.3,x-1.5,GY+.3,z,.4); box(woodMat,.7,.5,.1,x-1.5,GY+.35,z-.6,.4,null,.9,0); }
  for(let i=0;i<8;i++){ const x=rr(470,495), z=rr(-320,320); box(cols[i%6],.5,2.2,.07,x,GY+.05,z,R()*3,null,.25,0); }
  for(const z of [-170,150]){ for(const dz of [-4.5,4.5]){ cyl(metalDark,.07,2.4,452,GY,z+dz); colCirc(452,z+dz,.2,2.4); } box(M(0xffffff,.9),.04,.9,9,452,GY+1.7,z); }
  for(const z of [-120,100]){ const x=476; for(const sx of [-1,1]) box(sx<0?redMark:M(0xffffff,.9),.15,2.2,.15,x+sx*1.2,GY+1.4,z); box(M(0xe8e8e8,.8),3,.12,2.6,x,GY+1.0,z); box(M(0xffffff,.8),2.4,.9,2.2,x,GY+2.9,z); box(redMark,2.6,.1,2.4,x,GY+3.8,z); colBox(x,z,3,2.6,4); }
  // ---- detalhes da praia ----
  const rockM=M(0x7a7a78,.95,0,{flatShading:true}), rockM2=M(0x5f6663,.95,0,{flatShading:true}), grassT=M(0x4f8f3a,.9,0,{flatShading:true}), grassT2=M(0x7fb04a,.9,0,{flatShading:true}), weed=M(0x2d4a2a,1,0,{flatShading:true}), shell=M(0xf4ece0,.7,0,{flatShading:true}), star=M(0xff7a45,.8,0,{flatShading:true}), driftM=M(0x8a7658,1,0,{flatShading:true}), sandC=M(0xd8c07c,1,0,{flatShading:true}), hullM=M(0x3a78c2,.7), hullW=M(0xf2f2f2,.7), whiteM=M(0xffffff,.9);
  for(let i=0;i<40;i++) palm(rr(404,470),rr(-380,380));
  for(let z=-385;z<=385;z+=3.2){ const x=401+rr(-1.6,1.6); cone(grassT,.35,rr(.8,1.4),x,GY,z); cone(grassT2,.28,rr(.6,1.1),x+rr(-.5,.5),GY,z+rr(-.5,.5)); if(R()<.18) ico(grassT2,.5,x+rr(-1,1),GY+.3,z,1,.7,1); }
  for(let i=0;i<22;i++){ const x=rr(488,506), z=rr(-380,380), n=2+(R()*3|0); for(let k=0;k<n;k++) ico(i%2?rockM:rockM2,rr(.4,1.1),x+rr(-1.2,1.2),GY+.2,z+rr(-1.2,1.2),1,.65,1,R()*6); }
  for(let i=0;i<70;i++) ico(weed,rr(.25,.5),rr(496,503),GY+.05,rr(-385,385),1.4,.25,1,R()*6);
  for(let i=0;i<90;i++){ const x=rr(420,498), z=rr(-380,380); if(i%4===0) sph(star,.07,x,GY+.03,z,1.6,.3,1.6); else ico(shell,.07,x,GY+.04,z,1.3,.7,1,R()*6); }
  for(let i=0;i<10;i++) box(driftM,rr(.25,.4),.3,rr(2.5,4.5),rr(440,495),GY+.1,rr(-360,360),R()*3);
  for(let i=0;i<6;i++){ const x=rr(445,490), z=rr(-300,300); box(sandC,1.6,.7,1.6,x,GY,z); for(const [dx,dz] of [[-.7,-.7],[.7,-.7],[-.7,.7],[.7,.7]]) box(sandC,.4,.45,.4,x+dx,GY+.7,z+dz); cone(sandC,.45,.9,x,GY+.7,z); }
  for(let i=0;i<8;i++) sph(cols[i%6],.32,rr(430,495),GY+.32,rr(-340,340));
  for(const z of [-200,60,300]){ const x=rr(472,488); box(hullM,1.7,.7,4.6,x,GY,z); box(hullW,1.4,.12,4.2,x,GY+.7,z); box(driftM,1.5,.1,.4,x,GY+.35,z); colBox(x,z,1.8,4.6,1); }
  for(let z=-385;z<=385;z+=14){ sph(z%28===0?redMark:whiteM,.3,540,.08,z); box(whiteM,.04,.04,14,540,.12,z+7); }
  // praca da orla
  setFrame(440,-165,0);
  quad(pavePlazaMat,.022,0,0,52,52,3,false);
  cyl(stoneMat,9.6,.12,0,GY,0); cyl(pavePlazaMat,9.2,.14,0,GY,0);
  box(marbleMat,1.8,.6,1.8,0,GY,0); box(marbleMat,1.1,7.5,1.1,0,GY+.6,0); box(marbleMat,2.3,2.3,.5,0,GY+8.0,0); box(marbleMat,.5,2.3,2.3,0,GY+8.0,0); colBox(0,0,2,2,10);
  for(let i=0;i<8;i++){ const a=i/8*6.2832; bench(Math.cos(a)*7,Math.sin(a)*7,Math.atan2(-Math.cos(a),-Math.sin(a))); }
  for(const q of [[1,1],[1,-1],[-1,1],[-1,-1]]){ flowerBed(q[0]*17,q[1]*17,5,5); parkLamp(q[0]*11,q[1]*11); palm(q[0]*22,q[1]*22); tree(q[0]*9,q[1]*21,"glb"); trashBin(q[0]*13,q[1]*5,1); }
  for(const z of [-20,20]){ bench(-24,z,-Math.PI/2); bench(24,z,Math.PI/2); }
  trashBag(13.5,5.6); trashBag(-13.5,-5.6);
  box(hedgeMat,52,.9,.7,0,GY,-25.5); box(hedgeMat,.7,.9,52,-25.5,GY,0);
  setFrame(0,0,0); GY=G;
  return t=>{
    seaU.uT.value=t; seaTexN.offset.set(t*.01,t*.004); seaTexF.offset.set(-t*.006,t*.003);
    const dk=.35+.65*(1-cur.night), surge=Math.min(1,Math.max(0,.5+.5*Math.sin(t*.55)+.18*Math.sin(t*1.3+1)));
    swash.position.x=500+11*surge+22; swashM.color.setScalar(dk);
    foams.forEach((f,i)=>{ const u=(t*.09+i/3)%1, sn=Math.sin(u*Math.PI); f.position.x=524-14*sn; f.material.opacity=sn*.75*dk; f.material.color.setScalar(dk); });
    glint.material.opacity=(1-cur.night)*.85; glint.material.size=.9+.3*Math.sin(t*5);
  };
})();
// brilhos de poste (pontos aditivos) e poca de luz no chao
const glowPoints = new THREE.Points(
  (()=>{ const g=new THREE.BufferGeometry(); g.setAttribute("position",new THREE.Float32BufferAttribute(lampGlowPts,3)); return g; })(),
  new THREE.PointsMaterial({map:glowTex,size:7,sizeAttenuation:true,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,fog:true})
);
scene.add(glowPoints);
for(const p of lampPoolList) quad(poolGlowMat,G+.04,p[0],p[1],10,10,10,true);
flushBuckets();
(async()=>{
  if(!THREE.GLTFLoader){ console.warn('GLTFLoader indisponivel'); return; }
  const ld=new THREE.GLTFLoader(); console.log("arvores GLB:",GTREES);
  const SPEC={bench:{s:.58,r:-Math.PI/2},lamp:{s:1.15,r:Math.PI/2},hyd:{s:1.1,r:0},mail:{s:1.4,r:0},bin:{s:.0144,r:0},bag:{s:1,r:0},tree0:{s:1,r:0},tree1:{s:1,r:0},tree2:{s:1,r:0},tree3:{s:1,r:0},palm0:{hgt:7.5,r:0,src:"palm",node:0},palm1:{hgt:7.5,r:0,src:"palm",node:1},palm2:{hgt:7.5,r:0,src:"palm",node:2},palm3:{hgt:7.5,r:0,src:"palm",node:3},palm4:{hgt:7.5,r:0,src:"palm",node:4},car0:{len:4.4,r:3.1416},car1:{len:4.5,r:3.1416},car2:{len:4.0,r:3.1416},car3:{len:5.2,r:3.1416},car4:{len:4.6,r:0.0000},car5:{len:4.2,r:3.1416},car6:{len:4.2,r:3.1416},car7:{len:4.2,r:3.1416},car8:{len:9.5,r:-1.5708},car9:{len:5.0,r:3.1416},car10:{len:4.6,r:0.0000}};
  const PARSED={}; const parse=b64=>new Promise((ok,no)=>{ const bin=atob(b64), u=new Uint8Array(bin.length); for(let i=0;i<bin.length;i++) u[i]=bin.charCodeAt(i); ld.parse(u.buffer,"",ok,no); });
  const m4=new THREE.Matrix4(), q=new THREE.Quaternion(), up=new THREE.Vector3(0,1,0), one=new THREE.Vector3(1,1,1);
  for(const key in SPEC){
    const list=PL[key]; if(!list.length&&!key.startsWith("car")) continue; const sp=SPEC[key]; let gl;
    try{ const sk=sp.src||key; gl=PARSED[sk]||(PARSED[sk]=await parse(GLB64[sk])); }catch(e){ console.warn("GLB falhou:",key,e); continue; }
    gl.scene.updateMatrixWorld(true); const root=sp.node!==undefined?gl.scene.getObjectByName("PalmTree_"+(sp.node+1)):gl.scene; root.updateMatrixWorld(true);
    const bb=new THREE.Box3().setFromObject(root);
    const ss=sp.hgt?sp.hgt/(bb.max.y-bb.min.y):sp.len?sp.len/Math.max(bb.max.x-bb.min.x,bb.max.z-bb.min.z):sp.s; const pre=new THREE.Matrix4().makeScale(ss,ss,ss).multiply(new THREE.Matrix4().makeTranslation(-(bb.min.x+bb.max.x)/2,-bb.min.y,-(bb.min.z+bb.max.z)/2));
    const groups=new Map(); for(const p of list){ const k=/^(tree|car|palm)/.test(key)?Math.floor(p[0]/100)+","+Math.floor(p[1]/100):chunk(p[0],p[1]); if(!groups.has(k)) groups.set(k,[]); groups.get(k).push(p); }
    root.traverse(o=>{
      if(!o.isMesh) return; const base=new THREE.Matrix4().copy(pre).multiply(o.matrixWorld);
      if(key.startsWith("car")){ const mt=o.material; if(mt&&mt.metalness>.35) mt.metalness=.35; (CT[+key.slice(3)]=CT[+key.slice(3)]||[]).push({geo:o.geometry,mat:mt,m:new THREE.Matrix4().makeRotationY(sp.r).multiply(base)}); }
      for(const arr of groups.values()){
        const g=new THREE.BufferGeometry(); g.index=o.geometry.index; g.attributes=o.geometry.attributes;
        let cx=0,cz=0; for(const p of arr){ cx+=p[0]; cz+=p[1]; } cx/=arr.length; cz/=arr.length;
        let rad=0; for(const p of arr) rad=Math.max(rad,Math.hypot(p[0]-cx,p[1]-cz)); g.boundingSphere=new THREE.Sphere(new THREE.Vector3(cx,3,cz),rad+10);
        const im=new THREE.InstancedMesh(g,o.material,arr.length);
        arr.forEach((p,i)=>{ q.setFromAxisAngle(up,p[2]+sp.r); const kk=p[4]||1; m4.compose(new THREE.Vector3(p[0],p[3],p[1]),q,new THREE.Vector3(kk,kk,kk)).multiply(base); im.setMatrixAt(i,m4); });
        im.castShadow=true; im.receiveShadow=true; scene.add(im); if(/^(tree|car|palm)/.test(key)) FARM.push({m:im,x:cx,z:cz,d:key.startsWith("car")?200:TFAR});
      }
    });
  }
  for(const c of cars){ const T=CT[c.g.userData.mdl]; if(!T) continue; for(const e of T){ const me=new THREE.Mesh(e.geo,e.mat); me.applyMatrix4(e.m); me.castShadow=true; me.receiveShadow=true; c.g.add(me); } }
})().then(()=>{ window.__modelsReady=true; window.dispatchEvent(new Event("modelsready")); },e=>{ console.warn(e); window.__modelsReady=true; window.dispatchEvent(new Event("modelsready")); });

/* ===================== PATINETE (modelo original) ===================== */
const sc = buildScooter(THREE, scene);
const body = sc.body;
const player = new THREE.Group(); scene.add(player); player.add(body);
{ // mescla malhas estaticas do patinete (reduz chamadas de desenho)
  body.updateMatrixWorld(true);
  const skip=new Set([sc.wheelFront,sc.wheelRear]); const groups=new Map(); const toRemove=[];
  body.traverse(o=>{
    if(!o.isMesh) return; let p=o; while(p){ if(skip.has(p)) return; p=p.parent; }
    let g=groups.get(o.material); if(!g){ g=[]; groups.set(o.material,g);} g.push(o); toRemove.push(o);
  });
  for(const [mat,list] of groups){
    const pos=[],nor=[],uv=[];
    for(const o of list){
      const g=o.geometry.index?o.geometry.toNonIndexed():o.geometry;
      const mm=o.matrixWorld, nm=new THREE.Matrix3().getNormalMatrix(mm);
      const pa=g.attributes.position.array,na=g.attributes.normal.array,ua=g.attributes.uv?g.attributes.uv.array:null;
      for(let i=0;i<pa.length/3;i++){ _p.set(pa[i*3],pa[i*3+1],pa[i*3+2]).applyMatrix4(mm); pos.push(_p.x,_p.y,_p.z); _p.set(na[i*3],na[i*3+1],na[i*3+2]).applyMatrix3(nm).normalize(); nor.push(_p.x,_p.y,_p.z); uv.push(ua?ua[i*2]:0,ua?ua[i*2+1]:0); }
    }
    const geo=new THREE.BufferGeometry(); geo.setAttribute("position",new THREE.Float32BufferAttribute(pos,3)); geo.setAttribute("normal",new THREE.Float32BufferAttribute(nor,3)); geo.setAttribute("uv",new THREE.Float32BufferAttribute(uv,2));
    const m=new THREE.Mesh(geo,mat); m.castShadow=true; m.receiveShadow=true; m.frustumCulled=false; body.add(m);
  }
  for(const o of toRemove){ if(o.parent) o.parent.remove(o); }
}
const headSpot = new THREE.SpotLight(0xfff1d6,0,55,.55,.5,1.4);
headSpot.position.set(0,1.0,-1.0); const headTgt=new THREE.Object3D(); headTgt.position.set(0,.2,-12); player.add(headSpot); player.add(headTgt); headSpot.target=headTgt;


/* ===================== RIG DO PILOTO + PEZINHO ===================== */
scene.updateMatrixWorld(true);
const riderG=body.getObjectByName("PILOTO COM CAPACETE");
let upper=null, headG=null; const UPV=new THREE.Vector3(0,1.05,.12), HDV=new THREE.Vector3(0,1.58,-.03);
(function(){
  const bx=new THREE.Box3(), c=new THREE.Vector3(), sz=new THREE.Vector3();
  // pezinho (descanso lateral): dobrado para frente, junto ao quadro
  const kg=new THREE.Group(); kg.position.set(-.18,.37,.47); let nk=0;
  for(const ch of body.children.slice()){ if(ch===riderG) continue; bx.setFromObject(ch); if(bx.isEmpty()) continue; bx.getCenter(c); bx.getSize(sz); body.worldToLocal(c);
    if(c.x>-.31&&c.x<-.14&&c.y<.4&&c.z>.42&&c.z<.52&&sz.x<.13&&sz.z<.13&&sz.y<.4){ kg.add(ch); ch.position.sub(kg.position); nk++; } }
  body.add(kg); kg.rotation.x=1.35; kg.rotation.z=.25; console.log("pezinho: pecas dobradas =",nk);
  if(!riderG) return;
  upper=new THREE.Group(); upper.position.copy(UPV); riderG.add(upper);
  headG=new THREE.Group(); headG.position.copy(HDV).sub(UPV); upper.add(headG);
  for(const ch of riderG.children.slice()){ if(ch===upper) continue; bx.setFromObject(ch); if(bx.isEmpty()) continue; bx.getCenter(c); riderG.worldToLocal(c);
    if(c.y>=1.6){ headG.add(ch); ch.position.sub(HDV); } else if(c.y>=1.0){ upper.add(ch); ch.position.sub(UPV); } }
})();
let rkx=0, rkz=0, rky=0, hy=0, hx=0, hz=0;
function animRider(dt,t,sp,acc,boost,brk){
  if(!upper) return; const k=1-Math.exp(-7*dt), n=clamp(sp/14,0,1);
  const tx=-(.04+.06*n)-(boost?.1:0)+clamp(acc*.008,-.1,.1)+(brk?-.08:0);
  rkx=lerp(rkx,tx,k); rkz=lerp(rkz,-P.lean*.4+Math.sin(t*2.1)*.012*n,k); rky=lerp(rky,P.steer*.2*n,k);
  const jolt=Math.sin(t*38)*P.shake*.05;
  upper.rotation.set(rkx+jolt,rky,rkz);
  upper.position.y=UPV.y-.012*n-(boost?.035:0)-Math.abs(Math.sin(t*sp*.55))*.01*n-(brk?.02:0);
  upper.scale.y=1+Math.sin(t*1.9)*.004;
  const look=sp<1?Math.sin(t*.55)*.4*Math.max(0,Math.sin(t*.23)):0;
  hy=lerp(hy,P.steer*.5*(.4+.6*n)+look,k); hx=lerp(hx,-rkx*.75+(boost?.1:0),k); hz=lerp(hz,-(P.lean+rkz)*.7,k);
  headG.rotation.set(hx,hy,hz);
}

/* ===================== EFEITOS DO PLAYER ===================== */
const FXN=80, fxEl=document.getElementById("speedfx");
function makePool(size){ const pos=new Float32Array(FXN*3).fill(-999), col=new Float32Array(FXN*3); const g=new THREE.BufferGeometry(); g.setAttribute("position",new THREE.BufferAttribute(pos,3)); g.setAttribute("color",new THREE.BufferAttribute(col,3));
  const p=new THREE.Points(g,new THREE.PointsMaterial({map:glowTex,size,vertexColors:true,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending})); p.frustumCulled=false; scene.add(p);
  return {g,pos,col,life:new Float32Array(FXN),max:new Float32Array(FXN),vel:new Float32Array(FXN*3),c:new Float32Array(FXN*3),i:0}; }
function emit(P_,x,y,z,vx,vy,vz,life,r,g,b){ const i=P_.i=(P_.i+1)%FXN; P_.pos.set([x,y,z],i*3); P_.vel.set([vx,vy,vz],i*3); P_.life[i]=P_.max[i]=life; P_.c.set([r,g,b],i*3); }
function stepPool(P_,dt,grav){ for(let i=0;i<FXN;i++){ if(P_.life[i]<=0) continue; P_.life[i]-=dt; const k=Math.max(0,P_.life[i]/P_.max[i]);
    if(P_.life[i]<=0){ P_.pos[i*3+1]=-999; continue; } P_.vel[i*3+1]+=grav*dt; for(let a=0;a<3;a++){ P_.pos[i*3+a]+=P_.vel[i*3+a]*dt; P_.col[i*3+a]=P_.c[i*3+a]*k; } }
  P_.g.attributes.position.needsUpdate=true; P_.g.attributes.color.needsUpdate=true; }
const fxNeon=makePool(.45), fxDust=makePool(.9), fxSpark=makePool(.22);
const glowM=new THREE.Mesh(new THREE.PlaneGeometry(1.5,3.2),new THREE.MeshBasicMaterial({map:glowTex,color:0x36f1d0,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-6}));
glowM.rotation.x=-Math.PI/2; glowM.position.y=.05; player.add(glowM);
const rnd=()=>Math.random()-.5; let lastV=0, pitchV=0;
function updateFx(dt,t){
  const sp=Math.abs(P.v), fx_=-Math.sin(P.h), fz_=-Math.cos(P.h), rxp=P.x-fx_*.62, rzp=P.z-fz_*.62;
  const brk=(keys["s"]||keys["arrowdown"]||touch.down||keys[" "])&&P.v>4, boost=keys["shift"]&&P.v>11;
  if(boost) for(let k=0;k<2;k++) emit(fxNeon,rxp+rnd()*.15,.28+rnd()*.12,rzp+rnd()*.15,-fx_*2.5+rnd(),rnd()*.5,-fz_*2.5+rnd(),.6,.2,.95,.85);
  if(sp>6&&frame%3===0) emit(fxNeon,rxp,.2,rzp,rnd()*.3,0,rnd()*.3,.35,.05,.35,.3);
  if(brk||(Math.abs(P.steer)>.65&&sp>9)) for(let k=0;k<2;k++) emit(fxDust,rxp+rnd()*.3,.1,rzp+rnd()*.3,-fx_*1.2+rnd()*1.4,.6+Math.random()*.6,-fz_*1.2+rnd()*1.4,.7,.42,.38,.3);
  if(P.shake>.45) for(let k=0;k<5;k++) emit(fxSpark,P.x+fx_*.8,.4,P.z+fz_*.8,rnd()*5,Math.random()*3,rnd()*5,.4,1,.65,.2);
  if(P.x>509&&sp>1.5){ for(let k=0;k<3;k++) emit(fxSpark,P.x+rnd()*.5,.06,P.z+rnd()*.5,rnd()*2.5,1.5+Math.random()*2.5,rnd()*2.5,.55,.7,.9,1); if(frame%2===0) emit(fxDust,rxp,.06,rzp,rnd()*.6,.15,rnd()*.6,.9,.45,.7,.8); }
  stepPool(fxNeon,dt,0); stepPool(fxDust,dt,-.5); stepPool(fxSpark,dt,-9);
  glowM.material.opacity=.18+cur.night*.5+clamp(sp/30,0,.3)+(boost?.25:0)+Math.sin(t*3)*.04;
  const acc=(P.v-lastV)/Math.max(dt,.001); lastV=P.v; pitchV=lerp(pitchV,clamp(-acc*.0045,-.07,.07),1-Math.exp(-6*dt)); body.rotation.x=pitchV;
  tailMat.emissiveIntensity+= brk?2.2:0; animRider(dt,t,sp,acc,boost,brk);
  if(fxEl) fxEl.style.opacity=clamp((sp-11)/10,0,.85)*(boost?1:.7);
}

/* ===================== VEICULOS DE TRANSITO ===================== */
const cars=[];
const lanes=[];
for(const a of lines){ lanes.push({axis:0,fixed:a,off:2.8,dir:1}); lanes.push({axis:0,fixed:a,off:-2.8,dir:-1}); lanes.push({axis:1,fixed:a,off:-2.8,dir:1}); lanes.push({axis:1,fixed:a,off:2.8,dir:-1}); }
function spawnCar(i){
  const lane=lanes[i%lanes.length]; const isBus=i<6; const kind=pick(["sedan","hatch","van","sedan"]);
  const g= isBus ? busMeshGroup() : carMeshGroup(kind,pick(carPaints)); scene.add(g);
  const car={g,lane,s:rr(-360,360),v:0,vmax:rr(8,12),L:g.userData.L,isBus};
  cars.push(car); return car;
}
for(let i=0;i<(isMobile?50:80);i++) spawnCar(i);
// espalhar carros na mesma pista
function carPos(c){ const l=c.lane; return l.axis===0 ? [c.s,l.fixed+l.off] : [l.fixed+l.off,c.s]; }
const signalTime={t:0}; let phaseX="green", phaseZ="red";
function phaseFor(axis){ return axis===0?phaseX:phaseZ; }

/* ===================== PEDESTRES ===================== */
const peds=[];
{
  const bg=new THREE.BoxGeometry(.4,.62,.24), lg=new THREE.BoxGeometry(.16,.7,.18), ag=new THREE.BoxGeometry(.11,.58,.12), hg=new THREE.SphereGeometry(.14,10,8);
  for(let n=0;n<46;n++){
    const g=new THREE.Group();
    const shirt=pick(clothMats), skin=pick(skinMats), pants=pick(pantsMats);
    const torso=new THREE.Mesh(bg,shirt); torso.position.y=1.32; torso.castShadow=false; g.add(torso);
    const head=new THREE.Mesh(hg,skin); head.position.y=1.8; head.castShadow=false; g.add(head);
    const hair=new THREE.Mesh(new THREE.SphereGeometry(.15,10,6,0,6.28,0,1.6),pick([metalDark,woodMat,M(0xc9a36a,.9,0)])); hair.position.y=1.84; g.add(hair);
    const legs=[],arms=[];
    for(const s of [-1,1]){ const lp=new THREE.Group(); lp.position.set(s*.11,1.02,0); const lm=new THREE.Mesh(lg,pants); lm.position.y=-.35; lm.castShadow=false; lp.add(lm); g.add(lp); legs.push(lp);
      const ap=new THREE.Group(); ap.position.set(s*.26,1.58,0); const am=new THREE.Mesh(ag,shirt); am.position.y=-.27; am.castShadow=false; ap.add(am); g.add(ap); arms.push(ap); }
    scene.add(g);
    const bl=minimapBlocks[(Math.random()*minimapBlocks.length)|0];
    peds.push({g,legs,arms,cx:bl[0],cz:bl[1],s:Math.random()*240,dir:Math.random()<.5?1:-1,spd:rr(1.1,1.7),ph:Math.random()*6});
  }
}
function pedPos(p){ const s=((p.s%240)+240)%240, side=Math.floor(s/60), t=s%60; const H=30; let x,z,hd;
  if(side===0){x=-H+t;z=-H;hd=1;} else if(side===1){x=H;z=-H+t;hd=1;} else if(side===2){x=H-t;z=H;hd=1;} else {x=-H;z=H-t;hd=1;}
  return [p.cx+x,p.cz+z,side]; }

/* ===================== FONTE (jatos) ===================== */
const jet = (()=>{ const n=140; const pos=new Float32Array(n*3); const g=new THREE.BufferGeometry(); g.setAttribute("position",new THREE.BufferAttribute(pos,3));
  const pts=new THREE.Points(g,new THREE.PointsMaterial({color:0xcfefff,size:.22,transparent:true,opacity:.8,depthWrite:false})); pts.frustumCulled=false; scene.add(pts);
  const prm=[]; for(let i=0;i<n;i++) prm.push({a:Math.random()*6.28,r:rr(.4,3.2),h:rr(1.4,3.4),ph:Math.random()});
  return {pts,pos,prm,n}; })();
const fountainWater = new THREE.Mesh(new THREE.CylinderGeometry(4.6,4.6,.05,48),waterMat); fountainWater.position.set(40,G+1.0,40); scene.add(fountainWater);
const pondCenter=[-2*80+40+17*-1+0,0]; // sem uso — lagoas sao estaticas
function updateJets(t){
  for(let i=0;i<jet.n;i++){ const p=jet.prm[i]; const u=(t*.55+p.ph)%1; const x=40+Math.cos(p.a)*p.r*u*(i%3===0?.3:1), z=40+Math.sin(p.a)*p.r*u*(i%3===0?.3:1); const y=G+3.7+4*p.h*u*(1-u)*(i%3===0?1.8:1)-.6*u; jet.pos[i*3]=x; jet.pos[i*3+1]=y; jet.pos[i*3+2]=z; }
  jet.pts.geometry.attributes.position.needsUpdate=true;
  waterTex.offset.set(t*.01,t*.007);
}

/* ===================== SOM (WebAudio sintetizado, sem arquivos) ===================== */
const isTouch=("ontouchstart" in window)||navigator.maxTouchPoints>0;
const SFX=(()=>{
  const O={music:.5,sfx:.8}; let ac=null,master,mG,sG,nb,muted=false,hornN=null,curNight=0,mTimer=null;
  const L={}; let nextThunder=20,nextBird=0,nextGull=0,nextHorn=0,sirenT=0,sirenHi=false,musicT=0,mstep=0;
  const midi=n=>261.63*Math.pow(2,n/12);
  const vol=()=>{ if(!ac) return; sG.gain.value=O.sfx; master.gain.value=muted?0:1; };
  const noiseSrc=()=>{ const s=ac.createBufferSource(); s.buffer=nb; s.loop=true; s.start(); return s; };
  const osc=(type,f)=>{ const o=ac.createOscillator(); o.type=type; o.frequency.value=f; o.start(); return o; };
  const nchain=(type,f,q)=>{ const n=noiseSrc(), fl=ac.createBiquadFilter(); fl.type=type; fl.frequency.value=f; fl.Q.value=q; const g=ac.createGain(); g.gain.value=0; n.connect(fl); fl.connect(g); g.connect(sG); return {fl,g}; };
  const panner=pan=>{ if(!ac.createStereoPanner) return sG; const p=ac.createStereoPanner(); p.pan.value=pan; p.connect(sG); return p; };
  function tone(f,dur,type,v,slide,dest,at){ if(!ac) return; const t0=at||ac.currentTime, o=ac.createOscillator(), g=ac.createGain(); o.type=type||"sine"; o.frequency.setValueAtTime(f,t0); if(slide) o.frequency.exponentialRampToValueAtTime(Math.max(20,f+slide),t0+dur); g.gain.setValueAtTime(.0001,t0); g.gain.exponentialRampToValueAtTime(Math.max(.0002,v),t0+Math.min(.02,dur/3)); g.gain.exponentialRampToValueAtTime(.0001,t0+dur); o.connect(g); g.connect(dest||sG); o.start(t0); o.stop(t0+dur+.05); }
  function burst(dur,f,v,type,q,dest){ if(!ac) return; const t0=ac.currentTime, s=ac.createBufferSource(); s.buffer=nb; const fl=ac.createBiquadFilter(); fl.type=type||"lowpass"; fl.frequency.value=f; fl.Q.value=q||.7; const g=ac.createGain(); g.gain.setValueAtTime(Math.max(.0002,v),t0); g.gain.exponentialRampToValueAtTime(.0001,t0+dur); s.connect(fl); fl.connect(g); g.connect(dest||sG); s.start(t0,Math.random()*1.5); s.stop(t0+dur+.05); }
  const CD=[[0,4,7],[-3,0,4],[-7,-3,0],[-5,-1,2]], CN=[[-3,0,4],[-7,-3,0],[0,4,7],[-5,-1,2]];
  function musicTick(){ if(!ac||ac.state!=="running") return; const night=curNight>.5, beat=60/(night?78:96), ch=night?CN:CD;
    if(musicT<ac.currentTime) musicT=ac.currentTime+.05;
    while(musicT<ac.currentTime+.35){ const c=ch[(mstep>>3)%4], s=mstep&7;
      if(s===0){ for(const n of c) tone(midi(n),beat*4.2,"triangle",.045,0,mG,musicT); tone(midi(c[0]-24),beat*2,"sine",.12,0,mG,musicT); }
      if(s===4) tone(midi(c[0]-24),beat*1.6,"sine",.09,0,mG,musicT);
      if(s===0||s===2||s===3||s===5||s===6) tone(midi(c[(s*3>>1)%3]+12),beat*.9,"triangle",.05,0,mG,musicT);
      mstep++; musicT+=beat/2; } }
  function init(){
    if(ac){ if(ac.state==="suspended") ac.resume(); return; }
    const AC=window.AudioContext||window.webkitAudioContext; if(!AC) return;
    ac=new AC(); if(ac.resume) ac.resume(); master=ac.createGain(); master.connect(ac.destination); mG=ac.createGain(); sG=ac.createGain(); mG.connect(master); sG.connect(master);
    nb=ac.createBuffer(1,ac.sampleRate*2,ac.sampleRate); const d=nb.getChannelData(0); for(let i=0;i<d.length;i++) d[i]=Math.random()*2-1;
    const mo=osc("sawtooth",60), mo2=osc("square",30), wh=osc("sine",500), mf=ac.createBiquadFilter(); mf.type="lowpass"; mf.frequency.value=500;
    const mg=ac.createGain(); mg.gain.value=0; mo.connect(mf); mo2.connect(mf); mf.connect(mg); mg.connect(sG);
    const wg=ac.createGain(); wg.gain.value=0; wh.connect(wg); wg.connect(sG); L.mo={mo,mo2,mf,mg,wh,wg};
    L.wind=nchain("bandpass",400,.6); L.roll=nchain("lowpass",600,.5); L.scr=nchain("bandpass",2600,9); L.sea=nchain("lowpass",500,.4); L.fount=nchain("highpass",2500,.5); L.city=nchain("lowpass",160,.5); L.rain=nchain("highpass",3500,.3);
    { const cl=osc("sine",4300), am=ac.createGain(), lf=osc("sine",13), lg=ac.createGain(), cg=ac.createGain(); am.gain.value=0; lg.gain.value=.5; cg.gain.value=0; cl.connect(am); lf.connect(lg); lg.connect(am.gain); am.connect(cg); cg.connect(sG); L.cri={g:cg}; }
    { const o=osc("sawtooth",80), f=ac.createBiquadFilter(), g=ac.createGain(), p=ac.createStereoPanner?ac.createStereoPanner():null; f.type="lowpass"; f.frequency.value=420; g.gain.value=0; o.connect(f); f.connect(g); if(p){ g.connect(p); p.connect(sG); } else g.connect(sG); L.car={o,g,p}; }
    { const o=osc("square",700), f=ac.createBiquadFilter(), g=ac.createGain(); f.type="lowpass"; f.frequency.value=1800; g.gain.value=0; o.connect(f); f.connect(g); g.connect(sG); L.sir={o,g}; }
    vol(); musicT=ac.currentTime+.1; mTimer=setInterval(musicTick,60);
    document.addEventListener("visibilitychange",()=>{ if(!ac) return; if(document.hidden) ac.suspend(); else ac.resume(); });
  }
  function chirp(){ const t0=ac.currentTime, f0=2800+Math.random()*1600, n=2+(Math.random()*3|0); for(let i=0;i<n;i++) tone(f0+i*120,.07,"sine",.035,900,sG,t0+i*.11); }
  function gull(){ const t0=ac.currentTime, f=1000+Math.random()*300; tone(f,.2,"triangle",.05,500,sG,t0); tone(f+400,.32,"triangle",.05,-600,sG,t0+.22); }
  function carHorn(pan){ const d=panner(pan), t0=ac.currentTime; for(const k of [0,.3]){ tone(370,.2,"square",.035,0,d,t0+k); tone(466,.2,"square",.035,0,d,t0+k); } }
  function horn(on){ if(!ac) return; if(on&&!hornN){ const o1=osc("square",392), o2=osc("square",494), f=ac.createBiquadFilter(), g=ac.createGain(); f.type="lowpass"; f.frequency.value=1500; g.gain.value=0; o1.connect(f); o2.connect(f); f.connect(g); g.connect(sG); g.gain.setTargetAtTime(.13,ac.currentTime,.01); hornN={o1,o2,g}; }
    else if(!on&&hornN){ const h=hornN; hornN=null; h.g.gain.setTargetAtTime(0,ac.currentTime,.03); setTimeout(()=>{ try{ h.o1.stop(); h.o2.stop(); }catch(e){} },200); } }
  function sfx(name,a){ if(!ac) return; const T=ac.currentTime; a=a||1;
    switch(name){
      case "click": tone(740,.07,"square",.05,300); break;
      case "hover": tone(520,.04,"sine",.025); break;
      case "back": tone(440,.08,"triangle",.06,-120); break;
      case "start": [0,4,7,12].forEach((n,i)=>tone(midi(n),.4,"triangle",.07,0,sG,T+i*.08)); burst(.7,2500,.05,"highpass"); break;
      case "toggle": tone(660,.1,"sine",.07); tone(990,.14,"sine",.06,0,sG,T+.09); break;
      case "cam": tone(500,.06,"square",.04,200); break;
      case "reset": tone(600,.25,"sine",.07,-350); break;
      case "pause": tone(420,.12,"triangle",.06,-100); break;
      case "resume": tone(560,.12,"triangle",.06,120); break;
      case "thud": burst(.28,260,.55*a,"lowpass"); tone(80,.3,"sine",.5*a,-50); break;
      case "splash": burst(.45,2200,.22,"bandpass",.8); break;
      case "jump": tone(300,.18,"square",.04,500); break;
      case "land": burst(.18,500,.3*a,"lowpass"); tone(120,.15,"sine",.25,-60); break;
      case "coin": tone(1320,.08,"square",.04); tone(1760,.12,"square",.04,0,sG,T+.07); break;
      case "boost": tone(180,.5,"sawtooth",.06,900); burst(.5,3000,.07,"highpass"); break;
    } }
  function update(dt,c){
    if(!ac||ac.state!=="running") return; const T=ac.currentTime, set=(p,v,k)=>p.setTargetAtTime(v,T,k||.08);
    const playing=c.st==="play", act=c.st!=="pause", sp=Math.abs(c.P.v), n=Math.min(1,sp/21), x=c.P.x, z=c.P.z; curNight=c.night;
    const m=L.mo;
    set(m.mo.frequency,55+n*210+(c.f?18:0),.06); set(m.mo2.frequency,28+n*105,.06); set(m.mf.frequency,300+n*1600+(c.boost?500:0),.1);
    set(m.mg.gain,playing?(.04+.11*n+(c.f?.04:0)+(c.boost?.05:0)):0,.1);
    set(m.wh.frequency,520+n*2000+(c.boost?350:0),.08); set(m.wg.gain,playing?(.012+.045*n):0,.1);
    set(L.wind.fl.frequency,250+n*1300); set(L.wind.g.gain,playing?n*n*.30:0,.12);
    const S={road:[650,.02+n*.10],walk:[1100,.03+n*.13],wood:[900,.04+n*.14],sand:[380,n*.07],water:[2200,.05+n*.22]}[c.surf]||[650,.02+n*.1];
    set(L.roll.fl.frequency,S[0]); set(L.roll.g.gain,playing&&sp>.3?S[1]:0,.06);
    set(L.scr.fl.frequency,2300+n*600); set(L.scr.g.gain,playing?((c.brk&&sp>6)?Math.min(1,sp/18)*.11:((Math.abs(c.steer)>.75&&sp>11)?.05:0)):0,.04);
    const prox=Math.max(0,Math.min(1,(x-340)/150)), os=.5+.5*Math.sin(c.t*.8);
    set(L.sea.g.gain,act?prox*(.07+.12*os):0,.3); set(L.sea.fl.frequency,300+380*os,.3);
    const fd=Math.hypot(x-40,z-40), fv=Math.max(0,1-fd/50); set(L.fount.g.gain,act?fv*fv*.14:0,.3);
    const rd=c.rain||0, big=c.surf==="road"?1:0; set(L.city.g.gain,act?(.05+.04*big+.05*Math.max(0,1-Math.hypot(x-40,z-40)/160))*(1-prox):0,.5); set(L.rain.g.gain,act?rd*.09:0,.5);
    if(act&&rd>.6&&T>nextThunder){ nextThunder=T+14+Math.random()*20; burst(1.6,160,.5,"lowpass"); tone(55,1.2,"sawtooth",.08,-25); }
    set(L.cri.g.gain,act?Math.max(0,Math.min(1,(c.night-.4)*2))*.03*(1-prox):0,.5);
    let nd=1e9,nc=null,pd=1e9,pc=null; const fx=-Math.sin(c.P.h), fz=-Math.cos(c.P.h), rx=Math.cos(c.P.h), rz=-Math.sin(c.P.h);
    for(const car of c.cars){ if(!car.g.visible) continue; const p=c.carPos(car), dx=p[0]-x, dz=p[1]-z, d=Math.hypot(dx,dz); if(d<nd){ nd=d; nc={car,dx,dz}; } if(car.g.userData.mdl===4&&d<pd){ pd=d; pc=car; } }
    if(nc){ set(L.car.o.frequency,65+(nc.car.v||0)*9,.1); set(L.car.g.gain,act&&nd<45?.12*Math.pow(1-nd/45,1.6)*(.4+(nc.car.v||0)/12):0,.1); if(L.car.p) set(L.car.p.pan,Math.max(-1,Math.min(1,(nc.dx*rx+nc.dz*rz)/Math.max(nd,4)*1.2)),.1);
      if(c.st==="play"&&nd<11&&nc.car.v<1.3&&T>nextHorn&&(nc.dx*fx+nc.dz*fz)>0){ nextHorn=T+4+Math.random()*3; carHorn(Math.max(-1,Math.min(1,(nc.dx*rx+nc.dz*rz)/Math.max(nd,4)))); } } else set(L.car.g.gain,0,.1);
    if(pc&&pd<90&&act){ set(L.sir.g.gain,.05*Math.pow(1-pd/90,1.5),.1); if(T>sirenT){ sirenHi=!sirenHi; sirenT=T+.42; set(L.sir.o.frequency,sirenHi?960:700,.04); } } else set(L.sir.g.gain,0,.15);
    const day=1-c.night; if(act&&day>.4&&prox<.6&&T>nextBird){ chirp(); nextBird=T+1.2+Math.random()*3.5; }
    if(act&&prox>.25&&day>.3&&T>nextGull){ gull(); nextGull=T+3+Math.random()*5; }
    mG.gain.setTargetAtTime(O.music*.38*(c.st==="pause"?.35:1),T,.2);
  }
  return { init, update, sfx, horn, setVol(k,v){ O[k]=v; vol(); }, setMuted(v){ muted=v; vol(); }, isMuted:()=>muted };
})();

/* ===================== ENTRADA / CONTROLES ===================== */
const keys={};
const touch={up:false,down:false,left:false,right:false,ax:0};
const hintEl=document.getElementById("hint");
let hintTimer=0; function hint(t){ hintEl.textContent=t; hintEl.style.opacity=1; clearTimeout(hintTimer); hintTimer=setTimeout(()=>hintEl.style.opacity=0,1800); }
const camDists=[6.8,3.8,12]; let camMode=0;
window.addEventListener("keydown",e=>{
  const k=e.key.toLowerCase(); keys[k]=true;
  if([" ","arrowup","arrowdown","arrowleft","arrowright"].includes(k)) e.preventDefault();
  if(e.repeat) return;
  if(k==="escape"||k==="p") actPause();
  if(k==="m") actMute();
  if(gameState!=="play") return;
  if(k==="n") actNight();
  if(k==="c") actCam();
  if(k==="r") actReset();
  if(k==="h"){ SFX.horn(true); F2.stat.horn++; }
  if(k==="g") F2.race();
  if(k==="y") F2.toggleRain();
  if(k==="j") F2.jump();
});
window.addEventListener("keyup",e=>{ const k=e.key.toLowerCase(); keys[k]=false; if(k==="h") SFX.horn(false); });
window.addEventListener("blur",()=>{ for(const k in keys) keys[k]=false; });
const $t=id=>document.getElementById(id);
{
  const joy=$t("joy"), knob=$t("joyKnob"); let jid=null;
  const jset=e=>{ const r=joy.getBoundingClientRect(), R=r.width/2; let dx=e.clientX-(r.left+R), dy=e.clientY-(r.top+R); const m=Math.hypot(dx,dy); if(m>R){ dx*=R/m; dy*=R/m; }
    knob.style.transform="translate("+dx+"px,"+dy+"px)"; const nx=dx/R, ny=dy/R; touch.ax=Math.abs(nx)<.1?0:-nx; touch.up=ny<-.28; touch.down=ny>.28; };
  const jend=e=>{ if(e.pointerId!==jid) return; jid=null; knob.style.transform=""; touch.ax=0; touch.up=false; touch.down=false; };
  joy.addEventListener("pointerdown",e=>{ jid=e.pointerId; try{ joy.setPointerCapture(jid); }catch(_){} jset(e); e.preventDefault(); });
  joy.addEventListener("pointermove",e=>{ if(e.pointerId===jid) jset(e); });
  for(const ev of ["pointerup","pointercancel","lostpointercapture"]) joy.addEventListener(ev,jend);
  const hold=(id,on,off)=>{ const el=$t(id); let pid=null; const end=e=>{ if(pid===null||(e&&e.pointerId!==pid)) return; pid=null; el.classList.remove("down"); off(); };
    el.addEventListener("pointerdown",e=>{ pid=e.pointerId; try{ el.setPointerCapture(pid); }catch(_){} el.classList.add("down"); on(); e.preventDefault(); });
    for(const ev of ["pointerup","pointercancel","lostpointercapture"]) el.addEventListener(ev,end); };
  hold("tBoost",()=>{ keys.shift=true; },()=>{ keys.shift=false; });
  hold("tBrake",()=>{ keys[" "]=true; },()=>{ keys[" "]=false; });
  hold("tHorn",()=>{ SFX.horn(true); F2.stat.horn++; },()=>SFX.horn(false));
  const tap=(id,fn)=>$t(id).addEventListener("pointerdown",e=>{ fn(); e.preventDefault(); });
  tap("tCam",()=>actCam()); tap("tNight",()=>actNight()); tap("tReset",()=>actReset()); tap("tPause",()=>actPause());
}

let camDist=camDists[0], userYaw=0, userPitch=0, lastDrag=-10, dragging=false, px0=0, py0=0;
const dom=renderer.domElement;
dom.addEventListener("pointerdown",e=>{ dragging=true; px0=e.clientX; py0=e.clientY; dom.setPointerCapture(e.pointerId); });
dom.addEventListener("pointermove",e=>{ if(!dragging) return; userYaw-= (e.clientX-px0)*.006; userPitch=clamp(userPitch+(e.clientY-py0)*.004,-.35,.9); px0=e.clientX; py0=e.clientY; lastDrag=performance.now()/1000; });
const endDrag=()=>{ dragging=false; };
dom.addEventListener("pointerup",endDrag); dom.addEventListener("pointercancel",endDrag);
dom.addEventListener("wheel",e=>{ e.preventDefault(); camDist=clamp(camDist+e.deltaY*.005,2.6,16); },{passive:false});

/* ===================== FISICA DO JOGADOR ===================== */
const P={x:-34,z:2.8,h:-Math.PI/2,v:0,y:0,steer:0,lean:0,shake:0};
function resetPlayer(){ P.x=-34; P.z=2.8; P.h=-Math.PI/2; P.v=0; P.steer=0; P.lean=0; userYaw=0; camH=P.h; F2.onReset(); }
let camH=P.h;
function inRoad(x,z){ const rx=Math.abs(((x+40)%80+80)%80-40), rz=Math.abs(((z+40)%80+80)%80-40); return rx<8.2||rz<8.2||x>332||Math.abs(x)>392||Math.abs(z)>392; }
function impact(nx,nz){ const mx=-Math.sin(P.h)*Math.sign(P.v||1), mz=-Math.cos(P.h)*Math.sign(P.v||1); const into=-(mx*nx+mz*nz); if(into>0){ const imp=Math.abs(P.v)*into; P.v*=1-clamp(into*1.05,0,1)*.88; if(imp>3.5) P.shake=Math.min(1,imp/12); } }
function circleHit(cx,cz,cr){
  const dx=P.x-cx, dz=P.z-cz, d=Math.hypot(dx,dz), r=.58+cr;
  if(d<r&&d>1e-5){ const nx=dx/d, nz=dz/d; P.x+=nx*(r-d); P.z+=nz*(r-d); impact(nx,nz); }
}
function collidePlayer(){
  const r=.58; const ci=Math.floor(P.x/16), cj=Math.floor(P.z/16);
  for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){
    const arr=colHash.get(hkey(ci+a,cj+b)); if(!arr) continue;
    for(const c of arr){
      if(c.t===1){ circleHit(c.x,c.z,c.r); continue; }
      const nx=clamp(P.x,c.x-c.hw,c.x+c.hw), nz=clamp(P.z,c.z-c.hd,c.z+c.hd); let dx=P.x-nx, dz=P.z-nz; const d2=dx*dx+dz*dz;
      if(d2<r*r){
        let d=Math.sqrt(d2), push;
        if(d<1e-5){ const px=c.hw-Math.abs(P.x-c.x), pz=c.hd-Math.abs(P.z-c.z); if(px<pz){ dx=Math.sign(P.x-c.x)||1; dz=0; push=px+r; } else { dz=Math.sign(P.z-c.z)||1; dx=0; push=pz+r; } }
        else { dx/=d; dz/=d; push=r-d; }
        P.x+=dx*push; P.z+=dz*push; impact(dx,dz);
      }
    }
  }
  for(const c of cars){ const pp=carPos(c); const l=c.lane; const ax=l.axis===0?1:0, az=l.axis===0?0:1; const n=c.isBus?4:2; for(let k=0;k<n;k++){ const o=(k-(n-1)/2)*(c.L/n+.2); circleHit(pp[0]+ax*o,pp[1]+az*o,c.isBus?1.4:1.05); } }
}
function updatePlayer(dt){
  const f=keys["w"]||keys["arrowup"]||touch.up, b=keys["s"]||keys["arrowdown"]||touch.down;
  const l=keys["a"]||keys["arrowleft"]||touch.left, r=keys["d"]||keys["arrowright"]||touch.right;
  const boost=keys["shift"]&&F2.bat>0, maxV=(boost?21:14)*F2.mv;
  if(f){ if(P.v<0) P.v+=14*dt; else if(P.v<maxV) P.v+=7.5*F2.acc*(1.15-P.v/maxV)*dt; }
  if(b){ if(P.v>.3) P.v-=15*F2.brk*(1-.35*F2.rain)*dt; else P.v=Math.max(-3.5,P.v-5*dt); }
  if(!f&&!b){ P.v*=Math.exp(-.35*dt); if(Math.abs(P.v)<.05) P.v=0; }
  if(keys[" "]) P.v*=Math.exp(-4*F2.brk*(1-.35*F2.rain)*dt);
  if(P.v>maxV) P.v=Math.max(maxV,P.v-(P.v-maxV)*dt*1.6-.5*dt);
  const sIn=Math.abs(touch.ax)>.04?touch.ax:((l?1:0)-(r?1:0));
  P.steer=lerp(P.steer,sIn,1-Math.exp(-9*dt));
  const turn=2.5*F2.gripv()/(1+Math.abs(P.v)*.1)*Math.min(1,Math.abs(P.v)/1.4)*Math.sign(P.v);
  P.h+=P.steer*turn*dt;
  P.x+=-Math.sin(P.h)*P.v*dt; P.z+=-Math.cos(P.h)*P.v*dt;
  collidePlayer();
  const lim=392; if(P.x<-lim||P.x>538){ P.x=clamp(P.x,-lim,538); P.v*=.5; } if(P.x>510) P.v*=Math.exp(-.6*dt); if(Math.abs(P.z)>lim){ P.z=clamp(P.z,-lim,lim); P.v*=.5; }
  const ty=inRoad(P.x,P.z)?0:G; if(!F2.air&&!F2.ramp) P.y=lerp(P.y,ty,1-Math.exp(-18*dt));
  const leanT=P.steer*clamp(Math.abs(P.v)/12,0,1)*.4;
  P.lean=lerp(P.lean,leanT,1-Math.exp(-7*dt));
  P.shake=Math.max(0,P.shake-dt*2.2);
  player.position.set(P.x,P.y,P.z); player.rotation.y=P.h; body.rotation.z=P.lean;
  const ws=-P.v*dt/.255; sc.wheelFront.rotation.x+=ws; sc.wheelRear.rotation.x+=ws;
  body.position.y=Math.sin(performance.now()*.03)*.004*clamp(P.v/10,0,1);
}

/* ===================== ATUALIZAR TRANSITO ===================== */
function updateTraffic(dt){
  signalTime.t=(signalTime.t+dt)%24;
  const t=signalTime.t; let px,pz;
  if(t<9){px="green";pz="red";} else if(t<11){px="yellow";pz="red";} else if(t<12){px="red";pz="red";} else if(t<21){px="red";pz="green";} else if(t<23){px="red";pz="yellow";} else {px="red";pz="red";}
  phaseX=px; phaseZ=pz;
  for(const [ax,ph] of [[0,px],[1,pz]]){ const m=tlMats[ax]; m.r.emissiveIntensity=ph==="red"?2.6:.08; m.y.emissiveIntensity=ph==="yellow"?2.6:.08; m.g.emissiveIntensity=ph==="green"?2.6:.08; }
  for(const c of cars){
    const l=c.lane; let target=c.vmax;
    // semaforo a frente
    const nextLine=Math.ceil((c.s*l.dir+.001)/CELL)*CELL*l.dir; // linha de cruzamento a frente (aprox)
    let best=1e9; for(const a of lines){ const d=(a-c.s)*l.dir-12.5-c.L/2; if(d>-4&&d<best) best=d; }
    const ph=phaseFor(l.axis);
    if(best<26&&best>-1&&(ph==="red"||(ph==="yellow"&&best>7))){ target=Math.min(target,Math.max(0,best)*.9); if(best<1.2) target=0; }
    // carro a frente
    for(const o of cars){ if(o===c||o.lane.axis!==l.axis||o.lane.fixed!==l.fixed||o.lane.dir!==l.dir) continue; const d=(o.s-c.s)*l.dir-(o.L+c.L)/2-1.5; if(d>-1&&d<18) target=Math.min(target,Math.max(0,d)*.9); }
    // jogador a frente
    const pp=carPos(c); { const dx=P.x-pp[0], dz=P.z-pp[1]; const along=l.axis===0?dx*l.dir:dz*l.dir, across=l.axis===0?dz:dx; if(along>0&&along<14&&Math.abs(across)<2.2) target=Math.min(target,Math.max(0,along-3)*.8); }
    c.v+=clamp(target-c.v,-14*dt,3.2*dt);
    c.s+=c.v*dt*l.dir;
    if(c.s>396) c.s=-396; if(c.s<-396) c.s=396;
    const p=carPos(c); c.g.position.set(p[0],.02,p[1]);
    c.g.rotation.y = l.axis===0 ? (l.dir>0?-Math.PI/2:Math.PI/2) : (l.dir>0?Math.PI:0);
    for(const w of c.g.userData.wheels) w.rotation.x-=c.v*dt/.35;
  }
}
function updatePeds(dt,t){
  for(const p of peds){
    p.s+=p.dir*p.spd*dt; const pos=pedPos(p);
    p.g.position.set(pos[0],G,pos[1]);
    const dirs=[[1,0],[0,1],[-1,0],[0,-1]][pos[2]]; const dx=dirs[0]*p.dir, dz=dirs[1]*p.dir;
    p.g.rotation.y=Math.atan2(dx,dz);
    const sw=Math.sin(t*p.spd*4+p.ph)*.7;
    p.legs[0].rotation.x=sw; p.legs[1].rotation.x=-sw; p.arms[0].rotation.x=-sw*.8; p.arms[1].rotation.x=sw*.8;
  }
}

/* ===================== EXTRAS: MOEDAS, BATERIA, CORRIDA, MANOBRAS, CHUVA, GARAGEM, CONQUISTAS ===================== */
const F2=(()=>{
const E=id=>document.getElementById(id), o={bat:100,rain:0,air:false,ramp:false,km:0,mv:1,acc:1,brk:1,maxCombo:0,spin:0,flip:0};
let S={coins:0,up:[0,0,0,0],neon:0,own:[1,0,0,0],best:0,auto:true,ach:{},st:{}};
try{ const j=JSON.parse(localStorage.getItem("volt_save")||"null"); if(j) S=Object.assign(S,j); }catch(e){}
S.st=Object.assign({horn:0,coins:0,races:0,jumps:0,rain:0},S.st); o.stat=S.st;
const save=()=>{ try{ localStorage.setItem("volt_save",JSON.stringify(S)); }catch(e){} };
const NEON=[0x36f1d0,0xff4fd8,0xffb02e,0x6aa8ff], cap=()=>100+20*S.up[1];
o.gripv=()=>(1-.4*o.rain)*(1+.05*S.up[3]);
function recalc(){ o.mv=1+.04*S.up[0]; o.acc=1+.08*S.up[0]; o.brk=1+.1*S.up[2]; glowM.material.color.setHex(NEON[S.neon]); }
recalc();
// ---- UI (HUD + aviso) ----
const tEl=document.createElement("div"); tEl.id="toast"; document.body.appendChild(tEl); let tT=0;
function toast(t){ tEl.textContent=t; tEl.style.opacity=1; clearTimeout(tT); tT=setTimeout(()=>tEl.style.opacity=0,2400); }
const hud=document.createElement("div"); hud.className="hud xtra"; hud.innerHTML='<div id="xCoin"></div><div class="xb"><i id="xBat"></i></div><small id="xBatT"></small><div id="xCombo"></div><div id="xRace"></div>'; document.body.appendChild(hud);
const xC=E("xCoin"), xB=E("xBat"), xBT=E("xBatT"), xCo=E("xCombo"), xR=E("xRace");
// ---- moedas ----
const NC=70, D=new THREE.Object3D(), cg=new THREE.CylinderGeometry(.45,.45,.09,16); cg.rotateX(Math.PI/2);
const cm=new THREE.InstancedMesh(cg,new THREE.MeshStandardMaterial({color:0xffc93a,emissive:0xb07a00,emissiveIntensity:.8,metalness:.6,roughness:.3}),NC); cm.frustumCulled=false; scene.add(cm);
const coins=[]; for(let i=0;i<NC;i++){ const a=lines[(Math.random()*lines.length)|0], s=(Math.random()*2-1)*310, l=(Math.random()<.5?-1:1)*2.8; coins.push(Math.random()<.5?{x:s,z:a+l,t:0}:{x:a+l,z:s,t:0}); }
// ---- estacoes de recarga ----
const ST=[[-240,-80],[240,-80],[-80,240],[80,-240],[-240,160],[160,160],[0,0],[320,80]].map(a=>[a[0]+11,a[1]+11]);
for(const s of ST){ const g=new THREE.Group(); const m=new THREE.MeshBasicMaterial({color:0x3dff9a,transparent:true,opacity:.2,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide});
  const r=new THREE.Mesh(new THREE.TorusGeometry(2.2,.12,8,32),new THREE.MeshBasicMaterial({color:0x3dff9a})); r.rotation.x=Math.PI/2; r.position.y=.25; g.add(r);
  const b=new THREE.Mesh(new THREE.CylinderGeometry(2.2,2.2,14,20,1,true),m); b.position.y=7; g.add(b); g.position.set(s[0],0,s[1]); scene.add(g); }
// ---- rampas ----
const qp=(L,H,n)=>{ const a=[]; for(let i=0;i<=n;i++){ const t=i/n; a.push([-L/2+L*t,H*(1-Math.cos(t*Math.PI/2))]); } return a; };
const RP=[], addRamp=(x,z,ry,w,pf,b,col)=>{ RP.push({x,z,ry,w,pf,b,c:Math.cos(ry),s:Math.sin(ry)});
  const sh=new THREE.Shape(); sh.moveTo(pf[0][0],0); for(const q of pf) sh.lineTo(q[0],q[1]); sh.lineTo(pf[pf.length-1][0],0); sh.closePath();
  const gm=new THREE.ExtrudeGeometry(sh,{depth:w,bevelEnabled:false}); gm.translate(0,0,-w/2);
  const m=new THREE.Mesh(gm,new THREE.MeshStandardMaterial({color:col||0xe0822a,roughness:.7,side:THREE.DoubleSide,emissive:0x1a1208,emissiveIntensity:.4})); m.position.set(x,b,z); m.rotation.y=ry; m.castShadow=true; scene.add(m); };
[[-200,0],[120,-80],[-120,80],[200,160],[0,-240]].forEach(q=>addRamp(q[0],q[1],0,6.4,[[-3.1,0],[3.1,1.2]],0));
{ const X=200, Z=-200, B=G, cc=0xb9b6ae, KS=[[-3,0],[3,1.4]];
  addRamp(X-18,Z,Math.PI,14,qp(6,2.4,6),B,cc); addRamp(X+18,Z,0,14,qp(6,2.4,6),B,cc); addRamp(X,Z,0,8,[[-4,0],[-2,.9],[2,.9],[4,0]],B,cc);
  addRamp(X,Z+16,Math.PI/2,6,KS,B); addRamp(X,Z-16,-Math.PI/2,6,KS,B); addRamp(X-18,Z+19,Math.PI/2,6,qp(5,1.6,5),B,cc); addRamp(X+18,Z-19,-Math.PI/2,6,qp(5,1.6,5),B,cc); }
// ---- corrida ----
const RT=[[-240,-240],[0,-240],[240,-240],[240,0],[240,240],[0,240],[-240,240],[-240,0],[-80,0]]; let rc=-1, rt=0;
const cp=new THREE.Group(), ring=new THREE.Mesh(new THREE.TorusGeometry(5,.35,8,32),new THREE.MeshBasicMaterial({color:0xffd23f})); ring.position.y=5; cp.add(ring);
const beam=new THREE.Mesh(new THREE.CylinderGeometry(1.2,1.2,45,12,1,true),new THREE.MeshBasicMaterial({color:0xffd23f,transparent:true,opacity:.22,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide})); beam.position.y=22; cp.add(beam); cp.visible=false; scene.add(cp);
const place=()=>cp.position.set(RT[rc][0],0,RT[rc][1]);
o.race=()=>{ if(rc>=0){ rc=-1; cp.visible=false; hint("CORRIDA CANCELADA"); return; } rc=0; rt=0; cp.visible=true; place(); hint("CORRIDA: "+RT.length+" CHECKPOINTS"); SFX.sfx("start"); };
// ---- chuva ----
const ND=500, rp=new Float32Array(ND*6), rd=[]; for(let i=0;i<ND;i++) rd.push([(Math.random()-.5)*50,Math.random()*22,(Math.random()-.5)*50]);
const rg=new THREE.BufferGeometry(); rg.setAttribute("position",new THREE.BufferAttribute(rp,3));
const rl=new THREE.LineSegments(rg,new THREE.LineBasicMaterial({color:0xbcd4e8,transparent:true,opacity:0})); rl.frustumCulled=false; rl.visible=false; scene.add(rl);
let rT=0; o.toggleRain=()=>{ rT=rT?0:1; hint(rT?"CHUVA: PISTA ESCORREGADIA":"A CHUVA PAROU"); };
const GR=new THREE.Color(0x76828e), GL=GR.clone().convertSRGBToLinear();
o.env=()=>{ const r=o.rain; if(r<.004) return; sun.intensity*=1-.55*r; hemi.intensity*=1-.2*r; skyMat.uniforms.top.value.lerp(GR,r*.7); skyMat.uniforms.bot.value.lerp(GR,r*.7); scene.fog.color.lerp(GL,r*.7); for(const m of [asphaltMat,roadHMat,roadVMat]) m.roughness=.92-.6*r; };
// ---- conquistas ----
const AC=[["beach","Chegou na praia","Alcance a praia",()=>P.x>400],["swim","Mergulho","Entre no mar",()=>P.x>512],["spd","Velocista","Passe de 70 km/h",()=>o.km>=70],["horn","Buzinaço","Buzine 50 vezes",()=>S.st.horn>=50],["coin","Colecionador","Colete 100 moedas",()=>S.st.coins>=100],["race","Piloto","Termine uma corrida",()=>S.st.races>=1],["jump","Voando","Faça um salto",()=>S.st.jumps>=1],["combo","Mestre das manobras","Combo de 1000 pontos",()=>o.maxCombo>=1000],["rain","Debaixo d'água","Ande 60 s na chuva",()=>S.st.rain>=60]];
// ---- manobras ----
let combo=0, idle=0, chg=false, aT=0, svT=0, wT=0, lastIdx=stateIdx, dtm=0; const DUR=[70,35,60,35]; o.auto=()=>S.auto;
const addCombo=n=>{ combo+=n; idle=0; o.maxCombo=Math.max(o.maxCombo,combo); };
const launch=v=>{ o.air=true; o.ramp=false; o.pitch=0; o.vy=v; o.spin=0; o.flip=0; o.airT=0; S.st.jumps++; SFX.sfx("jump"); };
o.jump=()=>{ if(!o.air&&!o.ramp&&P.y<.5) launch(5.4+Math.min(Math.abs(P.v),14)*.1); };
function rampH(){ let best=null; for(const r of RP){ const dx=P.x-r.x, dz=P.z-r.z; if(dx*dx+dz*dz>150) continue; const u=dx*r.c-dz*r.s, v=dx*r.s+dz*r.c, pf=r.pf; if(Math.abs(v)>r.w/2||u<pf[0][0]||u>pf[pf.length-1][0]) continue;
    let k=0; while(k<pf.length-2&&u>pf[k+1][0]) k++; const a=pf[k], c=pf[k+1], sl=(c[1]-a[1])/(c[0]-a[0]), h=r.b+a[1]+(u-a[0])*sl; if(!best||h>best.h) best={h,sl,au:-Math.sin(P.h)*r.c+Math.cos(P.h)*r.s}; } return best; }
o.onReset=()=>{ o.pitch=0; o.air=false; o.ramp=false; o.spin=0; o.flip=0; combo=0; rc=-1; cp.visible=false; };
o.tick=(dt,t)=>{
  body.rotation.y=o.spin; body.rotation.x+=o.flip+(o.pitch||0);
  if(!dt) return;
  if(stateIdx!==lastIdx){ lastIdx=stateIdx; dtm=0; E("modeLabel").textContent=STATES[stateIdx].name; }
  if(S.auto){ dtm+=dt; if(dtm>DUR[stateIdx]) stateIdx=(stateIdx+1)%STATES.length; }
  o.km=Math.abs(P.v)*3.6;
  // bateria
  const bo=keys.shift&&P.v>5&&o.bat>0; o.bat=bo?Math.max(0,o.bat-dt*9):Math.min(cap(),o.bat+dt*.5);
  let near=false; for(const s of ST){ if(Math.hypot(P.x-s[0],P.z-s[1])<5&&Math.abs(P.v)<10&&o.bat<cap()){ o.bat=Math.min(cap(),o.bat+dt*38); near=true; } }
  if(near&&!chg) toast("⚡ CARREGANDO"); chg=near;
  // moedas
  for(let i=0;i<NC;i++){ const c=coins[i];
    if(c.t>0){ c.t-=dt; D.position.set(c.x,-50,c.z); }
    else { if(Math.abs(c.x-P.x)<1.7&&Math.abs(c.z-P.z)<1.7&&P.y<2.4){ c.t=40; S.coins++; S.st.coins++; SFX.sfx("coin"); } D.position.set(c.x,1.1+Math.sin(t*3+i)*.12,c.z); }
    D.rotation.y=t*3+i; D.updateMatrix(); cm.setMatrixAt(i,D.matrix); }
  cm.instanceMatrix.needsUpdate=true;
  // rampas / salto
  const rh=rampH(); let onR=null; if(!o.air&&rh&&(o.ramp||Math.abs(rh.h-P.y)<.5)) onR=rh;
  if(!o.air){
    if(onR){ const up=onR.sl*onR.au*Math.sign(P.v||1); o.ramp=true; P.y=onR.h; o.pitch=Math.atan(up); if(up>0) P.v-=Math.sign(P.v)*up*5*dt; }
    else if(o.ramp){ o.ramp=false; o.pitch=0; if(Math.abs(P.v)>5&&P.y-(inRoad(P.x,P.z)?0:G)>.7) launch(clamp(Math.abs(P.v)*.42,3.5,9)); }
  } else o.pitch=0;
  if(o.air){
    o.airT+=dt; o.vy-=20*dt; P.y+=o.vy*dt; o.spin+=P.steer*dt*7; o.flip+=(((keys.w||keys.arrowup)?1:0)-((keys.s||keys.arrowdown)?1:0))*dt*6;
    const ty=Math.max(inRoad(P.x,P.z)?0:G,rh?rh.h:-9);
    if(P.y<=ty&&o.vy<0){ o.air=false; P.y=ty;
      const ns=Math.round(Math.abs(o.spin)/6.283), nf=Math.round(Math.abs(o.flip)/6.283), es=Math.abs(Math.abs(o.spin)-ns*6.283), ef=Math.abs(Math.abs(o.flip)-nf*6.283);
      if(es>1.1||ef>.9){ P.v*=.35; P.shake=.8; combo=0; hint("TOMBO!"); } else if(ns+nf>0||o.airT>.9){ addCombo(150+ns*250+nf*300+Math.round(o.airT*100)); hint(ns+nf?"MANOBRA x"+(ns+nf):"SALTO!"); }
      SFX.sfx("land",.6);
      o.spin=0; o.flip=0; }
  }
  player.position.y=P.y;
  if(Math.abs(P.steer)>.6&&Math.abs(P.v)>8&&!o.air) addCombo(dt*60*(1+o.rain)); else idle+=dt;
  if(idle>2&&combo>0&&!o.air){ const g=Math.floor(combo/50); if(g>0){ S.coins+=g; toast("COMBO "+Math.round(combo)+"  +"+g+" 🪙"); } combo=0; }
  if(P.x>392&&P.x<510) P.v*=Math.exp(-.3*dt);
  // corrida
  if(rc>=0){ rt+=dt; ring.rotation.y+=dt*1.5; const q=RT[rc];
    if(Math.hypot(P.x-q[0],P.z-q[1])<8){ SFX.sfx("toggle"); rc++;
      if(rc>=RT.length){ rc=-1; cp.visible=false; S.st.races++; const nb=!S.best||rt<S.best, rew=40+(nb?30:0); if(nb) S.best=rt; S.coins+=rew; toast("🏁 FIM "+rt.toFixed(1)+"s"+(nb?" (RECORDE!)":"")+"  +"+rew+" 🪙"); save(); }
      else { place(); hint("CHECKPOINT "+rc+"/"+RT.length); } } }
  // chuva
  o.rain+=(rT-o.rain)*(1-Math.exp(-dt*.6)); wT+=dt; if(wT>100){ wT=0; if(Math.random()<.3) o.toggleRain(); }
  if(o.rain>.5) S.st.rain+=dt;
  for(let i=0;i<ND;i++){ const d=rd[i]; d[1]-=30*dt; if(d[1]<0) d[1]+=22; const x=P.x+d[0], z=P.z+d[2]; rp.set([x,d[1],z,x-.05,d[1]+.7,z],i*6); }
  rg.attributes.position.needsUpdate=true; rl.material.opacity=.4*o.rain; rl.visible=o.rain>.02;
  // conquistas
  aT+=dt; if(aT>.5){ aT=0; for(const a of AC){ if(!S.ach[a[0]]&&a[3]()){ S.ach[a[0]]=1; S.coins+=25; toast("🏆 "+a[1]+"  +25 🪙"); SFX.sfx("start"); save(); } } }
  svT+=dt; if(svT>5){ svT=0; save(); }
  // HUD
  xC.textContent="🪙 "+S.coins; xB.style.width=(o.bat/cap()*100)+"%"; xBT.textContent="BATERIA "+Math.round(o.bat)+"%"+(o.bat<=0?" · SEM TURBO":"");
  xCo.textContent=combo>0?"COMBO "+Math.round(combo):""; xR.textContent=rc>=0?"🏁 "+(rc+1)+"/"+RT.length+"  "+rt.toFixed(1)+"s"+(S.best?"  · REC "+S.best.toFixed(1)+"s":""):"";
};
o.mini=c=>{ const f=(x,z,r,col)=>{ const dx=x-P.x, dz=z-P.z; if(dx*dx+dz*dz>25000) return; c.fillStyle=col; c.beginPath(); c.arc(dx,dz,r,0,6.283); c.fill(); };
  for(const k of coins) if(k.t<=0) f(k.x,k.z,2,"#ffd23f"); for(const s of ST) f(s[0],s[1],4.5,"#3dff9a"); for(const r of RP) f(r.x,r.z,3.5,"#ff8a2a"); if(rc>=0) f(RT[rc][0],RT[rc][1],7,"#fff"); };
// ---- menu: garagem e conquistas ----
o.initUI=()=>{
  const box=document.querySelector(".menuBox"), main=E("menuMain");
  const mk=(id,txt)=>{ const b=document.createElement("button"); b.className="btn"; b.id=id; b.textContent=txt; return b; };
  const pn=id=>{ const d=document.createElement("div"); d.id=id; d.className="panel"; box.appendChild(d); return d; };
  const pg=pn("panelGar"), pa=pn("panelAch"), bG=mk("btnGar","GARAGEM"), bA=mk("btnAch","CONQUISTAS");
  main.insertBefore(bG,E("btnOpts")); main.insertBefore(bA,E("btnOpts"));
  const names=["Motor (velocidade e aceleração)","Bateria (capacidade)","Freios","Pneus (aderência)"], base=[60,50,40,50];
  function drawG(){
    let h='<h2>GARAGEM</h2><div class="list"><p><b>🪙 '+S.coins+'</b> moedas</p></div>';
    names.forEach((n,i)=>{ const l=S.up[i]; h+='<div class="row">'+n+' · nv '+l+'/5<button class="btn sm upg" data-i="'+i+'">'+(l>=5?"MAX":"🪙 "+base[i]*(l+1))+'</button></div>'; });
    h+='<div class="row">Neon'+NEON.map((c,i)=>'<button class="btn sm nn" data-n="'+i+'" style="background:#'+c.toString(16).padStart(6,"0")+';color:#000">'+(S.own[i]?(S.neon===i?"✔":"●"):"🪙100")+'</button>').join("")+'</div><button class="btn bk">VOLTAR</button>';
    pg.innerHTML=h;
    pg.querySelectorAll(".upg").forEach(b=>b.onclick=()=>{ const i=+b.dataset.i, l=S.up[i], c=base[i]*(l+1); if(l<5&&S.coins>=c){ S.coins-=c; S.up[i]++; recalc(); save(); SFX.sfx("toggle"); drawG(); } });
    pg.querySelectorAll(".nn").forEach(b=>b.onclick=()=>{ const i=+b.dataset.n; if(!S.own[i]){ if(S.coins<100) return; S.coins-=100; S.own[i]=1; } S.neon=i; recalc(); save(); SFX.sfx("toggle"); drawG(); });
    pg.querySelector(".bk").onclick=()=>{ save(); showPanel("menuMain"); };
  }
  bG.onclick=()=>{ drawG(); showPanel("panelGar"); };
  bA.onclick=()=>{ let h='<h2>CONQUISTAS</h2><div class="list">'; for(const a of AC) h+='<p>'+(S.ach[a[0]]?"✅":"⬜")+' <b>'+a[1]+'</b> — '+a[2]+'</p>'; h+='<p>Recorde da corrida: '+(S.best?S.best.toFixed(1)+"s":"—")+'</p></div><button class="btn bk">VOLTAR</button>'; pa.innerHTML=h; pa.querySelector(".bk").onclick=()=>showPanel("menuMain"); showPanel("panelAch"); };
  const tb=E("tTop"); for(const [id,txt,fn] of [["tRace","🏁",()=>o.race()],["tRain","☂",()=>o.toggleRain()]]){ const b=document.createElement("button"); b.id=id; b.textContent=txt; b.addEventListener("pointerdown",e=>{ fn(); e.preventDefault(); }); tb.appendChild(b); }
  { const po=E("panelOpts"), row=document.createElement("label"); row.className="row chk"; row.innerHTML='Ciclo dia/noite automático <input id="optAuto" type="checkbox">'; po.insertBefore(row,po.querySelector(".back")); const ck=row.querySelector("input"); ck.checked=!!S.auto; ck.onchange=()=>{ S.auto=ck.checked; save(); }; }
  { const jb=document.createElement("button"); jb.id="tJump"; jb.className="rb"; jb.textContent="PULAR"; jb.addEventListener("pointerdown",e=>{ jb.classList.add("down"); o.jump(); e.preventDefault(); }); for(const ev of ["pointerup","pointercancel"]) jb.addEventListener(ev,()=>jb.classList.remove("down")); E("tBtns").appendChild(jb); }
};
return o;
})();

/* ===================== CAMERA ===================== */
const camTarget=new THREE.Vector3(), camPos=new THREE.Vector3();
function blocked(x,y,z){
  const arr=colHash.get(hkey(Math.floor(x/16),Math.floor(z/16))); if(!arr) return false;
  for(const c of arr){ if(c.t!==0) continue; if(y<c.ht&&Math.abs(x-c.x)<c.hw+.4&&Math.abs(z-c.z)<c.hd+.4) return true; }
  return false;
}
function updateCamera(dt){
  const now=performance.now()/1000;
  if(!dragging&&now-lastDrag>2.2){ userYaw*=Math.exp(-dt*2.2); userPitch*=Math.exp(-dt*2.2); }
  camH+=(((P.h-camH+Math.PI)%(Math.PI*2)+Math.PI*2)%(Math.PI*2)-Math.PI)*(1-Math.exp(-dt*5));
  const ang=camH+userYaw, pitch=.3+userPitch;
  camTarget.set(P.x,P.y+1.45,P.z);
  const d=camDist*(1+clamp(Math.abs(P.v)/40,0,.25));
  const ox=Math.sin(ang)*Math.cos(pitch)*d, oy=Math.sin(pitch)*d+.4, oz=Math.cos(ang)*Math.cos(pitch)*d;
  let t=1;
  for(let k=10;k>=1;k--){ const u=k/10; if(!blocked(camTarget.x+ox*u,camTarget.y+oy*u,camTarget.z+oz*u)){ t=u; break; } if(k===1) t=.1; }
  const sh=P.shake*.12;
  camPos.set(camTarget.x+ox*t+(Math.random()-.5)*sh,Math.max(.6,camTarget.y+oy*t)+(Math.random()-.5)*sh,camTarget.z+oz*t+(Math.random()-.5)*sh);
  camera.position.copy(camPos); camera.lookAt(camTarget.x,camTarget.y+.1,camTarget.z);
  const fov=56+clamp(Math.abs(P.v),0,22)*.55; if(Math.abs(camera.fov-fov)>.05){ camera.fov=lerp(camera.fov,fov,.1); camera.updateProjectionMatrix(); }
}

/* ===================== MINIMAPA ===================== */
const miniCv=document.getElementById("mini"), mctx=miniCv.getContext("2d");
const MK=Math.min(2,window.devicePixelRatio||1); miniCv.width=miniCv.height=Math.round(176*MK);
const mapSt=document.createElement("canvas"); mapSt.width=1200; mapSt.height=800; {
  const c=mapSt.getContext("2d"); c.fillStyle="#102018"; c.fillRect(0,0,1200,800);
  c.fillStyle="#3b4048"; for(const a of lines){ c.fillRect(a+400-8,0,16,800); c.fillRect(0,a+400-8,800,16); }
  c.fillStyle="#3b4048";
  const col={skate:"#8a8fa0",park:"#3f8a46",down:"#6f7c8c",mid:"#9a7a64",house:"#b8b09a"};
  for(const b of minimapBlocks){ c.fillStyle=col[b[2]]; c.fillRect(b[0]+400-28,b[1]+400-28,56,56); }
  c.fillStyle="#d9c48f"; c.fillRect(776,0,136,800); c.fillStyle="#8a6a3f"; c.fillRect(776,0,16,800); c.fillStyle="#2a78a8"; c.fillRect(912,0,288,800); c.fillStyle="#3b4048"; for(const z of [-80,0,80]) c.fillRect(712,z+392,64,16);
  c.strokeStyle="#e3b724"; c.lineWidth=1; for(const a of lines){ c.beginPath(); c.moveTo(a+400,0); c.lineTo(a+400,800); c.moveTo(0,a+400); c.lineTo(800,a+400); c.stroke(); }
}
function drawMini(){
  const W_=176, H_=176; mctx.setTransform(MK,0,0,MK,0,0); mctx.clearRect(0,0,W_,H_); mctx.save(); mctx.translate(W_/2,H_/2); mctx.rotate(P.h); mctx.scale(.62,.62);
  mctx.drawImage(mapSt,-(P.x+400),-(P.z+400));
  mctx.fillStyle="#ff5d6c"; for(const c of cars){ const p=carPos(c); mctx.fillRect(p[0]-P.x-2,p[1]-P.z-2,4,4); }
  F2.mini(mctx);
  mctx.restore();
  mctx.fillStyle="#36f1d0"; mctx.beginPath(); mctx.moveTo(W_/2,H_/2-9); mctx.lineTo(W_/2+6,H_/2+7); mctx.lineTo(W_/2,H_/2+3); mctx.lineTo(W_/2-6,H_/2+7); mctx.closePath(); mctx.fill();
  mctx.strokeStyle="rgba(255,255,255,.35)"; mctx.beginPath(); mctx.arc(W_/2,H_/2,W_/2-1,0,6.283); mctx.stroke();
}

/* ===================== LOOP ===================== */
setStateInstant(0); applyEnv();
const speedEl=document.getElementById("speed"), barEl=document.getElementById("bar");
window.addEventListener("resize",()=>{ camera.aspect=window.innerWidth/Math.max(1,window.innerHeight); camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth,window.innerHeight); });
let prev=performance.now(), first=true, frame=0, fpsAcc=0, fpsN=0, curPR=renderer.getPixelRatio();
/* ===================== ESTADO / MENU / OPCOES ===================== */
const QF={far:1,pr:1};
const DPR=window.devicePixelRatio||1;
const QS={low:{pr:isMobile?Math.min(DPR,1):.75,shadow:false,far:.6},med:{pr:isMobile?Math.min(DPR,1.75):1,shadow:true,far:.85},high:{pr:isMobile?Math.min(DPR,2.5):1.5,shadow:true,far:1}};
const OPT=Object.assign({music:.5,sfx:.8,quality:isMobile?"med":"high",time:0,mini:true,vib:true,hints:true},(()=>{ try{ return JSON.parse(localStorage.getItem("volt_opts")||"{}"); }catch(e){ return {}; } })());
const saveOpt=()=>{ try{ localStorage.setItem("volt_opts",JSON.stringify(OPT)); }catch(e){} };
const $=id=>document.getElementById(id);
let gameState="menu", tw=0, lastShake=0, wasWater=false, wasBoost=false, modelsOk=!!window.__modelsReady;
function vib(ms){ if(OPT.vib&&navigator.vibrate){ try{ navigator.vibrate(ms); }catch(e){} } }
function setQuality(q){ const Q=QS[q]||QS.med; OPT.quality=q; QF.far=Q.far; QF.pr=Q.pr; curPR=Q.pr; renderer.setPixelRatio(curPR); renderer.setSize(window.innerWidth,window.innerHeight); sun.castShadow=Q.shadow; }
function setTime(i){ stateIdx=i; setStateInstant(i); $("modeLabel").textContent=STATES[i].name; OPT.time=i; }
function showPanel(id){ for(const p of document.querySelectorAll("#menu .panel")) p.classList.toggle("active",p.id===id); }
function setState(s){
  gameState=s; document.body.className=s+(OPT.mini?"":" no-mini")+(isTouch?" touch":"");
  $("menu").classList.toggle("on",s!=="play"); showPanel("menuMain");
  $("btnPlay").hidden=s!=="menu"; $("btnResume").hidden=s!=="pause"; $("btnRestart").hidden=s!=="pause"; $("btnToMenu").hidden=s!=="pause";
  $("menuSub").textContent=s==="pause"?"JOGO PAUSADO":"SIMULADOR DE PATINETE ELÉTRICO";
}
function goFull(){ try{ const e=document.documentElement; (e.requestFullscreen||e.webkitRequestFullscreen||function(){}).call(e); if(screen.orientation&&screen.orientation.lock) screen.orientation.lock("landscape").catch(()=>{}); }catch(e){} }
function toggleFull(){ if(document.fullscreenElement||document.webkitFullscreenElement){ (document.exitFullscreen||document.webkitExitFullscreen).call(document); } else goFull(); }
function actPlay(){ if(!modelsOk) return; SFX.init(); SFX.setVol("music",OPT.music); SFX.setVol("sfx",OPT.sfx); SFX.sfx("start"); resetPlayer(); setState("play"); if(isTouch) goFull(); if(OPT.hints) hint(isTouch?"JOYSTICK PARA DIRIGIR":"W A S D PARA DIRIGIR"); }
function actPause(){ if(gameState==="play"){ setState("pause"); SFX.sfx("pause"); SFX.horn(false); keys.shift=false; keys[" "]=false; } else if(gameState==="pause"){ setState("play"); SFX.sfx("resume"); } }
function actNight(){ stateIdx=(stateIdx+1)%STATES.length; hint(STATES[stateIdx].name); $("modeLabel").textContent=STATES[stateIdx].name; SFX.sfx("toggle"); }
function actCam(){ camMode=(camMode+1)%camDists.length; camDist=camDists[camMode]; hint(["CAMERA NORMAL","CAMERA PERTO","CAMERA LONGE"][camMode]); SFX.sfx("cam"); }
function actReset(){ resetPlayer(); SFX.sfx("reset"); }
function actMute(){ const v=!SFX.isMuted(); SFX.setMuted(v); $("bSound").textContent=v?"🔇":"🔊"; hint(v?"SOM DESLIGADO":"SOM LIGADO"); }
function menuCamera(t){ const a=t*.13, r=7.2; camera.position.set(P.x+Math.sin(a)*r,P.y+2.3+Math.sin(t*.2)*.4,P.z+Math.cos(a)*r); camera.lookAt(P.x,P.y+1,P.z); if(Math.abs(camera.fov-50)>.1){ camera.fov=50; camera.updateProjectionMatrix(); } }
// botoes do menu
$("btnPlay").onclick=actPlay; $("btnResume").onclick=actPause; $("btnRestart").onclick=()=>{ resetPlayer(); actPause(); };
$("btnToMenu").onclick=()=>{ resetPlayer(); SFX.horn(false); setState("menu"); };
$("btnOpts").onclick=()=>showPanel("panelOpts"); $("btnCtrl").onclick=()=>showPanel("panelCtrl"); $("btnCred").onclick=()=>showPanel("panelCred");
for(const b of document.querySelectorAll("#menu .back")) b.onclick=()=>{ saveOpt(); showPanel("menuMain"); };
for(const b of document.querySelectorAll("#menu .btn")){ b.addEventListener("click",()=>SFX.sfx(b.classList.contains("back")?"back":"click")); b.addEventListener("pointerenter",()=>{ if(!isTouch) SFX.sfx("hover"); }); }
$("bPause").onclick=actPause; $("bSound").onclick=actMute; $("bFull").onclick=toggleFull;
// opcoes
$("optMusic").value=OPT.music*100; $("optSfx").value=OPT.sfx*100; $("optQual").value=OPT.quality; $("optTime").value=OPT.time; $("optMini").checked=OPT.mini; $("optVib").checked=OPT.vib; $("optHints").checked=OPT.hints;
$("optMusic").oninput=e=>{ OPT.music=e.target.value/100; SFX.setVol("music",OPT.music); };
$("optSfx").oninput=e=>{ OPT.sfx=e.target.value/100; SFX.setVol("sfx",OPT.sfx); };
$("optSfx").onchange=()=>SFX.sfx("click");
$("optQual").onchange=e=>{ setQuality(e.target.value); saveOpt(); };
$("optTime").onchange=e=>{ setTime(+e.target.value); saveOpt(); };
$("optMini").onchange=e=>{ OPT.mini=e.target.checked; document.body.classList.toggle("no-mini",!OPT.mini); saveOpt(); };
$("optVib").onchange=e=>{ OPT.vib=e.target.checked; saveOpt(); if(OPT.vib) vib(40); };
$("optHints").onchange=e=>{ OPT.hints=e.target.checked; saveOpt(); };
if(!isTouch) for(const el of document.querySelectorAll(".onlyTouch")) el.style.display="none";
if(isTouch) $("touch").classList.add("on");
$("rotate").onclick=()=>$("rotate").remove();
// carregamento dos modelos
function modelsReady(){ modelsOk=true; const b=$("btnPlay"); b.disabled=false; b.textContent="JOGAR"; }
if(modelsOk) modelsReady(); else window.addEventListener("modelsready",modelsReady);
setTimeout(()=>{ if(!modelsOk) modelsReady(); },25000);
setQuality(OPT.quality); setTime(OPT.time); setState("menu"); F2.initUI();

function animate(now){
  requestAnimationFrame(animate);
  const dt=Math.min((now-prev)/1000,.05); prev=now; const t=now/1000; frame++;
  blendState(dt); applyEnv(); F2.env();
  const pl=gameState==="play", wdt=gameState==="pause"?0:dt; tw+=wdt;
  updatePlayer(pl?dt:0); updateTraffic(wdt); updatePeds(wdt,tw); updateJets(t); beachUpd(t);
  if(gameState==="menu") menuCamera(t); else updateCamera(pl?dt:0);
  beaconMat.emissiveIntensity=(Math.sin(t*3)>.2?2.4:.15);
  tailMat.emissiveIntensity=cur.night*1.6+.5; headMat.emissiveIntensity=.3+cur.night*2.2;
  sc.headlightMat.emissiveIntensity=1.8+Math.sin(t*2.2)*.1+cur.night*.6;
  for(const c of clouds){ c.position.x+=dt*3; if(c.position.x>1100) c.position.x=-1100; }
  updateFx(pl?dt:0,t); F2.tick(pl?dt:0,t);
  if(P.shake>lastShake+.12){ SFX.sfx("thud",P.shake); vib(Math.round(40+P.shake*80)); } lastShake=P.shake;
  const inW=P.x>510; if(inW&&!wasWater&&Math.abs(P.v)>2) SFX.sfx("splash"); wasWater=inW;
  if(keys.shift&&!wasBoost&&Math.abs(P.v)>5&&pl) SFX.sfx("boost"); wasBoost=!!keys.shift;
  { const fw=keys["w"]||keys["arrowup"]||touch.up, bk=keys["s"]||keys["arrowdown"]||touch.down; const px=P.x;
    SFX.update(dt,{st:gameState,P,night:cur.night,f:!!fw,boost:!!keys.shift,brk:!!((bk||keys[" "])&&P.v>4),steer:P.steer,surf:px>510?"water":px>392?"sand":px>376?"wood":(inRoad(P.x,P.z)?"road":"walk"),t,cars,carPos,rain:F2.rain}); }
  for(const f of FARM){ const dd=f.d*QF.far; f.m.visible=(f.x-P.x)*(f.x-P.x)+(f.z-P.z)*(f.z-P.z)<dd*dd; }
  for(const c of cars){ const pp=carPos(c); c.g.visible=Math.abs(pp[0]-P.x)<190*QF.far&&Math.abs(pp[1]-P.z)<190*QF.far; }
  for(const p of peds){ p.g.visible=Math.abs(p.g.position.x-P.x)<130*QF.far&&Math.abs(p.g.position.z-P.z)<130*QF.far; }
  fpsAcc+=dt; fpsN++; if(fpsAcc>2.5){ const fps=fpsN/fpsAcc; fpsAcc=0; fpsN=0; if(fps<42&&gameState==="play"&&curPR>QF.pr*.6){ curPR=Math.max(QF.pr*.6,curPR-.15); renderer.setPixelRatio(curPR); renderer.setSize(window.innerWidth,window.innerHeight); } else if(fps>57&&gameState==="play"&&curPR<QF.pr-.01){ curPR=Math.min(QF.pr,curPR+.1); renderer.setPixelRatio(curPR); renderer.setSize(window.innerWidth,window.innerHeight); } }
  sky.position.copy(camera.position); stars.position.copy(camera.position); 
  for(const c of clouds){ /* nuvens ficam relativas ao mundo */ }
  sun.position.set(P.x+cur.dir.x*140,cur.dir.y*140+P.y,P.z+cur.dir.z*140); sun.target.position.set(P.x,0,P.z);
  sun.shadow.camera.updateProjectionMatrix();
  speedEl.textContent=Math.round(Math.abs(P.v)*3.6); barEl.style.width=clamp(Math.abs(P.v)/21*100,0,100)+"%";
  if(frame%2===0) drawMini();
  renderer.render(scene,camera);
  if(first){ first=false; loadingScreen.classList.add("hidden"); setTimeout(()=>{ if(loadingScreen.isConnected) loadingScreen.remove(); },500); }
}
requestAnimationFrame(animate);
}

window.addEventListener("error",e=>{ console.error("Erro:",e.error||e.message); if(loadingScreen.isConnected&&!loadingScreen.classList.contains("hidden")) showError("ERRO: "+(e.message||"veja F12 > Console")); });
startApp();