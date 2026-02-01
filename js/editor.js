const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// Load Template
const template = JSON.parse(localStorage.getItem("selectedTemplate"));
const frame = template.frame;
const templateImg = new Image();
templateImg.src = template.image;

// Image State
let userImg = null,
    imgX = frame.x,
    imgY = frame.y,
    scale = 1,
    dragging = false,
    startX = 0,
    startY = 0;

// Undo History
let history = [];

function saveState() {
  history.push({
    imgX,imgY,scale,rotate:rotate.value,
    text1:text1.value,text2:text2.value,text3:text3.value,
    align:align.value,font:font.value,textColor:textColor.value,
    banner:banner.checked,bannerColor:bannerColor.value
  });
}

// Draw Loop
templateImg.onload = () => requestAnimationFrame(draw);

function draw() {
  ctx.clearRect(0, 0, 1080, 1080);
  drawImage();
  ctx.drawImage(templateImg, 0, 0, 1080, 1080);
  drawText();
}

// Draw Image with Clip + Rotate
function drawImage() {
  if (!userImg) return;

  ctx.save();
  ctx.beginPath();
  ctx.rect(frame.x, frame.y, frame.w, frame.h);
  ctx.clip();

  ctx.translate(imgX + (userImg.width * scale) / 2, imgY + (userImg.height * scale) / 2);
  ctx.rotate(rotate.value * Math.PI / 180);

  ctx.drawImage(userImg, -(userImg.width * scale) / 2, -(userImg.height * scale) / 2,
    userImg.width * scale, userImg.height * scale);

  ctx.restore();
}

// Multi-line Wrap Function
function wrapText(text, x, y, maxWidth, lineHeight) {
  const words = text.split(" ");
  let line = "";
  let lines = [];

  for (let w of words) {
    const test = line + w + " ";
    if (ctx.measureText(test).width > maxWidth) {
      lines.push(line);
      line = w + " ";
    } else line = test;
  }
  lines.push(line);

  lines.forEach((l, i) => {
    ctx.fillText(l, x, y + i * lineHeight);
  });

  return lines.length * lineHeight;
}

// Draw Text + Banner
function drawText() {
  const blocks = [text1.value, text2.value, text3.value];
  ctx.font = `bold 48px ${font.value}, "Noto Sans Bengali", "SulaimanLipi"`;
  ctx.fillStyle = textColor.value;
  ctx.textAlign = align.value;

  const x = align.value === "left" ? 80 : align.value === "right" ? 1000 : 540;
  const y = parseInt(textY.value);
  const maxW = 900;

  if (banner.checked) {
    ctx.fillStyle = bannerColor.value;
    ctx.fillRect(0, y - 50, 1080, 180);
    ctx.fillStyle = textColor.value;
  }

  let offset = 0;
  blocks.forEach(b => {
    if (!b) return;
    offset += wrapText(b, x, y + offset, maxW, 56);
  });
}

// Upload Image
upload.onchange = e => {
  const img = new Image();
  img.src = URL.createObjectURL(e.target.files[0]);
  img.onload = () => {
    userImg = img;

    // Fit to frame initially
    const frameRatio = frame.w / frame.h;
    const imgRatio = img.width / img.height;
    if (imgRatio > frameRatio) scale = frame.w / img.width;
    else scale = frame.h / img.height;

    // Center in frame
    imgX = frame.x + (frame.w - img.width * scale) / 2;
    imgY = frame.y + (frame.h - img.height * scale) / 2;

    saveState();
    draw();
  };
};

// Controls
zoom.oninput = e => { scale = e.target.value; draw(); };
rotate.oninput = draw;
text1.oninput = draw; text2.oninput = draw; text3.oninput = draw;
textY.oninput = draw; align.onchange = draw; font.onchange = draw; textColor.oninput = draw;
banner.onchange = draw; bannerColor.oninput = draw;

// Drag & Touch
canvas.addEventListener("mousedown", e => { dragging = true; startX = e.offsetX - imgX; startY = e.offsetY - imgY; });
canvas.addEventListener("mousemove", e => { if (!dragging) return; imgX = e.offsetX - startX; imgY = e.offsetY - startY; draw(); });
canvas.addEventListener("mouseup", () => { dragging = false; saveState(); });
canvas.addEventListener("touchstart", e => { const t = e.touches[0]; dragging = true; startX = t.clientX - imgX; startY = t.clientY - imgY; });
canvas.addEventListener("touchmove", e => { if (!dragging) return; const t = e.touches[0]; imgX = t.clientX - startX; imgY = t.clientY - startY; draw(); });
canvas.addEventListener("touchend", () => { dragging = false; saveState(); });

// Reset Button
reset.onclick = () => {
  imgX = frame.x; imgY = frame.y; scale = 1; rotate.value = 0;
  text1.value = text2.value = text3.value = "";
  draw();
  saveState();
};

// Undo Button
undo.onclick = () => {
  if (history.length < 2) return;
  history.pop();
  const prev = history[history.length - 1];
  imgX = prev.imgX; imgY = prev.imgY; scale = prev.scale; rotate.value = prev.rotate;
  text1.value = prev.text1; text2.value = prev.text2; text3.value = prev.text3;
  align.value = prev.align; font.value = prev.font; textColor.value = prev.textColor;
  banner.checked = prev.banner; bannerColor.value = prev.bannerColor;
  draw();
};

// Download Button
download.onclick = () => {
  const type = format.value === "jpg" ? "image/jpeg" : "image/png";
  const link = document.createElement("a");
  link.download = `photocard.${format.value}`;
  link.href = canvas.toDataURL(type, 0.95);
  link.click();
}; 
