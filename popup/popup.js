let button = document.getElementById('recognize')

chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
	button.addEventListener('click', (e) => {
		console.log('ME')
		chrome.tabs.sendMessage(tabs[0].id, { text: 'recognize' })
	})
})
