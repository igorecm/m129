/////////////////////////////////////////////
// the m129 editor code by igorecm (2024)  //
/////////////////////////////////////////////


function clamp(min,val,max){
	return Math.min(Math.max(val,min),max)
};

window.mobileAndTabletCheck = function() {
	let check = false;
	(function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
	return check;
};





/* mycompress={
	compress:function(u8a){
		var canvas = document.createElement('canvas');
		var ctx = canvas.getContext('2d');
		canvas.width = Math.ceil(u8a.length/4);
		canvas.height = 1;
		
		let imagedata=ctx.getImageData(0,0,canvas.width,1)
		u8a.forEach((p,i)=>{imagedata.data[i]=p})
		
		ctx.putImageData(imagedata, 0, 0);
		
		return canvas.toDataURL();
	},
	decompress:function(url){
		return new Promise((resolve,reject)=>{
			var image = new Image();
			image.onload=function(){
				var canvas = document.createElement('canvas');
				var ctx = canvas.getContext('2d',{ willReadFrequently:true});
				canvas.width = image.width;
				canvas.height = image.height;
				ctx.drawImage(image, 0, 0);
				var u8a=Uint8Array.from(ctx.getImageData(0,0,canvas.width,canvas.height).data)
				resolve(u8a)
			};
			if(url!=0){
				image.src = url
			}else{
				resolve(0)
			}
		})
	},
} */
const m129game=function(v){
	this.mono129=v
	this.title='game';
	this.author='author';
	this.width=256;
	this.height=192;
	this.palette=[];
	this.chrW=8;
	this.chrH=8;
	this.lua='';
	this.spr='';
	this.sprflags='';
	this.map=[];
};

function TileData(w,h,d=0) {
	this.width = w;
	this.height = h;
	this.data = new Uint8Array(w*h);
	this.data.fill(d);
	this.maxX=0
	this.maxY=0
}
TileData.prototype={
	set: function(td,dx,dy){
		if (td.data!=undefined){
			let index=0
			for(y=dy;y<Math.min(dy+td.height,this.height);y++){
				for(x=dx;x<Math.min(dx+td.width,this.width);x++){
					this.data[x+y*this.width]=td.data[index]
					index+=1
				}
			}
		}else{
			this.data[dx+dy*this.width]=td
		}
	},
	get: function(dx,dy,w,h){
		if(w!=undefined && h!=undefined){
			let index=0
			let o = new TileData(w,h)
			for(y=dy;y<Math.min(dy+h,this.height);y++){
				for(x=dx;x<Math.min(dx+w,this.width);x++){
					o.data[index]=this.data[x+y*this.width]
					index+=1
				}
			}
			return o
		}else{
			return this.data[dx+dy*this.width]||0
		}
	},
	calcMax:function(){
		let mx=0
		let my=0
		for(y=0;y<this.height;y++){
			for(x=0;x<this.width;x++){
				let a=this.data[x+y*this.width]
				if(a>0&&x>mx){mx=x}
				if(a>0&&y>my){my=y}
			}
		}
		this.maxX=mx
		this.maxY=my
		return {x:mx,y:my}
	},
	toString: function(){
		let str=""
		for (i=0;i<this.data.length;i++){
			if ((i%this.w)==0){str+="\n"}
			str+=String("000").substring(0,this.data[i].toString().length+1)+this.data[i]+" "
		}
		return str
	},
}

/////////////////////////////////////////////////////////////
//    BEHOLD!!!!!!! THE M129EDITOR CLASS IN IT'S GLORY     //
/////////////////////////////////////////////////////////////

const m129Editor = function(){
	//some cool functions are needed
	
	function Base64ToUint8(a){
		return new Uint8Array(atob(a).split(",").map(function(c) {return parseInt(c) }));
	};
	function imgPromise(data){
		return new Promise((resolve,reject)=>{
			let a=new Image
			a.onload=resolve(a)
			a.src=data;
		})
	}
	function hexToRgb(hex) {
		var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
		hex = hex.replace(shorthandRegex, function(m, r, g, b) {
			return r + r + g + g + b + b;
		});
		var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		return result ? [
			parseInt(result[1], 16),
			parseInt(result[2], 16),
			parseInt(result[3], 16)
		] : null;
	};
	this.respondToVisibility = function(element, callback) {
		var options = {
			root: document.documentElement,
		};
		var observer = new IntersectionObserver((entries, observer) => {
			entries.forEach(entry => {
				callback(entry.intersectionRatio > 0);
			});
		}, options);
		observer.observe(element);
	};

	function imgdataToImage(imagedata) {
		return new Promise((resolve,reject)=>{
			var canvas = document.createElement('canvas');
			var ctx = canvas.getContext('2d',{ willReadFrequently:true});
			canvas.width = imagedata.width;
			canvas.height = imagedata.height;
			ctx.putImageData(imagedata, 0, 0);
			

			var image = new Image();
			image.onload=resolve(image);
			image.src = canvas.toDataURL();
		})
	};
	function imgdataToURL(imagedata) {
		var canvas = document.createElement('canvas');
		var ctx = canvas.getContext('2d',{ willReadFrequently:true});
		canvas.width = imagedata.width;
		canvas.height = imagedata.height;
		ctx.putImageData(imagedata, 0, 0);
		return canvas.toDataURL();
	};
	
	graphToUint8=function(idata){
		let v="";
		let canvas=document.createElement('canvas');
		let ctx=canvas.getContext('2d',{willReadFrequently:true});
		canvas.width=idata.width
		canvas.height=idata.height
		ctx.putImageData(idata,0,0)
		let data;
		let w=canvas.width/8;
		let h=canvas.height/8;
		let arr = new Uint8Array(w*h*8);
		let indx = 0
		for(y=0;y<h;y++){
			for(x=0;x<w;x++){
				data = ctx.getImageData(x*8,y*8,8,8)
				for(p=0;p<data.data.length;p+=4){
					v+=String(Math.floor(data.data[p]/255))
					if(v.length==8){
						arr[indx]=parseInt(v,2);
						indx+=1
						v=''
					}
				};
			};
		};
		return arr
	};
	function Uint8ToGraph(idata,w,pal=[[255,255,255]],tbkg=false,vert=false){
		let odata
		function ptoi(x,y){return (x+y*odata.width)*4}
		if(typeof(pal[0])=='string'){pal=pal.map(hexToRgb)}
		if(idata){
			let idatasize = idata.length/8
			let h = idatasize/w
			if(!vert){
				odata = new ImageData((w*8)*pal.length,h*8)
			}else{
				odata = new ImageData(w*8,(h*8)*pal.length)
			}
			for(let i=0;i<idatasize;i++){
				let tx=i%w
				let ty=i/w|0
				for(let y=0;y<8;y++){
					let lin=idata[i*8+y].toString(2)
					lin=(String("00000000").slice(0,8-lin.length)+lin).split('').map(function(a){return parseInt(a)})
					for(let x=0;x<8;x++){
						for(let p=0;p<pal.length;p++){
							let index
							if(!vert){
								index=ptoi(tx*8+x+p*w*8,ty*8+y)
							}else{
								index=ptoi(tx*8+x,ty*8+y+p*h*8)
							}
							odata.data[index]=lin[x]*pal[p][0];
							odata.data[index+1]=lin[x]*pal[p][1];
							odata.data[index+2]=lin[x]*pal[p][2];
							odata.data[index+3]=(lin[x]||!tbkg)*255;
						}
					}
				}
			}
		}else{
			odata = new ImageData(8,8)
		}
		
		return odata
	};
	
	
	function isImgDataBlank(img) {
		var pixelBuffer = new Uint32Array(img.data.buffer); 
		return pixelBuffer.some(color => color!==4278190080);
	}

	function getMousePos(element,e){
		const rect = element.getBoundingClientRect();
		let X = (e.clientX-rect.left);
		let Y = (e.clientY-rect.top);
		return {x:X,y:Y}
	};
	function download(filename,data) {
		let alink = document.createElement('a');
		alink.href=data;
		alink.download=filename;
		alink.click();
	};
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
	function rgbToHex(r, g, b) {
		return "#" + (1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1);
	}
	
	
	drawGrid=function(canvas,X,Y,cellWidth,cellHeight,lineWidth,strokeColor) {
		if (!canvas.getContext) {
			return;
		}
		
		const ctx = canvas.getContext('2d');
		const width = canvas.width;
		const height = canvas.height;
		
		ctx.fillStyle = strokeColor;
		
		for (let x = X; x <= width; x += cellWidth) {
			ctx.fillRect(x+X,0,lineWidth,height)
		}
		
		for (let y = Y; y <= height; y += cellHeight) {
			ctx.fillRect(0,y+Y,width,lineWidth)
		}
	};
	
	openPng=function(nextact = function(f){}) {
		let input = document.createElement('input');
		input.type = 'file';
		input.accept = ".png";

		input.addEventListener('change', (e) => {
			const reader = new FileReader();
			file = e.target.files[0];
			reader.onload=function(){
				let img = new Image
				img.onload = () => {
					nextact(img)
				}
				img.src = reader.result
			}
			reader.readAsDataURL(file)
		});
		input.click();
	};
	
	//and here goes the actual m129 editor related stuff
	
	this.version='DEV_0.0.1.'
	this.game=new m129game(this.version)
	
	this.keysPressed={};
	this.onKeyDown=function(e){this.keysPressed[e.key]=true};
	this.onKeyUp=function(e){delete this.keysPressed[e.key]};
	
	this.defW=640;
	this.defH=400;
	this.isMobile=false;
	this.hasChanged=false;
	this.currentPage='about';
	
	this.debug=true;
	this.debugOut=function(...args){
		if (this.debug){console.log(...args)};
	};
	
	this.changePage=function(p){
		let nopage=true;
		let eddiv=document.getElementById('editor').children;
		for (i=2;i<eddiv.length;i++){
			if (eddiv[i].id.split('-')[1]==p){
				eddiv[i].hidden=false;
				nopage=false;
				this.currentPage=p;
			}else{
				eddiv[i].hidden=true;
			}
		};
		if (nopage){
			document.getElementById('editor-nopage').hidden=false;
			this.currentPage='nopage';
		};
	};
	this.compileGame=function(nextact=function(t){}){
		this.game.lua=this.code.editor.getValue()
		this.game.sprflags=this.spr.flags
		this.game.palette=this.spr.pal.slice(0,this.spr.palsize)
		this.game.spr=[]
		
		this.map.mapTiles.calcMax()
		let tm=this.map.mapTiles.get(0,0,this.map.mapTiles.maxX+1,this.map.mapTiles.maxY+1)
		let tmc=this.map.mapColors.get(0,0,tm.width,tm.height)
		
		for(let i=0;i<tmc.data.length;i++){
			tmc.data[i]=Math.min(tmc.data[i]/16|0,this.spr.palsize-1)*16+Math.min(tmc.data[i]%16,this.spr.palsize-1)
		}
		
		this.game.map={
			w:tm.width,
			h:tm.height,
			t:btoa(pako.deflate(tm.data)),
			c:btoa(pako.deflate(tmc.data)),
		}
		
		
		let t=this
		
		for(let i=0;i<4;i++){
			let img=this.spr.graph.ctx.getImageData(0,i*64,256,64)
			if (isImgDataBlank(img)){ 
				this.game.spr[i]=btoa(pako.deflate(graphToUint8(img)))
				console.log(`compiled spr bank ${i}, size: ${this.game.spr[i].length} bytes`)
			}else{
				this.game.spr[i]=0
			}
		}
		nextact(t)
	};
	this.playGame=function(){
		let r = document.querySelector(':root')
		let W=r.style.getPropertyValue('--editorWidth')
		let H=r.style.getPropertyValue('--editorHeight')
		
		this.compileGame(function(t){
			mono=new m129("m129",t.game)
			//let div=document.getElementById("editor-play-zone")
			let scaleX = W/ t.game.width;
			let scaleY = H / t.game.height;
			let scaleAmount = Math.max(Math.floor(Math.min(scaleX, scaleY)),1);
			mono.scale='auto' //String(scaleAmount)
			mono.init()
		})
	}
	this.stopGame=function(){
		mono.uninit()
	}
	
	this.save=function(){
		this.compileGame(function(t){
			t.game.lua=JSON.stringify(t.game.lua)
			let a = JSON.stringify(t.game);
			let b = "data:text/plain;charset=utf-8,"+encodeURIComponent(a)
			let n = t.game.title+Date.now()
			download(n+".json",b)
		})
	}
	this.load=function(){
		let paramsToSet=[
			"title",
			"author",
			"width",
			"height",
			"chrW",
			"chrH",
		]
		let t=this
		openTextFile(".json",function(f){
			let g=JSON.parse(f)
			if(g.mono129){
				t.game=g;
				t.spr.flags=parseInt(t.game.sprflags)||new Array(256).fill(0);
				t.spr.flagsDisp(t.spr.selSpr)
				t.code.editor.session.setValue(JSON.parse(t.game.lua),-1);
				t.code.editor.moveCursorTo(0,0)
				for (let i=0;i<16;i++){
					t.spr.pal[i]=t.game.palette[i]||"#000000"
				}
				t.spr.palsize=t.game.palette.length
				
				t.palCreate(t.spr.palsize,t.spr.pal)
				document.getElementById("palSize").value=t.spr.palsize
				paramsToSet.forEach(function(v){
					document.getElementById(v).value=t.game[v]
				})
				
				for (let i=0;i<4;i++){
					t.spr.graph.ctx.fillStyle='#000'
					t.spr.graph.ctx.fillRect(0,i*64,256,64)
					if(t.game.spr[i]){
						t.spr.graph.ctx.putImageData(Uint8ToGraph(pako.inflate(Base64ToUint8(t.game.spr[i])),32),0,i*64)
					}
				}
				
				t.map.mapTiles = new TileData(256,128)
				t.map.mapColors = new TileData(256,128)
				
				let d
				
				if(g.map.t){
					d=new TileData(g.map.w,g.map.h)
					d.data=pako.inflate(Base64ToUint8(g.map.t))
					t.map.mapTiles.set(d,0,0)
					if(g.map.c){
						d.data=pako.inflate(Base64ToUint8(g.map.c))
						t.map.mapColors.set(d,0,0)
					}
				}
				
				t.map.mapRedraw(0,0,g.map.w,g.map.h)
				
				
				t.spr.redraw();
				t.spr.undoBuffer=[];
				t.spr.undoAdd();
				
				t.changePage("params")
			}
		})
	}
	
	this.palCreate=function(s,pal){
		let t=this
		let div=document.getElementById("editor-palette")
		div.innerHTML=''
		for(let i=0;i<s;i++){
			let a=document.createElement("input");
			a.id="color"+i;
			a.type="color";
			a.value=pal[i];
			a.onchange=function(){
				t.spr.pal[i]=this.value
			}
			div.appendChild(a)
		}
	}
	
	this.palLoad=function(){
		let t=this
		openPng(function(f){
			let canvas = document.createElement('canvas');
			let ctx = canvas.getContext('2d');
			let carr=[]
			canvas.width = 16;
			canvas.height = 1;
			ctx.drawImage(f,0,0)
			let d=ctx.getImageData(0,0,canvas.width,canvas.height)
			for (p=0;p<d.data.length;p+=4){
				let c=rgbToHex(d.data[p],d.data[p+1],d.data[p+2])
				carr.push(c)
				if(carr.length==t.spr.palSize){break}
			}
			if (carr.length<16){
				for(i=0;i>16-carr.length;i++){
					carr.push("#000000")
				}
			}
			t.spr.pal=carr.map((x)=>x);
			t.palCreate(t.spr.palsize,t.spr.pal)
		})
	}
	this.palSave=function(){
		let t=this
		let canvas = document.createElement('canvas');
		let ctx = canvas.getContext('2d');
		canvas.width=this.spr.palsize
		canvas.height=1
		for(i=0;i<this.spr.palsize;i++){
			ctx.fillStyle=this.spr.pal[i]
			ctx.fillRect(i,0,1,1)
		}
		download(this.game.title+"_palette"+
		Date.now()+".png",canvas.toDataURL("image/png"));
	}
	
	this.spr={
		parent : undefined,
		draw : {
			canvas:document.getElementById('sprdraw'),
			ctx:document.getElementById('sprdraw').getContext('2d'),
			click:0,
		},
		sel : {
			canvas:document.getElementById('sprsel'),
			ctx:document.getElementById('sprsel').getContext('2d'),
			click:0,
		},
		defFont : 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAABAAQMAAADPkzv9AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAGUExURQAAAP///6XZn90AAAAJcEhZcwAADsEAAA7BAbiRa+0AAAHlSURBVEjH7VKxauQwEB1IkUaElCpMvmGKK1ws9y3DEkSKKVyZKfQh9yFXXqFK1ZBySbEEV65CcHW4EMqNvOZCiuN+YJ/BkkZPo3lvBFfsQGaEnjxtqxtBka70RQTAA9lfmGNmQgxohFtdVA+JVNXOAmoj1KR9In9ohLszOsdrcqqIVLxrNBY/AvmPAgW6gn2vbvUSERM43wjV4Rn2DP0bkqtOUe2sZWgx4DUotBoGwMG21PKTehysBtiuwDxCU2GBSUoRJ0IyIJoK/KLYOOnr0hCxHEqtB5WHecnZDLBPNWetkuQeIEsIfDwGRRfofeagQX9uBKXJ9wCvGlJ4ekpGYKq/sxEmqzOz/qDBcyPEFERSQSd0es1RY2+EUy9Ivc9GKFuGZ5PHx/yc6SydESrjkTqzCZK2GshqsEm2pgjbVN4zZrprBNGmYvmuInM1FUs3ixTMWarcyn9ewg3Ah7k3QQc9TOinYd+4vwydn8ZmL4EDbrb99XUf0VsTwfpq3tPIgwR8W+U8vsS4GVXw0ksXNNozGtEzVjUfOe1GtbtbM0LSQhrQC542gmxG2Yu6ZLCQJoqhZbAGxEjum0rl+LgTxl8yyuJmeZklq5BbVj8iZ1dMxafkFeAicnn4jFxxxRVX/BsAfwB1nR6wn0gNxwAAAABJRU5ErkJggg==',
		pal:[
			'#000000',
			'#7f0000',
			'#007f00',
			'#7f7f00',
			'#00007f',
			'#7f007f',
			'#007f7f',
			'#7f7f7f',
			'#080808',
			'#ff0000',
			'#00ff00',
			'#ffff00',
			'#0000ff',
			'#ff00ff',
			'#00ffff',
			'#ffffff',
		],
		palsize:16,

		graph : {},
		copyBuffer : undefined,
		undoBuffer : [],
		redoBuffer : [],
		flags : new Array(256).fill(0),
		
		drawSize:1,
		selSize:8,
		selPos:{x:0,y:0},
		selSpr:0,
		selBank:0,
		bankChanged:[false,false,false,false],

		dragImg:undefined,
		dragStart:{x:0,y:0},
		
		redraw : function (){
			this.sel.ctx.drawImage(this.graph.canvas,0,this.selBank,256,64,0,0,512,128);
			this.draw.ctx.drawImage(this.graph.canvas,
			this.selPos.x*8,this.selPos.y*8+this.selBank,
			this.selSize,this.selSize,0,0,128,128);
			this.sel.ctx.strokeStyle = '#ff00007f';
			this.sel.ctx.lineWidth = 2;
			this.sel.ctx.strokeRect(this.selPos.x*16+1,this.selPos.y*16+1,
			this.selSize*2-2,this.selSize*2-2);
			drawGrid(
				this.draw.canvas, 0, 0,
				128*(8/this.selSize),128*(8/this.selSize),
				2,"#2828287f"
			);
			
		},
		
		imgdataToImage : function(imagedata) {
			let canvas = document.createElement('canvas');
			let ctx = canvas.getContext('2d');
			canvas.width = imagedata.width;
			canvas.height = imagedata.height;
			ctx.putImageData(imagedata, 0, 0);

			let image = new Image();
			image.src = canvas.toDataURL();
			return image;
		},
		importPng : function (){
			let p = this;
			let b = this.selBank;
			let nextact = function (f,p,b){
				p.undoAdd();
				p.graph.ctx.fillStyle='#000';
				p.graph.ctx.fillRect(0,b,256,64);
				p.graph.ctx.drawImage(f,0,b);
				let px = p.graph.ctx.getImageData(0,b,256,64);
				for(i=0;i<256*64*4;i+=4){
					let lightness = parseInt((px.data[i] + px.data[i+1] + px.data[i+2]) / 3);
					px.data[i] = Math.round(lightness/255)*255;
					px.data[i+1] = Math.round(lightness/255)*255;
					px.data[i+2] = Math.round(lightness/255)*255;
					px.data[i+3] = 255;
				}
				p.graph.ctx.putImageData(px,0,b);
				p.redraw();
			}
			openPng((f)=>{nextact(f,p,b)});
		},
		exportPng : function (){
			download(this.parent.game.title+
			Date.now()+".png",this.graph.canvas.toDataURL("image/png"));
		},
		
		placeholder : function (){
			
		},
		
		clear : function (){
			this.graph.ctx.fillStyle = 'black';
			this.graph.ctx.fillRect(this.selPos.x*8, this.selPos.y*8+this.selBank, this.selSize, this.selSize);
			this.redraw();
			this.undoAdd();
		},
		zoom : function (){
			this.selSize=8+8*((this.selSize/8)%3);
			this.selSet(this.selPos.x,this.selPos.y);
			this.flagsDisp(this.selSpr)
			this.redraw();
		},
		zoomSlider : function (v){
			this.selSize=v;
			this.selSet(this.selPos.x,this.selPos.y);
			this.flagsDisp(this.selSpr)
			this.redraw();
		},
		copy : function (){
			this.copyBuffer = this.graph.ctx.getImageData(this.selPos.x*8,
			this.selPos.y*8+this.selBank,this.selSize,this.selSize);
		},
		paste : function (){
			if(this.copyBuffer!=undefined){
				this.graph.ctx.putImageData(this.copyBuffer,this.selPos.x*8,this.selPos.y*8+this.selBank);
				this.redraw();
				this.undoAdd();
			}
		},
		cut : function (){
			this.copy();
			this.clear();
		},
		flip : async function (coef){
			let data=await createImageBitmap(this.draw.canvas);
			let b1=((coef+1)/2)
			let b2=((-coef+1)/2)
			this.graph.ctx.scale(-1*coef,coef);
			this.graph.ctx.drawImage(
				data,
				this.selPos.x*-8*coef-this.selSize*b1,
				this.selPos.y*8*coef-this.selSize*b2+this.selBank*b1-this.selBank*b2,  //i want to die
				this.selSize,this.selSize
			)
			this.graph.ctx.setTransform(1,0,0,1,0,0);
			this.redraw();
			this.undoAdd();
		},
		invert : function (){
			let dta = this.graph.ctx.getImageData(this.selPos.x*8,
			this.selPos.y*8+this.selBank,this.selSize,this.selSize);
			for(j = 0;j<this.selSize*this.selSize*4;j+=4){
				dta.data[j] = !(dta.data[j]/255)*255
				dta.data[j+1] = !(dta.data[j+1]/255)*255
				dta.data[j+2] = !(dta.data[j+2]/255)*255
			} 
			this.graph.ctx.putImageData(dta,this.selPos.x*8,this.selPos.y*8+this.selBank);
			this.redraw();
			this.undoAdd();
		},
		undo : function (){
			if (this.undoBuffer.length>1){
				this.redoBuffer.unshift(this.undoBuffer[0].map((x) => x))
				this.undoBuffer.shift()
				this.graph.ctx.putImageData(this.undoBuffer[0][0],0,0);
				this.flags=this.undoBuffer[0][1];
				this.redraw();
				this.flagsDisp(this.selSpr)
			}
		},
		redo : function (){
			if (this.redoBuffer.length>0){
				this.graph.ctx.putImageData(this.redoBuffer[0][0],0,0);
				this.flags=this.redoBuffer[0][1];
				this.redoBuffer.shift()
				this.redraw();
				this.flagsDisp(this.selSpr);
				this.undoBuffer.unshift([this.graph.ctx.getImageData(0,0,256,256),this.flags.map((x) => x)]);
			}
		},
		undoAdd : function (){
			this.undoBuffer.unshift([this.graph.ctx.getImageData(0,0,256,256),this.flags.map((x) => x)]);
			if (this.undoBuffer.length>15){this.undoBuffer.pop()};
			this.redoBuffer=[];
		},
		
		drawSetP : function(X,Y,c){
			let s=16*(8/this.selSize)
			let o=Math.floor((this.drawSize-0.5)/2)
			X=(X/s|0)+this.selPos.x*8;
			Y=(Y/s|0)+this.selPos.y*8;
			X=clamp(this.selPos.x*8+o,X,this.selPos.x*8+this.selSize-o*2)
			Y=clamp(this.selPos.y*8+o,Y,this.selPos.y*8+this.selSize-o*2)
			if (c==1){c='white'}else if(c==2){c='black'};
			this.graph.ctx.fillStyle = c;
			this.graph.ctx.fillRect(X-o, Y-o+this.selBank, this.drawSize, this.drawSize);
			this.redraw();
		},
		drawHandle : function(e){
			this.draw.click=e.buttons;
			let X = getMousePos(this.draw.canvas,e).x;
			let Y = getMousePos(this.draw.canvas,e).y;
			if (0<this.draw.click&&this.draw.click<3){this.drawSetP(X,Y,this.draw.click);}
			if (this.draw.click==4){this.drawDrag(X,Y);}
		},
		drawDragStart : async function (e){
			let X = getMousePos(this.draw.canvas,e).x|0;
			let Y = getMousePos(this.draw.canvas,e).y|0;
			
			this.draw.ctx.drawImage(this.graph.canvas,
			this.selPos.x*8,this.selPos.y*8+this.selBank,
			this.selSize,this.selSize,0,0,128,128);
			
			this.dragImg = await createImageBitmap(this.draw.canvas);
			this.dragStart.x=X;
			this.dragStart.y=Y;
			this.drawDrag()
		},
		drawDrag : function (X,Y){
			if(this.dragImg!=undefined){
				let pxsize=128/this.selSize
				this.draw.ctx.fillStyle='#000'
				this.draw.ctx.fillRect(0,0,128,128)
				this.draw.ctx.drawImage(
					this.dragImg,
					((X-this.dragStart.x)/pxsize|0)*pxsize,
					((Y-this.dragStart.y)/pxsize|0)*pxsize
				);
				this.graph.ctx.drawImage(
					this.draw.canvas,
					this.selPos.x*8,
					this.selPos.y*8+this.selBank,
					this.selSize,this.selSize
				);
				this.redraw();
			};
		},
		
		selSet : function(a,b){
			let w=256/8;
			let h=64/8;
			if (b==undefined){
				this.selPos={x:a%w,y:a/w|0};
			}else{
				this.selPos={x:a,y:b};
			}
			this.selPos={x:clamp(0,this.selPos.x,w-this.selSize/8),y:clamp(0,this.selPos.y,h-this.selSize/8)};
			let ab=this.selPos.y*w+this.selPos.x;
			this.selSpr=ab;
			document.getElementById('editor-spr-num').innerText=ab;
			this.redraw();
		},
		selHandle : function(e){
			this.sel.click=e.buttons;
			if (this.sel.click!=0){
				let X = getMousePos(this.sel.canvas,e).x;
				let Y = getMousePos(this.sel.canvas,e).y;
				this.selSet(X/16|0,Y/16|0);
				this.flagsDisp(this.selSpr)
			};
			
		},
		selSetBank : function(b){
			this.selBank=b*64
			this.redraw();
			let btndiv=document.getElementById('editor-spr-buttons-d').children[0].children;
			for (i=0;i<btndiv.length;i++){btndiv[i].disabled=false};
			btndiv[b].disabled=true;
		},
		
		flagsCalc : function (a){
			if(a[1]!=undefined){
				let h="";
				for(i=0;i<8;i++){
					h=a[i]*1+h;
				}
				return parseInt(h,2);
			}else{
				let f=a.toString(2);
				f=String("00000000").substring(0,8-f.length)+f;
				let h=new Array(8);
				for(i=0;i<8;i++){
					h[8-i-1]=Boolean(Number(f[i]));
				}
				return h;
			}
		},
		flagsGet : function(){
			let a=new Array(8);
			for(i=0;i<8;i++){
				a[i]=document.getElementById("flag"+i).checked
			}
			return a;
		},
		flagsDisp : function(spr){
			let allEqual = arr => arr.every(val => val === arr[0]);
			let allTrue = arr => arr.every(val => val == true);
			let oneIsTrue = arr => arr.some(val => val == true);
			let size=(this.selSize)/8;
			if(size>1){
				let b=new Array()
				let ah=new Array(8)
				for(i=0;i<8;i++){ah[i]=new Array(size*size)};
				let a
				
				for(n=0;n<size*size;n++){
					a=this.flagsCalc(this.flags[spr+(n%size)+(Math.floor(n/size)*32)])
					for(i=0;i<8;i++){
						document.getElementById("flag"+i).indeterminate=a[i];
						ah[i][n]=a[i]
					}
				};
				for(i=0;i<8;i++){
					if(allEqual(ah[i])&&allTrue(ah[i])){
						document.getElementById("flag"+i).checked=true;
						document.getElementById("flag"+i).indeterminate=false;
					}else if(oneIsTrue(ah[i])){
						document.getElementById("flag"+i).checked=false;
						document.getElementById("flag"+i).indeterminate=true;
					}else{
						document.getElementById("flag"+i).checked=false;
						document.getElementById("flag"+i).indeterminate=false;
					};
				};
			}else{
				let a=this.flagsCalc(this.flags[spr]);
				for(i=0;i<8;i++){
					document.getElementById("flag"+i).indeterminate=false;
					document.getElementById("flag"+i).checked=a[i];
				};
			};
			
		},
		flagsSetOne : function(spr,a,l){
			let size=(this.selSize)/8;
			for(n=0;n<size*size;n++){
				b=this.flagsCalc(this.flags[spr+(n%size)+(Math.floor(n/size)*32)])
				b[l]=a
				this.flags[spr+(n%size)+(Math.floor(n/size)*32)]=this.flagsCalc(b);
			};
		},
		flagsSet : function(spr,a){
			let size=(this.selSize)/8;
			for(n=0;n<size*size;n++){
				this.flags[spr+(n%size)+(Math.floor(n/size)*32)]=this.flagsCalc(a);
				console.log(spr+(n%size)+(Math.floor(n/size)*32));
			};
		},
		flagsUpd : function(l){
			let w = document.getElementById("flag"+l).checked;
			this.flagsSetOne(this.selSpr,w,l);
			this.undoAdd();
		},
		
		
		hotkeysHandle : function (e,p){
			if(!e.ctrlKey&&!e.shiftKey&&!e.altKey){
				switch(e.code){
					case "KeyF":
						p.zoom()
						break;
					case "Delete":
						p.clear()
						break;
					case "ArrowUp":
						p.selSet(p.selPos.x,p.selPos.y-1)
						break;
					case "ArrowDown":
						p.selSet(p.selPos.x,p.selPos.y+1)
						break;
					case "ArrowLeft":
						p.selSet(p.selPos.x-1,p.selPos.y)
						break;
					case "ArrowRight":
						p.selSet(p.selPos.x+1,p.selPos.y)
						break;
				}
			};
			if(e.ctrlKey){
				e.preventDefault(); 
				e.returnValue = '';
				switch(e.code){
					case "KeyX": 
						p.cut();
						break;
					case "KeyC": 
						p.copy();
						break;
					case "KeyV": 
						p.paste();
						break;
					case "KeyZ": 
						p.undo();
						break;
					case "KeyY": 
						p.redo();
						break;
				}
			};
			if(e.shiftKey){
				e.preventDefault(); 
				e.returnValue = '';
				switch(e.code){
					case "KeyH": 
						p.flip(1);
						break;
					case "KeyV": 
						p.flip(-1);
						break;
					case "KeyI": 
						p.invert();
						break;
				}
			};
		},
		
		
		init : function(){
			//canvases initialize
			
			this.draw.ctx.fillStyle = 'black';
			this.draw.ctx.fillRect(0, 0, this.draw.canvas.width, this.draw.canvas.height);
			this.draw.ctx.imageSmoothingEnabled = false;
			this.sel.ctx.fillStyle = 'black';
			this.sel.ctx.fillRect(0, 0, this.sel.canvas.width, this.sel.canvas.height);
			this.sel.ctx.imageSmoothingEnabled = false;
			this.graph.canvas = document.createElement('canvas');
			this.graph.ctx = this.graph.canvas.getContext('2d',{ willReadFrequently: true });
			this.graph.canvas.width=256;
			this.graph.canvas.height=256;
			this.graph.ctx.imageSmoothingEnabled = false;
			this.graph.ctx.willReadFrequently = true;
			this.graph.ctx.fillStyle = 'black';
			this.graph.ctx.fillRect(0, 0, this.graph.canvas.width, this.graph.canvas.height);
			
			let p=this;
			
		
			//events n stuff
			
			//drawing a sprite
			window.addEventListener('mouseup', function (e){
				if(p.draw.click!=0){
					p.undoAdd();
				}
			});
			
			this.draw.canvas.addEventListener('mousedown', function (e){
				p.draw.click=e.buttons;
				if (p.draw.click==4){p.drawDragStart(e);}
				p.drawHandle(e);
			});
			this.draw.canvas.addEventListener('mousemove', function (e){
				if (p.draw.click!=0){p.drawHandle(e)}
			});

			//select sprite
			this.sel.canvas.addEventListener('mousedown', function (e){
				p.sel.click=e.buttons;
				p.selHandle(e);
			});
			this.sel.canvas.addEventListener('mousemove', function (e){
				if (p.sel.click!=0){p.selHandle(e)}
			});

			//spr editor initialization
			this.parent.respondToVisibility(document.getElementById('editor-spr'),v =>{
				if (v){
					//m129Editor.prototype.debugOut('spr editor loaded');
				};
			});
			
			this.selSet(0);
			this.redraw();
		},
	};
	this.code={
		editor : ace.edit('editor-code-ace'),
		statusBar: undefined,
		init : function(){
			let t=this
			//require.config({paths: { "ace" : "../ace"}});
			this.editor.setTheme('ace/theme/m129');
			this.editor.session.setMode('ace/mode/lua_m129');
			this.editor.setShowPrintMargin(false);
			document.getElementsByClassName('ace_editor')['editor-code-ace'].style.fontFamily='vga';
			document.getElementsByClassName('ace_editor')['editor-code-ace'].style.fontSize='16px';
			document.getElementsByClassName('ace_editor')['editor-code-ace'].style.lineHeight='16px';
			//this.editor.setFontSize(16);
			//require('/ext-settings_menu').init(editor);
			ace.require("ace/ext/language_tools");
			ace.require("ace/ext/ext-settings_menu");
			this.editor.session.setTabSize(2);
			this.editor.commands.addCommands([{
				name: "showSettingsMenu",
				bindKey: {win: "Ctrl-q", mac: "Ctrl-q"},
				exec: function(editor) {
					ace.config.loadModule("ace/ext/settings_menu", function(module) {
						module.init(editor);
						editor.showSettingsMenu();
					})
				},
				readOnly: true
			}]);
			let dc=`--\n\nfunction _init()\n  \nend\n\nfunction _update()\n  \nend\n\nfunction _draw()\n  \nend`
			this.editor.session.setValue(dc,-1)
			
			this.editor.setOptions({
				enableBasicAutocompletion: true,
				enableSnippets: true,
				enableLiveAutocompletion: false
			});
			
			this.parent.respondToVisibility(document.getElementById('editor-code'),v =>{
				if (v){
					t.editor.gotoLine(t.editor.selection.getCursor().row);
				};
			});
			
			ace.require(["ace/ext/statusbar"],function(e){
				var StatusBar=e.StatusBar
				t.statusBar = new StatusBar(t.editor, document.getElementById("editor-code-statusbar"));
				t.editor.moveCursorTo(1,1)
				t.editor.moveCursorTo(0,0)
			})
		},
	};
	function rect(ctx,x,y,w,h,c,lw=1){
		ctx.fillStyle = c;
		ctx.fillRect(x,y,lw,h);
		ctx.fillRect(x,y,w,lw);
		ctx.fillRect(x,y+h-lw,w,lw);
		ctx.fillRect(x+w-lw,y,lw,h);
	}
	this.map={
		parent : undefined,
		c : {
			canvas:document.getElementById('editor-map-canvas'),
			ctx:document.getElementById('editor-map-canvas').getContext('2d'),
			click:0,
			drag:{x:0,y:0,x1:0,y1:0},
			dragzone:{x:0,y:0,x1:0,y1:0},
		},
		sel : {
			canvas:document.getElementById('sprsel_map'),
			ctx:document.getElementById('sprsel_map').getContext('2d'),
			click:0,
			drag:{x:0,y:0,x1:0,y1:0},
			dragzone:{x:0,y:0,x1:0,y1:0},
		},
		zoom:2,
		sPos : {x:0,y:0},
		mapTiles : new TileData(256,128),
		mapColors : new TileData(256,128),
		selTiles : new TileData(32,8),
		brush : {tile: new TileData(1,1,0), color: new TileData(1,1,15)},
		stamp : {tile: undefined, color: undefined},
		selColor : 0x0f,
		dP: {x:0,y:0,w:1,h:1},
		
		
		tilemap : new Image,
		onscroll : function(e){
			this.sPos.x=e.scrollLeft/8/this.zoom|0 
			this.sPos.y=e.scrollTop/8/this.zoom|0
		},
		
		tile : function(spr,x,y,c,b){
			c=Math.min(c,this.parent.spr.palsize-1)
			b=Math.min(b,this.parent.spr.palsize-1)
			if(spr>0){
				this.c.ctx.fillStyle=this.parent.spr.pal[b]
				this.c.ctx.fillRect(x*8,y*8,8,8)
				
				this.c.ctx.drawImage(this.tilemap,
				(spr%32)*8,Math.min(c,this.parent.spr.palsize)*64+(spr/32|0)*8
				,8,8,x*8,y*8,8,8)
				
			}else{
				this.c.ctx.clearRect(x*8,y*8,8,8)
			}
		},
		setT : function(t,c,x,y){
			this.mapTiles.set(t,x,y)
			this.mapColors.set(c,x,y)
			this.mapRedraw(x,y,t.width,t.height)
		},
		mapRedraw : function(X,Y,w,h){
			for(y=Y;y<Y+h;y++){
				for(x=X;x<X+w;x++){
					let tt=this.mapTiles.get(x,y)
					let tc=this.mapColors.get(x,y)
					this.tile(tt,x,y,tc%16,tc/16|0)
				}
			}
		},
		
		drawHandle : function(e){
			this.c.click=e.buttons;
			let mp=getMousePos(this.c.canvas,e)
			let X
			let Y
			if(this.parent.keysPressed['Control']){
				X=(mp.x/8/this.zoom|0)
				Y=(mp.y/8/this.zoom|0)
			}else{
				X=(mp.x/(this.brush.tile.width*8)/this.zoom|0)*this.brush.tile.width
				Y=(mp.y/(this.brush.tile.height*8)/this.zoom|0)*this.brush.tile.height
			}
			
			if(this.dP.x!=X||this.dP.y!=Y){
				let w=this.parent.game.width/8|0
				let h=this.parent.game.height/8|0
				
				this.mapRedraw(this.dP.x,this.dP.y,this.dP.w,this.dP.h)
				rect(this.c.ctx,(this.dP.x/w|0)*w*8,(this.dP.y/h|0)*h*8,w*8+1,h*8+1,'#008')
			}
			this.dP={x:X,y:Y,w:this.brush.tile.width,h:this.brush.tile.height}
			
			if (this.c.click==1){
				this.setT(this.brush.tile,this.brush.color,X,Y)
			}else if (this.c.click==2){
				let d=new TileData(this.brush.tile.width,this.brush.tile.height,0)
				this.setT(d,d,X,Y)
				
			}
			
			rect(this.c.ctx,X*8,Y*8,this.brush.tile.width*8,this.brush.tile.height*8,'#f00')
			
			document.getElementById('editor-map-statusbar').innerText=`${X}:${Y}`
		},
		selHandle : function(e){
			this.sel.click=e.buttons;
			if (this.sel.click==1){
				let mp=getMousePos(this.sel.canvas,e)
				let X=(mp.x/8/2|0)
				let Y=(mp.y/8/2|0)
				
				this.sel.drag.x1=X
				this.sel.drag.y1=Y
				
				let zone={
					x:Math.max(Math.min(this.sel.drag.x,this.sel.drag.x1),0),
					y:Math.max(Math.min(this.sel.drag.y,this.sel.drag.y1),0),
					x1:Math.min(Math.max(this.sel.drag.x,this.sel.drag.x1),31),
					y1:Math.min(Math.max(this.sel.drag.y,this.sel.drag.y1),8)
				}
				this.sel.dragzone=zone
				
				this.sel.ctx.drawImage(this.parent.spr.graph.canvas,0,0-this.parent.spr.selBank*2,512,512)
				rect(this.sel.ctx,zone.x*16,zone.y*16,(zone.x1+1-zone.x)*16,(zone.y1+1-zone.y)*16,'#f00',2)
			}
		},
		selSelect : function(){
			let zone=this.sel.dragzone
			this.brush.tile=this.selTiles.get(zone.x,zone.y,zone.x1-zone.x+1,zone.y1-zone.y+1)
			this.brush.color=new TileData(zone.x1-zone.x+1,zone.y1-zone.y+1,this.selColor)
		},
		init : function(){
			this.c.ctx.imageSmoothingEnabled = false;
			this.sel.ctx.fillStyle = 'black';
			this.sel.ctx.fillRect(0, 0, this.sel.canvas.width, this.sel.canvas.height);
			this.sel.ctx.imageSmoothingEnabled = false;
			
			let t = this
			
			for(i=0;i<256;i++){
				this.selTiles.data[i]=i
			}
			
			this.c.canvas.addEventListener('mousedown', function (e){
				t.c.click=e.buttons;
				t.drawHandle(e);
			});
			this.c.canvas.addEventListener('mousemove', function (e){
				t.drawHandle(e);
			});
			
			this.sel.canvas.addEventListener('mousedown', function (e){
				t.sel.click=e.buttons;
				let mp=getMousePos(t.sel.canvas,e)
				let X=(mp.x/8/2|0)
				let Y=(mp.y/8/2|0)
				
				t.sel.drag={x:X,y:Y,x1:X,y1:Y}
				
				t.selHandle(e);
			});
			this.sel.canvas.addEventListener('mousemove', function (e){
				t.selHandle(e);
			});
			
			window.addEventListener('mouseup', function (e){
				if(t.sel.click!=0){
					t.selSelect()
				}
			});
			
			//todo: save/load selected sprite in spr editor, change spr banks 
			this.parent.respondToVisibility(document.getElementById('editor-map'),v =>{
				if (v){
					let spr=t.parent.spr
					let p=imgdataToImage(Uint8ToGraph(graphToUint8(spr.graph.ctx.getImageData(0,spr.selBank,256,64)),32,spr.pal.slice(0,spr.palsize),true,true))
					p.then((i)=>{
						t.tilemap=i
						
						t.c.ctx.clearRect(0,0,2048,1024)
						t.sel.ctx.drawImage(spr.graph.canvas,0,0-spr.selBank*2,512,512)
						
						let zone=t.sel.dragzone
						rect(t.sel.ctx,zone.x*16,zone.y*16,(zone.x1+1-zone.x)*16,(zone.y1+1-zone.y)*16,'#f00',2)
						
						setTimeout(()=>{
							t.mapRedraw(0,0,t.mapTiles.maxX+1,t.mapTiles.maxY+1);
							drawGrid(t.c.canvas,0,0,(t.parent.game.width/8|0)*8,(t.parent.game.height/8|0)*8,1,'#008');
						},1)
					})
					
				}else{
					t.mapTiles.calcMax()
				};
			});
			
		},
	}
	/*this.resizeEvent=function(){
		this.isMobile=window.mobileAndTabletCheck()
		let r = document.querySelector(':root')
		if(window.mobileAndTabletCheck()&&screen.orientation.angle==90){
			r.style.setProperty('--editorWidth', window.innerWidth+"px")
			r.style.setProperty('--editorHeight', window.innerHeight+"px")
			r.style.setProperty('--editorScale', '1.0')
		}else{
			r.style.setProperty('--editorWidth', (window.innerWidth-1)+"px")
			r.style.setProperty('--editorHeight', (window.innerHeight-1)+"px")
			r.style.setProperty('--editorScale', '1.5')
		}
	};*/
	this.init=function(){
		this.spr.parent=this;
		this.code.parent=this;
		this.map.parent=this;
		this.spr.init();
		this.code.init();
		this.map.init();
		
		document.getElementById("editor-upper-panel-version").innerText='ver. '+this.version
		
		this.palCreate(16,this.spr.pal)
		
		let fnt = new Image();
		fnt.src = this.spr.defFont;
		fnt.onload=function(){
			t.spr.graph.ctx.drawImage(fnt,0,192);
			t.spr.undoAdd();
		};
		
		let t = this
		
		window.addEventListener('beforeunload',function (e) {
			/*if (EDITOR.hasChanged){
				e.preventDefault(); 
				e.returnValue = '';
			};*/
			e.preventDefault(); 
			e.returnValue = '';
		});
		window.addEventListener('keydown',function(e){
			t.onKeyDown(e);
			if(t.currentPage=='spr'){
			t.spr.hotkeysHandle(e,t.spr);
		}
		});
		window.addEventListener('keyup',function(e){
			t.onKeyUp(e);
		});
		
		/*window.addEventListener('resize', function(e) {
			EDITOR.resizeEvent()
		}, true);*/
		
		this.respondToVisibility(document.getElementById('editor-play'),v =>{
			if (v){
				let n = document.getElementById('editor-up-panel').children[0].children
				for(let i=0;i<n.length-1;i++){n[i].disabled=true}
				t.playGame()
			}else{
				let n = document.getElementById('editor-up-panel').children[0].children
				for(let i=0;i<n.length-1;i++){n[i].disabled=false}
				t.stopGame()
			};
		}); 
		
	};
};

//wanna some cool stuff?
//paste this in your browser console ;)

//v='';for(i=0;i<256;i++){s=Array(8).fill(' ');a=i;b=7;while(a){if(a%2){s[b]='█'}a=a/2|0;b--}v+=s.join('')+'\n'}console.log(v)