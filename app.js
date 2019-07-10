const { TesseractWorker, OEM, PSM } = Tesseract

const worker = new TesseractWorker()

worker
	.recognize('https://res.cloudinary.com/duajajlie/image/upload/v1560346911/ID-page-001edit_jom2jl.jpg', 'eng', {
		tessedit_ocr_engine_mode: '4',
		tessedit_pageseg_mode: '3'
	})
	.progress((p) => {
		console.log('progress', p)
	})
	.then(function(result) {
		console.log('result is: ', result)
	})
	.catch((err) => {
		console.log(err)
	})
