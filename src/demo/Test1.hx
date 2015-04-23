package demo;

import glaze.physics.collision.BFProxy;
import glaze.physics.collision.Map;
import glaze.physics.collision.Contact;
import glaze.physics.collision.Ray;
import js.Browser;
import glaze.Engine;
import glaze.geom.Vector2;
import glaze.physics.Body;
import minicanvas.MiniCanvas;
import glaze.util.GameLoop;
import glaze.util.DigitalInput;

class Test1 
{

    public var loop:GameLoop;
    public var canvas:MiniCanvas;
    public var input:DigitalInput;
    public var engine:Engine;

    public var player:Body;
    public var ray:Ray;

    public var map:Map;

    public var debugGridItems:Array<Int>;
    public var debugGridItemsCount:Int;

    public function new() {
        staticTests();
        setup();
        loop.start();
    }    

    public function staticTests() {
        var pos1 = new Vector2(100,100);
        var extents1 = new Vector2(10,10);

        var pos2 = new Vector2(150,100);
        var extents2 = new Vector2(10,10);
        var delta2 = new Vector2(-31,0);

        var contact:Contact = new Contact();

        var result:Bool;

        result = glaze.physics.collision.Intersect.StaticAABBvsSweeptAABB(pos1,extents1,pos2,extents2,delta2,contact);
        // trace("Test A");
        // trace(result);
        // trace(contact);
    }

    public function setup() {
        canvas = MiniCanvas.create(640,640);
        canvas.display("basic example");

        input = new DigitalInput();
        input.InputTarget(Browser.document,new Vector2());

        // Browser.document.getElementById("stopbutton");

        var mapData = new glaze.ds.Bytes2D(20,20,32,4,glaze.ds.Bytes2D.uncompressData("eJxjZGBgYKQyphaglXnUMnMw+pce8UEtswdj+GEzj1ppf6j4d6ibR6ydI9U8amIAODcAYw=="));
        map = new Map(mapData);
        map.debug = debugGrid;
        debugGridItems = new Array<Int>();

        engine = new Engine(map);

        loop = new GameLoop();
        loop.updateFunc = update;

        customSetup();
    }

    public function customSetup() {
        player = new Body(20,45);
        player.position.setTo(200,200);
        engine.addBody(player);

        //10,17 water center
        var box = BFProxy.CreateStaticFeature(464,544,144,64);
        box.contactCallback = cb;
        box.isSensor = true;
        engine.broadphase.addProxy(box);
        
        ray = new Ray();
    }

    public function cb(a:BFProxy,b:BFProxy,c:Contact) {
        var area = a.aabb.overlapArea(b.aabb);
        b.body.damping = 0.9;
        b.body.addForce(new Vector2(0,-area/200));
        //trace(area);
    }

    public function update(delta:Float) {

        debugGridItemsCount = 0;
        input.Update(0,0);
        ray.hit=false;
        processInput();
        engine.update(delta);
        debugRender();
        render();
    }

    public function processInput() {
        var inputVelocity = new Vector2();
        var force = 10;
        var left = input.PressedDuration(65);   //a
        var right = input.PressedDuration(68);  //d
        var up = input.JustPressed(87);     //w
        var down = input.PressedDuration(83);   //s
        var fire = input.Pressed(32);

        var ray = input.Pressed(82);
        if (left>0) inputVelocity.x  -= force;
        if (right>0) inputVelocity.x += force;
        if (up) {
            //if (player.onGround) {
                inputVelocity.y    -= force*50;
            //}
        }
        if (down>0) inputVelocity.y  += force;
        if (fire) fireBullet();
        if (ray) shootRay();
        player.addForce(inputVelocity);
    }

    public function fireBullet() {
        var bullet = new Body(10,10);
        bullet.position.setTo(player.position.x,player.position.y);
        var vel = input.mousePosition.clone();
        vel.minusEquals(player.position);
        vel.normalize();
        vel.multEquals(10000);
        bullet.velocity.setTo(vel.x,vel.y);
        engine.addBody(bullet);     
    }

    public function shootRay() {
        // var target = player.position.clone();
        // target.x-=1;
        // target.y-=1;
        ray.initalize(player.position, input.mousePosition, 1000 );
        map.castRay(ray);
    }

    public function debugRender() {

    }

    public function debugGrid(x:Int,y:Int) {
        var i = debugGridItemsCount*2;
        debugGridItems[i] = x;
        debugGridItems[i+1] = y;
        debugGridItemsCount+=1;
    }

    public function render() {
        canvas.clear();
        
        var cellSize = map.data.cellSize;
        var halfCellSize = cellSize/2;

        for (y in 0...map.data.height) {
            for (x in 0...map.data.width) {
                var cell = map.data.get(x,y,0);
                if (cell>0) {
                    var xp = x * cellSize;
                    var yp = y * cellSize;
                    canvas.rect(
                        xp,
                        yp,
                        xp+cellSize,
                        yp+cellSize,
                        1,
                        0x000000FF
                        );                   
                }
            }
        }

        for (body in engine.dynamicBodies) {
            canvas.rect(
                body.aabb.l,
                body.aabb.t,
                body.aabb.r,
                body.aabb.b,
                1,
                body.onGround ? "rgba(255,0,0,1)" : "rgba(0,0,255,1)"               
            );
        }

        for (proxy in engine.broadphase.staticProxies) {
            canvas.rect(
                proxy.aabb.l,
                proxy.aabb.t,
                proxy.aabb.r,
                proxy.aabb.b,
                1,
                "rgba(0,255,0,1)"                
            );
        }

        for (i in 0...debugGridItemsCount) {
            var xp = debugGridItems[i*2] * cellSize;
            var yp = debugGridItems[(i*2)+1] * cellSize;
            canvas.rect(
                xp,
                yp,
                xp+cellSize,
                yp+cellSize,
                3,
                '#ff0000'
                );             
        }

        if (ray.hit) {
            canvas.line(ray.origin.x,ray.origin.y,ray.position.x,ray.position.y,1, '#00ff00' );
        }
    }

}