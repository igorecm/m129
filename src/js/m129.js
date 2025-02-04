if(typeof fengari !== 'undefined'){
	var luaconf  = fengari.luaconf;
	var lua      = fengari.lua;
	var lauxlib  = fengari.lauxlib;
	var lualib   = fengari.lualib;
	var interop  = fengari.interop
}
if (typeof pako !== 'undefined'){var zlib=pako}


//////////////////////////////////////////////////////////////////////////////////////
function TileData(w,h,d=0) {
	this.width = w;
	this.height = h;
	this.data = new Uint8Array(w*h);
	this.data.fill(d);
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
//////////////////////////////////////////////////////////////////////////////////////
const m129 = function(c,game){
	
	//////////////////////////////////////////////////////////////////////////////////////
	function Base64ToUint8(a){
		return new Uint8Array(atob(a).split(",").map(function(c) {return parseInt(c) }));
	};
	function Uint8ToString(u8a){
		var CHUNK_SZ = 0x8000;
		var c = [];
		for (var i=0; i < u8a.length; i+=CHUNK_SZ) {
			c.push(String.fromCharCode.apply(null, u8a.subarray(i, i+CHUNK_SZ)));
		}
		return c.join("");
	};
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
	function imgdataToImage(imagedata) {
		return new Promise((resolve,reject)=>{
			var canvas = document.createElement('canvas');
			var ctx = canvas.getContext('2d');
			canvas.width = imagedata.width;
			canvas.height = imagedata.height;
			ctx.putImageData(imagedata, 0, 0);

			var image = new Image();
			image.onload=resolve(image);
			image.src = canvas.toDataURL();
		})
	};
	function imgPromise(data){
		return new Promise((resolve,reject)=>{
			let a=new Image
			a.onload=resolve(a)
			a.src=data;
		})
	}
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
	
	//////////////////////////////////////////////////////////////////////////////////////
	this.L=undefined
	
	if(typeof(game)=='object'){
		this.game=game;
	}else if(typeof(game)=='string'){
		this.game=JSON.parse(game);
		this.game.lua=JSON.parse(this.game.lua)
	}
	
	this.canvas=document.createElement('canvas');
	this.ctx=this.canvas.getContext('2d',{willReadFrequently:true});
	this.ctx.imageSmoothingEnabled = false;
	
	this.canvas.id="m129-canvas";
	this.div=document.getElementById(c);
	this.div.appendChild(this.canvas);
	this.canvas.style.width="100%";
	this.canvas.style.height="100%";
	
	this.canvas.oncontextmenu=function(){return false;}
	
	
	this.ctx.imageSmoothingEnabled=false;
	
	this.scale="1";
	
	this.pal=new Array
	this.palHex=undefined
	
	this.sprflags=undefined
	this.graphdata= new Array(4)
	this.graph = new Image
	this.font = new Image
	
	this.map={
		c:new TileData(256,128),
		t:new TileData(256,128)
	}
	
	this.map.canvas=document.createElement('canvas')
	this.map.canvas.width=2048
	this.map.canvas.height=1024
	this.map.ctx=this.map.canvas.getContext('2d',{willReadFrequently:true});
	
	this.chrW=undefined
	this.chrH=undefined
	
	this.active=true;
	
	var keyCodes = {backspace: 8,  tab: 9, enter: 13, shift: 16, ctrl: 17, alt: 18, pause: 19, capslock: 20, esc: 27, space:32, pgup: 33, pgdown: 34, end: 35, home: 36, left: 37, up: 38, right: 39, down: 40, insert: 45, del: 46, 0: 48, 1: 49, 2: 50, 3: 51, 4: 52, 5: 53, 6: 54, 7: 55, 8: 56, 9: 57, a: 65, b: 66, c: 67, d: 68, e: 69, f: 70, g: 71, h: 72, i: 73, j: 74, k: 75, l: 76, m: 77, n: 78, o: 79, p: 80, q: 81, r: 82, s: 83, t: 84, u: 85, v: 86, w: 87, x: 88, y: 89, z: 90, select: 93, numpad0: 96, numpad1: 97, numpad2: 98, numpad3: 99, numpad4: 100, numpad5: 101, numpad6: 102, numpad7: 103, numpad8: 104, numpad9: 105, numpadmultiply: 106, numpadadd: 107, numpadsubtract: 109, numpaddecimal: 110, numpaddivide: 111, f1: 112, f2: 113, f3: 114, f4: 115, f5: 116, f6: 117, f7: 118, f8: 119, f9: 120, f10: 121, f11: 122, f12: 123, numlock: 144, scrolllock: 145, semicolon: 186, equalsign: 187, comma: 188, minus: 189, period: 190, slash: 191, backquote: 192, bracketleft: 219, backslash: 220, braketright: 221, quote: 222};
	
	this.input={}
	
	function luaPushToTable(L,f,v){
		lua.lua_pushstring(L, f);
		if (typeof(v)=='number'){
			lua.lua_pushinteger(L, v);
		}else if(typeof(v)=='string'){
			lua.lua_pushstring(L, v);
		}
		lua.lua_settable(L, -3);
	}
	
	var inputHandle=function(e,type){
		let mouseX
		let mouseY
		let mouseB
		if(!e.repeat&&this.L){
			if(type=='keydown'){
				this.input[e.keyCode]=[true,true]
			}else if(type=='keyup'){
				delete this.input[e.keyCode]
			}else if(type.substring(0,5)=='mouse'){
				let rect = this.canvas.getBoundingClientRect()
				let scaleX = this.div.parentNode.clientWidth / this.game.width;
				let scaleY = this.div.parentNode.clientHeight / this.game.height;
				let scaleAmount = Math.max(Math.floor(Math.min(scaleX, scaleY)),1);
				
				mouseX = parseInt((e.clientX-rect.left)/scaleAmount);
				mouseY = parseInt((e.clientY-rect.top)/scaleAmount);
				mouseB = e.buttons
			}
			//if(type=='mousedown'){this.canvas.style.cursor='none'}
			
			lua.lua_getglobal(this.L, "_input");
			if (lua.lua_isfunction(this.L, -1)) {
				
				lua.lua_newtable(this.L);
				luaPushToTable(this.L,'type',type)
				
				if(type=='keydown'){
					luaPushToTable(this.L,'code',e.keyCode||0)
				}
				
				if(type.substring(0,5)=='mouse'){
					luaPushToTable(this.L,'x',mouseX||0)
					luaPushToTable(this.L,'y',mouseY||0)
					luaPushToTable(this.L,'button',mouseB||0)
				}
				
				if (lua.lua_pcall(this.L, 1, 0, 0)!== lua.LUA_OK) {
					this.error(this.L)
				}
			}
			lua.lua_pop(this.L,-1)
			
		}
	}.bind(this)
	
	var keyEventsToBind=['keydown','keyup']
	var mouseEventsToBind=['mousemove','mousedown','mouseup']
	
	var inputHandleBinded={}
	keyEventsToBind.concat(mouseEventsToBind).forEach((v,i)=>{
		inputHandleBinded[v]=function(e){inputHandle(e,v)}
	})
	
	
	//////////////////////////////////////////////////////////////////////////////////////
	
	this.cls=function(c=0){
		this.ctx.fillStyle = this.palHex[c];
		this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
	}
	
	this.spr=function(spr,x,y,c=this.pal.length-1,w=1,h=1,fh=false,fv=false){
		if(spr.length){
			spr=spr.map(Math.floor)
		}else{
			spr=Math.floor(spr)
		}
		x=Math.floor(x)
		y=Math.floor(y)
		
		let oh = (1-fh*2)
		let ov = (1-fv*2)
		let ohc = oh-w*8*fh
		let ovc = ov-h*8*fv
		
		if(fh||fv){this.ctx.scale(oh,ov)}
		
		if(w==1&&h==1){ 
			this.ctx.drawImage(this.graph,c*8,spr*8,8,8,x*ohc,y*ovc,8,8)
		}else{
			for(oy=0;oy<h;oy++){
				for(ox=0;ox<w;ox++){
					this.ctx.drawImage(
					this.graph,c*8,(spr+ox+oy*32)*8,8,8,
					(x+(ox*oh)*8)*ohc,
					(y+(oy*ov)*8)*ovc,
					8,8)
				}
			}
		}
		this.ctx.setTransform(1,0,0,1,0,0);
	}
	
	this.sspr=function(spr,x,y,c=15,w=8,h=8,fh=false,fv=false){
		spr=parseInt(spr)
		x=parseInt(x)
		y=parseInt(y)
		
		let oh = (1-fh*2)
		let ov = (1-fv*2)
		
		if(fh||fv){this.ctx.scale(oh,ov)}
		
		this.ctx.imageSmoothingEnabled=false;
		this.ctx.drawImage(this.graph,c*8,spr*8,8,8,
			x*oh-w*8*fh,
			y*ov-h*8*fv,
			w,h);
		
		this.ctx.setTransform(1,0,0,1,0,0);
	};
	
	this.tile=function(spr,x,y,c=15,b=0){
		spr=parseInt(spr)
		x=Math.floor(x)
		y=Math.floor(y)
		
		this.map.ctx.fillStyle = this.palHex[b]||this.palHex[0];
		this.map.ctx.fillRect(x*8,y*8,8,8);
		
		this.map.ctx.imageSmoothingEnabled=false;
		this.map.ctx.drawImage(this.graph,c*8,spr*8,8,8,x*8,y*8,8,8);
	};
	
	this.chr=function(spr,x,y,c=15){
		spr=parseInt(spr)
		x=Math.floor(x)
		y=Math.floor(y)
		
		this.ctx.imageSmoothingEnabled=false;
		this.ctx.drawImage(this.font,c*8,spr*8,this.chrW,this.chrH,x,y,this.chrW,this.chrH);
	};
	
	this.rect=function(x,y,w,h,c1,c2,lw=1){
		x=Math.floor(x)
		y=Math.floor(y)
		w=parseInt(w)
		h=parseInt(h)
		
		this.ctx.fillStyle = this.palHex[c1];
		this.ctx.fillRect(x,y,w,h);
		if (c2!=c1){
			this.ctx.fillStyle = this.palHex[c2];
			this.ctx.fillRect(x,y,lw,h);
			this.ctx.fillRect(x,y,w,lw);
			this.ctx.fillRect(x,y+h-lw,w,lw);
			this.ctx.fillRect(x+w-lw,y,lw,h);
		}
	}
	
	this.text=function(txt,x=0,y=0,c,b,l=0){
		txt=String(txt)
		x=Math.floor(x)
		y=Math.floor(y)
		
		c=c||this.pal.length-1
		
		let txtsplnl = txt.split(/\r\n|\r|\n/g);
		let xo = 0;
		let yo = 0;
		let s = false
		let cW=this.chrW
		let cH=this.chrH
		for (let j = 0; j<txtsplnl.length;j++){
			let txtspl=txtsplnl[j].split(' ')
			for (i = 0; i<txtspl.length;i++){
				let tp = txtspl[i] 
				if (i!=txtspl.length-1){tp+=" "}
				if (xo + tp.length > l && l!=0){
					yo += 1; 
					xo = 0;
				}
				for (n = 0; n<tp.length;n++){
					let spr = tp[n].charCodeAt()
					
					if (b != -1){
						this.ctx.fillStyle = this.palHex[b]||this.palHex[0];
						this.ctx.fillRect(x+xo*cW,y+yo*cH,cW,cH);
					}
					
					this.ctx.drawImage(this.font,c*8,spr*8,cW,cH,x+xo*cW,y+yo*cH,cW,cH)
					xo += 1;
				}
			}
			xo = 0;
			yo += 1; 
		}
	}
	
	this.mapRedraw=function(){
		this.map.ctx.clearRect(0,0,2048,1024)
		let a=this.map.t.calcMax()
		let X=0
		let Y=0
		let w=a.x+1
		let h=a.y+1
		for(y=Y;y<Y+h;y++){
			for(x=X;x<X+w;x++){
				if (this.map.t.get(x,y)!=0){
					let tt=this.map.t.get(x,y)
					let tc=this.map.c.get(x,y)
					this.tile(tt,x,y,tc%16,tc/16|0)
				}
			}
		}
	}
	this.dmap=function(x=0,y=0,sx=0,sy=0,w=this.width/8|0,h=this.height/8|0){
		x=Math.floor(x)
		y=Math.floor(y)
		sx=Math.floor(sx)
		sy=Math.floor(sy)
		this.ctx.drawImage(this.map.canvas,sx*8,sy*8,w*8,h*8,Math.floor(x),Math.floor(y),w*8,h*8)
	}
	
	this.mset=function(spr,x,y,c=15,b=0){
		spr=parseInt(spr)
		x=Math.floor(x)
		y=Math.floor(y)
		
		this.tile(spr,x,y,c,b)
		
		this.map.t.set(spr,x,y);
		this.map.c.set(c+b*16,x,y);
	};
	
	this.mget=function(x,y){
		x=Math.floor(x)
		y=Math.floor(y)
		if (x>255||y>128||x<0||y<0){return 0;}
		else{return this.map.t.get(x,y)}
	}
	
	this.mgetc=function(x,y){
		x=Math.floor(x)
		y=Math.floor(y)
		if (x>255||y>128||x<0||y<0){return 0;}
		else{return this.map.c.get(x,y)}
	}
	
	this.fset=function(n,f,v){
		if (v){
			let t=this.sprflags[n].toString(2)
			t=String("00000000").substring(0,8-t.length)+t;
			t=t.split('')
			t[f]=Number(v)
			t=t.join('')
			this.sprflags[n]=parseInt(t,2)
		}else{
			this.sprflags[n]=f
		}
	}
	this.fget=function(n,f){
		if (f){
			let t=this.sprflags[n].toString(2)
			t=String("00000000").substring(0,8-t.length)+t;
			t=t.split('')
			return Boolean(t[f])
		}else{
			return this.sprflags[n]
		}
	}
	this.pset=function(x,y,c){
		this.ctx.fillStyle=this.palHex[c]
		this.ctx.fillRect(x,y,1,1)
	}
	this.pget=function(x,y){
		let p=this.ctx.getImageData(x,y,1,1)
		p=p.data
		let c=this.pal.findIndex((v)=>{
			return v[0]==p[0]&&v[1]==p[1]&&v[2]==p[2]
		})
		return c
	}
	
	this.key=function(k){
		let a=this.input[keyCodes[k]]||[false,false]
		return a[0]
	}
	this.keyp=function(k){
		let a=this.input[keyCodes[k]]||[false,false]
		return (a[0]&&a[1])
	}
	
	this.btn=function(k){
		let a=this.input[k]||[false,false]
		return a[0]
	}
	this.btnp=function(k){
		let a=this.input[k]||[false,false]
		return (a[0]&&a[1])
	}
	this.dummy=function(n){
		console.log(n)
	}
	this.error=function(L,s){
		let err=lua.lua_tostring(L, -1)
		let a
		if (typeof(err)=="object"&&err!=null){
			a=fengari.to_jsstring(err)
			console.error(a)
			a=a.replace(/\[.*?\]:/g, 'error at line ');
			this.text(a,0,0,this.pal.length-1,this.pal.length/2+1)
		}else if(s){
			a=s
			this.text(a,0,0,this.pal.length-1,this.pal.length/2+1)
		}else{
			a="unknown error(???)\nperhaps one of the m129 functions recieved nil as argument"
			this.text(a,0,0,this.pal.length-1,this.pal.length/2+1)
		}
		
	}
	
	//////////////////////////////////////////////////////////////////////////////////////

	this.luaLoad=function(){
		let dolua=`
			abs = math.abs
			acos = math.acos
			asin = math.asin
			atan = math.atan
			ceil = math.ceil
			cos = math.cos
			deg = math.deg
			exp = math.exp
			floor = math.floor
			fmod = math.fmod
			huge = math.huge
			log = math.log
			max = math.max
			min = math.min
			modf = math.modf
			pi = math.pi
			pow = math.pow
			rad = math.rad
			rand = math.random
			rands = math.randomseed
			sin = math.sin
			sqrt = math.sqrt
			tan = math.tan
			toint = math.tointeger
			type = math.type
			ult = math.ult
			function clamp(a,n,b) return min(max(n,a),b) end
			function col(ax,ay,aw,ah,bx,by,bw,bh)
				if 
				ax+aw >= bx and
				ax <= bx+bw and
				ay+ah >= by and
				ay <= by+bh then
					return true
				else 
					return false
				end
			end
			function _init() end
			function _update() end
			function _draw() end
		`
		
		
		this.L = lauxlib.luaL_newstate();
		lualib.luaL_openlibs(this.L);
		interop.luaopen_js(this.L);
		
		
		lua.lua_pushjsfunction(this.L, function(L) {
            let n = lua.lua_gettop(L); 
            let strings = [];
            for (let i=1;i<=n;i++){
                if (lua.lua_isstring(L, i)) {
                    strings.push(lua.lua_tojsstring(L, i));
                } else {
                    strings.push(fengari.to_jsstring(lua.lua_typename(L, lua.lua_type(L, i))));
                }
            }
            console.log(strings.join(' ')); 
            return 0; 
        });
		lua.lua_setglobal(this.L, "print");
		
		/////////////////////////////////////////////
		//export funcs
		let funcs=[
			[this.cls,"cls"],
			
			[this.text,"text"],
			[this.spr,"spr"],
			[this.sspr,"sspr"],
			[this.chr,"chr"],
			[this.rect,"rect"],
			[this.dmap,"map"],
			[this.mset,"mset"],
			[this.mget,"mget"],
			[this.mgetc,"mgetc"],
			
			[this.fset,"fset"],
			[this.fget,"fget"],
			[this.pset,"pset"],
			[this.pget,"pget"],
			
			[this.key,"key"],
			[this.keyp,"keyp"],
			
			[this.dummy,"dummy"],
		];
		
		function luaGetDataFromIndex(L,index){
			switch(lua.lua_type(L,index)){
				case lua.LUA_TBOOLEAN:
					return Boolean(lua.lua_toboolean(L, index));
				case lua.LUA_TNUMBER:
					return Number(lua.lua_tonumber(L, index));
				case lua.LUA_TSTRING:
					return String(lua.lua_tojsstring(L, index));
				case lua.LUA_TTABLE:
					return luaGetTableFromArg(L, index);
			}
			return null;
		}
		
		function luaGetTableFromArg(L,index){
			if(lua.lua_istable(L,index)){
				let tsize = lua.lua_rawlen(L, index);
				
				let arr=new Array(tsize)
				
				for(let i=0;i<tsize;i++){
					lua.lua_rawgeti(L,index,i+1)
					arr[i]=luaGetDataFromIndex(L,-1)
					lua.lua_pop(L,1)
				}
				
				return arr
			}
		}
		
		function luaWrapper(func){
			return function(L){
				let n = lua.lua_gettop(L)
				let args=[];
				for (let i=1;i<=n;i++){
					args.push(luaGetDataFromIndex(L,i))
				}
				a=func(...args);
				if (a){
					if(typeof(a)=='number'){lua.lua_pushnumber(L,a);}
					else if(typeof(a)=='boolean'){lua.lua_pushboolean(L,a);}
					return 1;
				}else{return 0}
			}
		}
		
		for (let i=0;i<funcs.length;i++){
			if (funcs[i][0]!=undefined){
				lua.lua_pushjsfunction(this.L,luaWrapper(funcs[i][0].bind(this)));
				lua.lua_setglobal(this.L,funcs[i][1])
			}
		}
		
		lauxlib.luaL_dostring(this.L, lua.lua_pushliteral(this.L,dolua))
		
		if (lauxlib.luaL_dostring(this.L, lua.lua_pushliteral(this.L,this.game.lua))!== lua.LUA_OK) {
			this.error(this.L)
		}else{
			lua.lua_getglobal(this.L, "_init");
			if (lua.lua_pcall(this.L, 0, 0, 0)!== lua.LUA_OK) {
				this.error(this.L)
			}else{
				requestAnimationFrame(this.loop.bind(this));
			}
		}
	};
	
	
	
	let oldTimeStamp
	this.loop=function(timeStamp){
		if (this.active){requestAnimationFrame(this.loop.bind(this));}
		
		let deltaTime = (timeStamp - oldTimeStamp);
		oldTimeStamp = timeStamp;
		let fps = Math.round(1000 / deltaTime);
		
		
		
		if (this.L){
			lua.lua_getglobal(this.L, "_update");
			if (lua.lua_pcall(this.L, 0, 0, 0)!== lua.LUA_OK) {
				this.error(this.L)
				this.active=false
			}
			/*if(Math.floor(deltaTime)<=1000/60){
				lua.lua_getglobal(this.L, "_draw");
				if (lua.lua_pcall(this.L, 0, 0, 0)!== lua.LUA_OK) {
					this.error(this.L)
					this.active=false
				}
			}else{
				//console.log('frame skipped')
			}*/
			lua.lua_getglobal(this.L, "_draw");
			if (lua.lua_pcall(this.L, 0, 0, 0)!== lua.LUA_OK) {
				this.error(this.L)
				this.active=false
			}
		}
		
		//this.text(deltaTime,0,0)
		
		let t=this
		Object.keys(this.input).forEach((k)=>{if (t.input[k][1]){t.input[k][1]=false} })
    }
	
	
	
	
	this.loadRes=function(nextact=function(){}){
		this.canvas.width=this.game.width;
		this.canvas.height=this.game.height;
		
		this.palHex=this.game.palette
		
		this.ctx.fillStyle=this.palHex[0]
		this.ctx.fillRect(0,0,this.canvas.width,this.canvas.height)
		this.chrW=this.game.chrW;
		this.chrH=this.game.chrH;
		
		this.sprflags=parseInt(this.game.sprflags)||new Array(256).fill(0)
		
		this.pal=this.palHex.map(hexToRgb);
		
		let t=this
		let l=this.game.spr
		
		let d=[]
		for(let i=0;i<4;i++){
			if(l[i]){
				d[i]=Uint8ToGraph(zlib.inflate(Base64ToUint8(l[i])),1,this.pal,true);
			}else{
				d[i]=Uint8ToGraph(0,1)
			}
		}
		
		let r=d.map(imgdataToImage)
		Promise.all(r).then((pr)=>{
			t.graphdata=pr;
			t.font=pr[3];
			t.graph=pr[0];
			nextact(t)
		})
		
		let k	
		k=new TileData(this.game.map.w,this.game.map.h)
		k.data=zlib.inflate(Base64ToUint8(this.game.map.t))
		this.map.t.set(k,0,0)
		k.data=zlib.inflate(Base64ToUint8(this.game.map.c))
		this.map.c.set(k,0,0)
	}
	
	let initStart=Date.now()
	
	this.init=function(){
		let t = this;
		
		function resize(){
			let scaleX = this.div.parentNode.clientWidth / this.game.width;
			let scaleY = this.div.parentNode.clientHeight / this.game.height;
			let scaleAmount = Math.max(Math.floor(Math.min(scaleX, scaleY)),1);
			this.div.style.width=(this.game.width*scaleAmount)+"px";
			this.div.style.height=(this.game.height*scaleAmount)+"px";
		}
		
		if(this.scale=="auto"){
			var ob = new ResizeObserver(resize.bind(this)).observe(this.div.parentNode)
		}else{
			let s = parseInt(this.scale)
			this.div.style.width=(this.game.width*s)+"px";
			this.div.style.height=(this.game.height*s)+"px";
		}
		
		
		this.loadRes(this.onready.bind(this));
		
	};
	
	this.onready=function(t){
		setTimeout(()=>{
			t.luaLoad();
			
			keyEventsToBind.forEach((v,i)=>{
				document.addEventListener(v,inputHandleBinded[v])
			})
			mouseEventsToBind.forEach((v,i)=>{
				this.canvas.addEventListener(v,inputHandleBinded[v])
			})
			
			this.mapRedraw()
			
			let initEnd=Date.now()-initStart
			
			console.log(`m129 initialized, took ${initEnd}ms`)
		},1)
	}
	
	this.uninit=function(){
		this.div.innerHTML=''
		
		keyEventsToBind.forEach((v,i)=>{
			document.removeEventListener(v,inputHandleBinded[v])
		})
		mouseEventsToBind.forEach((v,i)=>{
			this.canvas.removeEventListener(v,inputHandleBinded[v])
		})
		
		lua.lua_close(this.L)
		this.L=undefined
		///
		console.log('m129 closed')
		console.log('--------------------')
	}
}

