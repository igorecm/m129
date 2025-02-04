//let div = document.querySelector('#hz');
//var codeTextArea = document.createElement('textarea');
var drawCanvas = document.createElement('canvas');
var drawCtx = drawCanvas.getContext('2d');

var graphCanvas = document.createElement('canvas');
var graphCtx = graphCanvas.getContext('2d' ,{willReadFrequently: true,});
graphCanvas.width=256
graphCanvas.height=64
graphCtx.fillStyle = color(0);
graphCtx.fillRect(0, 0, 256, 64);

var codeLayer = document.createElement('canvas');
var codeCtx = codeLayer.getContext('2d');
codeLayer.width=256
codeLayer.height=192

window.addEventListener('beforeunload',function (e) {e.preventDefault(); e.returnValue = '';});

var mEditorMode=true

drawCanvas.imageSmoothingEnabled = false;

function download(filename,data) {
	var alink = document.createElement('a');
	alink.href=data
	alink.download=filename
	
	alink.click();
}
function openTextFile(ft = "",nextact = function(f){}) {
	const input = document.createElement('input');
	let fileContents = ""
	input.type = 'file';
	input.accept = ft;

	input.addEventListener('change', (event) => {
		const file = event.target.files[0];
		const reader = new FileReader();
		reader.onload = function(event) {
			fileContents = event.target.result;
			nextact(fileContents)
		};
		reader.readAsText(file);
	});
	input.click();
}
function openPng(nextact = function(f){}) {
	var input = document.createElement('input');
	input.type = 'file';
	input.accept = ".png";

	input.addEventListener('change', (e) => {
		const reader = new FileReader();
		file = e.target.files[0];
		reader.onload=function(){
			var img = new Image
			img.onload = () => {
				nextact(img)
			}
			img.src = reader.result
		}
		reader.readAsDataURL(file)
	});
	input.click();
}

// button class
class mButton{
	constructor(txt,x,y,w=8,h=8,o=function(){},k='',t="",c1=15,c2=8,cc=7){
		this.txt = txt;
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
		this.onClick = o;
		this.key = k;
		this.clicked = 0
		this.c1 = c1;
		this.c2 = c2;
		this.cc = cc;
		this.tag = t
		this.hidden = false
	}
	draw(){
		let c = this.c1;
		if (this.clicked ==1){
			c = this.cc
		}
		recta(this.x,this.y,this.w,this.h,this.c2);
		if (this.txt === this.txt.toString()){
			text(this.txt,this.x,this.y,this.w/4,c);
		}else{
			chr(this.txt,this.x+this.w/2-4,this.y+this.h/2-4,c);
		}
		this.clicked = 0;
	}
	click(c){
		if(c==1 &&
		mouseX > this.x && mouseX < this.x+this.w &&
		mouseY > this.y && mouseY < this.y+this.h){
			this.onClick(this.param);
			this.clicked = 1;
		};
	}
}
var buttons = [];

var editPage = {
	init : function(){},
	update : function(){},
	uninit : function(){},
}
var defPage = {
	init : function(){
		edMOpened = false
		buttons = [];
		buttons.push(new mButton(142,200,0,8,8,codeedit.init));
		buttons.push(new mButton(143,200+16*1,0,8,8,spredit.init));
		buttons.push(new mButton(144,200+16*2,0,8,8,levedit.init));
		//buttons.push(new mButton(145,160+16*3,0,8,8,doShitt));
		//buttons.push(new mButton(146,160+16*4,0,8,8,doShitt));
		buttons.push(new mButton(0,0,0,8,8,editrMenu,'Escape',"",-1,-1,-1));
		//
	},
	update : function(){
	},
	uninit : function(){},
}
function editrMenu(){
	elClicked=0
	if (edMOpened==false){
		buttons.push(new mButton("-run",0,8,72,8,runGame,'','menu'));
		buttons.push(new mButton("-load",0,16,72,8,loadGame,'','menu'));
		buttons.push(new mButton("-save",0,24,72,8,saveGame,'','menu'));
		edMOpened = true
	}else if (edMOpened==true){
		for(i=0;i<buttons.length;i++){
			if (buttons[i].tag == "menu"){buttons.splice(i,1);i-=1;edMOpened=false}
		}
	}
}
var edMOpened = false
var lastPage
var notif = ["",0,9]
var errIndex = 0

