var delay = 1500;

// queue up voices
var items = [
	1, 2, 3, 4, 5, 6
]
var tags = []
var volume = 0.3
var interval = setInterval(function() {
	if (!tags[0]) return
	if (volume >= 0.9) {
		volume = 1
	} else {
		volume += 0.1
	}
	console.log('volume going to', volume)
	tags.forEach(function(tag) {
		tag.volume = volume
	})

	if (volume === 1) endMadness()
}, 3000)

// music
var music = document.createElement('audio')
music.loop = true
music.preload = true
music.volume = 0.6
music.src = 'res/music.mp3'

var annoying = document.createElement('audio')
annoying.preload = true
annoying.src = 'res/annoying.mp3'

// make video
var video = document.createElement('video')
video.loop = true
// video.muted = true
video.autoplay = true
video.preload = true
video.playsinline = video['webkit-playsinline'] = true
video.src = 'res/bg.mp4'
makeVideoPlayableInline(video, true)
video.play()

// play the clips
tags = items.map(play)

// set the stage
var camera = new THREE.PerspectiveCamera(55, 1080/ 720, 20, 3000)
camera.position.z = 1000

var scene = new THREE.Scene()

// make texture
var videoTexture = new THREE.Texture(video)
videoTexture.minFilter = THREE.LinearFilter
videoTexture.magFilter = THREE.LinearFilter

var videoMaterial = new THREE.MeshBasicMaterial({
	map: videoTexture
})

// add plane
var planeGeometry = new THREE.PlaneGeometry(1080, 720, 1, 1)
var plane = new THREE.Mesh(planeGeometry, videoMaterial)
scene.add(plane)
plane.z = 0
plane.scale.x = plane.scale.y = 1.45

// init
var renderer = new THREE.WebGLRenderer()
renderer.setSize(80, 600)
document.body.appendChild(renderer.domElement)

// create shader passes
var shaderTime = 0
var renderPass = new THREE.RenderPass(scene, camera)
var badTVPass = new THREE.ShaderPass(THREE.BadTVShader)
var rgbPass = new THREE.ShaderPass(THREE.RGBShiftShader)
var filmPass = new THREE.ShaderPass(THREE.FilmShader)
var staticPass = new THREE.ShaderPass(THREE.StaticShader)
var copyPass = new THREE.ShaderPass(THREE.CopyShader)

// set up shader pass params
badTVPass.uniforms.distortion.value = 1
badTVPass.uniforms.distortion2.value = 0
badTVPass.uniforms.speed.value = 0.04
badTVPass.uniforms.rollSpeed.value = 0.01

staticPass.uniforms.amount.value = 0.1
staticPass.uniforms.size.value = 4.0

rgbPass.uniforms.amount.value = 0.005
rgbPass.uniforms.angle.value = 0.01

filmPass.uniforms.sCount.value = 800
filmPass.uniforms.sIntensity.value = 0.9
filmPass.uniforms.nIntensity.value = 0.4
filmPass.uniforms.grayscale.value = 0

// create composer
var composer = new THREE.EffectComposer(renderer)
composer.addPass(renderPass)
composer.addPass(filmPass)
composer.addPass(badTVPass)
composer.addPass(rgbPass)
composer.addPass(staticPass)
composer.addPass(copyPass)
copyPass.renderToScreen = true

// set the sizing and listen for changes
window.addEventListener('resize', onResize, false)
onResize()
animate()

function animate() {
	shaderTime += 0.05

	badTVPass.uniforms.time.value = shaderTime
	filmPass.uniforms.time.value = shaderTime
	staticPass.uniforms.time.value = shaderTime

	if (videoTexture && video.readyState === video.HAVE_ENOUGH_DATA) {
		videoTexture.needsUpdate = true
	}

	requestAnimationFrame(animate)
  composer.render()
}

function onResize() {
	renderer.setSize(window.innerWidth, window.innerHeight)
	camera.aspect = window.innerWidth / window.innerHeight
	camera.updateProjectionMatrix()
}

function play(id) {
	var audio = document.createElement('audio')
	audio.loop = true
	audio.volume = volume
	audio.preload = true
	audio.src = 'res/' + id + '.wav'

	const ourDelay = id * delay
	setTimeout(function() {
		console.log('triggering initial', id)
		audio.play()
		fuckup()
	}, ourDelay)
	return audio
}

function fuckup() {
	badTVPass.uniforms.distortion.value += 0.5
	badTVPass.uniforms.distortion2.value += 0.5
	rgbPass.uniforms.amount.value += 0.003
	rgbPass.uniforms.angle.value += 0.03
}

function endMadness() {
	clearInterval(interval)

	console.log('end')

	var head = document.querySelectorAll('.big-header')[0]
	fuckup()

	music.play()
	// video.muted = true

	head.className += ' active'
	head.innerText = 'representing your interests'

	var idx = 0;
	var txts = [
		'defending the constitution',
		'fighting for liberty',
		'upholding the rule of law',
		'representing you',
		'dont look at the details',
		'follow the law',
		'you have nothing to hide'
	]
	var flash = setInterval(function(){
		head.innerText = txts[++idx % txts.length]
	}, 250)
	setTimeout(function(){
		clearInterval(flash)
		head.innerText = 'dont worry'
		head.className += ' active bounce'
		tags.forEach(function(tag){
			tag.pause()
		})
		annoying.play()
	}, 14000)
}
