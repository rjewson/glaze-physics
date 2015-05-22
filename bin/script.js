(function (console) { "use strict";
function $extend(from, fields) {
	function Inherit() {} Inherit.prototype = from; var proto = new Inherit();
	for (var name in fields) proto[name] = fields[name];
	if( fields.toString !== Object.prototype.toString ) proto.toString = fields.toString;
	return proto;
}
var Demo = function() {
	this.staticTests();
	this.setup();
	this.loop.start();
};
Demo.__name__ = true;
Demo.main = function() {
	var demo = new Demo();
	window.document.getElementById("stopbutton").addEventListener("click",function(event) {
		demo.loop.stop();
	});
	window.document.getElementById("startbutton").addEventListener("click",function(event1) {
		demo.loop.start();
	});
};
Demo.prototype = {
	staticTests: function() {
		var pos1 = new glaze_geom_Vector2(100,100);
		var extents1 = new glaze_geom_Vector2(10,10);
		var pos2 = new glaze_geom_Vector2(150,100);
		var extents2 = new glaze_geom_Vector2(10,10);
		var delta2 = new glaze_geom_Vector2(-31,0);
		var contact = new glaze_physics_collision_Contact();
		glaze_physics_collision_Intersect.StaticAABBvsSweeptAABB(pos1,extents1,pos2,extents2,delta2,contact);
	}
	,setup: function() {
		this.canvas = minicanvas_MiniCanvas.create(640,640);
		this.canvas.display("basic example");
		var rect = this.canvas.canvas.getBoundingClientRect();
		this.input = new util_DigitalInput();
		this.input.InputTarget(window.document,new glaze_geom_Vector2(rect.left,rect.top));
		haxe_Log.trace(rect.x,{ fileName : "Demo.hx", lineNumber : 70, className : "Demo", methodName : "setup", customParams : [rect.y]});
		var mapData = new glaze_ds_Bytes2D(20,20,32,4,glaze_ds_Bytes2D.uncompressData("eJxjZGBgYKQyphaglXnUMpMe/iXGfHrHB7XDj1pmkut/XGqonQeGSv4YTOZRMz5xmT3SzKMmBgBlKwBx"));
		this.map = new glaze_physics_collision_Map(mapData);
		this.map.debug = $bind(this,this.debugGrid);
		this.debugGridItems = [];
		this.engine = new glaze_Engine(60,new glaze_physics_collision_broadphase_BruteforceBroadphase(this.map,new glaze_physics_collision_Intersect()));
		this.loop = new util_GameLoop();
		this.loop.updateFunc = $bind(this,this.update);
		this.customSetup();
	}
	,customSetup: function() {
		this.mat1 = new glaze_physics_Material();
		this.playerFilter = new glaze_physics_collision_Filter();
		this.playerFilter.groupIndex = 1;
		this.player = new glaze_physics_Body(20,45,this.mat1,this.playerFilter);
		var _this = this.player.position;
		_this.x = 200;
		_this.y = 200;
		this.player.maxScalarVelocity = 0;
		var _this1 = this.player.maxVelocity;
		_this1.x = 160;
		_this1.y = 1000;
		this.engine.addBody(this.player);
		this.characterController = new util_CharacterController(this.input,this.player);
		var box = new glaze_physics_Body(10,10,this.mat1);
		var _this2 = box.position;
		_this2.x = 150;
		_this2.y = 200;
		this.engine.addBody(box);
		var tmp;
		var bfproxy = new glaze_physics_collision_BFProxy();
		bfproxy.aabb = new glaze_geom_AABB();
		var _this3 = bfproxy.aabb.position;
		_this3.x = 464;
		_this3.y = 544;
		var _this4 = bfproxy.aabb.extents;
		_this4.x = 144;
		_this4.y = 64;
		bfproxy.isStatic = true;
		tmp = bfproxy;
		var water = tmp;
		water.contactCallback = $bind(this,this.cb);
		water.isSensor = true;
		this.engine.broadphase.addProxy(water);
		this.ray = new glaze_physics_collision_Ray();
	}
	,cb: function(a,b,c) {
		var area = a.aabb.overlapArea(b.aabb);
		b.body.damping = 0.95;
		b.body.addForce(new glaze_geom_Vector2(0,-area / 100));
	}
	,update: function(delta,now) {
		this.debugGridItemsCount = 0;
		this.input.Update(0,0);
		this.ray.hit = false;
		this.processInput();
		this.engine.update(delta);
		this.debugRender();
		this.render();
	}
	,processInput: function() {
		this.characterController.update();
		var tmp;
		var _this = this.input;
		tmp = _this.keyMap[32] == _this.frameRef - 1;
		var fire = tmp;
		var tmp1;
		var _this1 = this.input;
		tmp1 = _this1.keyMap[71] == _this1.frameRef - 1;
		var search = tmp1;
		var debug = this.input.keyMap[72] > 0;
		var ray = this.input.keyMap[82] > 0;
		if(fire) this.fireBullet();
		if(ray) this.shootRay();
		if(search) this.searchArea();
		if(debug) this.fireBullet(20);
	}
	,fireBullet: function(debugCount) {
		if(debugCount == null) debugCount = 0;
		var bullet = new glaze_physics_Body(5,5,this.mat1,this.playerFilter);
		bullet.setMass(0.03);
		bullet.setBounces(3);
		var _this = bullet.position;
		_this.x = this.player.position.x;
		_this.y = this.player.position.y;
		bullet.isBullet = true;
		bullet.debug = debugCount;
		var vel = this.input.mousePosition.clone();
		var v = this.player.position;
		vel.x -= v.x;
		vel.y -= v.y;
		vel.normalize();
		vel.x *= 5000;
		vel.y *= 5000;
		var _this1 = bullet.velocity;
		_this1.x = vel.x;
		_this1.y = vel.y;
		this.engine.addBody(bullet);
	}
	,shootRay: function() {
		this.ray.initalize(this.player.position,this.input.mousePosition,1000,$bind(this,this.rayTest));
		this.engine.broadphase.CastRay(this.ray,null,true,false);
	}
	,searchArea: function() {
		var area = new glaze_geom_AABB();
		var _this = area.position;
		var v = this.player.position;
		_this.x = v.x;
		_this.y = v.y;
		var _this1 = area.extents;
		_this1.x = 100;
		_this1.y = 100;
		var count = 0;
		this.engine.broadphase.QueryArea(area,function(bf) {
			count++;
		});
		haxe_Log.trace("Found:" + count,{ fileName : "Demo.hx", lineNumber : 186, className : "Demo", methodName : "searchArea"});
	}
	,rayTest: function(proxy) {
		return proxy.body != null && proxy.body == this.player?-1:0;
	}
	,debugRender: function() {
	}
	,debugGrid: function(x,y) {
		var i = this.debugGridItemsCount * 2;
		this.debugGridItems[i] = x;
		this.debugGridItems[i + 1] = y;
		this.debugGridItemsCount += 1;
	}
	,render: function() {
		this.canvas.clear();
		var cellSize = this.map.data.cellSize;
		var _g1 = 0;
		var _g = this.map.data.height;
		while(_g1 < _g) {
			var y = _g1++;
			var _g3 = 0;
			var _g2 = this.map.data.width;
			while(_g3 < _g2) {
				var x = _g3++;
				var tmp;
				var _this = this.map.data;
				tmp = _this.data.b[y * _this.internalWidth + x * _this.bytesPerCell];
				var cell = tmp;
				if(cell > 0) {
					var xp = x * cellSize;
					var yp = y * cellSize;
					this.canvas.rect(xp,yp,xp + cellSize,yp + cellSize,1,255);
				}
			}
		}
		var _g4 = 0;
		var _g11 = this.engine.dynamicBodies;
		while(_g4 < _g11.length) {
			var body = _g11[_g4];
			++_g4;
			if(body.isBullet) this.canvas.line(body.position.x,body.position.y,body.previousPosition.x,body.previousPosition.y,3,-16711681);
			var tmp1;
			var _this1 = body.aabb;
			tmp1 = _this1.position.x - _this1.extents.x;
			var tmp2;
			var _this2 = body.aabb;
			tmp2 = _this2.position.y - _this2.extents.y;
			var tmp3;
			var _this3 = body.aabb;
			tmp3 = _this3.position.x + _this3.extents.x;
			var tmp4;
			var _this4 = body.aabb;
			tmp4 = _this4.position.y + _this4.extents.y;
			this.canvas.rect(tmp1,tmp2,tmp3,tmp4,1,body.onGround?-16711681:65535);
		}
		var _g5 = 0;
		var _g12 = this.engine.broadphase.staticProxies;
		while(_g5 < _g12.length) {
			var proxy = _g12[_g5];
			++_g5;
			var tmp5;
			var _this5 = proxy.aabb;
			tmp5 = _this5.position.x - _this5.extents.x;
			var tmp6;
			var _this6 = proxy.aabb;
			tmp6 = _this6.position.y - _this6.extents.y;
			var tmp7;
			var _this7 = proxy.aabb;
			tmp7 = _this7.position.x + _this7.extents.x;
			var tmp8;
			var _this8 = proxy.aabb;
			tmp8 = _this8.position.y + _this8.extents.y;
			this.canvas.rect(tmp5,tmp6,tmp7,tmp8,1,16711935);
		}
		var _g13 = 0;
		var _g6 = this.debugGridItemsCount;
		while(_g13 < _g6) {
			var i = _g13++;
			var xp1 = this.debugGridItems[i * 2] * cellSize;
			var yp1 = this.debugGridItems[i * 2 + 1] * cellSize;
			this.canvas.rect(xp1,yp1,xp1 + cellSize,yp1 + cellSize,3,-16776961);
		}
		if(this.ray.hit) this.canvas.line(this.ray.origin.x,this.ray.origin.y,this.ray.contact.position.x,this.ray.contact.position.y,1,thx_color__$RGBA_RGBA_$Impl_$.fromString("#00ff00"));
	}
	,__class__: Demo
};
var EReg = function(r,opt) {
	opt = opt.split("u").join("");
	this.r = new RegExp(r,opt);
};
EReg.__name__ = true;
EReg.prototype = {
	match: function(s) {
		if(this.r.global) this.r.lastIndex = 0;
		this.r.m = this.r.exec(s);
		this.r.s = s;
		return this.r.m != null;
	}
	,matched: function(n) {
		var tmp;
		if(this.r.m != null && n >= 0 && n < this.r.m.length) tmp = this.r.m[n]; else throw new js__$Boot_HaxeError("EReg::matched");
		return tmp;
	}
	,matchedPos: function() {
		if(this.r.m == null) throw new js__$Boot_HaxeError("No string matched");
		return { pos : this.r.m.index, len : this.r.m[0].length};
	}
	,matchSub: function(s,pos,len) {
		if(len == null) len = -1;
		var tmp;
		if(this.r.global) {
			this.r.lastIndex = pos;
			this.r.m = this.r.exec(len < 0?s:HxOverrides.substr(s,0,pos + len));
			var b = this.r.m != null;
			if(b) this.r.s = s;
			tmp = b;
		} else {
			var b1 = this.match(len < 0?HxOverrides.substr(s,pos,null):HxOverrides.substr(s,pos,len));
			if(b1) {
				this.r.s = s;
				this.r.m.index += pos;
			}
			tmp = b1;
		}
		return tmp;
	}
	,split: function(s) {
		var d = "#__delim__#";
		return s.replace(this.r,d).split(d);
	}
	,replace: function(s,by) {
		return s.replace(this.r,by);
	}
	,map: function(s,f) {
		var offset = 0;
		var buf_b = "";
		while(true) {
			if(offset >= s.length) break; else if(!this.matchSub(s,offset)) {
				var x = HxOverrides.substr(s,offset,null);
				buf_b += x == null?"null":"" + x;
				break;
			}
			var p = this.matchedPos();
			var x1 = HxOverrides.substr(s,offset,p.pos - offset);
			buf_b += x1 == null?"null":"" + x1;
			var x2 = f(this);
			buf_b += x2 == null?"null":"" + x2;
			if(p.len == 0) {
				var x3 = HxOverrides.substr(s,p.pos,1);
				buf_b += x3 == null?"null":"" + x3;
				offset = p.pos + 1;
			} else offset = p.pos + p.len;
			if(!this.r.global) break;
		}
		if(!this.r.global && offset > 0 && offset < s.length) {
			var x4 = HxOverrides.substr(s,offset,null);
			buf_b += x4 == null?"null":"" + x4;
		}
		return buf_b;
	}
	,__class__: EReg
};
var HxOverrides = function() { };
HxOverrides.__name__ = true;
HxOverrides.cca = function(s,index) {
	var x = s.charCodeAt(index);
	if(x != x) return undefined;
	return x;
};
HxOverrides.substr = function(s,pos,len) {
	if(pos != null && pos != 0 && len != null && len < 0) return "";
	if(len == null) len = s.length;
	if(pos < 0) {
		pos = s.length + pos;
		if(pos < 0) pos = 0;
	} else if(len < 0) len = s.length + len - pos;
	return s.substr(pos,len);
};
HxOverrides.indexOf = function(a,obj,i) {
	var len = a.length;
	if(i < 0) {
		i += len;
		if(i < 0) i = 0;
	}
	while(i < len) {
		if(a[i] === obj) return i;
		i++;
	}
	return -1;
};
HxOverrides.remove = function(a,obj) {
	var i = HxOverrides.indexOf(a,obj,0);
	if(i == -1) return false;
	a.splice(i,1);
	return true;
};
HxOverrides.iter = function(a) {
	return { cur : 0, arr : a, hasNext : function() {
		return this.cur < this.arr.length;
	}, next : function() {
		return this.arr[this.cur++];
	}};
};
Math.__name__ = true;
var Std = function() { };
Std.__name__ = true;
Std.string = function(s) {
	return js_Boot.__string_rec(s,"");
};
Std.parseInt = function(x) {
	var v = parseInt(x,10);
	if(v == 0 && (HxOverrides.cca(x,1) == 120 || HxOverrides.cca(x,1) == 88)) v = parseInt(x);
	if(isNaN(v)) return null;
	return v;
};
Std.random = function(x) {
	return x <= 0?0:Math.floor(Math.random() * x);
};
var StringBuf = function() {
	this.b = "";
};
StringBuf.__name__ = true;
StringBuf.prototype = {
	__class__: StringBuf
};
var StringTools = function() { };
StringTools.__name__ = true;
StringTools.startsWith = function(s,start) {
	return s.length >= start.length && HxOverrides.substr(s,0,start.length) == start;
};
StringTools.endsWith = function(s,end) {
	var elen = end.length;
	var slen = s.length;
	return slen >= elen && HxOverrides.substr(s,slen - elen,elen) == end;
};
StringTools.isSpace = function(s,pos) {
	var c = HxOverrides.cca(s,pos);
	return c > 8 && c < 14 || c == 32;
};
StringTools.ltrim = function(s) {
	var l = s.length;
	var r = 0;
	while(r < l && StringTools.isSpace(s,r)) r++;
	if(r > 0) return HxOverrides.substr(s,r,l - r); else return s;
};
StringTools.rtrim = function(s) {
	var l = s.length;
	var r = 0;
	while(r < l && StringTools.isSpace(s,l - r - 1)) r++;
	if(r > 0) return HxOverrides.substr(s,0,l - r); else return s;
};
StringTools.trim = function(s) {
	return StringTools.ltrim(StringTools.rtrim(s));
};
StringTools.replace = function(s,sub,by) {
	return s.split(sub).join(by);
};
StringTools.hex = function(n,digits) {
	var s = "";
	while(true) {
		s = "0123456789ABCDEF".charAt(n & 15) + s;
		n >>>= 4;
		if(!(n > 0)) break;
	}
	if(digits != null) while(s.length < digits) s = "0" + s;
	return s;
};
var glaze_Engine = function(pps,broadphase) {
	this.pps = pps;
	this.broadphase = broadphase;
	this.dynamicBodies = [];
	this.sleepingBodies = [];
	this.globalForce = new glaze_geom_Vector2(0,30);
	this.globalDamping = 0.99;
	this.stepCount = 0;
	this.updateCount = 0;
	this.accumulator = 0;
	this.msPerPhysics = 1000 / pps;
	this.invMsPerPhysics = this.msPerPhysics / 1000;
};
glaze_Engine.__name__ = true;
glaze_Engine.prototype = {
	update: function(delta) {
		this.stepCount++;
		this.accumulator += delta;
		while(this.accumulator > this.msPerPhysics) {
			this.updateCount++;
			this.accumulator -= this.msPerPhysics;
			this.preUpdate(this.invMsPerPhysics);
			this.collide(this.invMsPerPhysics);
			this.updatePosition(this.invMsPerPhysics);
		}
	}
	,preUpdate: function(delta) {
		var _g = 0;
		var _g1 = this.dynamicBodies;
		while(_g < _g1.length) {
			var body = _g1[_g];
			++_g;
			body.update(delta,this.globalForce,this.globalDamping);
		}
	}
	,collide: function(delta) {
		this.broadphase.collide();
	}
	,updatePosition: function(delta) {
		var _g = 0;
		var _g1 = this.dynamicBodies;
		while(_g < _g1.length) {
			var body = _g1[_g];
			++_g;
			body.updatePosition();
		}
	}
	,addBody: function(body) {
		this.dynamicBodies.push(body);
		this.broadphase.addProxy(body.bfproxy);
	}
	,removeBody: function(body) {
		HxOverrides.remove(this.dynamicBodies,body);
		this.broadphase.removeProxy(body.bfproxy);
	}
	,__class__: glaze_Engine
};
var glaze_ds_Bytes2D = function(width,height,cellSize,bytesPerCell,data) {
	this.initalize(width,height,cellSize,bytesPerCell,data);
};
glaze_ds_Bytes2D.__name__ = true;
glaze_ds_Bytes2D.uncompressData = function(str,compressed) {
	if(compressed == null) compressed = true;
	var mapbytes = haxe_crypto_Base64.decode(str);
	if(compressed) mapbytes = haxe_zip_Uncompress.run(mapbytes);
	return mapbytes;
};
glaze_ds_Bytes2D.prototype = {
	initalize: function(width,height,cellSize,bytesPerCell,data) {
		this.width = width;
		this.height = height;
		this.internalWidth = width * bytesPerCell;
		this.cellSize = cellSize;
		this.invCellSize = 1 / cellSize;
		this.bytesPerCell = bytesPerCell;
		if(data == null) this.data = haxe_io_Bytes.alloc(width * height * bytesPerCell); else this.data = data;
		this.bytesData = this.data.b.bufferValue;
	}
	,get: function(x,y,offset) {
		return this.data.b[y * this.internalWidth + x * this.bytesPerCell + offset];
	}
	,set: function(x,y,offset,value) {
		this.data.b[y * this.internalWidth + x * this.bytesPerCell + offset] = value & 255;
	}
	,Index: function(value) {
		return value * this.invCellSize | 0;
	}
	,__class__: glaze_ds_Bytes2D
};
var glaze_geom_AABB = function() {
	this.extents = new glaze_geom_Vector2();
	this.position = new glaze_geom_Vector2();
};
glaze_geom_AABB.__name__ = true;
glaze_geom_AABB.prototype = {
	get_l: function() {
		return this.position.x - this.extents.x;
	}
	,get_t: function() {
		return this.position.y - this.extents.y;
	}
	,get_r: function() {
		return this.position.x + this.extents.x;
	}
	,get_b: function() {
		return this.position.y + this.extents.y;
	}
	,overlap: function(aabb) {
		if(Math.abs(this.position.x - aabb.position.x) > this.extents.x + aabb.extents.x) return false;
		if(Math.abs(this.position.y - aabb.position.y) > this.extents.y + aabb.extents.y) return false;
		return true;
	}
	,containsAABB: function(aabb) {
		return false;
	}
	,containsPoint: function(point) {
		return Math.abs(point.x - this.position.x) < this.extents.x && Math.abs(point.y - this.position.y) < this.extents.y;
	}
	,overlapArea: function(aabb) {
		var _l = Math.max(this.position.x - this.extents.x,aabb.position.x - aabb.extents.x);
		var _r = Math.min(this.position.x + this.extents.x,aabb.position.x + aabb.extents.x);
		var _t = Math.max(this.position.y - this.extents.y,aabb.position.y - aabb.extents.y);
		var _b = Math.min(this.position.y + this.extents.y,aabb.position.y + aabb.extents.y);
		return (_r - _l) * (_b - _t);
	}
	,clone: function(aabb) {
		var aabb1 = new glaze_geom_AABB();
		var _this = aabb1.position;
		var v = this.position;
		_this.x = v.x;
		_this.y = v.y;
		var _this1 = aabb1.extents;
		var v1 = this.extents;
		_this1.x = v1.x;
		_this1.y = v1.y;
		return aabb1;
	}
	,__class__: glaze_geom_AABB
};
var glaze_geom_AABB2 = function(t,r,b,l) {
	if(l == null) l = .0;
	if(b == null) b = .0;
	if(r == null) r = .0;
	if(t == null) t = .0;
	this.b = -Infinity;
	this.r = -Infinity;
	this.t = Infinity;
	this.l = Infinity;
	this.t = t;
	this.r = r;
	this.b = b;
	this.l = l;
};
glaze_geom_AABB2.__name__ = true;
glaze_geom_AABB2.prototype = {
	setToSweeptAABB: function(aabb,preditcedPosition) {
		this.l = aabb.position.x - aabb.extents.x;
		this.r = aabb.position.x + aabb.extents.x;
		this.t = aabb.position.y - aabb.extents.y;
		this.b = aabb.position.y + aabb.extents.y;
	}
	,fromAABB: function(aabb) {
	}
	,clone: function() {
		return new glaze_geom_AABB2(this.t,this.r,this.b,this.l);
	}
	,reset: function() {
		this.t = this.l = Infinity;
		this.r = this.b = -Infinity;
	}
	,get_width: function() {
		return this.r - this.l;
	}
	,get_height: function() {
		return this.b - this.t;
	}
	,intersect: function(aabb) {
		if(this.l > aabb.position.x + aabb.extents.x) return false; else if(this.r < aabb.position.x - aabb.extents.x) return false; else if(this.t > aabb.position.y + aabb.extents.y) return false; else if(this.b < aabb.position.y - aabb.extents.y) return false; else return true;
	}
	,addAABB: function(aabb) {
		if(aabb.position.y - aabb.extents.y < this.t) this.t = aabb.position.y - aabb.extents.y;
		if(aabb.position.x + aabb.extents.x > this.r) this.r = aabb.position.x + aabb.extents.x;
		if(aabb.position.y + aabb.extents.y > this.b) this.b = aabb.position.y + aabb.extents.y;
		if(aabb.position.x - aabb.extents.x < this.l) this.l = aabb.position.x - aabb.extents.x;
	}
	,addPoint: function(x,y) {
		if(x < this.l) this.l = x;
		if(x > this.r) this.r = x;
		if(y < this.t) this.t = y;
		if(y > this.b) this.b = y;
	}
	,expand: function(i) {
		this.l += i;
		this.r -= i;
		this.t += i;
		this.b -= i;
	}
	,__class__: glaze_geom_AABB2
};
var glaze_geom_Plane = function() {
	this.d = 0;
	this.n = new glaze_geom_Vector2();
};
glaze_geom_Plane.__name__ = true;
glaze_geom_Plane.prototype = {
	set: function(n,q) {
		var _this = this.n;
		_this.x = n.x;
		_this.y = n.y;
		var tmp;
		var _this1 = this.n;
		tmp = _this1.x * q.x + _this1.y * q.y;
		this.d = tmp;
	}
	,setFromSegment: function(s,e) {
		var _this = this.n;
		_this.x = s.x;
		_this.y = s.y;
		var _this1 = this.n;
		_this1.x -= e.x;
		_this1.y -= e.y;
		this.n.normalize();
		this.n.leftHandNormalEquals();
		var tmp;
		var _this2 = this.n;
		tmp = _this2.x * s.x + _this2.y * s.y;
		this.d = tmp;
	}
	,distancePoint: function(q) {
		var tmp;
		var _this = this.n;
		tmp = _this.x * q.x + _this.y * q.y;
		return tmp - this.d;
	}
	,__class__: glaze_geom_Plane
};
var glaze_geom_Vector2 = function(x,y) {
	if(y == null) y = .0;
	if(x == null) x = .0;
	this.x = x;
	this.y = y;
};
glaze_geom_Vector2.__name__ = true;
glaze_geom_Vector2.prototype = {
	setTo: function(x,y) {
		this.x = x;
		this.y = y;
	}
	,copy: function(v) {
		this.x = v.x;
		this.y = v.y;
	}
	,clone: function() {
		return new glaze_geom_Vector2(this.x,this.y);
	}
	,normalize: function() {
		var t = Math.sqrt(this.x * this.x + this.y * this.y) + 1e-08;
		this.x /= t;
		this.y /= t;
		return t;
	}
	,length: function() {
		return Math.sqrt(this.x * this.x + this.y * this.y);
	}
	,clampScalar: function(max) {
		var l = Math.sqrt(this.x * this.x + this.y * this.y);
		if(l > max) {
			var s = max / l;
			this.x *= s;
			this.y *= s;
		}
	}
	,clampVector: function(v) {
		this.x = Math.min(Math.max(this.x,-v.x),v.x);
		this.y = Math.min(Math.max(this.y,-v.y),v.y);
	}
	,plusEquals: function(v) {
		this.x += v.x;
		this.y += v.y;
	}
	,minusEquals: function(v) {
		this.x -= v.x;
		this.y -= v.y;
	}
	,multEquals: function(s) {
		this.x *= s;
		this.y *= s;
	}
	,plusMultEquals: function(v,s) {
		this.x += v.x * s;
		this.y += v.y * s;
	}
	,minusMultEquals: function(v,s) {
		this.x -= v.x * s;
		this.y -= v.y * s;
	}
	,dot: function(v) {
		return this.x * v.x + this.y * v.y;
	}
	,cross: function(v) {
		return this.x * v.y - this.y * v.x;
	}
	,leftHandNormal: function() {
		return new glaze_geom_Vector2(this.y,-this.x);
	}
	,leftHandNormalEquals: function() {
		var t = this.x;
		this.x = this.y;
		this.y = -t;
	}
	,rightHandNormal: function() {
		return new glaze_geom_Vector2(-this.y,this.x);
	}
	,reflectEquals: function(normal) {
		var d = this.x * normal.x + this.y * normal.y;
		this.x -= 2 * d * normal.x;
		this.y -= 2 * d * normal.y;
	}
	,__class__: glaze_geom_Vector2
};
var glaze_physics_Body = function(w,h,material,filter) {
	this.debug = 0;
	this.bounceCount = 0;
	this.totalBounceCount = 0;
	this.onGroundPrev = false;
	this.onGround = false;
	this.dt = 0;
	this.invMass = 1;
	this.mass = 1;
	this.damping = 1;
	this.isBullet = false;
	this.accumulatedForces = new glaze_geom_Vector2();
	this.forces = new glaze_geom_Vector2();
	this.bfproxy = new glaze_physics_collision_BFProxy();
	this.aabb = new glaze_geom_AABB();
	this.maxVelocity = new glaze_geom_Vector2();
	this.maxScalarVelocity = 1000;
	this.stepContactCount = 0;
	this.lastNormal = new glaze_geom_Vector2();
	this.originalVelocity = new glaze_geom_Vector2();
	this.velocity = new glaze_geom_Vector2();
	this.previousPosition = new glaze_geom_Vector2();
	this.delta = new glaze_geom_Vector2();
	this.predictedPosition = new glaze_geom_Vector2();
	this.positionCorrection = new glaze_geom_Vector2();
	this.position = new glaze_geom_Vector2();
	var _this = this.aabb.extents;
	_this.x = w;
	_this.y = h;
	this.material = material;
	this.filter = filter;
	this.aabb.position = this.position;
	this.setMass(1);
	this.bfproxy.body = this;
	this.bfproxy.filter = this.filter;
	this.bfproxy.aabb = this.aabb;
	this.bfproxy.isStatic = false;
};
glaze_physics_Body.__name__ = true;
glaze_physics_Body.prototype = {
	update: function(dt,globalForces,globalDamping) {
		this.dt = dt;
		var _this = this.forces;
		_this.x += globalForces.x;
		_this.y += globalForces.y;
		var _this1 = this.velocity;
		var v = this.forces;
		_this1.x += v.x;
		_this1.y += v.y;
		var _this2 = this.velocity;
		var s = globalDamping * this.damping;
		_this2.x *= s;
		_this2.y *= s;
		if(!this.isBullet) {
			if(this.maxScalarVelocity > 0) this.velocity.clampScalar(this.maxScalarVelocity); else {
				var _this3 = this.velocity;
				var v1 = this.maxVelocity;
				_this3.x = Math.min(Math.max(_this3.x,-v1.x),v1.x);
				_this3.y = Math.min(Math.max(_this3.y,-v1.y),v1.y);
			}
		}
		var _this4 = this.originalVelocity;
		var v2 = this.velocity;
		_this4.x = v2.x;
		_this4.y = v2.y;
		var _this5 = this.predictedPosition;
		var v3 = this.position;
		_this5.x = v3.x;
		_this5.y = v3.y;
		var _this6 = this.predictedPosition;
		var v4 = this.velocity;
		_this6.x += v4.x * dt;
		_this6.y += v4.y * dt;
		var _this7 = this.previousPosition;
		var v5 = this.position;
		_this7.x = v5.x;
		_this7.y = v5.y;
		var _this8 = this.delta;
		var v6 = this.predictedPosition;
		_this8.x = v6.x;
		_this8.y = v6.y;
		var _this9 = this.delta;
		var v7 = this.position;
		_this9.x -= v7.x;
		_this9.y -= v7.y;
		var _this10 = this.forces;
		_this10.x = 0;
		_this10.y = 0;
		this.damping = 1;
		this.onGroundPrev = this.onGround;
		this.onGround = false;
		this.stepContactCount = 0;
		this.toi = Infinity;
	}
	,respondStaticCollision: function(contact) {
		var seperation = Math.max(contact.distance,0);
		var penetration = Math.min(contact.distance,0);
		var _this = this.positionCorrection;
		var v = contact.normal;
		var s = penetration / this.dt;
		_this.x -= v.x * s;
		_this.y -= v.y * s;
		var tmp;
		var _this1 = this.velocity;
		var v1 = contact.normal;
		tmp = _this1.x * v1.x + _this1.y * v1.y;
		var nv = tmp + seperation / this.dt;
		if(nv < 0) {
			this.stepContactCount++;
			var _this2 = this.velocity;
			var v2 = contact.normal;
			_this2.x -= v2.x * nv;
			_this2.y -= v2.y * nv;
			if(!(this.bounceCount != this.totalBounceCount) && contact.normal.y < 0) this.onGround = true;
			var _this3 = this.lastNormal;
			var v3 = contact.normal;
			_this3.x = v3.x;
			_this3.y = v3.y;
			return true;
		}
		return false;
	}
	,t: function(msg) {
		if(this.debug > 0) {
			haxe_Log.trace(msg,{ fileName : "Body.hx", lineNumber : 143, className : "glaze.physics.Body", methodName : "t"});
			this.debug--;
		}
	}
	,respondBulletCollision: function(contact) {
		if(contact.time <= this.toi) {
			this.toi = contact.time;
			var _this = this.positionCorrection;
			var v = contact.sweepPosition;
			_this.x = v.x;
			_this.y = v.y;
			var _this1 = this.lastNormal;
			var v1 = contact.normal;
			_this1.x = v1.x;
			_this1.y = v1.y;
			return true;
		}
		return false;
	}
	,updatePosition: function() {
		if(this.isBullet) {
			if(this.toi < Infinity) {
				var _this = this.position;
				var v = this.positionCorrection;
				_this.x = v.x;
				_this.y = v.y;
				this.originalVelocity.reflectEquals(this.lastNormal);
				var _this1 = this.originalVelocity;
				var s = this.material.elasticity;
				_this1.x *= s;
				_this1.y *= s;
				var _this2 = this.velocity;
				var v1 = this.originalVelocity;
				_this2.x = v1.x;
				_this2.y = v1.y;
			} else {
				var _this3 = this.position;
				var v2 = this.predictedPosition;
				_this3.x = v2.x;
				_this3.y = v2.y;
			}
			return;
		}
		if(this.stepContactCount > 0 && !(this.bounceCount != this.totalBounceCount) && this.lastNormal.y < 0) {
			var tangent = this.lastNormal.rightHandNormal();
			var tmp;
			var _this4 = this.originalVelocity;
			tmp = _this4.x * tangent.x + _this4.y * tangent.y;
			var tv = tmp * this.material.friction;
			this.velocity.x -= tangent.x * tv;
			this.velocity.y -= tangent.y * tv;
		}
		var _this5 = this.positionCorrection;
		var v3 = this.velocity;
		_this5.x += v3.x;
		_this5.y += v3.y;
		var _this6 = this.positionCorrection;
		var s1 = this.dt;
		_this6.x *= s1;
		_this6.y *= s1;
		var _this7 = this.position;
		var v4 = this.positionCorrection;
		_this7.x += v4.x;
		_this7.y += v4.y;
		var _this8 = this.positionCorrection;
		_this8.x = 0;
		_this8.y = 0;
		if(this.stepContactCount > 0 && this.bounceCount != this.totalBounceCount) {
			this.originalVelocity.reflectEquals(this.lastNormal);
			var _this9 = this.originalVelocity;
			var s2 = this.material.elasticity;
			_this9.x *= s2;
			_this9.y *= s2;
			var _this10 = this.velocity;
			var v5 = this.originalVelocity;
			_this10.x = v5.x;
			_this10.y = v5.y;
			this.bounceCount++;
		}
	}
	,addForce: function(f) {
		var _this = this.forces;
		var s = this.invMass;
		_this.x += f.x * s;
		_this.y += f.y * s;
	}
	,addMasslessForce: function(f) {
		var _this = this.forces;
		_this.x += f.x;
		_this.y += f.y;
	}
	,setMass: function(mass) {
		this.mass = mass;
		this.invMass = 1 / mass;
	}
	,setBounces: function(count) {
		this.totalBounceCount = count;
		this.bounceCount = 0;
	}
	,get_canBounce: function() {
		return this.bounceCount != this.totalBounceCount;
	}
	,__class__: glaze_physics_Body
};
var glaze_physics_Material = function(density,elasticity,friction) {
	if(friction == null) friction = 0.1;
	if(elasticity == null) elasticity = 0.3;
	if(density == null) density = 1;
	this.density = density;
	this.elasticity = elasticity;
	this.friction = friction;
};
glaze_physics_Material.__name__ = true;
glaze_physics_Material.prototype = {
	__class__: glaze_physics_Material
};
var glaze_physics_collision_BFProxy = function() {
	this.contactCallback = null;
	this.isSensor = false;
	this.isStatic = false;
};
glaze_physics_collision_BFProxy.__name__ = true;
glaze_physics_collision_BFProxy.CreateStaticFeature = function(x,y,hw,hh) {
	var bfproxy = new glaze_physics_collision_BFProxy();
	bfproxy.aabb = new glaze_geom_AABB();
	var _this = bfproxy.aabb.position;
	_this.x = x;
	_this.y = y;
	var _this1 = bfproxy.aabb.extents;
	_this1.x = hw;
	_this1.y = hh;
	bfproxy.isStatic = true;
	return bfproxy;
};
glaze_physics_collision_BFProxy.prototype = {
	__class__: glaze_physics_collision_BFProxy
};
var glaze_physics_collision_Contact = function() {
	this.sweepPosition = new glaze_geom_Vector2();
	this.time = 0;
	this.distance = 0;
	this.normal = new glaze_geom_Vector2();
	this.delta = new glaze_geom_Vector2();
	this.position = new glaze_geom_Vector2();
};
glaze_physics_collision_Contact.__name__ = true;
glaze_physics_collision_Contact.prototype = {
	setTo: function(contact) {
		this.position.x = contact.position.x;
		this.position.y = contact.position.y;
		this.delta.x = contact.delta.x;
		this.delta.y = contact.delta.y;
		this.normal.x = contact.normal.x;
		this.normal.y = contact.normal.y;
		this.time = contact.time;
		this.distance = contact.distance;
		this.sweepPosition.x = contact.sweepPosition.x;
		this.sweepPosition.y = contact.sweepPosition.y;
	}
	,__class__: glaze_physics_collision_Contact
};
var glaze_physics_collision_Filter = function() {
	this.groupIndex = 0;
	this.maskBits = 65535;
	this.categoryBits = 1;
};
glaze_physics_collision_Filter.__name__ = true;
glaze_physics_collision_Filter.CHECK = function(filterA,filterB) {
	if(filterA == null || filterB == null) return true; else if(filterA.groupIndex > 0 && filterB.groupIndex > 0 && filterA.groupIndex == filterB.groupIndex) return false; else {
		if((filterA.maskBits & filterB.categoryBits) == 0) return false;
		if((filterA.categoryBits & filterB.maskBits) == 0) return false;
	}
	return true;
};
glaze_physics_collision_Filter.prototype = {
	__class__: glaze_physics_collision_Filter
};
var glaze_physics_collision_Intersect = function() {
	this.contact = new glaze_physics_collision_Contact();
};
glaze_physics_collision_Intersect.__name__ = true;
glaze_physics_collision_Intersect.StaticAABBvsStaticAABB = function(aabb_position_A,aabb_extents_A,aabb_position_B,aabb_extents_B,contact) {
	var dx = aabb_position_B.x - aabb_position_A.x;
	var px = aabb_extents_B.x + aabb_extents_A.x - Math.abs(dx);
	if(px <= 0) return false;
	var dy = aabb_position_B.y - aabb_position_A.y;
	var py = aabb_extents_B.y + aabb_extents_A.y - Math.abs(dy);
	if(py <= 0) return false;
	if(px < py) {
		var sx = dx < 0?-1:1;
		contact.distance = contact.delta.x = px * sx;
		contact.delta.y = 0;
		contact.normal.x = sx;
		contact.normal.y = 0;
		contact.position.x = aabb_position_A.x + aabb_extents_A.x * sx;
		contact.position.y = aabb_position_B.y;
	} else {
		var sy = dy < 0?-1:1;
		contact.delta.x = 0;
		contact.distance = contact.delta.y = py * sy;
		contact.normal.x = 0;
		contact.normal.y = sy;
		contact.position.x = aabb_position_B.x;
		contact.position.y = aabb_position_A.y + aabb_extents_A.y * sy;
	}
	return true;
};
glaze_physics_collision_Intersect.StaticSegmentvsStaticAABB = function(aabb_position,aabb_extents,segment_position,segment_delta,paddingX,paddingY,contact) {
	var scaleX = 1 / segment_delta.x;
	var scaleY = 1 / segment_delta.y;
	var signX = scaleX < 0?-1:1;
	var signY = scaleY < 0?-1:1;
	var nearTimeX = (aabb_position.x - signX * (aabb_extents.x + paddingX) - segment_position.x) * scaleX;
	var nearTimeY = (aabb_position.y - signY * (aabb_extents.y + paddingY) - segment_position.y) * scaleY;
	var farTimeX = (aabb_position.x + signX * (aabb_extents.x + paddingX) - segment_position.x) * scaleX;
	var farTimeY = (aabb_position.y + signY * (aabb_extents.y + paddingY) - segment_position.y) * scaleY;
	if(nearTimeX > farTimeY || nearTimeY > farTimeX) return false;
	var nearTime = Math.max(nearTimeX,nearTimeY);
	var farTime = Math.min(farTimeX,farTimeY);
	if(nearTime >= 1 || farTime <= 0) return false;
	contact.time = Math.min(Math.max(nearTime,0),1);
	if(nearTimeX > nearTimeY) {
		contact.normal.x = -signX;
		contact.normal.y = 0;
	} else {
		contact.normal.x = 0;
		contact.normal.y = -signY;
	}
	contact.delta.x = contact.time * segment_delta.x;
	contact.delta.y = contact.time * segment_delta.y;
	contact.position.x = segment_position.x + contact.delta.x;
	contact.position.y = segment_position.y + contact.delta.y;
	return true;
};
glaze_physics_collision_Intersect.StaticAABBvsSweeptAABB = function(aabb_position_A,aabb_extents_A,aabb_position_B,aabb_extents_B,aabb_delta_B,contact) {
	if(aabb_delta_B.x == 0 && aabb_delta_B.y == 0) {
		contact.sweepPosition.x = aabb_position_B.x;
		contact.sweepPosition.y = aabb_position_B.y;
		if(glaze_physics_collision_Intersect.StaticAABBvsStaticAABB(aabb_position_A,aabb_extents_A,aabb_position_B,aabb_extents_B,contact)) {
			contact.time = 0;
			return true;
		} else {
			contact.time = 1;
			return false;
		}
	} else if(glaze_physics_collision_Intersect.StaticSegmentvsStaticAABB(aabb_position_A,aabb_extents_A,aabb_position_B,aabb_delta_B,aabb_extents_B.x,aabb_extents_B.y,contact)) {
		contact.time = Math.min(Math.max(contact.time - 1e-8,0),1);
		contact.sweepPosition.x = aabb_position_B.x + aabb_delta_B.x * contact.time;
		contact.sweepPosition.y = aabb_position_B.y + aabb_delta_B.y * contact.time;
		var t = Math.sqrt(aabb_delta_B.x * aabb_delta_B.x + aabb_delta_B.y * aabb_delta_B.y);
		contact.position.x += aabb_delta_B.x / t * aabb_extents_B.x;
		contact.position.y += aabb_delta_B.y / t * aabb_extents_B.y;
		return true;
	} else {
		contact.sweepPosition.x = aabb_position_B.x * aabb_delta_B.x;
		contact.sweepPosition.y = aabb_position_B.y * aabb_delta_B.y;
		return false;
	}
};
glaze_physics_collision_Intersect.AABBvsStaticSolidAABB = function(aabb_position_A,aabb_extents_A,aabb_position_B,aabb_extents_B,contact) {
	var dx = aabb_position_B.x - aabb_position_A.x;
	var px = aabb_extents_B.x + aabb_extents_A.x - Math.abs(dx);
	var dy = aabb_position_B.y - aabb_position_A.y;
	var py = aabb_extents_B.y + aabb_extents_A.y - Math.abs(dy);
	if(px < py) {
		contact.normal.x = dx < 0?1:-1;
		contact.normal.y = 0;
	} else {
		contact.normal.x = 0;
		contact.normal.y = dy < 0?1:-1;
	}
	var pcx = contact.normal.x * (aabb_extents_A.x + aabb_extents_B.x) + aabb_position_B.x;
	var pcy = contact.normal.y * (aabb_extents_A.y + aabb_extents_B.y) + aabb_position_B.y;
	var pdx = aabb_position_A.x - pcx;
	var pdy = aabb_position_A.y - pcy;
	contact.distance = pdx * contact.normal.x + pdy * contact.normal.y;
	return true;
};
glaze_physics_collision_Intersect.prototype = {
	Collide: function(proxyA,proxyB) {
		if(proxyA.isStatic && proxyB.isStatic || proxyA.isSensor && proxyB.isSensor) return false;
		if(!glaze_physics_collision_Filter.CHECK(proxyA.filter,proxyB.filter)) return false;
		var collided = false;
		if(proxyA.isSensor || proxyB.isSensor) collided = glaze_physics_collision_Intersect.StaticAABBvsStaticAABB(proxyA.aabb.position,proxyA.aabb.extents,proxyB.aabb.position,proxyB.aabb.extents,this.contact); else if(!proxyA.isStatic && !proxyB.isStatic) {
			if(proxyA.body.isBullet && proxyB.body.isBullet) return false; else if(proxyA.body.isBullet) {
				if(glaze_physics_collision_Intersect.StaticAABBvsSweeptAABB(proxyB.aabb.position,proxyB.aabb.extents,proxyA.aabb.position,proxyA.aabb.extents,proxyA.body.delta,this.contact) == true) {
					proxyA.body.respondBulletCollision(this.contact);
					collided = true;
				}
			} else if(proxyB.body.isBullet) {
				if(glaze_physics_collision_Intersect.StaticAABBvsSweeptAABB(proxyA.aabb.position,proxyA.aabb.extents,proxyB.aabb.position,proxyB.aabb.extents,proxyB.body.delta,this.contact) == true) {
					proxyB.body.respondBulletCollision(this.contact);
					collided = true;
				}
			} else collided = glaze_physics_collision_Intersect.StaticAABBvsStaticAABB(proxyA.aabb.position,proxyA.aabb.extents,proxyB.aabb.position,proxyB.aabb.extents,this.contact);
		} else {
			var staticProxy;
			var dynamicProxy;
			if(proxyA.isStatic) {
				staticProxy = proxyA;
				dynamicProxy = proxyB;
			} else {
				staticProxy = proxyB;
				dynamicProxy = proxyA;
			}
			glaze_physics_collision_Intersect.AABBvsStaticSolidAABB(dynamicProxy.aabb.position,dynamicProxy.aabb.extents,staticProxy.aabb.position,staticProxy.aabb.extents,this.contact);
			collided = dynamicProxy.body.respondStaticCollision(this.contact);
		}
		if(collided == true) {
			if(proxyA.contactCallback != null) proxyA.contactCallback(proxyA,proxyB,this.contact);
			if(proxyB.contactCallback != null) proxyB.contactCallback(proxyB,proxyA,this.contact);
		}
		return collided;
	}
	,RayAABB: function(ray,proxy) {
		if(glaze_physics_collision_Intersect.StaticSegmentvsStaticAABB(proxy.aabb.position,proxy.aabb.extents,ray.origin,ray.delta,0,0,this.contact)) {
			ray.report(this.contact.delta.x,this.contact.delta.y,this.contact.normal.x,this.contact.normal.y,proxy);
			return true;
		}
		return false;
	}
	,Spring: function(bodyA,bodyB,length,k) {
		var dx = bodyA.position.x - bodyB.position.x;
		var dy = bodyA.position.y - bodyB.position.y;
		var dist = Math.sqrt(dx * dx + dy * dy);
		if(dist < length) return;
		var dx_n = dx / dist;
		var dy_n = dy / dist;
		var true_offset = dist - length;
		dx_n *= true_offset;
		dy_n *= true_offset;
		var fx = k * dx_n;
		var fy = k * dy_n;
		bodyA.addForce(new glaze_geom_Vector2(fx,fy));
		bodyB.addForce(new glaze_geom_Vector2(-fx,-fy));
	}
	,__class__: glaze_physics_collision_Intersect
};
var glaze_physics_collision_Map = function(data) {
	this.plane = new glaze_geom_Plane();
	this.tileExtents = new glaze_geom_Vector2();
	this.tilePosition = new glaze_geom_Vector2();
	this.data = data;
	this.tileSize = data.cellSize;
	this.tileHalfSize = this.tileSize / 2;
	var _this = this.tileExtents;
	_this.x = this.tileHalfSize;
	_this.y = this.tileHalfSize;
	this.contact = new glaze_physics_collision_Contact();
};
glaze_physics_collision_Map.__name__ = true;
glaze_physics_collision_Map.prototype = {
	testCollision: function(body) {
		var tmp;
		var value = Math.min(body.position.x,body.predictedPosition.x) - body.aabb.extents.x;
		tmp = value * this.data.invCellSize | 0;
		var startX = tmp;
		var tmp1;
		var value1 = Math.min(body.position.y,body.predictedPosition.y) - body.aabb.extents.y;
		tmp1 = value1 * this.data.invCellSize | 0;
		var startY = tmp1;
		var tmp2;
		var value2 = Math.max(body.position.x,body.predictedPosition.x) + body.aabb.extents.x - .01;
		tmp2 = value2 * this.data.invCellSize | 0;
		var endX = tmp2 + 1;
		var tmp3;
		var value3 = Math.max(body.position.y,body.predictedPosition.y) + body.aabb.extents.y;
		tmp3 = value3 * this.data.invCellSize | 0;
		var endY = tmp3 + 1;
		this.plane.setFromSegment(body.predictedPosition,body.position);
		var _g = startX;
		while(_g < endX) {
			var x = _g++;
			var _g1 = startY;
			while(_g1 < endY) {
				var y = _g1++;
				var tmp4;
				var _this = this.data;
				tmp4 = _this.data.b[y * _this.internalWidth + x * _this.bytesPerCell];
				var cell = tmp4;
				if(cell > 0) {
					this.tilePosition.x = x * this.tileSize + this.tileHalfSize;
					this.tilePosition.y = y * this.tileSize + this.tileHalfSize;
					if(body.isBullet) {
						if(Math.abs(this.plane.distancePoint(this.tilePosition)) < 40) {
							if(glaze_physics_collision_Intersect.StaticAABBvsSweeptAABB(this.tilePosition,this.tileExtents,body.position,body.aabb.extents,body.delta,this.contact) == true) body.respondBulletCollision(this.contact);
						}
					} else if(glaze_physics_collision_Intersect.AABBvsStaticSolidAABB(body.position,body.aabb.extents,this.tilePosition,this.tileExtents,this.contact) == true) {
						var nextX = x + (this.contact.normal.x | 0);
						var nextY = y + (this.contact.normal.y | 0);
						var tmp5;
						var _this1 = this.data;
						tmp5 = _this1.data.b[nextY * _this1.internalWidth + nextX * _this1.bytesPerCell];
						var nextCell = tmp5;
						if(nextCell == 0) {
							body.respondStaticCollision(this.contact);
							if(this.debug != null) this.debug(x,y);
						} else {
						}
					}
				}
			}
		}
	}
	,AABBvsStaticTileAABBSlope: function(aabb_position_A,aabb_extents_A,aabb_position_B,aabb_extents_B,contact) {
		new glaze_geom_Vector2(0.707106781186547462,-0.707106781186547462);
		var dx = aabb_position_B.x - aabb_position_A.x;
		var px = aabb_extents_B.x + aabb_extents_A.x - Math.abs(dx);
		var dy = aabb_position_B.y - aabb_position_A.y;
		var py = aabb_extents_B.y + aabb_extents_A.y - Math.abs(dy);
		if(px < py) {
			contact.normal.x = dx < 0?1:-1;
			contact.normal.y = 0;
		} else {
			contact.normal.x = 0;
			contact.normal.y = dy < 0?1:-1;
		}
		if(px >= 0 && py >= 0) {
			haxe_Log.trace("a",{ fileName : "Map.hx", lineNumber : 103, className : "glaze.physics.collision.Map", methodName : "AABBvsStaticTileAABBSlope"});
			contact.normal.x = 0.707106781186547462;
			contact.normal.y = -0.707106781186547462;
			var cornerTile = new glaze_geom_Vector2(aabb_position_B.x - aabb_extents_B.x,aabb_position_B.y - aabb_extents_B.y);
			var tmp;
			var _this = contact.normal;
			tmp = _this.x * cornerTile.x + _this.y * cornerTile.y;
			var d = tmp;
			var cornerBody = new glaze_geom_Vector2(aabb_position_A.x - aabb_extents_A.x,aabb_position_A.y + aabb_extents_A.y);
			var tmp1;
			var _this1 = contact.normal;
			tmp1 = _this1.x * cornerBody.x + _this1.y * cornerBody.y;
			var tmp2;
			var _this2 = contact.normal;
			var v = contact.normal;
			tmp2 = _this2.x * v.x + _this2.y * v.y;
			contact.distance = (tmp1 - d) / tmp2;
			return true;
		} else {
			haxe_Log.trace("b",{ fileName : "Map.hx", lineNumber : 114, className : "glaze.physics.collision.Map", methodName : "AABBvsStaticTileAABBSlope"});
			var pcx = contact.normal.x * (aabb_extents_A.x + aabb_extents_B.x) + aabb_position_B.x;
			var pcy = contact.normal.y * (aabb_extents_A.y + aabb_extents_B.y) + aabb_position_B.y;
			var pdx = aabb_position_A.x - pcx;
			var pdy = aabb_position_A.y - pcy;
			contact.distance = pdx * contact.normal.x + pdy * contact.normal.y;
			return true;
		}
	}
	,castRay: function(ray) {
		var x = ray.origin.x * this.data.invCellSize | 0;
		var y = ray.origin.y * this.data.invCellSize | 0;
		var cX = x * this.tileSize;
		var cY = y * this.tileSize;
		var d = ray.direction;
		var stepX = 0;
		var tMaxX = 100000000;
		var tDeltaX = 0;
		if(d.x < 0) {
			stepX = -1;
			tMaxX = (cX - ray.origin.x) / d.x;
			tDeltaX = this.tileSize / -d.x;
		} else if(d.x > 0) {
			stepX = 1;
			tMaxX = (cX + this.tileSize - ray.origin.x) / d.x;
			tDeltaX = this.tileSize / d.x;
		}
		var stepY = 0;
		var tMaxY = 100000000;
		var tDeltaY = 0;
		if(d.y < 0) {
			stepY = -1;
			tMaxY = (cY - ray.origin.y) / d.y;
			tDeltaY = this.tileSize / -d.y;
		} else if(d.y > 0) {
			stepY = 1;
			tMaxY = (cY + this.tileSize - ray.origin.y) / d.y;
			tDeltaY = this.tileSize / d.y;
		}
		var distX = .0;
		var distY = .0;
		var transitionEdgeNormalX = 0;
		var transitionEdgeNormalY = 0;
		while(true) {
			if(tMaxX < tMaxY) {
				distX = tMaxX * d.x;
				distY = tMaxX * d.y;
				tMaxX += tDeltaX;
				x += stepX;
			} else {
				distX = tMaxY * d.x;
				distY = tMaxY * d.y;
				tMaxY += tDeltaY;
				y += stepY;
			}
			if(distX * distX + distY * distY > ray.range * ray.range) return false;
			var tmp;
			var _this = this.data;
			tmp = _this.data.b[y * _this.internalWidth + x * _this.bytesPerCell];
			var tile = tmp;
			if(tile > 0) {
				if(tMaxX < tMaxY) {
					transitionEdgeNormalX = stepX < 0?1:-1;
					transitionEdgeNormalY = 0;
				} else {
					transitionEdgeNormalX = 0;
					transitionEdgeNormalY = stepY < 0?1:-1;
				}
				ray.report(distX,distY,transitionEdgeNormalX,transitionEdgeNormalY);
				return true;
			}
		}
		return false;
	}
	,__class__: glaze_physics_collision_Map
};
var glaze_physics_collision_Ray = function() {
	this.contact = new glaze_physics_collision_Contact();
	this.direction = new glaze_geom_Vector2();
	this.delta = new glaze_geom_Vector2();
	this.range = 0;
	this.target = new glaze_geom_Vector2();
	this.origin = new glaze_geom_Vector2();
};
glaze_physics_collision_Ray.__name__ = true;
glaze_physics_collision_Ray.prototype = {
	initalize: function(origin,target,range,callback) {
		this.reset();
		var _this = this.origin;
		_this.x = origin.x;
		_this.y = origin.y;
		var _this1 = this.target;
		_this1.x = target.x;
		_this1.y = target.y;
		var _this2 = this.delta;
		_this2.x = target.x;
		_this2.y = target.y;
		var _this3 = this.delta;
		_this3.x -= origin.x;
		_this3.y -= origin.y;
		var _this4 = this.direction;
		var v = this.delta;
		_this4.x = v.x;
		_this4.y = v.y;
		this.direction.normalize();
		if(range <= 0) {
			var tmp;
			var _this5 = this.delta;
			tmp = Math.sqrt(_this5.x * _this5.x + _this5.y * _this5.y);
			this.range = tmp;
		} else {
			this.range = range;
			var _this6 = this.delta;
			var v1 = this.direction;
			_this6.x = v1.x;
			_this6.y = v1.y;
			var _this7 = this.delta;
			_this7.x *= range;
			_this7.y *= range;
		}
		this.callback = callback;
	}
	,reset: function() {
		this.contact.distance = 9999999999;
		this.hit = false;
	}
	,report: function(distX,distY,normalX,normalY,proxy) {
		if(this.callback != null && proxy != null) {
			if(this.callback(proxy) < 0) {
				haxe_Log.trace("filtered",{ fileName : "Ray.hx", lineNumber : 59, className : "glaze.physics.collision.Ray", methodName : "report"});
				return;
			}
		}
		var distSqrd = distX * distX + distY * distY;
		if(distSqrd < this.contact.distance * this.contact.distance) {
			var _this = this.contact.position;
			_this.x = this.origin.x + distX;
			_this.y = this.origin.y + distY;
			var _this1 = this.contact.normal;
			_this1.x = normalX;
			_this1.y = normalY;
			this.contact.distance = Math.sqrt(distSqrd);
			this.hit = true;
		}
	}
	,__class__: glaze_physics_collision_Ray
};
var glaze_physics_collision_broadphase_IBroadphase = function() { };
glaze_physics_collision_broadphase_IBroadphase.__name__ = true;
glaze_physics_collision_broadphase_IBroadphase.prototype = {
	__class__: glaze_physics_collision_broadphase_IBroadphase
};
var glaze_physics_collision_broadphase_BruteforceBroadphase = function(map,nf) {
	this.map = map;
	this.nf = nf;
	this.staticProxies = [];
	this.dynamicProxies = [];
};
glaze_physics_collision_broadphase_BruteforceBroadphase.__name__ = true;
glaze_physics_collision_broadphase_BruteforceBroadphase.__interfaces__ = [glaze_physics_collision_broadphase_IBroadphase];
glaze_physics_collision_broadphase_BruteforceBroadphase.prototype = {
	addProxy: function(proxy) {
		var target = proxy.isStatic?this.staticProxies:this.dynamicProxies;
		target.push(proxy);
	}
	,removeProxy: function(proxy) {
		var target = proxy.isStatic?this.staticProxies:this.dynamicProxies;
		HxOverrides.remove(target,proxy);
	}
	,collide: function() {
		var count = this.dynamicProxies.length;
		var _g = 0;
		while(_g < count) {
			var i = _g++;
			var dynamicProxy = this.dynamicProxies[i];
			this.map.testCollision(dynamicProxy.body);
			var _g1 = 0;
			var _g2 = this.staticProxies;
			while(_g1 < _g2.length) {
				var staticProxy = _g2[_g1];
				++_g1;
				this.nf.Collide(dynamicProxy,staticProxy);
			}
			var _g11 = i + 1;
			while(_g11 < count) {
				var j = _g11++;
				var dynamicProxyB = this.dynamicProxies[j];
				this.nf.Collide(dynamicProxy,dynamicProxyB);
			}
		}
	}
	,QueryArea: function(aabb,result,checkDynamic,checkStatic) {
		if(checkStatic == null) checkStatic = true;
		if(checkDynamic == null) checkDynamic = true;
		if(checkDynamic) {
			var _g = 0;
			var _g1 = this.staticProxies;
			while(_g < _g1.length) {
				var proxy = _g1[_g];
				++_g;
				var tmp;
				if(!proxy.isSensor) {
					var aabb1 = proxy.aabb;
					if(Math.abs(aabb.position.x - aabb1.position.x) > aabb.extents.x + aabb1.extents.x) tmp = false; else if(Math.abs(aabb.position.y - aabb1.position.y) > aabb.extents.y + aabb1.extents.y) tmp = false; else tmp = true;
				} else tmp = false;
				if(tmp) result(proxy);
			}
		}
		if(checkStatic) {
			var _g2 = 0;
			var _g11 = this.dynamicProxies;
			while(_g2 < _g11.length) {
				var proxy1 = _g11[_g2];
				++_g2;
				var tmp1;
				if(!proxy1.isSensor) {
					var aabb2 = proxy1.aabb;
					if(Math.abs(aabb.position.x - aabb2.position.x) > aabb.extents.x + aabb2.extents.x) tmp1 = false; else if(Math.abs(aabb.position.y - aabb2.position.y) > aabb.extents.y + aabb2.extents.y) tmp1 = false; else tmp1 = true;
				} else tmp1 = false;
				if(tmp1) result(proxy1);
			}
		}
	}
	,CastRay: function(ray,result,checkDynamic,checkStatic) {
		if(checkStatic == null) checkStatic = true;
		if(checkDynamic == null) checkDynamic = true;
		this.map.castRay(ray);
		if(checkDynamic) {
			var _g = 0;
			var _g1 = this.dynamicProxies;
			while(_g < _g1.length) {
				var proxy = _g1[_g];
				++_g;
				if(!proxy.isSensor) this.nf.RayAABB(ray,proxy);
			}
		}
		if(checkStatic) {
			var _g2 = 0;
			var _g11 = this.staticProxies;
			while(_g2 < _g11.length) {
				var proxy1 = _g11[_g2];
				++_g2;
				if(!proxy1.isSensor) this.nf.RayAABB(ray,proxy1);
			}
		}
	}
	,__class__: glaze_physics_collision_broadphase_BruteforceBroadphase
};
var haxe_StackItem = { __ename__ : true, __constructs__ : ["CFunction","Module","FilePos","Method","LocalFunction"] };
haxe_StackItem.CFunction = ["CFunction",0];
haxe_StackItem.CFunction.__enum__ = haxe_StackItem;
haxe_StackItem.Module = function(m) { var $x = ["Module",1,m]; $x.__enum__ = haxe_StackItem; return $x; };
haxe_StackItem.FilePos = function(s,file,line) { var $x = ["FilePos",2,s,file,line]; $x.__enum__ = haxe_StackItem; return $x; };
haxe_StackItem.Method = function(classname,method) { var $x = ["Method",3,classname,method]; $x.__enum__ = haxe_StackItem; return $x; };
haxe_StackItem.LocalFunction = function(v) { var $x = ["LocalFunction",4,v]; $x.__enum__ = haxe_StackItem; return $x; };
var haxe_CallStack = function() { };
haxe_CallStack.__name__ = true;
haxe_CallStack.getStack = function(e) {
	if(e == null) return [];
	var oldValue = Error.prepareStackTrace;
	Error.prepareStackTrace = function(error,callsites) {
		var stack = [];
		var _g = 0;
		while(_g < callsites.length) {
			var site = callsites[_g];
			++_g;
			if(haxe_CallStack.wrapCallSite != null) site = haxe_CallStack.wrapCallSite(site);
			var method = null;
			var fullName = site.getFunctionName();
			if(fullName != null) {
				var idx = fullName.lastIndexOf(".");
				if(idx >= 0) {
					var className = HxOverrides.substr(fullName,0,idx);
					var methodName = HxOverrides.substr(fullName,idx + 1,null);
					method = haxe_StackItem.Method(className,methodName);
				}
			}
			stack.push(haxe_StackItem.FilePos(method,site.getFileName(),site.getLineNumber()));
		}
		return stack;
	};
	var a = haxe_CallStack.makeStack(e.stack);
	Error.prepareStackTrace = oldValue;
	return a;
};
haxe_CallStack.callStack = function() {
	try {
		throw new Error();
	} catch( e ) {
		haxe_CallStack.lastException = e;
		if (e instanceof js__$Boot_HaxeError) e = e.val;
		var a = haxe_CallStack.getStack(e);
		a.shift();
		return a;
	}
};
haxe_CallStack.exceptionStack = function() {
	return haxe_CallStack.getStack(haxe_CallStack.lastException);
};
haxe_CallStack.toString = function(stack) {
	var b = new StringBuf();
	var _g = 0;
	while(_g < stack.length) {
		var s = stack[_g];
		++_g;
		b.b += "\nCalled from ";
		haxe_CallStack.itemToString(b,s);
	}
	return b.b;
};
haxe_CallStack.itemToString = function(b,s) {
	switch(s[1]) {
	case 0:
		b.b += "a C function";
		break;
	case 1:
		var m = s[2];
		b.b += "module ";
		b.b += m == null?"null":"" + m;
		break;
	case 2:
		var line = s[4];
		var file = s[3];
		var s1 = s[2];
		if(s1 != null) {
			haxe_CallStack.itemToString(b,s1);
			b.b += " (";
		}
		b.b += file == null?"null":"" + file;
		b.b += " line ";
		b.b += line == null?"null":"" + line;
		if(s1 != null) b.b += ")";
		break;
	case 3:
		var meth = s[3];
		var cname = s[2];
		b.b += cname == null?"null":"" + cname;
		b.b += ".";
		b.b += meth == null?"null":"" + meth;
		break;
	case 4:
		var n = s[2];
		b.b += "local function #";
		b.b += n == null?"null":"" + n;
		break;
	}
};
haxe_CallStack.makeStack = function(s) {
	if(s == null) return []; else if(typeof(s) == "string") {
		var stack = s.split("\n");
		if(stack[0] == "Error") stack.shift();
		var m = [];
		var rie10 = new EReg("^   at ([A-Za-z0-9_. ]+) \\(([^)]+):([0-9]+):([0-9]+)\\)$","");
		var _g = 0;
		while(_g < stack.length) {
			var line = stack[_g];
			++_g;
			if(rie10.match(line)) {
				var path = rie10.matched(1).split(".");
				var meth = path.pop();
				var file = rie10.matched(2);
				var line1 = Std.parseInt(rie10.matched(3));
				m.push(haxe_StackItem.FilePos(meth == "Anonymous function"?haxe_StackItem.LocalFunction():meth == "Global code"?null:haxe_StackItem.Method(path.join("."),meth),file,line1));
			} else m.push(haxe_StackItem.Module(StringTools.trim(line)));
		}
		return m;
	} else return s;
};
var haxe_IMap = function() { };
haxe_IMap.__name__ = true;
haxe_IMap.prototype = {
	__class__: haxe_IMap
};
var haxe__$Int64__$_$_$Int64 = function(high,low) {
	this.high = high;
	this.low = low;
};
haxe__$Int64__$_$_$Int64.__name__ = true;
haxe__$Int64__$_$_$Int64.prototype = {
	__class__: haxe__$Int64__$_$_$Int64
};
var haxe_Log = function() { };
haxe_Log.__name__ = true;
haxe_Log.trace = function(v,infos) {
	js_Boot.__trace(v,infos);
};
var haxe_crypto_Adler32 = function() {
	this.a1 = 1;
	this.a2 = 0;
};
haxe_crypto_Adler32.__name__ = true;
haxe_crypto_Adler32.read = function(i) {
	var a = new haxe_crypto_Adler32();
	var a2a = i.readByte();
	var a2b = i.readByte();
	var a1a = i.readByte();
	var a1b = i.readByte();
	a.a1 = a1a << 8 | a1b;
	a.a2 = a2a << 8 | a2b;
	return a;
};
haxe_crypto_Adler32.prototype = {
	update: function(b,pos,len) {
		var a1 = this.a1;
		var a2 = this.a2;
		var _g1 = pos;
		var _g = pos + len;
		while(_g1 < _g) {
			var p = _g1++;
			var c = b.b[p];
			a1 = (a1 + c) % 65521;
			a2 = (a2 + a1) % 65521;
		}
		this.a1 = a1;
		this.a2 = a2;
	}
	,equals: function(a) {
		return a.a1 == this.a1 && a.a2 == this.a2;
	}
	,__class__: haxe_crypto_Adler32
};
var haxe_io_Bytes = function(data) {
	this.length = data.byteLength;
	this.b = new Uint8Array(data);
	this.b.bufferValue = data;
	data.hxBytes = this;
	data.bytes = this.b;
};
haxe_io_Bytes.__name__ = true;
haxe_io_Bytes.alloc = function(length) {
	return new haxe_io_Bytes(new ArrayBuffer(length));
};
haxe_io_Bytes.ofString = function(s) {
	var a = [];
	var i = 0;
	while(i < s.length) {
		var tmp;
		var index = i++;
		tmp = s.charCodeAt(index);
		var c = tmp;
		if(55296 <= c && c <= 56319) {
			var tmp1;
			var index1 = i++;
			tmp1 = s.charCodeAt(index1);
			c = c - 55232 << 10 | tmp1 & 1023;
		}
		if(c <= 127) a.push(c); else if(c <= 2047) {
			a.push(192 | c >> 6);
			a.push(128 | c & 63);
		} else if(c <= 65535) {
			a.push(224 | c >> 12);
			a.push(128 | c >> 6 & 63);
			a.push(128 | c & 63);
		} else {
			a.push(240 | c >> 18);
			a.push(128 | c >> 12 & 63);
			a.push(128 | c >> 6 & 63);
			a.push(128 | c & 63);
		}
	}
	return new haxe_io_Bytes(new Uint8Array(a).buffer);
};
haxe_io_Bytes.prototype = {
	blit: function(pos,src,srcpos,len) {
		if(pos < 0 || srcpos < 0 || len < 0 || pos + len > this.length || srcpos + len > src.length) throw new js__$Boot_HaxeError(haxe_io_Error.OutsideBounds);
		if(srcpos == 0 && len == src.length) this.b.set(src.b,pos); else this.b.set(src.b.subarray(srcpos,srcpos + len),pos);
	}
	,__class__: haxe_io_Bytes
};
var haxe_crypto_Base64 = function() { };
haxe_crypto_Base64.__name__ = true;
haxe_crypto_Base64.decode = function(str,complement) {
	if(complement == null) complement = true;
	if(complement) while(HxOverrides.cca(str,str.length - 1) == 61) str = HxOverrides.substr(str,0,-1);
	return new haxe_crypto_BaseCode(haxe_crypto_Base64.BYTES).decodeBytes(haxe_io_Bytes.ofString(str));
};
var haxe_crypto_BaseCode = function(base) {
	var len = base.length;
	var nbits = 1;
	while(len > 1 << nbits) nbits++;
	if(nbits > 8 || len != 1 << nbits) throw new js__$Boot_HaxeError("BaseCode : base length must be a power of two.");
	this.base = base;
	this.nbits = nbits;
};
haxe_crypto_BaseCode.__name__ = true;
haxe_crypto_BaseCode.prototype = {
	initTable: function() {
		var tbl = [];
		var _g = 0;
		while(_g < 256) {
			var i = _g++;
			tbl[i] = -1;
		}
		var _g1 = 0;
		var _g2 = this.base.length;
		while(_g1 < _g2) {
			var i1 = _g1++;
			tbl[this.base.b[i1]] = i1;
		}
		this.tbl = tbl;
	}
	,decodeBytes: function(b) {
		var nbits = this.nbits;
		if(this.tbl == null) this.initTable();
		var tbl = this.tbl;
		var size = b.length * nbits >> 3;
		var out = haxe_io_Bytes.alloc(size);
		var buf = 0;
		var curbits = 0;
		var pin = 0;
		var pout = 0;
		while(pout < size) {
			while(curbits < 8) {
				curbits += nbits;
				buf <<= nbits;
				var tmp;
				var pos = pin++;
				tmp = b.b[pos];
				var i = tbl[tmp];
				if(i == -1) throw new js__$Boot_HaxeError("BaseCode : invalid encoded char");
				buf |= i;
			}
			curbits -= 8;
			var pos1 = pout++;
			out.b[pos1] = buf >> curbits & 255 & 255;
		}
		return out;
	}
	,__class__: haxe_crypto_BaseCode
};
var haxe_ds_IntMap = function() {
	this.h = { };
};
haxe_ds_IntMap.__name__ = true;
haxe_ds_IntMap.__interfaces__ = [haxe_IMap];
haxe_ds_IntMap.prototype = {
	set: function(key,value) {
		this.h[key] = value;
	}
	,get: function(key) {
		return this.h[key];
	}
	,__class__: haxe_ds_IntMap
};
var haxe_ds_StringMap = function() {
	this.h = { };
};
haxe_ds_StringMap.__name__ = true;
haxe_ds_StringMap.__interfaces__ = [haxe_IMap];
haxe_ds_StringMap.prototype = {
	set: function(key,value) {
		if(__map_reserved[key] != null) this.setReserved(key,value); else this.h[key] = value;
	}
	,get: function(key) {
		if(__map_reserved[key] != null) return this.getReserved(key);
		return this.h[key];
	}
	,setReserved: function(key,value) {
		if(this.rh == null) this.rh = { };
		this.rh["$" + key] = value;
	}
	,getReserved: function(key) {
		return this.rh == null?null:this.rh["$" + key];
	}
	,existsReserved: function(key) {
		if(this.rh == null) return false;
		return this.rh.hasOwnProperty("$" + key);
	}
	,remove: function(key) {
		if(__map_reserved[key] != null) {
			key = "$" + key;
			if(this.rh == null || !this.rh.hasOwnProperty(key)) return false;
			delete(this.rh[key]);
			return true;
		} else {
			if(!this.h.hasOwnProperty(key)) return false;
			delete(this.h[key]);
			return true;
		}
	}
	,__class__: haxe_ds_StringMap
};
var haxe_io_BytesBuffer = function() {
	this.b = [];
};
haxe_io_BytesBuffer.__name__ = true;
haxe_io_BytesBuffer.prototype = {
	getBytes: function() {
		var bytes = new haxe_io_Bytes(new Uint8Array(this.b).buffer);
		this.b = null;
		return bytes;
	}
	,__class__: haxe_io_BytesBuffer
};
var haxe_io_Input = function() { };
haxe_io_Input.__name__ = true;
haxe_io_Input.prototype = {
	readByte: function() {
		throw new js__$Boot_HaxeError("Not implemented");
	}
	,readBytes: function(s,pos,len) {
		var k = len;
		var b = s.b;
		if(pos < 0 || len < 0 || pos + len > s.length) throw new js__$Boot_HaxeError(haxe_io_Error.OutsideBounds);
		while(k > 0) {
			b[pos] = this.readByte();
			pos++;
			k--;
		}
		return len;
	}
	,read: function(nbytes) {
		var s = haxe_io_Bytes.alloc(nbytes);
		var p = 0;
		while(nbytes > 0) {
			var k = this.readBytes(s,p,nbytes);
			if(k == 0) throw new js__$Boot_HaxeError(haxe_io_Error.Blocked);
			p += k;
			nbytes -= k;
		}
		return s;
	}
	,readUInt16: function() {
		var ch1 = this.readByte();
		var ch2 = this.readByte();
		return this.bigEndian?ch2 | ch1 << 8:ch1 | ch2 << 8;
	}
	,__class__: haxe_io_Input
};
var haxe_io_BytesInput = function(b,pos,len) {
	if(pos == null) pos = 0;
	if(len == null) len = b.length - pos;
	if(pos < 0 || len < 0 || pos + len > b.length) throw new js__$Boot_HaxeError(haxe_io_Error.OutsideBounds);
	this.b = b.b;
	this.pos = pos;
	this.len = len;
	this.totlen = len;
};
haxe_io_BytesInput.__name__ = true;
haxe_io_BytesInput.__super__ = haxe_io_Input;
haxe_io_BytesInput.prototype = $extend(haxe_io_Input.prototype,{
	readByte: function() {
		if(this.len == 0) throw new js__$Boot_HaxeError(new haxe_io_Eof());
		this.len--;
		return this.b[this.pos++];
	}
	,readBytes: function(buf,pos,len) {
		if(pos < 0 || len < 0 || pos + len > buf.length) throw new js__$Boot_HaxeError(haxe_io_Error.OutsideBounds);
		if(this.len == 0 && len > 0) throw new js__$Boot_HaxeError(new haxe_io_Eof());
		if(this.len < len) len = this.len;
		var b1 = this.b;
		var b2 = buf.b;
		var _g = 0;
		while(_g < len) {
			var i = _g++;
			b2[pos + i] = b1[this.pos + i];
		}
		this.pos += len;
		this.len -= len;
		return len;
	}
	,__class__: haxe_io_BytesInput
});
var haxe_io_Eof = function() {
};
haxe_io_Eof.__name__ = true;
haxe_io_Eof.prototype = {
	toString: function() {
		return "Eof";
	}
	,__class__: haxe_io_Eof
};
var haxe_io_Error = { __ename__ : true, __constructs__ : ["Blocked","Overflow","OutsideBounds","Custom"] };
haxe_io_Error.Blocked = ["Blocked",0];
haxe_io_Error.Blocked.__enum__ = haxe_io_Error;
haxe_io_Error.Overflow = ["Overflow",1];
haxe_io_Error.Overflow.__enum__ = haxe_io_Error;
haxe_io_Error.OutsideBounds = ["OutsideBounds",2];
haxe_io_Error.OutsideBounds.__enum__ = haxe_io_Error;
haxe_io_Error.Custom = function(e) { var $x = ["Custom",3,e]; $x.__enum__ = haxe_io_Error; return $x; };
var haxe_io_FPHelper = function() { };
haxe_io_FPHelper.__name__ = true;
haxe_io_FPHelper.i32ToFloat = function(i) {
	var sign = 1 - (i >>> 31 << 1);
	var exp = i >>> 23 & 255;
	var sig = i & 8388607;
	if(sig == 0 && exp == 0) return 0.0;
	return sign * (1 + Math.pow(2,-23) * sig) * Math.pow(2,exp - 127);
};
haxe_io_FPHelper.floatToI32 = function(f) {
	if(f == 0) return 0;
	var af = f < 0?-f:f;
	var exp = Math.floor(Math.log(af) / 0.6931471805599453);
	if(exp < -127) exp = -127; else if(exp > 128) exp = 128;
	var sig = Math.round((af / Math.pow(2,exp) - 1) * 8388608) & 8388607;
	return (f < 0?-2147483648:0) | exp + 127 << 23 | sig;
};
haxe_io_FPHelper.i64ToDouble = function(low,high) {
	var sign = 1 - (high >>> 31 << 1);
	var exp = (high >> 20 & 2047) - 1023;
	var sig = (high & 1048575) * 4294967296. + (low >>> 31) * 2147483648. + (low & 2147483647);
	if(sig == 0 && exp == -1023) return 0.0;
	return sign * (1.0 + Math.pow(2,-52) * sig) * Math.pow(2,exp);
};
haxe_io_FPHelper.doubleToI64 = function(v) {
	var i64 = haxe_io_FPHelper.i64tmp;
	if(v == 0) {
		i64.low = 0;
		i64.high = 0;
	} else {
		var av = v < 0?-v:v;
		var exp = Math.floor(Math.log(av) / 0.6931471805599453);
		var tmp;
		var v1 = (av / Math.pow(2,exp) - 1) * 4503599627370496.;
		tmp = Math.round(v1);
		var sig = tmp;
		var sig_l = sig | 0;
		var sig_h = sig / 4294967296.0 | 0;
		i64.low = sig_l;
		i64.high = (v < 0?-2147483648:0) | exp + 1023 << 20 | sig_h;
	}
	return i64;
};
var haxe_zip_Huffman = { __ename__ : true, __constructs__ : ["Found","NeedBit","NeedBits"] };
haxe_zip_Huffman.Found = function(i) { var $x = ["Found",0,i]; $x.__enum__ = haxe_zip_Huffman; return $x; };
haxe_zip_Huffman.NeedBit = function(left,right) { var $x = ["NeedBit",1,left,right]; $x.__enum__ = haxe_zip_Huffman; return $x; };
haxe_zip_Huffman.NeedBits = function(n,table) { var $x = ["NeedBits",2,n,table]; $x.__enum__ = haxe_zip_Huffman; return $x; };
var haxe_zip_HuffTools = function() {
};
haxe_zip_HuffTools.__name__ = true;
haxe_zip_HuffTools.prototype = {
	treeDepth: function(t) {
		var tmp;
		switch(t[1]) {
		case 0:
			tmp = 0;
			break;
		case 2:
			throw new js__$Boot_HaxeError("assert");
			break;
		case 1:
			var da = this.treeDepth(t[2]);
			var db = this.treeDepth(t[3]);
			tmp = 1 + (da < db?da:db);
			break;
		}
		return tmp;
	}
	,treeCompress: function(t) {
		var d = this.treeDepth(t);
		if(d == 0) return t;
		if(d == 1) {
			var tmp;
			switch(t[1]) {
			case 1:
				tmp = haxe_zip_Huffman.NeedBit(this.treeCompress(t[2]),this.treeCompress(t[3]));
				break;
			default:
				throw new js__$Boot_HaxeError("assert");
			}
			return tmp;
		}
		var size = 1 << d;
		var table = [];
		var _g = 0;
		while(_g < size) {
			_g++;
			table.push(haxe_zip_Huffman.Found(-1));
		}
		this.treeWalk(table,0,0,d,t);
		return haxe_zip_Huffman.NeedBits(d,table);
	}
	,treeWalk: function(table,p,cd,d,t) {
		switch(t[1]) {
		case 1:
			if(d > 0) {
				this.treeWalk(table,p,cd + 1,d - 1,t[2]);
				this.treeWalk(table,p | 1 << cd,cd + 1,d - 1,t[3]);
			} else table[p] = this.treeCompress(t);
			break;
		default:
			table[p] = this.treeCompress(t);
		}
	}
	,treeMake: function(bits,maxbits,v,len) {
		if(len > maxbits) throw new js__$Boot_HaxeError("Invalid huffman");
		var idx = v << 5 | len;
		if(bits.h.hasOwnProperty(idx)) return haxe_zip_Huffman.Found(bits.h[idx]);
		v <<= 1;
		len += 1;
		return haxe_zip_Huffman.NeedBit(this.treeMake(bits,maxbits,v,len),this.treeMake(bits,maxbits,v | 1,len));
	}
	,make: function(lengths,pos,nlengths,maxbits) {
		var counts = [];
		var tmp = [];
		if(maxbits > 32) throw new js__$Boot_HaxeError("Invalid huffman");
		var _g = 0;
		while(_g < maxbits) {
			_g++;
			counts.push(0);
			tmp.push(0);
		}
		var _g1 = 0;
		while(_g1 < nlengths) {
			var i = _g1++;
			var p = lengths[i + pos];
			if(p >= maxbits) throw new js__$Boot_HaxeError("Invalid huffman");
			counts[p]++;
		}
		var code = 0;
		var _g11 = 1;
		var _g2 = maxbits - 1;
		while(_g11 < _g2) {
			var i1 = _g11++;
			code = code + counts[i1] << 1;
			tmp[i1] = code;
		}
		var bits = new haxe_ds_IntMap();
		var _g3 = 0;
		while(_g3 < nlengths) {
			var i2 = _g3++;
			var l = lengths[i2 + pos];
			if(l != 0) {
				var n = tmp[l - 1];
				tmp[l - 1] = n + 1;
				bits.h[n << 5 | l] = i2;
			}
		}
		return this.treeCompress(haxe_zip_Huffman.NeedBit(this.treeMake(bits,maxbits,0,1),this.treeMake(bits,maxbits,1,1)));
	}
	,__class__: haxe_zip_HuffTools
};
var haxe_zip__$InflateImpl_Window = function(hasCrc) {
	this.buffer = haxe_io_Bytes.alloc(65536);
	this.pos = 0;
	if(hasCrc) this.crc = new haxe_crypto_Adler32();
};
haxe_zip__$InflateImpl_Window.__name__ = true;
haxe_zip__$InflateImpl_Window.prototype = {
	slide: function() {
		if(this.crc != null) this.crc.update(this.buffer,0,32768);
		var b = haxe_io_Bytes.alloc(65536);
		this.pos -= 32768;
		b.blit(0,this.buffer,32768,this.pos);
		this.buffer = b;
	}
	,addBytes: function(b,p,len) {
		if(this.pos + len > 65536) this.slide();
		this.buffer.blit(this.pos,b,p,len);
		this.pos += len;
	}
	,addByte: function(c) {
		if(this.pos == 65536) this.slide();
		this.buffer.b[this.pos] = c & 255;
		this.pos++;
	}
	,getLastChar: function() {
		return this.buffer.b[this.pos - 1];
	}
	,available: function() {
		return this.pos;
	}
	,checksum: function() {
		if(this.crc != null) this.crc.update(this.buffer,0,this.pos);
		return this.crc;
	}
	,__class__: haxe_zip__$InflateImpl_Window
};
var haxe_zip__$InflateImpl_State = { __ename__ : true, __constructs__ : ["Head","Block","CData","Flat","Crc","Dist","DistOne","Done"] };
haxe_zip__$InflateImpl_State.Head = ["Head",0];
haxe_zip__$InflateImpl_State.Head.__enum__ = haxe_zip__$InflateImpl_State;
haxe_zip__$InflateImpl_State.Block = ["Block",1];
haxe_zip__$InflateImpl_State.Block.__enum__ = haxe_zip__$InflateImpl_State;
haxe_zip__$InflateImpl_State.CData = ["CData",2];
haxe_zip__$InflateImpl_State.CData.__enum__ = haxe_zip__$InflateImpl_State;
haxe_zip__$InflateImpl_State.Flat = ["Flat",3];
haxe_zip__$InflateImpl_State.Flat.__enum__ = haxe_zip__$InflateImpl_State;
haxe_zip__$InflateImpl_State.Crc = ["Crc",4];
haxe_zip__$InflateImpl_State.Crc.__enum__ = haxe_zip__$InflateImpl_State;
haxe_zip__$InflateImpl_State.Dist = ["Dist",5];
haxe_zip__$InflateImpl_State.Dist.__enum__ = haxe_zip__$InflateImpl_State;
haxe_zip__$InflateImpl_State.DistOne = ["DistOne",6];
haxe_zip__$InflateImpl_State.DistOne.__enum__ = haxe_zip__$InflateImpl_State;
haxe_zip__$InflateImpl_State.Done = ["Done",7];
haxe_zip__$InflateImpl_State.Done.__enum__ = haxe_zip__$InflateImpl_State;
var haxe_zip_InflateImpl = function(i,header,crc) {
	if(crc == null) crc = true;
	if(header == null) header = true;
	this["final"] = false;
	this.htools = new haxe_zip_HuffTools();
	this.huffman = this.buildFixedHuffman();
	this.huffdist = null;
	this.len = 0;
	this.dist = 0;
	this.state = header?haxe_zip__$InflateImpl_State.Head:haxe_zip__$InflateImpl_State.Block;
	this.input = i;
	this.bits = 0;
	this.nbits = 0;
	this.needed = 0;
	this.output = null;
	this.outpos = 0;
	this.lengths = [];
	var _g = 0;
	while(_g < 19) {
		_g++;
		this.lengths.push(-1);
	}
	this.window = new haxe_zip__$InflateImpl_Window(crc);
};
haxe_zip_InflateImpl.__name__ = true;
haxe_zip_InflateImpl.run = function(i,bufsize) {
	if(bufsize == null) bufsize = 65536;
	var buf = haxe_io_Bytes.alloc(bufsize);
	var output = new haxe_io_BytesBuffer();
	var inflate = new haxe_zip_InflateImpl(i);
	while(true) {
		var len = inflate.readBytes(buf,0,bufsize);
		if(len < 0 || len > buf.length) throw new js__$Boot_HaxeError(haxe_io_Error.OutsideBounds);
		var b2 = buf.b;
		var _g1 = 0;
		while(_g1 < len) {
			var i1 = _g1++;
			output.b.push(b2[i1]);
		}
		if(len < bufsize) break;
	}
	return output.getBytes();
};
haxe_zip_InflateImpl.prototype = {
	buildFixedHuffman: function() {
		if(haxe_zip_InflateImpl.FIXED_HUFFMAN != null) return haxe_zip_InflateImpl.FIXED_HUFFMAN;
		var a = [];
		var _g = 0;
		while(_g < 288) {
			var n = _g++;
			a.push(n <= 143?8:n <= 255?9:n <= 279?7:8);
		}
		haxe_zip_InflateImpl.FIXED_HUFFMAN = this.htools.make(a,0,288,10);
		return haxe_zip_InflateImpl.FIXED_HUFFMAN;
	}
	,readBytes: function(b,pos,len) {
		this.needed = len;
		this.outpos = pos;
		this.output = b;
		if(len > 0) while(this.inflateLoop()) {
		}
		return len - this.needed;
	}
	,getBits: function(n) {
		while(this.nbits < n) {
			this.bits |= this.input.readByte() << this.nbits;
			this.nbits += 8;
		}
		var b = this.bits & (1 << n) - 1;
		this.nbits -= n;
		this.bits >>= n;
		return b;
	}
	,getBit: function() {
		if(this.nbits == 0) {
			this.nbits = 8;
			this.bits = this.input.readByte();
		}
		var b = (this.bits & 1) == 1;
		this.nbits--;
		this.bits >>= 1;
		return b;
	}
	,getRevBits: function(n) {
		return n == 0?0:this.getBit()?1 << n - 1 | this.getRevBits(n - 1):this.getRevBits(n - 1);
	}
	,resetBits: function() {
		this.bits = 0;
		this.nbits = 0;
	}
	,addBytes: function(b,p,len) {
		this.window.addBytes(b,p,len);
		this.output.blit(this.outpos,b,p,len);
		this.needed -= len;
		this.outpos += len;
	}
	,addByte: function(b) {
		this.window.addByte(b);
		this.output.b[this.outpos] = b & 255;
		this.needed--;
		this.outpos++;
	}
	,addDistOne: function(n) {
		var c = this.window.getLastChar();
		var _g = 0;
		while(_g < n) {
			_g++;
			this.addByte(c);
		}
	}
	,addDist: function(d,len) {
		this.addBytes(this.window.buffer,this.window.pos - d,len);
	}
	,applyHuffman: function(h) {
		var tmp;
		switch(h[1]) {
		case 0:
			tmp = h[2];
			break;
		case 1:
			tmp = this.applyHuffman(this.getBit()?h[3]:h[2]);
			break;
		case 2:
			tmp = this.applyHuffman(h[3][this.getBits(h[2])]);
			break;
		}
		return tmp;
	}
	,inflateLengths: function(a,max) {
		var i = 0;
		var prev = 0;
		while(i < max) {
			var n = this.applyHuffman(this.huffman);
			switch(n) {
			case 0:case 1:case 2:case 3:case 4:case 5:case 6:case 7:case 8:case 9:case 10:case 11:case 12:case 13:case 14:case 15:
				prev = n;
				a[i] = n;
				i++;
				break;
			case 16:
				var end = i + 3 + this.getBits(2);
				if(end > max) throw new js__$Boot_HaxeError("Invalid data");
				while(i < end) {
					a[i] = prev;
					i++;
				}
				break;
			case 17:
				i += 3 + this.getBits(3);
				if(i > max) throw new js__$Boot_HaxeError("Invalid data");
				break;
			case 18:
				i += 11 + this.getBits(7);
				if(i > max) throw new js__$Boot_HaxeError("Invalid data");
				break;
			default:
				throw new js__$Boot_HaxeError("Invalid data");
			}
		}
	}
	,inflateLoop: function() {
		var _g = this.state;
		switch(_g[1]) {
		case 0:
			var cmf = this.input.readByte();
			var cm = cmf & 15;
			if(cm != 8) throw new js__$Boot_HaxeError("Invalid data");
			var flg = this.input.readByte();
			var fdict = (flg & 32) != 0;
			if(((cmf << 8) + flg) % 31 != 0) throw new js__$Boot_HaxeError("Invalid data");
			if(fdict) throw new js__$Boot_HaxeError("Unsupported dictionary");
			this.state = haxe_zip__$InflateImpl_State.Block;
			return true;
		case 4:
			var calc = this.window.checksum();
			if(calc == null) {
				this.state = haxe_zip__$InflateImpl_State.Done;
				return true;
			}
			var crc = haxe_crypto_Adler32.read(this.input);
			if(!calc.equals(crc)) throw new js__$Boot_HaxeError("Invalid CRC");
			this.state = haxe_zip__$InflateImpl_State.Done;
			return true;
		case 7:
			return false;
		case 1:
			this["final"] = this.getBit();
			var _g1 = this.getBits(2);
			switch(_g1) {
			case 0:
				this.len = this.input.readUInt16();
				var nlen = this.input.readUInt16();
				if(nlen != 65535 - this.len) throw new js__$Boot_HaxeError("Invalid data");
				this.state = haxe_zip__$InflateImpl_State.Flat;
				var r = this.inflateLoop();
				this.resetBits();
				return r;
			case 1:
				this.huffman = this.buildFixedHuffman();
				this.huffdist = null;
				this.state = haxe_zip__$InflateImpl_State.CData;
				return true;
			case 2:
				var hlit = this.getBits(5) + 257;
				var hdist = this.getBits(5) + 1;
				var hclen = this.getBits(4) + 4;
				var _g2 = 0;
				while(_g2 < hclen) {
					var i = _g2++;
					this.lengths[haxe_zip_InflateImpl.CODE_LENGTHS_POS[i]] = this.getBits(3);
				}
				var _g21 = hclen;
				while(_g21 < 19) {
					var i1 = _g21++;
					this.lengths[haxe_zip_InflateImpl.CODE_LENGTHS_POS[i1]] = 0;
				}
				this.huffman = this.htools.make(this.lengths,0,19,8);
				var lengths = [];
				var _g3 = 0;
				var _g22 = hlit + hdist;
				while(_g3 < _g22) {
					_g3++;
					lengths.push(0);
				}
				this.inflateLengths(lengths,hlit + hdist);
				this.huffdist = this.htools.make(lengths,hlit,hdist,16);
				this.huffman = this.htools.make(lengths,0,hlit,16);
				this.state = haxe_zip__$InflateImpl_State.CData;
				return true;
			default:
				throw new js__$Boot_HaxeError("Invalid data");
			}
			break;
		case 3:
			var rlen = this.len < this.needed?this.len:this.needed;
			var bytes = this.input.read(rlen);
			this.len -= rlen;
			this.addBytes(bytes,0,rlen);
			if(this.len == 0) this.state = this["final"]?haxe_zip__$InflateImpl_State.Crc:haxe_zip__$InflateImpl_State.Block;
			return this.needed > 0;
		case 6:
			var rlen1 = this.len < this.needed?this.len:this.needed;
			this.addDistOne(rlen1);
			this.len -= rlen1;
			if(this.len == 0) this.state = haxe_zip__$InflateImpl_State.CData;
			return this.needed > 0;
		case 5:
			while(this.len > 0 && this.needed > 0) {
				var rdist = this.len < this.dist?this.len:this.dist;
				var rlen2 = this.needed < rdist?this.needed:rdist;
				this.addDist(this.dist,rlen2);
				this.len -= rlen2;
			}
			if(this.len == 0) this.state = haxe_zip__$InflateImpl_State.CData;
			return this.needed > 0;
		case 2:
			var n = this.applyHuffman(this.huffman);
			if(n < 256) {
				this.addByte(n);
				return this.needed > 0;
			} else if(n == 256) {
				this.state = this["final"]?haxe_zip__$InflateImpl_State.Crc:haxe_zip__$InflateImpl_State.Block;
				return true;
			} else {
				n -= 257;
				var extra_bits = haxe_zip_InflateImpl.LEN_EXTRA_BITS_TBL[n];
				if(extra_bits == -1) throw new js__$Boot_HaxeError("Invalid data");
				this.len = haxe_zip_InflateImpl.LEN_BASE_VAL_TBL[n] + this.getBits(extra_bits);
				var dist_code = this.huffdist == null?this.getRevBits(5):this.applyHuffman(this.huffdist);
				extra_bits = haxe_zip_InflateImpl.DIST_EXTRA_BITS_TBL[dist_code];
				if(extra_bits == -1) throw new js__$Boot_HaxeError("Invalid data");
				this.dist = haxe_zip_InflateImpl.DIST_BASE_VAL_TBL[dist_code] + this.getBits(extra_bits);
				if(this.dist > this.window.available()) throw new js__$Boot_HaxeError("Invalid data");
				this.state = this.dist == 1?haxe_zip__$InflateImpl_State.DistOne:haxe_zip__$InflateImpl_State.Dist;
				return true;
			}
			break;
		}
	}
	,__class__: haxe_zip_InflateImpl
};
var haxe_zip_Uncompress = function() { };
haxe_zip_Uncompress.__name__ = true;
haxe_zip_Uncompress.run = function(src,bufsize) {
	return haxe_zip_InflateImpl.run(new haxe_io_BytesInput(src),bufsize);
};
var js__$Boot_HaxeError = function(val) {
	Error.call(this);
	this.val = val;
	this.message = String(val);
	if(Error.captureStackTrace) Error.captureStackTrace(this,js__$Boot_HaxeError);
};
js__$Boot_HaxeError.__name__ = true;
js__$Boot_HaxeError.__super__ = Error;
js__$Boot_HaxeError.prototype = $extend(Error.prototype,{
	__class__: js__$Boot_HaxeError
});
var js_Boot = function() { };
js_Boot.__name__ = true;
js_Boot.__unhtml = function(s) {
	return s.split("&").join("&amp;").split("<").join("&lt;").split(">").join("&gt;");
};
js_Boot.__trace = function(v,i) {
	var msg = i != null?i.fileName + ":" + i.lineNumber + ": ":"";
	msg += js_Boot.__string_rec(v,"");
	if(i != null && i.customParams != null) {
		var _g = 0;
		var _g1 = i.customParams;
		while(_g < _g1.length) {
			var v1 = _g1[_g];
			++_g;
			msg += "," + js_Boot.__string_rec(v1,"");
		}
	}
	var d;
	if(typeof(document) != "undefined" && (d = document.getElementById("haxe:trace")) != null) d.innerHTML += js_Boot.__unhtml(msg) + "<br/>"; else if(typeof console != "undefined" && console.log != null) console.log(msg);
};
js_Boot.getClass = function(o) {
	if((o instanceof Array) && o.__enum__ == null) return Array; else {
		var cl = o.__class__;
		if(cl != null) return cl;
		var name = js_Boot.__nativeClassName(o);
		if(name != null) return js_Boot.__resolveNativeClass(name);
		return null;
	}
};
js_Boot.__string_rec = function(o,s) {
	if(o == null) return "null";
	if(s.length >= 5) return "<...>";
	var t = typeof(o);
	if(t == "function" && (o.__name__ || o.__ename__)) t = "object";
	switch(t) {
	case "object":
		if(o instanceof Array) {
			if(o.__enum__) {
				if(o.length == 2) return o[0];
				var str2 = o[0] + "(";
				s += "\t";
				var _g1 = 2;
				var _g = o.length;
				while(_g1 < _g) {
					var i1 = _g1++;
					if(i1 != 2) str2 += "," + js_Boot.__string_rec(o[i1],s); else str2 += js_Boot.__string_rec(o[i1],s);
				}
				return str2 + ")";
			}
			var l = o.length;
			var i;
			var str1 = "[";
			s += "\t";
			var _g2 = 0;
			while(_g2 < l) {
				var i2 = _g2++;
				str1 += (i2 > 0?",":"") + js_Boot.__string_rec(o[i2],s);
			}
			str1 += "]";
			return str1;
		}
		var tostr;
		try {
			tostr = o.toString;
		} catch( e ) {
			haxe_CallStack.lastException = e;
			if (e instanceof js__$Boot_HaxeError) e = e.val;
			return "???";
		}
		if(tostr != null && tostr != Object.toString && typeof(tostr) == "function") {
			var s2 = o.toString();
			if(s2 != "[object Object]") return s2;
		}
		var k = null;
		var str = "{\n";
		s += "\t";
		var hasp = o.hasOwnProperty != null;
		for( var k in o ) {
		if(hasp && !o.hasOwnProperty(k)) {
			continue;
		}
		if(k == "prototype" || k == "__class__" || k == "__super__" || k == "__interfaces__" || k == "__properties__") {
			continue;
		}
		if(str.length != 2) str += ", \n";
		str += s + k + " : " + js_Boot.__string_rec(o[k],s);
		}
		s = s.substring(1);
		str += "\n" + s + "}";
		return str;
	case "function":
		return "<function>";
	case "string":
		return o;
	default:
		return String(o);
	}
};
js_Boot.__interfLoop = function(cc,cl) {
	if(cc == null) return false;
	if(cc == cl) return true;
	var intf = cc.__interfaces__;
	if(intf != null) {
		var _g1 = 0;
		var _g = intf.length;
		while(_g1 < _g) {
			var i = _g1++;
			var i1 = intf[i];
			if(i1 == cl || js_Boot.__interfLoop(i1,cl)) return true;
		}
	}
	return js_Boot.__interfLoop(cc.__super__,cl);
};
js_Boot.__instanceof = function(o,cl) {
	if(cl == null) return false;
	switch(cl) {
	case Int:
		return (o|0) === o;
	case Float:
		return typeof(o) == "number";
	case Bool:
		return typeof(o) == "boolean";
	case String:
		return typeof(o) == "string";
	case Array:
		return (o instanceof Array) && o.__enum__ == null;
	case Dynamic:
		return true;
	default:
		if(o != null) {
			if(typeof(cl) == "function") {
				if(o instanceof cl) return true;
				if(js_Boot.__interfLoop(js_Boot.getClass(o),cl)) return true;
			} else if(typeof(cl) == "object" && js_Boot.__isNativeObj(cl)) {
				if(o instanceof cl) return true;
			}
		} else return false;
		if(cl == Class && o.__name__ != null) return true;
		if(cl == Enum && o.__ename__ != null) return true;
		return o.__enum__ == cl;
	}
};
js_Boot.__nativeClassName = function(o) {
	var name = js_Boot.__toStr.call(o).slice(8,-1);
	if(name == "Object" || name == "Function" || name == "Math" || name == "JSON") return null;
	return name;
};
js_Boot.__isNativeObj = function(o) {
	return js_Boot.__nativeClassName(o) != null;
};
js_Boot.__resolveNativeClass = function(name) {
	return (Function("return typeof " + name + " != \"undefined\" ? " + name + " : null"))();
};
var js_html_compat_ArrayBuffer = function(a) {
	if((a instanceof Array) && a.__enum__ == null) {
		this.a = a;
		this.byteLength = a.length;
	} else {
		var len = a;
		this.a = [];
		var _g = 0;
		while(_g < len) {
			var i = _g++;
			this.a[i] = 0;
		}
		this.byteLength = len;
	}
};
js_html_compat_ArrayBuffer.__name__ = true;
js_html_compat_ArrayBuffer.sliceImpl = function(begin,end) {
	var u = new Uint8Array(this,begin,end == null?null:end - begin);
	var result = new ArrayBuffer(u.byteLength);
	var resultArray = new Uint8Array(result);
	resultArray.set(u);
	return result;
};
js_html_compat_ArrayBuffer.prototype = {
	slice: function(begin,end) {
		return new js_html_compat_ArrayBuffer(this.a.slice(begin,end));
	}
	,__class__: js_html_compat_ArrayBuffer
};
var js_html_compat_DataView = function(buffer,byteOffset,byteLength) {
	this.buf = buffer;
	this.offset = byteOffset == null?0:byteOffset;
	this.length = byteLength == null?buffer.byteLength - this.offset:byteLength;
	if(this.offset < 0 || this.length < 0 || this.offset + this.length > buffer.byteLength) throw new js__$Boot_HaxeError(haxe_io_Error.OutsideBounds);
};
js_html_compat_DataView.__name__ = true;
js_html_compat_DataView.prototype = {
	getInt8: function(byteOffset) {
		var v = this.buf.a[this.offset + byteOffset];
		return v >= 128?v - 256:v;
	}
	,getUint8: function(byteOffset) {
		return this.buf.a[this.offset + byteOffset];
	}
	,getInt16: function(byteOffset,littleEndian) {
		var v = this.getUint16(byteOffset,littleEndian);
		return v >= 32768?v - 65536:v;
	}
	,getUint16: function(byteOffset,littleEndian) {
		return littleEndian?this.buf.a[this.offset + byteOffset] | this.buf.a[this.offset + byteOffset + 1] << 8:this.buf.a[this.offset + byteOffset] << 8 | this.buf.a[this.offset + byteOffset + 1];
	}
	,getInt32: function(byteOffset,littleEndian) {
		var p = this.offset + byteOffset;
		var a = this.buf.a[p++];
		var b = this.buf.a[p++];
		var c = this.buf.a[p++];
		var d = this.buf.a[p++];
		return littleEndian?a | b << 8 | c << 16 | d << 24:d | c << 8 | b << 16 | a << 24;
	}
	,getUint32: function(byteOffset,littleEndian) {
		var v = this.getInt32(byteOffset,littleEndian);
		return v < 0?v + 4294967296.:v;
	}
	,getFloat32: function(byteOffset,littleEndian) {
		return haxe_io_FPHelper.i32ToFloat(this.getInt32(byteOffset,littleEndian));
	}
	,getFloat64: function(byteOffset,littleEndian) {
		var a = this.getInt32(byteOffset,littleEndian);
		var b = this.getInt32(byteOffset + 4,littleEndian);
		return haxe_io_FPHelper.i64ToDouble(littleEndian?a:b,littleEndian?b:a);
	}
	,setInt8: function(byteOffset,value) {
		this.buf.a[byteOffset + this.offset] = value < 0?value + 128 & 255:value & 255;
	}
	,setUint8: function(byteOffset,value) {
		this.buf.a[byteOffset + this.offset] = value & 255;
	}
	,setInt16: function(byteOffset,value,littleEndian) {
		this.setUint16(byteOffset,value < 0?value + 65536:value,littleEndian);
	}
	,setUint16: function(byteOffset,value,littleEndian) {
		var p = byteOffset + this.offset;
		if(littleEndian) {
			this.buf.a[p] = value & 255;
			this.buf.a[p++] = value >> 8 & 255;
		} else {
			this.buf.a[p++] = value >> 8 & 255;
			this.buf.a[p] = value & 255;
		}
	}
	,setInt32: function(byteOffset,value,littleEndian) {
		this.setUint32(byteOffset,value,littleEndian);
	}
	,setUint32: function(byteOffset,value,littleEndian) {
		var p = byteOffset + this.offset;
		if(littleEndian) {
			this.buf.a[p++] = value & 255;
			this.buf.a[p++] = value >> 8 & 255;
			this.buf.a[p++] = value >> 16 & 255;
			this.buf.a[p++] = value >>> 24;
		} else {
			this.buf.a[p++] = value >>> 24;
			this.buf.a[p++] = value >> 16 & 255;
			this.buf.a[p++] = value >> 8 & 255;
			this.buf.a[p++] = value & 255;
		}
	}
	,setFloat32: function(byteOffset,value,littleEndian) {
		this.setUint32(byteOffset,haxe_io_FPHelper.floatToI32(value),littleEndian);
	}
	,setFloat64: function(byteOffset,value,littleEndian) {
		var i64 = haxe_io_FPHelper.doubleToI64(value);
		if(littleEndian) {
			this.setUint32(byteOffset,i64.low);
			this.setUint32(byteOffset,i64.high);
		} else {
			this.setUint32(byteOffset,i64.high);
			this.setUint32(byteOffset,i64.low);
		}
	}
	,__class__: js_html_compat_DataView
};
var js_html_compat_Uint8Array = function() { };
js_html_compat_Uint8Array.__name__ = true;
js_html_compat_Uint8Array._new = function(arg1,offset,length) {
	var arr;
	if(typeof(arg1) == "number") {
		arr = [];
		var _g = 0;
		while(_g < arg1) {
			var i = _g++;
			arr[i] = 0;
		}
		arr.byteLength = arr.length;
		arr.byteOffset = 0;
		arr.buffer = new js_html_compat_ArrayBuffer(arr);
	} else if(js_Boot.__instanceof(arg1,js_html_compat_ArrayBuffer)) {
		var buffer = arg1;
		if(offset == null) offset = 0;
		if(length == null) length = buffer.byteLength - offset;
		if(offset == 0) arr = buffer.a; else arr = buffer.a.slice(offset,offset + length);
		arr.byteLength = arr.length;
		arr.byteOffset = offset;
		arr.buffer = buffer;
	} else if((arg1 instanceof Array) && arg1.__enum__ == null) {
		arr = arg1.slice();
		arr.byteLength = arr.length;
		arr.byteOffset = 0;
		arr.buffer = new js_html_compat_ArrayBuffer(arr);
	} else throw new js__$Boot_HaxeError("TODO " + Std.string(arg1));
	arr.subarray = js_html_compat_Uint8Array._subarray;
	arr.set = js_html_compat_Uint8Array._set;
	return arr;
};
js_html_compat_Uint8Array._set = function(arg,offset) {
	var t = this;
	if(js_Boot.__instanceof(arg.buffer,js_html_compat_ArrayBuffer)) {
		var a = arg;
		if(arg.byteLength + offset > t.byteLength) throw new js__$Boot_HaxeError("set() outside of range");
		var _g1 = 0;
		var _g = arg.byteLength;
		while(_g1 < _g) {
			var i = _g1++;
			t[i + offset] = a[i];
		}
	} else if((arg instanceof Array) && arg.__enum__ == null) {
		var a1 = arg;
		if(a1.length + offset > t.byteLength) throw new js__$Boot_HaxeError("set() outside of range");
		var _g11 = 0;
		var _g2 = a1.length;
		while(_g11 < _g2) {
			var i1 = _g11++;
			t[i1 + offset] = a1[i1];
		}
	} else throw new js__$Boot_HaxeError("TODO");
};
js_html_compat_Uint8Array._subarray = function(start,end) {
	var t = this;
	var a = js_html_compat_Uint8Array._new(t.slice(start,end));
	a.byteOffset = start;
	return a;
};
var minicanvas_MiniCanvas = function(width,height,scaleMode) {
	this.scaleMode = scaleMode;
	this.width = width;
	this.height = height;
	this.processScale();
	this.startTime = performance.now();
	this.events = new haxe_ds_StringMap();
	this.init();
};
minicanvas_MiniCanvas.__name__ = true;
minicanvas_MiniCanvas.envIsNode = function() {
	return typeof module !== 'undefined' && module.exports;
};
minicanvas_MiniCanvas.create = function(width,height,scaleMode) {
	return minicanvas_MiniCanvas.envIsNode()?new minicanvas_NodeCanvas(width,height,scaleMode):new minicanvas_BrowserCanvas(width,height,scaleMode);
};
minicanvas_MiniCanvas.prototype = {
	display: function(name) {
		this.deltaTime = performance.now() - this.startTime;
		if(!minicanvas_MiniCanvas.displayGenerationTime) haxe_Log.trace("generated \"" + name + "\" in " + thx_Floats.roundTo(this.deltaTime,2) + "ms",{ fileName : "MiniCanvas.hx", lineNumber : 53, className : "minicanvas.MiniCanvas", methodName : "display"});
		this.nativeDisplay(name);
		return this;
	}
	,border: function(weight,color) {
		if(weight == null) weight = 1.0;
		if(null == color) color = thx_color__$RGBA_RGBA_$Impl_$.fromString("rgba(0,0,0,1)");
		return this.rect(weight / 2,weight / 2,this.width - weight / 2,this.height - weight / 2,weight,color);
	}
	,box: function(handler) {
		var _g1 = 0;
		var _g = this.width;
		while(_g1 < _g) {
			var x = _g1++;
			var _g3 = 0;
			var _g2 = this.height;
			while(_g3 < _g2) {
				var y = _g3++;
				this.ctx.fillStyle = thx_color__$RGBA_RGBA_$Impl_$.toString(handler(x / this.width,y / this.height));
				this.ctx.fillRect(x,y,1,1);
			}
		}
		return this;
	}
	,checkboard: function(size,light,dark) {
		if(size == null) size = 8;
		var cols = Math.ceil(this.width / size);
		var rows = Math.ceil(this.height / size);
		var slight = null == light?thx_color__$RGBA_RGBA_$Impl_$.fromString("rgba(255,255,255,1)"):light;
		var sdark = null == dark?thx_color__$RGBA_RGBA_$Impl_$.fromString("rgba(204,204,204,1)"):dark;
		var _g = 0;
		while(_g < cols) {
			var c = _g++;
			var _g1 = 0;
			while(_g1 < rows) {
				var r = _g1++;
				this.ctx.fillStyle = c % 2 != r % 2?thx_color__$RGBA_RGBA_$Impl_$.toString(slight):thx_color__$RGBA_RGBA_$Impl_$.toString(sdark);
				this.ctx.fillRect(c * size,r * size,size,size);
			}
		}
		return this;
	}
	,circle: function(x,y,radius,weight,lineColor,fillColor) {
		if(weight == null) weight = 1.0;
		if(null != fillColor || null != lineColor) this.ctx.beginPath();
		if(null != fillColor) this.ctx.fillStyle = thx_color__$RGBA_RGBA_$Impl_$.toString(fillColor);
		if(null != lineColor) {
			this.ctx.strokeStyle = thx_color__$RGBA_RGBA_$Impl_$.toString(lineColor);
			this.ctx.lineWidth = weight;
		}
		this.ctx.arc(x,y,radius,0,Math.PI * 2,true);
		if(null != fillColor) this.ctx.fill();
		if(null != lineColor) this.ctx.stroke();
	}
	,clear: function() {
		this.ctx.clearRect(0,0,this.width,this.height);
		return this;
	}
	,cross: function(ox,oy,weight,color) {
		if(weight == null) weight = 1.0;
		if(null == ox) ox = this.width / 2 + 0.5;
		if(null == oy) oy = this.height / 2 + 0.5;
		this.lineHorizontal(oy,weight,color);
		this.lineVertical(ox,weight,color);
		return this;
	}
	,dot: function(x,y,radius,color) {
		if(radius == null) radius = 3.0;
		this.ctx.beginPath();
		var tmp;
		var tmp1;
		if(null == color) tmp1 = null; else tmp1 = color;
		var t = tmp1;
		if(t != null) tmp = t; else tmp = thx_color__$RGBA_RGBA_$Impl_$.fromString("rgba(204,51,0,1)");
		this.ctx.fillStyle = thx_color__$RGBA_RGBA_$Impl_$.toString(tmp);
		this.ctx.arc(x,y,radius,0,Math.PI * 2,true);
		this.ctx.fill();
		return this;
	}
	,dotGrid: function(dx,dy,radius,color,ox,oy) {
		if(oy == null) oy = 0.5;
		if(ox == null) ox = 0.5;
		if(radius == null) radius = 1.0;
		if(dy == null) dy = 10.0;
		if(dx == null) dx = 10.0;
		if(dx == 0) throw new js__$Boot_HaxeError("invalid argument dx, should be different from zero");
		if(dy == 0) throw new js__$Boot_HaxeError("invalid argument dy, should be different from zero");
		if(null == color) color = thx_color__$RGBA_RGBA_$Impl_$.fromString("rgba(170,170,170,1)");
		var py = oy % dy;
		while(py - radius <= this.height) {
			var px = ox % dx;
			while(px - radius <= this.width) {
				this.dot(px + 0.5,py + 0.5,radius,color);
				px += dx;
			}
			py += dy;
		}
		return this;
	}
	,fill: function(color) {
		this.ctx.fillStyle = thx_color__$RGBA_RGBA_$Impl_$.toString(color);
		this.ctx.fillRect(0,0,this.width,this.height);
		return this;
	}
	,grid: function(dx,dy,weight,color,ox,oy) {
		if(oy == null) oy = 0.5;
		if(ox == null) ox = 0.5;
		if(weight == null) weight = 1.0;
		if(dy == null) dy = 10.0;
		if(dx == null) dx = 10.0;
		this.gridHorizontal(dy,weight,color,oy);
		this.gridVertical(dx,weight,color,ox);
		return this;
	}
	,gridHorizontal: function(dy,weight,color,oy) {
		if(oy == null) oy = 0.5;
		if(weight == null) weight = 1.0;
		if(dy == null) dy = 10.0;
		if(dy == 0) throw new js__$Boot_HaxeError("invalid argument dy, should be different from zero");
		if(null == color) color = thx_color__$RGBA_RGBA_$Impl_$.fromString("rgba(204,204,204,1)");
		var py = oy % dy;
		while(py - weight / 2 <= this.height) {
			this.lineHorizontal(py,weight,color);
			py += dy;
		}
		return this;
	}
	,gridVertical: function(dx,weight,color,ox) {
		if(ox == null) ox = 0.5;
		if(weight == null) weight = 1.0;
		if(dx == null) dx = 10.0;
		if(dx == 0) throw new js__$Boot_HaxeError("invalid argument dx, should be different from zero");
		if(null == color) color = thx_color__$RGBA_RGBA_$Impl_$.fromString("rgba(204,204,204,1)");
		var px = ox % dx;
		while(px - weight / 2 <= this.width) {
			this.lineVertical(px,weight,color);
			px += dx;
		}
		return this;
	}
	,gradientHorizontal: function(handler) {
		var _g1 = 0;
		var _g = this.width;
		while(_g1 < _g) {
			var x = _g1++;
			this.ctx.fillStyle = thx_color__$RGBA_RGBA_$Impl_$.toString(handler(x / this.width));
			this.ctx.fillRect(x,0,1,this.height);
		}
		return this;
	}
	,gradientVertical: function(handler) {
		var _g1 = 0;
		var _g = this.height;
		while(_g1 < _g) {
			var y = _g1++;
			this.ctx.fillStyle = thx_color__$RGBA_RGBA_$Impl_$.toString(handler(y / this.height));
			this.ctx.fillRect(0,y,this.width,1);
		}
		return this;
	}
	,line: function(x0,y0,x1,y1,weight,color) {
		if(weight == null) weight = 1.0;
		this.ctx.lineWidth = weight;
		var tmp;
		var tmp1;
		if(null == color) tmp1 = null; else tmp1 = color;
		var t = tmp1;
		if(t != null) tmp = thx_color__$RGBA_RGBA_$Impl_$.toString(t); else tmp = thx_color__$RGBA_RGBA_$Impl_$.toString(thx_color__$RGBA_RGBA_$Impl_$.fromString("rgba(0,0,0,1)"));
		this.ctx.strokeStyle = tmp;
		this.ctx.beginPath();
		this.ctx.moveTo(x0,y0);
		this.ctx.lineTo(x1,y1);
		this.ctx.stroke();
		return this;
	}
	,lineHorizontal: function(offset,weight,color) {
		if(weight == null) weight = 1.0;
		return this.line(0,offset,this.width,offset,weight,color);
	}
	,lineVertical: function(offset,weight,color) {
		if(weight == null) weight = 1.0;
		return this.line(offset,0,offset,this.height,weight,color);
	}
	,palette: function(colors,padding,margin) {
		if(margin == null) margin = 0.0;
		if(padding == null) padding = 2.0;
		var rows = colors.length;
		var h = (this.height - 2 * margin - (rows - 1) * padding) / rows;
		var py = margin;
		var _g = 0;
		while(_g < colors.length) {
			var row = colors[_g];
			++_g;
			var cols = row.length;
			var w = (this.width - 2 * margin - (cols - 1) * padding) / cols;
			var px = margin;
			var _g1 = 0;
			while(_g1 < row.length) {
				var col = row[_g1];
				++_g1;
				this.ctx.fillStyle = thx_color__$RGBA_RGBA_$Impl_$.toString(col);
				this.ctx.fillRect(px,py,w,h);
				px += w + padding;
			}
			py += h + padding;
		}
		return this;
	}
	,rect: function(x0,y0,x1,y1,weight,lineColor,fillColor) {
		if(weight == null) weight = 1.0;
		if(null != fillColor) {
			this.ctx.fillStyle = thx_color__$RGBA_RGBA_$Impl_$.toString(fillColor);
			this.ctx.fillRect(x0,y0,x1 - x0,y1 - y0);
		}
		if(null != lineColor) {
			this.ctx.lineWidth = weight;
			this.ctx.strokeStyle = thx_color__$RGBA_RGBA_$Impl_$.toString(lineColor);
			this.ctx.strokeRect(x0,y0,x1 - x0,y1 - y0);
		}
		return this;
	}
	,animate: function(x,y) {
		var _g = this;
		var tmp;
		var tmp2;
		if(null == x) tmp2 = null; else tmp2 = x;
		var t = tmp2;
		if(t != null) tmp = t; else tmp = this.width / 2;
		var tmp1;
		var tmp3;
		if(null == y) tmp3 = null; else tmp3 = y;
		var t1 = tmp3;
		if(t1 != null) tmp1 = t1; else tmp1 = this.height;
		var interaction = new minicanvas_CanvasInteraction(this,tmp,tmp1,function(stack) {
			_g.resolveStack(stack,$bind(_g,_g.afterAnimate));
			_g.storeFrame();
		});
		this.beforeAnimate();
		return interaction;
	}
	,animateNode: function(x,y) {
		if(this.isNode) return this.animate(x,y); else return new minicanvas_Interaction(this);
	}
	,animateBrowser: function(x,y) {
		if(this.isBrowser) return this.animate(x,y); else return new minicanvas_Interaction(this);
	}
	,storeFrame: function(times) {
		if(times == null) times = 1;
		return this;
	}
	,context: function(callback) {
		callback(this.ctx,this.width,this.height);
		return this;
	}
	,'with': function(callback) {
		callback(this);
		return this;
	}
	,onClick: function(callback) {
		return this.onMouseEvent("click",null,callback);
	}
	,onKeyDown: function(callback) {
		var _g = this;
		this._keyDown = { listener : function(e) {
			_g.keyDown(e.keyCode);
		}, callback : callback};
		if(this.isBrowser) {
			if(minicanvas_BrowserCanvas.attachKeyEventsToCanvas) {
				this.canvas.setAttribute("tabIndex","1");
				this.canvas.addEventListener("keydown",this._keyDown.listener);
			} else window.addEventListener("keydown",this._keyDown.listener);
		}
		return this;
	}
	,onKeyRepeat: function(callback) {
		var _g = this;
		var threshold = 40;
		var keys = thx__$Set_Set_$Impl_$.create();
		this._keyRepeat = { listener : function(e) {
			var isEmpty = keys.length == 0;
			thx__$Set_Set_$Impl_$.add(keys,e.keyCode);
			if(!isEmpty) return;
			var cancel = thx_Timer.repeat(function() {
				_g.keyRepeat(thx__$Set_Set_$Impl_$.setToArray(keys));
			},threshold);
			var keyupListener = null;
			var keyupListener1 = function(e1) {
				HxOverrides.remove(keys,e1.keyCode);
				if(keys.length > 0) return;
				cancel();
				if(minicanvas_BrowserCanvas.attachKeyEventsToCanvas) _g.canvas.removeEventListener("keyup",keyupListener); else window.removeEventListener("keyup",keyupListener);
			};
			if(minicanvas_BrowserCanvas.attachKeyEventsToCanvas) _g.canvas.addEventListener("keyup",keyupListener1); else window.addEventListener("keyup",keyupListener1);
		}, callback : callback};
		if(this.isBrowser) {
			if(minicanvas_BrowserCanvas.attachKeyEventsToCanvas) {
				this.canvas.setAttribute("tabIndex","1");
				this.canvas.addEventListener("keydown",this._keyRepeat.listener);
			} else window.addEventListener("keydown",this._keyRepeat.listener);
		}
		return this;
	}
	,onKeyUp: function(callback) {
		var _g = this;
		this._keyUp = { listener : function(e) {
			_g.keyUp(e.keyCode);
		}, callback : callback};
		if(this.isBrowser) {
			if(minicanvas_BrowserCanvas.attachKeyEventsToCanvas) {
				this.canvas.setAttribute("tabIndex","1");
				this.canvas.addEventListener("keyup",this._keyUp.listener);
			} else window.addEventListener("keyup",this._keyUp.listener);
		}
		return this;
	}
	,offKeyDown: function() {
		if(this.isBrowser && null != this._keyDown) {
			if(minicanvas_BrowserCanvas.attachKeyEventsToCanvas) {
				this.canvas.removeAttribute("tabIndex");
				this.canvas.removeEventListener("keydown",this._keyDown.listener);
			} else window.removeEventListener("keydown",this._keyDown.listener);
		}
		this._keyDown = null;
		return this;
	}
	,offKeyUp: function() {
		if(this.isBrowser && null != this._keyUp) {
			if(minicanvas_BrowserCanvas.attachKeyEventsToCanvas) {
				this.canvas.removeAttribute("tabIndex");
				this.canvas.removeEventListener("keyup",this._keyUp.listener);
			} else window.removeEventListener("keyup",this._keyUp.listener);
		}
		this._keyUp = null;
		return this;
	}
	,onDown: function(callback) {
		return this.onMouseEvent("mousedown",null,callback);
	}
	,onMove: function(callback) {
		return this.onMouseEvent("mousemove",null,callback);
	}
	,onTrail: function(callback) {
		var _g = this;
		var first = true;
		var x0 = 0.0;
		var y0 = 0.0;
		var x1;
		var y1;
		var listener = function(e) {
			if(first) {
				x0 = e.x;
				y0 = e.y;
				first = false;
			} else {
				x1 = e.x;
				y1 = e.y;
				callback({ mini : _g, x0 : x0, y0 : y0, x1 : x1, y1 : y1});
				x0 = x1;
				y0 = y1;
			}
		};
		return this.onMouseEvent("mousemove","trail",listener);
	}
	,onUp: function(callback) {
		return this.onMouseEvent("mouseup",null,callback);
	}
	,offClick: function() {
		return this.offMouseEvent("click");
	}
	,offDown: function() {
		return this.offMouseEvent("mousedown");
	}
	,offMove: function() {
		return this.offMouseEvent("mousemove");
	}
	,offTrail: function() {
		return this.offMouseEvent("mousemove","trail");
	}
	,offUp: function() {
		return this.offMouseEvent("mouseup");
	}
	,click: function(x,y) {
		return this.trigger("click",x,y);
	}
	,down: function(x,y) {
		return this.trigger("mousedown",x,y);
	}
	,keyDown: function(keyCode) {
		if(null != this._keyDown) this._keyDown.callback({ mini : this, keyCode : keyCode});
		return this;
	}
	,keyRepeat: function(keyCodes) {
		if(null != this._keyRepeat) this._keyRepeat.callback({ mini : this, keyCodes : keyCodes});
		return this;
	}
	,keyUp: function(keyCode) {
		if(null != this._keyUp) this._keyUp.callback({ mini : this, keyCode : keyCode});
		return this;
	}
	,move: function(x,y) {
		if(x < 0 || x > this.width || y < 0 || y > this.height) return this;
		this.trigger("mousemove",x,y);
		this.trigger("trail",x,y);
		return this;
	}
	,up: function(x,y) {
		return this.trigger("mouseup",x,y);
	}
	,onMouseEvent: function(type,name,callback) {
		var _g = this;
		if(null == name) name = type;
		this.offMouseEvent(type,name);
		var listener = function(e) {
			var rect = _g.canvas.getBoundingClientRect();
			_g.trigger(name,e.clientX - rect.left,e.clientY - rect.top);
		};
		var _this = this.events;
		var value = { callback : callback, listener : listener};
		if(__map_reserved[name] != null) _this.setReserved(name,value); else _this.h[name] = value;
		if(this.isBrowser) this.canvas.addEventListener(type,listener,false);
		return this;
	}
	,offMouseEvent: function(type,name) {
		if(null == name) name = type;
		var tmp;
		var _this = this.events;
		if(__map_reserved[name] != null) tmp = _this.getReserved(name); else tmp = _this.h[name];
		var item = tmp;
		if(null == item) return this;
		this.events.remove(name);
		if(this.isBrowser) this.canvas.removeEventListener(type,item.listener,false);
		return this;
	}
	,trigger: function(name,x,y) {
		var tmp;
		var _this = this.events;
		if(__map_reserved[name] != null) tmp = _this.getReserved(name); else tmp = _this.h[name];
		var item = tmp;
		if(null == item) return this;
		item.callback({ mini : this, x : x, y : y});
		return this;
	}
	,getDevicePixelRatio: function() {
		throw new js__$Boot_HaxeError("abstract method getDevicePixelRatio()");
	}
	,getBackingStoreRatio: function() {
		throw new js__$Boot_HaxeError("abstract method getBackingStoreRatio()");
	}
	,init: function() {
		throw new js__$Boot_HaxeError("abstract method init()");
	}
	,nativeDisplay: function(name) {
		throw new js__$Boot_HaxeError("abstract method nativeDisplay()");
	}
	,processScale: function() {
		var _g = this.scaleMode;
		switch(_g[1]) {
		case 1:
			var ratio = this.getDevicePixelRatio() / this.getBackingStoreRatio();
			if(ratio != 1) this.scaleMode = minicanvas_ScaleMode.Scaled(ratio); else this.scaleMode = minicanvas_ScaleMode.NoScale;
			break;
		default:
		}
	}
	,beforeAnimate: function() {
	}
	,afterAnimate: function() {
	}
	,resolveStack: function(stack,done) {
		if(stack.length == 0) {
			done();
			return;
		}
		(stack.shift())();
		this.storeFrame();
		this.resolveStack(stack,done);
	}
	,__class__: minicanvas_MiniCanvas
};
var minicanvas_ScaleMode = { __ename__ : true, __constructs__ : ["NoScale","Auto","Scaled"] };
minicanvas_ScaleMode.NoScale = ["NoScale",0];
minicanvas_ScaleMode.NoScale.__enum__ = minicanvas_ScaleMode;
minicanvas_ScaleMode.Auto = ["Auto",1];
minicanvas_ScaleMode.Auto.__enum__ = minicanvas_ScaleMode;
minicanvas_ScaleMode.Scaled = function(v) { var $x = ["Scaled",2,v]; $x.__enum__ = minicanvas_ScaleMode; return $x; };
var minicanvas_BrowserCanvas = function(width,height,scaleMode) {
	this.isNode = false;
	this.isBrowser = true;
	if(null == scaleMode) scaleMode = minicanvas_BrowserCanvas.defaultScaleMode;
	minicanvas_MiniCanvas.call(this,width,height,scaleMode);
};
minicanvas_BrowserCanvas.__name__ = true;
minicanvas_BrowserCanvas.devicePixelRatio = function() {
	return window.devicePixelRatio || 1;
};
minicanvas_BrowserCanvas.backingStoreRatio = function() {
	if(minicanvas_BrowserCanvas._backingStoreRatio == 0) {
		var canvas = (function($this) {
			var $r;
			var _this = window.document;
			$r = _this.createElement("canvas");
			return $r;
		}(this));
		var context = canvas.getContext("2d",null);
		minicanvas_BrowserCanvas._backingStoreRatio = (function(c) {
        return c.webkitBackingStorePixelRatio ||
          c.mozBackingStorePixelRatio ||
          c.msBackingStorePixelRatio ||
          c.oBackingStorePixelRatio ||
          c.backingStorePixelRatio || 1;
        })(context);
	}
	return minicanvas_BrowserCanvas._backingStoreRatio;
};
minicanvas_BrowserCanvas.__super__ = minicanvas_MiniCanvas;
minicanvas_BrowserCanvas.prototype = $extend(minicanvas_MiniCanvas.prototype,{
	append: function(name) {
		var figure = window.document.createElement("figure");
		var caption = window.document.createElement("figcaption");
		figure.className = "minicanvas";
		figure.appendChild(this.canvas);
		caption.innerHTML = thx_Strings.humanize(name) + (minicanvas_MiniCanvas.displayGenerationTime?" <span class=\"info\">(" + thx_Floats.roundTo(this.deltaTime,2) + "ms)</span>":"");
		figure.appendChild(caption);
		minicanvas_BrowserCanvas.parentNode.appendChild(figure);
		if(null != this._keyUp || null != this._keyDown) this.canvas.focus();
	}
	,init: function() {
		var tmp;
		var _this = window.document;
		tmp = _this.createElement("canvas");
		this.canvas = tmp;
		{
			var _g = this.scaleMode;
			switch(_g[1]) {
			case 2:
				var v = _g[2];
				this.canvas.width = Math.round(this.width * v);
				this.canvas.height = Math.round(this.height * v);
				this.canvas.style.width = "" + this.width + "px";
				this.canvas.style.height = "" + this.height + "px";
				this.ctx = this.canvas.getContext("2d",null);
				this.ctx.scale(v,v);
				break;
			default:
				this.canvas.width = this.width;
				this.canvas.height = this.height;
				this.ctx = this.canvas.getContext("2d",null);
			}
		}
	}
	,getDevicePixelRatio: function() {
		return minicanvas_BrowserCanvas.devicePixelRatio();
	}
	,getBackingStoreRatio: function() {
		return minicanvas_BrowserCanvas.backingStoreRatio();
	}
	,nativeDisplay: function(name) {
		this.append(name);
	}
	,beforeAnimate: function() {
		this.canvas.style.pointerEvents = "none";
	}
	,afterAnimate: function() {
		this.canvas.style.pointerEvents = "auto";
	}
	,resolveStack: function(stack,done) {
		if(stack.length == 0) {
			done();
			return;
		}
		(stack.shift())();
		this.storeFrame();
		var tmp;
		var f = $bind(this,this.resolveStack);
		var a1 = stack;
		var a2 = done;
		tmp = function() {
			f(a1,a2);
		};
		thx_Timer.delay(tmp,50);
	}
	,__class__: minicanvas_BrowserCanvas
});
var minicanvas_Interaction = function(mini) {
	this.mini = mini;
};
minicanvas_Interaction.__name__ = true;
minicanvas_Interaction.prototype = {
	click: function(x,y) {
		return this;
	}
	,down: function(x,y) {
		return this;
	}
	,keyDown: function(keyCode) {
		return this;
	}
	,keyUp: function(keyCode) {
		return this;
	}
	,move: function(x,y,delta) {
		if(delta == null) delta = 9;
		return this;
	}
	,up: function(x,y) {
		return this;
	}
	,sleep: function(frames) {
		return this;
	}
	,done: function() {
		return this.mini;
	}
	,frame: function(callback) {
		callback(this.mini);
		return this;
	}
	,__class__: minicanvas_Interaction
};
var minicanvas_CanvasInteraction = function(mini,x,y,done) {
	minicanvas_Interaction.call(this,mini);
	this.x = x;
	this.y = y;
	this.stack = [];
	this._done = done;
};
minicanvas_CanvasInteraction.__name__ = true;
minicanvas_CanvasInteraction.__super__ = minicanvas_Interaction;
minicanvas_CanvasInteraction.prototype = $extend(minicanvas_Interaction.prototype,{
	click: function(x,y) {
		if(this.x != x || this.y != y) this.move(x,y);
		var tmp;
		var f = ($_=this.mini,$bind($_,$_.click));
		var x1 = x;
		var y1 = y;
		tmp = function() {
			return f(x1,y1);
		};
		this.stack.push(tmp);
		return this;
	}
	,down: function(x,y) {
		if(this.x != x || this.y != y) this.move(x,y);
		var tmp;
		var f = ($_=this.mini,$bind($_,$_.down));
		var x1 = x;
		var y1 = y;
		tmp = function() {
			return f(x1,y1);
		};
		this.stack.push(tmp);
		return this;
	}
	,frame: function(callback) {
		var tmp;
		var f = callback;
		var a1 = this.mini;
		tmp = function() {
			f(a1);
		};
		this.stack.push(tmp);
		return this;
	}
	,keyDown: function(keyCode) {
		var tmp;
		var f = ($_=this.mini,$bind($_,$_.keyDown));
		var a1 = keyCode;
		tmp = function() {
			return f(a1);
		};
		this.stack.push(tmp);
		return this;
	}
	,keyUp: function(keyCode) {
		var tmp;
		var f = ($_=this.mini,$bind($_,$_.keyUp));
		var a1 = keyCode;
		tmp = function() {
			return f(a1);
		};
		this.stack.push(tmp);
		return this;
	}
	,move: function(x,y,delta) {
		if(delta == null) delta = 9;
		var dist = Math.sqrt((x - this.x) * (x - this.x) + (y - this.y) * (y - this.y));
		var steps = Math.ceil(dist / delta);
		var dx;
		var dy;
		var step;
		var _g = 0;
		while(_g < steps) {
			var i = _g++;
			step = i / steps;
			dx = Math.round(thx_Floats.interpolate(step,this.x,x));
			dy = Math.round(thx_Floats.interpolate(step,this.y,y));
			var tmp;
			var f = [($_=this.mini,$bind($_,$_.move))];
			var x1 = [dx];
			var y1 = [dy];
			tmp = (function(y1,x1,f) {
				return function() {
					return f[0](x1[0],y1[0]);
				};
			})(y1,x1,f);
			this.stack.push(tmp);
		}
		this.x = x;
		this.y = y;
		return this;
	}
	,up: function(x,y) {
		if(this.x != x || this.y != y) this.move(x,y);
		var tmp;
		var f = ($_=this.mini,$bind($_,$_.up));
		var x1 = x;
		var y1 = y;
		tmp = function() {
			return f(x1,y1);
		};
		this.stack.push(tmp);
		return this;
	}
	,sleep: function(frames) {
		var _g = 0;
		while(_g < frames) {
			_g++;
			this.stack.push(function() {
			});
		}
		return this;
	}
	,done: function() {
		this._done(this.stack);
		return this.mini;
	}
	,__class__: minicanvas_CanvasInteraction
});
var minicanvas_NodeCanvas = function(width,height,scaleMode) {
	this.hasFrames = false;
	this.isNode = true;
	this.isBrowser = false;
	if(null == scaleMode) scaleMode = minicanvas_NodeCanvas.defaultScaleMode;
	minicanvas_MiniCanvas.call(this,width,height,scaleMode);
};
minicanvas_NodeCanvas.__name__ = true;
minicanvas_NodeCanvas.create = function(width,height,scaleMode) {
	return new minicanvas_MiniCanvas(width,height,scaleMode);
};
minicanvas_NodeCanvas.__super__ = minicanvas_MiniCanvas;
minicanvas_NodeCanvas.prototype = $extend(minicanvas_MiniCanvas.prototype,{
	save: function(name) {
		var encoder = this.ensureEncoder();
		encoder.addFrame(this.ctx);
		encoder.save(name,function(file) {
			console.log("saved " + file);
		});
	}
	,storeFrame: function(times) {
		if(times == null) times = 1;
		this.hasFrames = true;
		if(times <= 0) times = 1;
		var _g = 0;
		while(_g < times) {
			_g++;
			this.ensureEncoder().addFrame(this.ctx);
		}
		return this;
	}
	,init: function() {
		var Canvas = require("canvas");
		{
			var _g = this.scaleMode;
			switch(_g[1]) {
			case 2:
				var v = _g[2];
				this.canvas = new Canvas(this.width * v,this.height * v);
				this.ctx = this.canvas.getContext("2d",null);
				this.ctx.scale(v,v);
				break;
			default:
				this.canvas = new Canvas(this.width,this.height);
				this.ctx = this.canvas.getContext("2d",null);
			}
		}
	}
	,getDevicePixelRatio: function() {
		return 1.0;
	}
	,getBackingStoreRatio: function() {
		return 1.0;
	}
	,nativeDisplay: function(name) {
		this.save(name);
	}
	,ensureEncoder: function() {
		if(null != this.encoder) return this.encoder;
		if(this.hasFrames) return this.encoder = new minicanvas_node_GifEncoder(this.width,this.height); else return this.encoder = new minicanvas_node_PNGEncoder(this.canvas);
	}
	,__class__: minicanvas_NodeCanvas
});
var minicanvas_node_IEncoder = function() { };
minicanvas_node_IEncoder.__name__ = true;
minicanvas_node_IEncoder.prototype = {
	__class__: minicanvas_node_IEncoder
};
var minicanvas_node_GifEncoder = function(width,height) {
	this.frames = 0;
	this.encoder = (function(w, h, self) {
      var GIFEncoder = require('gifencoder'),
          encoder = new GIFEncoder(w, h);
      self.stream = encoder.createReadStream();
      encoder.start();
      encoder.setRepeat(0);
      encoder.setDelay(50);
      encoder.setQuality(10);
      return encoder;
    })(width,height,this);
};
minicanvas_node_GifEncoder.__name__ = true;
minicanvas_node_GifEncoder.__interfaces__ = [minicanvas_node_IEncoder];
minicanvas_node_GifEncoder.prototype = {
	addFrame: function(ctx) {
		this.encoder.addFrame(ctx);
		this.frames++;
	}
	,save: function(name,callback) {
		this.stream.pipe(require("fs").createWriteStream("" + minicanvas_NodeCanvas.imagePath + "/" + name + ".gif"));
		callback("" + name + ".gif (frames " + this.frames + ")");
	}
	,__class__: minicanvas_node_GifEncoder
};
var minicanvas_node_PNGEncoder = function(canvas) {
	this.canvas = canvas;
};
minicanvas_node_PNGEncoder.__name__ = true;
minicanvas_node_PNGEncoder.__interfaces__ = [minicanvas_node_IEncoder];
minicanvas_node_PNGEncoder.prototype = {
	addFrame: function(ctx) {
	}
	,save: function(name,callback) {
		var fs = require("fs");
		var out = fs.createWriteStream("" + minicanvas_NodeCanvas.imagePath + "/" + name + ".png");
		var stream = this.canvas.pngStream();
		stream.on("data",function(chunk) {
			out.write(chunk);
		});
		stream.on("end",function(_) {
			callback("" + name + ".png");
		});
	}
	,__class__: minicanvas_node_PNGEncoder
};
var thx_Arrays = function() { };
thx_Arrays.__name__ = true;
thx_Arrays.after = function(array,element) {
	return array.slice(HxOverrides.indexOf(array,element,0) + 1);
};
thx_Arrays.all = function(arr,predicate) {
	var _g = 0;
	while(_g < arr.length) {
		var item = arr[_g];
		++_g;
		if(!predicate(item)) return false;
	}
	return true;
};
thx_Arrays.any = function(arr,predicate) {
	var _g = 0;
	while(_g < arr.length) {
		var item = arr[_g];
		++_g;
		if(predicate(item)) return true;
	}
	return false;
};
thx_Arrays.at = function(arr,indexes) {
	return indexes.map(function(i) {
		return arr[i];
	});
};
thx_Arrays.before = function(array,element) {
	return array.slice(0,HxOverrides.indexOf(array,element,0));
};
thx_Arrays.compact = function(arr) {
	return arr.filter(function(v) {
		return null != v;
	});
};
thx_Arrays.contains = function(array,element,eq) {
	if(null == eq) return HxOverrides.indexOf(array,element,0) >= 0; else {
		var _g1 = 0;
		var _g = array.length;
		while(_g1 < _g) {
			var i = _g1++;
			if(eq(array[i],element)) return true;
		}
		return false;
	}
};
thx_Arrays.cross = function(a,b) {
	var r = [];
	var _g = 0;
	while(_g < a.length) {
		var va = a[_g];
		++_g;
		var _g1 = 0;
		while(_g1 < b.length) {
			var vb = b[_g1];
			++_g1;
			r.push([va,vb]);
		}
	}
	return r;
};
thx_Arrays.crossMulti = function(array) {
	var acopy = array.slice();
	var result = acopy.shift().map(function(v) {
		return [v];
	});
	while(acopy.length > 0) {
		var array1 = acopy.shift();
		var tresult = result;
		result = [];
		var _g = 0;
		while(_g < array1.length) {
			var v1 = array1[_g];
			++_g;
			var _g1 = 0;
			while(_g1 < tresult.length) {
				var ar = tresult[_g1];
				++_g1;
				var t = ar.slice();
				t.push(v1);
				result.push(t);
			}
		}
	}
	return result;
};
thx_Arrays.distinct = function(array,predicate) {
	var result = [];
	if(array.length <= 1) return array;
	if(null == predicate) predicate = thx_Functions.equality;
	var _g = 0;
	while(_g < array.length) {
		var v = [array[_g]];
		++_g;
		var keep = !thx_Arrays.any(result,(function(v) {
			return function(r) {
				return predicate(r,v[0]);
			};
		})(v));
		if(keep) result.push(v[0]);
	}
	return result;
};
thx_Arrays.eachPair = function(array,callback) {
	var _g1 = 0;
	var _g = array.length;
	while(_g1 < _g) {
		var i = _g1++;
		var _g3 = i;
		var _g2 = array.length;
		while(_g3 < _g2) {
			var j = _g3++;
			if(!callback(array[i],array[j])) return;
		}
	}
};
thx_Arrays.equals = function(a,b,equality) {
	if(a == null || b == null || a.length != b.length) return false;
	if(null == equality) equality = thx_Functions.equality;
	var _g1 = 0;
	var _g = a.length;
	while(_g1 < _g) {
		var i = _g1++;
		if(!equality(a[i],b[i])) return false;
	}
	return true;
};
thx_Arrays.extract = function(a,predicate) {
	var _g1 = 0;
	var _g = a.length;
	while(_g1 < _g) {
		var i = _g1++;
		if(predicate(a[i])) return a.splice(i,1)[0];
	}
	return null;
};
thx_Arrays.find = function(array,predicate) {
	var _g = 0;
	while(_g < array.length) {
		var item = array[_g];
		++_g;
		if(predicate(item)) return item;
	}
	return null;
};
thx_Arrays.findLast = function(array,predicate) {
	var len = array.length;
	var j;
	var _g = 0;
	while(_g < len) {
		var i = _g++;
		j = len - i - 1;
		if(predicate(array[j])) return array[j];
	}
	return null;
};
thx_Arrays.first = function(array) {
	return array[0];
};
thx_Arrays.flatMap = function(array,callback) {
	var tmp;
	var array1 = array.map(callback);
	tmp = Array.prototype.concat.apply([],array1);
	return tmp;
};
thx_Arrays.flatten = function(array) {
	return Array.prototype.concat.apply([],array);
};
thx_Arrays.from = function(array,element) {
	return array.slice(HxOverrides.indexOf(array,element,0));
};
thx_Arrays.groupByAppend = function(arr,resolver,map) {
	arr.map(function(v) {
		var key = resolver(v);
		var arr1 = map.get(key);
		if(null == arr1) {
			arr1 = [v];
			map.set(key,arr1);
		} else arr1.push(v);
	});
	return map;
};
thx_Arrays.head = function(array) {
	return array[0];
};
thx_Arrays.ifEmpty = function(value,alt) {
	return null != value && 0 != value.length?value:alt;
};
thx_Arrays.initial = function(array) {
	return array.slice(0,array.length - 1);
};
thx_Arrays.isEmpty = function(array) {
	return array.length == 0;
};
thx_Arrays.last = function(array) {
	return array[array.length - 1];
};
thx_Arrays.mapi = function(array,callback) {
	var r = [];
	var _g1 = 0;
	var _g = array.length;
	while(_g1 < _g) {
		var i = _g1++;
		r.push(callback(array[i],i));
	}
	return r;
};
thx_Arrays.mapRight = function(array,callback) {
	var i = array.length;
	var result = [];
	while(--i >= 0) result.push(callback(array[i]));
	return result;
};
thx_Arrays.order = function(array,sort) {
	var n = array.slice();
	n.sort(sort);
	return n;
};
thx_Arrays.pull = function(array,toRemove,equality) {
	var _g = 0;
	while(_g < toRemove.length) {
		var item = toRemove[_g];
		++_g;
		thx_Arrays.removeAll(array,item,equality);
	}
};
thx_Arrays.pushIf = function(array,condition,value) {
	if(condition) array.push(value);
	return array;
};
thx_Arrays.reduce = function(array,callback,initial) {
	return array.reduce(callback,initial);
};
thx_Arrays.resize = function(array,length,fill) {
	while(array.length < length) array.push(fill);
	array.splice(length,array.length - length);
	return array;
};
thx_Arrays.reducei = function(array,callback,initial) {
	return array.reduce(callback,initial);
};
thx_Arrays.reduceRight = function(array,callback,initial) {
	var i = array.length;
	while(--i >= 0) initial = callback(initial,array[i]);
	return initial;
};
thx_Arrays.removeAll = function(array,element,equality) {
	if(null == equality) equality = thx_Functions.equality;
	var i = array.length;
	while(--i >= 0) if(equality(array[i],element)) array.splice(i,1);
};
thx_Arrays.rest = function(array) {
	return array.slice(1);
};
thx_Arrays.sample = function(array,n) {
	var tmp;
	var b = array.length;
	if(n < b) tmp = n; else tmp = b;
	n = tmp;
	var copy = array.slice();
	var result = [];
	var _g = 0;
	while(_g < n) {
		_g++;
		result.push(copy.splice(Std.random(copy.length),1)[0]);
	}
	return result;
};
thx_Arrays.sampleOne = function(array) {
	return array[Std.random(array.length)];
};
thx_Arrays.shuffle = function(a) {
	var t = thx_Ints.range(a.length);
	var array = [];
	while(t.length > 0) {
		var pos = Std.random(t.length);
		var index = t[pos];
		t.splice(pos,1);
		array.push(a[index]);
	}
	return array;
};
thx_Arrays.take = function(arr,n) {
	return arr.slice(0,n);
};
thx_Arrays.takeLast = function(arr,n) {
	return arr.slice(arr.length - n);
};
thx_Arrays.rotate = function(arr) {
	var result = [];
	var _g1 = 0;
	var _g = arr[0].length;
	while(_g1 < _g) {
		var i = _g1++;
		var row = [];
		result.push(row);
		var _g3 = 0;
		var _g2 = arr.length;
		while(_g3 < _g2) {
			var j = _g3++;
			row.push(arr[j][i]);
		}
	}
	return result;
};
thx_Arrays.zip = function(array1,array2) {
	var tmp;
	var a = array1.length;
	var b = array2.length;
	if(a < b) tmp = a; else tmp = b;
	var length = tmp;
	var array = [];
	var _g = 0;
	while(_g < length) {
		var i = _g++;
		array.push({ _0 : array1[i], _1 : array2[i]});
	}
	return array;
};
thx_Arrays.zip3 = function(array1,array2,array3) {
	var length = thx_ArrayInts.min([array1.length,array2.length,array3.length]);
	var array = [];
	var _g = 0;
	while(_g < length) {
		var i = _g++;
		array.push({ _0 : array1[i], _1 : array2[i], _2 : array3[i]});
	}
	return array;
};
thx_Arrays.zip4 = function(array1,array2,array3,array4) {
	var length = thx_ArrayInts.min([array1.length,array2.length,array3.length,array4.length]);
	var array = [];
	var _g = 0;
	while(_g < length) {
		var i = _g++;
		array.push({ _0 : array1[i], _1 : array2[i], _2 : array3[i], _3 : array4[i]});
	}
	return array;
};
thx_Arrays.zip5 = function(array1,array2,array3,array4,array5) {
	var length = thx_ArrayInts.min([array1.length,array2.length,array3.length,array4.length,array5.length]);
	var array = [];
	var _g = 0;
	while(_g < length) {
		var i = _g++;
		array.push({ _0 : array1[i], _1 : array2[i], _2 : array3[i], _3 : array4[i], _4 : array5[i]});
	}
	return array;
};
thx_Arrays.unzip = function(array) {
	var a1 = [];
	var a2 = [];
	array.map(function(t) {
		a1.push(t._0);
		a2.push(t._1);
	});
	return { _0 : a1, _1 : a2};
};
thx_Arrays.unzip3 = function(array) {
	var a1 = [];
	var a2 = [];
	var a3 = [];
	array.map(function(t) {
		a1.push(t._0);
		a2.push(t._1);
		a3.push(t._2);
	});
	return { _0 : a1, _1 : a2, _2 : a3};
};
thx_Arrays.unzip4 = function(array) {
	var a1 = [];
	var a2 = [];
	var a3 = [];
	var a4 = [];
	array.map(function(t) {
		a1.push(t._0);
		a2.push(t._1);
		a3.push(t._2);
		a4.push(t._3);
	});
	return { _0 : a1, _1 : a2, _2 : a3, _3 : a4};
};
thx_Arrays.unzip5 = function(array) {
	var a1 = [];
	var a2 = [];
	var a3 = [];
	var a4 = [];
	var a5 = [];
	array.map(function(t) {
		a1.push(t._0);
		a2.push(t._1);
		a3.push(t._2);
		a4.push(t._3);
		a5.push(t._4);
	});
	return { _0 : a1, _1 : a2, _2 : a3, _3 : a4, _4 : a5};
};
var thx_ArrayFloats = function() { };
thx_ArrayFloats.__name__ = true;
thx_ArrayFloats.average = function(arr) {
	return thx_ArrayFloats.sum(arr) / arr.length;
};
thx_ArrayFloats.compact = function(arr) {
	return arr.filter(function(v) {
		return null != v && isFinite(v);
	});
};
thx_ArrayFloats.max = function(arr) {
	return arr.length == 0?null:arr.reduce(function(max,v) {
		return v > max?v:max;
	},arr[0]);
};
thx_ArrayFloats.min = function(arr) {
	return arr.length == 0?null:arr.reduce(function(min,v) {
		return v < min?v:min;
	},arr[0]);
};
thx_ArrayFloats.resize = function(array,length,fill) {
	if(fill == null) fill = 0.0;
	while(array.length < length) array.push(fill);
	array.splice(length,array.length - length);
	return array;
};
thx_ArrayFloats.sum = function(arr) {
	return arr.reduce(function(tot,v) {
		return tot + v;
	},0.0);
};
var thx_ArrayInts = function() { };
thx_ArrayInts.__name__ = true;
thx_ArrayInts.average = function(arr) {
	return thx_ArrayInts.sum(arr) / arr.length;
};
thx_ArrayInts.max = function(arr) {
	return arr.length == 0?null:arr.reduce(function(max,v) {
		return v > max?v:max;
	},arr[0]);
};
thx_ArrayInts.min = function(arr) {
	return arr.length == 0?null:arr.reduce(function(min,v) {
		return v < min?v:min;
	},arr[0]);
};
thx_ArrayInts.resize = function(array,length,fill) {
	if(fill == null) fill = 0;
	while(array.length < length) array.push(fill);
	array.splice(length,array.length - length);
	return array;
};
thx_ArrayInts.sum = function(arr) {
	return arr.reduce(function(tot,v) {
		return tot + v;
	},0);
};
var thx_ArrayStrings = function() { };
thx_ArrayStrings.__name__ = true;
thx_ArrayStrings.compact = function(arr) {
	return arr.filter(function(v) {
		return !thx_Strings.isEmpty(v);
	});
};
thx_ArrayStrings.max = function(arr) {
	return arr.length == 0?null:arr.reduce(function(max,v) {
		return v > max?v:max;
	},arr[0]);
};
thx_ArrayStrings.min = function(arr) {
	return arr.length == 0?null:arr.reduce(function(min,v) {
		return v < min?v:min;
	},arr[0]);
};
var thx_Error = function(message,stack,pos) {
	Error.call(this,message);
	this.message = message;
	if(null == stack) {
		var tmp;
		try {
			tmp = haxe_CallStack.exceptionStack();
		} catch( e ) {
			haxe_CallStack.lastException = e;
			if (e instanceof js__$Boot_HaxeError) e = e.val;
			tmp = [];
		}
		stack = tmp;
		if(stack.length == 0) {
			var tmp1;
			try {
				tmp1 = haxe_CallStack.callStack();
			} catch( e1 ) {
				haxe_CallStack.lastException = e1;
				if (e1 instanceof js__$Boot_HaxeError) e1 = e1.val;
				tmp1 = [];
			}
			stack = tmp1;
		}
	}
	this.stackItems = stack;
	this.pos = pos;
};
thx_Error.__name__ = true;
thx_Error.fromDynamic = function(err,pos) {
	if(js_Boot.__instanceof(err,thx_Error)) return err;
	return new thx_error_ErrorWrapper("" + Std.string(err),err,null,pos);
};
thx_Error.__super__ = Error;
thx_Error.prototype = $extend(Error.prototype,{
	toString: function() {
		return this.message + "\nfrom: " + this.pos.className + "." + this.pos.methodName + "() at " + this.pos.lineNumber + "\n\n" + haxe_CallStack.toString(this.stackItems);
	}
	,__class__: thx_Error
});
var thx_Floats = function() { };
thx_Floats.__name__ = true;
thx_Floats.angleDifference = function(a,b,turn) {
	if(turn == null) turn = 360;
	var r = (b - a) % turn;
	if(r < 0) r += turn;
	if(r > turn / 2) r -= turn;
	return r;
};
thx_Floats.ceilTo = function(f,decimals) {
	var p = Math.pow(10,decimals);
	return Math.ceil(f * p) / p;
};
thx_Floats.canParse = function(s) {
	return thx_Floats.pattern_parse.match(s);
};
thx_Floats.clamp = function(v,min,max) {
	return v < min?min:v > max?max:v;
};
thx_Floats.clampSym = function(v,max) {
	var tmp;
	var min = -max;
	if(v < min) tmp = min; else if(v > max) tmp = max; else tmp = v;
	return tmp;
};
thx_Floats.compare = function(a,b) {
	return a < b?-1:a > b?1:0;
};
thx_Floats.floorTo = function(f,decimals) {
	var p = Math.pow(10,decimals);
	return Math.floor(f * p) / p;
};
thx_Floats.interpolate = function(f,a,b) {
	return (b - a) * f + a;
};
thx_Floats.interpolateAngle = function(f,a,b,turn) {
	if(turn == null) turn = 360;
	return thx_Floats.wrapCircular(thx_Floats.interpolate(f,a,a + thx_Floats.angleDifference(a,b,turn)),turn);
};
thx_Floats.interpolateAngleWidest = function(f,a,b,turn) {
	if(turn == null) turn = 360;
	return thx_Floats.wrapCircular(thx_Floats.interpolateAngle(f,a,b,turn) - turn / 2,turn);
};
thx_Floats.interpolateAngleCW = function(f,a,b,turn) {
	if(turn == null) turn = 360;
	a = thx_Floats.wrapCircular(a,turn);
	b = thx_Floats.wrapCircular(b,turn);
	if(b < a) b += turn;
	return thx_Floats.wrapCircular(thx_Floats.interpolate(f,a,b),turn);
};
thx_Floats.interpolateAngleCCW = function(f,a,b,turn) {
	if(turn == null) turn = 360;
	a = thx_Floats.wrapCircular(a,turn);
	b = thx_Floats.wrapCircular(b,turn);
	if(b > a) b -= turn;
	return thx_Floats.wrapCircular(thx_Floats.interpolate(f,a,b),turn);
};
thx_Floats.nearEquals = function(a,b) {
	return Math.abs(a - b) <= 10e-10;
};
thx_Floats.nearZero = function(n) {
	return Math.abs(n) <= 10e-10;
};
thx_Floats.normalize = function(v) {
	return v < 0?0:v > 1?1:v;
};
thx_Floats.parse = function(s) {
	if(s.substring(0,1) == "+") s = s.substring(1);
	return parseFloat(s);
};
thx_Floats.root = function(base,index) {
	return Math.pow(base,1 / index);
};
thx_Floats.roundTo = function(f,decimals) {
	var p = Math.pow(10,decimals);
	return Math.round(f * p) / p;
};
thx_Floats.sign = function(value) {
	return value < 0?-1:1;
};
thx_Floats.wrap = function(v,min,max) {
	var range = max - min + 1;
	if(v < min) v += range * ((min - v) / range + 1);
	return min + (v - min) % range;
};
thx_Floats.wrapCircular = function(v,max) {
	v = v % max;
	if(v < 0) v += max;
	return v;
};
var thx_Functions0 = function() { };
thx_Functions0.__name__ = true;
thx_Functions0.after = function(callback,n) {
	return function() {
		if(--n == 0) callback();
	};
};
thx_Functions0.join = function(fa,fb) {
	return function() {
		fa();
		fb();
	};
};
thx_Functions0.once = function(f) {
	return function() {
		var t = f;
		f = thx_Functions.noop;
		t();
	};
};
thx_Functions0.negate = function(callback) {
	return function() {
		return !callback();
	};
};
thx_Functions0.times = function(n,callback) {
	return function() {
		return thx_Ints.range(n).map(function(_) {
			return callback();
		});
	};
};
thx_Functions0.timesi = function(n,callback) {
	return function() {
		return thx_Ints.range(n).map(function(i) {
			return callback(i);
		});
	};
};
var thx_Functions1 = function() { };
thx_Functions1.__name__ = true;
thx_Functions1.compose = function(fa,fb) {
	return function(v) {
		return fa(fb(v));
	};
};
thx_Functions1.join = function(fa,fb) {
	return function(v) {
		fa(v);
		fb(v);
	};
};
thx_Functions1.memoize = function(callback,resolver) {
	if(null == resolver) resolver = function(v) {
		return "" + Std.string(v);
	};
	var map = new haxe_ds_StringMap();
	return function(v1) {
		var key = resolver(v1);
		if(__map_reserved[key] != null?map.existsReserved(key):map.h.hasOwnProperty(key)) return __map_reserved[key] != null?map.getReserved(key):map.h[key];
		var result = callback(v1);
		if(__map_reserved[key] != null) map.setReserved(key,result); else map.h[key] = result;
		return result;
	};
};
thx_Functions1.negate = function(callback) {
	return function(v) {
		return !callback(v);
	};
};
thx_Functions1.noop = function(_) {
};
thx_Functions1.times = function(n,callback) {
	return function(value) {
		return thx_Ints.range(n).map(function(_) {
			return callback(value);
		});
	};
};
thx_Functions1.timesi = function(n,callback) {
	return function(value) {
		return thx_Ints.range(n).map(function(i) {
			return callback(value,i);
		});
	};
};
thx_Functions1.swapArguments = function(callback) {
	return function(a2,a1) {
		return callback(a1,a2);
	};
};
var thx_Functions2 = function() { };
thx_Functions2.__name__ = true;
thx_Functions2.memoize = function(callback,resolver) {
	if(null == resolver) resolver = function(v1,v2) {
		return "" + Std.string(v1) + ":" + Std.string(v2);
	};
	var map = new haxe_ds_StringMap();
	return function(v11,v21) {
		var key = resolver(v11,v21);
		if(__map_reserved[key] != null?map.existsReserved(key):map.h.hasOwnProperty(key)) return __map_reserved[key] != null?map.getReserved(key):map.h[key];
		var result = callback(v11,v21);
		if(__map_reserved[key] != null) map.setReserved(key,result); else map.h[key] = result;
		return result;
	};
};
thx_Functions2.negate = function(callback) {
	return function(v1,v2) {
		return !callback(v1,v2);
	};
};
var thx_Functions3 = function() { };
thx_Functions3.__name__ = true;
thx_Functions3.memoize = function(callback,resolver) {
	if(null == resolver) resolver = function(v1,v2,v3) {
		return "" + Std.string(v1) + ":" + Std.string(v2) + ":" + Std.string(v3);
	};
	var map = new haxe_ds_StringMap();
	return function(v11,v21,v31) {
		var key = resolver(v11,v21,v31);
		if(__map_reserved[key] != null?map.existsReserved(key):map.h.hasOwnProperty(key)) return __map_reserved[key] != null?map.getReserved(key):map.h[key];
		var result = callback(v11,v21,v31);
		if(__map_reserved[key] != null) map.setReserved(key,result); else map.h[key] = result;
		return result;
	};
};
thx_Functions3.negate = function(callback) {
	return function(v1,v2,v3) {
		return !callback(v1,v2,v3);
	};
};
var thx_Functions = function() { };
thx_Functions.__name__ = true;
thx_Functions.constant = function(v) {
	return function() {
		return v;
	};
};
thx_Functions.equality = function(a,b) {
	return a == b;
};
thx_Functions.identity = function(value) {
	return value;
};
thx_Functions.noop = function() {
};
var thx_Ints = function() { };
thx_Ints.__name__ = true;
thx_Ints.abs = function(v) {
	return v < 0?-v:v;
};
thx_Ints.canParse = function(s) {
	return thx_Ints.pattern_parse.match(s);
};
thx_Ints.clamp = function(v,min,max) {
	return v < min?min:v > max?max:v;
};
thx_Ints.clampSym = function(v,max) {
	var tmp;
	var min = -max;
	if(v < min) tmp = min; else if(v > max) tmp = max; else tmp = v;
	return tmp;
};
thx_Ints.compare = function(a,b) {
	return a - b;
};
thx_Ints.interpolate = function(f,a,b) {
	return Math.round(a + (b - a) * f);
};
thx_Ints.isEven = function(v) {
	return v % 2 == 0;
};
thx_Ints.isOdd = function(v) {
	return v % 2 != 0;
};
thx_Ints.max = function(a,b) {
	return a > b?a:b;
};
thx_Ints.min = function(a,b) {
	return a < b?a:b;
};
thx_Ints.parse = function(s,base) {
	var v = parseInt(s,base);
	return isNaN(v)?null:v;
};
thx_Ints.random = function(min,max) {
	if(min == null) min = 0;
	return Std.random(max + 1) + min;
};
thx_Ints.range = function(start,stop,step) {
	if(step == null) step = 1;
	if(null == stop) {
		stop = start;
		start = 0;
	}
	if((stop - start) / step == Infinity) throw new js__$Boot_HaxeError("infinite range");
	var range = [];
	var i = -1;
	var j;
	if(step < 0) while((j = start + step * ++i) > stop) range.push(j); else while((j = start + step * ++i) < stop) range.push(j);
	return range;
};
thx_Ints.toString = function(value,base) {
	return value.toString(base);
};
thx_Ints.toBool = function(v) {
	return v != 0;
};
thx_Ints.sign = function(value) {
	return value < 0?-1:1;
};
thx_Ints.wrapCircular = function(v,max) {
	v = v % max;
	if(v < 0) v += max;
	return v;
};
var thx_Nil = { __ename__ : true, __constructs__ : ["nil"] };
thx_Nil.nil = ["nil",0];
thx_Nil.nil.__enum__ = thx_Nil;
var thx_Nulls = function() { };
thx_Nulls.__name__ = true;
var thx__$Set_Set_$Impl_$ = {};
thx__$Set_Set_$Impl_$.__name__ = true;
thx__$Set_Set_$Impl_$.arrayToSet = function(arr) {
	var set = [];
	var _g = 0;
	while(_g < arr.length) {
		var v = arr[_g];
		++_g;
		thx__$Set_Set_$Impl_$.push(set,v);
	}
	return set;
};
thx__$Set_Set_$Impl_$.create = function(arr) {
	return null == arr?[]:thx__$Set_Set_$Impl_$.arrayToSet(arr);
};
thx__$Set_Set_$Impl_$._new = function(arr) {
	return arr;
};
thx__$Set_Set_$Impl_$.add = function(this1,v) {
	var tmp;
	if(thx__$Set_Set_$Impl_$.exists(this1,v)) tmp = false; else {
		this1.push(v);
		tmp = true;
	}
	return tmp;
};
thx__$Set_Set_$Impl_$.copy = function(this1) {
	var tmp;
	var arr = this1.slice();
	tmp = arr;
	return tmp;
};
thx__$Set_Set_$Impl_$.difference = function(this1,set) {
	var result = this1.slice();
	var $it0 = HxOverrides.iter(set);
	while( $it0.hasNext() ) {
		var item = $it0.next();
		HxOverrides.remove(result,item);
	}
	return result;
};
thx__$Set_Set_$Impl_$.exists = function(this1,v) {
	var _g = 0;
	while(_g < this1.length) {
		var t = this1[_g];
		++_g;
		if(t == v) return true;
	}
	return false;
};
thx__$Set_Set_$Impl_$.get = function(this1,index) {
	return this1[index];
};
thx__$Set_Set_$Impl_$.intersection = function(this1,set) {
	var result = [];
	var _g = 0;
	while(_g < this1.length) {
		var item = this1[_g];
		++_g;
		if(thx__$Set_Set_$Impl_$.exists(set,item)) result.push(item);
	}
	return result;
};
thx__$Set_Set_$Impl_$.push = function(this1,v) {
	thx__$Set_Set_$Impl_$.add(this1,v);
};
thx__$Set_Set_$Impl_$.slice = function(this1,pos,end) {
	var tmp;
	var arr = this1.slice(pos,end);
	tmp = arr;
	return tmp;
};
thx__$Set_Set_$Impl_$.splice = function(this1,pos,len) {
	var tmp;
	var arr = this1.splice(pos,len);
	tmp = arr;
	return tmp;
};
thx__$Set_Set_$Impl_$.union = function(this1,set) {
	return thx__$Set_Set_$Impl_$.arrayToSet(this1.concat(thx__$Set_Set_$Impl_$.setToArray(set)));
};
thx__$Set_Set_$Impl_$.setToArray = function(this1) {
	return this1.slice();
};
thx__$Set_Set_$Impl_$.toString = function(this1) {
	return "{" + this1.join(", ") + "}";
};
var thx_Strings = function() { };
thx_Strings.__name__ = true;
thx_Strings.after = function(value,searchFor) {
	var pos = value.indexOf(searchFor);
	if(pos < 0) return ""; else return value.substring(pos + searchFor.length);
};
thx_Strings.capitalize = function(s) {
	return s.substring(0,1).toUpperCase() + s.substring(1);
};
thx_Strings.capitalizeWords = function(value,whiteSpaceOnly) {
	if(whiteSpaceOnly == null) whiteSpaceOnly = false;
	if(whiteSpaceOnly) return thx_Strings.UCWORDSWS.map(value.substring(0,1).toUpperCase() + value.substring(1),thx_Strings.upperMatch); else return thx_Strings.UCWORDS.map(value.substring(0,1).toUpperCase() + value.substring(1),thx_Strings.upperMatch);
};
thx_Strings.collapse = function(value) {
	return thx_Strings.WSG.replace(StringTools.trim(value)," ");
};
thx_Strings.compare = function(a,b) {
	return a < b?-1:a > b?1:0;
};
thx_Strings.contains = function(s,test) {
	return s.indexOf(test) >= 0;
};
thx_Strings.dasherize = function(s) {
	return StringTools.replace(s,"_","-");
};
thx_Strings.ellipsis = function(s,maxlen,symbol) {
	if(symbol == null) symbol = "...";
	if(maxlen == null) maxlen = 20;
	return s.length > maxlen?s.substring(0,symbol.length > maxlen - symbol.length?symbol.length:maxlen - symbol.length) + symbol:s;
};
thx_Strings.filter = function(s,predicate) {
	return s.split("").filter(predicate).join("");
};
thx_Strings.filterCharcode = function(s,predicate) {
	return thx_Strings.map(s,function(s1) {
		return HxOverrides.cca(s1,0);
	}).filter(predicate).map(function(i) {
		return String.fromCharCode(i);
	}).join("");
};
thx_Strings.from = function(value,searchFor) {
	var pos = value.indexOf(searchFor);
	if(pos < 0) return ""; else return value.substring(pos);
};
thx_Strings.humanize = function(s) {
	return StringTools.replace(thx_Strings.underscore(s),"_"," ");
};
thx_Strings.isAlphaNum = function(value) {
	return thx_Strings.ALPHANUM.match(value);
};
thx_Strings.isLowerCase = function(value) {
	return value.toLowerCase() == value;
};
thx_Strings.isUpperCase = function(value) {
	return value.toUpperCase() == value;
};
thx_Strings.ifEmpty = function(value,alt) {
	return null != value && "" != value?value:alt;
};
thx_Strings.isDigitsOnly = function(value) {
	return thx_Strings.DIGITS.match(value);
};
thx_Strings.isEmpty = function(value) {
	return value == null || value == "";
};
thx_Strings.random = function(value,length) {
	if(length == null) length = 1;
	var tmp;
	var pos = Math.floor((value.length - length + 1) * Math.random());
	tmp = HxOverrides.substr(value,pos,length);
	return tmp;
};
thx_Strings.iterator = function(s) {
	var tmp;
	var _this = s.split("");
	tmp = HxOverrides.iter(_this);
	return tmp;
};
thx_Strings.map = function(value,callback) {
	return value.split("").map(callback);
};
thx_Strings.remove = function(value,toremove) {
	return StringTools.replace(value,toremove,"");
};
thx_Strings.removeAfter = function(value,toremove) {
	return StringTools.endsWith(value,toremove)?value.substring(0,value.length - toremove.length):value;
};
thx_Strings.removeBefore = function(value,toremove) {
	return StringTools.startsWith(value,toremove)?value.substring(toremove.length):value;
};
thx_Strings.repeat = function(s,times) {
	var tmp;
	var _g = [];
	var _g1 = 0;
	while(_g1 < times) {
		_g1++;
		_g.push(s);
	}
	tmp = _g;
	return tmp.join("");
};
thx_Strings.reverse = function(s) {
	var arr = s.split("");
	arr.reverse();
	return arr.join("");
};
thx_Strings.stripTags = function(s) {
	return thx_Strings.STRIPTAGS.replace(s,"");
};
thx_Strings.surround = function(s,left,right) {
	return "" + left + s + (null == right?left:right);
};
thx_Strings.toArray = function(s) {
	return s.split("");
};
thx_Strings.toCharcodeArray = function(s) {
	return thx_Strings.map(s,function(s1) {
		return HxOverrides.cca(s1,0);
	});
};
thx_Strings.toChunks = function(s,len) {
	var chunks = [];
	while(s.length > 0) {
		chunks.push(s.substring(0,len));
		s = s.substring(len);
	}
	return chunks;
};
thx_Strings.trimChars = function(value,charlist) {
	return thx_Strings.trimCharsRight(thx_Strings.trimCharsLeft(value,charlist),charlist);
};
thx_Strings.trimCharsLeft = function(value,charlist) {
	var pos = 0;
	var _g1 = 0;
	var _g = value.length;
	while(_g1 < _g) {
		var i = _g1++;
		var tmp;
		var test = value.charAt(i);
		tmp = charlist.indexOf(test) >= 0;
		if(tmp) pos++; else break;
	}
	return value.substring(pos);
};
thx_Strings.trimCharsRight = function(value,charlist) {
	var len = value.length;
	var pos = len;
	var i;
	var _g = 0;
	while(_g < len) {
		var j = _g++;
		i = len - j - 1;
		var tmp;
		var test = value.charAt(i);
		tmp = charlist.indexOf(test) >= 0;
		if(tmp) pos = i; else break;
	}
	return value.substring(0,pos);
};
thx_Strings.underscore = function(s) {
	s = new EReg("::","g").replace(s,"/");
	s = new EReg("([A-Z]+)([A-Z][a-z])","g").replace(s,"$1_$2");
	s = new EReg("([a-z\\d])([A-Z])","g").replace(s,"$1_$2");
	s = new EReg("-","g").replace(s,"_");
	return s.toLowerCase();
};
thx_Strings.upTo = function(value,searchFor) {
	var pos = value.indexOf(searchFor);
	if(pos < 0) return value; else return value.substring(0,pos);
};
thx_Strings.wrapColumns = function(s,columns,indent,newline) {
	if(newline == null) newline = "\n";
	if(indent == null) indent = "";
	if(columns == null) columns = 78;
	return thx_Strings.SPLIT_LINES.split(s).map(function(part) {
		return thx_Strings.wrapLine(StringTools.trim(thx_Strings.WSG.replace(part," ")),columns,indent,newline);
	}).join(newline);
};
thx_Strings.upperMatch = function(re) {
	return re.matched(0).toUpperCase();
};
thx_Strings.wrapLine = function(s,columns,indent,newline) {
	var parts = [];
	var pos = 0;
	var len = s.length;
	var ilen = indent.length;
	columns -= ilen;
	while(true) {
		if(pos + columns >= len - ilen) {
			parts.push(s.substring(pos));
			break;
		}
		var i = 0;
		while(!StringTools.isSpace(s,pos + columns - i) && i < columns) i++;
		if(i == columns) {
			i = 0;
			while(!StringTools.isSpace(s,pos + columns + i) && pos + columns + i < len) i++;
			parts.push(s.substring(pos,pos + columns + i));
			pos += columns + i + 1;
		} else {
			parts.push(s.substring(pos,pos + columns - i));
			pos += columns - i + 1;
		}
	}
	return indent + parts.join(newline + indent);
};
var thx_Timer = function() { };
thx_Timer.__name__ = true;
thx_Timer.debounce = function(callback,delayms,leading) {
	if(leading == null) leading = false;
	var cancel = thx_Functions.noop;
	var poll = function() {
		cancel();
		cancel = thx_Timer.delay(callback,delayms);
	};
	return function() {
		if(leading) {
			leading = false;
			callback();
		}
		poll();
	};
};
thx_Timer.throttle = function(callback,delayms,leading) {
	if(leading == null) leading = false;
	var waiting = false;
	var poll = function() {
		waiting = true;
		thx_Timer.delay(callback,delayms);
	};
	return function() {
		if(leading) {
			leading = false;
			callback();
			return;
		}
		if(waiting) return;
		poll();
	};
};
thx_Timer.repeat = function(callback,delayms) {
	return (function($this) {
		var $r;
		var id = setInterval(callback,delayms);
		$r = function() {
			thx_Timer.clear(id);
		};
		return $r;
	}(this));
};
thx_Timer.delay = function(callback,delayms) {
	return (function($this) {
		var $r;
		var id = setTimeout(callback,delayms);
		$r = function() {
			thx_Timer.clear(id);
		};
		return $r;
	}(this));
};
thx_Timer.frame = function(callback) {
	var cancelled = false;
	var f = thx_Functions.noop;
	var current = performance.now();
	var next;
	f = function() {
		if(cancelled) return;
		next = performance.now();
		callback(next - current);
		current = next;
		requestAnimationFrame(f);
	};
	requestAnimationFrame(f);
	return function() {
		cancelled = true;
	};
};
thx_Timer.nextFrame = function(callback) {
	var id = requestAnimationFrame(callback);
	return function() {
		cancelAnimationFrame(id);
	};
};
thx_Timer.immediate = function(callback) {
	return (function($this) {
		var $r;
		var id = setImmediate(callback);
		$r = function() {
			thx_Timer.clear(id);
		};
		return $r;
	}(this));
};
thx_Timer.clear = function(id) {
	return clearTimeout(id);
};
thx_Timer.time = function() {
	return performance.now();
};
var thx__$Tuple_Tuple0_$Impl_$ = {};
thx__$Tuple_Tuple0_$Impl_$.__name__ = true;
thx__$Tuple_Tuple0_$Impl_$._new = function() {
	return thx_Nil.nil;
};
thx__$Tuple_Tuple0_$Impl_$["with"] = function(this1,v) {
	return v;
};
thx__$Tuple_Tuple0_$Impl_$.toString = function(this1) {
	return "Tuple0()";
};
thx__$Tuple_Tuple0_$Impl_$.toNil = function(this1) {
	return this1;
};
thx__$Tuple_Tuple0_$Impl_$.nilToTuple = function(v) {
	return thx_Nil.nil;
};
var thx__$Tuple_Tuple1_$Impl_$ = {};
thx__$Tuple_Tuple1_$Impl_$.__name__ = true;
thx__$Tuple_Tuple1_$Impl_$._new = function(_0) {
	return _0;
};
thx__$Tuple_Tuple1_$Impl_$.get__0 = function(this1) {
	return this1;
};
thx__$Tuple_Tuple1_$Impl_$["with"] = function(this1,v) {
	return { _0 : this1, _1 : v};
};
thx__$Tuple_Tuple1_$Impl_$.toString = function(this1) {
	return "Tuple1(" + Std.string(this1) + ")";
};
thx__$Tuple_Tuple1_$Impl_$.arrayToTuple = function(v) {
	return v[0];
};
var thx__$Tuple_Tuple2_$Impl_$ = {};
thx__$Tuple_Tuple2_$Impl_$.__name__ = true;
thx__$Tuple_Tuple2_$Impl_$._new = function(_0,_1) {
	return { _0 : _0, _1 : _1};
};
thx__$Tuple_Tuple2_$Impl_$.get_left = function(this1) {
	return this1._0;
};
thx__$Tuple_Tuple2_$Impl_$.get_right = function(this1) {
	return this1._1;
};
thx__$Tuple_Tuple2_$Impl_$.flip = function(this1) {
	return { _0 : this1._1, _1 : this1._0};
};
thx__$Tuple_Tuple2_$Impl_$.dropLeft = function(this1) {
	return this1._1;
};
thx__$Tuple_Tuple2_$Impl_$.dropRight = function(this1) {
	return this1._0;
};
thx__$Tuple_Tuple2_$Impl_$["with"] = function(this1,v) {
	return { _0 : this1._0, _1 : this1._1, _2 : v};
};
thx__$Tuple_Tuple2_$Impl_$.toString = function(this1) {
	return "Tuple2(" + Std.string(this1._0) + "," + Std.string(this1._1) + ")";
};
thx__$Tuple_Tuple2_$Impl_$.arrayToTuple2 = function(v) {
	return { _0 : v[0], _1 : v[1]};
};
var thx__$Tuple_Tuple3_$Impl_$ = {};
thx__$Tuple_Tuple3_$Impl_$.__name__ = true;
thx__$Tuple_Tuple3_$Impl_$._new = function(_0,_1,_2) {
	return { _0 : _0, _1 : _1, _2 : _2};
};
thx__$Tuple_Tuple3_$Impl_$.flip = function(this1) {
	return { _0 : this1._2, _1 : this1._1, _2 : this1._0};
};
thx__$Tuple_Tuple3_$Impl_$.dropLeft = function(this1) {
	return { _0 : this1._1, _1 : this1._2};
};
thx__$Tuple_Tuple3_$Impl_$.dropRight = function(this1) {
	return { _0 : this1._0, _1 : this1._1};
};
thx__$Tuple_Tuple3_$Impl_$["with"] = function(this1,v) {
	return { _0 : this1._0, _1 : this1._1, _2 : this1._2, _3 : v};
};
thx__$Tuple_Tuple3_$Impl_$.toString = function(this1) {
	return "Tuple3(" + Std.string(this1._0) + "," + Std.string(this1._1) + "," + Std.string(this1._2) + ")";
};
thx__$Tuple_Tuple3_$Impl_$.arrayToTuple3 = function(v) {
	return { _0 : v[0], _1 : v[1], _2 : v[2]};
};
var thx__$Tuple_Tuple4_$Impl_$ = {};
thx__$Tuple_Tuple4_$Impl_$.__name__ = true;
thx__$Tuple_Tuple4_$Impl_$._new = function(_0,_1,_2,_3) {
	return { _0 : _0, _1 : _1, _2 : _2, _3 : _3};
};
thx__$Tuple_Tuple4_$Impl_$.flip = function(this1) {
	return { _0 : this1._3, _1 : this1._2, _2 : this1._1, _3 : this1._0};
};
thx__$Tuple_Tuple4_$Impl_$.dropLeft = function(this1) {
	return { _0 : this1._1, _1 : this1._2, _2 : this1._3};
};
thx__$Tuple_Tuple4_$Impl_$.dropRight = function(this1) {
	return { _0 : this1._0, _1 : this1._1, _2 : this1._2};
};
thx__$Tuple_Tuple4_$Impl_$["with"] = function(this1,v) {
	return { _0 : this1._0, _1 : this1._1, _2 : this1._2, _3 : this1._3, _4 : v};
};
thx__$Tuple_Tuple4_$Impl_$.toString = function(this1) {
	return "Tuple4(" + Std.string(this1._0) + "," + Std.string(this1._1) + "," + Std.string(this1._2) + "," + Std.string(this1._3) + ")";
};
thx__$Tuple_Tuple4_$Impl_$.arrayToTuple4 = function(v) {
	return { _0 : v[0], _1 : v[1], _2 : v[2], _3 : v[3]};
};
var thx__$Tuple_Tuple5_$Impl_$ = {};
thx__$Tuple_Tuple5_$Impl_$.__name__ = true;
thx__$Tuple_Tuple5_$Impl_$._new = function(_0,_1,_2,_3,_4) {
	return { _0 : _0, _1 : _1, _2 : _2, _3 : _3, _4 : _4};
};
thx__$Tuple_Tuple5_$Impl_$.flip = function(this1) {
	return { _0 : this1._4, _1 : this1._3, _2 : this1._2, _3 : this1._1, _4 : this1._0};
};
thx__$Tuple_Tuple5_$Impl_$.dropLeft = function(this1) {
	return { _0 : this1._1, _1 : this1._2, _2 : this1._3, _3 : this1._4};
};
thx__$Tuple_Tuple5_$Impl_$.dropRight = function(this1) {
	return { _0 : this1._0, _1 : this1._1, _2 : this1._2, _3 : this1._3};
};
thx__$Tuple_Tuple5_$Impl_$["with"] = function(this1,v) {
	return { _0 : this1._0, _1 : this1._1, _2 : this1._2, _3 : this1._3, _4 : this1._4, _5 : v};
};
thx__$Tuple_Tuple5_$Impl_$.toString = function(this1) {
	return "Tuple5(" + Std.string(this1._0) + "," + Std.string(this1._1) + "," + Std.string(this1._2) + "," + Std.string(this1._3) + "," + Std.string(this1._4) + ")";
};
thx__$Tuple_Tuple5_$Impl_$.arrayToTuple5 = function(v) {
	return { _0 : v[0], _1 : v[1], _2 : v[2], _3 : v[3], _4 : v[4]};
};
var thx__$Tuple_Tuple6_$Impl_$ = {};
thx__$Tuple_Tuple6_$Impl_$.__name__ = true;
thx__$Tuple_Tuple6_$Impl_$._new = function(_0,_1,_2,_3,_4,_5) {
	return { _0 : _0, _1 : _1, _2 : _2, _3 : _3, _4 : _4, _5 : _5};
};
thx__$Tuple_Tuple6_$Impl_$.flip = function(this1) {
	return { _0 : this1._5, _1 : this1._4, _2 : this1._3, _3 : this1._2, _4 : this1._1, _5 : this1._0};
};
thx__$Tuple_Tuple6_$Impl_$.dropLeft = function(this1) {
	return { _0 : this1._1, _1 : this1._2, _2 : this1._3, _3 : this1._4, _4 : this1._5};
};
thx__$Tuple_Tuple6_$Impl_$.dropRight = function(this1) {
	return { _0 : this1._0, _1 : this1._1, _2 : this1._2, _3 : this1._3, _4 : this1._4};
};
thx__$Tuple_Tuple6_$Impl_$.toString = function(this1) {
	return "Tuple6(" + Std.string(this1._0) + "," + Std.string(this1._1) + "," + Std.string(this1._2) + "," + Std.string(this1._3) + "," + Std.string(this1._4) + "," + Std.string(this1._5) + ")";
};
thx__$Tuple_Tuple6_$Impl_$.arrayToTuple6 = function(v) {
	return { _0 : v[0], _1 : v[1], _2 : v[2], _3 : v[3], _4 : v[4], _5 : v[5]};
};
var thx_color__$CIELCh_CIELCh_$Impl_$ = {};
thx_color__$CIELCh_CIELCh_$Impl_$.__name__ = true;
thx_color__$CIELCh_CIELCh_$Impl_$.create = function(lightness,chroma,hue) {
	var tmp;
	var channels = [lightness,chroma,thx_Floats.wrapCircular(hue,360)];
	tmp = channels;
	return tmp;
};
thx_color__$CIELCh_CIELCh_$Impl_$.fromFloats = function(arr) {
	thx_ArrayFloats.resize(arr,3);
	return thx_color__$CIELCh_CIELCh_$Impl_$.create(arr[0],arr[1],arr[2]);
};
thx_color__$CIELCh_CIELCh_$Impl_$.fromString = function(color) {
	var info = thx_color_parse_ColorParser.parseColor(color);
	if(null == info) return null;
	var tmp;
	try {
		var _g = info.name;
		switch(_g) {
		case "cielch":
			tmp = thx_color__$CIELCh_CIELCh_$Impl_$.fromFloats(thx_color_parse_ColorParser.getFloatChannels(info.channels,3,false));
			break;
		default:
			tmp = null;
		}
	} catch( e ) {
		haxe_CallStack.lastException = e;
		if (e instanceof js__$Boot_HaxeError) e = e.val;
		tmp = null;
	}
	return tmp;
};
thx_color__$CIELCh_CIELCh_$Impl_$._new = function(channels) {
	return channels;
};
thx_color__$CIELCh_CIELCh_$Impl_$.analogous = function(this1,spread) {
	if(spread == null) spread = 30.0;
	var tmp;
	var _0 = thx_color__$CIELCh_CIELCh_$Impl_$.rotate(this1,-spread);
	var _1 = thx_color__$CIELCh_CIELCh_$Impl_$.rotate(this1,spread);
	tmp = { _0 : _0, _1 : _1};
	return tmp;
};
thx_color__$CIELCh_CIELCh_$Impl_$.complement = function(this1) {
	return thx_color__$CIELCh_CIELCh_$Impl_$.rotate(this1,180);
};
thx_color__$CIELCh_CIELCh_$Impl_$.interpolate = function(this1,other,t) {
	var tmp;
	var channels = [thx_Floats.interpolate(t,this1[0],other[0]),thx_Floats.interpolate(t,this1[1],other[1]),thx_Floats.interpolateAngle(t,this1[2],other[2],360)];
	tmp = channels;
	return tmp;
};
thx_color__$CIELCh_CIELCh_$Impl_$.rotate = function(this1,angle) {
	return thx_color__$CIELCh_CIELCh_$Impl_$.withHue(this1,this1[2] + angle);
};
thx_color__$CIELCh_CIELCh_$Impl_$.split = function(this1,spread) {
	if(spread == null) spread = 144.0;
	var tmp;
	var _0 = thx_color__$CIELCh_CIELCh_$Impl_$.rotate(this1,-spread);
	var _1 = thx_color__$CIELCh_CIELCh_$Impl_$.rotate(this1,spread);
	tmp = { _0 : _0, _1 : _1};
	return tmp;
};
thx_color__$CIELCh_CIELCh_$Impl_$.square = function(this1) {
	return thx_color__$CIELCh_CIELCh_$Impl_$.tetrad(this1,90);
};
thx_color__$CIELCh_CIELCh_$Impl_$.tetrad = function(this1,angle) {
	var tmp;
	var _0 = thx_color__$CIELCh_CIELCh_$Impl_$.rotate(this1,0);
	var _1 = thx_color__$CIELCh_CIELCh_$Impl_$.rotate(this1,angle);
	var _2 = thx_color__$CIELCh_CIELCh_$Impl_$.rotate(this1,180);
	var _3 = thx_color__$CIELCh_CIELCh_$Impl_$.rotate(this1,180 + angle);
	tmp = { _0 : _0, _1 : _1, _2 : _2, _3 : _3};
	return tmp;
};
thx_color__$CIELCh_CIELCh_$Impl_$.triad = function(this1) {
	var tmp;
	var _0 = thx_color__$CIELCh_CIELCh_$Impl_$.rotate(this1,-120);
	var _1 = thx_color__$CIELCh_CIELCh_$Impl_$.rotate(this1,0);
	var _2 = thx_color__$CIELCh_CIELCh_$Impl_$.rotate(this1,120);
	tmp = { _0 : _0, _1 : _1, _2 : _2};
	return tmp;
};
thx_color__$CIELCh_CIELCh_$Impl_$.withLightness = function(this1,newlightness) {
	return [newlightness,this1[1],this1[2]];
};
thx_color__$CIELCh_CIELCh_$Impl_$.withChroma = function(this1,newchroma) {
	return [this1[0],newchroma,this1[2]];
};
thx_color__$CIELCh_CIELCh_$Impl_$.withHue = function(this1,newhue) {
	var tmp;
	var channels = [this1[0],this1[1],thx_Floats.wrapCircular(newhue,360)];
	tmp = channels;
	return tmp;
};
thx_color__$CIELCh_CIELCh_$Impl_$.equals = function(this1,other) {
	return Math.abs(this1[0] - other[0]) <= 10e-10 && Math.abs(this1[1] - other[1]) <= 10e-10 && Math.abs(this1[2] - other[2]) <= 10e-10;
};
thx_color__$CIELCh_CIELCh_$Impl_$.toString = function(this1) {
	return "CIELCh(" + this1[0] + "," + this1[1] + "," + this1[2] + ")";
};
thx_color__$CIELCh_CIELCh_$Impl_$.toCIELab = function(this1) {
	var hradi = this1[2] * (Math.PI / 180);
	var a = Math.cos(hradi) * this1[1];
	var b = Math.sin(hradi) * this1[1];
	return [this1[0],a,b];
};
thx_color__$CIELCh_CIELCh_$Impl_$.toCMY = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toCMY(thx_color__$CIELCh_CIELCh_$Impl_$.toRGBX(this1));
};
thx_color__$CIELCh_CIELCh_$Impl_$.toCMYK = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toCMYK(thx_color__$CIELCh_CIELCh_$Impl_$.toRGBX(this1));
};
thx_color__$CIELCh_CIELCh_$Impl_$.toGrey = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toGrey(thx_color__$CIELCh_CIELCh_$Impl_$.toRGBX(this1));
};
thx_color__$CIELCh_CIELCh_$Impl_$.toHSL = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toHSL(thx_color__$CIELCh_CIELCh_$Impl_$.toRGBX(this1));
};
thx_color__$CIELCh_CIELCh_$Impl_$.toHSV = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toHSV(thx_color__$CIELCh_CIELCh_$Impl_$.toRGBX(this1));
};
thx_color__$CIELCh_CIELCh_$Impl_$.toRGB = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toRGB(thx_color__$CIELCh_CIELCh_$Impl_$.toRGBX(this1));
};
thx_color__$CIELCh_CIELCh_$Impl_$.toRGBA = function(this1) {
	return thx_color__$RGBXA_RGBXA_$Impl_$.toRGBA(thx_color__$CIELCh_CIELCh_$Impl_$.toRGBXA(this1));
};
thx_color__$CIELCh_CIELCh_$Impl_$.toRGBX = function(this1) {
	return thx_color__$CIELab_CIELab_$Impl_$.toRGBX(thx_color__$CIELCh_CIELCh_$Impl_$.toCIELab(this1));
};
thx_color__$CIELCh_CIELCh_$Impl_$.toRGBXA = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toRGBXA(thx_color__$CIELCh_CIELCh_$Impl_$.toRGBX(this1));
};
thx_color__$CIELCh_CIELCh_$Impl_$.toXYZ = function(this1) {
	return thx_color__$CIELab_CIELab_$Impl_$.toXYZ(thx_color__$CIELCh_CIELCh_$Impl_$.toCIELab(this1));
};
thx_color__$CIELCh_CIELCh_$Impl_$.toYxy = function(this1) {
	return thx_color__$CIELab_CIELab_$Impl_$.toYxy(thx_color__$CIELCh_CIELCh_$Impl_$.toCIELab(this1));
};
thx_color__$CIELCh_CIELCh_$Impl_$.get_lightness = function(this1) {
	return this1[0];
};
thx_color__$CIELCh_CIELCh_$Impl_$.get_chroma = function(this1) {
	return this1[1];
};
thx_color__$CIELCh_CIELCh_$Impl_$.get_hue = function(this1) {
	return this1[2];
};
var thx_color__$CIELab_CIELab_$Impl_$ = {};
thx_color__$CIELab_CIELab_$Impl_$.__name__ = true;
thx_color__$CIELab_CIELab_$Impl_$.create = function(l,a,b) {
	return [l,a,b];
};
thx_color__$CIELab_CIELab_$Impl_$.fromFloats = function(arr) {
	thx_ArrayFloats.resize(arr,3);
	return thx_color__$CIELab_CIELab_$Impl_$.create(arr[0],arr[1],arr[2]);
};
thx_color__$CIELab_CIELab_$Impl_$.fromString = function(color) {
	var info = thx_color_parse_ColorParser.parseColor(color);
	if(null == info) return null;
	var tmp;
	try {
		var _g = info.name;
		switch(_g) {
		case "cielab":
			tmp = thx_color__$CIELab_CIELab_$Impl_$.fromFloats(thx_color_parse_ColorParser.getFloatChannels(info.channels,3,false));
			break;
		default:
			tmp = null;
		}
	} catch( e ) {
		haxe_CallStack.lastException = e;
		if (e instanceof js__$Boot_HaxeError) e = e.val;
		tmp = null;
	}
	return tmp;
};
thx_color__$CIELab_CIELab_$Impl_$._new = function(channels) {
	return channels;
};
thx_color__$CIELab_CIELab_$Impl_$.distance = function(this1,other) {
	return (this1[0] - other[0]) * (this1[0] - other[0]) + (this1[1] - other[1]) * (this1[1] - other[1]) + (this1[2] - other[2]) * (this1[2] - other[2]);
};
thx_color__$CIELab_CIELab_$Impl_$.interpolate = function(this1,other,t) {
	var tmp;
	var channels = [thx_Floats.interpolate(t,this1[0],other[0]),thx_Floats.interpolate(t,this1[1],other[1]),thx_Floats.interpolate(t,this1[2],other[2])];
	tmp = channels;
	return tmp;
};
thx_color__$CIELab_CIELab_$Impl_$.darker = function(this1,t) {
	var tmp;
	var channels = [thx_Floats.interpolate(t,this1[0],0),this1[1],this1[2]];
	tmp = channels;
	return tmp;
};
thx_color__$CIELab_CIELab_$Impl_$.lighter = function(this1,t) {
	var tmp;
	var channels = [thx_Floats.interpolate(t,this1[0],100),this1[1],this1[2]];
	tmp = channels;
	return tmp;
};
thx_color__$CIELab_CIELab_$Impl_$.match = function(this1,palette) {
	var it = palette;
	if(null == it) throw new thx_error_NullArgument("Iterable argument \"this\" cannot be null",{ fileName : "NullArgument.hx", lineNumber : 73, className : "thx.color._CIELab.CIELab_Impl_", methodName : "match"}); else if(!$iterator(it)().hasNext()) throw new thx_error_NullArgument("Iterable argument \"this\" cannot be empty",{ fileName : "NullArgument.hx", lineNumber : 75, className : "thx.color._CIELab.CIELab_Impl_", methodName : "match"});
	var dist = Infinity;
	var closest = null;
	var $it0 = $iterator(palette)();
	while( $it0.hasNext() ) {
		var color = $it0.next();
		var ndist = thx_color__$CIELab_CIELab_$Impl_$.distance(this1,color);
		if(ndist < dist) {
			dist = ndist;
			closest = color;
		}
	}
	return closest;
};
thx_color__$CIELab_CIELab_$Impl_$.equals = function(this1,other) {
	return Math.abs(this1[0] - other[0]) <= 10e-10 && Math.abs(this1[1] - other[1]) <= 10e-10 && Math.abs(this1[2] - other[2]) <= 10e-10;
};
thx_color__$CIELab_CIELab_$Impl_$.withLightness = function(this1,lightness) {
	return [lightness,this1[1],this1[2]];
};
thx_color__$CIELab_CIELab_$Impl_$.withA = function(this1,newa) {
	return [this1[0],newa,this1[2]];
};
thx_color__$CIELab_CIELab_$Impl_$.withB = function(this1,newb) {
	return [this1[0],this1[1],newb];
};
thx_color__$CIELab_CIELab_$Impl_$.toString = function(this1) {
	return "CIELab(" + this1[0] + "," + this1[1] + "," + this1[2] + ")";
};
thx_color__$CIELab_CIELab_$Impl_$.toCIELCh = function(this1) {
	var h = thx_Floats.wrapCircular(Math.atan2(this1[2],this1[1]) * 180 / Math.PI,360);
	var c = Math.sqrt(this1[1] * this1[1] + this1[2] * this1[2]);
	return [this1[0],c,h];
};
thx_color__$CIELab_CIELab_$Impl_$.toCMY = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toCMY(thx_color__$CIELab_CIELab_$Impl_$.toRGBX(this1));
};
thx_color__$CIELab_CIELab_$Impl_$.toCMYK = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toCMYK(thx_color__$CIELab_CIELab_$Impl_$.toRGBX(this1));
};
thx_color__$CIELab_CIELab_$Impl_$.toGrey = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toGrey(thx_color__$CIELab_CIELab_$Impl_$.toRGBX(this1));
};
thx_color__$CIELab_CIELab_$Impl_$.toHSL = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toHSL(thx_color__$CIELab_CIELab_$Impl_$.toRGBX(this1));
};
thx_color__$CIELab_CIELab_$Impl_$.toHSV = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toHSV(thx_color__$CIELab_CIELab_$Impl_$.toRGBX(this1));
};
thx_color__$CIELab_CIELab_$Impl_$.toRGB = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toRGB(thx_color__$CIELab_CIELab_$Impl_$.toRGBX(this1));
};
thx_color__$CIELab_CIELab_$Impl_$.toRGBA = function(this1) {
	return thx_color__$RGBXA_RGBXA_$Impl_$.toRGBA(thx_color__$CIELab_CIELab_$Impl_$.toRGBXA(this1));
};
thx_color__$CIELab_CIELab_$Impl_$.toRGBX = function(this1) {
	return thx_color__$XYZ_XYZ_$Impl_$.toRGBX(thx_color__$CIELab_CIELab_$Impl_$.toXYZ(this1));
};
thx_color__$CIELab_CIELab_$Impl_$.toRGBXA = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toRGBXA(thx_color__$CIELab_CIELab_$Impl_$.toRGBX(this1));
};
thx_color__$CIELab_CIELab_$Impl_$.toXYZ = function(this1) {
	var y = (this1[0] + 16) / 116;
	var x = this1[1] / 500 + y;
	var z = y - this1[2] / 200;
	var p;
	p = Math.pow(y,3);
	y = p > 0.008856?p:(y - 0.137931034482758619) / 7.787;
	p = Math.pow(x,3);
	x = p > 0.008856?p:(x - 0.137931034482758619) / 7.787;
	p = Math.pow(z,3);
	z = p > 0.008856?p:(z - 0.137931034482758619) / 7.787;
	return [95.047 * x,100 * y,108.883 * z];
};
thx_color__$CIELab_CIELab_$Impl_$.toYxy = function(this1) {
	return thx_color__$XYZ_XYZ_$Impl_$.toYxy(thx_color__$CIELab_CIELab_$Impl_$.toXYZ(this1));
};
thx_color__$CIELab_CIELab_$Impl_$.get_l = function(this1) {
	return this1[0];
};
thx_color__$CIELab_CIELab_$Impl_$.get_a = function(this1) {
	return this1[1];
};
thx_color__$CIELab_CIELab_$Impl_$.get_b = function(this1) {
	return this1[2];
};
var thx_color__$CMY_CMY_$Impl_$ = {};
thx_color__$CMY_CMY_$Impl_$.__name__ = true;
thx_color__$CMY_CMY_$Impl_$.create = function(cyan,magenta,yellow) {
	return [cyan < 0?0:cyan > 1?1:cyan,magenta < 0?0:magenta > 1?1:magenta,yellow < 0?0:yellow > 1?1:yellow];
};
thx_color__$CMY_CMY_$Impl_$.fromFloats = function(arr) {
	thx_ArrayFloats.resize(arr,3);
	return thx_color__$CMY_CMY_$Impl_$.create(arr[0],arr[1],arr[2]);
};
thx_color__$CMY_CMY_$Impl_$.fromString = function(color) {
	var info = thx_color_parse_ColorParser.parseColor(color);
	if(null == info) return null;
	var tmp;
	try {
		var _g = info.name;
		switch(_g) {
		case "cmy":
			var channels = thx_color_parse_ColorParser.getFloatChannels(info.channels,3);
			tmp = channels;
			break;
		default:
			tmp = null;
		}
	} catch( e ) {
		haxe_CallStack.lastException = e;
		if (e instanceof js__$Boot_HaxeError) e = e.val;
		tmp = null;
	}
	return tmp;
};
thx_color__$CMY_CMY_$Impl_$._new = function(channels) {
	return channels;
};
thx_color__$CMY_CMY_$Impl_$.interpolate = function(this1,other,t) {
	var tmp;
	var channels = [thx_Floats.interpolate(t,this1[0],other[0]),thx_Floats.interpolate(t,this1[1],other[1]),thx_Floats.interpolate(t,this1[2],other[2])];
	tmp = channels;
	return tmp;
};
thx_color__$CMY_CMY_$Impl_$.withCyan = function(this1,newcyan) {
	return [newcyan < 0?0:newcyan > 1?1:newcyan,this1[1],this1[2]];
};
thx_color__$CMY_CMY_$Impl_$.withMagenta = function(this1,newmagenta) {
	return [this1[0],newmagenta < 0?0:newmagenta > 1?1:newmagenta,this1[2]];
};
thx_color__$CMY_CMY_$Impl_$.withYellow = function(this1,newyellow) {
	return [this1[0],this1[1],newyellow < 0?0:newyellow > 1?1:newyellow];
};
thx_color__$CMY_CMY_$Impl_$.toString = function(this1) {
	return "cmy(" + this1[0] + "," + this1[1] + "," + this1[2] + ")";
};
thx_color__$CMY_CMY_$Impl_$.equals = function(this1,other) {
	return Math.abs(this1[0] - other[0]) <= 10e-10 && Math.abs(this1[1] - other[1]) <= 10e-10 && Math.abs(this1[2] - other[2]) <= 10e-10;
};
thx_color__$CMY_CMY_$Impl_$.toCIELab = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toCIELab(thx_color__$CMY_CMY_$Impl_$.toRGBX(this1));
};
thx_color__$CMY_CMY_$Impl_$.toCIELCh = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toCIELCh(thx_color__$CMY_CMY_$Impl_$.toRGBX(this1));
};
thx_color__$CMY_CMY_$Impl_$.toCMYK = function(this1) {
	var k = Math.min(Math.min(this1[0],this1[1]),this1[2]);
	if(k == 1) return [0,0,0,1]; else return [(this1[0] - k) / (1 - k),(this1[1] - k) / (1 - k),(this1[2] - k) / (1 - k),k];
};
thx_color__$CMY_CMY_$Impl_$.toGrey = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toGrey(thx_color__$CMY_CMY_$Impl_$.toRGBX(this1));
};
thx_color__$CMY_CMY_$Impl_$.toHSL = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toHSL(thx_color__$CMY_CMY_$Impl_$.toRGBX(this1));
};
thx_color__$CMY_CMY_$Impl_$.toHSV = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toHSV(thx_color__$CMY_CMY_$Impl_$.toRGBX(this1));
};
thx_color__$CMY_CMY_$Impl_$.toRGB = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toRGB(thx_color__$CMY_CMY_$Impl_$.toRGBX(this1));
};
thx_color__$CMY_CMY_$Impl_$.toRGBA = function(this1) {
	return thx_color__$RGBXA_RGBXA_$Impl_$.toRGBA(thx_color__$CMY_CMY_$Impl_$.toRGBXA(this1));
};
thx_color__$CMY_CMY_$Impl_$.toRGBX = function(this1) {
	return [1 - this1[0],1 - this1[1],1 - this1[2]];
};
thx_color__$CMY_CMY_$Impl_$.toRGBXA = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toRGBXA(thx_color__$CMY_CMY_$Impl_$.toRGBX(this1));
};
thx_color__$CMY_CMY_$Impl_$.toXYZ = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toXYZ(thx_color__$CMY_CMY_$Impl_$.toRGBX(this1));
};
thx_color__$CMY_CMY_$Impl_$.toYxy = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toYxy(thx_color__$CMY_CMY_$Impl_$.toRGBX(this1));
};
thx_color__$CMY_CMY_$Impl_$.get_cyan = function(this1) {
	return this1[0];
};
thx_color__$CMY_CMY_$Impl_$.get_magenta = function(this1) {
	return this1[1];
};
thx_color__$CMY_CMY_$Impl_$.get_yellow = function(this1) {
	return this1[2];
};
var thx_color__$CMYK_CMYK_$Impl_$ = {};
thx_color__$CMYK_CMYK_$Impl_$.__name__ = true;
thx_color__$CMYK_CMYK_$Impl_$.create = function(cyan,magenta,yellow,black) {
	return [cyan < 0?0:cyan > 1?1:cyan,magenta < 0?0:magenta > 1?1:magenta,yellow < 0?0:yellow > 1?1:yellow,black < 0?0:black > 1?1:black];
};
thx_color__$CMYK_CMYK_$Impl_$.fromFloats = function(arr) {
	thx_ArrayFloats.resize(arr,4);
	return thx_color__$CMYK_CMYK_$Impl_$.create(arr[0],arr[1],arr[2],arr[3]);
};
thx_color__$CMYK_CMYK_$Impl_$.fromString = function(color) {
	var info = thx_color_parse_ColorParser.parseColor(color);
	if(null == info) return null;
	var tmp;
	try {
		var _g = info.name;
		switch(_g) {
		case "cmyk":
			var channels = thx_color_parse_ColorParser.getFloatChannels(info.channels,4);
			tmp = channels;
			break;
		default:
			tmp = null;
		}
	} catch( e ) {
		haxe_CallStack.lastException = e;
		if (e instanceof js__$Boot_HaxeError) e = e.val;
		tmp = null;
	}
	return tmp;
};
thx_color__$CMYK_CMYK_$Impl_$._new = function(channels) {
	return channels;
};
thx_color__$CMYK_CMYK_$Impl_$.darker = function(this1,t) {
	var tmp;
	var channels = [this1[0],this1[1],this1[2],thx_Floats.interpolate(t,this1[3],1)];
	tmp = channels;
	return tmp;
};
thx_color__$CMYK_CMYK_$Impl_$.lighter = function(this1,t) {
	var tmp;
	var channels = [this1[0],this1[1],this1[2],thx_Floats.interpolate(t,this1[3],0)];
	tmp = channels;
	return tmp;
};
thx_color__$CMYK_CMYK_$Impl_$.interpolate = function(this1,other,t) {
	var tmp;
	var channels = [thx_Floats.interpolate(t,this1[0],other[0]),thx_Floats.interpolate(t,this1[1],other[1]),thx_Floats.interpolate(t,this1[2],other[2]),thx_Floats.interpolate(t,this1[3],other[3])];
	tmp = channels;
	return tmp;
};
thx_color__$CMYK_CMYK_$Impl_$.withCyan = function(this1,newcyan) {
	return [newcyan < 0?0:newcyan > 1?1:newcyan,this1[1],this1[2],this1[3]];
};
thx_color__$CMYK_CMYK_$Impl_$.withMagenta = function(this1,newmagenta) {
	return [this1[0],newmagenta < 0?0:newmagenta > 1?1:newmagenta,this1[2],this1[3]];
};
thx_color__$CMYK_CMYK_$Impl_$.withYellow = function(this1,newyellow) {
	return [this1[0],this1[1],newyellow < 0?0:newyellow > 1?1:newyellow,this1[3]];
};
thx_color__$CMYK_CMYK_$Impl_$.withBlack = function(this1,newblack) {
	return [this1[0],this1[1],this1[2],newblack < 0?0:newblack > 1?1:newblack];
};
thx_color__$CMYK_CMYK_$Impl_$.toString = function(this1) {
	return "cmyk(" + this1[0] + "," + this1[1] + "," + this1[2] + "," + this1[3] + ")";
};
thx_color__$CMYK_CMYK_$Impl_$.equals = function(this1,other) {
	return Math.abs(this1[0] - other[0]) <= 10e-10 && Math.abs(this1[1] - other[1]) <= 10e-10 && Math.abs(this1[2] - other[2]) <= 10e-10 && Math.abs(this1[3] - other[3]) <= 10e-10;
};
thx_color__$CMYK_CMYK_$Impl_$.toCIELab = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toCIELab(thx_color__$CMYK_CMYK_$Impl_$.toRGBX(this1));
};
thx_color__$CMYK_CMYK_$Impl_$.toCIELCh = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toCIELCh(thx_color__$CMYK_CMYK_$Impl_$.toRGBX(this1));
};
thx_color__$CMYK_CMYK_$Impl_$.toCMY = function(this1) {
	return [this1[3] + (1 - this1[3]) * this1[0],this1[3] + (1 - this1[3]) * this1[1],this1[3] + (1 - this1[3]) * this1[2]];
};
thx_color__$CMYK_CMYK_$Impl_$.toGrey = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toGrey(thx_color__$CMYK_CMYK_$Impl_$.toRGBX(this1));
};
thx_color__$CMYK_CMYK_$Impl_$.toHSL = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toHSL(thx_color__$CMYK_CMYK_$Impl_$.toRGBX(this1));
};
thx_color__$CMYK_CMYK_$Impl_$.toHSV = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toHSV(thx_color__$CMYK_CMYK_$Impl_$.toRGBX(this1));
};
thx_color__$CMYK_CMYK_$Impl_$.toRGB = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toRGB(thx_color__$CMYK_CMYK_$Impl_$.toRGBX(this1));
};
thx_color__$CMYK_CMYK_$Impl_$.toRGBA = function(this1) {
	return thx_color__$RGBXA_RGBXA_$Impl_$.toRGBA(thx_color__$CMYK_CMYK_$Impl_$.toRGBXA(this1));
};
thx_color__$CMYK_CMYK_$Impl_$.toRGBX = function(this1) {
	return [(1 - this1[3]) * (1 - this1[0]),(1 - this1[3]) * (1 - this1[1]),(1 - this1[3]) * (1 - this1[2])];
};
thx_color__$CMYK_CMYK_$Impl_$.toRGBXA = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toRGBXA(thx_color__$CMYK_CMYK_$Impl_$.toRGBX(this1));
};
thx_color__$CMYK_CMYK_$Impl_$.get_cyan = function(this1) {
	return this1[0];
};
thx_color__$CMYK_CMYK_$Impl_$.get_magenta = function(this1) {
	return this1[1];
};
thx_color__$CMYK_CMYK_$Impl_$.get_yellow = function(this1) {
	return this1[2];
};
thx_color__$CMYK_CMYK_$Impl_$.get_black = function(this1) {
	return this1[3];
};
thx_color__$CMYK_CMYK_$Impl_$.toXYZ = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toXYZ(thx_color__$CMYK_CMYK_$Impl_$.toRGBX(this1));
};
thx_color__$CMYK_CMYK_$Impl_$.toYxy = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toYxy(thx_color__$CMYK_CMYK_$Impl_$.toRGBX(this1));
};
var thx_color__$Grey_Grey_$Impl_$ = {};
thx_color__$Grey_Grey_$Impl_$.__name__ = true;
thx_color__$Grey_Grey_$Impl_$.create = function(v) {
	return v < 0?0:v > 1?1:v;
};
thx_color__$Grey_Grey_$Impl_$.fromString = function(color) {
	var info = thx_color_parse_ColorParser.parseColor(color);
	if(null == info) return null;
	var tmp;
	try {
		var _g = info.name;
		switch(_g) {
		case "grey":case "gray":
			var grey = thx_color_parse_ColorParser.getFloatChannels(info.channels,1)[0];
			tmp = grey;
			break;
		default:
			tmp = null;
		}
	} catch( e ) {
		haxe_CallStack.lastException = e;
		if (e instanceof js__$Boot_HaxeError) e = e.val;
		tmp = null;
	}
	return tmp;
};
thx_color__$Grey_Grey_$Impl_$._new = function(grey) {
	return grey;
};
thx_color__$Grey_Grey_$Impl_$.contrast = function(this1) {
	return this1 > 0.5?thx_color__$Grey_Grey_$Impl_$.black:thx_color__$Grey_Grey_$Impl_$.white;
};
thx_color__$Grey_Grey_$Impl_$.darker = function(this1,t) {
	var tmp;
	var grey = thx_Floats.interpolate(t,this1,0);
	tmp = grey;
	return tmp;
};
thx_color__$Grey_Grey_$Impl_$.lighter = function(this1,t) {
	var tmp;
	var grey = thx_Floats.interpolate(t,this1,1);
	tmp = grey;
	return tmp;
};
thx_color__$Grey_Grey_$Impl_$.interpolate = function(this1,other,t) {
	var tmp;
	var grey = thx_Floats.interpolate(t,this1,other);
	tmp = grey;
	return tmp;
};
thx_color__$Grey_Grey_$Impl_$.toString = function(this1) {
	return "grey(" + this1 * 100 + "%)";
};
thx_color__$Grey_Grey_$Impl_$.equals = function(this1,other) {
	return Math.abs(this1 - other) <= 10e-10;
};
thx_color__$Grey_Grey_$Impl_$.get_grey = function(this1) {
	return this1;
};
thx_color__$Grey_Grey_$Impl_$.toCIELab = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toCIELab(thx_color__$Grey_Grey_$Impl_$.toRGBX(this1));
};
thx_color__$Grey_Grey_$Impl_$.toCIELCh = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toCIELCh(thx_color__$Grey_Grey_$Impl_$.toRGBX(this1));
};
thx_color__$Grey_Grey_$Impl_$.toCMY = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toCMY(thx_color__$Grey_Grey_$Impl_$.toRGBX(this1));
};
thx_color__$Grey_Grey_$Impl_$.toCMYK = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toCMYK(thx_color__$Grey_Grey_$Impl_$.toRGBX(this1));
};
thx_color__$Grey_Grey_$Impl_$.toHSL = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toHSL(thx_color__$Grey_Grey_$Impl_$.toRGBX(this1));
};
thx_color__$Grey_Grey_$Impl_$.toHSV = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toHSV(thx_color__$Grey_Grey_$Impl_$.toRGBX(this1));
};
thx_color__$Grey_Grey_$Impl_$.toRGB = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toRGB(thx_color__$Grey_Grey_$Impl_$.toRGBX(this1));
};
thx_color__$Grey_Grey_$Impl_$.toRGBA = function(this1) {
	return thx_color__$RGBXA_RGBXA_$Impl_$.toRGBA(thx_color__$Grey_Grey_$Impl_$.toRGBXA(this1));
};
thx_color__$Grey_Grey_$Impl_$.toRGBX = function(this1) {
	return [this1,this1,this1];
};
thx_color__$Grey_Grey_$Impl_$.toRGBXA = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toRGBXA(thx_color__$Grey_Grey_$Impl_$.toRGBX(this1));
};
thx_color__$Grey_Grey_$Impl_$.toXYZ = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toXYZ(thx_color__$Grey_Grey_$Impl_$.toRGBX(this1));
};
thx_color__$Grey_Grey_$Impl_$.toYxy = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toYxy(thx_color__$Grey_Grey_$Impl_$.toRGBX(this1));
};
var thx_color__$HSL_HSL_$Impl_$ = {};
thx_color__$HSL_HSL_$Impl_$.__name__ = true;
thx_color__$HSL_HSL_$Impl_$.create = function(hue,saturation,lightness) {
	var tmp;
	var channels = [thx_Floats.wrapCircular(hue,360),saturation < 0?0:saturation > 1?1:saturation,lightness < 0?0:lightness > 1?1:lightness];
	tmp = channels;
	return tmp;
};
thx_color__$HSL_HSL_$Impl_$.fromFloats = function(arr) {
	thx_ArrayFloats.resize(arr,3);
	return thx_color__$HSL_HSL_$Impl_$.create(arr[0],arr[1],arr[2]);
};
thx_color__$HSL_HSL_$Impl_$.fromString = function(color) {
	var info = thx_color_parse_ColorParser.parseColor(color);
	if(null == info) return null;
	var tmp;
	try {
		var _g = info.name;
		switch(_g) {
		case "hsl":
			var channels = thx_color_parse_ColorParser.getFloatChannels(info.channels,3);
			tmp = channels;
			break;
		default:
			tmp = null;
		}
	} catch( e ) {
		haxe_CallStack.lastException = e;
		if (e instanceof js__$Boot_HaxeError) e = e.val;
		tmp = null;
	}
	return tmp;
};
thx_color__$HSL_HSL_$Impl_$._new = function(channels) {
	return channels;
};
thx_color__$HSL_HSL_$Impl_$.analogous = function(this1,spread) {
	if(spread == null) spread = 30.0;
	var tmp;
	var _0 = thx_color__$HSL_HSL_$Impl_$.rotate(this1,-spread);
	var _1 = thx_color__$HSL_HSL_$Impl_$.rotate(this1,spread);
	tmp = { _0 : _0, _1 : _1};
	return tmp;
};
thx_color__$HSL_HSL_$Impl_$.complement = function(this1) {
	return thx_color__$HSL_HSL_$Impl_$.rotate(this1,180);
};
thx_color__$HSL_HSL_$Impl_$.darker = function(this1,t) {
	var tmp;
	var channels = [this1[0],this1[1],thx_Floats.interpolate(t,this1[2],0)];
	tmp = channels;
	return tmp;
};
thx_color__$HSL_HSL_$Impl_$.lighter = function(this1,t) {
	var tmp;
	var channels = [this1[0],this1[1],thx_Floats.interpolate(t,this1[2],1)];
	tmp = channels;
	return tmp;
};
thx_color__$HSL_HSL_$Impl_$.interpolate = function(this1,other,t) {
	var tmp;
	var channels = [thx_Floats.interpolateAngle(t,this1[0],other[0],360),thx_Floats.interpolate(t,this1[1],other[1]),thx_Floats.interpolate(t,this1[2],other[2])];
	tmp = channels;
	return tmp;
};
thx_color__$HSL_HSL_$Impl_$.rotate = function(this1,angle) {
	return thx_color__$HSL_HSL_$Impl_$.withHue(this1,this1[0] + angle);
};
thx_color__$HSL_HSL_$Impl_$.split = function(this1,spread) {
	if(spread == null) spread = 144.0;
	var tmp;
	var _0 = thx_color__$HSL_HSL_$Impl_$.rotate(this1,-spread);
	var _1 = thx_color__$HSL_HSL_$Impl_$.rotate(this1,spread);
	tmp = { _0 : _0, _1 : _1};
	return tmp;
};
thx_color__$HSL_HSL_$Impl_$.square = function(this1) {
	return thx_color__$HSL_HSL_$Impl_$.tetrad(this1,90);
};
thx_color__$HSL_HSL_$Impl_$.tetrad = function(this1,angle) {
	var tmp;
	var _0 = thx_color__$HSL_HSL_$Impl_$.rotate(this1,0);
	var _1 = thx_color__$HSL_HSL_$Impl_$.rotate(this1,angle);
	var _2 = thx_color__$HSL_HSL_$Impl_$.rotate(this1,180);
	var _3 = thx_color__$HSL_HSL_$Impl_$.rotate(this1,180 + angle);
	tmp = { _0 : _0, _1 : _1, _2 : _2, _3 : _3};
	return tmp;
};
thx_color__$HSL_HSL_$Impl_$.triad = function(this1) {
	var tmp;
	var _0 = thx_color__$HSL_HSL_$Impl_$.rotate(this1,-120);
	var _1 = thx_color__$HSL_HSL_$Impl_$.rotate(this1,0);
	var _2 = thx_color__$HSL_HSL_$Impl_$.rotate(this1,120);
	tmp = { _0 : _0, _1 : _1, _2 : _2};
	return tmp;
};
thx_color__$HSL_HSL_$Impl_$.withAlpha = function(this1,alpha) {
	var tmp;
	var channels = this1.concat([alpha < 0?0:alpha > 1?1:alpha]);
	tmp = channels;
	return tmp;
};
thx_color__$HSL_HSL_$Impl_$.withHue = function(this1,newhue) {
	var tmp;
	var channels = [thx_Floats.wrapCircular(newhue,360),this1[1],this1[2]];
	tmp = channels;
	return tmp;
};
thx_color__$HSL_HSL_$Impl_$.withLightness = function(this1,newlightness) {
	return [this1[0],this1[1],newlightness < 0?0:newlightness > 1?1:newlightness];
};
thx_color__$HSL_HSL_$Impl_$.withSaturation = function(this1,newsaturation) {
	return [this1[0],newsaturation < 0?0:newsaturation > 1?1:newsaturation,this1[2]];
};
thx_color__$HSL_HSL_$Impl_$.toCSS3 = function(this1) {
	return thx_color__$HSL_HSL_$Impl_$.toString(this1);
};
thx_color__$HSL_HSL_$Impl_$.toString = function(this1) {
	return "hsl(" + this1[0] + "," + this1[1] * 100 + "%," + this1[2] * 100 + "%)";
};
thx_color__$HSL_HSL_$Impl_$.equals = function(this1,other) {
	return Math.abs(this1[0] - other[0]) <= 10e-10 && Math.abs(this1[1] - other[1]) <= 10e-10 && Math.abs(this1[2] - other[2]) <= 10e-10;
};
thx_color__$HSL_HSL_$Impl_$.toCIELab = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toCIELab(thx_color__$HSL_HSL_$Impl_$.toRGBX(this1));
};
thx_color__$HSL_HSL_$Impl_$.toCIELCh = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toCIELCh(thx_color__$HSL_HSL_$Impl_$.toRGBX(this1));
};
thx_color__$HSL_HSL_$Impl_$.toCMY = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toCMY(thx_color__$HSL_HSL_$Impl_$.toRGBX(this1));
};
thx_color__$HSL_HSL_$Impl_$.toCMYK = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toCMYK(thx_color__$HSL_HSL_$Impl_$.toRGBX(this1));
};
thx_color__$HSL_HSL_$Impl_$.toGrey = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toGrey(thx_color__$HSL_HSL_$Impl_$.toRGBX(this1));
};
thx_color__$HSL_HSL_$Impl_$.toHSV = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toHSV(thx_color__$HSL_HSL_$Impl_$.toRGBX(this1));
};
thx_color__$HSL_HSL_$Impl_$.toRGB = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toRGB(thx_color__$HSL_HSL_$Impl_$.toRGBX(this1));
};
thx_color__$HSL_HSL_$Impl_$.toRGBA = function(this1) {
	return thx_color__$RGBXA_RGBXA_$Impl_$.toRGBA(thx_color__$HSL_HSL_$Impl_$.toRGBXA(this1));
};
thx_color__$HSL_HSL_$Impl_$.toRGBX = function(this1) {
	var tmp;
	var channels = [thx_color__$HSL_HSL_$Impl_$._c(this1[0] + 120,this1[1],this1[2]),thx_color__$HSL_HSL_$Impl_$._c(this1[0],this1[1],this1[2]),thx_color__$HSL_HSL_$Impl_$._c(this1[0] - 120,this1[1],this1[2])];
	tmp = channels;
	return tmp;
};
thx_color__$HSL_HSL_$Impl_$.toRGBXA = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toRGBXA(thx_color__$HSL_HSL_$Impl_$.toRGBX(this1));
};
thx_color__$HSL_HSL_$Impl_$.toHSLA = function(this1) {
	return thx_color__$HSL_HSL_$Impl_$.withAlpha(this1,1.0);
};
thx_color__$HSL_HSL_$Impl_$.toXYZ = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toXYZ(thx_color__$HSL_HSL_$Impl_$.toRGBX(this1));
};
thx_color__$HSL_HSL_$Impl_$.toYxy = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toYxy(thx_color__$HSL_HSL_$Impl_$.toRGBX(this1));
};
thx_color__$HSL_HSL_$Impl_$.get_hue = function(this1) {
	return this1[0];
};
thx_color__$HSL_HSL_$Impl_$.get_saturation = function(this1) {
	return this1[1];
};
thx_color__$HSL_HSL_$Impl_$.get_lightness = function(this1) {
	return this1[2];
};
thx_color__$HSL_HSL_$Impl_$._c = function(d,s,l) {
	var m2 = l <= 0.5?l * (1 + s):l + s - l * s;
	var m1 = 2 * l - m2;
	d = thx_Floats.wrapCircular(d,360);
	if(d < 60) return m1 + (m2 - m1) * d / 60; else if(d < 180) return m2; else if(d < 240) return m1 + (m2 - m1) * (240 - d) / 60; else return m1;
};
var thx_color__$HSLA_HSLA_$Impl_$ = {};
thx_color__$HSLA_HSLA_$Impl_$.__name__ = true;
thx_color__$HSLA_HSLA_$Impl_$.create = function(hue,saturation,lightness,alpha) {
	var tmp;
	var channels = [thx_Floats.wrapCircular(hue,360),saturation < 0?0:saturation > 1?1:saturation,lightness < 0?0:lightness > 1?1:lightness,alpha < 0?0:alpha > 1?1:alpha];
	tmp = channels;
	return tmp;
};
thx_color__$HSLA_HSLA_$Impl_$.fromFloats = function(arr) {
	thx_ArrayFloats.resize(arr,4);
	return thx_color__$HSLA_HSLA_$Impl_$.create(arr[0],arr[1],arr[2],arr[3]);
};
thx_color__$HSLA_HSLA_$Impl_$.fromString = function(color) {
	var info = thx_color_parse_ColorParser.parseColor(color);
	if(null == info) return null;
	var tmp;
	try {
		var _g = info.name;
		switch(_g) {
		case "hsl":
			var tmp1;
			var channels = thx_color_parse_ColorParser.getFloatChannels(info.channels,3);
			tmp1 = channels;
			tmp = thx_color__$HSL_HSL_$Impl_$.toHSLA(tmp1);
			break;
		case "hsla":
			var channels1 = thx_color_parse_ColorParser.getFloatChannels(info.channels,4);
			tmp = channels1;
			break;
		default:
			tmp = null;
		}
	} catch( e ) {
		haxe_CallStack.lastException = e;
		if (e instanceof js__$Boot_HaxeError) e = e.val;
		tmp = null;
	}
	return tmp;
};
thx_color__$HSLA_HSLA_$Impl_$._new = function(channels) {
	return channels;
};
thx_color__$HSLA_HSLA_$Impl_$.analogous = function(this1,spread) {
	if(spread == null) spread = 30.0;
	var tmp;
	var _0 = thx_color__$HSLA_HSLA_$Impl_$.rotate(this1,-spread);
	var _1 = thx_color__$HSLA_HSLA_$Impl_$.rotate(this1,spread);
	tmp = { _0 : _0, _1 : _1};
	return tmp;
};
thx_color__$HSLA_HSLA_$Impl_$.complement = function(this1) {
	return thx_color__$HSLA_HSLA_$Impl_$.rotate(this1,180);
};
thx_color__$HSLA_HSLA_$Impl_$.darker = function(this1,t) {
	var tmp;
	var channels = [this1[0],this1[1],thx_Floats.interpolate(t,this1[2],0),this1[3]];
	tmp = channels;
	return tmp;
};
thx_color__$HSLA_HSLA_$Impl_$.lighter = function(this1,t) {
	var tmp;
	var channels = [this1[0],this1[1],thx_Floats.interpolate(t,this1[2],1),this1[3]];
	tmp = channels;
	return tmp;
};
thx_color__$HSLA_HSLA_$Impl_$.transparent = function(this1,t) {
	var tmp;
	var channels = [this1[0],this1[1],this1[2],thx_Floats.interpolate(t,this1[3],0)];
	tmp = channels;
	return tmp;
};
thx_color__$HSLA_HSLA_$Impl_$.opaque = function(this1,t) {
	var tmp;
	var channels = [this1[0],this1[1],this1[2],thx_Floats.interpolate(t,this1[3],1)];
	tmp = channels;
	return tmp;
};
thx_color__$HSLA_HSLA_$Impl_$.interpolate = function(this1,other,t) {
	var tmp;
	var channels = [thx_Floats.interpolateAngle(t,this1[0],other[0]),thx_Floats.interpolate(t,this1[1],other[1]),thx_Floats.interpolate(t,this1[2],other[2]),thx_Floats.interpolate(t,this1[3],other[3])];
	tmp = channels;
	return tmp;
};
thx_color__$HSLA_HSLA_$Impl_$.rotate = function(this1,angle) {
	return thx_color__$HSLA_HSLA_$Impl_$.create(this1[0] + angle,this1[1],this1[2],this1[3]);
};
thx_color__$HSLA_HSLA_$Impl_$.split = function(this1,spread) {
	if(spread == null) spread = 150.0;
	var tmp;
	var _0 = thx_color__$HSLA_HSLA_$Impl_$.rotate(this1,-spread);
	var _1 = thx_color__$HSLA_HSLA_$Impl_$.rotate(this1,spread);
	tmp = { _0 : _0, _1 : _1};
	return tmp;
};
thx_color__$HSLA_HSLA_$Impl_$.withAlpha = function(this1,newalpha) {
	return [this1[0],this1[1],this1[2],newalpha < 0?0:newalpha > 1?1:newalpha];
};
thx_color__$HSLA_HSLA_$Impl_$.withHue = function(this1,newhue) {
	var tmp;
	var channels = [thx_Floats.wrapCircular(newhue,360),this1[1],this1[2],this1[3]];
	tmp = channels;
	return tmp;
};
thx_color__$HSLA_HSLA_$Impl_$.withLightness = function(this1,newlightness) {
	return [this1[0],this1[1],newlightness < 0?0:newlightness > 1?1:newlightness,this1[3]];
};
thx_color__$HSLA_HSLA_$Impl_$.withSaturation = function(this1,newsaturation) {
	return [this1[0],newsaturation < 0?0:newsaturation > 1?1:newsaturation,this1[2],this1[3]];
};
thx_color__$HSLA_HSLA_$Impl_$.toCSS3 = function(this1) {
	return thx_color__$HSLA_HSLA_$Impl_$.toString(this1);
};
thx_color__$HSLA_HSLA_$Impl_$.toString = function(this1) {
	return "hsla(" + this1[0] + "," + this1[1] * 100 + "%," + this1[2] * 100 + "%," + this1[3] + ")";
};
thx_color__$HSLA_HSLA_$Impl_$.equals = function(this1,other) {
	return Math.abs(this1[0] - other[0]) <= 10e-10 && Math.abs(this1[1] - other[1]) <= 10e-10 && Math.abs(this1[2] - other[2]) <= 10e-10 && Math.abs(this1[3] - other[3]) <= 10e-10;
};
thx_color__$HSLA_HSLA_$Impl_$.toHSL = function(this1) {
	var tmp;
	var channels = this1.slice(0,3);
	tmp = channels;
	return tmp;
};
thx_color__$HSLA_HSLA_$Impl_$.toHSVA = function(this1) {
	return thx_color__$RGBXA_RGBXA_$Impl_$.toHSVA(thx_color__$HSLA_HSLA_$Impl_$.toRGBXA(this1));
};
thx_color__$HSLA_HSLA_$Impl_$.toRGB = function(this1) {
	return thx_color__$RGBXA_RGBXA_$Impl_$.toRGB(thx_color__$HSLA_HSLA_$Impl_$.toRGBXA(this1));
};
thx_color__$HSLA_HSLA_$Impl_$.toRGBA = function(this1) {
	return thx_color__$RGBXA_RGBXA_$Impl_$.toRGBA(thx_color__$HSLA_HSLA_$Impl_$.toRGBXA(this1));
};
thx_color__$HSLA_HSLA_$Impl_$.toRGBXA = function(this1) {
	var tmp;
	var channels = [thx_color__$HSLA_HSLA_$Impl_$._c(this1[0] + 120,this1[1],this1[2]),thx_color__$HSLA_HSLA_$Impl_$._c(this1[0],this1[1],this1[2]),thx_color__$HSLA_HSLA_$Impl_$._c(this1[0] - 120,this1[1],this1[2]),this1[3]];
	tmp = channels;
	return tmp;
};
thx_color__$HSLA_HSLA_$Impl_$.get_hue = function(this1) {
	return this1[0];
};
thx_color__$HSLA_HSLA_$Impl_$.get_saturation = function(this1) {
	return this1[1];
};
thx_color__$HSLA_HSLA_$Impl_$.get_lightness = function(this1) {
	return this1[2];
};
thx_color__$HSLA_HSLA_$Impl_$.get_alpha = function(this1) {
	return this1[3];
};
thx_color__$HSLA_HSLA_$Impl_$._c = function(d,s,l) {
	var m2 = l <= 0.5?l * (1 + s):l + s - l * s;
	var m1 = 2 * l - m2;
	d = thx_Floats.wrapCircular(d,360);
	if(d < 60) return m1 + (m2 - m1) * d / 60; else if(d < 180) return m2; else if(d < 240) return m1 + (m2 - m1) * (240 - d) / 60; else return m1;
};
var thx_color__$HSV_HSV_$Impl_$ = {};
thx_color__$HSV_HSV_$Impl_$.__name__ = true;
thx_color__$HSV_HSV_$Impl_$.create = function(hue,saturation,lightness) {
	var tmp;
	var channels = [thx_Floats.wrapCircular(hue,360),saturation < 0?0:saturation > 1?1:saturation,lightness < 0?0:lightness > 1?1:lightness];
	tmp = channels;
	return tmp;
};
thx_color__$HSV_HSV_$Impl_$.fromFloats = function(arr) {
	thx_ArrayFloats.resize(arr,3);
	return thx_color__$HSV_HSV_$Impl_$.create(arr[0],arr[1],arr[2]);
};
thx_color__$HSV_HSV_$Impl_$.fromString = function(color) {
	var info = thx_color_parse_ColorParser.parseColor(color);
	if(null == info) return null;
	var tmp;
	try {
		var _g = info.name;
		switch(_g) {
		case "hsv":
			var channels = thx_color_parse_ColorParser.getFloatChannels(info.channels,3);
			tmp = channels;
			break;
		default:
			tmp = null;
		}
	} catch( e ) {
		haxe_CallStack.lastException = e;
		if (e instanceof js__$Boot_HaxeError) e = e.val;
		tmp = null;
	}
	return tmp;
};
thx_color__$HSV_HSV_$Impl_$._new = function(channels) {
	return channels;
};
thx_color__$HSV_HSV_$Impl_$.analogous = function(this1,spread) {
	if(spread == null) spread = 30.0;
	var tmp;
	var _0 = thx_color__$HSV_HSV_$Impl_$.rotate(this1,-spread);
	var _1 = thx_color__$HSV_HSV_$Impl_$.rotate(this1,spread);
	tmp = { _0 : _0, _1 : _1};
	return tmp;
};
thx_color__$HSV_HSV_$Impl_$.complement = function(this1) {
	return thx_color__$HSV_HSV_$Impl_$.rotate(this1,180);
};
thx_color__$HSV_HSV_$Impl_$.interpolate = function(this1,other,t) {
	var tmp;
	var channels = [thx_Floats.interpolateAngle(t,this1[0],other[0]),thx_Floats.interpolate(t,this1[1],other[1]),thx_Floats.interpolate(t,this1[2],other[2])];
	tmp = channels;
	return tmp;
};
thx_color__$HSV_HSV_$Impl_$.rotate = function(this1,angle) {
	return thx_color__$HSV_HSV_$Impl_$.withHue(this1,this1[0] + angle);
};
thx_color__$HSV_HSV_$Impl_$.split = function(this1,spread) {
	if(spread == null) spread = 144.0;
	var tmp;
	var _0 = thx_color__$HSV_HSV_$Impl_$.rotate(this1,-spread);
	var _1 = thx_color__$HSV_HSV_$Impl_$.rotate(this1,spread);
	tmp = { _0 : _0, _1 : _1};
	return tmp;
};
thx_color__$HSV_HSV_$Impl_$.square = function(this1) {
	return thx_color__$HSV_HSV_$Impl_$.tetrad(this1,90);
};
thx_color__$HSV_HSV_$Impl_$.tetrad = function(this1,angle) {
	var tmp;
	var _0 = thx_color__$HSV_HSV_$Impl_$.rotate(this1,0);
	var _1 = thx_color__$HSV_HSV_$Impl_$.rotate(this1,angle);
	var _2 = thx_color__$HSV_HSV_$Impl_$.rotate(this1,180);
	var _3 = thx_color__$HSV_HSV_$Impl_$.rotate(this1,180 + angle);
	tmp = { _0 : _0, _1 : _1, _2 : _2, _3 : _3};
	return tmp;
};
thx_color__$HSV_HSV_$Impl_$.triad = function(this1) {
	var tmp;
	var _0 = thx_color__$HSV_HSV_$Impl_$.rotate(this1,-120);
	var _1 = thx_color__$HSV_HSV_$Impl_$.rotate(this1,0);
	var _2 = thx_color__$HSV_HSV_$Impl_$.rotate(this1,120);
	tmp = { _0 : _0, _1 : _1, _2 : _2};
	return tmp;
};
thx_color__$HSV_HSV_$Impl_$.withAlpha = function(this1,alpha) {
	var tmp;
	var channels = this1.concat([alpha < 0?0:alpha > 1?1:alpha]);
	tmp = channels;
	return tmp;
};
thx_color__$HSV_HSV_$Impl_$.withHue = function(this1,newhue) {
	var tmp;
	var channels = [thx_Floats.wrapCircular(newhue,360),this1[1],this1[2]];
	tmp = channels;
	return tmp;
};
thx_color__$HSV_HSV_$Impl_$.withValue = function(this1,newvalue) {
	return [this1[0],this1[1],newvalue < 0?0:newvalue > 1?1:newvalue];
};
thx_color__$HSV_HSV_$Impl_$.withSaturation = function(this1,newsaturation) {
	return [this1[0],newsaturation < 0?0:newsaturation > 1?1:newsaturation,this1[2]];
};
thx_color__$HSV_HSV_$Impl_$.toString = function(this1) {
	return "hsv(" + this1[0] + "," + this1[1] * 100 + "%," + this1[2] * 100 + "%)";
};
thx_color__$HSV_HSV_$Impl_$.equals = function(this1,other) {
	return Math.abs(this1[0] - other[0]) <= 10e-10 && Math.abs(this1[1] - other[1]) <= 10e-10 && Math.abs(this1[2] - other[2]) <= 10e-10;
};
thx_color__$HSV_HSV_$Impl_$.toCIELab = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toCIELab(thx_color__$HSV_HSV_$Impl_$.toRGBX(this1));
};
thx_color__$HSV_HSV_$Impl_$.toCIELCh = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toCIELCh(thx_color__$HSV_HSV_$Impl_$.toRGBX(this1));
};
thx_color__$HSV_HSV_$Impl_$.toCMY = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toCMY(thx_color__$HSV_HSV_$Impl_$.toRGBX(this1));
};
thx_color__$HSV_HSV_$Impl_$.toCMYK = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toCMYK(thx_color__$HSV_HSV_$Impl_$.toRGBX(this1));
};
thx_color__$HSV_HSV_$Impl_$.toGrey = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toGrey(thx_color__$HSV_HSV_$Impl_$.toRGBX(this1));
};
thx_color__$HSV_HSV_$Impl_$.toHSL = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toHSL(thx_color__$HSV_HSV_$Impl_$.toRGBX(this1));
};
thx_color__$HSV_HSV_$Impl_$.toHSVA = function(this1) {
	return thx_color__$HSV_HSV_$Impl_$.withAlpha(this1,1.0);
};
thx_color__$HSV_HSV_$Impl_$.toRGB = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toRGB(thx_color__$HSV_HSV_$Impl_$.toRGBX(this1));
};
thx_color__$HSV_HSV_$Impl_$.toRGBA = function(this1) {
	return thx_color__$RGBXA_RGBXA_$Impl_$.toRGBA(thx_color__$HSV_HSV_$Impl_$.toRGBXA(this1));
};
thx_color__$HSV_HSV_$Impl_$.toRGBX = function(this1) {
	if(this1[1] == 0) return [this1[2],this1[2],this1[2]];
	var r;
	var g;
	var b;
	var i;
	var f;
	var p;
	var q;
	var t;
	var h = this1[0] / 60;
	i = Math.floor(h);
	f = h - i;
	p = this1[2] * (1 - this1[1]);
	q = this1[2] * (1 - f * this1[1]);
	t = this1[2] * (1 - (1 - f) * this1[1]);
	switch(i) {
	case 0:
		r = this1[2];
		g = t;
		b = p;
		break;
	case 1:
		r = q;
		g = this1[2];
		b = p;
		break;
	case 2:
		r = p;
		g = this1[2];
		b = t;
		break;
	case 3:
		r = p;
		g = q;
		b = this1[2];
		break;
	case 4:
		r = t;
		g = p;
		b = this1[2];
		break;
	default:
		r = this1[2];
		g = p;
		b = q;
	}
	return [r,g,b];
};
thx_color__$HSV_HSV_$Impl_$.toRGBXA = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toRGBXA(thx_color__$HSV_HSV_$Impl_$.toRGBX(this1));
};
thx_color__$HSV_HSV_$Impl_$.toXYZ = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toXYZ(thx_color__$HSV_HSV_$Impl_$.toRGBX(this1));
};
thx_color__$HSV_HSV_$Impl_$.toYxy = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toYxy(thx_color__$HSV_HSV_$Impl_$.toRGBX(this1));
};
thx_color__$HSV_HSV_$Impl_$.get_hue = function(this1) {
	return this1[0];
};
thx_color__$HSV_HSV_$Impl_$.get_saturation = function(this1) {
	return this1[1];
};
thx_color__$HSV_HSV_$Impl_$.get_value = function(this1) {
	return this1[2];
};
var thx_color__$HSVA_HSVA_$Impl_$ = {};
thx_color__$HSVA_HSVA_$Impl_$.__name__ = true;
thx_color__$HSVA_HSVA_$Impl_$.create = function(hue,saturation,value,alpha) {
	var tmp;
	var channels = [thx_Floats.wrapCircular(hue,360),saturation < 0?0:saturation > 1?1:saturation,value < 0?0:value > 1?1:value,alpha < 0?0:alpha > 1?1:alpha];
	tmp = channels;
	return tmp;
};
thx_color__$HSVA_HSVA_$Impl_$.fromFloats = function(arr) {
	thx_ArrayFloats.resize(arr,4);
	return thx_color__$HSVA_HSVA_$Impl_$.create(arr[0],arr[1],arr[2],arr[3]);
};
thx_color__$HSVA_HSVA_$Impl_$.fromString = function(color) {
	var info = thx_color_parse_ColorParser.parseColor(color);
	if(null == info) return null;
	var tmp;
	try {
		var _g = info.name;
		switch(_g) {
		case "hsv":
			var tmp1;
			var channels = thx_color_parse_ColorParser.getFloatChannels(info.channels,3);
			tmp1 = channels;
			tmp = thx_color__$HSV_HSV_$Impl_$.toHSVA(tmp1);
			break;
		case "hsva":
			var channels1 = thx_color_parse_ColorParser.getFloatChannels(info.channels,4);
			tmp = channels1;
			break;
		default:
			tmp = null;
		}
	} catch( e ) {
		haxe_CallStack.lastException = e;
		if (e instanceof js__$Boot_HaxeError) e = e.val;
		tmp = null;
	}
	return tmp;
};
thx_color__$HSVA_HSVA_$Impl_$._new = function(channels) {
	return channels;
};
thx_color__$HSVA_HSVA_$Impl_$.analogous = function(this1,spread) {
	if(spread == null) spread = 30.0;
	var tmp;
	var _0 = thx_color__$HSVA_HSVA_$Impl_$.rotate(this1,-spread);
	var _1 = thx_color__$HSVA_HSVA_$Impl_$.rotate(this1,spread);
	tmp = { _0 : _0, _1 : _1};
	return tmp;
};
thx_color__$HSVA_HSVA_$Impl_$.complement = function(this1) {
	return thx_color__$HSVA_HSVA_$Impl_$.rotate(this1,180);
};
thx_color__$HSVA_HSVA_$Impl_$.transparent = function(this1,t) {
	var tmp;
	var channels = [this1[0],this1[1],this1[2],thx_Floats.interpolate(t,this1[3],0)];
	tmp = channels;
	return tmp;
};
thx_color__$HSVA_HSVA_$Impl_$.opaque = function(this1,t) {
	var tmp;
	var channels = [this1[0],this1[1],this1[2],thx_Floats.interpolate(t,this1[3],1)];
	tmp = channels;
	return tmp;
};
thx_color__$HSVA_HSVA_$Impl_$.interpolate = function(this1,other,t) {
	var tmp;
	var channels = [thx_Floats.interpolateAngle(t,this1[0],other[0]),thx_Floats.interpolate(t,this1[1],other[1]),thx_Floats.interpolate(t,this1[2],other[2]),thx_Floats.interpolate(t,this1[3],other[3])];
	tmp = channels;
	return tmp;
};
thx_color__$HSVA_HSVA_$Impl_$.rotate = function(this1,angle) {
	return thx_color__$HSVA_HSVA_$Impl_$.create(this1[0] + angle,this1[1],this1[2],this1[3]);
};
thx_color__$HSVA_HSVA_$Impl_$.split = function(this1,spread) {
	if(spread == null) spread = 150.0;
	var tmp;
	var _0 = thx_color__$HSVA_HSVA_$Impl_$.rotate(this1,-spread);
	var _1 = thx_color__$HSVA_HSVA_$Impl_$.rotate(this1,spread);
	tmp = { _0 : _0, _1 : _1};
	return tmp;
};
thx_color__$HSVA_HSVA_$Impl_$.withAlpha = function(this1,newalpha) {
	return [this1[0],this1[1],this1[2],newalpha < 0?0:newalpha > 1?1:newalpha];
};
thx_color__$HSVA_HSVA_$Impl_$.withHue = function(this1,newhue) {
	var tmp;
	var channels = [thx_Floats.wrapCircular(newhue,360),this1[1],this1[2],this1[3]];
	tmp = channels;
	return tmp;
};
thx_color__$HSVA_HSVA_$Impl_$.withLightness = function(this1,newvalue) {
	return [this1[0],this1[1],newvalue < 0?0:newvalue > 1?1:newvalue,this1[3]];
};
thx_color__$HSVA_HSVA_$Impl_$.withSaturation = function(this1,newsaturation) {
	return [this1[0],newsaturation < 0?0:newsaturation > 1?1:newsaturation,this1[2],this1[3]];
};
thx_color__$HSVA_HSVA_$Impl_$.toString = function(this1) {
	return "hsva(" + this1[0] + "," + this1[1] * 100 + "%," + this1[2] * 100 + "%," + this1[3] + ")";
};
thx_color__$HSVA_HSVA_$Impl_$.equals = function(this1,other) {
	return Math.abs(this1[0] - other[0]) <= 10e-10 && Math.abs(this1[1] - other[1]) <= 10e-10 && Math.abs(this1[2] - other[2]) <= 10e-10 && Math.abs(this1[3] - other[3]) <= 10e-10;
};
thx_color__$HSVA_HSVA_$Impl_$.toHSV = function(this1) {
	var tmp;
	var channels = this1.slice(0,3);
	tmp = channels;
	return tmp;
};
thx_color__$HSVA_HSVA_$Impl_$.toHSLA = function(this1) {
	return thx_color__$RGBXA_RGBXA_$Impl_$.toHSLA(thx_color__$HSVA_HSVA_$Impl_$.toRGBXA(this1));
};
thx_color__$HSVA_HSVA_$Impl_$.toRGB = function(this1) {
	return thx_color__$RGBXA_RGBXA_$Impl_$.toRGB(thx_color__$HSVA_HSVA_$Impl_$.toRGBXA(this1));
};
thx_color__$HSVA_HSVA_$Impl_$.toRGBA = function(this1) {
	return thx_color__$RGBXA_RGBXA_$Impl_$.toRGBA(thx_color__$HSVA_HSVA_$Impl_$.toRGBXA(this1));
};
thx_color__$HSVA_HSVA_$Impl_$.toRGBXA = function(this1) {
	if(this1[1] == 0) return [this1[2],this1[2],this1[2],this1[3]];
	var r;
	var g;
	var b;
	var i;
	var f;
	var p;
	var q;
	var t;
	var h = this1[0] / 60;
	i = Math.floor(h);
	f = h - i;
	p = this1[2] * (1 - this1[1]);
	q = this1[2] * (1 - f * this1[1]);
	t = this1[2] * (1 - (1 - f) * this1[1]);
	switch(i) {
	case 0:
		r = this1[2];
		g = t;
		b = p;
		break;
	case 1:
		r = q;
		g = this1[2];
		b = p;
		break;
	case 2:
		r = p;
		g = this1[2];
		b = t;
		break;
	case 3:
		r = p;
		g = q;
		b = this1[2];
		break;
	case 4:
		r = t;
		g = p;
		b = this1[2];
		break;
	default:
		r = this1[2];
		g = p;
		b = q;
	}
	return [r,g,b,this1[3]];
};
thx_color__$HSVA_HSVA_$Impl_$.get_hue = function(this1) {
	return this1[0];
};
thx_color__$HSVA_HSVA_$Impl_$.get_saturation = function(this1) {
	return this1[1];
};
thx_color__$HSVA_HSVA_$Impl_$.get_value = function(this1) {
	return this1[2];
};
thx_color__$HSVA_HSVA_$Impl_$.get_alpha = function(this1) {
	return this1[3];
};
var thx_color__$RGB_RGB_$Impl_$ = {};
thx_color__$RGB_RGB_$Impl_$.__name__ = true;
thx_color__$RGB_RGB_$Impl_$.create = function(red,green,blue) {
	return (red & 255) << 16 | (green & 255) << 8 | blue & 255;
};
thx_color__$RGB_RGB_$Impl_$.createf = function(red,green,blue) {
	return thx_color__$RGB_RGB_$Impl_$.create(Math.round(red * 255),Math.round(green * 255),Math.round(blue * 255));
};
thx_color__$RGB_RGB_$Impl_$.fromString = function(color) {
	var info = thx_color_parse_ColorParser.parseHex(color);
	if(null == info) info = thx_color_parse_ColorParser.parseColor(color);
	if(null == info) return null;
	var tmp;
	try {
		var _g = info.name;
		switch(_g) {
		case "rgb":
			tmp = thx_color__$RGB_RGB_$Impl_$.fromInts(thx_color_parse_ColorParser.getInt8Channels(info.channels,3));
			break;
		default:
			tmp = null;
		}
	} catch( e ) {
		haxe_CallStack.lastException = e;
		if (e instanceof js__$Boot_HaxeError) e = e.val;
		tmp = null;
	}
	return tmp;
};
thx_color__$RGB_RGB_$Impl_$.fromInts = function(arr) {
	thx_ArrayInts.resize(arr,3);
	return thx_color__$RGB_RGB_$Impl_$.create(arr[0],arr[1],arr[2]);
};
thx_color__$RGB_RGB_$Impl_$._new = function(rgb) {
	return rgb;
};
thx_color__$RGB_RGB_$Impl_$.darker = function(this1,t) {
	return thx_color__$RGBX_RGBX_$Impl_$.toRGB(thx_color__$RGBX_RGBX_$Impl_$.darker(thx_color__$RGB_RGB_$Impl_$.toRGBX(this1),t));
};
thx_color__$RGB_RGB_$Impl_$.lighter = function(this1,t) {
	return thx_color__$RGBX_RGBX_$Impl_$.toRGB(thx_color__$RGBX_RGBX_$Impl_$.lighter(thx_color__$RGB_RGB_$Impl_$.toRGBX(this1),t));
};
thx_color__$RGB_RGB_$Impl_$.interpolate = function(this1,other,t) {
	return thx_color__$RGBX_RGBX_$Impl_$.toRGB(thx_color__$RGBX_RGBX_$Impl_$.interpolate(thx_color__$RGB_RGB_$Impl_$.toRGBX(this1),thx_color__$RGB_RGB_$Impl_$.toRGBX(other),t));
};
thx_color__$RGB_RGB_$Impl_$.withAlpha = function(this1,alpha) {
	return thx_color__$RGBA_RGBA_$Impl_$.fromInts([thx_color__$RGB_RGB_$Impl_$.get_red(this1),thx_color__$RGB_RGB_$Impl_$.get_green(this1),thx_color__$RGB_RGB_$Impl_$.get_blue(this1),alpha]);
};
thx_color__$RGB_RGB_$Impl_$.withRed = function(this1,newred) {
	return thx_color__$RGB_RGB_$Impl_$.fromInts([newred,thx_color__$RGB_RGB_$Impl_$.get_green(this1),thx_color__$RGB_RGB_$Impl_$.get_blue(this1)]);
};
thx_color__$RGB_RGB_$Impl_$.withGreen = function(this1,newgreen) {
	return thx_color__$RGB_RGB_$Impl_$.fromInts([thx_color__$RGB_RGB_$Impl_$.get_red(this1),newgreen,thx_color__$RGB_RGB_$Impl_$.get_blue(this1)]);
};
thx_color__$RGB_RGB_$Impl_$.withBlue = function(this1,newblue) {
	return thx_color__$RGB_RGB_$Impl_$.fromInts([thx_color__$RGB_RGB_$Impl_$.get_red(this1),thx_color__$RGB_RGB_$Impl_$.get_green(this1),newblue]);
};
thx_color__$RGB_RGB_$Impl_$.toCSS3 = function(this1) {
	return "rgb(" + thx_color__$RGB_RGB_$Impl_$.get_red(this1) + "," + thx_color__$RGB_RGB_$Impl_$.get_green(this1) + "," + thx_color__$RGB_RGB_$Impl_$.get_blue(this1) + ")";
};
thx_color__$RGB_RGB_$Impl_$.toString = function(this1) {
	return thx_color__$RGB_RGB_$Impl_$.toHex(this1);
};
thx_color__$RGB_RGB_$Impl_$.toHex = function(this1,prefix) {
	if(prefix == null) prefix = "#";
	return "" + prefix + StringTools.hex(thx_color__$RGB_RGB_$Impl_$.get_red(this1),2) + StringTools.hex(thx_color__$RGB_RGB_$Impl_$.get_green(this1),2) + StringTools.hex(thx_color__$RGB_RGB_$Impl_$.get_blue(this1),2);
};
thx_color__$RGB_RGB_$Impl_$.equals = function(this1,other) {
	return thx_color__$RGB_RGB_$Impl_$.get_red(this1) == thx_color__$RGB_RGB_$Impl_$.get_red(other) && thx_color__$RGB_RGB_$Impl_$.get_green(this1) == thx_color__$RGB_RGB_$Impl_$.get_green(other) && thx_color__$RGB_RGB_$Impl_$.get_blue(this1) == thx_color__$RGB_RGB_$Impl_$.get_blue(other);
};
thx_color__$RGB_RGB_$Impl_$.toCIELab = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toCIELab(thx_color__$RGB_RGB_$Impl_$.toRGBX(this1));
};
thx_color__$RGB_RGB_$Impl_$.toCIELCh = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toCIELCh(thx_color__$RGB_RGB_$Impl_$.toRGBX(this1));
};
thx_color__$RGB_RGB_$Impl_$.toCMY = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toCMY(thx_color__$RGB_RGB_$Impl_$.toRGBX(this1));
};
thx_color__$RGB_RGB_$Impl_$.toCMYK = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toCMYK(thx_color__$RGB_RGB_$Impl_$.toRGBX(this1));
};
thx_color__$RGB_RGB_$Impl_$.toGrey = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toGrey(thx_color__$RGB_RGB_$Impl_$.toRGBX(this1));
};
thx_color__$RGB_RGB_$Impl_$.toHSL = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toHSL(thx_color__$RGB_RGB_$Impl_$.toRGBX(this1));
};
thx_color__$RGB_RGB_$Impl_$.toHSV = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toHSV(thx_color__$RGB_RGB_$Impl_$.toRGBX(this1));
};
thx_color__$RGB_RGB_$Impl_$.toRGBX = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.fromInts([thx_color__$RGB_RGB_$Impl_$.get_red(this1),thx_color__$RGB_RGB_$Impl_$.get_green(this1),thx_color__$RGB_RGB_$Impl_$.get_blue(this1)]);
};
thx_color__$RGB_RGB_$Impl_$.toRGBA = function(this1) {
	return thx_color__$RGB_RGB_$Impl_$.withAlpha(this1,255);
};
thx_color__$RGB_RGB_$Impl_$.toRGBXA = function(this1) {
	return thx_color__$RGBA_RGBA_$Impl_$.toRGBXA(thx_color__$RGB_RGB_$Impl_$.toRGBA(this1));
};
thx_color__$RGB_RGB_$Impl_$.toYxy = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toYxy(thx_color__$RGB_RGB_$Impl_$.toRGBX(this1));
};
thx_color__$RGB_RGB_$Impl_$.toXYZ = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toXYZ(thx_color__$RGB_RGB_$Impl_$.toRGBX(this1));
};
thx_color__$RGB_RGB_$Impl_$.get_red = function(this1) {
	return this1 >> 16 & 255;
};
thx_color__$RGB_RGB_$Impl_$.get_green = function(this1) {
	return this1 >> 8 & 255;
};
thx_color__$RGB_RGB_$Impl_$.get_blue = function(this1) {
	return this1 & 255;
};
var thx_color__$RGBA_RGBA_$Impl_$ = {};
thx_color__$RGBA_RGBA_$Impl_$.__name__ = true;
thx_color__$RGBA_RGBA_$Impl_$.create = function(red,green,blue,alpha) {
	return (red & 255) << 24 | (green & 255) << 16 | (blue & 255) << 8 | alpha & 255;
};
thx_color__$RGBA_RGBA_$Impl_$.fromFloats = function(arr) {
	var ints = thx_ArrayFloats.resize(arr,4).map(function(_) {
		return Math.round(_ * 255);
	});
	return thx_color__$RGBA_RGBA_$Impl_$.create(ints[0],ints[1],ints[2],ints[3]);
};
thx_color__$RGBA_RGBA_$Impl_$.fromInt = function(rgba) {
	return rgba;
};
thx_color__$RGBA_RGBA_$Impl_$.fromInts = function(arr) {
	thx_ArrayInts.resize(arr,4);
	return thx_color__$RGBA_RGBA_$Impl_$.create(arr[0],arr[1],arr[2],arr[3]);
};
thx_color__$RGBA_RGBA_$Impl_$.fromString = function(color) {
	var info = thx_color_parse_ColorParser.parseHex(color);
	if(null == info) info = thx_color_parse_ColorParser.parseColor(color);
	if(null == info) return null;
	var tmp;
	try {
		var _g = info.name;
		switch(_g) {
		case "rgb":
			tmp = thx_color__$RGB_RGB_$Impl_$.toRGBA(thx_color__$RGB_RGB_$Impl_$.fromInts(thx_color_parse_ColorParser.getInt8Channels(info.channels,3)));
			break;
		case "rgba":
			tmp = thx_color__$RGBA_RGBA_$Impl_$.create(thx_color_parse_ColorParser.getInt8Channel(info.channels[0]),thx_color_parse_ColorParser.getInt8Channel(info.channels[1]),thx_color_parse_ColorParser.getInt8Channel(info.channels[2]),Math.round(thx_color_parse_ColorParser.getFloatChannel(info.channels[3]) * 255));
			break;
		default:
			tmp = null;
		}
	} catch( e ) {
		haxe_CallStack.lastException = e;
		if (e instanceof js__$Boot_HaxeError) e = e.val;
		tmp = null;
	}
	return tmp;
};
thx_color__$RGBA_RGBA_$Impl_$._new = function(rgba) {
	return rgba;
};
thx_color__$RGBA_RGBA_$Impl_$.darker = function(this1,t) {
	return thx_color__$RGBXA_RGBXA_$Impl_$.toRGBA(thx_color__$RGBXA_RGBXA_$Impl_$.darker(thx_color__$RGBA_RGBA_$Impl_$.toRGBXA(this1),t));
};
thx_color__$RGBA_RGBA_$Impl_$.lighter = function(this1,t) {
	return thx_color__$RGBXA_RGBXA_$Impl_$.toRGBA(thx_color__$RGBXA_RGBXA_$Impl_$.lighter(thx_color__$RGBA_RGBA_$Impl_$.toRGBXA(this1),t));
};
thx_color__$RGBA_RGBA_$Impl_$.transparent = function(this1,t) {
	return thx_color__$RGBXA_RGBXA_$Impl_$.toRGBA(thx_color__$RGBXA_RGBXA_$Impl_$.transparent(thx_color__$RGBA_RGBA_$Impl_$.toRGBXA(this1),t));
};
thx_color__$RGBA_RGBA_$Impl_$.opaque = function(this1,t) {
	return thx_color__$RGBXA_RGBXA_$Impl_$.toRGBA(thx_color__$RGBXA_RGBXA_$Impl_$.opaque(thx_color__$RGBA_RGBA_$Impl_$.toRGBXA(this1),t));
};
thx_color__$RGBA_RGBA_$Impl_$.interpolate = function(this1,other,t) {
	return thx_color__$RGBXA_RGBXA_$Impl_$.toRGBA(thx_color__$RGBXA_RGBXA_$Impl_$.interpolate(thx_color__$RGBA_RGBA_$Impl_$.toRGBXA(this1),thx_color__$RGBA_RGBA_$Impl_$.toRGBXA(other),t));
};
thx_color__$RGBA_RGBA_$Impl_$.withAlpha = function(this1,newalpha) {
	return thx_color__$RGBA_RGBA_$Impl_$.fromInts([this1 >> 24 & 255,this1 >> 16 & 255,this1 >> 8 & 255,newalpha]);
};
thx_color__$RGBA_RGBA_$Impl_$.withRed = function(this1,newred) {
	return thx_color__$RGBA_RGBA_$Impl_$.fromInts([newred,this1 >> 16 & 255,this1 >> 8 & 255]);
};
thx_color__$RGBA_RGBA_$Impl_$.withGreen = function(this1,newgreen) {
	return thx_color__$RGBA_RGBA_$Impl_$.fromInts([this1 >> 24 & 255,newgreen,this1 >> 8 & 255]);
};
thx_color__$RGBA_RGBA_$Impl_$.withBlue = function(this1,newblue) {
	return thx_color__$RGBA_RGBA_$Impl_$.fromInts([this1 >> 24 & 255,this1 >> 16 & 255,newblue]);
};
thx_color__$RGBA_RGBA_$Impl_$.toHSLA = function(this1) {
	return thx_color__$RGBXA_RGBXA_$Impl_$.toHSLA(thx_color__$RGBA_RGBA_$Impl_$.toRGBXA(this1));
};
thx_color__$RGBA_RGBA_$Impl_$.toHSVA = function(this1) {
	return thx_color__$RGBXA_RGBXA_$Impl_$.toHSVA(thx_color__$RGBA_RGBA_$Impl_$.toRGBXA(this1));
};
thx_color__$RGBA_RGBA_$Impl_$.toRGB = function(this1) {
	return thx_color__$RGB_RGB_$Impl_$.create(this1 >> 24 & 255,this1 >> 16 & 255,this1 >> 8 & 255);
};
thx_color__$RGBA_RGBA_$Impl_$.toRGBX = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.fromInts([this1 >> 24 & 255,this1 >> 16 & 255,this1 >> 8 & 255]);
};
thx_color__$RGBA_RGBA_$Impl_$.toRGBXA = function(this1) {
	return thx_color__$RGBXA_RGBXA_$Impl_$.fromInts([this1 >> 24 & 255,this1 >> 16 & 255,this1 >> 8 & 255,this1 & 255]);
};
thx_color__$RGBA_RGBA_$Impl_$.toCSS3 = function(this1) {
	return thx_color__$RGBA_RGBA_$Impl_$.toString(this1);
};
thx_color__$RGBA_RGBA_$Impl_$.toString = function(this1) {
	return "rgba(" + (this1 >> 24 & 255) + "," + (this1 >> 16 & 255) + "," + (this1 >> 8 & 255) + "," + (this1 & 255) / 255 + ")";
};
thx_color__$RGBA_RGBA_$Impl_$.toHex = function(this1,prefix) {
	if(prefix == null) prefix = "#";
	return "" + prefix + StringTools.hex(this1 & 255,2) + StringTools.hex(this1 >> 24 & 255,2) + StringTools.hex(this1 >> 16 & 255,2) + StringTools.hex(this1 >> 8 & 255,2);
};
thx_color__$RGBA_RGBA_$Impl_$.equals = function(this1,other) {
	return (this1 >> 24 & 255) == (other >> 24 & 255) && (this1 & 255) == (other & 255) && (this1 >> 16 & 255) == (other >> 16 & 255) && (this1 >> 8 & 255) == (other >> 8 & 255);
};
thx_color__$RGBA_RGBA_$Impl_$.get_alpha = function(this1) {
	return this1 & 255;
};
thx_color__$RGBA_RGBA_$Impl_$.get_red = function(this1) {
	return this1 >> 24 & 255;
};
thx_color__$RGBA_RGBA_$Impl_$.get_green = function(this1) {
	return this1 >> 16 & 255;
};
thx_color__$RGBA_RGBA_$Impl_$.get_blue = function(this1) {
	return this1 >> 8 & 255;
};
var thx_color__$RGBX_RGBX_$Impl_$ = {};
thx_color__$RGBX_RGBX_$Impl_$.__name__ = true;
thx_color__$RGBX_RGBX_$Impl_$.create = function(red,green,blue) {
	return [red < 0?0:red > 1?1:red,green < 0?0:green > 1?1:green,blue < 0?0:blue > 1?1:blue];
};
thx_color__$RGBX_RGBX_$Impl_$.fromFloats = function(arr) {
	thx_ArrayFloats.resize(arr,3);
	return thx_color__$RGBX_RGBX_$Impl_$.create(arr[0],arr[1],arr[2]);
};
thx_color__$RGBX_RGBX_$Impl_$.fromInts = function(arr) {
	thx_ArrayInts.resize(arr,3);
	return thx_color__$RGBX_RGBX_$Impl_$.create(arr[0] / 255,arr[1] / 255,arr[2] / 255);
};
thx_color__$RGBX_RGBX_$Impl_$.fromString = function(color) {
	var info = thx_color_parse_ColorParser.parseHex(color);
	if(null == info) info = thx_color_parse_ColorParser.parseColor(color);
	if(null == info) return null;
	var tmp;
	try {
		var _g = info.name;
		switch(_g) {
		case "rgb":
			tmp = thx_color__$RGBX_RGBX_$Impl_$.fromFloats(thx_color_parse_ColorParser.getFloatChannels(info.channels,3));
			break;
		default:
			tmp = null;
		}
	} catch( e ) {
		haxe_CallStack.lastException = e;
		if (e instanceof js__$Boot_HaxeError) e = e.val;
		tmp = null;
	}
	return tmp;
};
thx_color__$RGBX_RGBX_$Impl_$._new = function(channels) {
	return channels;
};
thx_color__$RGBX_RGBX_$Impl_$.darker = function(this1,t) {
	var tmp;
	var channels = [thx_Floats.interpolate(t,this1[0],0),thx_Floats.interpolate(t,this1[1],0),thx_Floats.interpolate(t,this1[2],0)];
	tmp = channels;
	return tmp;
};
thx_color__$RGBX_RGBX_$Impl_$.lighter = function(this1,t) {
	var tmp;
	var channels = [thx_Floats.interpolate(t,this1[0],1),thx_Floats.interpolate(t,this1[1],1),thx_Floats.interpolate(t,this1[2],1)];
	tmp = channels;
	return tmp;
};
thx_color__$RGBX_RGBX_$Impl_$.interpolate = function(this1,other,t) {
	var tmp;
	var channels = [thx_Floats.interpolate(t,this1[0],other[0]),thx_Floats.interpolate(t,this1[1],other[1]),thx_Floats.interpolate(t,this1[2],other[2])];
	tmp = channels;
	return tmp;
};
thx_color__$RGBX_RGBX_$Impl_$.toCSS3 = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toString(this1);
};
thx_color__$RGBX_RGBX_$Impl_$.toString = function(this1) {
	return "rgb(" + this1[0] * 100 + "%," + this1[1] * 100 + "%," + this1[2] * 100 + "%)";
};
thx_color__$RGBX_RGBX_$Impl_$.toHex = function(this1,prefix) {
	if(prefix == null) prefix = "#";
	return "" + prefix + StringTools.hex(thx_color__$RGBX_RGBX_$Impl_$.get_red(this1),2) + StringTools.hex(thx_color__$RGBX_RGBX_$Impl_$.get_green(this1),2) + StringTools.hex(thx_color__$RGBX_RGBX_$Impl_$.get_blue(this1),2);
};
thx_color__$RGBX_RGBX_$Impl_$.equals = function(this1,other) {
	return Math.abs(this1[0] - other[0]) <= 10e-10 && Math.abs(this1[1] - other[1]) <= 10e-10 && Math.abs(this1[2] - other[2]) <= 10e-10;
};
thx_color__$RGBX_RGBX_$Impl_$.withAlpha = function(this1,alpha) {
	var tmp;
	var channels = this1.concat([alpha < 0?0:alpha > 1?1:alpha]);
	tmp = channels;
	return tmp;
};
thx_color__$RGBX_RGBX_$Impl_$.withRed = function(this1,newred) {
	var tmp;
	var channels = [newred < 0?0:newred > 1?1:newred,thx_color__$RGBX_RGBX_$Impl_$.get_green(this1),thx_color__$RGBX_RGBX_$Impl_$.get_blue(this1)];
	tmp = channels;
	return tmp;
};
thx_color__$RGBX_RGBX_$Impl_$.withGreen = function(this1,newgreen) {
	var tmp;
	var channels = [thx_color__$RGBX_RGBX_$Impl_$.get_red(this1),newgreen < 0?0:newgreen > 1?1:newgreen,thx_color__$RGBX_RGBX_$Impl_$.get_blue(this1)];
	tmp = channels;
	return tmp;
};
thx_color__$RGBX_RGBX_$Impl_$.withBlue = function(this1,newblue) {
	var tmp;
	var channels = [thx_color__$RGBX_RGBX_$Impl_$.get_red(this1),thx_color__$RGBX_RGBX_$Impl_$.get_green(this1),newblue < 0?0:newblue > 1?1:newblue];
	tmp = channels;
	return tmp;
};
thx_color__$RGBX_RGBX_$Impl_$.toCIELab = function(this1) {
	return thx_color__$XYZ_XYZ_$Impl_$.toCIELab(thx_color__$RGBX_RGBX_$Impl_$.toXYZ(this1));
};
thx_color__$RGBX_RGBX_$Impl_$.toCIELCh = function(this1) {
	return thx_color__$CIELab_CIELab_$Impl_$.toCIELCh(thx_color__$RGBX_RGBX_$Impl_$.toCIELab(this1));
};
thx_color__$RGBX_RGBX_$Impl_$.toCMY = function(this1) {
	return [1 - this1[0],1 - this1[1],1 - this1[2]];
};
thx_color__$RGBX_RGBX_$Impl_$.toCMYK = function(this1) {
	var c = 0.0;
	var y = 0.0;
	var m = 0.0;
	var k;
	if(this1[0] + this1[1] + this1[2] == 0) k = 1.0; else {
		k = 1 - Math.max(Math.max(this1[0],this1[1]),this1[2]);
		c = (1 - this1[0] - k) / (1 - k);
		m = (1 - this1[1] - k) / (1 - k);
		y = (1 - this1[2] - k) / (1 - k);
	}
	return [c,m,y,k];
};
thx_color__$RGBX_RGBX_$Impl_$.toGrey = function(this1) {
	return this1[0] * .2126 + this1[1] * .7152 + this1[2] * .0722;
};
thx_color__$RGBX_RGBX_$Impl_$.toPerceivedGrey = function(this1) {
	return this1[0] * .299 + this1[1] * .587 + this1[2] * .114;
};
thx_color__$RGBX_RGBX_$Impl_$.toPerceivedAccurateGrey = function(this1) {
	var tmp;
	var grey = Math.pow(this1[0],2) * .241 + Math.pow(this1[1],2) * .691 + Math.pow(this1[2],2) * .068;
	tmp = grey;
	return tmp;
};
thx_color__$RGBX_RGBX_$Impl_$.toHSL = function(this1) {
	var min = Math.min(Math.min(this1[0],this1[1]),this1[2]);
	var max = Math.max(Math.max(this1[0],this1[1]),this1[2]);
	var delta = max - min;
	var h;
	var s;
	var l = (max + min) / 2;
	if(delta == 0.0) s = h = 0.0; else {
		s = l < 0.5?delta / (max + min):delta / (2 - max - min);
		if(this1[0] == max) h = (this1[1] - this1[2]) / delta + (this1[1] < thx_color__$RGBX_RGBX_$Impl_$.get_blue(this1)?6:0); else if(this1[1] == max) h = (this1[2] - this1[0]) / delta + 2; else h = (this1[0] - this1[1]) / delta + 4;
		h *= 60;
	}
	return [h,s,l];
};
thx_color__$RGBX_RGBX_$Impl_$.toHSV = function(this1) {
	var min = Math.min(Math.min(this1[0],this1[1]),this1[2]);
	var max = Math.max(Math.max(this1[0],this1[1]),this1[2]);
	var delta = max - min;
	var h;
	var s;
	if(delta != 0) s = delta / max; else {
		s = 0;
		h = -1;
		return [h,s,max];
	}
	if(this1[0] == max) h = (this1[1] - this1[2]) / delta; else if(this1[1] == max) h = 2 + (this1[2] - this1[0]) / delta; else h = 4 + (this1[0] - this1[1]) / delta;
	h *= 60;
	if(h < 0) h += 360;
	return [h,s,max];
};
thx_color__$RGBX_RGBX_$Impl_$.toRGB = function(this1) {
	return thx_color__$RGB_RGB_$Impl_$.createf(this1[0],this1[1],this1[2]);
};
thx_color__$RGBX_RGBX_$Impl_$.toRGBXA = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.withAlpha(this1,1.0);
};
thx_color__$RGBX_RGBX_$Impl_$.toXYZ = function(this1) {
	var r = this1[0];
	var g = this1[1];
	var b = this1[2];
	r = 100 * (r > 0.04045?Math.pow((r + 0.055) / 1.055,2.4):r / 12.92);
	g = 100 * (g > 0.04045?Math.pow((g + 0.055) / 1.055,2.4):g / 12.92);
	b = 100 * (b > 0.04045?Math.pow((b + 0.055) / 1.055,2.4):b / 12.92);
	return [r * 0.4124 + g * 0.3576 + b * 0.1805,r * 0.2126 + g * 0.7152 + b * 0.0722,r * 0.0193 + g * 0.1192 + b * 0.9505];
};
thx_color__$RGBX_RGBX_$Impl_$.toYxy = function(this1) {
	return thx_color__$XYZ_XYZ_$Impl_$.toYxy(thx_color__$RGBX_RGBX_$Impl_$.toXYZ(this1));
};
thx_color__$RGBX_RGBX_$Impl_$.get_red = function(this1) {
	return Math.round(this1[0] * 255);
};
thx_color__$RGBX_RGBX_$Impl_$.get_green = function(this1) {
	return Math.round(this1[1] * 255);
};
thx_color__$RGBX_RGBX_$Impl_$.get_blue = function(this1) {
	return Math.round(this1[2] * 255);
};
thx_color__$RGBX_RGBX_$Impl_$.get_redf = function(this1) {
	return this1[0];
};
thx_color__$RGBX_RGBX_$Impl_$.get_greenf = function(this1) {
	return this1[1];
};
thx_color__$RGBX_RGBX_$Impl_$.get_bluef = function(this1) {
	return this1[2];
};
var thx_color__$RGBXA_RGBXA_$Impl_$ = {};
thx_color__$RGBXA_RGBXA_$Impl_$.__name__ = true;
thx_color__$RGBXA_RGBXA_$Impl_$.create = function(red,green,blue,alpha) {
	return [red < 0?0:red > 1?1:red,green < 0?0:green > 1?1:green,blue < 0?0:blue > 1?1:blue,alpha < 0?0:alpha > 1?1:alpha];
};
thx_color__$RGBXA_RGBXA_$Impl_$.fromFloats = function(arr) {
	thx_ArrayFloats.resize(arr,4);
	return thx_color__$RGBXA_RGBXA_$Impl_$.create(arr[0],arr[1],arr[2],arr[3]);
};
thx_color__$RGBXA_RGBXA_$Impl_$.fromInts = function(arr) {
	thx_ArrayInts.resize(arr,4);
	return thx_color__$RGBXA_RGBXA_$Impl_$.create(arr[0] / 255,arr[1] / 255,arr[2] / 255,arr[3] / 255);
};
thx_color__$RGBXA_RGBXA_$Impl_$.fromString = function(color) {
	var info = thx_color_parse_ColorParser.parseHex(color);
	if(null == info) info = thx_color_parse_ColorParser.parseColor(color);
	if(null == info) return null;
	var tmp;
	try {
		var _g = info.name;
		switch(_g) {
		case "rgb":
			tmp = thx_color__$RGBX_RGBX_$Impl_$.toRGBXA(thx_color__$RGBX_RGBX_$Impl_$.fromFloats(thx_color_parse_ColorParser.getFloatChannels(info.channels,3)));
			break;
		case "rgba":
			tmp = thx_color__$RGBXA_RGBXA_$Impl_$.fromFloats(thx_color_parse_ColorParser.getFloatChannels(info.channels,4));
			break;
		default:
			tmp = null;
		}
	} catch( e ) {
		haxe_CallStack.lastException = e;
		if (e instanceof js__$Boot_HaxeError) e = e.val;
		tmp = null;
	}
	return tmp;
};
thx_color__$RGBXA_RGBXA_$Impl_$._new = function(channels) {
	return channels;
};
thx_color__$RGBXA_RGBXA_$Impl_$.darker = function(this1,t) {
	return thx_color__$RGBX_RGBX_$Impl_$.withAlpha(thx_color__$RGBX_RGBX_$Impl_$.darker(thx_color__$RGBXA_RGBXA_$Impl_$.toRGBX(this1),t),thx_color__$RGBXA_RGBXA_$Impl_$.get_alpha(this1));
};
thx_color__$RGBXA_RGBXA_$Impl_$.lighter = function(this1,t) {
	return thx_color__$RGBX_RGBX_$Impl_$.withAlpha(thx_color__$RGBX_RGBX_$Impl_$.lighter(thx_color__$RGBXA_RGBXA_$Impl_$.toRGBX(this1),t),thx_color__$RGBXA_RGBXA_$Impl_$.get_alpha(this1));
};
thx_color__$RGBXA_RGBXA_$Impl_$.transparent = function(this1,t) {
	var tmp;
	var channels = [this1[0],this1[1],this1[2],thx_Ints.interpolate(t,this1[3],0)];
	tmp = channels;
	return tmp;
};
thx_color__$RGBXA_RGBXA_$Impl_$.opaque = function(this1,t) {
	var tmp;
	var channels = [this1[0],this1[1],this1[2],thx_Ints.interpolate(t,this1[3],1)];
	tmp = channels;
	return tmp;
};
thx_color__$RGBXA_RGBXA_$Impl_$.interpolate = function(this1,other,t) {
	var tmp;
	var channels = [thx_Ints.interpolate(t,this1[0],other[0]),thx_Ints.interpolate(t,this1[1],other[1]),thx_Ints.interpolate(t,this1[2],other[2]),thx_Ints.interpolate(t,this1[3],other[3])];
	tmp = channels;
	return tmp;
};
thx_color__$RGBXA_RGBXA_$Impl_$.withAlpha = function(this1,newalpha) {
	var tmp;
	var channels = [thx_color__$RGBXA_RGBXA_$Impl_$.get_red(this1),thx_color__$RGBXA_RGBXA_$Impl_$.get_green(this1),thx_color__$RGBXA_RGBXA_$Impl_$.get_blue(this1),newalpha < 0?0:newalpha > 1?1:newalpha];
	tmp = channels;
	return tmp;
};
thx_color__$RGBXA_RGBXA_$Impl_$.withRed = function(this1,newred) {
	var tmp;
	var channels = [newred < 0?0:newred > 1?1:newred,thx_color__$RGBXA_RGBXA_$Impl_$.get_green(this1),thx_color__$RGBXA_RGBXA_$Impl_$.get_blue(this1),thx_color__$RGBXA_RGBXA_$Impl_$.get_alpha(this1)];
	tmp = channels;
	return tmp;
};
thx_color__$RGBXA_RGBXA_$Impl_$.withGreen = function(this1,newgreen) {
	var tmp;
	var channels = [thx_color__$RGBXA_RGBXA_$Impl_$.get_red(this1),newgreen < 0?0:newgreen > 1?1:newgreen,thx_color__$RGBXA_RGBXA_$Impl_$.get_blue(this1),thx_color__$RGBXA_RGBXA_$Impl_$.get_alpha(this1)];
	tmp = channels;
	return tmp;
};
thx_color__$RGBXA_RGBXA_$Impl_$.withBlue = function(this1,newblue) {
	var tmp;
	var channels = [thx_color__$RGBXA_RGBXA_$Impl_$.get_red(this1),thx_color__$RGBXA_RGBXA_$Impl_$.get_green(this1),newblue < 0?0:newblue > 1?1:newblue,thx_color__$RGBXA_RGBXA_$Impl_$.get_alpha(this1)];
	tmp = channels;
	return tmp;
};
thx_color__$RGBXA_RGBXA_$Impl_$.toCSS3 = function(this1) {
	return thx_color__$RGBXA_RGBXA_$Impl_$.toString(this1);
};
thx_color__$RGBXA_RGBXA_$Impl_$.toString = function(this1) {
	return "rgba(" + this1[0] * 100 + "%," + this1[1] * 100 + "%," + this1[2] * 100 + "%," + this1[3] + ")";
};
thx_color__$RGBXA_RGBXA_$Impl_$.toHex = function(this1,prefix) {
	if(prefix == null) prefix = "#";
	return "" + prefix + StringTools.hex(thx_color__$RGBXA_RGBXA_$Impl_$.get_alpha(this1),2) + StringTools.hex(thx_color__$RGBXA_RGBXA_$Impl_$.get_red(this1),2) + StringTools.hex(thx_color__$RGBXA_RGBXA_$Impl_$.get_green(this1),2) + StringTools.hex(thx_color__$RGBXA_RGBXA_$Impl_$.get_blue(this1),2);
};
thx_color__$RGBXA_RGBXA_$Impl_$.equals = function(this1,other) {
	return Math.abs(this1[0] - other[0]) <= 10e-10 && Math.abs(this1[1] - other[1]) <= 10e-10 && Math.abs(this1[2] - other[2]) <= 10e-10 && Math.abs(this1[3] - other[3]) <= 10e-10;
};
thx_color__$RGBXA_RGBXA_$Impl_$.toHSLA = function(this1) {
	return thx_color__$HSL_HSL_$Impl_$.withAlpha(thx_color__$RGBX_RGBX_$Impl_$.toHSL(thx_color__$RGBXA_RGBXA_$Impl_$.toRGBX(this1)),thx_color__$RGBXA_RGBXA_$Impl_$.get_alpha(this1));
};
thx_color__$RGBXA_RGBXA_$Impl_$.toHSVA = function(this1) {
	return thx_color__$HSV_HSV_$Impl_$.withAlpha(thx_color__$RGBX_RGBX_$Impl_$.toHSV(thx_color__$RGBXA_RGBXA_$Impl_$.toRGBX(this1)),thx_color__$RGBXA_RGBXA_$Impl_$.get_alpha(this1));
};
thx_color__$RGBXA_RGBXA_$Impl_$.toRGB = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toRGB(thx_color__$RGBXA_RGBXA_$Impl_$.toRGBX(this1));
};
thx_color__$RGBXA_RGBXA_$Impl_$.toRGBX = function(this1) {
	var tmp;
	var channels = this1.slice(0,3);
	tmp = channels;
	return tmp;
};
thx_color__$RGBXA_RGBXA_$Impl_$.toRGBA = function(this1) {
	return thx_color__$RGBA_RGBA_$Impl_$.fromFloats([this1[0],this1[1],this1[2],this1[3]]);
};
thx_color__$RGBXA_RGBXA_$Impl_$.get_red = function(this1) {
	return Math.round(this1[0] * 255);
};
thx_color__$RGBXA_RGBXA_$Impl_$.get_green = function(this1) {
	return Math.round(this1[1] * 255);
};
thx_color__$RGBXA_RGBXA_$Impl_$.get_blue = function(this1) {
	return Math.round(this1[2] * 255);
};
thx_color__$RGBXA_RGBXA_$Impl_$.get_alpha = function(this1) {
	return Math.round(this1[3] * 255);
};
thx_color__$RGBXA_RGBXA_$Impl_$.get_redf = function(this1) {
	return this1[0];
};
thx_color__$RGBXA_RGBXA_$Impl_$.get_greenf = function(this1) {
	return this1[1];
};
thx_color__$RGBXA_RGBXA_$Impl_$.get_bluef = function(this1) {
	return this1[2];
};
thx_color__$RGBXA_RGBXA_$Impl_$.get_alphaf = function(this1) {
	return this1[3];
};
var thx_color__$XYZ_XYZ_$Impl_$ = {};
thx_color__$XYZ_XYZ_$Impl_$.__name__ = true;
thx_color__$XYZ_XYZ_$Impl_$.create = function(x,y,z) {
	return [x,y,z];
};
thx_color__$XYZ_XYZ_$Impl_$.fromFloats = function(arr) {
	thx_ArrayFloats.resize(arr,3);
	return thx_color__$XYZ_XYZ_$Impl_$.create(arr[0],arr[1],arr[2]);
};
thx_color__$XYZ_XYZ_$Impl_$.fromString = function(color) {
	var info = thx_color_parse_ColorParser.parseColor(color);
	if(null == info) return null;
	var tmp;
	try {
		var _g = info.name;
		switch(_g) {
		case "ciexyz":case "xyz":
			var channels = thx_color_parse_ColorParser.getFloatChannels(info.channels,3);
			tmp = channels;
			break;
		default:
			tmp = null;
		}
	} catch( e ) {
		haxe_CallStack.lastException = e;
		if (e instanceof js__$Boot_HaxeError) e = e.val;
		tmp = null;
	}
	return tmp;
};
thx_color__$XYZ_XYZ_$Impl_$._new = function(channels) {
	return channels;
};
thx_color__$XYZ_XYZ_$Impl_$.interpolate = function(this1,other,t) {
	var tmp;
	var channels = [thx_Floats.interpolate(t,this1[0],other[0]),thx_Floats.interpolate(t,this1[1],other[1]),thx_Floats.interpolate(t,this1[2],other[2])];
	tmp = channels;
	return tmp;
};
thx_color__$XYZ_XYZ_$Impl_$.withX = function(this1,newx) {
	return [newx,this1[1],this1[2]];
};
thx_color__$XYZ_XYZ_$Impl_$.withY = function(this1,newy) {
	return [this1[0],newy,this1[2]];
};
thx_color__$XYZ_XYZ_$Impl_$.withZ = function(this1,newz) {
	return [this1[0],this1[1],newz];
};
thx_color__$XYZ_XYZ_$Impl_$.toString = function(this1) {
	return "XYZ(" + this1[0] + "," + this1[1] + "," + this1[2] + ")";
};
thx_color__$XYZ_XYZ_$Impl_$.equals = function(this1,other) {
	return Math.abs(this1[0] - other[0]) <= 10e-10 && Math.abs(this1[1] - other[1]) <= 10e-10 && Math.abs(this1[2] - other[2]) <= 10e-10;
};
thx_color__$XYZ_XYZ_$Impl_$.toCIELab = function(this1) {
	var x = this1[0] * 0.0105211106;
	var y = this1[1] * 0.01;
	var z = this1[2] * 0.00918417016;
	x = x > 0.008856?Math.pow(x,0.333333333333333315):7.787 * x + 0.137931034482758619;
	y = y > 0.008856?Math.pow(y,0.333333333333333315):7.787 * y + 0.137931034482758619;
	z = z > 0.008856?Math.pow(z,0.333333333333333315):7.787 * z + 0.137931034482758619;
	return y > 0.008856?[116 * y - 16,500 * (x - y),200 * (y - z)]:[903.3 * y,500 * (x - y),200 * (y - z)];
};
thx_color__$XYZ_XYZ_$Impl_$.toCIELCh = function(this1) {
	return thx_color__$CIELab_CIELab_$Impl_$.toCIELCh(thx_color__$XYZ_XYZ_$Impl_$.toCIELab(this1));
};
thx_color__$XYZ_XYZ_$Impl_$.toCMY = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toCMY(thx_color__$XYZ_XYZ_$Impl_$.toRGBX(this1));
};
thx_color__$XYZ_XYZ_$Impl_$.toCMYK = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toCMYK(thx_color__$XYZ_XYZ_$Impl_$.toRGBX(this1));
};
thx_color__$XYZ_XYZ_$Impl_$.toGrey = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toGrey(thx_color__$XYZ_XYZ_$Impl_$.toRGBX(this1));
};
thx_color__$XYZ_XYZ_$Impl_$.toHSL = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toHSL(thx_color__$XYZ_XYZ_$Impl_$.toRGBX(this1));
};
thx_color__$XYZ_XYZ_$Impl_$.toHSV = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toHSV(thx_color__$XYZ_XYZ_$Impl_$.toRGBX(this1));
};
thx_color__$XYZ_XYZ_$Impl_$.toRGB = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toRGB(thx_color__$XYZ_XYZ_$Impl_$.toRGBX(this1));
};
thx_color__$XYZ_XYZ_$Impl_$.toRGBA = function(this1) {
	return thx_color__$RGBXA_RGBXA_$Impl_$.toRGBA(thx_color__$XYZ_XYZ_$Impl_$.toRGBXA(this1));
};
thx_color__$XYZ_XYZ_$Impl_$.toRGBX = function(this1) {
	var x = this1[0] / 100;
	var y = this1[1] / 100;
	var z = this1[2] / 100;
	var r = x * 3.2406 + y * -1.5372 + z * -0.4986;
	var g = x * -0.9689 + y * 1.8758 + z * 0.0415;
	var b = x * 0.0557 + y * -0.204 + z * 1.0570;
	r = r > 0.0031308?1.055 * Math.pow(r,0.416666666666666685) - 0.055:12.92 * r;
	g = g > 0.0031308?1.055 * Math.pow(g,0.416666666666666685) - 0.055:12.92 * g;
	b = b > 0.0031308?1.055 * Math.pow(b,0.416666666666666685) - 0.055:12.92 * b;
	return [r,g,b];
};
thx_color__$XYZ_XYZ_$Impl_$.toRGBXA = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toRGBXA(thx_color__$XYZ_XYZ_$Impl_$.toRGBX(this1));
};
thx_color__$XYZ_XYZ_$Impl_$.toYxy = function(this1) {
	var sum = this1[0] + this1[1] + this1[2];
	return [this1[1],sum == 0?1:this1[0] / sum,sum == 0?1:this1[1] / sum];
};
thx_color__$XYZ_XYZ_$Impl_$.get_x = function(this1) {
	return this1[0];
};
thx_color__$XYZ_XYZ_$Impl_$.get_y = function(this1) {
	return this1[1];
};
thx_color__$XYZ_XYZ_$Impl_$.get_z = function(this1) {
	return this1[2];
};
var thx_color__$Yxy_Yxy_$Impl_$ = {};
thx_color__$Yxy_Yxy_$Impl_$.__name__ = true;
thx_color__$Yxy_Yxy_$Impl_$.create = function(y1,x,y2) {
	return [y1,x,y2];
};
thx_color__$Yxy_Yxy_$Impl_$.fromFloats = function(arr) {
	thx_ArrayFloats.resize(arr,3);
	return thx_color__$Yxy_Yxy_$Impl_$.create(arr[0],arr[1],arr[2]);
};
thx_color__$Yxy_Yxy_$Impl_$.fromString = function(color) {
	var info = thx_color_parse_ColorParser.parseColor(color);
	if(null == info) return null;
	var tmp;
	try {
		var _g = info.name;
		switch(_g) {
		case "yxy":
			var channels = thx_color_parse_ColorParser.getFloatChannels(info.channels,3);
			tmp = channels;
			break;
		default:
			tmp = null;
		}
	} catch( e ) {
		haxe_CallStack.lastException = e;
		if (e instanceof js__$Boot_HaxeError) e = e.val;
		tmp = null;
	}
	return tmp;
};
thx_color__$Yxy_Yxy_$Impl_$._new = function(channels) {
	return channels;
};
thx_color__$Yxy_Yxy_$Impl_$.interpolate = function(this1,other,t) {
	var tmp;
	var channels = [thx_Floats.interpolate(t,this1[0],other[0]),thx_Floats.interpolate(t,this1[1],other[1]),thx_Floats.interpolate(t,this1[2],other[2])];
	tmp = channels;
	return tmp;
};
thx_color__$Yxy_Yxy_$Impl_$.withY1 = function(this1,newy1) {
	return [newy1,this1[1],this1[2]];
};
thx_color__$Yxy_Yxy_$Impl_$.withY = function(this1,newx) {
	return [this1[0],this1[1],this1[2]];
};
thx_color__$Yxy_Yxy_$Impl_$.withZ = function(this1,newy2) {
	return [this1[0],this1[1],this1[2]];
};
thx_color__$Yxy_Yxy_$Impl_$.toString = function(this1) {
	return "Yxy(" + this1[0] + "," + this1[1] + "," + this1[2] + ")";
};
thx_color__$Yxy_Yxy_$Impl_$.equals = function(this1,other) {
	return Math.abs(this1[0] - other[0]) <= 10e-10 && Math.abs(this1[1] - other[1]) <= 10e-10 && Math.abs(this1[2] - other[2]) <= 10e-10;
};
thx_color__$Yxy_Yxy_$Impl_$.toCIELab = function(this1) {
	return thx_color__$XYZ_XYZ_$Impl_$.toCIELab(thx_color__$Yxy_Yxy_$Impl_$.toXYZ(this1));
};
thx_color__$Yxy_Yxy_$Impl_$.toCIELCh = function(this1) {
	return thx_color__$CIELab_CIELab_$Impl_$.toCIELCh(thx_color__$Yxy_Yxy_$Impl_$.toCIELab(this1));
};
thx_color__$Yxy_Yxy_$Impl_$.toCMY = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toCMY(thx_color__$Yxy_Yxy_$Impl_$.toRGBX(this1));
};
thx_color__$Yxy_Yxy_$Impl_$.toCMYK = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toCMYK(thx_color__$Yxy_Yxy_$Impl_$.toRGBX(this1));
};
thx_color__$Yxy_Yxy_$Impl_$.toGrey = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toGrey(thx_color__$Yxy_Yxy_$Impl_$.toRGBX(this1));
};
thx_color__$Yxy_Yxy_$Impl_$.toHSL = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toHSL(thx_color__$Yxy_Yxy_$Impl_$.toRGBX(this1));
};
thx_color__$Yxy_Yxy_$Impl_$.toHSV = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toHSV(thx_color__$Yxy_Yxy_$Impl_$.toRGBX(this1));
};
thx_color__$Yxy_Yxy_$Impl_$.toRGB = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toRGB(thx_color__$Yxy_Yxy_$Impl_$.toRGBX(this1));
};
thx_color__$Yxy_Yxy_$Impl_$.toRGBA = function(this1) {
	return thx_color__$RGBXA_RGBXA_$Impl_$.toRGBA(thx_color__$Yxy_Yxy_$Impl_$.toRGBXA(this1));
};
thx_color__$Yxy_Yxy_$Impl_$.toRGBX = function(this1) {
	return thx_color__$XYZ_XYZ_$Impl_$.toRGBX(thx_color__$Yxy_Yxy_$Impl_$.toXYZ(this1));
};
thx_color__$Yxy_Yxy_$Impl_$.toRGBXA = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toRGBXA(thx_color__$Yxy_Yxy_$Impl_$.toRGBX(this1));
};
thx_color__$Yxy_Yxy_$Impl_$.toXYZ = function(this1) {
	return [this1[1] * (this1[0] / this1[2]),this1[0],(1 - this1[1] - this1[2]) * (this1[0] / this1[2])];
};
thx_color__$Yxy_Yxy_$Impl_$.get_y1 = function(this1) {
	return this1[0];
};
thx_color__$Yxy_Yxy_$Impl_$.get_x = function(this1) {
	return this1[1];
};
thx_color__$Yxy_Yxy_$Impl_$.get_y2 = function(this1) {
	return this1[2];
};
var thx_color_parse_ColorParser = function() {
	this.pattern_color = new EReg("^\\s*([^(]+)\\s*\\(([^)]*)\\)\\s*$","i");
	this.pattern_channel = new EReg("^\\s*(\\d*.\\d+|\\d+)(%|deg|rad)?\\s*$","i");
};
thx_color_parse_ColorParser.__name__ = true;
thx_color_parse_ColorParser.parseColor = function(s) {
	return thx_color_parse_ColorParser.parser.processColor(s);
};
thx_color_parse_ColorParser.parseHex = function(s) {
	return thx_color_parse_ColorParser.parser.processHex(s);
};
thx_color_parse_ColorParser.parseChannel = function(s) {
	return thx_color_parse_ColorParser.parser.processChannel(s);
};
thx_color_parse_ColorParser.getFloatChannels = function(channels,length,useInt8) {
	if(useInt8 == null) useInt8 = true;
	if(length != channels.length) throw new js__$Boot_HaxeError("invalid number of channels, expected " + length + " but it is " + channels.length);
	var tmp;
	var a2 = useInt8;
	tmp = function(a1) {
		return thx_color_parse_ColorParser.getFloatChannel(a1,a2);
	};
	return channels.map(tmp);
};
thx_color_parse_ColorParser.getInt8Channels = function(channels,length) {
	if(length != channels.length) throw new js__$Boot_HaxeError("invalid number of channels, expected " + length + " but it is " + channels.length);
	return channels.map(thx_color_parse_ColorParser.getInt8Channel);
};
thx_color_parse_ColorParser.getFloatChannel = function(channel,useInt8) {
	if(useInt8 == null) useInt8 = true;
	var tmp;
	switch(channel[1]) {
	case 5:
		if(channel[2]) tmp = 1; else tmp = 0;
		break;
	case 1:
		tmp = channel[2];
		break;
	case 4:
		tmp = channel[2];
		break;
	case 2:
		tmp = channel[2];
		break;
	case 3:
		if(useInt8) tmp = channel[2] / 255; else tmp = channel[2];
		break;
	case 0:
		tmp = channel[2] / 100;
		break;
	}
	return tmp;
};
thx_color_parse_ColorParser.getInt8Channel = function(channel) {
	var tmp;
	switch(channel[1]) {
	case 5:
		if(channel[2]) tmp = 1; else tmp = 0;
		break;
	case 3:
		tmp = channel[2];
		break;
	case 0:
		tmp = Math.round(255 * channel[2] / 100);
		break;
	default:
		throw new js__$Boot_HaxeError("unable to extract a valid int8 value");
	}
	return tmp;
};
thx_color_parse_ColorParser.prototype = {
	processHex: function(s) {
		if(!thx_color_parse_ColorParser.isPureHex.match(s)) {
			if(HxOverrides.substr(s,0,1) == "#") {
				if(s.length == 4) s = s.charAt(1) + s.charAt(1) + s.charAt(2) + s.charAt(2) + s.charAt(3) + s.charAt(3); else if(s.length == 5) s = s.charAt(1) + s.charAt(1) + s.charAt(2) + s.charAt(2) + s.charAt(3) + s.charAt(3) + s.charAt(4) + s.charAt(4); else s = HxOverrides.substr(s,1,null);
			} else if(HxOverrides.substr(s,0,2) == "0x") s = HxOverrides.substr(s,2,null); else return null;
		}
		var channels = [];
		while(s.length > 0) {
			channels.push(thx_color_parse_ChannelInfo.CIInt8(Std.parseInt("0x" + HxOverrides.substr(s,0,2))));
			s = HxOverrides.substr(s,2,null);
		}
		if(channels.length == 4) return new thx_color_parse_ColorInfo("rgba",channels.slice(1).concat([channels[0]])); else return new thx_color_parse_ColorInfo("rgb",channels);
	}
	,processColor: function(s) {
		if(!this.pattern_color.match(s)) return null;
		var name = this.pattern_color.matched(1);
		if(null == name) return null;
		name = name.toLowerCase();
		var m2 = this.pattern_color.matched(2);
		var s_channels = null == m2?[]:m2.split(",");
		var channels = [];
		var channel;
		var _g = 0;
		while(_g < s_channels.length) {
			var s_channel = s_channels[_g];
			++_g;
			channel = this.processChannel(s_channel);
			if(null == channel) return null;
			channels.push(channel);
		}
		return new thx_color_parse_ColorInfo(name,channels);
	}
	,processChannel: function(s) {
		if(!this.pattern_channel.match(s)) return null;
		var value = this.pattern_channel.matched(1);
		var unit = this.pattern_channel.matched(2);
		if(unit == null) unit = "";
		var tmp;
		try {
			switch(unit) {
			case "%":
				if(thx_Floats.canParse(value)) tmp = thx_color_parse_ChannelInfo.CIPercent(thx_Floats.parse(value)); else tmp = null;
				break;
			case "deg":
				if(thx_Floats.canParse(value)) tmp = thx_color_parse_ChannelInfo.CIDegree(thx_Floats.parse(value)); else tmp = null;
				break;
			case "DEG":
				if(thx_Floats.canParse(value)) tmp = thx_color_parse_ChannelInfo.CIDegree(thx_Floats.parse(value)); else tmp = null;
				break;
			case "rad":
				if(thx_Floats.canParse(value)) tmp = thx_color_parse_ChannelInfo.CIDegree(thx_Floats.parse(value) * 180 / Math.PI); else tmp = null;
				break;
			case "RAD":
				if(thx_Floats.canParse(value)) tmp = thx_color_parse_ChannelInfo.CIDegree(thx_Floats.parse(value) * 180 / Math.PI); else tmp = null;
				break;
			case "":
				if(thx_Ints.canParse(value)) {
					var i = thx_Ints.parse(value);
					if(i == 0) tmp = thx_color_parse_ChannelInfo.CIBool(false); else if(i == 1) tmp = thx_color_parse_ChannelInfo.CIBool(true); else if(i < 256) tmp = thx_color_parse_ChannelInfo.CIInt8(i); else tmp = thx_color_parse_ChannelInfo.CIInt(i);
				} else if(thx_Floats.canParse(value)) tmp = thx_color_parse_ChannelInfo.CIFloat(thx_Floats.parse(value)); else tmp = null;
				break;
			default:
				tmp = null;
			}
		} catch( e ) {
			haxe_CallStack.lastException = e;
			if (e instanceof js__$Boot_HaxeError) e = e.val;
			return null;
		}
		return tmp;
	}
	,__class__: thx_color_parse_ColorParser
};
var thx_color_parse_ColorInfo = function(name,channels) {
	this.name = name;
	this.channels = channels;
};
thx_color_parse_ColorInfo.__name__ = true;
thx_color_parse_ColorInfo.prototype = {
	toString: function() {
		return "" + this.name + ", channels: " + Std.string(this.channels);
	}
	,__class__: thx_color_parse_ColorInfo
};
var thx_color_parse_ChannelInfo = { __ename__ : true, __constructs__ : ["CIPercent","CIFloat","CIDegree","CIInt8","CIInt","CIBool"] };
thx_color_parse_ChannelInfo.CIPercent = function(value) { var $x = ["CIPercent",0,value]; $x.__enum__ = thx_color_parse_ChannelInfo; return $x; };
thx_color_parse_ChannelInfo.CIFloat = function(value) { var $x = ["CIFloat",1,value]; $x.__enum__ = thx_color_parse_ChannelInfo; return $x; };
thx_color_parse_ChannelInfo.CIDegree = function(value) { var $x = ["CIDegree",2,value]; $x.__enum__ = thx_color_parse_ChannelInfo; return $x; };
thx_color_parse_ChannelInfo.CIInt8 = function(value) { var $x = ["CIInt8",3,value]; $x.__enum__ = thx_color_parse_ChannelInfo; return $x; };
thx_color_parse_ChannelInfo.CIInt = function(value) { var $x = ["CIInt",4,value]; $x.__enum__ = thx_color_parse_ChannelInfo; return $x; };
thx_color_parse_ChannelInfo.CIBool = function(value) { var $x = ["CIBool",5,value]; $x.__enum__ = thx_color_parse_ChannelInfo; return $x; };
var thx_error_ErrorWrapper = function(message,innerError,stack,pos) {
	thx_Error.call(this,message,stack,pos);
	this.innerError = innerError;
};
thx_error_ErrorWrapper.__name__ = true;
thx_error_ErrorWrapper.__super__ = thx_Error;
thx_error_ErrorWrapper.prototype = $extend(thx_Error.prototype,{
	__class__: thx_error_ErrorWrapper
});
var thx_error_NullArgument = function(message,posInfo) {
	thx_Error.call(this,message,null,posInfo);
};
thx_error_NullArgument.__name__ = true;
thx_error_NullArgument.__super__ = thx_Error;
thx_error_NullArgument.prototype = $extend(thx_Error.prototype,{
	__class__: thx_error_NullArgument
});
var util_CharacterController = function(input,body) {
	this.jumping = false;
	this.jumpUnit = new glaze_geom_Vector2();
	this.controlForce = new glaze_geom_Vector2();
	this.input = input;
	this.body = body;
};
util_CharacterController.__name__ = true;
util_CharacterController.prototype = {
	update: function() {
		var _this = this.controlForce;
		_this.x = .0;
		_this.y = .0;
		var tmp;
		var _this1 = this.input;
		var duration = _this1.keyMap[65];
		if(duration > 0) tmp = _this1.frameRef - duration; else tmp = -1;
		var left = tmp;
		var tmp1;
		var _this2 = this.input;
		var duration1 = _this2.keyMap[68];
		if(duration1 > 0) tmp1 = _this2.frameRef - duration1; else tmp1 = -1;
		var right = tmp1;
		var tmp2;
		var _this3 = this.input;
		tmp2 = _this3.keyMap[87] == _this3.frameRef - 1;
		var up = tmp2;
		var tmp3;
		var _this4 = this.input;
		var duration2 = _this4.keyMap[87];
		if(duration2 > 0) tmp3 = _this4.frameRef - duration2; else tmp3 = -1;
		var upDuration = tmp3;
		var _this5 = this.input;
		var duration3 = _this5.keyMap[83];
		if(duration3 > 0) _this5.frameRef - duration3; else -1;
		if(!this.jumping && this.body.onGround && up) {
			this.jumping = true;
			this.controlForce.y -= 200.;
		}
		if(this.jumping && this.input.keyMap[87] == 0 || this.body.lastNormal.y > 0) this.jumping = false;
		this.body.onGround && !this.body.onGroundPrev;
		if(this.body.onGround) {
			if(left > 0) this.controlForce.x -= 20;
			if(right > 0) this.controlForce.x += 20;
			if(up) this.controlForce.y -= 200.;
		} else {
			if(left > 0) this.controlForce.x -= 10;
			if(right > 0) this.controlForce.x += 10;
			if(this.jumping && upDuration > 1 && upDuration < 10) this.controlForce.y -= 80.;
		}
		this.body.addForce(this.controlForce);
	}
	,__class__: util_CharacterController
};
var util_DigitalInput = function() {
	this.keyMap = [];
	var _g = 0;
	while(_g < 255) {
		var i = _g++;
		this.keyMap[i] = 0;
	}
	this.mousePosition = new glaze_geom_Vector2();
	this.mousePreviousPosition = new glaze_geom_Vector2();
	this.mouseOffset = new glaze_geom_Vector2();
	this.frameRef = 2;
};
util_DigitalInput.__name__ = true;
util_DigitalInput.prototype = {
	InputTarget: function(target,inputCorrection) {
		this.target = target;
		target.addEventListener("keydown",$bind(this,this.KeyDown),false);
		target.addEventListener("keyup",$bind(this,this.KeyUp),false);
		target.addEventListener("mousedown",$bind(this,this.MouseDown),false);
		target.addEventListener("mouseup",$bind(this,this.MouseUp),false);
		target.addEventListener("mousemove",$bind(this,this.MouseMove),false);
		this.inputCorrection = inputCorrection;
	}
	,Update: function(x,y) {
		this.mouseOffset.x = x;
		this.mouseOffset.y = y;
		this.frameRef++;
	}
	,KeyDown: function(event) {
		if(this.keyMap[event.keyCode] == 0) this.keyMap[event.keyCode] = this.frameRef;
		event.preventDefault();
	}
	,KeyUp: function(event) {
		this.keyMap[event.keyCode] = 0;
		event.preventDefault();
	}
	,MouseDown: function(event) {
		this.keyMap[200] = this.frameRef;
		event.preventDefault();
	}
	,MouseUp: function(event) {
		this.keyMap[200] = 0;
		event.preventDefault();
	}
	,MouseMove: function(event) {
		this.mousePreviousPosition.x = this.mousePosition.x;
		this.mousePreviousPosition.y = this.mousePosition.y;
		this.mousePosition.x = event.clientX - this.inputCorrection.x;
		this.mousePosition.y = event.clientY - this.inputCorrection.y;
		event.preventDefault();
	}
	,Pressed: function(keyCode) {
		return this.keyMap[keyCode] > 0;
	}
	,JustPressed: function(keyCode) {
		return this.keyMap[keyCode] == this.frameRef - 1;
	}
	,PressedDuration: function(keyCode) {
		var duration = this.keyMap[keyCode];
		return duration > 0?this.frameRef - duration:-1;
	}
	,Released: function(keyCode) {
		return this.keyMap[keyCode] == 0;
	}
	,__class__: util_DigitalInput
};
var util_GameLoop = function() {
	this.isRunning = false;
};
util_GameLoop.__name__ = true;
util_GameLoop.prototype = {
	update: function(timestamp) {
		this.delta = this.prevAnimationTime == 0?16.6666666766666687:timestamp - this.prevAnimationTime;
		this.prevAnimationTime = timestamp;
		if(this.updateFunc != null) this.updateFunc(Math.max(this.delta,16.6666666766666687),Math.floor(timestamp));
		this.rafID = window.requestAnimationFrame($bind(this,this.update));
		return false;
	}
	,start: function() {
		if(this.isRunning == true) return;
		this.isRunning = true;
		this.prevAnimationTime = 0;
		this.rafID = window.requestAnimationFrame($bind(this,this.update));
	}
	,stop: function() {
		if(this.isRunning == false) return;
		this.isRunning = false;
		window.cancelAnimationFrame(this.rafID);
	}
	,__class__: util_GameLoop
};
function $iterator(o) { if( o instanceof Array ) return function() { return HxOverrides.iter(o); }; return typeof(o.iterator) == 'function' ? $bind(o,o.iterator) : o.iterator; }
var $_, $fid = 0;
function $bind(o,m) { if( m == null ) return null; if( m.__id__ == null ) m.__id__ = $fid++; var f; if( o.hx__closures__ == null ) o.hx__closures__ = {}; else f = o.hx__closures__[m.__id__]; if( f == null ) { f = function(){ return f.method.apply(f.scope, arguments); }; f.scope = o; f.method = m; o.hx__closures__[m.__id__] = f; } return f; }
if(Array.prototype.indexOf) HxOverrides.indexOf = function(a,o,i) {
	return Array.prototype.indexOf.call(a,o,i);
};
String.prototype.__class__ = String;
String.__name__ = true;
Array.__name__ = true;
Date.prototype.__class__ = Date;
Date.__name__ = ["Date"];
var Int = { __name__ : ["Int"]};
var Dynamic = { __name__ : ["Dynamic"]};
var Float = Number;
Float.__name__ = ["Float"];
var Bool = Boolean;
Bool.__ename__ = ["Bool"];
var Class = { __name__ : ["Class"]};
var Enum = { };
if(Array.prototype.map == null) Array.prototype.map = function(f) {
	var a = [];
	var _g1 = 0;
	var _g = this.length;
	while(_g1 < _g) {
		var i = _g1++;
		a[i] = f(this[i]);
	}
	return a;
};
if(Array.prototype.filter == null) Array.prototype.filter = function(f1) {
	var a1 = [];
	var _g11 = 0;
	var _g2 = this.length;
	while(_g11 < _g2) {
		var i1 = _g11++;
		var e = this[i1];
		if(f1(e)) a1.push(e);
	}
	return a1;
};
var __map_reserved = {}
var ArrayBuffer = (Function("return typeof ArrayBuffer != 'undefined' ? ArrayBuffer : null"))() || js_html_compat_ArrayBuffer;
if(ArrayBuffer.prototype.slice == null) ArrayBuffer.prototype.slice = js_html_compat_ArrayBuffer.sliceImpl;
var DataView = (Function("return typeof DataView != 'undefined' ? DataView : null"))() || js_html_compat_DataView;
var Uint8Array = (Function("return typeof Uint8Array != 'undefined' ? Uint8Array : null"))() || js_html_compat_Uint8Array._new;

      // Production steps of ECMA-262, Edition 5, 15.4.4.21
      // Reference: http://es5.github.io/#x15.4.4.21
      if (!Array.prototype.reduce) {
        Array.prototype.reduce = function(callback /*, initialValue*/) {
          'use strict';
          if (this == null) {
            throw new TypeError('Array.prototype.reduce called on null or undefined');
          }
          if (typeof callback !== 'function') {
            throw new TypeError(callback + ' is not a function');
          }
          var t = Object(this), len = t.length >>> 0, k = 0, value;
          if (arguments.length == 2) {
            value = arguments[1];
          } else {
            while (k < len && ! k in t) {
              k++;
            }
            if (k >= len) {
              throw new TypeError('Reduce of empty array with no initial value');
            }
            value = t[k++];
          }
          for (; k < len; k++) {
            if (k in t) {
              value = callback(value, t[k], k, t);
            }
          }
          return value;
        };
      }
    ;
var scope = ("undefined" !== typeof window && window) || ("undefined" !== typeof global && global) || this;
if(!scope.setImmediate) scope.setImmediate = function(callback) {
	scope.setTimeout(callback,0);
};
var lastTime = 0;
var vendors = ["webkit","moz"];
var x = 0;
while(x < vendors.length && !scope.requestAnimationFrame) {
	scope.requestAnimationFrame = scope[vendors[x] + "RequestAnimationFrame"];
	scope.cancelAnimationFrame = scope[vendors[x] + "CancelAnimationFrame"] || scope[vendors[x] + "CancelRequestAnimationFrame"];
	x++;
}
if(!scope.requestAnimationFrame) scope.requestAnimationFrame = function(callback1) {
	var currTime = new Date().getTime();
	var timeToCall = Math.max(0,16 - (currTime - lastTime));
	var id = scope.setTimeout(function() {
		callback1(currTime + timeToCall);
	},timeToCall);
	lastTime = currTime + timeToCall;
	return id;
};
if(!scope.cancelAnimationFrame) scope.cancelAnimationFrame = function(id1) {
	scope.clearTimeout(id1);
};
if(typeof(scope.performance) == "undefined") scope.performance = { };
if(typeof(scope.performance.now) == "undefined") {
	var nowOffset = new Date().getTime();
	if(scope.performance.timing && scope.performance.timing.navigationStart) nowOffset = scope.performance.timing.navigationStart;
	scope.performance.now = (function($this) {
		var $r;
		var now = function() {
			return new Date() - nowOffset;
		};
		$r = now;
		return $r;
	}(this));
}
Demo.mapData = "eJxjZGBgYKQyphaglXnUMpMe/iXGfHrHB7XDj1pmkut/XGqonQeGSv4YTOZRMz5xmT3SzKMmBgBlKwBx";
glaze_geom_Vector2.ZERO_TOLERANCE = 1e-08;
glaze_physics_collision_Intersect.epsilon = 1e-8;
glaze_physics_collision_Map.CORRECTION = .0;
glaze_physics_collision_Map.ROUNDDOWN = .01;
glaze_physics_collision_Map.ROUNDUP = .5;
haxe_crypto_Base64.CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
haxe_crypto_Base64.BYTES = haxe_io_Bytes.ofString(haxe_crypto_Base64.CHARS);
haxe_io_FPHelper.i64tmp = (function($this) {
	var $r;
	var x = new haxe__$Int64__$_$_$Int64(0,0);
	$r = x;
	return $r;
}(this));
haxe_zip_InflateImpl.LEN_EXTRA_BITS_TBL = [0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0,-1,-1];
haxe_zip_InflateImpl.LEN_BASE_VAL_TBL = [3,4,5,6,7,8,9,10,11,13,15,17,19,23,27,31,35,43,51,59,67,83,99,115,131,163,195,227,258];
haxe_zip_InflateImpl.DIST_EXTRA_BITS_TBL = [0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13,-1,-1];
haxe_zip_InflateImpl.DIST_BASE_VAL_TBL = [1,2,3,4,5,7,9,13,17,25,33,49,65,97,129,193,257,385,513,769,1025,1537,2049,3073,4097,6145,8193,12289,16385,24577];
haxe_zip_InflateImpl.CODE_LENGTHS_POS = [16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15];
js_Boot.__toStr = {}.toString;
js_html_compat_Uint8Array.BYTES_PER_ELEMENT = 1;
minicanvas_MiniCanvas.displayGenerationTime = false;
minicanvas_BrowserCanvas._backingStoreRatio = 0;
minicanvas_BrowserCanvas.attachKeyEventsToCanvas = false;
minicanvas_BrowserCanvas.defaultScaleMode = minicanvas_ScaleMode.Auto;
minicanvas_BrowserCanvas.parentNode = typeof document != 'undefined' && document.body;
minicanvas_NodeCanvas.defaultScaleMode = minicanvas_ScaleMode.NoScale;
minicanvas_NodeCanvas.imagePath = "images";
thx_Floats.TOLERANCE = 10e-5;
thx_Floats.EPSILON = 10e-10;
thx_Floats.pattern_parse = new EReg("^(\\+|-)?\\d+(\\.\\d+)?(e-?\\d+)?$","");
thx_Ints.pattern_parse = new EReg("^[+-]?(\\d+|0x[0-9A-F]+)$","i");
thx_Ints.BASE = "0123456789abcdefghijklmnopqrstuvwxyz";
thx_Strings.UCWORDS = new EReg("[^a-zA-Z]([a-z])","g");
thx_Strings.UCWORDSWS = new EReg("\\s[a-z]","g");
thx_Strings.ALPHANUM = new EReg("^[a-z0-9]+$","i");
thx_Strings.DIGITS = new EReg("^[0-9]+$","");
thx_Strings.STRIPTAGS = new EReg("</?[a-z]+[^>]*?/?>","gi");
thx_Strings.WSG = new EReg("\\s+","g");
thx_Strings.SPLIT_LINES = new EReg("\r\n|\n\r|\n|\r","g");
thx_Timer.FRAME_RATE = Math.round(16.6666666666666679);
thx_color__$Grey_Grey_$Impl_$.black = 0;
thx_color__$Grey_Grey_$Impl_$.white = 1;
thx_color_parse_ColorParser.parser = new thx_color_parse_ColorParser();
thx_color_parse_ColorParser.isPureHex = new EReg("^([0-9a-f]{2}){3,4}$","i");
util_CharacterController.WALK_FORCE = 20;
util_CharacterController.AIR_CONTROL_FORCE = 10;
util_CharacterController.JUMP_FORCE = 1000;
util_CharacterController.MAX_AIR_HORIZONTAL_VELOCITY = 500;
util_GameLoop.MIN_DELTA = 16.6666666766666687;
Demo.main();
})(typeof console != "undefined" ? console : {log:function(){}});
