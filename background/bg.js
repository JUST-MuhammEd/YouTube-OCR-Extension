const { TesseractWorker } = Tesseract
let screenshot = document.getElementById('screenshot')

window.onload = () => {
	chrome.storage.local.get([ 'imgSrc', 'text' ], (result) => {
		screenshot.src = result.imgSrc
		document.getElementById('text').textContent = result.text
	})
}

const worker = new TesseractWorker({
	workerPath: chrome.runtime.getURL('background/worker.min.js'),
	langPath: chrome.runtime.getURL('lang-data'),
	corePath: chrome.runtime.getURL('background/tesseract-core.wasm.js')
})

chrome.runtime.onMessage.addListener((message) => {
	if (message.text == 'create tab') {
		screenshot.src = message.data
		chrome.tabs.create({ url: chrome.runtime.getURL('background/bg.html') }, () => {
			const cropper = new Cropper(screenshot, {
				aspectRatio: 1
			})
			console.log(cropper)
		})
		// worker
		// 	.recognize(message.data)
		// 	.progress((p) => {
		// 		console.log('progress', p)
		// 	})
		// 	.then(function(result) {
		// 		chrome.storage.local.set({
		// 			text: result.text
		// 		})
		// 		document.getElementById('text').textContent = result.text
		// 	})
		// 	.catch((err) => {
		// 		console.log(err)
		// 	})
	}
})