function runGame(){
	luaRestart()
	keyUp = function(e){}
	mouseOnClick = function(e){}
	mouseOnUnclick = function(e){}
	mouseOnMove = function(e){}
	mouseOnWheel = function(e){}
	
	keyDown = function(e){
		if(e.key == "Escape"){
			stopGame()
		}
	}
	//window.addEventListener('error',(e)=>{stopGame(e)});
	lastPage = editPage
	editPage.uninit()
	cls()
	levMapFin()
	L.execute(`
	mapTiles=js.global.mapTiles.data
	mapColors=js.global.mapColors.data
	`)
	graph = imgdataToImage(loadGraph(editGraph));
	mapRedraw()
	
	let script = codeLines.join("\n")
	
	try{
		L.execute(script)
		L.execute("init()")
		update = function(){
			try{
				L.execute("update()")
			}catch(err){stopGame(err)}
		}
		draw = function(){
			try{
				L.execute("draw()")
			}catch(err){stopGame(err)}
		}
	}catch(err){stopGame(err)}
}
function stopGame(n){
	window.removeEventListener('error',stopGame);
	errIndex += 1
	//let e = new Lua.Error(L,0)
	//L = new Lua.State
	/* for(b=-5;b<2;b++){
		console.log(new Lua.Error(L,b).message)
	} */
	
	L.execute(exportFunctions);
	editPage = lastPage
	init()
	draw = edtDefDraw
	//e = e.message.toString()
	if (n!=undefined){
		notif = [n.message,240,9]
	}else{
		//notif = [e,90,12]
	}
	mode(1);
}
function saveGame(){
	gametitle = codeLines[0].substring(2,codeLines[0].length)
	gameauthor = codeLines[1].substring(2,codeLines[1].length)
	let gr = new Uint8Array(2048)
	for(i=0;i<2048*8;i+=8){
		gr[i/8]=parseInt(editGraph.substring(i,i+8),2)
	}
	gr = btoa(Uint8ToString(pako.deflate(gr)))
	let mt = btoa(Uint8ToString(pako.deflate(editMapTiles.data)))
	let mc = btoa(Uint8ToString(pako.deflate(editMapColors.data)))
	let file = ''
	file += "Mono 129 version "+ver+" cartrige\n"
	file += gametitle + "\n"
	file += gameauthor + "\n"
	file += "_lua_\n"
	file += codeLines.join("\n")+"\n"
	file += "_luaend_\n"
	file += "_graph_\n"
	file += gr + "\n"
	file += "_map_\n"
	file += mt + "\n" + mc + "\n"
	download(gametitle+(Date.now()*!isNW)+".m129",
	"data:text/plain;charset=utf-8,"+encodeURIComponent(file));
	editrMenu()
}
function loadGame(){
	let nextact = function(f){
		let file = f.split("\n")
		let act = 0
		codeLines = []
		for(i=0;i<file.length;i++){
			switch(act){
				case 1: codeLines.push(file[i]); break;
				case 2:
					if(file[i].length==16384){editGraph = file[i];}
					else{
						editGraph=""
						let o=pako.inflate(Base64ToUint8(file[i]))
						if(o.length!=2048){console.error("m129 load error: graph is not in valid format");break;}
						let ad=""
						let b="00000000"
						for(n=0;n<2048;n++){
							ad = Number(o[n]).toString(2)
							ad = b.substring(0,8-ad.length)+ad
							editGraph+=(ad)
						}
					}
					//editGraph = file[i];  
					
					act = 0; 
					break;
				case 3: 
					editMapTiles.data=pako.inflate(Base64ToUint8(file[i])); 
					editMapColors.data=pako.inflate(Base64ToUint8(file[i+1])); 
					act = 0; 
					break;	
			}
			switch(file[i]){
				case "_lua_": act = 1; break;
				case "_luaend_": act = 0; codeLines.pop(1); break;
				case "_graph_": act = 2; break;
				case "_map_": act = 3; break;
			}
		}
		graph = imgdataToImage(loadGraph(editGraph));
		codeCurLine=0
		lineYo=0
		setTimeout(() => {graphLoaded=true;redrawGraph();editPage.init();}, 30);
		
		}
	
	openTextFile(".m129",nextact);
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//sprite editor functions and vars
var curTile = 0;
var curTileX = 0;
var curTileY = 0;
var zoom = 4;
var size = 8;
var copyData = [];
var undobuffer = [];
var redobuffer = [];
var undobufferMaxL = 10;
var undoCurPos = 0;
drawCanvas.width = size;
drawCanvas.height = size;
var mouseXp = 0;
var mouseYp = 0;
var elClicked = 0;
var graphLoaded = true

///////////////////////////////////////////////////////////////////////

function doShitt(){console.log("i do shit!!!! hurrrrrrr!!!!!")};

function emptyGraphData(){
	let a = "";
	for(i=0;i<16384;i++){
		a = a + "0";
	}
	return a;
}
var editGraph = emptyGraphData();

function clearTile(){
	addToUndo()
	drawCtx.fillStyle = color(0);
	drawCtx.fillRect(0, 0, 64, 64);
	graphCtx.fillStyle = color(0);
	graphCtx.fillRect(curTileX,curTileY-128,size,size);
}
function flipV(){
	graphCtx.scale(-1,1);
	graphCtx.drawImage(drawCanvas,curTileX*-1-size,curTileY-128);
	graphCtx.setTransform(1,0,0,1,0,0);
	drawCtx.drawImage(graphCanvas,curTileX,curTileY-128,size,size,0,0,size,size);
	addToUndo()
}
function flipH(){
	graphCtx.scale(1,-1);
	graphCtx.drawImage(drawCanvas,curTileX,(curTileY-128)*-1-size);
	graphCtx.setTransform(1,0,0,1,0,0);
	drawCtx.drawImage(graphCanvas,curTileX,curTileY-128,size,size,0,0,size,size);
	addToUndo()
}
function copy(){
	copyData = drawCtx.getImageData(0,0,size,size);
}
function paste(){
	graphCtx.putImageData(copyData,curTileX,curTileY-128);
	drawCtx.drawImage(graphCanvas,curTileX,curTileY-128,size,size,0,0,size,size);
	addToUndo()
}
function cut(){
	copy();
	clearTile();
	addToUndo()
}
function chngSize(){
	size=8+8*((size/8)%3)
	drawCanvas.width = size;
	drawCanvas.height = size;
	curTileX=Math.min(curTileX,256-size)
	curTileY=Math.min(curTileY,192-size)
	curTile=(curTileX/8)+((curTileY-128)/8)*32
	drawCtx.drawImage(graphCanvas,curTileX,curTileY-128,size,size,0,0,size,size);
}
function saveGraph(){
	//let data = tileCtx.getImageData(0,128,256,64);
	let subdata;
	let x;
	let y;
	let sgrph = "";
	for(i = 0;i<256;i++){
		x = (i%32)*8;
		y = Math.floor(i/32)*8;
		subdata = graphCtx.getImageData(x,y,8,8).data;
		for(j = 0;j<subdata.length;j+=4){
			if (subdata[j]==255){sgrph+="1"}else{sgrph+="0"}
		}
	}
	return sgrph;
}
function exportGraph(){
	editGraph = saveGraph();
	download(gametitle+Date.now()+".png",graphCanvas.toDataURL("image/png"));
}
function importGraph(){
	let nextact = function(f){
		graphCtx.fillStyle=color(0)
		graphCtx.fillRect(0,0,256,64)
		graphCtx.drawImage(f,0,0)
		let px = graphCtx.getImageData(0,0,256,64)
		for(i=0;i<256*64*4;i+=4){
			let lightness = parseInt((px.data[i] + px.data[i+1] + px.data[i+2]) / 3);
			px.data[i] = Math.round(lightness/255)*255;
			px.data[i+1] = Math.round(lightness/255)*255;
			px.data[i+2] = Math.round(lightness/255)*255;
			px.data[i+3] = 255
		}
		graphCtx.putImageData(px,0,0)
		drawCtx.drawImage(graphCanvas,curTileX,curTileY-128,size,size,0,0,size,size);
		editGraph = saveGraph();
		mouseButtonPressed[0] = 0
	}
	addToUndo()
	openPng(nextact);
}
function invert(){
	addToUndo()
	dta = drawCtx.getImageData(0,0,size,size);
	for(j = 0;j<size*size*4;j+=4){
		dta.data[j] = !(dta.data[j]/255)*255
		dta.data[j+1] = !(dta.data[j+1]/255)*255
		dta.data[j+2] = !(dta.data[j+2]/255)*255
	} 
	drawCtx.putImageData(dta,0,0)
}
function addToUndo(){
	undobuffer.unshift(graphCtx.getImageData(0,0,256,64))
	if (undobuffer.length>undobufferMaxL){undobuffer.pop()}
	redobuffer = []
}
function undo(){
	redobuffer.push(undobuffer[0])
	if (undobuffer.length >1){
		undobuffer.shift()
		graphCtx.putImageData(undobuffer[0],0,0);
		drawCtx.drawImage(graphCanvas,curTileX,curTileY-128,size,size,0,0,size,size);
	}
}
function redo(){}

function redrawGraph(){
	graphCtx.fillStyle = color(0);
	graphCtx.fillRect(0, 0, 256, 64);
	for(i = 0;i<256;i++){
		//tile(i,i%32,16+Math.floor(i/32))
		graphCtx.drawImage(graph,15*8,i*8,8,8,(i%32)*8,Math.floor(i/32)*8,8,8);
	}
	drawCtx.drawImage(graphCanvas,curTileX,curTileY-128,size,size,0,0,size,size);
}

function drawHandle(){
	let x = Math.floor((mouseX-96)/(64/size)), 
		y = Math.floor((mouseY-32)/(64/size))
	let index = curTile*64 + x + y*8;
	if (mouseX > 96 && mouseX < 96+64 &&
	mouseY > 32 && mouseY < 32+64 && elClicked == 2){
		if (mouseButtonPressed[0] == 1){
			drawCtx.fillStyle = color(15);
			drawCtx.fillRect(x,y,1,1);
		}else if (mouseButtonPressed[0] == 2){
			drawCtx.fillStyle = color(0);
			drawCtx.fillRect(x,y,1,1);
		}
	}
	graphCtx.drawImage(drawCanvas,curTileX,curTileY-128);
}

var spredit = {
	init : function(){
		editPage.uninit()
		editPage = spredit
		graph = imgdataToImage(loadGraph(editGraph));
		//curTile = 0
		//tileCtx.fillStyle = color(0);
		//tileCtx.fillRect(96,32,64,64);
		//tileCtx.fillRect(0,128,256,64);
		drawCtx.fillStyle = color(0);
		drawCtx.fillRect(0, 0, 64, 64);
		
		for(i = 0;i<256;i++){
			tile(i,i%32,16+Math.floor(i/32))
		}
		drawCtx.drawImage(graphCanvas,curTileX,curTileY-128,size,size,0,0,size,size);
		
		let panl = {x:0, y:116};
		let panlFuncs = [
			importGraph,exportGraph,copy,paste,cut,clearTile,
			"","","","",
			undo,redo,chngSize,flipV,flipH,invert];
		let panlKeys = ['','','KeyC+Control','KeyV+Control','KeyX+Control','Delete',
		'KeyX+Control','KeyY+Control','KeyF','KeyH+Shift','KeyV+Shift','KeyI+Shift']
		let c = 0
		for(i=0;i<panlFuncs.length;i++){
			if(panlFuncs[i]!=""){
				buttons.push(new mButton(129+c,panl.x+16*i,panl.y,14,10,panlFuncs[i],panlKeys[c]));
				c+=1;
			}
		}
		//////////////////////////////
		mouseOnClick = function(e){
			for (const bttn of buttons){
				bttn.click(e.buttons)
			}
			if (e.buttons != 0){
				if(mouseY>128&&mouseY<192&&mouseX>0&&mouseX<256){
					elClicked = 1;
				}else if (mouseX>96&&mouseX<96+64&&mouseY>32&&mouseY<32+64){
					elClicked = 2;
				}else{elClicked = 0;}
			}
		}
		mouseOnUnclick = function(e){
			if (elClicked == 2){
				addToUndo()
			}
			elClicked == 0
		}
		keyDown = function(e){
			let sp = ""
			let hotkey = false
			//console.log(keysPressed)
			for (const bttn of buttons){
				sp = (bttn.key||'').split("+")
				hotkey = (keyPressed(sp[1]) || sp[1]==undefined)
				if(e.code==sp[0] && hotkey){bttn.onClick();}
			}
			switch(e.key){
				case "ArrowUp":
					curTileY = Math.max(curTileY-size,128);
					break;
				case "ArrowDown":
					curTileY = Math.min(curTileY+size,192-size);
					break;
				case "ArrowLeft":
					curTileX = Math.max(curTileX-size,0);
					break;
				case "ArrowRight":
					curTileX = Math.min(curTileX+size,256-size);
					break;
			}
			drawCtx.drawImage(graphCanvas,curTileX,curTileY-128,size,size,0,0,size,size)
			curTile = (curTileY-128)/8*32 + curTileX/8
		}
		addToUndo()
	},
	update : function(){
		curTileX = (curTile%32)*8;
		curTileY = 128+Math.floor(curTile/32)*8;
		text(curTile,128-(curTile.toString().length)*4,120,18);
			
		
		sprCtx.drawImage(drawCanvas,96,32,64,64);
		sprCtx.drawImage(graphCanvas,0,128);
		sprCtx.strokeStyle = color(9);
		sprCtx.lineWidth = 0.25;
		sprCtx.strokeRect(curTileX,curTileY,size,size);
		
		if (mouseButtonPressed[0]==1 && elClicked==1&&
			mouseY>128&&mouseY<192&&mouseX>0&&mouseX<256){
			curTile = (Math.min(Math.floor(mouseX/8),32-size/8) + 
			Math.min(Math.floor((mouseY-128)/8),8-size/8) * 32 );
			curTileX = (curTile%32)*8;
			curTileY = 128+Math.floor(curTile/32)*8;
			drawCtx.drawImage(graphCanvas,curTileX,curTileY-128,size,size,0,0,size,size)
		}
		drawHandle();
		if (mouseButtonPressed[0]==0){elClicked == 0}
		if(graphLoaded == true){
			redrawGraph();
			graphLoaded = false
			addToUndo()
		}
	},
	uninit : function(){
		editGraph = saveGraph();
		graph = imgdataToImage(loadGraph(editGraph));
		editPage = defPage;
		editPage.init()
	}
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// code editor vars and funcs

var codeLines = ['--game','--author','',
'function init()','  ','end','',
'function update()','  ','end','',
'function draw()','  ','end',''
]
var codeCurRow = 0
var codeCurLine = 0
var codeLastRow = 0
let lineXo = 0
let lineYo = 0
var codeLoaded = false
var codeSel = [0,0,0,0]
var codeClipb = []
var codeFont = font
var codeChW=8
var codeChH=8
var codeVLimit=mheight/codeChH-3

function codeSize1(){
	codeFont = font
	codeChW=8
	codeChH=8
	codeVLimit=mheight/codeChH-3
	codeRedraw()
}
function codeSize2(){
	codeFont = fontS
	codeChW=4
	codeChH=6
	codeVLimit=mheight/codeChH-3
	codeRedraw()
}


var keywords = ['and','break','do','else','elseif','end','false','for','function','if','in','local','nil','not','or','repeat','return','then','true','until','while']

String.prototype.replaceAt = function(index, replacement) {
    return this.substring(0, index) + replacement + this.substring(index + (replacement.length||1));
}
String.prototype.addAt = function(index, replacement) {
    return this.substring(0, index) + replacement + this.substring(index,this.length);
}
function splitMultiple(str, separators) {
  let replacedStr = str

	for (const separator of separators) {
		replacedStr = replacedStr.replaceAll(separator, '$'+separator+'$')
	}
	if(replacedStr[0]=='$'){
		replacedStr=replacedStr.substring(1,replacedStr.length)
	}
	if(replacedStr[replacedStr.length-1]=='$'){
		replacedStr=replacedStr.substring(0,replacedStr.length-1)
	}
  return replacedStr.split('$')
}

function codetext(txt,x,y,l){
	txt = txt.toString()
	let c = 15
	let sep = [' ','(',')','[',']',',',"=","+","-","*","/",":",".",">","<","~",'"','{','}']
	let txtspl = splitMultiple(txt, sep)
	let xo = 0;
	let s = false
	let comnt = false
	let strng = false
	let vardec = false
	//tileCtx.fillStyle = color(7);
	codeCtx.clearRect(0,Math.floor(y), 256, codeChH);
	for (i = 0; i<txtspl.length;i++){
		c=15
		
		let tp = txtspl[i]
		
		if(isNaN(tp.substring(0,1))==false){c = 11;}
		
		if(txtspl[i+1]=='('){c=13}
		for(h=0;h<keywords.length;h++){
			if(tp==keywords[h]){c = 14;break;}
		}
		if(tp=='\"'){strng = !strng;c=9}
		if(strng==true&&comnt==false){c=9}
		if(txtspl[i]=='-'&&txtspl[i+2]=='-'){comnt=true;c=2}
		if(comnt){c=2}
		
		for (j = 0; j<tp.length;j++){
			let spr = tp[j].charCodeAt() - 1
			codeCtx.drawImage(codeFont,c*8,spr*8,8,8,Math.floor(x)+xo*codeChW,Math.floor(y),8,8)
			xo += 1;
		}
	}
}
function codeRedraw(){
	codeCtx.clearRect(0,0, 256, 192);
	let l = Math.min(codeLines.length-lineYo,codeVLimit+1);
	for (n=lineYo;n<l+lineYo;n++){
		codetext(codeLines[n],0,8+(n-lineYo)*codeChH,256,n)
		//console.log(codeLines[n])
	}
}
function codeCopy(){
	let txt = ""
	let sel = codeSelT()
	//codeClipb = []
	if(sel[1]!=sel[3]){
		txt += codeLines[sel[1]].substring(sel[0],codeLines[sel[1]].length)+"\n"
		//codeClipb.push(codeLines[sel[1]].substring(sel[0],codeLines[sel[1]].length))
		for(i=sel[1]+1;i<sel[3];i++){
			txt += codeLines[i]+"\n"
			//codeClipb.push(codeLines[i])
		}
		txt += codeLines[sel[3]].substring(0,sel[2])
		//codeClipb.push(codeLines[sel[3]].substring(0,sel[2]))
	}else{
		sel[0]=Math.min(codeSel[0],codeSel[2])
		sel[2]=Math.max(codeSel[0],codeSel[2])
		txt += codeLines[sel[1]].substring(sel[0],sel[2])
		//codeClipb.push(codeLines[sel[1]].substring(sel[0],sel[2]))
	}
	navigator.clipboard.writeText(txt)
	//console.log(txt)
}
function codePaste(e){
	let clipb = e.clipboardData.getData("text")
	clipb = clipb.replaceAll("\r\n","\n")
	clipb = clipb.split("\n")
	//console.log(clipb)
	codeSelDel()
	if (clipb.length>1){
		let cl = codeLines[codeSel[1]]
		let nlsp = [cl.substring(0,codeSel[0]),cl.substring(codeSel[0],cl.length)]
		codeLines[codeSel[1]]=nlsp[0]+clipb[0]
		for(i=1;i<clipb.length;i++){
			codeLines.splice(codeSel[1]+i,0,clipb[i])
		}
		codeLines[codeSel[1]+clipb.length-1]=clipb[clipb.length-1]+nlsp[1]
		codeCurRow+=clipb[clipb.length-1].length
		codeCurLine+=clipb.length-1
		if(codeVLimit+lineYo<codeCurLine){lineYo=codeCurLine-codeVLimit;codeRedraw()}
		if(lineYo>codeCurLine&&codeCurLine>=0){lineYo=codeCurLine;codeRedraw()}
		codeRedraw()
	}else{
		codeLines[codeSel[1]]=codeLines[codeSel[1]].addAt(codeSel[0],clipb[0])
		codeCurRow+=clipb[0].length
	}
	
}
function codeSelT(){
	let sel = [0,0,0,0]
	if(codeSel[3]<codeSel[1]){
		sel[0]=codeSel[2]
		sel[1]=codeSel[3]
		sel[2]=codeSel[0]
		sel[3]=codeSel[1]
	}else{
		sel[0]=codeSel[0]
		sel[1]=codeSel[1]
		sel[2]=codeSel[2]
		sel[3]=codeSel[3]
	}
	if(sel[1]==sel[3]){
		sel[0]=Math.min(codeSel[0],codeSel[2])
		sel[2]=Math.max(codeSel[0],codeSel[2])
	}
	return sel
}
function codeSelDel(){
	let sel = codeSelT()
	if(sel[1]!=sel[3]){
		codeLines[sel[1]]=codeLines[sel[1]].substring(0,sel[0])+codeLines[sel[3]].substring(sel[2],codeLines[sel[3]].length)
		for(i=sel[1]+1;i<sel[3];i++){
			codeLines.splice(i,1)
			sel[3]-=1
			i-=1
		}
		codeLines.splice(sel[3],1)
		codeCurLine = sel[1]
		codeCurRow = sel[0]
		codeSel=[codeCurRow,codeCurLine,codeCurRow,codeCurLine]
		codeRedraw()
	}else{
		codeLines[sel[1]]=codeLines[sel[1]].substring(0,sel[0])+codeLines[sel[3]].substring(sel[2],codeLines[sel[3]].length)
		codeCurRow = sel[0]
		codeSel=[codeCurRow,codeCurLine,codeCurRow,codeCurLine]
	}
}




var codeedit = {
	init : function(){
		editPage.uninit()
		editPage = codeedit
		//clt(7)
		document.addEventListener("paste",codePaste)
		
		buttons.push(new mButton(64,192+32,184,8,8,codeSize1));
		buttons.push(new mButton(96,192+48,184,8,8,codeSize2));
		
		mouseOnClick = function(e){
			if(mouseY<192-8&&mouseY>8&&edMOpened==false){
				codeCurLine = Math.floor(mouseY/codeChH)+lineYo-1
				codeCurLine = Math.max(Math.min(codeCurLine,codeLines.length-1),0)
				codeCurRow = Math.round(mouseX/codeChW)
				codeCurRow = Math.max(Math.min(codeCurRow,codeLines[codeCurLine].length),0)
				codeLastRow = codeCurRow
				
				codeSel=[codeCurRow,codeCurLine,codeCurRow,codeCurLine]
				elClicked=1
				codeRedraw()
			}
			for (const bttn of buttons){
				bttn.click(e.buttons)
			}
		}
		mouseOnUnclick = function(e){elClicked=0}
		mouseOnWheel = function(e){
			const delta = Math.sign(e.deltaY)*3;
			lineYo = Math.min(Math.max(lineYo+delta,0),Math.max(codeLines.length-codeVLimit,0))
			codeRedraw()
		}
		
		keyDown = function (e){
			let cl = codeLines[codeCurLine]
			let nlsp = []
			if(e.key.length<=1&&e.key.charCodeAt()<128&&!e.ctrlKey){
				if(codeSel[2]!=codeSel[0]||codeSel[1]!=codeSel[3]){
					codeSelDel()
					cl = codeLines[codeCurLine]
				}
				codeLines[codeCurLine] = cl.addAt(codeCurRow,e.key);
				codeCurRow+=1
				codeLastRow = codeCurRow
				codeSel=[codeCurRow,codeCurLine,codeCurRow,codeCurLine]
			}
			for (const bttn of buttons){
				sp = (bttn.key||'').split("+")
				hotkey = (e.ctrlKey || e.shiftKey || e.altKey || keyPressed(sp[1])) || (sp[1]==undefined)
				if(e.key==sp[0] && hotkey){bttn.onClick();}
			}
			if (e.ctrlKey){
				switch(e.code){
					case "KeyD":
						e.preventDefault();
						e.stopPropagation();
						codeLines.splice(codeCurLine,0,codeLines[codeCurLine]);
						codeRedraw()
						break;
					case "Delete":
						codeLines[codeCurLine] = cl.substring(0,codeCurRow)
						break;
					case "KeyC":
						codeCopy()
						break;
					case "KeyX":
						codeCopy()
						codeSelDel()
						break;
				}
			}
			if(!e.shiftKey&&!e.ctrlKey&&!e.altKey){
				switch(e.key){
					case "Backspace":
						if(codeSel[2]!=codeSel[0]||codeSel[1]!=codeSel[3]){
							codeSelDel()
							cl = codeLines[codeCurLine]
						}else{nlsp = [cl.substring(0,codeCurRow),cl.substring(codeCurRow,cl.length)]
							if(codeCurRow == 0 && codeCurLine != 0){
								codeLines.splice(codeCurLine,1);
								codeCurLine-=1
								codeCurRow = codeLines[codeCurLine].length
								codeLines[codeCurLine] = codeLines[codeCurLine] + nlsp[1]
								codeRedraw()
							}else{
								codeLines[codeCurLine] = cl.replaceAt(codeCurRow-1,"");
								codeCurRow = Math.max(codeCurRow-1,0)
								codeLastRow = codeCurRow
							}
						}
						codeSel=[codeCurRow,codeCurLine,codeCurRow,codeCurLine]
						break;
					case "Enter":
						let offs = ""
						for(i=0;i<cl.length;i++){
							if(cl[i]==" "){offs+=" "}else{break}
						}
						nlsp = [cl.substring(0,codeCurRow),cl.substring(codeCurRow,cl.length)]
						codeLines.splice(codeCurLine+1,0,offs+nlsp[1])
						codeLines[codeCurLine] = nlsp[0]
						//codeRedraw()
						codeCurLine+=1
						codeCurRow = offs.length
						codeLastRow = offs.length
						codeRedraw()
						if(codeVLimit+lineYo<codeCurLine){lineYo=codeCurLine-codeVLimit;codeRedraw()}
						break;
					case "Home":
						codeCurRow = 0;
						codeLastRow = codeCurRow
						codeSel=[codeCurRow,codeCurLine,codeCurRow,codeCurLine]
						break;
					case "End":
						codeCurRow = cl.length;
						codeLastRow = codeCurRow
						codeSel=[codeCurRow,codeCurLine,codeCurRow,codeCurLine]
						break;
					case "ArrowUp":
						codetext(codeLines[codeCurLine],0,8+(codeCurLine-lineYo)*codeChH,256)
						codeCurLine = codeCurLine-1
						codeCurRow = codeLastRow
						if(codeVLimit+lineYo<codeCurLine){lineYo=codeCurLine-codeVLimit;codeRedraw()}
						if(lineYo>codeCurLine&&codeCurLine>=0){lineYo=codeCurLine;codeRedraw()}
						codeSel=[codeCurRow,codeCurLine,codeCurRow,codeCurLine]
						break;
					case "ArrowDown":
						codetext(codeLines[codeCurLine],0,8+(codeCurLine-lineYo)*codeChH,256)
						codeCurLine = codeCurLine+1
						codeCurRow = codeLastRow
						if(codeVLimit+lineYo<codeCurLine){lineYo=codeCurLine-codeVLimit;codeRedraw()}
						if(lineYo>codeCurLine&&codeCurLine>=0){lineYo=codeCurLine;codeRedraw()}
						codeSel=[codeCurRow,codeCurLine,codeCurRow,codeCurLine]
						break;
					case "ArrowRight":
						codeCurRow = codeCurRow+1
						codeLastRow = codeCurRow
						if (codeCurRow>cl.length&&codeCurLine!=codeLines.length-1){
							codetext(codeLines[codeCurLine-lineYo],0,8+codeCurLine*8,256)
							codeCurLine +=1
							codeCurRow = 0
							codeLastRow = codeCurRow
						}
						codeSel=[codeCurRow,codeCurLine,codeCurRow,codeCurLine]
						break;
					case "ArrowLeft":
						codeCurRow = codeCurRow-1
						codeLastRow = codeCurRow
						if (codeCurRow<0&&codeCurLine!=0){
							codetext(codeLines[codeCurLine],0,8+codeCurLine*8,256)
							codeCurLine -=1
							codeCurRow = codeLines[codeCurLine].length
							codeLastRow = codeCurRow
						}
						codeSel=[codeCurRow,codeCurLine,codeCurRow,codeCurLine]
						break;
				}
			}
			if(e.shiftKey){
				switch(e.key){
					case "Home":
						codeCurRow = 0;
						codeSel[2]=codeCurRow
						codeLastRow = codeCurRow
						break;
					case "End":
						codeCurRow = cl.length;
						codeSel[2]=codeCurRow
						codeLastRow = codeCurRow
						break;
					case "ArrowUp":
						codetext(codeLines[codeCurLine],0,8+(codeCurLine-lineYo)*codeChH,256)
						codeCurLine = codeCurLine-1
						codeCurRow = codeLastRow
						if(codeVLimit+lineYo<codeCurLine){lineYo=codeCurLine-codeVLimit;codeRedraw()}
						if(lineYo>codeCurLine&&codeCurLine>=0){lineYo=codeCurLine;codeRedraw()}
						codeSel[2]=codeCurRow
						codeSel[3]=codeCurLine
						break;
					case "ArrowDown":
						codetext(codeLines[codeCurLine],0,8+(codeCurLine-lineYo)*codeChH,256)
						codeCurLine = codeCurLine+1
						codeCurRow = codeLastRow
						if(codeVLimit+lineYo<codeCurLine){lineYo=codeCurLine-codeVLimit;codeRedraw()}
						if(lineYo>codeCurLine&&codeCurLine>=0){lineYo=codeCurLine;codeRedraw()}
						codeSel[2]=codeCurRow
						codeSel[3]=codeCurLine
						break;
					case "ArrowRight":
						codeCurRow = codeCurRow+1
						codeLastRow = codeCurRow
						if (codeCurRow>cl.length&&codeCurLine!=codeLines.length-1){
							codetext(codeLines[codeCurLine-lineYo],0,8+codeCurLine*8,256)
							codeCurLine +=1
							codeCurRow = 0
							codeLastRow = codeCurRow
						}
						codeSel[2]=codeCurRow
						codeSel[3]=codeCurLine
						break;
					case "ArrowLeft":
						codeCurRow = codeCurRow-1
						codeLastRow = codeCurRow
						if (codeCurRow<0&&codeCurLine!=0){
							codetext(codeLines[codeCurLine],0,8+codeCurLine*8,256)
							codeCurLine -=1
							codeCurRow = codeLines[codeCurLine].length
							codeLastRow = codeCurRow
						}
						codeSel[2]=codeCurRow
						codeSel[3]=codeCurLine
						break;
				}
			}
			//codeSel=[codeCurRow,codeCurLine,codeCurRow,codeCurLine]
		}
		codeSel=[codeCurRow,codeCurLine,codeCurRow,codeCurLine]
		setTimeout(() => {codeRedraw()}, 30);
	},
	update : function(){
		//if(codeCurRow<codeCurRow-lineXo){lineXo = }
		
		
		if (elClicked==1&&mouseButtonPressed[0]==1){
			codeCurLine = Math.floor(mouseY/codeChH)+lineYo-1
			codeCurLine = Math.min(codeCurLine,codeLines.length-1)
			codeCurLine = Math.max(codeCurLine,0)
			codeCurRow = Math.round(mouseX/codeChW)
			codeLastRow = codeCurRow
			if(codeVLimit+lineYo<codeCurLine){lineYo=codeCurLine-codeVLimit;codeRedraw()}
			if(lineYo>codeCurLine&&codeCurLine>=0){lineYo=codeCurLine;codeRedraw()}
			codeSel[3]=Math.max(Math.min(codeCurLine,codeLines.length-1),0)
			codeSel[2]=Math.max(Math.min(codeCurRow,codeLines[codeSel[3]].length),0)
		}
		
		let thingy = ((window.requestAnimationFrame(update)%60)>30)*16-1
		codeCurLine = Math.min(codeCurLine,codeLines.length-1)
		codeCurLine = Math.max(codeCurLine,0)
		codeCurRow = Math.max(codeCurRow,0)
		codeCurRow = Math.min(codeCurRow,codeLines[codeCurLine].length)
		
		let sel = codeSelT()
		
		codetext(codeLines[codeCurLine],0-lineXo*codeChW,8+(codeCurLine-lineYo)*codeChH,256)
		
		if(sel[1]!=sel[3]){
			for(l=0;l<=sel[3]-sel[1];l++){
				//let s = Math.sign(sel[3]-sel[1])
				if(l==0){
					recta(sel[0]*codeChW,
					8+(sel[1]+l-lineYo)*codeChH,
					(codeLines[sel[1]].length-sel[0])*codeChW,
					codeChH,12);
					
				}else if(l==sel[3]-sel[1]){
					recta(0,
					8+(sel[1]+l-lineYo)*codeChH,
					sel[2]*codeChW,
					codeChH,12); 
				}else{
					recta(0,
					8+(sel[1]+l-lineYo)*codeChH,
					codeLines[sel[1]+l].length*codeChW,
					codeChH,12);
				}
			}
		}else if(sel[1]==sel[3]&&sel[0]!=sel[2]){
			recta(sel[0]*codeChW,
			8+(sel[1]-lineYo)*codeChH,
			(sel[2]-sel[0])*codeChW,
			codeChH,12);
		}
		
		sprCtx.drawImage(codeLayer,0,0);
		recta(codeCurRow*codeChW-(lineXo*codeChW)-1,8+(codeCurLine-lineYo)*codeChH,2,codeChH,thingy);
		recta(0,184,256,8,8);
		text((codeCurLine+1) + ":" + (codeCurRow+1),0,184,18);
		//text(codeSel.concat(" "),0,184-8,18);
		lineXo = Math.max((codeCurRow-(256/codeChW)),0)
		
		if (lineXo>0){recta(0,8+codeCurLine*8,8,8,7);chr(59,0,8+(codeCurLine-lineYo)*codeChH,9);}
		//for(i=0;i<codeLines.length;i++){text(codeLines[i],0,8+i*8,256)};
		
		if (codeLoaded == false){codeLoaded = true;codeRedraw()}
	},
	uninit : function(){
		mouseOnWheel = function(e){}
		document.removeEventListener("paste",codePaste)
		editPage = defPage;
		editPage.init()
	},
}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//

var editMapTiles = new TileData(256,256)
var editMapColors = new TileData(256,256)
var editTiles = new TileData(32,8)
for(i=0;i<256;i++){editTiles.data[i]=i}
var levX=0
var levY=0
var levC1=15
var levC2=0
var levPx=0
var levPy=0
var levMpx=0
var levMpy=0
var levGridH=8
var levGridv=8
var levGc=[12,9,13]
var levTSel={x:0,y:0,x1:0,y1:0}
var levTSelA={x:0,y:0,x1:0,y1:0}
var levTSelD=new TileData(1,1,0)



function levPTile(spr,x,y,c = 15,b = 0){
	x=Math.floor(x)
	y=Math.floor(y)
	if(spr!=0){
		editMapTiles.set(spr,x,y)
		editMapColors.set(c*16+b,x,y)
		tileCtx.fillStyle = color(b);
		tileCtx.fillRect(x*8,y*8, 8, 8);
		tileCtx.drawImage(graph,c*8,spr*8,8,8,x*8,y*8,8,8);
	}else{
		editMapTiles.set(0,x,y)
		editMapColors.set(0,x,y)
		tileCtx.clearRect(x*8,y*8, 8, 8);
	}
}

function levPData(d,x,y,c1,c2,del=false){
	x=Math.floor(x)
	y=Math.floor(y)
	for(i=0;i<d.data.length;i++){
		levPTile(d.data[i]*!del,x+i%d.width,y+Math.floor(i/d.width),c1*!del,c2*!del)
	}
}

function levMapRedraw(){
	tileCtx.clearRect(0,0,2048,2048);
	for(i=0;i<256*256;i++){
		let x=i%256
		let y=i/256|0
		let spr=editMapTiles.get(x,y)
		let c=editMapColors.get(x,y)/16|0
		let b=editMapColors.get(x,y)%16
		if (spr!=0){
			tileCtx.fillStyle = color(b);
			tileCtx.fillRect(Math.floor(x)*8,Math.floor(y)*8, 8, 8);
			tileCtx.drawImage(graph,c*8,spr*8,8,8,Math.floor(x)*8,Math.floor(y)*8,8,8);
		}
	}
}

function levMapFin(){
	mapTiles.set(editMapTiles,0,0)
	mapColors.set(editMapColors,0,0)
}

var levedit={
	init : function(){
		editPage.uninit()
		editPage = levedit
		
		setTimeout(() => {levMapRedraw()}, 30);
		
		mouseOnClick = function(e){
			for (const bttn of buttons){
				bttn.click(e.buttons)
			}
			if (e.buttons != 0 && edMOpened==false){
				if(mouseY>8&&mouseY<112&&mouseX>0&&mouseX<256){
					elClicked = 1;
					levMpx=mouseX
					levMpy=mouseY
					levPx=levX
					levPy=levY
				}else if (mouseY>120&&mouseY<192-8&&mouseX>0&&mouseX<256){
					elClicked = 2;
					curTile = (Math.min(Math.floor(mouseX/8),32-size/8) + 
					Math.min(Math.floor((mouseY-120)/8),8-size/8) * 32 );
					curTileX = (curTile%32)*8;
					curTileY = 128+Math.floor(curTile/32)*8;
					levTSel={x:curTileX/8,y:curTileY/8-16,x1:curTileX/8,y1:curTileY/8-16}
				}else{elClicked = 0;}
			}
			if(mouseY>112&&mouseY<116&&mouseX>192&&mouseX<256){
				levC1=Math.floor((mouseX-192)/4)
			}else if(mouseY>116&&mouseY<120&&mouseX>192&&mouseX<256){
				levC2=Math.floor((mouseX-192)/4)
			}
		}
		mouseOnUnclick = function(e){
			if (elClicked == 2){
				levTSelD = new TileData(
					levTSelA.x1-levTSelA.x+1,
					levTSelA.y1-levTSelA.y+1
				)
				levTSelD.set(editTiles.get(levTSelA.x,levTSelA.y,
					levTSelA.x1-levTSelA.x+1,
					levTSelA.y1-levTSelA.y+1
				),0,0)
			}
			elClicked == 0
		}
	},
	update : function(){
		
		//recta(0,0,256,192,0);
		map(0-levX%8,8-levY%8,levX/8,levY/8,33,16)
		
		if(keyPressed("Control")){
			levGridH=8
			levGridV=8
		}else{
			levGridH=levTSelD.width*8
			levGridV=levTSelD.height*8
		}
		recta(0-(levX%128),0-(levY%96)+8,129,97,-1,levGc[0]);
		recta(0-(levX%128)+128,0-(levY%96)+8,129,97,-1,levGc[0]);
		recta(0-(levX%128)+256,0-(levY%96)+8,129,97,-1,levGc[0]);
		recta(0-(levX%128),0-(levY%96)+8+96,129,97,-1,levGc[0]);
		recta(0-(levX%128)+128,0-(levY%96)+8+96,129,97,-1,levGc[0]);
		recta(0-(levX%128)+256,0-(levY%96)+8+96,129,97,-1,levGc[0]);
		
		recta(
		(((mouseX+levX%levGridH)/levGridH)|0)*levGridH-levX%levGridH,
		(((mouseY-8+levY%levGridV)/levGridV)|0)*levGridV+8-levY%levGridV,
		levTSelD.width*8,levTSelD.height*8,-1,9
		);
		
		sprCtx.drawImage(graphCanvas,0,120);
		recta(0,112,256,8,8);
		recta(0,192-8,256,8,8);
		
		for(i=0;i<16;i++){
			recta(192+i*4,112,4,8,i)
		}
		recta(192+levC1*4,112,4,4,-1,15-levC1);
		recta(192+levC2*4,116,4,4,-1,15-levC2);
		
		sprCtx.strokeStyle = color(9);
		sprCtx.lineWidth = 0.25;
		levTSelA = {
			x:Math.min(levTSel.x,levTSel.x1),y:Math.min(levTSel.y,levTSel.y1),
			x1:Math.max(levTSel.x,levTSel.x1),y1:Math.max(levTSel.y,levTSel.y1)
			}
		levTSelA.x=Math.max(levTSelA.x,0)
		levTSelA.y=Math.max(levTSelA.y,0)
		levTSelA.x1=Math.min(levTSelA.x1,32)
		levTSelA.y1=Math.min(levTSelA.y1,7)
		recta(levTSelA.x*8,120+levTSelA.y*8,(levTSelA.x1-levTSelA.x+1)*8,(levTSelA.y1-levTSelA.y+1)*8,-1,9);
		chr(87,0,15*8,9)
		
		
		text(Math.floor(levX/8)+":"+Math.floor(levY/8)+" "+
		Math.max(Math.floor((levX+mouseX)/8),0)+":"+
		Math.max(Math.floor((levY+mouseY-8)/8),0),
		0,192-8)
		
		if (mouseButtonPressed[0]==1 && elClicked == 1){
			levPData(levTSelD,
			(((mouseX+levX)/levGridH)|0)*levGridH/8,
			(((mouseY+levY-8)/levGridV)|0)*levGridV/8,
			levC1,levC2)
		}else if(mouseButtonPressed[0]==2 && elClicked == 1){
			levPData(levTSelD,
			(((mouseX+levX)/levGridH)|0)*levGridH/8,
			(((mouseY+levY-8)/levGridV)|0)*levGridV/8,
			levC1,levC2,true)
		}else if(mouseButtonPressed[0]==4 && elClicked == 1){
			levX=levPx+(levMpx-mouseX)
			levY=levPy+(levMpy-mouseY)
			levX=Math.min(Math.max(0,levX),2048-256)
			levY=Math.min(Math.max(0,levY),2048-192)
		}else if (mouseButtonPressed[0]==1 && elClicked==2){
			levTSel.x1=Math.floor(mouseX/8)
			levTSel.y1=Math.floor((mouseY-120)/8)
		}
	},
	uninit : function(){
		levMapFin()
		editPage = defPage;
		editPage.init()
	}
}


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//  init update and draw
editPage = defPage
editPage.init();
editPage = codeedit
codeCurLine = codeLines.length-1
codeCurRow = codeLines[codeCurLine].length

function init(){
	graph = imgdataToImage(loadGraph(editGraph));
	font = imgdataToImage(loadGraph(stdfont));
	//clt(7)
	
	mouseOnClick = function(e){
		for (const bttn of buttons){
			bttn.click(e.buttons)
		}
	}
	editPage.init();
}
function update(){
	
}
function edtDefDraw(){
	cls(7)
	
	editPage.update()
	recta(0,0,256,8,8);
	recta(1,0,6,1,9);
	recta(1,3,6,1,10);
	recta(1,6,6,1,12);
	text(" Mono 129",0,0,18);
	for (const bttn of buttons){
		bttn.draw()
	};
	if(notif[1]>0){
		recta(0,8,256,Math.ceil(notif[0].length/32)*8,notif[2]);
		text(notif[0],0,8)
		notif[1]-=1
	}
	if(edMOpened==true&&mouseButtonPressed[0]==1&&(mouseX>8||mouseY>8)){
		editrMenu()
	}
	mouseXp = mouseX;
	mouseYp = mouseY;
	//drawLine(sprLayer,0,0,256,256,9,1)
	//text("Quick brown fox jumps over a lazy dog #n * #1 Lorem #2 ipsum #3 dolor #4 sit #5 amet, #6 consectetur #8 adipiscing #9 elit, #10 sed #11 do #12 eiusmod #13 tempor #14 incididunt #15 ut #0 labore #1 et #2 dolore #3 magna #4 aliqua.",0,16,32);
	//text(fps,0,16,32)
	//chr(128,mouseX,mouseY,10);
}
draw=edtDefDraw