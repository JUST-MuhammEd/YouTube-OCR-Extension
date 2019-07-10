var canvas = document.createElement('canvas')
var video = document.querySelector('video')
var ctx = canvas.getContext('2d')

// Change the size here
video.addEventListener('loadedmetadata', () => {
	canvas.width = parseInt(video.style.width)
	canvas.height = parseInt(video.style.height)
})

chrome.runtime.onMessage.addListener((message) => {
	if (message.text == 'recognize') {
		ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
		let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
		for (let i = 0; i < imageData.data.length; i += 4) {
			let total = imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]
			imageData.data[i + 3] = 255
			if (total <= 327) {
				imageData.data[i] = 0
				imageData.data[i + 1] = 0
				imageData.data[i + 2] = 0
			} else {
				imageData.data[i] = 255
				imageData.data[i + 1] = 255
				imageData.data[i + 2] = 255
			}
		}
		ctx.putImageData(imageData, 0, 0)
		chrome.storage.local.set({
			imgSrc: canvas.toDataURL('image/jpeg')
		})
		chrome.runtime.sendMessage({ text: 'create tab', data: canvas.toDataURL('image/jpeg') })
	}
})
