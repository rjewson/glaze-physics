package demo;

import glaze.physics.collision.BFProxy;
import glaze.physics.collision.Filter;
import glaze.physics.collision.Map;
import glaze.physics.collision.Contact;
import glaze.physics.collision.Ray;
import glaze.physics.Material;
import glaze.util.CharacterController;
import js.Browser;
import glaze.Engine;
import glaze.geom.Vector2;
import glaze.physics.Body;
import minicanvas.MiniCanvas;
import glaze.util.GameLoop;
import glaze.util.DigitalInput;
import glaze.util.DigitalInput2;

class Test1 
{

    // public static inline var mapData:String = "eJxjZGBgYKQyphaglXnUMnOw+Jfe8UHt8KOWmdT2O7XT/2BJL0PJPHLilFg7R6p51MQAVwMAbQ==";
    public static inline var mapData:String = "eJxjZGBgYKQyphaglXnUMpMe/iXGfHrHB7XDj1pmkut/XGqonQeGSv4YTOZRMz5xmT3SzKMmBgBlKwBx";

    public var loop:GameLoop;
    public var canvas:MiniCanvas;
    public var input:DigitalInput;
    public var input2:DigitalInput2;
    public var engine:Engine;

    public var player:Body;
    public var ray:Ray;
    public var mat1:Material;
    public var playerFilter:Filter;

    public var characterController:CharacterController;

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
    }

    public function setup() {
        canvas = MiniCanvas.create(640,640);
        canvas.display("basic example");
        var rect = canvas.canvas.getBoundingClientRect();

        input = new DigitalInput();
        input.InputTarget(Browser.document,new Vector2(rect.left,rect.top));
        trace(rect.x,rect.y);
        // input2 = new DigitalInput2();
        // input2.InputTarget(Browser.document,new Vector2(rect.x,rect.y));


        // Browser.document.getElementById("stopbutton");

        var mapData = new glaze.ds.Bytes2D(20,20,32,4,glaze.ds.Bytes2D.uncompressData(mapData));
        map = new Map(mapData);
        map.debug = debugGrid;
        debugGridItems = new Array<Int>();

        engine = new Engine(map);

        loop = new GameLoop();
        loop.updateFunc = update;

        customSetup();
    }

    public function customSetup() {

        mat1 = new Material();
        playerFilter = new Filter();
        playerFilter.groupIndex = 1;

        player = new Body(20,45,mat1,playerFilter);
        player.position.setTo(200,200);
        player.maxScalarVelocity = 0;
        player.maxVelocity.setTo(160,1000);
        engine.addBody(player);

        characterController = new CharacterController(input,player);

        var box = new Body(10,10,mat1);
        box.position.setTo(150,200);
        engine.addBody(box);

        //10,17 water center
        var water = BFProxy.CreateStaticFeature(464,544,144,64);
        water.contactCallback = cb;
        water.isSensor = true;
        engine.broadphase.addProxy(water);
        
        ray = new Ray();

        var di2 = new glaze.util.DigitalInput2();
    }

    public function cb(a:BFProxy,b:BFProxy,c:Contact) {
        var area = a.aabb.overlapArea(b.aabb);
        b.body.damping = 0.95;
        b.body.addForce(new Vector2(0,-area/100));
    }

    public function update(delta:Float,now:Int) {
        debugGridItemsCount = 0;
        input.Update(0,0);
        //input2.Update(now,0,0);
        ray.hit=false;
        processInput();
        engine.update(delta);
        // trace(player.velocity.x);
        debugRender();
        render();
    }

    public function processInput() {

        characterController.update();
        
        var fire = input.JustPressed(32);
        var search = input.JustPressed(71);
        var debug = input.Pressed(72);
        var ray = input.Pressed(82);
        
        if (fire) fireBullet();
        if (ray) shootRay();
        if (search) searchArea();
        if (debug) fireBullet(20);

        // trace(input2.GetInputData(32).justDown());

    }

    public function fireBullet(debugCount:Int = 0) {
        var bullet = new Body(5,5,mat1,playerFilter);
        bullet.setMass(0.03);
        bullet.setBounces(3);
        bullet.position.setTo(player.position.x,player.position.y);
        bullet.isBullet = true;
        bullet.debug = debugCount;

        var vel = input.mousePosition.clone();
        vel.minusEquals(player.position);
        vel.normalize();
        vel.multEquals(5000);
        bullet.velocity.setTo(vel.x,vel.y);

        engine.addBody(bullet);     
    }

    public function shootRay() {
        ray.initalize(player.position, input.mousePosition, 1000 , rayTest );
        engine.broadphase.CastRay(ray,null,true,false);
    }

    public function searchArea() {
        var area = new glaze.geom.AABB();
        area.position.copy(player.position);
        area.extents.setTo(100,100);

        var count = 0;
        engine.broadphase.QueryArea(area,function(bf:BFProxy){
                count++;
            }
        );
        trace("Found:"+count);
    }

    function rayTest(proxy:BFProxy):Int {
        return (proxy.body!=null&&proxy.body==player) ? -1 : 0;
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

            if (body.isBullet) {
                canvas.line(body.position.x,body.position.y,body.previousPosition.x,body.previousPosition.y,3, 0xFF00FFFF);
                //continue;
            }

            canvas.rect(
                body.aabb.l,
                body.aabb.t,
                body.aabb.r,
                body.aabb.b,
                1,
                body.onGround ? 0xFF00FFFF : 0x0000FFFF           
            );

        }

        for (proxy in engine.broadphase.staticProxies) {
            canvas.rect(
                proxy.aabb.l,
                proxy.aabb.t,
                proxy.aabb.r,
                proxy.aabb.b,
                1,
                0x00FF00FF                
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
                0xFF0000FF
                );             
        }

        if (ray.hit) {
            canvas.line(ray.origin.x,ray.origin.y,ray.contact.position.x,ray.contact.position.y,1, '#00ff00' );
        }
    }

}