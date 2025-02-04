var editorHasChanged=false;
var editorDebug=true;

function editorDebugOut(...args){
	if (editorDebug){console.log(...args)};
}

window.addEventListener('beforeunload',function (e) {
	if (editorHasChanged){
		e.preventDefault(); 
		e.returnValue = '';
	};
});

function editorDraw(){}
function editorDrawLoop(){editorDraw();window.requestAnimationFrame(editorDrawLoop);};

editorDrawLoop()

function editorChangePage(p){
	nopage=true;
	eddiv=document.getElementById('editor').children;
	for (i=1;i<eddiv.length;i++){
		if (eddiv[i].id.split('-')[1]==p){
			eddiv[i].hidden=false;
			nopage=false;
		}else{
			eddiv[i].hidden=true;
		}
	};
	if (nopage){
		document.getElementById('editor-nopage').hidden=false;
	};
};

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// sprite editor code

//spr editor drawing canvas
var sprDraw={
	canvas:document.getElementById('sprdraw'),
	ctx:document.getElementById('sprdraw').getContext('2d'),
	click:0,
};
sprDraw.ctx.fillStyle = "black";
sprDraw.ctx.fillRect(0, 0, sprDraw.canvas.width, sprDraw.canvas.height);
sprDraw.ctx.imageSmoothingEnabled = false;

//spr editor selection canvas
var sprSel={
	canvas:document.getElementById('sprsel'),
	ctx:document.getElementById('sprsel').getContext('2d'),
	click:0,
};
sprSel.ctx.fillStyle = "black";
sprSel.ctx.fillRect(0, 0, sprSel.canvas.width, sprSel.canvas.height);
sprSel.ctx.imageSmoothingEnabled = false;

//graph canvas
var sprGraph={};
sprGraph.canvas=document.createElement('canvas');
sprGraph.ctx=sprGraph.canvas.getContext('2d');
sprGraph.canvas.width=256;
sprGraph.canvas.height=64;
sprGraph.ctx.imageSmoothingEnabled = false;
sprGraph.ctx.fillStyle = "black";
sprGraph.ctx.fillRect(0, 0, sprGraph.canvas.width, sprGraph.canvas.height);

//vars
var sprSelSize=8;
var sprSelPos={x:0,y:0};
var sprSelSpr=0;

var sprDrawDragImg;
var sprDrawDragStart={x:0,y:0};

//le editor funcs
function sprRedraw(){
	sprSel.ctx.drawImage(sprGraph.canvas,0,0,512,128);
	sprDraw.ctx.drawImage(sprGraph.canvas,sprSelPos.x*8,sprSelPos.y*8,sprSelSize,sprSelSize,0,0,128,128);
	sprSel.ctx.strokeStyle = "red";
	sprSel.ctx.lineWidth = 2;
	sprSel.ctx.strokeRect(sprSelPos.x*16+1,sprSelPos.y*16+1,sprSelSize*2-2,sprSelSize*2-2);
}
function sprSelSet(a,b){
	if (b==undefined){
		sprSelPos={x:a%32,y:a/32|0};
	}else{
		sprSelPos={x:a,y:b};
	}
	sprSelPos={x:clamp(0,sprSelPos.x,32-sprSelSize/8),y:clamp(0,sprSelPos.y,32-sprSelSize/8)};
	sprSelSpr=sprSelPos.y*32+sprSelPos.x;
};
function sprDrawSetP(X,Y,c){
	let s=16*(8/sprSelSize)
	X=X/s|0+sprSelPos.x*8;
	Y=Y/s|0+sprSelPos.y*8;
	if (c==1){c="white"}else if(c==2){c="black"};
	sprGraph.ctx.fillStyle = c;
	sprGraph.ctx.fillRect(X, Y, 1, 1);
	sprRedraw();
}

//drawing a sprite
window.addEventListener('mouseup', function (e){
	sprDraw.click=0;
});
sprDraw.canvas.addEventListener('mousedown', function (e){
	const rect = sprDraw.canvas.getBoundingClientRect();
	let X = (e.clientX-rect.left);
	let Y = (e.clientY-rect.top);
	sprDraw.click=e.buttons;
	if(sprDraw.click==4){sprDrawDragImg=createImageBitmap(sprDraw.canvas)}
	if (0<sprDraw.click&&sprDraw.click<3){sprDrawSetP(X,Y,sprDraw.click);}
});
sprDraw.canvas.addEventListener("mousemove", function (e){
	const rect = sprDraw.canvas.getBoundingClientRect();
	let X = (e.clientX-rect.left);
	let Y = (e.clientY-rect.top);
	if (0<sprDraw.click&&sprDraw.click<3){sprDrawSetP(X,Y,sprDraw.click);}
	
});

//select sprite
sprSel.canvas.addEventListener('mousedown', function (e){
	const rect = sprSel.canvas.getBoundingClientRect();
	let X = (e.clientX-rect.left);
	let Y = (e.clientY-rect.top);
	sprSelSet(X/16|0,Y/16|0);
	editorDebugOut("editor-spr:",sprSelPos.x,sprSelPos.y,sprSelSpr)
	sprRedraw();
});

//spr editor initialization
respondToVisibility(document.getElementById('editor-spr'),v =>{
	if (v){
		editorDebugOut("spr editor loaded");
		editorDraw=function(){
			document.getElementById('editor-spr-num').innerText=sprSelSpr
			
		};
	};
});

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// code editor code (lol)
// the thing uses ajax.org cloud9 editor, soo...

//setups
var editorCode = ace.edit("editor-code-ace");
editorCode.setTheme("ace/theme/m129");
editorCode.session.setMode("ace/mode/lua_m129");

document.getElementsByClassName('ace_editor')["editor-code-ace"].style.fontFamily="vga";
editorCode.setFontSize(16);

editorCode.setShowPrintMargin(false);

//code editor initialization
respondToVisibility(document.getElementById('editor-code'),v =>{
	if (v){
		editorDebugOut("code editor loaded");
		editorDraw=function(){
			let stbar=document.getElementById('editor-code-statusbar')
			let edCur=editorCode.selection.getCursor()
			stbar.innerText=edCur.row+":"+edCur.column
		}
	};
});

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//restore the damn canvases after page visibility change
//like... what the actual f█ck chrome??????

var restr_canvas=[sprDraw,sprSel]
var restr_bmp=[]

document.onvisibilitychange = async function (e){
	if (document.visibilityState === "hidden") {
		restr_bmp=[];
		for(i=0;i<restr_canvas.length;i++){
			restr_bmp.push(await createImageBitmap(restr_canvas[i].canvas))
		};
	} else {
		for(i=0;i<restr_canvas.length;i++){
			restr_canvas[i].ctx.drawImage(restr_bmp[i], 0, 0);
		};
	};
};
	