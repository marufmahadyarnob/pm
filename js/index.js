const grid=document.getElementById("templateGrid");
TEMPLATES.forEach(t=>{
const card=document.createElement("div");
card.className="template-card";
card.innerHTML=`<img src="${t.image}"><span>${t.name}</span>`;
card.onclick=()=>{
  localStorage.setItem("selectedTemplate",JSON.stringify(t));
  window.location.href="editor.html";
};
grid.appendChild(card);
});
