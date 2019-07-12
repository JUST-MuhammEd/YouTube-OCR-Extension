var canvas = document.createElement('canvas')
var video = document.querySelector('video')
var ctx = canvas.getContext('2d')
const { TesseractWorker } = Tesseract

const worker = new TesseractWorker({
	workerPath: chrome.runtime.getURL('background/worker.min.js'),
	langPath: chrome.runtime.getURL('lang-data'),
	corePath: chrome.runtime.getURL('background/tesseract-core.wasm.js')
})

let getMetadata = () => {
	console.log('Width: ' + video.style.width)
	canvas.width = parseInt(video.style.width)
	canvas.height = parseInt(video.style.height)
}

let recognize = (img) => {
	worker
		.recognize(img)
		.progress((p) => {
			console.log('progress', p)
		})
		.then(function(result) {
			$('.txt-modal-dialog').append(`<textArea id="text">${result.text}</textArea>`)
			console.log(result)
		})
		.catch((err) => {
			console.log(err)
		})
}

// Change the size here
video.addEventListener('loadedmetadata', getMetadata)

if (video.readyState >= 2) {
	getMetadata()
}

chrome.runtime.onMessage.addListener((message) => {
	if (message.text == 'recognize') {
		ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
		let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
		// for (let i = 0; i < imageData.data.length; i += 4) {
		// 	let total = imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]
		// 	imageData.data[i + 3] = 255
		// 	if (total <= 327) {
		// 		imageData.data[i] = 0
		// 		imageData.data[i + 1] = 0
		// 		imageData.data[i + 2] = 0
		// 	} else {
		// 		imageData.data[i] = 255
		// 		imageData.data[i + 1] = 255
		// 		imageData.data[i + 2] = 255
		// 	}
		// }
		ctx.putImageData(imageData, 0, 0)
		// chrome.storage.local.set({
		// 	imgSrc: canvas.toDataURL('image/jpeg')
		// })
		let imgSrc = canvas.toDataURL('image/jpeg')
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
			imgSrc = croppedCanvas.toDataURL('image/jpeg')
			cropper.destroy()
			$('#screenshot').remove()
			$('#btn-crop').remove()
			$('.txt-modal-dialog').append(`<img id="screenshot" src="${imgSrc}"/>`)
			$('.txt-modal-dialog').append('<button id="btn-again">Try Again</button>')
			recognize(imgSrc)
			$('#btn-again').click(() => {
				$('#text').remove()
				recognize(imgSrc)
			})
		})

		$('#btn-close').click(() => {
			$('.txt-modal').addClass('hide-txt-modal').removeClass('txt-modal')
		})
	}
})
