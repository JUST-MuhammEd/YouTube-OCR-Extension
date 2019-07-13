var cvs = document.createElement('canvas')
var video = document.querySelector('video')
var ctx = cvs.getContext('2d')
const { TesseractWorker } = Tesseract

const worker = new TesseractWorker({
	workerPath: chrome.runtime.getURL('lib/worker.min.js'),
	langPath: chrome.runtime.getURL('lang-data'),
	corePath: chrome.runtime.getURL('lib/tesseract-core.wasm.js')
})

let getMetadata = () => {
	console.log('Width: ' + video.style.width)
	cvs.width = parseInt(video.style.width)
	cvs.height = parseInt(video.style.height)
}

let recognize = (img) => {
	worker
		.recognize(img)
		.progress((p) => {
			console.log('progress', p)
		})
		.then(function(result) {
			$('.txt-modal-dialog').append(`<textarea id="recognition-result">${result.text}</textarea>`)
			console.log(result)
		})
		.catch((err) => {
			console.log(err)
		})
}

let luminance = (r, g, b) => {
	let a = [ r, g, b ].map(function(v) {
		v /= 255
		return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
	})
	return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722
}

let blackAndWhite = (canvas) => {
	let colorThief = new ColorThief()
	let bgColour = colorThief.getColor(canvas)
	let bgColourBrightness = luminance(bgColour[0], bgColour[1], bgColour[2]) + 0.05
	let context = canvas.getContext('2d')
	let imageData = context.getImageData(0, 0, canvas.width, canvas.height)
	let brightness, contrast

	for (let i = 0; i < imageData.data.length; i += 4) {
		brightness = luminance(imageData.data[i], imageData.data[i + 1], imageData.data[i + 2]) + 0.05
		contrast = Math.max(bgColourBrightness, brightness) / Math.min(bgColourBrightness, brightness)

		if (contrast >= 3.5) {
			imageData.data[i] = 0
			imageData.data[i + 1] = 0
			imageData.data[i + 2] = 0
		} else {
			imageData.data[i] = 255
			imageData.data[i + 1] = 255
			imageData.data[i + 2] = 255
		}
	}
	context.putImageData(imageData, 0, 0)
	return canvas
}

// Change the size here
video.addEventListener('loadedmetadata', getMetadata)

if (video.readyState >= 2) {
	getMetadata()
}

chrome.runtime.onMessage.addListener((message) => {
	if (message.text == 'recognize') {
		ctx.drawImage(video, 0, 0, cvs.width, cvs.height)

		// chrome.storage.local.set({
		// 	imgSrc: canvas.toDataURL('image/jpeg')
		// })
		let imgSrc = cvs.toDataURL('image/jpeg')
		$('body').append("<div class='txt-modal'></div>")
		$('.txt-modal').append("<div class='txt-modal-dialog'></div>")
		$('.txt-modal-dialog').append(`<img id="screenshot" src="${imgSrc}"/>`)
		$('.txt-modal-dialog').append('<button id="btn-crop">Crop</button>')
		$('.txt-modal-dialog').append('<button id="btn-close">Close</button>')
		let screenshot = document.getElementById('screenshot')
		let cropper

		$('#screenshot').ready(() => {
			cropper = new Cropper(screenshot, {})
		})

		$('#btn-crop').click(() => {
			let croppedCanvas = cropper.getCroppedCanvas()
			let bwCanvas = blackAndWhite(croppedCanvas)
			imgSrc = bwCanvas.toDataURL('image/jpeg')
			cropper.destroy()
			$('#screenshot').remove()
			$('#btn-crop').remove()
			$('.txt-modal-dialog').append(`<img id="screenshot" src="${imgSrc}"/>`)
			$('.txt-modal-dialog').append('<button id="btn-again">Try Again</button>')
			recognize(imgSrc)
			$('#btn-again').click(() => {
				$('#recognition-result').remove()
				recognize(imgSrc)
			})
		})

		$('#btn-close').click(() => {
			$('.txt-modal').remove()
		})
	}
})
