import * as THREE from 'three';
import Stats from 'three/examples/jsm/libs/stats.module';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { BufferGeometry, Points, PointsMaterial, MathUtils } from 'three';
import { mergeBufferGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { SimplifyModifier } from 'three/examples/jsm/modifiers/SimplifyModifier';

import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { degToRad } from 'three/src/math/MathUtils';

gsap.registerPlugin(ScrollTrigger);

export default class Demo {
	private renderer!: THREE.WebGLRenderer;
	private scene!: THREE.Scene;
	private camera!: THREE.PerspectiveCamera;
	private lightPoint!: THREE.PointLight;
	private controls!: OrbitControls;
	private stats!: any;
	private brainMesh!: Points;
	private bulbMesh!: Points;
	private loader!: GLTFLoader;
	private pointsMaterial!: PointsMaterial;
	private modifier!: SimplifyModifier;
	private globeMesh!:Points;
	

	constructor() {
		this.loader = new GLTFLoader();
		this.modifier = new SimplifyModifier();
		this.pointsMaterial = new PointsMaterial({ color: "#fff", size: .012 });
		this.initScene();
		this.initStats();
		this.initListeners();

	}

	initStats() {
		this.stats = new (Stats as any)();
		document.body.appendChild(this.stats.dom);
	}

	loadModel(url: string): Promise<Points> {

		return new Promise((resolve) => {
			this.loader.load(url, (model: GLTF) => {
				let geoms: BufferGeometry[] = []

				model.scene.traverse((child) => {

					if (child.type === "Mesh" || child.type === "Points") {
						geoms.push((child as any).geometry);
					}
				})

				let geom = mergeBufferGeometries(geoms);
			
				let mesh = new Points(geom, this.pointsMaterial);
				resolve(mesh);
			});
		})
	}

	async initScene() {
		this.scene = new THREE.Scene();
		this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 100);
		this.camera.position.z = 5;
		this.renderer = new THREE.WebGLRenderer({
			canvas: document.getElementById("canvas")!
		});
		this.renderer.shadowMap.enabled = true;
		this.renderer.domElement.classList.add("canvas")
		this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
		this.renderer.setPixelRatio(window.devicePixelRatio);
		this.renderer.setSize(window.innerWidth, window.innerHeight);

		document.body.appendChild(this.renderer.domElement);

		const ambientLight = new THREE.AmbientLight(0xffffff, 4);
		this.scene.add(ambientLight);

		const pointLight = new THREE.PointLight(0xffffff, 1);
		this.camera.add(pointLight);
		this.scene.add(this.camera);

		const shadowIntensity = 0.50;

		this.lightPoint = new THREE.PointLight(0xffffff);
		this.lightPoint.position.set(-0.5, 0.5, 95);
		this.lightPoint.castShadow = true;
		this.lightPoint.intensity = shadowIntensity;
		this.scene.add(this.lightPoint);

		const lightPoint2 = this.lightPoint.clone();
		lightPoint2.intensity = 1 - shadowIntensity;
		lightPoint2.castShadow = false;
		this.scene.add(lightPoint2);

		const mapSize = 512; // Default 512
		const cameraNear = 0.5; // Default 0.5
		const cameraFar = 500; // Default 500
		this.lightPoint.shadow.mapSize.width = mapSize;
		this.lightPoint.shadow.mapSize.height = mapSize;
		this.lightPoint.shadow.camera.near = cameraNear;
		this.lightPoint.shadow.camera.far = cameraFar;


		this.bulbMesh = await this.loadModel("models/light_bulb/scene.gltf");
		this.bulbMesh.position.set(0, 0, -150);
		this.bulbMesh.geometry.scale(2, 2, 2);
		this.bulbMesh.rotation.set(MathUtils.degToRad(-88), 0, 0);
		this.brainMesh = await this.loadModel("models/Camera_01_1k.gltf/Camera_01_1k.gltf");
		this.brainMesh.geometry.scale(15, 15, 15);
		this.brainMesh.position.set(0, 0, 3);
		this.brainMesh.geometry.attributes.position.needsUpdate = true;

		this.bulbMesh.geometry = this.modifier.modify(this.bulbMesh.geometry, (this.brainMesh.geometry.attributes.position.count - this.bulbMesh.geometry.attributes.position.count) * -1);

		this.scene.add(this.bulbMesh);

		this.renderer.render(this.scene, this.camera);
		ScrollTrigger.refresh();
		

		let globeGftl = await (await this.loader.loadAsync("models/oceanic_currents/scene.gltf")).scenes[0];
		
		// this.laptopMesh.geometry = this.modifier.modify(this.laptopMesh.geometry, (this.brainMesh.geometry.attributes.position.count - this.laptopMesh.geometry.attributes.position.count) * -1);
		let geoms: any[] = [];
		globeGftl.traverse((child:any)=>{
		
			if(child.isMesh || child.isPoints){
				
				geoms.push(child.geometry);
			}
		})
		
		let globeGeometry = mergeBufferGeometries([geoms[0]]);
		globeGeometry.attributes.position.needsUpdate = true;
		// globeGeometry = this.modifier.modify(globeGeometry,  (this.brainMesh.geometry.attributes.position.count - globeGeometry.attributes.position.count) * -1);
	
		this.globeMesh = new Points(globeGeometry, this.pointsMaterial);
		this.globeMesh.geometry.scale(2,2,2)
		this.globeMesh.geometry.rotateX(degToRad(-90));
		// console.log("globe")
		// this.scene.add(this.globeMesh);
		(document.querySelector(".loader") as any).style.display="none";
		this.morph(this.bulbMesh, this.brainMesh);
		this.animate();
		// this.controls = new OrbitControls(this.camera,this.renderer.domElement);
	}

	morph(mesh1: Points, mesh2: Points) {
		gsap.timeline({
			scrollTrigger: {
				trigger: "#canvas",
				scrub: 1.5,
				pin: true,
				end: "+=500%"
			}
		}).to(mesh1.position, {
			x: 0,
			y: 0,
			z: 0,
			onUpdate: () => {
				if (this.stats) this.stats.update();
				this.renderer.render(this.scene, this.camera);
			}
		})
			.to(mesh1.rotation, {
				x: MathUtils.degToRad(0),
				onUpdate: () => {
					mesh1.geometry.attributes.position.needsUpdate = true;
					this.render();
				}
			})
			.to(mesh1.geometry.attributes.position.array, {
				endArray: (mesh2.geometry.attributes.position.array) as any,
				onUpdate: () => {
					mesh1.geometry.attributes.position.needsUpdate = true;
					this.render();
				}
			})
			.to(mesh1.rotation, {
				y: degToRad(-360),
				onUpdate: () => {
					mesh1.geometry.attributes.position.needsUpdate = true;
					this.render();
				}
			})
			.to(mesh1.geometry.attributes.position.array,{
				endArray:this.globeMesh.geometry.attributes.position.array as any,
				onUpdate: () => {
					mesh1.geometry.attributes.position.needsUpdate = true;
					this.render();
				}
			})
			.to(mesh1.rotation,{
				
				y:degToRad(180),
				onUpdate: () => {
					mesh1.geometry.attributes.position.needsUpdate = true;
					this.render();
				}
			});
	}

	render() {
		if (this.stats) this.stats.update();
		if (this.controls) this.controls.update();
		this.renderer.render(this.scene, this.camera);
	}

	initListeners() {
		window.addEventListener('resize', this.onWindowResize.bind(this), false);
		window.addEventListener('keydown', (event) => {
			const { key } = event;
			switch (key) {
				case 'e':
					const win = window.open('', 'Canvas Image');
					const { domElement } = this.renderer;
					this.renderer.render(this.scene, this.camera);

					const src = domElement.toDataURL();

					if (!win) return;

					win.document.write(`<img src='${src}' width='${domElement.width}' height='${domElement.height}'>`);
					break;

				default:
					break;
			}
		});
	}

	onWindowResize() {
		this.camera.aspect = window.innerWidth / window.innerHeight;
		this.camera.updateProjectionMatrix();
		this.renderer.setSize(window.innerWidth, window.innerHeight);
	}

	animate() {
		requestAnimationFrame(() => {
			this.animate();
		});
		this.render();
	}
}
