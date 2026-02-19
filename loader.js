const downloadBtn = document.getElementById("downloadBtn");
const statusEl = document.getElementById("status");
const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");
const labelType = document.getElementById("labelType");
const currentDate = document.getElementById("currentDate")
const expirationDateLength = document.getElementById("expirationDateLength")
const LABEL_CONFIGS = {
	dosa: {
		file: "Dosa Batter Label.png",
		layout: {
			anchorXRatio: 0.972888,
			anchorYRatio: 0.24006,
			rotationDeg: 90,
			fontSizePt: 29,
			fontFamily: '"Avenir Next Condensed", "Avenir Next", Arial, sans-serif',
			fontWeight: "bold",
			textColor: "#1a1a1a",
			coverColor: "#ffffff",
			coverLengthRatio: 0.12,
			coverThicknessRatio: 0.028,
			paddingXRatio: 0.003,
			paddingYRatio: 0.002,
		},
	},
	idli: {
		file: "Idli Batter Label.png",
		layout: {
			anchorXRatio: 0.959813,
			anchorYRatio: 0.259560,
			rotationDeg: 90,
			fontSizePt: 29,
			fontFamily: '"Avenir Next Condensed", "Avenir Next", Arial, sans-serif',
			fontWeight: "bold",
			textColor: "#1a1a1a",
			coverColor: "#ffffff",
			coverLengthRatio: 0.12,
			coverThicknessRatio: 0.028,
			paddingXRatio: 0.003,
			paddingYRatio: 0.002,
		},
	},
};

const dateLayout = {};
let selectedLabel = "dosa";
let LABEL_FILE = LABEL_CONFIGS[selectedLabel].file;

const todayDate = new Date()
const todayDay = todayDate.getDate().toString().padStart(2, '0');
const todayMonth = (todayDate.getMonth() + 1).toString().padStart(2, '0');
const todayYear = todayDate.getFullYear()

let weeksAdded = expirationDateLength?.value || "three";


currentDate.textContent = `${todayMonth}/${todayDay}/${todayYear}`

function addDays(todayDate, weeksAdded) {
	let numberOfDays = 0
	if (weeksAdded === "three"){
		numberOfDays = 21
	} else {
		numberOfDays = 30
	}
	const newDate = new Date(todayDate); 
	newDate.setDate(newDate.getDate() + numberOfDays); 

	const newDay = newDate.getDate().toString().padStart(2, '0');
	const newMonth = (newDate.getMonth() + 1).toString().padStart(2, '0');
	const newYear = newDate.getFullYear()
	return `${newMonth}/${newDay}/${newYear}`;
}

expirationDateLength.addEventListener("change", (e) => {
	weeksAdded = e.target.value
	renderExpirationDate()
})

function renderExpirationDate() {
  const text = addDays(todayDate, weeksAdded || "three");
  drawPreview(text);
}
function applyLabelConfig(labelKey) {
	const config = LABEL_CONFIGS[labelKey] || LABEL_CONFIGS.dosa;
	selectedLabel = labelKey in LABEL_CONFIGS ? labelKey : "dosa";
	LABEL_FILE = config.file;
	Object.assign(dateLayout, config.layout);
}

applyLabelConfig(labelType?.value || "dosa");

if (labelType) {
	labelType.addEventListener("change", (event) => {
		applyLabelConfig(event.target.value);
		loadedImage = null;
		renderExpirationDate();
		loadFixedImage();
	});
}

let loadedImage = null;

function updateStatus(message) {
	statusEl.textContent = message;
}

function drawPreview(text) {
	context.clearRect(0, 0, canvas.width, canvas.height);

	if (!loadedImage) {
		context.fillStyle = "#ffffff";
		context.fillRect(0, 0, canvas.width, canvas.height);
		return;
	}

	context.drawImage(loadedImage, 0, 0, canvas.width, canvas.height);

	if (!text) {
		return;
	}

	const x = canvas.width * dateLayout.anchorXRatio;
	const y = canvas.height * dateLayout.anchorYRatio;
	const rotation = (dateLayout.rotationDeg * Math.PI) / 180;
	const coverLength = canvas.width * dateLayout.coverLengthRatio;
	const coverThickness = canvas.height * dateLayout.coverThicknessRatio;
	const padX = canvas.width * dateLayout.paddingXRatio;
	const padY = canvas.height * dateLayout.paddingYRatio;
	const fontSizePt = Math.max(8, Number(dateLayout.fontSizePt) || 40);

	context.save();
	context.translate(x, y);
	context.rotate(rotation);

	context.fillStyle = dateLayout.coverColor;
	context.fillRect(-padX, -coverThickness + padY, coverLength, coverThickness);

	context.fillStyle = dateLayout.textColor;
	context.font = `${dateLayout.fontWeight} ${fontSizePt}pt ${dateLayout.fontFamily}`;
	context.textBaseline = "alphabetic";
	context.fillText(text, 0, 0);
	context.restore();
}

function fitCanvasToImage(image) {
	const maxWidth = 1600;
	const maxHeight = 1200;
	let { width, height } = image;

	const widthRatio = maxWidth / width;
	const heightRatio = maxHeight / height;
	const ratio = Math.min(1, widthRatio, heightRatio);

	width = Math.round(width * ratio);
	height = Math.round(height * ratio);

	canvas.width = width;
	canvas.height = height;
}

function loadFixedImage() {
	const image = new Image();
	image.onload = () => {
		loadedImage = image;
		fitCanvasToImage(image);
		renderExpirationDate();
		updateStatus("Ready. Enter a date and download.");
	};

	image.onerror = () => {
		updateStatus(`Could not load ${LABEL_FILE}. Keep it next to index.html.`);
	};

	image.src = encodeURI(LABEL_FILE);
}

function downloadCanvasPng() {
	if (!loadedImage) {
		updateStatus("Label is still loading. Try again in a moment.");
		return;
	}

	try {
		canvas.toBlob((blob) => {
			if (!blob) {
				updateStatus("Download failed. Could not generate PNG.");
				return;
			}

			const url = URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.download = `updated-${selectedLabel}-label.png`;
			link.href = url;
			document.body.appendChild(link);
			link.click();
			link.remove();
			URL.revokeObjectURL(url);

			updateStatus(`Downloaded: updated-${selectedLabel}-label.png`);
		}, "image/png");
	} catch (error) {
		updateStatus("Download blocked by browser security. Open this app via localhost instead of file://.");
	}
}

downloadBtn.addEventListener("click", () => {
	if (!dateInput.value.trim()) {
		updateStatus("Enter an expiration date first.");
		return;
	}

	downloadCanvasPng();
});

renderExpirationDate();
loadFixedImage();
