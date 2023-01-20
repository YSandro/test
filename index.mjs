import {
	AmbientLight,
	AxesHelper,
	AudioListener,
	AudioLoader,
	BufferGeometry,
	Clock,
	Color,
	Fog,
	Group,
	Line,
	LineBasicMaterial,
	Mesh,
	MeshBasicMaterial,
	MeshLambertMaterial,
	MeshPhongMaterial,
	MeshToonMaterial,
	PCFSoftShadowMap,
	PerspectiveCamera,
	PositionalAudio,
	Quaternion,
	Raycaster,
	REVISION,
	Scene,
	SphereGeometry,
	Sprite,
	SpriteMaterial,
	TextureLoader,
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
	const clock = new Clock(true),
		mouse = new Vector2(),
		arcStart = new Vector3(),
		arcEnd = new Vector3(),
		arcMaterial = new LineBasicMaterial({color: 'rgb(255,255,0)'}),
		arcPoints = [],
		arcGeometry = new BufferGeometry(),
		look = new Vector3(0, 0.2, 0);

	let delta = clock.getDelta(),
		cntr = 1,
		arcStarted = false,
		soundOn = false;
	
	const scene = new Scene();
	const camera = new PerspectiveCamera(
		50,
		window.innerWidth / window.innerHeight,
		1,
		10
	);
	camera.position.x = 2.6;
	camera.position.z = 2.6;
	camera.position.y = 2;
	camera.lookAt(0, 0.2, 0);

	const renderer = new WebGLRenderer({
		antialias: true,
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


	const sphere = new Mesh(new SphereGeometry(1), new MeshBasicMaterial({
		color: 'rgb(200,155,155)',
		opacity: 0.5,
		transparent: true,
	}));
	sphere.receiveShadow = true;
	scene.add(sphere);


	const sphereMarker = new Mesh(new SphereGeometry(0.04), new MeshBasicMaterial({color: 'rgb(255,100,50)', opacity: 0.6, transparent: true}));
	sphereMarker.name = 'marker';
	scene.add(sphereMarker);


	const container = new Group();
	scene.add(container);


	const listener = new AudioListener();
	camera.add(listener);
	const sound = new PositionalAudio(listener);
	sound.setLoop(true);
	sound.setDistanceModel('exponential');
	sound.setMaxDistance(6);
	const audioLoader = new AudioLoader();
	audioLoader.load('ritmichnyiy-zvuk-barabana-39655.ogg', buffer => {
		sound.setBuffer(buffer);
		container.add(sound);
	});

	const solnSprite = new Sprite();
	solnSprite.scale.set(0.25, 0.25, 0.25);
	const solnMap = new TextureLoader().load('dinamik_64.png', tex => {
		const solnMaterial = new SpriteMaterial({map: solnMap, fog: false});
		solnSprite.material = solnMaterial;
		container.add(solnSprite);
	})

	window.document.getElementById('snd').addEventListener('click', event => {
		event.preventDefault();
		if(listener.context.state === 'suspended'){
			listener.context.resume();
			if(!sound.isPlaying) sound.play();
			soundOn = true;
			event.target.innerHTML = '&#128266;';
		}
		else{
			listener.context.suspend();
			soundOn = false;
			event.target.innerHTML = '&#128264;';
		}
	});


	const raycaster = new Raycaster();
	raycaster.near = camera.near;
	raycaster.far = camera.far;

	const arcLine = new Line(arcGeometry, arcMaterial);
	scene.add(arcLine);


	const rayCast = (retPos, click) => {
		raycaster.setFromCamera(mouse, camera);
		const intersects = raycaster.intersectObject(sphere);
		if(intersects.length < 1) return false;
		if(retPos) retPos.copy(intersects[0].point);
		sphereMarker.position.copy(intersects[0].point);
		return true;
	}


	const buildArc = (_arcStart, _arcEnd) => {
		const vFrom = _arcStart.clone().normalize();
		const vTo = _arcEnd.clone().normalize();
		const qt = (new Quaternion()).setFromUnitVectors(vFrom, vTo);

		const del = Math.ceil(_arcStart.distanceTo(_arcEnd) / 0.1);

		arcPoints.length = 0;
		arcPoints.push(_arcStart);
		for(let i = 1; i < del; ++i){
			arcPoints.push(_arcStart.clone().applyQuaternion((new Quaternion()).slerp(qt, (1 / del) * i)));
		}
		arcPoints.push(_arcEnd);
		arcGeometry.setFromPoints(arcPoints);
	}


	canvasElement.addEventListener('mousemove', event => {
		event.preventDefault();
		mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
		mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

		rayCast();
	});


	canvasElement.addEventListener('mousedown', event => {
		event.preventDefault();
		if(!event.target.isEqualNode(canvasElement)) return;
		if(listener.context.state === 'suspended' && soundOn){
			listener.context.resume();
			if(!sound.isPlaying) sound.play();
		}

		if(event.buttons === 1){
			if(!arcStarted)
				arcStarted = rayCast(arcStart, true);
			else{
				arcStarted = false;
				if(rayCast(arcEnd, true)){
					buildArc(arcStart, arcEnd);
				}
			}
		}
		else if(event.buttons === 2)
			arcStarted = false;
	});


	window.addEventListener('resize', () => {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize(window.innerWidth, window.innerHeight);
	});


	renderer.setAnimationLoop(() => {
		delta = clock.getDelta();

		cntr += delta;

		// draw here
		container.position.x = Math.sin(cntr * 0.1) * 2.2;
		container.position.y = Math.cos(cntr * 0.1) * 2.2;
		container.position.z = Math.cos(cntr * 1.3);

		camera.position.x = Math.cos(cntr * 0.1) * 3;
		camera.position.z = Math.sin(cntr * 0.1) * 3;
		camera.position.y = Math.sin(cntr);
		camera.lookAt(look);

		//if(++cntr > 9999999) cntr = 0;
		if(cntr > 9999999) cntr = 0;

		renderer.render(scene, camera);
	});
});
