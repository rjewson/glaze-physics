(function (console) { "use strict";
var $estr = function() { return js_Boot.__string_rec(this,''); };
function $extend(from, fields) {
	function Inherit() {} Inherit.prototype = from; var proto = new Inherit();
	for (var name in fields) proto[name] = fields[name];
	if( fields.toString !== Object.prototype.toString ) proto.toString = fields.toString;
	return proto;
}
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
		if(this.r.m != null && n >= 0 && n < this.r.m.length) return this.r.m[n]; else throw new js__$Boot_HaxeError("EReg::matched");
	}
	,matchedPos: function() {
		if(this.r.m == null) throw new js__$Boot_HaxeError("No string matched");
		return { pos : this.r.m.index, len : this.r.m[0].length};
	}
	,matchSub: function(s,pos,len) {
		if(len == null) len = -1;
		if(this.r.global) {
			this.r.lastIndex = pos;
			this.r.m = this.r.exec(len < 0?s:HxOverrides.substr(s,0,pos + len));
			var b = this.r.m != null;
			if(b) this.r.s = s;
			return b;
		} else {
			var b1 = this.match(len < 0?HxOverrides.substr(s,pos,null):HxOverrides.substr(s,pos,len));
			if(b1) {
				this.r.s = s;
				this.r.m.index += pos;
			}
			return b1;
		}
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
		var buf = new StringBuf();
		do {
			if(offset >= s.length) break; else if(!this.matchSub(s,offset)) {
				buf.add(HxOverrides.substr(s,offset,null));
				break;
			}
			var p = this.matchedPos();
			buf.add(HxOverrides.substr(s,offset,p.pos - offset));
			buf.add(f(this));
			if(p.len == 0) {
				buf.add(HxOverrides.substr(s,p.pos,1));
				offset = p.pos + 1;
			} else offset = p.pos + p.len;
		} while(this.r.global);
		if(!this.r.global && offset > 0 && offset < s.length) buf.add(HxOverrides.substr(s,offset,null));
		return buf.b;
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
HxOverrides.iter = function(a) {
	return { cur : 0, arr : a, hasNext : function() {
		return this.cur < this.arr.length;
	}, next : function() {
		return this.arr[this.cur++];
	}};
};
var Main = function() { };
Main.__name__ = true;
Main.main = function() {
	var demo1 = new demo_Test1();
	window.document.getElementById("stopbutton").addEventListener("click",function(event) {
		demo1.loop.stop();
	});
	window.document.getElementById("startbutton").addEventListener("click",function(event1) {
		demo1.loop.start();
	});
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
	if(x <= 0) return 0; else return Math.floor(Math.random() * x);
};
var StringBuf = function() {
	this.b = "";
};
StringBuf.__name__ = true;
StringBuf.prototype = {
	add: function(x) {
		this.b += Std.string(x);
	}
	,__class__: StringBuf
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
	var hexChars = "0123456789ABCDEF";
	do {
		s = hexChars.charAt(n & 15) + s;
		n >>>= 4;
	} while(n > 0);
	if(digits != null) while(s.length < digits) s = "0" + s;
	return s;
};
StringTools.fastCodeAt = function(s,index) {
	return s.charCodeAt(index);
};
var demo_Test1 = function() {
	this.staticTests();
	this.setup();
	this.loop.start();
};
demo_Test1.__name__ = true;
demo_Test1.prototype = {
	staticTests: function() {
		var pos1 = new glaze_geom_Vector2(100,100);
		var extents1 = new glaze_geom_Vector2(10,10);
		var pos2 = new glaze_geom_Vector2(150,100);
		var extents2 = new glaze_geom_Vector2(10,10);
		var delta2 = new glaze_geom_Vector2(-31,0);
		var contact = new glaze_physics_collision_Contact();
		var result;
		result = glaze_physics_collision_Intersect.StaticAABBvsSweeptAABB(pos1,extents1,pos2,extents2,delta2,contact);
	}
	,setup: function() {
		this.canvas = minicanvas_MiniCanvas.create(640,640);
		this.canvas.display("basic example");
		this.input = new glaze_util_DigitalInput();
		this.input.InputTarget(window.document);
		var mapData = new glaze_ds_Bytes2D(20,20,32,4,glaze_ds_Bytes2D.uncompressData("eJxjZGBgYKQyphaglXnUMnOo+Jfa5lErHIeifylJ+0PFv6PmDW/zqIkBJyMAXA=="));
		this.map = new glaze_physics_collision_Map(mapData);
		this.map.debug = $bind(this,this.debugGrid);
		this.debugGridItems = [];
		this.engine = new glaze_Engine(this.map);
		this.loop = new glaze_util_GameLoop();
		this.loop.updateFunc = $bind(this,this.update);
		this.customSetup();
	}
	,customSetup: function() {
		this.player = new glaze_physics_Body(20,45);
		this.player.position.setTo(200,200);
		this.engine.addBody(this.player);
		var box = glaze_physics_collision_BFProxy.CreateStaticFeature(320,300,40,100);
		box.contactCallback = $bind(this,this.cb);
		this.engine.broadphase.addProxy(box);
		this.ray = new glaze_physics_collision_Ray();
	}
	,cb: function(a,b,c) {
		console.log("hit");
	}
	,update: function(delta) {
		this.debugGridItemsCount = 0;
		this.input.Update(0,0);
		this.ray.hit = false;
		this.processInput();
		this.engine.update(delta);
		this.debugRender();
		this.render();
	}
	,processInput: function() {
		var inputVelocity = new glaze_geom_Vector2();
		var force = 10;
		var left = this.input.PressedDuration(65);
		var right = this.input.PressedDuration(68);
		var up = this.input.JustPressed(87);
		var down = this.input.PressedDuration(83);
		var fire = this.input.keyMap[32] > 0;
		var ray = this.input.keyMap[82] > 0;
		if(left > 0) inputVelocity.x -= force;
		if(right > 0) inputVelocity.x += force;
		if(up) {
			if(this.player.onGround) inputVelocity.y -= force * 50;
		}
		if(down > 0) inputVelocity.y += force;
		if(fire) this.fireBullet();
		if(ray) this.shootRay();
		this.player.addForce(inputVelocity);
	}
	,fireBullet: function() {
		var bullet = new glaze_physics_Body(5,5);
		bullet.position.setTo(this.player.position.x,this.player.position.y);
		var vel = this.input.mousePosition.clone();
		vel.minusEquals(this.player.position);
		vel.normalize();
		vel.multEquals(10000);
		bullet.velocity.setTo(vel.x,vel.y);
		this.engine.addBody(bullet);
	}
	,shootRay: function() {
		var target = this.player.position.clone();
		target.x -= 1;
		target.y -= 1;
		this.ray.initalize(this.player.position,target,1000);
		this.map.castRay(this.ray);
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
		var halfCellSize = cellSize / 2;
		var _g1 = 0;
		var _g = this.map.data.height;
		while(_g1 < _g) {
			var y = _g1++;
			var _g3 = 0;
			var _g2 = this.map.data.width;
			while(_g3 < _g2) {
				var x = _g3++;
				var cell = this.map.data.get(x,y,0);
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
			this.canvas.rect(body.aabb.get_l(),body.aabb.get_t(),body.aabb.get_r(),body.aabb.get_b(),1,body.onGround?thx_color__$RGBA_RGBA_$Impl_$.fromString("rgba(255,0,0,1)"):thx_color__$RGBA_RGBA_$Impl_$.fromString("rgba(0,0,255,1)"));
		}
		var _g5 = 0;
		var _g12 = this.engine.broadphase.staticProxies;
		while(_g5 < _g12.length) {
			var proxy = _g12[_g5];
			++_g5;
			this.canvas.rect(proxy.aabb.get_l(),proxy.aabb.get_t(),proxy.aabb.get_r(),proxy.aabb.get_b(),1,thx_color__$RGBA_RGBA_$Impl_$.fromString("rgba(0,255,0,1)"));
		}
		var _g13 = 0;
		var _g6 = this.debugGridItemsCount;
		while(_g13 < _g6) {
			var i = _g13++;
			var xp1 = this.debugGridItems[i * 2] * cellSize;
			var yp1 = this.debugGridItems[i * 2 + 1] * cellSize;
			this.canvas.rect(xp1,yp1,xp1 + cellSize,yp1 + cellSize,3,thx_color__$RGBA_RGBA_$Impl_$.fromString("#ff0000"));
		}
		if(this.ray.hit) this.canvas.line(this.ray.origin.x,this.ray.origin.y,this.ray.position.x,this.ray.position.y,1,thx_color__$RGBA_RGBA_$Impl_$.fromString("#00ff00"));
	}
	,__class__: demo_Test1
};
var glaze_Engine = function(map) {
	this.map = map;
	this.dynamicBodies = [];
	this.sleepingBodies = [];
	this.nf = new glaze_physics_collision_Intersect();
	this.broadphase = new glaze_physics_collision_BruteforceBroadphase(map,this.nf);
	this.contact = new glaze_physics_collision_Contact();
	this.globalForce = new glaze_geom_Vector2(0,10);
};
glaze_Engine.__name__ = true;
glaze_Engine.prototype = {
	update: function(delta) {
		var invDelta = delta / 1000;
		this.preUpdate(invDelta);
		this.collide(invDelta);
		this.updatePosition(invDelta);
	}
	,preUpdate: function(delta) {
		var _g = 0;
		var _g1 = this.dynamicBodies;
		while(_g < _g1.length) {
			var body = _g1[_g];
			++_g;
			body.update(delta,this.globalForce);
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
		this.bytesData = this.data.b.buffer;
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
	,__class__: glaze_geom_AABB
};
var glaze_geom_BFBB = function() {
	this.b = -Infinity;
	this.r = -Infinity;
	this.t = Infinity;
	this.l = Infinity;
};
glaze_geom_BFBB.__name__ = true;
glaze_geom_BFBB.prototype = {
	setToSweeptAABB: function(aabb,preditcedPosition) {
		this.l = aabb.position.x - aabb.extents.x;
		this.r = aabb.position.x + aabb.extents.x;
		this.t = aabb.position.y - aabb.extents.y;
		this.b = aabb.position.y + aabb.extents.y;
	}
	,expandToAABB: function(aabb) {
	}
	,__class__: glaze_geom_BFBB
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
	,clamp: function(max) {
		var l = this.length();
		if(l > max) this.multEquals(max / l);
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
	,dot: function(v) {
		return this.x * v.x + this.y * v.y;
	}
	,cross: function(v) {
		return this.x * v.y - this.y * v.x;
	}
	,leftHandNormal: function() {
		return new glaze_geom_Vector2(this.y,-this.x);
	}
	,rightHandNormal: function() {
		return new glaze_geom_Vector2(-this.y,this.x);
	}
	,reflectEquals: function(normal) {
		var d = this.dot(normal);
		this.x -= 2 * d * normal.x;
		this.y -= 2 * d * normal.y;
	}
	,__class__: glaze_geom_Vector2
};
var glaze_physics_Body = function(w,h) {
	this.bounceCount = 4;
	this.onGroundPrev = false;
	this.onGround = false;
	this.dt = 0;
	this.invMass = 1;
	this.mass = 1;
	this.friction = 0;
	this.damping = 0.98;
	this.accumulatedForces = new glaze_geom_Vector2();
	this.forces = new glaze_geom_Vector2();
	this.bfproxy = new glaze_physics_collision_BFProxy();
	this.aabb = new glaze_geom_AABB();
	this.maxScalarVelocity = 1000;
	this.velocity = new glaze_geom_Vector2();
	this.collisionForce = new glaze_geom_Vector2();
	this.predictedPosition = new glaze_geom_Vector2();
	this.positionCorrection = new glaze_geom_Vector2();
	this.position = new glaze_geom_Vector2();
	this.aabb.extents.setTo(w,h);
	this.aabb.position = this.position;
	this.setMass(1);
	this.bfproxy.body = this;
	this.bfproxy.aabb = this.aabb;
	this.bfproxy.isStatic = false;
};
glaze_physics_Body.__name__ = true;
glaze_physics_Body.prototype = {
	update: function(dt,globalForces) {
		this.dt = dt;
		this.forces.plusEquals(globalForces);
		this.forces.plusEquals(this.collisionForce);
		this.collisionForce.setTo(0,0);
		this.velocity.plusEquals(this.forces);
		this.velocity.multEquals(this.damping);
		this.velocity.clamp(this.maxScalarVelocity);
		this.predictedPosition.copy(this.position);
		this.predictedPosition.plusMultEquals(this.velocity,dt);
		this.onGroundPrev = this.onGround;
		this.onGround = false;
	}
	,respondStaticCollision: function(contact) {
		var seperation = Math.max(contact.distance,0);
		var penetration = Math.min(contact.distance,0);
		this.positionCorrection.x -= contact.normal.x * (penetration / this.dt);
		this.positionCorrection.y -= contact.normal.y * (penetration / this.dt);
		var nv = this.velocity.dot(contact.normal) + seperation / this.dt;
		if(nv < 0) {
			this.velocity.x -= contact.normal.x * nv;
			this.velocity.y -= contact.normal.y * nv;
			if(this.bounceCount > 0) {
				this.velocity.multEquals(0.95 + Math.random() * 0.05);
				this.velocity.reflectEquals(contact.normal);
				this.bounceCount--;
			}
			if(contact.normal.y < 0) {
				this.onGround = true;
				var tangent = contact.normal.rightHandNormal();
				var tv = this.velocity.dot(tangent) * 0.1;
				this.velocity.x -= tangent.x * tv;
				this.velocity.y -= tangent.y * tv;
			}
			return true;
		}
		return false;
	}
	,updatePosition: function() {
		this.positionCorrection.plusEquals(this.velocity);
		this.positionCorrection.multEquals(this.dt);
		this.position.plusEquals(this.positionCorrection);
		this.positionCorrection.setTo(0,0);
		this.forces.setTo(0,0);
	}
	,addForce: function(f) {
		this.forces.plusMultEquals(f,this.invMass);
	}
	,addMasslessForce: function(f) {
		this.forces.plusEquals(f);
	}
	,setMass: function(mass) {
		this.mass = mass;
		this.invMass = 1 / mass;
	}
	,__class__: glaze_physics_Body
};
var glaze_physics_Material = function(density,elasticity,friction) {
	if(friction == null) friction = 0.0;
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
	bfproxy.aabb.position.setTo(x,y);
	bfproxy.aabb.extents.setTo(hw,hh);
	bfproxy.isStatic = true;
	return bfproxy;
};
glaze_physics_collision_BFProxy.prototype = {
	get_isStatic: function() {
		return this.body == null;
	}
	,__class__: glaze_physics_collision_BFProxy
};
var glaze_physics_collision_BruteforceBroadphase = function(map,nf) {
	this.map = map;
	this.nf = nf;
	this.staticProxies = [];
	this.dynamicProxies = [];
};
glaze_physics_collision_BruteforceBroadphase.__name__ = true;
glaze_physics_collision_BruteforceBroadphase.prototype = {
	addProxy: function(proxy) {
		var target;
		if(proxy.isStatic) target = this.staticProxies; else target = this.dynamicProxies;
		target.push(proxy);
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
	,__class__: glaze_physics_collision_BruteforceBroadphase
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
		var sx;
		if(dx < 0) sx = -1; else sx = 1;
		contact.distance = contact.delta.x = px * sx;
		contact.delta.y = 0;
		contact.normal.x = sx;
		contact.normal.y = 0;
		contact.position.x = aabb_position_A.x + aabb_extents_A.x * sx;
		contact.position.y = aabb_position_B.y;
	} else {
		var sy;
		if(dy < 0) sy = -1; else sy = 1;
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
	var signX;
	if(scaleX < 0) signX = -1; else signX = 1;
	var signY;
	if(scaleY < 0) signY = -1; else signY = 1;
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
glaze_physics_collision_Intersect.AABBvsStaticNoPenetrationAABB = function(aabb_position_A,aabb_extents_A,aabb_position_B,aabb_extents_B,contact) {
	var dx = aabb_position_B.x - aabb_position_A.x;
	var px = aabb_extents_B.x + aabb_extents_A.x - Math.abs(dx);
	var dy = aabb_position_B.y - aabb_position_A.y;
	var py = aabb_extents_B.y + aabb_extents_A.y - Math.abs(dy);
	if(px < py) {
		if(dx < 0) contact.normal.x = 1; else contact.normal.x = -1;
		contact.normal.y = 0;
	} else {
		contact.normal.x = 0;
		if(dy < 0) contact.normal.y = 1; else contact.normal.y = -1;
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
		if(proxyA.isStatic == proxyB.isStatic == true) return false;
		var collided = false;
		if(proxyA.isSensor == true || proxyB.isSensor == true) collided = glaze_physics_collision_Intersect.StaticAABBvsStaticAABB(proxyA.aabb.position,proxyA.aabb.extents,proxyB.aabb.position,proxyB.aabb.extents,this.contact); else if(proxyA.isStatic != proxyB.isStatic) {
			var staticProxy;
			var dynamicProxy;
			if(proxyA.isStatic) {
				staticProxy = proxyA;
				dynamicProxy = proxyB;
			} else {
				staticProxy = proxyB;
				dynamicProxy = proxyA;
			}
			glaze_physics_collision_Intersect.AABBvsStaticNoPenetrationAABB(dynamicProxy.aabb.position,dynamicProxy.aabb.extents,staticProxy.aabb.position,staticProxy.aabb.extents,this.contact);
			collided = dynamicProxy.body.respondStaticCollision(this.contact);
		}
		if(collided == true) {
			if(proxyA.contactCallback != null) proxyA.contactCallback(proxyA,proxyB,this.contact);
			if(proxyB.contactCallback != null) proxyB.contactCallback(proxyB,proxyA,this.contact);
		}
		return collided;
	}
	,CollideDynamicStatic: function(dynamicProxy,staticProxy) {
		if(dynamicProxy.isSensor == true) return;
		if(staticProxy.isSensor == true) return;
		if(glaze_physics_collision_Intersect.AABBvsStaticNoPenetrationAABB(dynamicProxy.aabb.position,dynamicProxy.aabb.extents,staticProxy.aabb.position,staticProxy.aabb.extents,this.contact) == true) dynamicProxy.body.respondStaticCollision(this.contact);
	}
	,CollideDynamicDynamic: function(dynamicProxyA,dynamicProxyB) {
		if(glaze_physics_collision_Intersect.StaticAABBvsStaticAABB(dynamicProxyA.aabb.position,dynamicProxyA.aabb.extents,dynamicProxyB.aabb.position,dynamicProxyB.aabb.extents,this.contact) == true) {
		}
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
		bodyA.collisionForce.plusEquals(new glaze_geom_Vector2(fx,fy));
		bodyB.collisionForce.plusEquals(new glaze_geom_Vector2(-fx,-fy));
	}
	,__class__: glaze_physics_collision_Intersect
};
var glaze_physics_collision_Map = function(data) {
	this.tileExtents = new glaze_geom_Vector2();
	this.tilePosition = new glaze_geom_Vector2();
	this.data = data;
	this.tileSize = data.cellSize;
	this.tileHalfSize = this.tileSize / 2;
	this.tileExtents.setTo(this.tileHalfSize,this.tileHalfSize);
	this.contact = new glaze_physics_collision_Contact();
};
glaze_physics_collision_Map.__name__ = true;
glaze_physics_collision_Map.prototype = {
	testCollision: function(body) {
		this.startX = this.data.Index(Math.min(body.position.x,body.predictedPosition.x) - body.aabb.extents.x);
		this.startY = this.data.Index(Math.min(body.position.y,body.predictedPosition.y) - body.aabb.extents.y);
		this.endX = this.data.Index(Math.max(body.position.x,body.predictedPosition.x) + body.aabb.extents.x + .5) + 1;
		this.endY = this.data.Index(Math.max(body.position.y,body.predictedPosition.y) + body.aabb.extents.y + .5) + 1;
		var _g1 = this.startX;
		var _g = this.endX;
		while(_g1 < _g) {
			var x = _g1++;
			var _g3 = this.startY;
			var _g2 = this.endY;
			while(_g3 < _g2) {
				var y = _g3++;
				this.tilePosition.x = x * this.tileSize + this.tileHalfSize;
				this.tilePosition.y = y * this.tileSize + this.tileHalfSize;
				var cell = this.data.get(x,y,0);
				if(cell > 0) {
					if(glaze_physics_collision_Intersect.AABBvsStaticNoPenetrationAABB(body.position,body.aabb.extents,this.tilePosition,this.tileExtents,this.contact) == true) {
						var nextX = x + (this.contact.normal.x | 0);
						var nextY = y + (this.contact.normal.y | 0);
						var nextCell = this.data.get(nextX,nextY,0);
						if(nextCell == 0) {
							body.respondStaticCollision(this.contact);
							if(this.debug != null) this.debug(x,y);
						}
					}
				}
			}
		}
	}
	,AABBvsStaticTileAABBSlope: function(aabb_position_A,aabb_extents_A,aabb_position_B,aabb_extents_B,contact) {
		var slope = new glaze_geom_Vector2(0.707106781186547462,-0.707106781186547462);
		var dx = aabb_position_B.x - aabb_position_A.x;
		var px = aabb_extents_B.x + aabb_extents_A.x - Math.abs(dx);
		var dy = aabb_position_B.y - aabb_position_A.y;
		var py = aabb_extents_B.y + aabb_extents_A.y - Math.abs(dy);
		if(px < py) {
			if(dx < 0) contact.normal.x = 1; else contact.normal.x = -1;
			contact.normal.y = 0;
		} else {
			contact.normal.x = 0;
			if(dy < 0) contact.normal.y = 1; else contact.normal.y = -1;
		}
		if(aabb_position_A.y + aabb_extents_A.y < aabb_position_B.y + aabb_extents_B.y && aabb_position_A.x - aabb_extents_B.x > aabb_position_B.x - aabb_extents_B.x) {
			console.log("a");
			contact.normal.x = 0.707106781186547462;
			contact.normal.y = -0.707106781186547462;
			var cornerTile = new glaze_geom_Vector2(aabb_position_B.x - aabb_extents_B.x,aabb_position_B.y - aabb_extents_B.y);
			var d = contact.normal.dot(cornerTile);
			var cornerBody = new glaze_geom_Vector2(aabb_position_A.x - aabb_extents_A.x,aabb_position_A.y + aabb_extents_A.y);
			contact.distance = (contact.normal.dot(cornerBody) - d) / contact.normal.dot(contact.normal);
			return true;
		} else {
			console.log("b");
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
		var stepX;
		var tMaxX;
		var tDeltaX;
		if(d.x < 0) {
			stepX = -1;
			tMaxX = (cX - ray.origin.x) / d.x;
			tDeltaX = this.tileSize / -d.x;
		} else if(0 < d.x) {
			stepX = 1;
			tMaxX = (cX + this.tileSize - ray.origin.x) / d.x;
			tDeltaX = this.tileSize / d.x;
		} else {
			stepX = 0;
			tMaxX = 100000000;
			tDeltaX = 0;
		}
		var stepY;
		var tMaxY;
		var tDeltaY;
		if(d.y < 0) {
			stepY = -1;
			tMaxY = (cY - ray.origin.y) / d.y;
			tDeltaY = this.tileSize / -d.y;
		} else if(0 < d.y) {
			stepY = 1;
			tMaxY = (cY + this.tileSize - ray.origin.y) / d.y;
			tDeltaY = this.tileSize / d.y;
		} else {
			stepY = 0;
			tMaxY = 100000000;
			tDeltaY = 0;
		}
		var pX = ray.origin.x;
		var pY = ray.origin.y;
		var transitionEdgeNormalX = 0;
		var transitionEdgeNormalY = 0;
		while(true) {
			if(tMaxX < tMaxY) {
				if(stepX < 0) transitionEdgeNormalX = 1; else transitionEdgeNormalX = -1;
				transitionEdgeNormalY = 0;
				pX = ray.origin.x + tMaxX * d.x;
				pY = ray.origin.y + tMaxX * d.y;
				tMaxX += tDeltaX;
				x += stepX;
			} else {
				transitionEdgeNormalX = 0;
				if(stepY < 0) transitionEdgeNormalY = 1; else transitionEdgeNormalY = 0;
				pX = ray.origin.x + tMaxY * d.x;
				pY = ray.origin.y + tMaxY * d.y;
				tMaxY += tDeltaY;
				y += stepY;
			}
			var distX = pX - ray.origin.x;
			var distY = pY - ray.origin.y;
			var currentLen = distX * distX + distY * distY;
			if(currentLen >= ray.range * ray.range) return false;
			var tile = this.data.get(x,y,0);
			if(tile > 0) {
				ray.report(pX,pY,transitionEdgeNormalX,transitionEdgeNormalY);
				return true;
			}
		}
		return false;
	}
	,__class__: glaze_physics_collision_Map
};
var glaze_physics_collision_Ray = function() {
	this.normal = new glaze_geom_Vector2();
	this.position = new glaze_geom_Vector2();
	this.direction = new glaze_geom_Vector2();
	this.delta = new glaze_geom_Vector2();
	this.range = 0;
	this.target = new glaze_geom_Vector2();
	this.origin = new glaze_geom_Vector2();
};
glaze_physics_collision_Ray.__name__ = true;
glaze_physics_collision_Ray.prototype = {
	initalize: function(origin,target,range) {
		if(range == null) range = 0;
		this.reset();
		this.origin.copy(origin);
		this.target.copy(target);
		this.delta.copy(target);
		this.delta.minusEquals(origin);
		this.direction.copy(this.delta);
		this.direction.normalize();
		if(range == 0) this.range = this.delta.length(); else this.range = range;
	}
	,reset: function() {
		this.position.setTo(0,0);
		this.normal.setTo(0,0);
		this.hit = false;
	}
	,report: function(pX,pY,nX,nY) {
		this.position.setTo(pX,pY);
		this.normal.setTo(nX,nY);
		this.hit = true;
	}
	,__class__: glaze_physics_collision_Ray
};
var glaze_util_DigitalInput = function() {
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
glaze_util_DigitalInput.__name__ = true;
glaze_util_DigitalInput.prototype = {
	InputTarget: function(target) {
		this.target = target;
		target.addEventListener("keydown",$bind(this,this.KeyDown),false);
		target.addEventListener("keyup",$bind(this,this.KeyUp),false);
		target.addEventListener("mousedown",$bind(this,this.MouseDown),false);
		target.addEventListener("mouseup",$bind(this,this.MouseUp),false);
		target.addEventListener("mousemove",$bind(this,this.MouseMove),false);
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
		this.mousePosition.x = event.clientX;
		this.mousePosition.y = event.clientY;
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
		if(duration > 0) return this.frameRef - duration; else return 0;
	}
	,Released: function(keyCode) {
		return this.keyMap[keyCode] == 0;
	}
	,__class__: glaze_util_DigitalInput
};
var glaze_util_GameLoop = function() {
	this.isRunning = false;
};
glaze_util_GameLoop.__name__ = true;
glaze_util_GameLoop.prototype = {
	update: function(timestamp) {
		this.delta = timestamp - this.prevAnimationTime;
		this.prevAnimationTime = timestamp;
		if(this.updateFunc != null) this.updateFunc(16.6666666666666679);
		this.rafID = window.requestAnimationFrame($bind(this,this.update));
		return false;
	}
	,start: function() {
		if(this.isRunning == true) return;
		this.isRunning = true;
		this.prevAnimationTime = this.animationStartTimestamp = window.performance.now();
		this.rafID = window.requestAnimationFrame($bind(this,this.update));
	}
	,stop: function() {
		if(this.isRunning == false) return;
		this.isRunning = false;
		window.cancelAnimationFrame(this.rafID);
	}
	,__class__: glaze_util_GameLoop
};
var haxe_StackItem = { __ename__ : true, __constructs__ : ["CFunction","Module","FilePos","Method","LocalFunction"] };
haxe_StackItem.CFunction = ["CFunction",0];
haxe_StackItem.CFunction.toString = $estr;
haxe_StackItem.CFunction.__enum__ = haxe_StackItem;
haxe_StackItem.Module = function(m) { var $x = ["Module",1,m]; $x.__enum__ = haxe_StackItem; $x.toString = $estr; return $x; };
haxe_StackItem.FilePos = function(s,file,line) { var $x = ["FilePos",2,s,file,line]; $x.__enum__ = haxe_StackItem; $x.toString = $estr; return $x; };
haxe_StackItem.Method = function(classname,method) { var $x = ["Method",3,classname,method]; $x.__enum__ = haxe_StackItem; $x.toString = $estr; return $x; };
haxe_StackItem.LocalFunction = function(v) { var $x = ["LocalFunction",4,v]; $x.__enum__ = haxe_StackItem; $x.toString = $estr; return $x; };
var haxe_CallStack = function() { };
haxe_CallStack.__name__ = true;
haxe_CallStack.getStack = function(e) {
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
		if(m == null) b.b += "null"; else b.b += "" + m;
		break;
	case 2:
		var line = s[4];
		var file = s[3];
		var s1 = s[2];
		if(s1 != null) {
			haxe_CallStack.itemToString(b,s1);
			b.b += " (";
		}
		if(file == null) b.b += "null"; else b.b += "" + file;
		b.b += " line ";
		if(line == null) b.b += "null"; else b.b += "" + line;
		if(s1 != null) b.b += ")";
		break;
	case 3:
		var meth = s[3];
		var cname = s[2];
		if(cname == null) b.b += "null"; else b.b += "" + cname;
		b.b += ".";
		if(meth == null) b.b += "null"; else b.b += "" + meth;
		break;
	case 4:
		var n = s[2];
		b.b += "local function #";
		if(n == null) b.b += "null"; else b.b += "" + n;
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
var haxe__$Int64__$_$_$Int64 = function(high,low) {
	this.high = high;
	this.low = low;
};
haxe__$Int64__$_$_$Int64.__name__ = true;
haxe__$Int64__$_$_$Int64.prototype = {
	__class__: haxe__$Int64__$_$_$Int64
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
		var c = StringTools.fastCodeAt(s,i++);
		if(55296 <= c && c <= 56319) c = c - 55232 << 10 | StringTools.fastCodeAt(s,i++) & 1023;
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
	get: function(pos) {
		return this.b[pos];
	}
	,set: function(pos,v) {
		this.b[pos] = v & 255;
	}
	,blit: function(pos,src,srcpos,len) {
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
		var base = this.base;
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
				var i = tbl[b.get(pin++)];
				if(i == -1) throw new js__$Boot_HaxeError("BaseCode : invalid encoded char");
				buf |= i;
			}
			curbits -= 8;
			out.set(pout++,buf >> curbits & 255);
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
	__class__: haxe_ds_IntMap
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
		if(this.rh == null) return null; else return this.rh["$" + key];
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
	addBytes: function(src,pos,len) {
		if(pos < 0 || len < 0 || pos + len > src.length) throw new js__$Boot_HaxeError(haxe_io_Error.OutsideBounds);
		var b1 = this.b;
		var b2 = src.b;
		var _g1 = pos;
		var _g = pos + len;
		while(_g1 < _g) {
			var i = _g1++;
			this.b.push(b2[i]);
		}
	}
	,getBytes: function() {
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
		if(this.bigEndian) return ch2 | ch1 << 8; else return ch1 | ch2 << 8;
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
haxe_io_Error.Blocked.toString = $estr;
haxe_io_Error.Blocked.__enum__ = haxe_io_Error;
haxe_io_Error.Overflow = ["Overflow",1];
haxe_io_Error.Overflow.toString = $estr;
haxe_io_Error.Overflow.__enum__ = haxe_io_Error;
haxe_io_Error.OutsideBounds = ["OutsideBounds",2];
haxe_io_Error.OutsideBounds.toString = $estr;
haxe_io_Error.OutsideBounds.__enum__ = haxe_io_Error;
haxe_io_Error.Custom = function(e) { var $x = ["Custom",3,e]; $x.__enum__ = haxe_io_Error; $x.toString = $estr; return $x; };
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
	var af;
	if(f < 0) af = -f; else af = f;
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
		var av;
		if(v < 0) av = -v; else av = v;
		var exp = Math.floor(Math.log(av) / 0.6931471805599453);
		var sig;
		var v1 = (av / Math.pow(2,exp) - 1) * 4503599627370496.;
		sig = Math.round(v1);
		var sig_l = sig | 0;
		var sig_h = sig / 4294967296.0 | 0;
		i64.low = sig_l;
		i64.high = (v < 0?-2147483648:0) | exp + 1023 << 20 | sig_h;
	}
	return i64;
};
var haxe_zip_Huffman = { __ename__ : true, __constructs__ : ["Found","NeedBit","NeedBits"] };
haxe_zip_Huffman.Found = function(i) { var $x = ["Found",0,i]; $x.__enum__ = haxe_zip_Huffman; $x.toString = $estr; return $x; };
haxe_zip_Huffman.NeedBit = function(left,right) { var $x = ["NeedBit",1,left,right]; $x.__enum__ = haxe_zip_Huffman; $x.toString = $estr; return $x; };
haxe_zip_Huffman.NeedBits = function(n,table) { var $x = ["NeedBits",2,n,table]; $x.__enum__ = haxe_zip_Huffman; $x.toString = $estr; return $x; };
var haxe_zip_HuffTools = function() {
};
haxe_zip_HuffTools.__name__ = true;
haxe_zip_HuffTools.prototype = {
	treeDepth: function(t) {
		switch(t[1]) {
		case 0:
			return 0;
		case 2:
			throw new js__$Boot_HaxeError("assert");
			break;
		case 1:
			var b = t[3];
			var a = t[2];
			var da = this.treeDepth(a);
			var db = this.treeDepth(b);
			return 1 + (da < db?da:db);
		}
	}
	,treeCompress: function(t) {
		var d = this.treeDepth(t);
		if(d == 0) return t;
		if(d == 1) switch(t[1]) {
		case 1:
			var b = t[3];
			var a = t[2];
			return haxe_zip_Huffman.NeedBit(this.treeCompress(a),this.treeCompress(b));
		default:
			throw new js__$Boot_HaxeError("assert");
		}
		var size = 1 << d;
		var table = [];
		var _g = 0;
		while(_g < size) {
			var i = _g++;
			table.push(haxe_zip_Huffman.Found(-1));
		}
		this.treeWalk(table,0,0,d,t);
		return haxe_zip_Huffman.NeedBits(d,table);
	}
	,treeWalk: function(table,p,cd,d,t) {
		switch(t[1]) {
		case 1:
			var b = t[3];
			var a = t[2];
			if(d > 0) {
				this.treeWalk(table,p,cd + 1,d - 1,a);
				this.treeWalk(table,p | 1 << cd,cd + 1,d - 1,b);
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
			var i = _g++;
			counts.push(0);
			tmp.push(0);
		}
		var _g1 = 0;
		while(_g1 < nlengths) {
			var i1 = _g1++;
			var p = lengths[i1 + pos];
			if(p >= maxbits) throw new js__$Boot_HaxeError("Invalid huffman");
			counts[p]++;
		}
		var code = 0;
		var _g11 = 1;
		var _g2 = maxbits - 1;
		while(_g11 < _g2) {
			var i2 = _g11++;
			code = code + counts[i2] << 1;
			tmp[i2] = code;
		}
		var bits = new haxe_ds_IntMap();
		var _g3 = 0;
		while(_g3 < nlengths) {
			var i3 = _g3++;
			var l = lengths[i3 + pos];
			if(l != 0) {
				var n = tmp[l - 1];
				tmp[l - 1] = n + 1;
				bits.h[n << 5 | l] = i3;
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
haxe_zip__$InflateImpl_State.Head.toString = $estr;
haxe_zip__$InflateImpl_State.Head.__enum__ = haxe_zip__$InflateImpl_State;
haxe_zip__$InflateImpl_State.Block = ["Block",1];
haxe_zip__$InflateImpl_State.Block.toString = $estr;
haxe_zip__$InflateImpl_State.Block.__enum__ = haxe_zip__$InflateImpl_State;
haxe_zip__$InflateImpl_State.CData = ["CData",2];
haxe_zip__$InflateImpl_State.CData.toString = $estr;
haxe_zip__$InflateImpl_State.CData.__enum__ = haxe_zip__$InflateImpl_State;
haxe_zip__$InflateImpl_State.Flat = ["Flat",3];
haxe_zip__$InflateImpl_State.Flat.toString = $estr;
haxe_zip__$InflateImpl_State.Flat.__enum__ = haxe_zip__$InflateImpl_State;
haxe_zip__$InflateImpl_State.Crc = ["Crc",4];
haxe_zip__$InflateImpl_State.Crc.toString = $estr;
haxe_zip__$InflateImpl_State.Crc.__enum__ = haxe_zip__$InflateImpl_State;
haxe_zip__$InflateImpl_State.Dist = ["Dist",5];
haxe_zip__$InflateImpl_State.Dist.toString = $estr;
haxe_zip__$InflateImpl_State.Dist.__enum__ = haxe_zip__$InflateImpl_State;
haxe_zip__$InflateImpl_State.DistOne = ["DistOne",6];
haxe_zip__$InflateImpl_State.DistOne.toString = $estr;
haxe_zip__$InflateImpl_State.DistOne.__enum__ = haxe_zip__$InflateImpl_State;
haxe_zip__$InflateImpl_State.Done = ["Done",7];
haxe_zip__$InflateImpl_State.Done.toString = $estr;
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
	if(header) this.state = haxe_zip__$InflateImpl_State.Head; else this.state = haxe_zip__$InflateImpl_State.Block;
	this.input = i;
	this.bits = 0;
	this.nbits = 0;
	this.needed = 0;
	this.output = null;
	this.outpos = 0;
	this.lengths = [];
	var _g = 0;
	while(_g < 19) {
		var i1 = _g++;
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
		output.addBytes(buf,0,len);
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
		if(n == 0) return 0; else if(this.getBit()) return 1 << n - 1 | this.getRevBits(n - 1); else return this.getRevBits(n - 1);
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
			var i = _g++;
			this.addByte(c);
		}
	}
	,addDist: function(d,len) {
		this.addBytes(this.window.buffer,this.window.pos - d,len);
	}
	,applyHuffman: function(h) {
		switch(h[1]) {
		case 0:
			var n = h[2];
			return n;
		case 1:
			var b = h[3];
			var a = h[2];
			return this.applyHuffman(this.getBit()?b:a);
		case 2:
			var tbl = h[3];
			var n1 = h[2];
			return this.applyHuffman(tbl[this.getBits(n1)]);
		}
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
			var cinfo = cmf >> 4;
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
					var i2 = _g3++;
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
			var rlen;
			if(this.len < this.needed) rlen = this.len; else rlen = this.needed;
			var bytes = this.input.read(rlen);
			this.len -= rlen;
			this.addBytes(bytes,0,rlen);
			if(this.len == 0) if(this["final"]) this.state = haxe_zip__$InflateImpl_State.Crc; else this.state = haxe_zip__$InflateImpl_State.Block;
			return this.needed > 0;
		case 6:
			var rlen1;
			if(this.len < this.needed) rlen1 = this.len; else rlen1 = this.needed;
			this.addDistOne(rlen1);
			this.len -= rlen1;
			if(this.len == 0) this.state = haxe_zip__$InflateImpl_State.CData;
			return this.needed > 0;
		case 5:
			while(this.len > 0 && this.needed > 0) {
				var rdist;
				if(this.len < this.dist) rdist = this.len; else rdist = this.dist;
				var rlen2;
				if(this.needed < rdist) rlen2 = this.needed; else rlen2 = rdist;
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
				if(this["final"]) this.state = haxe_zip__$InflateImpl_State.Crc; else this.state = haxe_zip__$InflateImpl_State.Block;
				return true;
			} else {
				n -= 257;
				var extra_bits = haxe_zip_InflateImpl.LEN_EXTRA_BITS_TBL[n];
				if(extra_bits == -1) throw new js__$Boot_HaxeError("Invalid data");
				this.len = haxe_zip_InflateImpl.LEN_BASE_VAL_TBL[n] + this.getBits(extra_bits);
				var dist_code;
				if(this.huffdist == null) dist_code = this.getRevBits(5); else dist_code = this.applyHuffman(this.huffdist);
				extra_bits = haxe_zip_InflateImpl.DIST_EXTRA_BITS_TBL[dist_code];
				if(extra_bits == -1) throw new js__$Boot_HaxeError("Invalid data");
				this.dist = haxe_zip_InflateImpl.DIST_BASE_VAL_TBL[dist_code] + this.getBits(extra_bits);
				if(this.dist > this.window.available()) throw new js__$Boot_HaxeError("Invalid data");
				if(this.dist == 1) this.state = haxe_zip__$InflateImpl_State.DistOne; else this.state = haxe_zip__$InflateImpl_State.Dist;
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
	if(Error.captureStackTrace) Error.captureStackTrace(this,js__$Boot_HaxeError);
};
js__$Boot_HaxeError.__name__ = true;
js__$Boot_HaxeError.__super__ = Error;
js__$Boot_HaxeError.prototype = $extend(Error.prototype,{
	__class__: js__$Boot_HaxeError
});
var js_Boot = function() { };
js_Boot.__name__ = true;
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
	if(typeof window != "undefined") return window[name]; else return global[name];
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
	if(byteOffset == null) this.offset = 0; else this.offset = byteOffset;
	if(byteLength == null) this.length = buffer.byteLength - this.offset; else this.length = byteLength;
	if(this.offset < 0 || this.length < 0 || this.offset + this.length > buffer.byteLength) throw new js__$Boot_HaxeError(haxe_io_Error.OutsideBounds);
};
js_html_compat_DataView.__name__ = true;
js_html_compat_DataView.prototype = {
	getInt8: function(byteOffset) {
		var v = this.buf.a[this.offset + byteOffset];
		if(v >= 128) return v - 256; else return v;
	}
	,getUint8: function(byteOffset) {
		return this.buf.a[this.offset + byteOffset];
	}
	,getInt16: function(byteOffset,littleEndian) {
		var v = this.getUint16(byteOffset,littleEndian);
		if(v >= 32768) return v - 65536; else return v;
	}
	,getUint16: function(byteOffset,littleEndian) {
		if(littleEndian) return this.buf.a[this.offset + byteOffset] | this.buf.a[this.offset + byteOffset + 1] << 8; else return this.buf.a[this.offset + byteOffset] << 8 | this.buf.a[this.offset + byteOffset + 1];
	}
	,getInt32: function(byteOffset,littleEndian) {
		var p = this.offset + byteOffset;
		var a = this.buf.a[p++];
		var b = this.buf.a[p++];
		var c = this.buf.a[p++];
		var d = this.buf.a[p++];
		if(littleEndian) return a | b << 8 | c << 16 | d << 24; else return d | c << 8 | b << 16 | a << 24;
	}
	,getUint32: function(byteOffset,littleEndian) {
		var v = this.getInt32(byteOffset,littleEndian);
		if(v < 0) return v + 4294967296.; else return v;
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
		if(value < 0) this.buf.a[byteOffset + this.offset] = value + 128 & 255; else this.buf.a[byteOffset + this.offset] = value & 255;
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
	if(minicanvas_MiniCanvas.envIsNode()) return new minicanvas_NodeCanvas(width,height,scaleMode); else return new minicanvas_BrowserCanvas(width,height,scaleMode);
};
minicanvas_MiniCanvas.prototype = {
	display: function(name) {
		this.deltaTime = performance.now() - this.startTime;
		if(!minicanvas_MiniCanvas.displayGenerationTime) console.log("generated \"" + name + "\" in " + thx_core_Floats.roundTo(this.deltaTime,2) + "ms");
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
		var slight;
		if(null == light) slight = thx_color__$RGBA_RGBA_$Impl_$.fromString("rgba(255,255,255,1)"); else slight = light;
		var sdark;
		if(null == dark) sdark = thx_color__$RGBA_RGBA_$Impl_$.fromString("rgba(204,204,204,1)"); else sdark = dark;
		var _g = 0;
		while(_g < cols) {
			var c = _g++;
			var _g1 = 0;
			while(_g1 < rows) {
				var r = _g1++;
				if(c % 2 != r % 2) this.ctx.fillStyle = thx_color__$RGBA_RGBA_$Impl_$.toString(slight); else this.ctx.fillStyle = thx_color__$RGBA_RGBA_$Impl_$.toString(sdark);
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
		this.ctx.fillStyle = thx_color__$RGBA_RGBA_$Impl_$.toString((function($this) {
			var $r;
			var t;
			{
				var _0 = color;
				if(null == _0) t = null; else t = _0;
			}
			$r = t != null?t:thx_color__$RGBA_RGBA_$Impl_$.fromString("rgba(204,51,0,1)");
			return $r;
		}(this)));
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
			while(px - radius <= this.height) {
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
		var t;
		var _0 = color;
		if(null == _0) t = null; else t = _0;
		if(t != null) this.ctx.strokeStyle = thx_color__$RGBA_RGBA_$Impl_$.toString(t); else this.ctx.strokeStyle = thx_color__$RGBA_RGBA_$Impl_$.toString(thx_color__$RGBA_RGBA_$Impl_$.fromString("rgba(0,0,0,1)"));
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
		var interaction = new minicanvas_CanvasInteraction(this,(function($this) {
			var $r;
			var t;
			{
				var _0 = x;
				if(null == _0) t = null; else t = _0;
			}
			$r = t != null?t:$this.width / 2;
			return $r;
		}(this)),(function($this) {
			var $r;
			var t1;
			{
				var _01 = y;
				if(null == _01) t1 = null; else t1 = _01;
			}
			$r = t1 != null?t1:$this.height;
			return $r;
		}(this)),function(stack) {
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
		this.events.set(name,{ callback : callback, listener : listener});
		if(this.isBrowser) this.canvas.addEventListener(type,listener,false);
		return this;
	}
	,offMouseEvent: function(type,name) {
		if(null == name) name = type;
		var item = this.events.get(name);
		if(null == item) return this;
		this.events.remove(name);
		if(this.isBrowser) this.canvas.removeEventListener(type,item.listener,false);
		return this;
	}
	,trigger: function(name,x,y) {
		var item = this.events.get(name);
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
		return;
	}
	,nativeDisplay: function(name) {
		throw new js__$Boot_HaxeError("abstract method nativeDisplay()");
		return;
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
		if(stack.length == 0) return done();
		(stack.shift())();
		this.storeFrame();
		this.resolveStack(stack,done);
	}
	,__class__: minicanvas_MiniCanvas
};
var minicanvas_ScaleMode = { __ename__ : true, __constructs__ : ["NoScale","Auto","Scaled"] };
minicanvas_ScaleMode.NoScale = ["NoScale",0];
minicanvas_ScaleMode.NoScale.toString = $estr;
minicanvas_ScaleMode.NoScale.__enum__ = minicanvas_ScaleMode;
minicanvas_ScaleMode.Auto = ["Auto",1];
minicanvas_ScaleMode.Auto.toString = $estr;
minicanvas_ScaleMode.Auto.__enum__ = minicanvas_ScaleMode;
minicanvas_ScaleMode.Scaled = function(v) { var $x = ["Scaled",2,v]; $x.__enum__ = minicanvas_ScaleMode; $x.toString = $estr; return $x; };
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
		var canvas;
		var _this = window.document;
		canvas = _this.createElement("canvas");
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
		caption.innerHTML = thx_core_Strings.humanize(name) + (minicanvas_MiniCanvas.displayGenerationTime?" <span class=\"info\">(" + thx_core_Floats.roundTo(this.deltaTime,2) + "ms)</span>":"");
		figure.appendChild(caption);
		minicanvas_BrowserCanvas.parentNode.appendChild(figure);
	}
	,init: function() {
		var _this = window.document;
		this.canvas = _this.createElement("canvas");
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
		if(stack.length == 0) return done();
		(stack.shift())();
		this.storeFrame();
		thx_core_Timer.delay((function(f,a1,a2) {
			return function() {
				f(a1,a2);
			};
		})($bind(this,this.resolveStack),stack,done),50);
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
		this.stack.push((function(f,x1,y1) {
			return function() {
				return f(x1,y1);
			};
		})(($_=this.mini,$bind($_,$_.click)),x,y));
		return this;
	}
	,down: function(x,y) {
		if(this.x != x || this.y != y) this.move(x,y);
		this.stack.push((function(f,x1,y1) {
			return function() {
				return f(x1,y1);
			};
		})(($_=this.mini,$bind($_,$_.down)),x,y));
		return this;
	}
	,frame: function(callback) {
		this.stack.push((function(f,a1) {
			return function() {
				f(a1);
			};
		})(callback,this.mini));
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
			dx = Math.round(thx_core_Floats.interpolate(step,this.x,x));
			dy = Math.round(thx_core_Floats.interpolate(step,this.y,y));
			this.stack.push((function(f,x1,y1) {
				return function() {
					return f(x1,y1);
				};
			})(($_=this.mini,$bind($_,$_.move)),dx,dy));
		}
		this.x = x;
		this.y = y;
		return this;
	}
	,up: function(x,y) {
		if(this.x != x || this.y != y) this.move(x,y);
		this.stack.push((function(f,x1,y1) {
			return function() {
				return f(x1,y1);
			};
		})(($_=this.mini,$bind($_,$_.up)),x,y));
		return this;
	}
	,sleep: function(frames) {
		var _g = 0;
		while(_g < frames) {
			var i = _g++;
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
			var i = _g++;
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
var thx_color__$CIELCh_CIELCh_$Impl_$ = {};
thx_color__$CIELCh_CIELCh_$Impl_$.__name__ = true;
thx_color__$CIELCh_CIELCh_$Impl_$.create = function(lightness,chroma,hue) {
	var channels = [lightness,chroma,thx_core_Floats.wrapCircular(hue,360)];
	return channels;
};
thx_color__$CIELCh_CIELCh_$Impl_$.fromFloats = function(arr) {
	thx_core_ArrayFloats.resize(arr,3);
	return thx_color__$CIELCh_CIELCh_$Impl_$.create(arr[0],arr[1],arr[2]);
};
thx_color__$CIELCh_CIELCh_$Impl_$.fromString = function(color) {
	var info = thx_color_parse_ColorParser.parseColor(color);
	if(null == info) return null;
	try {
		var _g = info.name;
		switch(_g) {
		case "cielch":
			return thx_color__$CIELCh_CIELCh_$Impl_$.fromFloats(thx_color_parse_ColorParser.getFloatChannels(info.channels,3,false));
		default:
			return null;
		}
	} catch( e ) {
		haxe_CallStack.lastException = e;
		if (e instanceof js__$Boot_HaxeError) e = e.val;
		return null;
	}
};
thx_color__$CIELCh_CIELCh_$Impl_$._new = function(channels) {
	return channels;
};
thx_color__$CIELCh_CIELCh_$Impl_$.analogous = function(this1,spread) {
	if(spread == null) spread = 30.0;
	var _0 = thx_color__$CIELCh_CIELCh_$Impl_$.rotate(this1,-spread);
	var _1 = thx_color__$CIELCh_CIELCh_$Impl_$.rotate(this1,spread);
	return { _0 : _0, _1 : _1};
};
thx_color__$CIELCh_CIELCh_$Impl_$.complement = function(this1) {
	return thx_color__$CIELCh_CIELCh_$Impl_$.rotate(this1,180);
};
thx_color__$CIELCh_CIELCh_$Impl_$.interpolate = function(this1,other,t) {
	var channels = [thx_core_Floats.interpolate(t,this1[0],other[0]),thx_core_Floats.interpolate(t,this1[1],other[1]),thx_core_Floats.interpolateAngle(t,this1[2],other[2],360)];
	return channels;
};
thx_color__$CIELCh_CIELCh_$Impl_$.rotate = function(this1,angle) {
	return thx_color__$CIELCh_CIELCh_$Impl_$.withHue(this1,this1[2] + angle);
};
thx_color__$CIELCh_CIELCh_$Impl_$.split = function(this1,spread) {
	if(spread == null) spread = 144.0;
	var _0 = thx_color__$CIELCh_CIELCh_$Impl_$.rotate(this1,-spread);
	var _1 = thx_color__$CIELCh_CIELCh_$Impl_$.rotate(this1,spread);
	return { _0 : _0, _1 : _1};
};
thx_color__$CIELCh_CIELCh_$Impl_$.square = function(this1) {
	return thx_color__$CIELCh_CIELCh_$Impl_$.tetrad(this1,90);
};
thx_color__$CIELCh_CIELCh_$Impl_$.tetrad = function(this1,angle) {
	var _0 = thx_color__$CIELCh_CIELCh_$Impl_$.rotate(this1,0);
	var _1 = thx_color__$CIELCh_CIELCh_$Impl_$.rotate(this1,angle);
	var _2 = thx_color__$CIELCh_CIELCh_$Impl_$.rotate(this1,180);
	var _3 = thx_color__$CIELCh_CIELCh_$Impl_$.rotate(this1,180 + angle);
	return { _0 : _0, _1 : _1, _2 : _2, _3 : _3};
};
thx_color__$CIELCh_CIELCh_$Impl_$.triad = function(this1) {
	var _0 = thx_color__$CIELCh_CIELCh_$Impl_$.rotate(this1,-120);
	var _1 = thx_color__$CIELCh_CIELCh_$Impl_$.rotate(this1,0);
	var _2 = thx_color__$CIELCh_CIELCh_$Impl_$.rotate(this1,120);
	return { _0 : _0, _1 : _1, _2 : _2};
};
thx_color__$CIELCh_CIELCh_$Impl_$.withLightness = function(this1,newlightness) {
	return [newlightness,this1[1],this1[2]];
};
thx_color__$CIELCh_CIELCh_$Impl_$.withChroma = function(this1,newchroma) {
	return [this1[0],newchroma,this1[2]];
};
thx_color__$CIELCh_CIELCh_$Impl_$.withHue = function(this1,newhue) {
	var channels = [this1[0],this1[1],thx_core_Floats.wrapCircular(newhue,360)];
	return channels;
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
	thx_core_ArrayFloats.resize(arr,3);
	return thx_color__$CIELab_CIELab_$Impl_$.create(arr[0],arr[1],arr[2]);
};
thx_color__$CIELab_CIELab_$Impl_$.fromString = function(color) {
	var info = thx_color_parse_ColorParser.parseColor(color);
	if(null == info) return null;
	try {
		var _g = info.name;
		switch(_g) {
		case "cielab":
			return thx_color__$CIELab_CIELab_$Impl_$.fromFloats(thx_color_parse_ColorParser.getFloatChannels(info.channels,3,false));
		default:
			return null;
		}
	} catch( e ) {
		haxe_CallStack.lastException = e;
		if (e instanceof js__$Boot_HaxeError) e = e.val;
		return null;
	}
};
thx_color__$CIELab_CIELab_$Impl_$._new = function(channels) {
	return channels;
};
thx_color__$CIELab_CIELab_$Impl_$.distance = function(this1,other) {
	return (this1[0] - other[0]) * (this1[0] - other[0]) + (this1[1] - other[1]) * (this1[1] - other[1]) + (this1[2] - other[2]) * (this1[2] - other[2]);
};
thx_color__$CIELab_CIELab_$Impl_$.interpolate = function(this1,other,t) {
	var channels = [thx_core_Floats.interpolate(t,this1[0],other[0]),thx_core_Floats.interpolate(t,this1[1],other[1]),thx_core_Floats.interpolate(t,this1[2],other[2])];
	return channels;
};
thx_color__$CIELab_CIELab_$Impl_$.darker = function(this1,t) {
	var channels = [thx_core_Floats.interpolate(t,this1[0],0),this1[1],this1[2]];
	return channels;
};
thx_color__$CIELab_CIELab_$Impl_$.lighter = function(this1,t) {
	var channels = [thx_core_Floats.interpolate(t,this1[0],100),this1[1],this1[2]];
	return channels;
};
thx_color__$CIELab_CIELab_$Impl_$.match = function(this1,palette) {
	var it = palette;
	if(null == it) throw new thx_core_error_NullArgument("Iterable argument \"this\" cannot be null",{ fileName : "NullArgument.hx", lineNumber : 73, className : "thx.color._CIELab.CIELab_Impl_", methodName : "match"}); else if(!$iterator(it)().hasNext()) throw new thx_core_error_NullArgument("Iterable argument \"this\" cannot be empty",{ fileName : "NullArgument.hx", lineNumber : 75, className : "thx.color._CIELab.CIELab_Impl_", methodName : "match"});
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
	var h = thx_core_Floats.wrapCircular(Math.atan2(this1[2],this1[1]) * 180 / Math.PI,360);
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
	if(p > 0.008856) y = p; else y = (y - 0.137931034482758619) / 7.787;
	p = Math.pow(x,3);
	if(p > 0.008856) x = p; else x = (x - 0.137931034482758619) / 7.787;
	p = Math.pow(z,3);
	if(p > 0.008856) z = p; else z = (z - 0.137931034482758619) / 7.787;
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
	thx_core_ArrayFloats.resize(arr,3);
	return thx_color__$CMY_CMY_$Impl_$.create(arr[0],arr[1],arr[2]);
};
thx_color__$CMY_CMY_$Impl_$.fromString = function(color) {
	var info = thx_color_parse_ColorParser.parseColor(color);
	if(null == info) return null;
	try {
		var _g = info.name;
		switch(_g) {
		case "cmy":
			var channels = thx_color_parse_ColorParser.getFloatChannels(info.channels,3);
			return channels;
		default:
			return null;
		}
	} catch( e ) {
		haxe_CallStack.lastException = e;
		if (e instanceof js__$Boot_HaxeError) e = e.val;
		return null;
	}
};
thx_color__$CMY_CMY_$Impl_$._new = function(channels) {
	return channels;
};
thx_color__$CMY_CMY_$Impl_$.interpolate = function(this1,other,t) {
	var channels = [thx_core_Floats.interpolate(t,this1[0],other[0]),thx_core_Floats.interpolate(t,this1[1],other[1]),thx_core_Floats.interpolate(t,this1[2],other[2])];
	return channels;
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
	thx_core_ArrayFloats.resize(arr,4);
	return thx_color__$CMYK_CMYK_$Impl_$.create(arr[0],arr[1],arr[2],arr[3]);
};
thx_color__$CMYK_CMYK_$Impl_$.fromString = function(color) {
	var info = thx_color_parse_ColorParser.parseColor(color);
	if(null == info) return null;
	try {
		var _g = info.name;
		switch(_g) {
		case "cmyk":
			var channels = thx_color_parse_ColorParser.getFloatChannels(info.channels,4);
			return channels;
		default:
			return null;
		}
	} catch( e ) {
		haxe_CallStack.lastException = e;
		if (e instanceof js__$Boot_HaxeError) e = e.val;
		return null;
	}
};
thx_color__$CMYK_CMYK_$Impl_$._new = function(channels) {
	return channels;
};
thx_color__$CMYK_CMYK_$Impl_$.darker = function(this1,t) {
	var channels = [this1[0],this1[1],this1[2],thx_core_Floats.interpolate(t,this1[3],1)];
	return channels;
};
thx_color__$CMYK_CMYK_$Impl_$.lighter = function(this1,t) {
	var channels = [this1[0],this1[1],this1[2],thx_core_Floats.interpolate(t,this1[3],0)];
	return channels;
};
thx_color__$CMYK_CMYK_$Impl_$.interpolate = function(this1,other,t) {
	var channels = [thx_core_Floats.interpolate(t,this1[0],other[0]),thx_core_Floats.interpolate(t,this1[1],other[1]),thx_core_Floats.interpolate(t,this1[2],other[2]),thx_core_Floats.interpolate(t,this1[3],other[3])];
	return channels;
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
	try {
		var _g = info.name;
		switch(_g) {
		case "grey":case "gray":
			var grey = thx_color_parse_ColorParser.getFloatChannels(info.channels,1)[0];
			return grey;
		default:
			return null;
		}
	} catch( e ) {
		haxe_CallStack.lastException = e;
		if (e instanceof js__$Boot_HaxeError) e = e.val;
		return null;
	}
};
thx_color__$Grey_Grey_$Impl_$._new = function(grey) {
	return grey;
};
thx_color__$Grey_Grey_$Impl_$.contrast = function(this1) {
	if(this1 > 0.5) return thx_color__$Grey_Grey_$Impl_$.black; else return thx_color__$Grey_Grey_$Impl_$.white;
};
thx_color__$Grey_Grey_$Impl_$.darker = function(this1,t) {
	var grey = thx_core_Floats.interpolate(t,this1,0);
	return grey;
};
thx_color__$Grey_Grey_$Impl_$.lighter = function(this1,t) {
	var grey = thx_core_Floats.interpolate(t,this1,1);
	return grey;
};
thx_color__$Grey_Grey_$Impl_$.interpolate = function(this1,other,t) {
	var grey = thx_core_Floats.interpolate(t,this1,other);
	return grey;
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
	var channels = [thx_core_Floats.wrapCircular(hue,360),saturation < 0?0:saturation > 1?1:saturation,lightness < 0?0:lightness > 1?1:lightness];
	return channels;
};
thx_color__$HSL_HSL_$Impl_$.fromFloats = function(arr) {
	thx_core_ArrayFloats.resize(arr,3);
	return thx_color__$HSL_HSL_$Impl_$.create(arr[0],arr[1],arr[2]);
};
thx_color__$HSL_HSL_$Impl_$.fromString = function(color) {
	var info = thx_color_parse_ColorParser.parseColor(color);
	if(null == info) return null;
	try {
		var _g = info.name;
		switch(_g) {
		case "hsl":
			var channels = thx_color_parse_ColorParser.getFloatChannels(info.channels,3);
			return channels;
		default:
			return null;
		}
	} catch( e ) {
		haxe_CallStack.lastException = e;
		if (e instanceof js__$Boot_HaxeError) e = e.val;
		return null;
	}
};
thx_color__$HSL_HSL_$Impl_$._new = function(channels) {
	return channels;
};
thx_color__$HSL_HSL_$Impl_$.analogous = function(this1,spread) {
	if(spread == null) spread = 30.0;
	var _0 = thx_color__$HSL_HSL_$Impl_$.rotate(this1,-spread);
	var _1 = thx_color__$HSL_HSL_$Impl_$.rotate(this1,spread);
	return { _0 : _0, _1 : _1};
};
thx_color__$HSL_HSL_$Impl_$.complement = function(this1) {
	return thx_color__$HSL_HSL_$Impl_$.rotate(this1,180);
};
thx_color__$HSL_HSL_$Impl_$.darker = function(this1,t) {
	var channels = [this1[0],this1[1],thx_core_Floats.interpolate(t,this1[2],0)];
	return channels;
};
thx_color__$HSL_HSL_$Impl_$.lighter = function(this1,t) {
	var channels = [this1[0],this1[1],thx_core_Floats.interpolate(t,this1[2],1)];
	return channels;
};
thx_color__$HSL_HSL_$Impl_$.interpolate = function(this1,other,t) {
	var channels = [thx_core_Floats.interpolateAngle(t,this1[0],other[0],360),thx_core_Floats.interpolate(t,this1[1],other[1]),thx_core_Floats.interpolate(t,this1[2],other[2])];
	return channels;
};
thx_color__$HSL_HSL_$Impl_$.rotate = function(this1,angle) {
	return thx_color__$HSL_HSL_$Impl_$.withHue(this1,this1[0] + angle);
};
thx_color__$HSL_HSL_$Impl_$.split = function(this1,spread) {
	if(spread == null) spread = 144.0;
	var _0 = thx_color__$HSL_HSL_$Impl_$.rotate(this1,-spread);
	var _1 = thx_color__$HSL_HSL_$Impl_$.rotate(this1,spread);
	return { _0 : _0, _1 : _1};
};
thx_color__$HSL_HSL_$Impl_$.square = function(this1) {
	return thx_color__$HSL_HSL_$Impl_$.tetrad(this1,90);
};
thx_color__$HSL_HSL_$Impl_$.tetrad = function(this1,angle) {
	var _0 = thx_color__$HSL_HSL_$Impl_$.rotate(this1,0);
	var _1 = thx_color__$HSL_HSL_$Impl_$.rotate(this1,angle);
	var _2 = thx_color__$HSL_HSL_$Impl_$.rotate(this1,180);
	var _3 = thx_color__$HSL_HSL_$Impl_$.rotate(this1,180 + angle);
	return { _0 : _0, _1 : _1, _2 : _2, _3 : _3};
};
thx_color__$HSL_HSL_$Impl_$.triad = function(this1) {
	var _0 = thx_color__$HSL_HSL_$Impl_$.rotate(this1,-120);
	var _1 = thx_color__$HSL_HSL_$Impl_$.rotate(this1,0);
	var _2 = thx_color__$HSL_HSL_$Impl_$.rotate(this1,120);
	return { _0 : _0, _1 : _1, _2 : _2};
};
thx_color__$HSL_HSL_$Impl_$.withAlpha = function(this1,alpha) {
	var channels = this1.concat([alpha < 0?0:alpha > 1?1:alpha]);
	return channels;
};
thx_color__$HSL_HSL_$Impl_$.withHue = function(this1,newhue) {
	var channels = [thx_core_Floats.wrapCircular(newhue,360),this1[1],this1[2]];
	return channels;
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
	var channels = [thx_color__$HSL_HSL_$Impl_$._c(this1[0] + 120,this1[1],this1[2]),thx_color__$HSL_HSL_$Impl_$._c(this1[0],this1[1],this1[2]),thx_color__$HSL_HSL_$Impl_$._c(this1[0] - 120,this1[1],this1[2])];
	return channels;
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
	var m2;
	if(l <= 0.5) m2 = l * (1 + s); else m2 = l + s - l * s;
	var m1 = 2 * l - m2;
	d = thx_core_Floats.wrapCircular(d,360);
	if(d < 60) return m1 + (m2 - m1) * d / 60; else if(d < 180) return m2; else if(d < 240) return m1 + (m2 - m1) * (240 - d) / 60; else return m1;
};
var thx_color__$HSLA_HSLA_$Impl_$ = {};
thx_color__$HSLA_HSLA_$Impl_$.__name__ = true;
thx_color__$HSLA_HSLA_$Impl_$.create = function(hue,saturation,lightness,alpha) {
	var channels = [thx_core_Floats.wrapCircular(hue,360),saturation < 0?0:saturation > 1?1:saturation,lightness < 0?0:lightness > 1?1:lightness,alpha < 0?0:alpha > 1?1:alpha];
	return channels;
};
thx_color__$HSLA_HSLA_$Impl_$.fromFloats = function(arr) {
	thx_core_ArrayFloats.resize(arr,4);
	return thx_color__$HSLA_HSLA_$Impl_$.create(arr[0],arr[1],arr[2],arr[3]);
};
thx_color__$HSLA_HSLA_$Impl_$.fromString = function(color) {
	var info = thx_color_parse_ColorParser.parseColor(color);
	if(null == info) return null;
	try {
		var _g = info.name;
		switch(_g) {
		case "hsl":
			return thx_color__$HSL_HSL_$Impl_$.toHSLA((function($this) {
				var $r;
				var channels = thx_color_parse_ColorParser.getFloatChannels(info.channels,3);
				$r = channels;
				return $r;
			}(this)));
		case "hsla":
			var channels1 = thx_color_parse_ColorParser.getFloatChannels(info.channels,4);
			return channels1;
		default:
			return null;
		}
	} catch( e ) {
		haxe_CallStack.lastException = e;
		if (e instanceof js__$Boot_HaxeError) e = e.val;
		return null;
	}
};
thx_color__$HSLA_HSLA_$Impl_$._new = function(channels) {
	return channels;
};
thx_color__$HSLA_HSLA_$Impl_$.analogous = function(this1,spread) {
	if(spread == null) spread = 30.0;
	var _0 = thx_color__$HSLA_HSLA_$Impl_$.rotate(this1,-spread);
	var _1 = thx_color__$HSLA_HSLA_$Impl_$.rotate(this1,spread);
	return { _0 : _0, _1 : _1};
};
thx_color__$HSLA_HSLA_$Impl_$.complement = function(this1) {
	return thx_color__$HSLA_HSLA_$Impl_$.rotate(this1,180);
};
thx_color__$HSLA_HSLA_$Impl_$.darker = function(this1,t) {
	var channels = [this1[0],this1[1],thx_core_Floats.interpolate(t,this1[2],0),this1[3]];
	return channels;
};
thx_color__$HSLA_HSLA_$Impl_$.lighter = function(this1,t) {
	var channels = [this1[0],this1[1],thx_core_Floats.interpolate(t,this1[2],1),this1[3]];
	return channels;
};
thx_color__$HSLA_HSLA_$Impl_$.transparent = function(this1,t) {
	var channels = [this1[0],this1[1],this1[2],thx_core_Floats.interpolate(t,this1[3],0)];
	return channels;
};
thx_color__$HSLA_HSLA_$Impl_$.opaque = function(this1,t) {
	var channels = [this1[0],this1[1],this1[2],thx_core_Floats.interpolate(t,this1[3],1)];
	return channels;
};
thx_color__$HSLA_HSLA_$Impl_$.interpolate = function(this1,other,t) {
	var channels = [thx_core_Floats.interpolateAngle(t,this1[0],other[0]),thx_core_Floats.interpolate(t,this1[1],other[1]),thx_core_Floats.interpolate(t,this1[2],other[2]),thx_core_Floats.interpolate(t,this1[3],other[3])];
	return channels;
};
thx_color__$HSLA_HSLA_$Impl_$.rotate = function(this1,angle) {
	return thx_color__$HSLA_HSLA_$Impl_$.create(this1[0] + angle,this1[1],this1[2],this1[3]);
};
thx_color__$HSLA_HSLA_$Impl_$.split = function(this1,spread) {
	if(spread == null) spread = 150.0;
	var _0 = thx_color__$HSLA_HSLA_$Impl_$.rotate(this1,-spread);
	var _1 = thx_color__$HSLA_HSLA_$Impl_$.rotate(this1,spread);
	return { _0 : _0, _1 : _1};
};
thx_color__$HSLA_HSLA_$Impl_$.withAlpha = function(this1,newalpha) {
	return [this1[0],this1[1],this1[2],newalpha < 0?0:newalpha > 1?1:newalpha];
};
thx_color__$HSLA_HSLA_$Impl_$.withHue = function(this1,newhue) {
	var channels = [thx_core_Floats.wrapCircular(newhue,360),this1[1],this1[2],this1[3]];
	return channels;
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
	var channels = this1.slice(0,3);
	return channels;
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
	var channels = [thx_color__$HSLA_HSLA_$Impl_$._c(this1[0] + 120,this1[1],this1[2]),thx_color__$HSLA_HSLA_$Impl_$._c(this1[0],this1[1],this1[2]),thx_color__$HSLA_HSLA_$Impl_$._c(this1[0] - 120,this1[1],this1[2]),this1[3]];
	return channels;
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
	var m2;
	if(l <= 0.5) m2 = l * (1 + s); else m2 = l + s - l * s;
	var m1 = 2 * l - m2;
	d = thx_core_Floats.wrapCircular(d,360);
	if(d < 60) return m1 + (m2 - m1) * d / 60; else if(d < 180) return m2; else if(d < 240) return m1 + (m2 - m1) * (240 - d) / 60; else return m1;
};
var thx_color__$HSV_HSV_$Impl_$ = {};
thx_color__$HSV_HSV_$Impl_$.__name__ = true;
thx_color__$HSV_HSV_$Impl_$.create = function(hue,saturation,lightness) {
	var channels = [thx_core_Floats.wrapCircular(hue,360),saturation < 0?0:saturation > 1?1:saturation,lightness < 0?0:lightness > 1?1:lightness];
	return channels;
};
thx_color__$HSV_HSV_$Impl_$.fromFloats = function(arr) {
	thx_core_ArrayFloats.resize(arr,3);
	return thx_color__$HSV_HSV_$Impl_$.create(arr[0],arr[1],arr[2]);
};
thx_color__$HSV_HSV_$Impl_$.fromString = function(color) {
	var info = thx_color_parse_ColorParser.parseColor(color);
	if(null == info) return null;
	try {
		var _g = info.name;
		switch(_g) {
		case "hsv":
			var channels = thx_color_parse_ColorParser.getFloatChannels(info.channels,3);
			return channels;
		default:
			return null;
		}
	} catch( e ) {
		haxe_CallStack.lastException = e;
		if (e instanceof js__$Boot_HaxeError) e = e.val;
		return null;
	}
};
thx_color__$HSV_HSV_$Impl_$._new = function(channels) {
	return channels;
};
thx_color__$HSV_HSV_$Impl_$.analogous = function(this1,spread) {
	if(spread == null) spread = 30.0;
	var _0 = thx_color__$HSV_HSV_$Impl_$.rotate(this1,-spread);
	var _1 = thx_color__$HSV_HSV_$Impl_$.rotate(this1,spread);
	return { _0 : _0, _1 : _1};
};
thx_color__$HSV_HSV_$Impl_$.complement = function(this1) {
	return thx_color__$HSV_HSV_$Impl_$.rotate(this1,180);
};
thx_color__$HSV_HSV_$Impl_$.interpolate = function(this1,other,t) {
	var channels = [thx_core_Floats.interpolateAngle(t,this1[0],other[0]),thx_core_Floats.interpolate(t,this1[1],other[1]),thx_core_Floats.interpolate(t,this1[2],other[2])];
	return channels;
};
thx_color__$HSV_HSV_$Impl_$.rotate = function(this1,angle) {
	return thx_color__$HSV_HSV_$Impl_$.withHue(this1,this1[0] + angle);
};
thx_color__$HSV_HSV_$Impl_$.split = function(this1,spread) {
	if(spread == null) spread = 144.0;
	var _0 = thx_color__$HSV_HSV_$Impl_$.rotate(this1,-spread);
	var _1 = thx_color__$HSV_HSV_$Impl_$.rotate(this1,spread);
	return { _0 : _0, _1 : _1};
};
thx_color__$HSV_HSV_$Impl_$.square = function(this1) {
	return thx_color__$HSV_HSV_$Impl_$.tetrad(this1,90);
};
thx_color__$HSV_HSV_$Impl_$.tetrad = function(this1,angle) {
	var _0 = thx_color__$HSV_HSV_$Impl_$.rotate(this1,0);
	var _1 = thx_color__$HSV_HSV_$Impl_$.rotate(this1,angle);
	var _2 = thx_color__$HSV_HSV_$Impl_$.rotate(this1,180);
	var _3 = thx_color__$HSV_HSV_$Impl_$.rotate(this1,180 + angle);
	return { _0 : _0, _1 : _1, _2 : _2, _3 : _3};
};
thx_color__$HSV_HSV_$Impl_$.triad = function(this1) {
	var _0 = thx_color__$HSV_HSV_$Impl_$.rotate(this1,-120);
	var _1 = thx_color__$HSV_HSV_$Impl_$.rotate(this1,0);
	var _2 = thx_color__$HSV_HSV_$Impl_$.rotate(this1,120);
	return { _0 : _0, _1 : _1, _2 : _2};
};
thx_color__$HSV_HSV_$Impl_$.withAlpha = function(this1,alpha) {
	var channels = this1.concat([alpha < 0?0:alpha > 1?1:alpha]);
	return channels;
};
thx_color__$HSV_HSV_$Impl_$.withHue = function(this1,newhue) {
	var channels = [thx_core_Floats.wrapCircular(newhue,360),this1[1],this1[2]];
	return channels;
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
	var channels = [thx_core_Floats.wrapCircular(hue,360),saturation < 0?0:saturation > 1?1:saturation,value < 0?0:value > 1?1:value,alpha < 0?0:alpha > 1?1:alpha];
	return channels;
};
thx_color__$HSVA_HSVA_$Impl_$.fromFloats = function(arr) {
	thx_core_ArrayFloats.resize(arr,4);
	return thx_color__$HSVA_HSVA_$Impl_$.create(arr[0],arr[1],arr[2],arr[3]);
};
thx_color__$HSVA_HSVA_$Impl_$.fromString = function(color) {
	var info = thx_color_parse_ColorParser.parseColor(color);
	if(null == info) return null;
	try {
		var _g = info.name;
		switch(_g) {
		case "hsv":
			return thx_color__$HSV_HSV_$Impl_$.toHSVA((function($this) {
				var $r;
				var channels = thx_color_parse_ColorParser.getFloatChannels(info.channels,3);
				$r = channels;
				return $r;
			}(this)));
		case "hsva":
			var channels1 = thx_color_parse_ColorParser.getFloatChannels(info.channels,4);
			return channels1;
		default:
			return null;
		}
	} catch( e ) {
		haxe_CallStack.lastException = e;
		if (e instanceof js__$Boot_HaxeError) e = e.val;
		return null;
	}
};
thx_color__$HSVA_HSVA_$Impl_$._new = function(channels) {
	return channels;
};
thx_color__$HSVA_HSVA_$Impl_$.analogous = function(this1,spread) {
	if(spread == null) spread = 30.0;
	var _0 = thx_color__$HSVA_HSVA_$Impl_$.rotate(this1,-spread);
	var _1 = thx_color__$HSVA_HSVA_$Impl_$.rotate(this1,spread);
	return { _0 : _0, _1 : _1};
};
thx_color__$HSVA_HSVA_$Impl_$.complement = function(this1) {
	return thx_color__$HSVA_HSVA_$Impl_$.rotate(this1,180);
};
thx_color__$HSVA_HSVA_$Impl_$.transparent = function(this1,t) {
	var channels = [this1[0],this1[1],this1[2],thx_core_Floats.interpolate(t,this1[3],0)];
	return channels;
};
thx_color__$HSVA_HSVA_$Impl_$.opaque = function(this1,t) {
	var channels = [this1[0],this1[1],this1[2],thx_core_Floats.interpolate(t,this1[3],1)];
	return channels;
};
thx_color__$HSVA_HSVA_$Impl_$.interpolate = function(this1,other,t) {
	var channels = [thx_core_Floats.interpolateAngle(t,this1[0],other[0]),thx_core_Floats.interpolate(t,this1[1],other[1]),thx_core_Floats.interpolate(t,this1[2],other[2]),thx_core_Floats.interpolate(t,this1[3],other[3])];
	return channels;
};
thx_color__$HSVA_HSVA_$Impl_$.rotate = function(this1,angle) {
	return thx_color__$HSVA_HSVA_$Impl_$.create(this1[0] + angle,this1[1],this1[2],this1[3]);
};
thx_color__$HSVA_HSVA_$Impl_$.split = function(this1,spread) {
	if(spread == null) spread = 150.0;
	var _0 = thx_color__$HSVA_HSVA_$Impl_$.rotate(this1,-spread);
	var _1 = thx_color__$HSVA_HSVA_$Impl_$.rotate(this1,spread);
	return { _0 : _0, _1 : _1};
};
thx_color__$HSVA_HSVA_$Impl_$.withAlpha = function(this1,newalpha) {
	return [this1[0],this1[1],this1[2],newalpha < 0?0:newalpha > 1?1:newalpha];
};
thx_color__$HSVA_HSVA_$Impl_$.withHue = function(this1,newhue) {
	var channels = [thx_core_Floats.wrapCircular(newhue,360),this1[1],this1[2],this1[3]];
	return channels;
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
	var channels = this1.slice(0,3);
	return channels;
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
	try {
		var _g = info.name;
		switch(_g) {
		case "rgb":
			return thx_color__$RGB_RGB_$Impl_$.fromInts(thx_color_parse_ColorParser.getInt8Channels(info.channels,3));
		default:
			return null;
		}
	} catch( e ) {
		haxe_CallStack.lastException = e;
		if (e instanceof js__$Boot_HaxeError) e = e.val;
		return null;
	}
};
thx_color__$RGB_RGB_$Impl_$.fromInts = function(arr) {
	thx_core_ArrayInts.resize(arr,3);
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
	var ints = thx_core_ArrayFloats.resize(arr,4).map(function(_) {
		return Math.round(_ * 255);
	});
	return thx_color__$RGBA_RGBA_$Impl_$.create(ints[0],ints[1],ints[2],ints[3]);
};
thx_color__$RGBA_RGBA_$Impl_$.fromInt = function(rgba) {
	return rgba;
};
thx_color__$RGBA_RGBA_$Impl_$.fromInts = function(arr) {
	thx_core_ArrayInts.resize(arr,4);
	return thx_color__$RGBA_RGBA_$Impl_$.create(arr[0],arr[1],arr[2],arr[3]);
};
thx_color__$RGBA_RGBA_$Impl_$.fromString = function(color) {
	var info = thx_color_parse_ColorParser.parseHex(color);
	if(null == info) info = thx_color_parse_ColorParser.parseColor(color);
	if(null == info) return null;
	try {
		var _g = info.name;
		switch(_g) {
		case "rgb":
			return thx_color__$RGB_RGB_$Impl_$.toRGBA(thx_color__$RGB_RGB_$Impl_$.fromInts(thx_color_parse_ColorParser.getInt8Channels(info.channels,3)));
		case "rgba":
			return thx_color__$RGBA_RGBA_$Impl_$.create(thx_color_parse_ColorParser.getInt8Channel(info.channels[0]),thx_color_parse_ColorParser.getInt8Channel(info.channels[1]),thx_color_parse_ColorParser.getInt8Channel(info.channels[2]),Math.round(thx_color_parse_ColorParser.getFloatChannel(info.channels[3]) * 255));
		default:
			return null;
		}
	} catch( e ) {
		haxe_CallStack.lastException = e;
		if (e instanceof js__$Boot_HaxeError) e = e.val;
		return null;
	}
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
	thx_core_ArrayFloats.resize(arr,3);
	return thx_color__$RGBX_RGBX_$Impl_$.create(arr[0],arr[1],arr[2]);
};
thx_color__$RGBX_RGBX_$Impl_$.fromInts = function(arr) {
	thx_core_ArrayInts.resize(arr,3);
	return thx_color__$RGBX_RGBX_$Impl_$.create(arr[0] / 255,arr[1] / 255,arr[2] / 255);
};
thx_color__$RGBX_RGBX_$Impl_$.fromString = function(color) {
	var info = thx_color_parse_ColorParser.parseHex(color);
	if(null == info) info = thx_color_parse_ColorParser.parseColor(color);
	if(null == info) return null;
	try {
		var _g = info.name;
		switch(_g) {
		case "rgb":
			return thx_color__$RGBX_RGBX_$Impl_$.fromFloats(thx_color_parse_ColorParser.getFloatChannels(info.channels,3));
		default:
			return null;
		}
	} catch( e ) {
		haxe_CallStack.lastException = e;
		if (e instanceof js__$Boot_HaxeError) e = e.val;
		return null;
	}
};
thx_color__$RGBX_RGBX_$Impl_$._new = function(channels) {
	return channels;
};
thx_color__$RGBX_RGBX_$Impl_$.darker = function(this1,t) {
	var channels = [thx_core_Floats.interpolate(t,this1[0],0),thx_core_Floats.interpolate(t,this1[1],0),thx_core_Floats.interpolate(t,this1[2],0)];
	return channels;
};
thx_color__$RGBX_RGBX_$Impl_$.lighter = function(this1,t) {
	var channels = [thx_core_Floats.interpolate(t,this1[0],1),thx_core_Floats.interpolate(t,this1[1],1),thx_core_Floats.interpolate(t,this1[2],1)];
	return channels;
};
thx_color__$RGBX_RGBX_$Impl_$.interpolate = function(this1,other,t) {
	var channels = [thx_core_Floats.interpolate(t,this1[0],other[0]),thx_core_Floats.interpolate(t,this1[1],other[1]),thx_core_Floats.interpolate(t,this1[2],other[2])];
	return channels;
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
	var channels = this1.concat([alpha < 0?0:alpha > 1?1:alpha]);
	return channels;
};
thx_color__$RGBX_RGBX_$Impl_$.withRed = function(this1,newred) {
	var channels = [newred < 0?0:newred > 1?1:newred,thx_color__$RGBX_RGBX_$Impl_$.get_green(this1),thx_color__$RGBX_RGBX_$Impl_$.get_blue(this1)];
	return channels;
};
thx_color__$RGBX_RGBX_$Impl_$.withGreen = function(this1,newgreen) {
	var channels = [thx_color__$RGBX_RGBX_$Impl_$.get_red(this1),newgreen < 0?0:newgreen > 1?1:newgreen,thx_color__$RGBX_RGBX_$Impl_$.get_blue(this1)];
	return channels;
};
thx_color__$RGBX_RGBX_$Impl_$.withBlue = function(this1,newblue) {
	var channels = [thx_color__$RGBX_RGBX_$Impl_$.get_red(this1),thx_color__$RGBX_RGBX_$Impl_$.get_green(this1),newblue < 0?0:newblue > 1?1:newblue];
	return channels;
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
	var grey = Math.pow(this1[0],2) * .241 + Math.pow(this1[1],2) * .691 + Math.pow(this1[2],2) * .068;
	return grey;
};
thx_color__$RGBX_RGBX_$Impl_$.toHSL = function(this1) {
	var min = Math.min(Math.min(this1[0],this1[1]),this1[2]);
	var max = Math.max(Math.max(this1[0],this1[1]),this1[2]);
	var delta = max - min;
	var h;
	var s;
	var l = (max + min) / 2;
	if(delta == 0.0) s = h = 0.0; else {
		if(l < 0.5) s = delta / (max + min); else s = delta / (2 - max - min);
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
	var v = max;
	if(delta != 0) s = delta / max; else {
		s = 0;
		h = -1;
		return [h,s,v];
	}
	if(this1[0] == max) h = (this1[1] - this1[2]) / delta; else if(this1[1] == max) h = 2 + (this1[2] - this1[0]) / delta; else h = 4 + (this1[0] - this1[1]) / delta;
	h *= 60;
	if(h < 0) h += 360;
	return [h,s,v];
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
	thx_core_ArrayFloats.resize(arr,4);
	return thx_color__$RGBXA_RGBXA_$Impl_$.create(arr[0],arr[1],arr[2],arr[3]);
};
thx_color__$RGBXA_RGBXA_$Impl_$.fromInts = function(arr) {
	thx_core_ArrayInts.resize(arr,4);
	return thx_color__$RGBXA_RGBXA_$Impl_$.create(arr[0] / 255,arr[1] / 255,arr[2] / 255,arr[3] / 255);
};
thx_color__$RGBXA_RGBXA_$Impl_$.fromString = function(color) {
	var info = thx_color_parse_ColorParser.parseHex(color);
	if(null == info) info = thx_color_parse_ColorParser.parseColor(color);
	if(null == info) return null;
	try {
		var _g = info.name;
		switch(_g) {
		case "rgb":
			return thx_color__$RGBX_RGBX_$Impl_$.toRGBXA(thx_color__$RGBX_RGBX_$Impl_$.fromFloats(thx_color_parse_ColorParser.getFloatChannels(info.channels,3)));
		case "rgba":
			return thx_color__$RGBXA_RGBXA_$Impl_$.fromFloats(thx_color_parse_ColorParser.getFloatChannels(info.channels,4));
		default:
			return null;
		}
	} catch( e ) {
		haxe_CallStack.lastException = e;
		if (e instanceof js__$Boot_HaxeError) e = e.val;
		return null;
	}
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
	var channels = [this1[0],this1[1],this1[2],thx_core_Ints.interpolate(t,this1[3],0)];
	return channels;
};
thx_color__$RGBXA_RGBXA_$Impl_$.opaque = function(this1,t) {
	var channels = [this1[0],this1[1],this1[2],thx_core_Ints.interpolate(t,this1[3],1)];
	return channels;
};
thx_color__$RGBXA_RGBXA_$Impl_$.interpolate = function(this1,other,t) {
	var channels = [thx_core_Ints.interpolate(t,this1[0],other[0]),thx_core_Ints.interpolate(t,this1[1],other[1]),thx_core_Ints.interpolate(t,this1[2],other[2]),thx_core_Ints.interpolate(t,this1[3],other[3])];
	return channels;
};
thx_color__$RGBXA_RGBXA_$Impl_$.withAlpha = function(this1,newalpha) {
	var channels = [thx_color__$RGBXA_RGBXA_$Impl_$.get_red(this1),thx_color__$RGBXA_RGBXA_$Impl_$.get_green(this1),thx_color__$RGBXA_RGBXA_$Impl_$.get_blue(this1),newalpha < 0?0:newalpha > 1?1:newalpha];
	return channels;
};
thx_color__$RGBXA_RGBXA_$Impl_$.withRed = function(this1,newred) {
	var channels = [newred < 0?0:newred > 1?1:newred,thx_color__$RGBXA_RGBXA_$Impl_$.get_green(this1),thx_color__$RGBXA_RGBXA_$Impl_$.get_blue(this1),thx_color__$RGBXA_RGBXA_$Impl_$.get_alpha(this1)];
	return channels;
};
thx_color__$RGBXA_RGBXA_$Impl_$.withGreen = function(this1,newgreen) {
	var channels = [thx_color__$RGBXA_RGBXA_$Impl_$.get_red(this1),newgreen < 0?0:newgreen > 1?1:newgreen,thx_color__$RGBXA_RGBXA_$Impl_$.get_blue(this1),thx_color__$RGBXA_RGBXA_$Impl_$.get_alpha(this1)];
	return channels;
};
thx_color__$RGBXA_RGBXA_$Impl_$.withBlue = function(this1,newblue) {
	var channels = [thx_color__$RGBXA_RGBXA_$Impl_$.get_red(this1),thx_color__$RGBXA_RGBXA_$Impl_$.get_green(this1),newblue < 0?0:newblue > 1?1:newblue,thx_color__$RGBXA_RGBXA_$Impl_$.get_alpha(this1)];
	return channels;
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
	var channels = this1.slice(0,3);
	return channels;
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
	thx_core_ArrayFloats.resize(arr,3);
	return thx_color__$XYZ_XYZ_$Impl_$.create(arr[0],arr[1],arr[2]);
};
thx_color__$XYZ_XYZ_$Impl_$.fromString = function(color) {
	var info = thx_color_parse_ColorParser.parseColor(color);
	if(null == info) return null;
	try {
		var _g = info.name;
		switch(_g) {
		case "ciexyz":case "xyz":
			var channels = thx_color_parse_ColorParser.getFloatChannels(info.channels,3);
			return channels;
		default:
			return null;
		}
	} catch( e ) {
		haxe_CallStack.lastException = e;
		if (e instanceof js__$Boot_HaxeError) e = e.val;
		return null;
	}
};
thx_color__$XYZ_XYZ_$Impl_$._new = function(channels) {
	return channels;
};
thx_color__$XYZ_XYZ_$Impl_$.interpolate = function(this1,other,t) {
	var channels = [thx_core_Floats.interpolate(t,this1[0],other[0]),thx_core_Floats.interpolate(t,this1[1],other[1]),thx_core_Floats.interpolate(t,this1[2],other[2])];
	return channels;
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
	var p;
	if(x > 0.008856) x = Math.pow(x,0.333333333333333315); else x = 7.787 * x + 0.137931034482758619;
	if(y > 0.008856) y = Math.pow(y,0.333333333333333315); else y = 7.787 * y + 0.137931034482758619;
	if(z > 0.008856) z = Math.pow(z,0.333333333333333315); else z = 7.787 * z + 0.137931034482758619;
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
	if(r > 0.0031308) r = 1.055 * Math.pow(r,0.416666666666666685) - 0.055; else r = 12.92 * r;
	if(g > 0.0031308) g = 1.055 * Math.pow(g,0.416666666666666685) - 0.055; else g = 12.92 * g;
	if(b > 0.0031308) b = 1.055 * Math.pow(b,0.416666666666666685) - 0.055; else b = 12.92 * b;
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
	thx_core_ArrayFloats.resize(arr,3);
	return thx_color__$Yxy_Yxy_$Impl_$.create(arr[0],arr[1],arr[2]);
};
thx_color__$Yxy_Yxy_$Impl_$.fromString = function(color) {
	var info = thx_color_parse_ColorParser.parseColor(color);
	if(null == info) return null;
	try {
		var _g = info.name;
		switch(_g) {
		case "yxy":
			var channels = thx_color_parse_ColorParser.getFloatChannels(info.channels,3);
			return channels;
		default:
			return null;
		}
	} catch( e ) {
		haxe_CallStack.lastException = e;
		if (e instanceof js__$Boot_HaxeError) e = e.val;
		return null;
	}
};
thx_color__$Yxy_Yxy_$Impl_$._new = function(channels) {
	return channels;
};
thx_color__$Yxy_Yxy_$Impl_$.interpolate = function(this1,other,t) {
	var channels = [thx_core_Floats.interpolate(t,this1[0],other[0]),thx_core_Floats.interpolate(t,this1[1],other[1]),thx_core_Floats.interpolate(t,this1[2],other[2])];
	return channels;
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
	return channels.map((function(f,a2) {
		return function(a1) {
			return f(a1,a2);
		};
	})(thx_color_parse_ColorParser.getFloatChannel,useInt8));
};
thx_color_parse_ColorParser.getInt8Channels = function(channels,length) {
	if(length != channels.length) throw new js__$Boot_HaxeError("invalid number of channels, expected " + length + " but it is " + channels.length);
	return channels.map(thx_color_parse_ColorParser.getInt8Channel);
};
thx_color_parse_ColorParser.getFloatChannel = function(channel,useInt8) {
	if(useInt8 == null) useInt8 = true;
	switch(channel[1]) {
	case 5:
		var v = channel[2];
		if(v) return 1; else return 0;
		break;
	case 1:
		var v1 = channel[2];
		return v1;
	case 4:
		var v2 = channel[2];
		return v2;
	case 2:
		var v3 = channel[2];
		return v3;
	case 3:
		var v4 = channel[2];
		if(useInt8) return v4 / 255; else {
			var v5 = channel[2];
			return v5;
		}
		break;
	case 0:
		var v6 = channel[2];
		return v6 / 100;
	}
};
thx_color_parse_ColorParser.getInt8Channel = function(channel) {
	switch(channel[1]) {
	case 5:
		var v = channel[2];
		if(v) return 1; else return 0;
		break;
	case 3:
		var v1 = channel[2];
		return v1;
	case 0:
		var v2 = channel[2];
		return Math.round(255 * v2 / 100);
	default:
		throw new js__$Boot_HaxeError("unable to extract a valid int8 value");
	}
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
		var s_channels;
		if(null == m2) s_channels = []; else s_channels = m2.split(",");
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
		try {
			switch(unit) {
			case "%":
				if(thx_core_Floats.canParse(value)) return thx_color_parse_ChannelInfo.CIPercent(thx_core_Floats.parse(value)); else return null;
				break;
			case "deg":
				if(thx_core_Floats.canParse(value)) return thx_color_parse_ChannelInfo.CIDegree(thx_core_Floats.parse(value)); else return null;
				break;
			case "DEG":
				if(thx_core_Floats.canParse(value)) return thx_color_parse_ChannelInfo.CIDegree(thx_core_Floats.parse(value)); else return null;
				break;
			case "rad":
				if(thx_core_Floats.canParse(value)) return thx_color_parse_ChannelInfo.CIDegree(thx_core_Floats.parse(value) * 180 / Math.PI); else return null;
				break;
			case "RAD":
				if(thx_core_Floats.canParse(value)) return thx_color_parse_ChannelInfo.CIDegree(thx_core_Floats.parse(value) * 180 / Math.PI); else return null;
				break;
			case "":
				if(thx_core_Ints.canParse(value)) {
					var i = thx_core_Ints.parse(value);
					if(i == 0) return thx_color_parse_ChannelInfo.CIBool(false); else if(i == 1) return thx_color_parse_ChannelInfo.CIBool(true); else if(i < 256) return thx_color_parse_ChannelInfo.CIInt8(i); else return thx_color_parse_ChannelInfo.CIInt(i);
				} else if(thx_core_Floats.canParse(value)) return thx_color_parse_ChannelInfo.CIFloat(thx_core_Floats.parse(value)); else return null;
				break;
			default:
				return null;
			}
		} catch( e ) {
			haxe_CallStack.lastException = e;
			if (e instanceof js__$Boot_HaxeError) e = e.val;
			return null;
		}
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
thx_color_parse_ChannelInfo.CIPercent = function(value) { var $x = ["CIPercent",0,value]; $x.__enum__ = thx_color_parse_ChannelInfo; $x.toString = $estr; return $x; };
thx_color_parse_ChannelInfo.CIFloat = function(value) { var $x = ["CIFloat",1,value]; $x.__enum__ = thx_color_parse_ChannelInfo; $x.toString = $estr; return $x; };
thx_color_parse_ChannelInfo.CIDegree = function(value) { var $x = ["CIDegree",2,value]; $x.__enum__ = thx_color_parse_ChannelInfo; $x.toString = $estr; return $x; };
thx_color_parse_ChannelInfo.CIInt8 = function(value) { var $x = ["CIInt8",3,value]; $x.__enum__ = thx_color_parse_ChannelInfo; $x.toString = $estr; return $x; };
thx_color_parse_ChannelInfo.CIInt = function(value) { var $x = ["CIInt",4,value]; $x.__enum__ = thx_color_parse_ChannelInfo; $x.toString = $estr; return $x; };
thx_color_parse_ChannelInfo.CIBool = function(value) { var $x = ["CIBool",5,value]; $x.__enum__ = thx_color_parse_ChannelInfo; $x.toString = $estr; return $x; };
var thx_core_Arrays = function() { };
thx_core_Arrays.__name__ = true;
thx_core_Arrays.after = function(array,element) {
	return array.slice(HxOverrides.indexOf(array,element,0) + 1);
};
thx_core_Arrays.all = function(arr,predicate) {
	var _g = 0;
	while(_g < arr.length) {
		var item = arr[_g];
		++_g;
		if(!predicate(item)) return false;
	}
	return true;
};
thx_core_Arrays.any = function(arr,predicate) {
	var _g = 0;
	while(_g < arr.length) {
		var item = arr[_g];
		++_g;
		if(predicate(item)) return true;
	}
	return false;
};
thx_core_Arrays.at = function(arr,indexes) {
	return indexes.map(function(i) {
		return arr[i];
	});
};
thx_core_Arrays.before = function(array,element) {
	return array.slice(0,HxOverrides.indexOf(array,element,0));
};
thx_core_Arrays.compact = function(arr) {
	return arr.filter(function(v) {
		return null != v;
	});
};
thx_core_Arrays.contains = function(array,element,eq) {
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
thx_core_Arrays.cross = function(a,b) {
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
thx_core_Arrays.crossMulti = function(array) {
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
thx_core_Arrays.eachPair = function(array,callback) {
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
thx_core_Arrays.equals = function(a,b,equality) {
	if(a == null || b == null || a.length != b.length) return false;
	if(null == equality) equality = thx_core_Functions.equality;
	var _g1 = 0;
	var _g = a.length;
	while(_g1 < _g) {
		var i = _g1++;
		if(!equality(a[i],b[i])) return false;
	}
	return true;
};
thx_core_Arrays.extract = function(a,predicate) {
	var _g1 = 0;
	var _g = a.length;
	while(_g1 < _g) {
		var i = _g1++;
		if(predicate(a[i])) return a.splice(i,1)[0];
	}
	return null;
};
thx_core_Arrays.find = function(array,predicate) {
	var _g = 0;
	while(_g < array.length) {
		var item = array[_g];
		++_g;
		if(predicate(item)) return item;
	}
	return null;
};
thx_core_Arrays.findLast = function(array,predicate) {
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
thx_core_Arrays.first = function(array) {
	return array[0];
};
thx_core_Arrays.flatMap = function(array,callback) {
	return thx_core_Arrays.flatten(array.map(callback));
};
thx_core_Arrays.flatten = function(array) {
	return Array.prototype.concat.apply([],array);
};
thx_core_Arrays.from = function(array,element) {
	return array.slice(HxOverrides.indexOf(array,element,0));
};
thx_core_Arrays.head = function(array) {
	return array[0];
};
thx_core_Arrays.ifEmpty = function(value,alt) {
	if(null != value && 0 != value.length) return value; else return alt;
};
thx_core_Arrays.initial = function(array) {
	return array.slice(0,array.length - 1);
};
thx_core_Arrays.isEmpty = function(array) {
	return array.length == 0;
};
thx_core_Arrays.last = function(array) {
	return array[array.length - 1];
};
thx_core_Arrays.mapi = function(array,callback) {
	var r = [];
	var _g1 = 0;
	var _g = array.length;
	while(_g1 < _g) {
		var i = _g1++;
		r.push(callback(array[i],i));
	}
	return r;
};
thx_core_Arrays.mapRight = function(array,callback) {
	var i = array.length;
	var result = [];
	while(--i >= 0) result.push(callback(array[i]));
	return result;
};
thx_core_Arrays.order = function(array,sort) {
	var n = array.slice();
	n.sort(sort);
	return n;
};
thx_core_Arrays.pull = function(array,toRemove,equality) {
	var _g = 0;
	while(_g < toRemove.length) {
		var item = toRemove[_g];
		++_g;
		thx_core_Arrays.removeAll(array,item,equality);
	}
};
thx_core_Arrays.pushIf = function(array,condition,value) {
	if(condition) array.push(value);
	return array;
};
thx_core_Arrays.reduce = function(array,callback,initial) {
	return array.reduce(callback,initial);
};
thx_core_Arrays.resize = function(array,length,fill) {
	while(array.length < length) array.push(fill);
	array.splice(length,array.length - length);
	return array;
};
thx_core_Arrays.reducei = function(array,callback,initial) {
	return array.reduce(callback,initial);
};
thx_core_Arrays.reduceRight = function(array,callback,initial) {
	var i = array.length;
	while(--i >= 0) initial = callback(initial,array[i]);
	return initial;
};
thx_core_Arrays.removeAll = function(array,element,equality) {
	if(null == equality) equality = thx_core_Functions.equality;
	var i = array.length;
	while(--i >= 0) if(equality(array[i],element)) array.splice(i,1);
};
thx_core_Arrays.rest = function(array) {
	return array.slice(1);
};
thx_core_Arrays.sample = function(array,n) {
	n = thx_core_Ints.min(n,array.length);
	var copy = array.slice();
	var result = [];
	var _g = 0;
	while(_g < n) {
		var i = _g++;
		result.push(copy.splice(Std.random(copy.length),1)[0]);
	}
	return result;
};
thx_core_Arrays.sampleOne = function(array) {
	return array[Std.random(array.length)];
};
thx_core_Arrays.shuffle = function(a) {
	var t = thx_core_Ints.range(a.length);
	var array = [];
	while(t.length > 0) {
		var pos = Std.random(t.length);
		var index = t[pos];
		t.splice(pos,1);
		array.push(a[index]);
	}
	return array;
};
thx_core_Arrays.take = function(arr,n) {
	return arr.slice(0,n);
};
thx_core_Arrays.takeLast = function(arr,n) {
	return arr.slice(arr.length - n);
};
thx_core_Arrays.rotate = function(arr) {
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
thx_core_Arrays.zip = function(array1,array2) {
	var length = thx_core_Ints.min(array1.length,array2.length);
	var array = [];
	var _g = 0;
	while(_g < length) {
		var i = _g++;
		array.push({ _0 : array1[i], _1 : array2[i]});
	}
	return array;
};
thx_core_Arrays.zip3 = function(array1,array2,array3) {
	var length = thx_core_ArrayInts.min([array1.length,array2.length,array3.length]);
	var array = [];
	var _g = 0;
	while(_g < length) {
		var i = _g++;
		array.push({ _0 : array1[i], _1 : array2[i], _2 : array3[i]});
	}
	return array;
};
thx_core_Arrays.zip4 = function(array1,array2,array3,array4) {
	var length = thx_core_ArrayInts.min([array1.length,array2.length,array3.length,array4.length]);
	var array = [];
	var _g = 0;
	while(_g < length) {
		var i = _g++;
		array.push({ _0 : array1[i], _1 : array2[i], _2 : array3[i], _3 : array4[i]});
	}
	return array;
};
thx_core_Arrays.zip5 = function(array1,array2,array3,array4,array5) {
	var length = thx_core_ArrayInts.min([array1.length,array2.length,array3.length,array4.length,array5.length]);
	var array = [];
	var _g = 0;
	while(_g < length) {
		var i = _g++;
		array.push({ _0 : array1[i], _1 : array2[i], _2 : array3[i], _3 : array4[i], _4 : array5[i]});
	}
	return array;
};
thx_core_Arrays.unzip = function(array) {
	var a1 = [];
	var a2 = [];
	array.map(function(t) {
		a1.push(t._0);
		a2.push(t._1);
	});
	return { _0 : a1, _1 : a2};
};
thx_core_Arrays.unzip3 = function(array) {
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
thx_core_Arrays.unzip4 = function(array) {
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
thx_core_Arrays.unzip5 = function(array) {
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
var thx_core_ArrayFloats = function() { };
thx_core_ArrayFloats.__name__ = true;
thx_core_ArrayFloats.average = function(arr) {
	return thx_core_ArrayFloats.sum(arr) / arr.length;
};
thx_core_ArrayFloats.compact = function(arr) {
	return arr.filter(function(v) {
		return null != v && isFinite(v);
	});
};
thx_core_ArrayFloats.max = function(arr) {
	if(arr.length == 0) return null; else return arr.reduce(function(max,v) {
		if(v > max) return v; else return max;
	},arr[0]);
};
thx_core_ArrayFloats.min = function(arr) {
	if(arr.length == 0) return null; else return arr.reduce(function(min,v) {
		if(v < min) return v; else return min;
	},arr[0]);
};
thx_core_ArrayFloats.resize = function(array,length,fill) {
	if(fill == null) fill = 0.0;
	while(array.length < length) array.push(fill);
	array.splice(length,array.length - length);
	return array;
};
thx_core_ArrayFloats.sum = function(arr) {
	return arr.reduce(function(tot,v) {
		return tot + v;
	},0.0);
};
var thx_core_ArrayInts = function() { };
thx_core_ArrayInts.__name__ = true;
thx_core_ArrayInts.average = function(arr) {
	return thx_core_ArrayInts.sum(arr) / arr.length;
};
thx_core_ArrayInts.max = function(arr) {
	if(arr.length == 0) return null; else return arr.reduce(function(max,v) {
		if(v > max) return v; else return max;
	},arr[0]);
};
thx_core_ArrayInts.min = function(arr) {
	if(arr.length == 0) return null; else return arr.reduce(function(min,v) {
		if(v < min) return v; else return min;
	},arr[0]);
};
thx_core_ArrayInts.resize = function(array,length,fill) {
	if(fill == null) fill = 0;
	while(array.length < length) array.push(fill);
	array.splice(length,array.length - length);
	return array;
};
thx_core_ArrayInts.sum = function(arr) {
	return arr.reduce(function(tot,v) {
		return tot + v;
	},0);
};
var thx_core_ArrayStrings = function() { };
thx_core_ArrayStrings.__name__ = true;
thx_core_ArrayStrings.compact = function(arr) {
	return arr.filter(function(v) {
		return !thx_core_Strings.isEmpty(v);
	});
};
thx_core_ArrayStrings.max = function(arr) {
	if(arr.length == 0) return null; else return arr.reduce(function(max,v) {
		if(v > max) return v; else return max;
	},arr[0]);
};
thx_core_ArrayStrings.min = function(arr) {
	if(arr.length == 0) return null; else return arr.reduce(function(min,v) {
		if(v < min) return v; else return min;
	},arr[0]);
};
var thx_core_Error = function(message,stack,pos) {
	Error.call(this,message);
	this.message = message;
	if(null == stack) {
		try {
			stack = haxe_CallStack.exceptionStack();
		} catch( e ) {
			haxe_CallStack.lastException = e;
			if (e instanceof js__$Boot_HaxeError) e = e.val;
			stack = [];
		}
		if(stack.length == 0) try {
			stack = haxe_CallStack.callStack();
		} catch( e1 ) {
			haxe_CallStack.lastException = e1;
			if (e1 instanceof js__$Boot_HaxeError) e1 = e1.val;
			stack = [];
		}
	}
	this.stackItems = stack;
	this.pos = pos;
};
thx_core_Error.__name__ = true;
thx_core_Error.fromDynamic = function(err,pos) {
	if(js_Boot.__instanceof(err,thx_core_Error)) return err;
	return new thx_core_Error("" + Std.string(err),null,pos);
};
thx_core_Error.__super__ = Error;
thx_core_Error.prototype = $extend(Error.prototype,{
	toString: function() {
		return this.message + "\nfrom: " + this.pos.className + "." + this.pos.methodName + "() at " + this.pos.lineNumber + "\n\n" + haxe_CallStack.toString(this.stackItems);
	}
	,__class__: thx_core_Error
});
var thx_core_Floats = function() { };
thx_core_Floats.__name__ = true;
thx_core_Floats.angleDifference = function(a,b,turn) {
	if(turn == null) turn = 360;
	var r = (b - a) % turn;
	if(r < 0) r += turn;
	if(r > turn / 2) r -= turn;
	return r;
};
thx_core_Floats.ceilTo = function(f,decimals) {
	var p = Math.pow(10,decimals);
	return Math.ceil(f * p) / p;
};
thx_core_Floats.canParse = function(s) {
	return thx_core_Floats.pattern_parse.match(s);
};
thx_core_Floats.clamp = function(v,min,max) {
	if(v < min) return min; else if(v > max) return max; else return v;
};
thx_core_Floats.clampSym = function(v,max) {
	return thx_core_Floats.clamp(v,-max,max);
};
thx_core_Floats.compare = function(a,b) {
	if(a < b) return -1; else if(b > a) return 1; else return 0;
};
thx_core_Floats.floorTo = function(f,decimals) {
	var p = Math.pow(10,decimals);
	return Math.floor(f * p) / p;
};
thx_core_Floats.interpolate = function(f,a,b) {
	return (b - a) * f + a;
};
thx_core_Floats.interpolateAngle = function(f,a,b,turn) {
	if(turn == null) turn = 360;
	return thx_core_Floats.wrapCircular(thx_core_Floats.interpolate(f,a,a + thx_core_Floats.angleDifference(a,b,turn)),turn);
};
thx_core_Floats.interpolateAngleWidest = function(f,a,b,turn) {
	if(turn == null) turn = 360;
	return thx_core_Floats.wrapCircular(thx_core_Floats.interpolateAngle(f,a,b,turn) - turn / 2,turn);
};
thx_core_Floats.interpolateAngleCW = function(f,a,b,turn) {
	if(turn == null) turn = 360;
	a = thx_core_Floats.wrapCircular(a,turn);
	b = thx_core_Floats.wrapCircular(b,turn);
	if(b < a) b += turn;
	return thx_core_Floats.wrapCircular(thx_core_Floats.interpolate(f,a,b),turn);
};
thx_core_Floats.interpolateAngleCCW = function(f,a,b,turn) {
	if(turn == null) turn = 360;
	a = thx_core_Floats.wrapCircular(a,turn);
	b = thx_core_Floats.wrapCircular(b,turn);
	if(b > a) b -= turn;
	return thx_core_Floats.wrapCircular(thx_core_Floats.interpolate(f,a,b),turn);
};
thx_core_Floats.nearEquals = function(a,b) {
	return Math.abs(a - b) <= 10e-10;
};
thx_core_Floats.nearZero = function(n) {
	return Math.abs(n) <= 10e-10;
};
thx_core_Floats.normalize = function(v) {
	if(v < 0) return 0; else if(v > 1) return 1; else return v;
};
thx_core_Floats.parse = function(s) {
	if(s.substring(0,1) == "+") s = s.substring(1);
	return parseFloat(s);
};
thx_core_Floats.root = function(base,index) {
	return Math.pow(base,1 / index);
};
thx_core_Floats.roundTo = function(f,decimals) {
	var p = Math.pow(10,decimals);
	return Math.round(f * p) / p;
};
thx_core_Floats.sign = function(value) {
	if(value < 0) return -1; else return 1;
};
thx_core_Floats.wrap = function(v,min,max) {
	var range = max - min + 1;
	if(v < min) v += range * ((min - v) / range + 1);
	return min + (v - min) % range;
};
thx_core_Floats.wrapCircular = function(v,max) {
	v = v % max;
	if(v < 0) v += max;
	return v;
};
var thx_core_Functions0 = function() { };
thx_core_Functions0.__name__ = true;
thx_core_Functions0.after = function(callback,n) {
	return function() {
		if(--n == 0) callback();
	};
};
thx_core_Functions0.join = function(fa,fb) {
	return function() {
		fa();
		fb();
	};
};
thx_core_Functions0.once = function(f) {
	return function() {
		var t = f;
		f = thx_core_Functions.noop;
		t();
	};
};
thx_core_Functions0.negate = function(callback) {
	return function() {
		return !callback();
	};
};
thx_core_Functions0.times = function(n,callback) {
	return function() {
		return thx_core_Ints.range(n).map(function(_) {
			return callback();
		});
	};
};
thx_core_Functions0.timesi = function(n,callback) {
	return function() {
		return thx_core_Ints.range(n).map(function(i) {
			return callback(i);
		});
	};
};
var thx_core_Functions1 = function() { };
thx_core_Functions1.__name__ = true;
thx_core_Functions1.compose = function(fa,fb) {
	return function(v) {
		return fa(fb(v));
	};
};
thx_core_Functions1.join = function(fa,fb) {
	return function(v) {
		fa(v);
		fb(v);
	};
};
thx_core_Functions1.memoize = function(callback,resolver) {
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
thx_core_Functions1.negate = function(callback) {
	return function(v) {
		return !callback(v);
	};
};
thx_core_Functions1.noop = function(_) {
};
thx_core_Functions1.times = function(n,callback) {
	return function(value) {
		return thx_core_Ints.range(n).map(function(_) {
			return callback(value);
		});
	};
};
thx_core_Functions1.timesi = function(n,callback) {
	return function(value) {
		return thx_core_Ints.range(n).map(function(i) {
			return callback(value,i);
		});
	};
};
thx_core_Functions1.swapArguments = function(callback) {
	return function(a2,a1) {
		return callback(a1,a2);
	};
};
var thx_core_Functions2 = function() { };
thx_core_Functions2.__name__ = true;
thx_core_Functions2.memoize = function(callback,resolver) {
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
thx_core_Functions2.negate = function(callback) {
	return function(v1,v2) {
		return !callback(v1,v2);
	};
};
var thx_core_Functions3 = function() { };
thx_core_Functions3.__name__ = true;
thx_core_Functions3.memoize = function(callback,resolver) {
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
thx_core_Functions3.negate = function(callback) {
	return function(v1,v2,v3) {
		return !callback(v1,v2,v3);
	};
};
var thx_core_Functions = function() { };
thx_core_Functions.__name__ = true;
thx_core_Functions.constant = function(v) {
	return function() {
		return v;
	};
};
thx_core_Functions.equality = function(a,b) {
	return a == b;
};
thx_core_Functions.identity = function(value) {
	return value;
};
thx_core_Functions.noop = function() {
};
var thx_core_Ints = function() { };
thx_core_Ints.__name__ = true;
thx_core_Ints.abs = function(v) {
	if(v < 0) return -v; else return v;
};
thx_core_Ints.canParse = function(s) {
	return thx_core_Ints.pattern_parse.match(s);
};
thx_core_Ints.clamp = function(v,min,max) {
	if(v < min) return min; else if(v > max) return max; else return v;
};
thx_core_Ints.clampSym = function(v,max) {
	return thx_core_Ints.clamp(v,-max,max);
};
thx_core_Ints.compare = function(a,b) {
	return a - b;
};
thx_core_Ints.interpolate = function(f,a,b) {
	return Math.round(a + (b - a) * f);
};
thx_core_Ints.isEven = function(v) {
	return v % 2 == 0;
};
thx_core_Ints.isOdd = function(v) {
	return v % 2 != 0;
};
thx_core_Ints.max = function(a,b) {
	if(a > b) return a; else return b;
};
thx_core_Ints.min = function(a,b) {
	if(a < b) return a; else return b;
};
thx_core_Ints.parse = function(s,base) {
	var v = parseInt(s,base);
	if(isNaN(v)) return null; else return v;
};
thx_core_Ints.random = function(min,max) {
	if(min == null) min = 0;
	return Std.random(max + 1) + min;
};
thx_core_Ints.range = function(start,stop,step) {
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
thx_core_Ints.toString = function(value,base) {
	return value.toString(base);
};
thx_core_Ints.sign = function(value) {
	if(value < 0) return -1; else return 1;
};
thx_core_Ints.wrapCircular = function(v,max) {
	v = v % max;
	if(v < 0) v += max;
	return v;
};
var thx_core_Nil = { __ename__ : true, __constructs__ : ["nil"] };
thx_core_Nil.nil = ["nil",0];
thx_core_Nil.nil.toString = $estr;
thx_core_Nil.nil.__enum__ = thx_core_Nil;
var thx_core_Nulls = function() { };
thx_core_Nulls.__name__ = true;
var thx_core_Strings = function() { };
thx_core_Strings.__name__ = true;
thx_core_Strings.after = function(value,searchFor) {
	var pos = value.indexOf(searchFor);
	if(pos < 0) return ""; else return value.substring(pos + searchFor.length);
};
thx_core_Strings.capitalize = function(s) {
	return s.substring(0,1).toUpperCase() + s.substring(1);
};
thx_core_Strings.capitalizeWords = function(value,whiteSpaceOnly) {
	if(whiteSpaceOnly == null) whiteSpaceOnly = false;
	if(whiteSpaceOnly) return thx_core_Strings.UCWORDSWS.map(value.substring(0,1).toUpperCase() + value.substring(1),thx_core_Strings.upperMatch); else return thx_core_Strings.UCWORDS.map(value.substring(0,1).toUpperCase() + value.substring(1),thx_core_Strings.upperMatch);
};
thx_core_Strings.collapse = function(value) {
	return thx_core_Strings.WSG.replace(StringTools.trim(value)," ");
};
thx_core_Strings.compare = function(a,b) {
	if(a < b) return -1; else if(a > b) return 1; else return 0;
};
thx_core_Strings.contains = function(s,test) {
	return s.indexOf(test) >= 0;
};
thx_core_Strings.dasherize = function(s) {
	return StringTools.replace(s,"_","-");
};
thx_core_Strings.ellipsis = function(s,maxlen,symbol) {
	if(symbol == null) symbol = "...";
	if(maxlen == null) maxlen = 20;
	if(s.length > maxlen) return s.substring(0,symbol.length > maxlen - symbol.length?symbol.length:maxlen - symbol.length) + symbol; else return s;
};
thx_core_Strings.filter = function(s,predicate) {
	return s.split("").filter(predicate).join("");
};
thx_core_Strings.filterCharcode = function(s,predicate) {
	return thx_core_Strings.toCharcodeArray(s).filter(predicate).map(function(i) {
		return String.fromCharCode(i);
	}).join("");
};
thx_core_Strings.from = function(value,searchFor) {
	var pos = value.indexOf(searchFor);
	if(pos < 0) return ""; else return value.substring(pos);
};
thx_core_Strings.humanize = function(s) {
	return StringTools.replace(thx_core_Strings.underscore(s),"_"," ");
};
thx_core_Strings.isAlphaNum = function(value) {
	return thx_core_Strings.ALPHANUM.match(value);
};
thx_core_Strings.isLowerCase = function(value) {
	return value.toLowerCase() == value;
};
thx_core_Strings.isUpperCase = function(value) {
	return value.toUpperCase() == value;
};
thx_core_Strings.ifEmpty = function(value,alt) {
	if(null != value && "" != value) return value; else return alt;
};
thx_core_Strings.isDigitsOnly = function(value) {
	return thx_core_Strings.DIGITS.match(value);
};
thx_core_Strings.isEmpty = function(value) {
	return value == null || value == "";
};
thx_core_Strings.iterator = function(s) {
	var _this = s.split("");
	return HxOverrides.iter(_this);
};
thx_core_Strings.map = function(value,callback) {
	return value.split("").map(callback);
};
thx_core_Strings.remove = function(value,toremove) {
	return StringTools.replace(value,toremove,"");
};
thx_core_Strings.removeAfter = function(value,toremove) {
	if(StringTools.endsWith(value,toremove)) return value.substring(0,value.length - toremove.length); else return value;
};
thx_core_Strings.removeBefore = function(value,toremove) {
	if(StringTools.startsWith(value,toremove)) return value.substring(toremove.length); else return value;
};
thx_core_Strings.repeat = function(s,times) {
	return ((function($this) {
		var $r;
		var _g = [];
		{
			var _g1 = 0;
			while(_g1 < times) {
				var i = _g1++;
				_g.push(s);
			}
		}
		$r = _g;
		return $r;
	}(this))).join("");
};
thx_core_Strings.reverse = function(s) {
	var arr = s.split("");
	arr.reverse();
	return arr.join("");
};
thx_core_Strings.stripTags = function(s) {
	return thx_core_Strings.STRIPTAGS.replace(s,"");
};
thx_core_Strings.surround = function(s,left,right) {
	return "" + left + s + (null == right?left:right);
};
thx_core_Strings.toArray = function(s) {
	return s.split("");
};
thx_core_Strings.toCharcodeArray = function(s) {
	return thx_core_Strings.map(s,function(s1) {
		return HxOverrides.cca(s1,0);
	});
};
thx_core_Strings.toChunks = function(s,len) {
	var chunks = [];
	while(s.length > 0) {
		chunks.push(s.substring(0,len));
		s = s.substring(len);
	}
	return chunks;
};
thx_core_Strings.trimChars = function(value,charlist) {
	return thx_core_Strings.trimCharsRight(thx_core_Strings.trimCharsLeft(value,charlist),charlist);
};
thx_core_Strings.trimCharsLeft = function(value,charlist) {
	var pos = 0;
	var _g1 = 0;
	var _g = value.length;
	while(_g1 < _g) {
		var i = _g1++;
		if(thx_core_Strings.contains(charlist,value.charAt(i))) pos++; else break;
	}
	return value.substring(pos);
};
thx_core_Strings.trimCharsRight = function(value,charlist) {
	var len = value.length;
	var pos = len;
	var i;
	var _g = 0;
	while(_g < len) {
		var j = _g++;
		i = len - j - 1;
		if(thx_core_Strings.contains(charlist,value.charAt(i))) pos = i; else break;
	}
	return value.substring(0,pos);
};
thx_core_Strings.underscore = function(s) {
	s = new EReg("::","g").replace(s,"/");
	s = new EReg("([A-Z]+)([A-Z][a-z])","g").replace(s,"$1_$2");
	s = new EReg("([a-z\\d])([A-Z])","g").replace(s,"$1_$2");
	s = new EReg("-","g").replace(s,"_");
	return s.toLowerCase();
};
thx_core_Strings.upTo = function(value,searchFor) {
	var pos = value.indexOf(searchFor);
	if(pos < 0) return value; else return value.substring(0,pos);
};
thx_core_Strings.wrapColumns = function(s,columns,indent,newline) {
	if(newline == null) newline = "\n";
	if(indent == null) indent = "";
	if(columns == null) columns = 78;
	return thx_core_Strings.SPLIT_LINES.split(s).map(function(part) {
		return thx_core_Strings.wrapLine(StringTools.trim(thx_core_Strings.WSG.replace(part," ")),columns,indent,newline);
	}).join(newline);
};
thx_core_Strings.upperMatch = function(re) {
	return re.matched(0).toUpperCase();
};
thx_core_Strings.wrapLine = function(s,columns,indent,newline) {
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
var thx_core_Timer = function() { };
thx_core_Timer.__name__ = true;
thx_core_Timer.debounce = function(callback,delayms,leading) {
	if(leading == null) leading = false;
	var cancel = thx_core_Functions.noop;
	var poll = function() {
		cancel();
		cancel = thx_core_Timer.delay(callback,delayms);
	};
	return function() {
		if(leading) {
			leading = false;
			callback();
		}
		poll();
	};
};
thx_core_Timer.throttle = function(callback,delayms,leading) {
	if(leading == null) leading = false;
	var waiting = false;
	var poll = function() {
		waiting = true;
		thx_core_Timer.delay(callback,delayms);
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
thx_core_Timer.repeat = function(callback,delayms) {
	return (function(f,id) {
		return function() {
			f(id);
		};
	})(thx_core_Timer.clear,setInterval(callback,delayms));
};
thx_core_Timer.delay = function(callback,delayms) {
	return (function(f,id) {
		return function() {
			f(id);
		};
	})(thx_core_Timer.clear,setTimeout(callback,delayms));
};
thx_core_Timer.frame = function(callback) {
	var cancelled = false;
	var f = thx_core_Functions.noop;
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
thx_core_Timer.nextFrame = function(callback) {
	var id = requestAnimationFrame(callback);
	return function() {
		cancelAnimationFrame(id);
	};
};
thx_core_Timer.immediate = function(callback) {
	return (function(f,id) {
		return function() {
			f(id);
		};
	})(thx_core_Timer.clear,setImmediate(callback));
};
thx_core_Timer.clear = function(id) {
	clearTimeout(id);
	return;
};
thx_core_Timer.time = function() {
	return performance.now();
};
var thx_core__$Tuple_Tuple0_$Impl_$ = {};
thx_core__$Tuple_Tuple0_$Impl_$.__name__ = true;
thx_core__$Tuple_Tuple0_$Impl_$._new = function() {
	return thx_core_Nil.nil;
};
thx_core__$Tuple_Tuple0_$Impl_$["with"] = function(this1,v) {
	return v;
};
thx_core__$Tuple_Tuple0_$Impl_$.toString = function(this1) {
	return "Tuple0()";
};
thx_core__$Tuple_Tuple0_$Impl_$.toNil = function(this1) {
	return this1;
};
thx_core__$Tuple_Tuple0_$Impl_$.nilToTuple = function(v) {
	return thx_core_Nil.nil;
};
var thx_core__$Tuple_Tuple1_$Impl_$ = {};
thx_core__$Tuple_Tuple1_$Impl_$.__name__ = true;
thx_core__$Tuple_Tuple1_$Impl_$._new = function(_0) {
	return _0;
};
thx_core__$Tuple_Tuple1_$Impl_$.get__0 = function(this1) {
	return this1;
};
thx_core__$Tuple_Tuple1_$Impl_$["with"] = function(this1,v) {
	return { _0 : this1, _1 : v};
};
thx_core__$Tuple_Tuple1_$Impl_$.toString = function(this1) {
	return "Tuple1(" + Std.string(this1) + ")";
};
var thx_core__$Tuple_Tuple2_$Impl_$ = {};
thx_core__$Tuple_Tuple2_$Impl_$.__name__ = true;
thx_core__$Tuple_Tuple2_$Impl_$._new = function(_0,_1) {
	return { _0 : _0, _1 : _1};
};
thx_core__$Tuple_Tuple2_$Impl_$.get_left = function(this1) {
	return this1._0;
};
thx_core__$Tuple_Tuple2_$Impl_$.get_right = function(this1) {
	return this1._1;
};
thx_core__$Tuple_Tuple2_$Impl_$.flip = function(this1) {
	return { _0 : this1._1, _1 : this1._0};
};
thx_core__$Tuple_Tuple2_$Impl_$.dropLeft = function(this1) {
	return this1._1;
};
thx_core__$Tuple_Tuple2_$Impl_$.dropRight = function(this1) {
	return this1._0;
};
thx_core__$Tuple_Tuple2_$Impl_$["with"] = function(this1,v) {
	return { _0 : this1._0, _1 : this1._1, _2 : v};
};
thx_core__$Tuple_Tuple2_$Impl_$.toString = function(this1) {
	return "Tuple2(" + Std.string(this1._0) + "," + Std.string(this1._1) + ")";
};
var thx_core__$Tuple_Tuple3_$Impl_$ = {};
thx_core__$Tuple_Tuple3_$Impl_$.__name__ = true;
thx_core__$Tuple_Tuple3_$Impl_$._new = function(_0,_1,_2) {
	return { _0 : _0, _1 : _1, _2 : _2};
};
thx_core__$Tuple_Tuple3_$Impl_$.flip = function(this1) {
	return { _0 : this1._2, _1 : this1._1, _2 : this1._0};
};
thx_core__$Tuple_Tuple3_$Impl_$.dropLeft = function(this1) {
	return { _0 : this1._1, _1 : this1._2};
};
thx_core__$Tuple_Tuple3_$Impl_$.dropRight = function(this1) {
	return { _0 : this1._0, _1 : this1._1};
};
thx_core__$Tuple_Tuple3_$Impl_$["with"] = function(this1,v) {
	return { _0 : this1._0, _1 : this1._1, _2 : this1._2, _3 : v};
};
thx_core__$Tuple_Tuple3_$Impl_$.toString = function(this1) {
	return "Tuple3(" + Std.string(this1._0) + "," + Std.string(this1._1) + "," + Std.string(this1._2) + ")";
};
var thx_core__$Tuple_Tuple4_$Impl_$ = {};
thx_core__$Tuple_Tuple4_$Impl_$.__name__ = true;
thx_core__$Tuple_Tuple4_$Impl_$._new = function(_0,_1,_2,_3) {
	return { _0 : _0, _1 : _1, _2 : _2, _3 : _3};
};
thx_core__$Tuple_Tuple4_$Impl_$.flip = function(this1) {
	return { _0 : this1._3, _1 : this1._2, _2 : this1._1, _3 : this1._0};
};
thx_core__$Tuple_Tuple4_$Impl_$.dropLeft = function(this1) {
	return { _0 : this1._1, _1 : this1._2, _2 : this1._3};
};
thx_core__$Tuple_Tuple4_$Impl_$.dropRight = function(this1) {
	return { _0 : this1._0, _1 : this1._1, _2 : this1._2};
};
thx_core__$Tuple_Tuple4_$Impl_$["with"] = function(this1,v) {
	return { _0 : this1._0, _1 : this1._1, _2 : this1._2, _3 : this1._3, _4 : v};
};
thx_core__$Tuple_Tuple4_$Impl_$.toString = function(this1) {
	return "Tuple4(" + Std.string(this1._0) + "," + Std.string(this1._1) + "," + Std.string(this1._2) + "," + Std.string(this1._3) + ")";
};
var thx_core__$Tuple_Tuple5_$Impl_$ = {};
thx_core__$Tuple_Tuple5_$Impl_$.__name__ = true;
thx_core__$Tuple_Tuple5_$Impl_$._new = function(_0,_1,_2,_3,_4) {
	return { _0 : _0, _1 : _1, _2 : _2, _3 : _3, _4 : _4};
};
thx_core__$Tuple_Tuple5_$Impl_$.flip = function(this1) {
	return { _0 : this1._4, _1 : this1._3, _2 : this1._2, _3 : this1._1, _4 : this1._0};
};
thx_core__$Tuple_Tuple5_$Impl_$.dropLeft = function(this1) {
	return { _0 : this1._1, _1 : this1._2, _2 : this1._3, _3 : this1._4};
};
thx_core__$Tuple_Tuple5_$Impl_$.dropRight = function(this1) {
	return { _0 : this1._0, _1 : this1._1, _2 : this1._2, _3 : this1._3};
};
thx_core__$Tuple_Tuple5_$Impl_$["with"] = function(this1,v) {
	return { _0 : this1._0, _1 : this1._1, _2 : this1._2, _3 : this1._3, _4 : this1._4, _5 : v};
};
thx_core__$Tuple_Tuple5_$Impl_$.toString = function(this1) {
	return "Tuple5(" + Std.string(this1._0) + "," + Std.string(this1._1) + "," + Std.string(this1._2) + "," + Std.string(this1._3) + "," + Std.string(this1._4) + ")";
};
var thx_core__$Tuple_Tuple6_$Impl_$ = {};
thx_core__$Tuple_Tuple6_$Impl_$.__name__ = true;
thx_core__$Tuple_Tuple6_$Impl_$._new = function(_0,_1,_2,_3,_4,_5) {
	return { _0 : _0, _1 : _1, _2 : _2, _3 : _3, _4 : _4, _5 : _5};
};
thx_core__$Tuple_Tuple6_$Impl_$.flip = function(this1) {
	return { _0 : this1._5, _1 : this1._4, _2 : this1._3, _3 : this1._2, _4 : this1._1, _5 : this1._0};
};
thx_core__$Tuple_Tuple6_$Impl_$.dropLeft = function(this1) {
	return { _0 : this1._1, _1 : this1._2, _2 : this1._3, _3 : this1._4, _4 : this1._5};
};
thx_core__$Tuple_Tuple6_$Impl_$.dropRight = function(this1) {
	return { _0 : this1._0, _1 : this1._1, _2 : this1._2, _3 : this1._3, _4 : this1._4};
};
thx_core__$Tuple_Tuple6_$Impl_$.toString = function(this1) {
	return "Tuple6(" + Std.string(this1._0) + "," + Std.string(this1._1) + "," + Std.string(this1._2) + "," + Std.string(this1._3) + "," + Std.string(this1._4) + "," + Std.string(this1._5) + ")";
};
var thx_core_error_NullArgument = function(message,posInfo) {
	thx_core_Error.call(this,message,null,posInfo);
};
thx_core_error_NullArgument.__name__ = true;
thx_core_error_NullArgument.__super__ = thx_core_Error;
thx_core_error_NullArgument.prototype = $extend(thx_core_Error.prototype,{
	__class__: thx_core_error_NullArgument
});
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
var ArrayBuffer = typeof(window) != "undefined" && window.ArrayBuffer || typeof(global) != "undefined" && global.ArrayBuffer || js_html_compat_ArrayBuffer;
if(ArrayBuffer.prototype.slice == null) ArrayBuffer.prototype.slice = js_html_compat_ArrayBuffer.sliceImpl;
var DataView = typeof(window) != "undefined" && window.DataView || typeof(global) != "undefined" && global.DataView || js_html_compat_DataView;
var Uint8Array = typeof(window) != "undefined" && window.Uint8Array || typeof(global) != "undefined" && global.Uint8Array || js_html_compat_Uint8Array._new;

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
	var now = function() {
		return new Date() - nowOffset;
	};
	scope.performance.now = now;
}
glaze_geom_Vector2.ZERO_TOLERANCE = 1e-08;
glaze_physics_collision_Intersect.epsilon = 1e-8;
glaze_physics_collision_Map.CORRECTION = .0;
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
minicanvas_BrowserCanvas.defaultScaleMode = minicanvas_ScaleMode.Auto;
minicanvas_BrowserCanvas.parentNode = typeof document != 'undefined' && document.body;
minicanvas_NodeCanvas.defaultScaleMode = minicanvas_ScaleMode.NoScale;
minicanvas_NodeCanvas.imagePath = "images";
thx_color__$Grey_Grey_$Impl_$.black = 0;
thx_color__$Grey_Grey_$Impl_$.white = 1;
thx_color_parse_ColorParser.parser = new thx_color_parse_ColorParser();
thx_color_parse_ColorParser.isPureHex = new EReg("^([0-9a-f]{2}){3,4}$","i");
thx_core_Floats.TOLERANCE = 10e-5;
thx_core_Floats.EPSILON = 10e-10;
thx_core_Floats.pattern_parse = new EReg("^(\\+|-)?\\d+(\\.\\d+)?(e-?\\d+)?$","");
thx_core_Ints.pattern_parse = new EReg("^[+-]?(\\d+|0x[0-9A-F]+)$","i");
thx_core_Ints.BASE = "0123456789abcdefghijklmnopqrstuvwxyz";
thx_core_Strings.UCWORDS = new EReg("[^a-zA-Z]([a-z])","g");
thx_core_Strings.UCWORDSWS = new EReg("\\s[a-z]","g");
thx_core_Strings.ALPHANUM = new EReg("^[a-z0-9]+$","i");
thx_core_Strings.DIGITS = new EReg("^[0-9]+$","");
thx_core_Strings.STRIPTAGS = new EReg("</?[a-z]+[^>]*?/?>","gi");
thx_core_Strings.WSG = new EReg("\\s+","g");
thx_core_Strings.SPLIT_LINES = new EReg("\r\n|\n\r|\n|\r","g");
thx_core_Timer.FRAME_RATE = Math.round(16.6666666666666679);
Main.main();
})(typeof console != "undefined" ? console : {log:function(){}});

//# sourceMappingURL=script.js.map