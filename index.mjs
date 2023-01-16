import {
	AmbientLight,
	AxesHelper,
	Clock,
	Color,
	Fog,
	Mesh,
	MeshBasicMaterial,
	PCFSoftShadowMap,
	PerspectiveCamera,
	Raycaster,
	REVISION,
	Scene,
	SphereGeometry,
	Vector2,
	Vector3,
	WebGLRenderer,
} from 'three';

console.log('ThreeJs REVISION:', REVISION);

window.document.addEventListener('contextmenu', event => {
	event.preventDefault();
});

window.addEventListener('load', () => {
	const fogColor = new Color(getComputedStyle(document.querySelector('#scrim')).backgroundColor);
	const clock = new Clock(true);
	const mouse = new Vector2();
	let delta,
		cntr = 1;

	const scene = new Scene();
	const camera = new PerspectiveCamera(
		50,
		window.innerWidth / window.innerHeight,
		1,
		10
	);
	camera.position.x = 3;
	camera.position.z = 3;
	camera.position.y = 2;
	camera.lookAt(0, 0.2, 0);

	const renderer = new WebGLRenderer({
		antialias: false,
		powerPreference: 'low-power',
		precision: 'lowp'
	});

	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.shadowMap.type = PCFSoftShadowMap;
	renderer.autoClearColor = false;
	renderer.autoClearDepth = false;
	renderer.autoClearStencil = false;
	renderer.autoClear = false;
	//console.log('capabilities:', renderer.capabilities);
	const canvasElement = document.getElementById('scrim').appendChild(renderer.domElement);

	scene.add(new AmbientLight('rgb(200,200,180)', 0.9));

	scene.fog = new Fog(fogColor, 2, camera.far - 2);

	scene.add(new AxesHelper(2));


	const sphere = new Mesh(new SphereGeometry(1), new MeshBasicMaterial({color: 'rgb(200,155,155)'}));
	scene.add(sphere);

	const sphere1 = new Mesh(new SphereGeometry(0.2), new MeshBasicMaterial({color: 'rgb(0,255,255)', opacity: 0.9, transparent: true}));
	scene.add(sphere1);
	const sphere2 = new Mesh(new SphereGeometry(0.17), new MeshBasicMaterial({color: 'rgb(0,255,255)', opacity: 0.4, transparent: true}));
	scene.add(sphere2);
	const sphere3 = new Mesh(new SphereGeometry(0.13), new MeshBasicMaterial({color: 'rgb(0,255,255)', opacity: 0.15, transparent: true}));
	scene.add(sphere3);
	const sphere4 = new Mesh(new SphereGeometry(0.1), new MeshBasicMaterial({color: 'rgb(0,255,255)', opacity: 0.08, transparent: true}));
	scene.add(sphere4);

	const sphereMarker = new Mesh(new SphereGeometry(0.04), new MeshBasicMaterial({color: 'rgb(255,100,50)', opacity: 0.6, transparent: true}));
	sphereMarker.name = 'marker';
	scene.add(sphereMarker);

	const raycaster = new Raycaster();
	raycaster.near = camera.near;
	raycaster.far = camera.far;

	const onRayCast = () => {
		raycaster.setFromCamera(mouse, camera);
		const intersects = raycaster.intersectObject(sphere);
		if(intersects.length < 1) return;
		sphereMarker.position.copy(intersects[0].point);
	}

	canvasElement.addEventListener('mousemove', event => {
		event.preventDefault();
		mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
		mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

		onRayCast();
	});

	window.addEventListener('resize', () => {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize(window.innerWidth, window.innerHeight);
	});

	delta = clock.getDelta();



	renderer.setAnimationLoop(() => {
		delta = clock.getDelta();

		cntr += delta * 100;

		// draw here
		sphere1.position.x = Math.sin(cntr * 0.01) * 2.0;
		sphere1.position.y = Math.cos(cntr * 0.01) * 2.0;
		sphere1.position.z = Math.cos(cntr * 0.13) * 1.1;

		sphere2.position.x = Math.sin((cntr - 5) * 0.01) * 2.0;
		sphere2.position.y = Math.cos((cntr - 5) * 0.01) * 2.0;
		sphere2.position.z = Math.cos((cntr - 5) * 0.13) * 1.1;

		sphere3.position.x = Math.sin((cntr - 10) * 0.01) * 2.0;
		sphere3.position.y = Math.cos((cntr - 10) * 0.01) * 2.0;
		sphere3.position.z = Math.cos((cntr - 10) * 0.13) * 1.1;

		sphere4.position.x = Math.sin((cntr - 15) * 0.01) * 2.0;
		sphere4.position.y = Math.cos((cntr - 15) * 0.01) * 2.0;
		sphere4.position.z = Math.cos((cntr - 15) * 0.13) * 1.1;


		//if(++cntr > 9999999) cntr = 0;
		if(cntr > 9999999) cntr = 0;

		renderer.render(scene, camera);
	});
});
