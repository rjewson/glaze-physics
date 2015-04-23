
package glaze;

import glaze.geom.Vector2;
import glaze.physics.collision.BFProxy;
import glaze.physics.collision.BruteforceBroadphase;
import glaze.physics.collision.Map;
import glaze.physics.Body;
import glaze.physics.collision.Contact;
import glaze.physics.collision.Intersect;

class Engine 
{

    public var dynamicBodies:Array<Body>;
    public var sleepingBodies:Array<Body>;

    public var nf:Intersect;
    public var broadphase:BruteforceBroadphase;

    public var map:Map;

    public var contact:Contact;

    public var globalForce:Vector2;

    public function new(map:Map) {
        this.map = map;

        dynamicBodies = new Array<Body>();
        sleepingBodies = new Array<Body>();
        
        nf = new Intersect();
        broadphase = new BruteforceBroadphase(map,nf);

        contact = new Contact();
        globalForce = new Vector2(0,0); 
    }

    public function update(delta:Float) {
        //js.Lib.debug();
        var invDelta = delta/1000;
        preUpdate(invDelta);
        collide(invDelta);
        updatePosition(invDelta);
    }

    public function preUpdate(delta:Float) {
        for (body in dynamicBodies) {
            body.update(delta,globalForce,0.98);
        }
    }

    /*
    With solid response:
    - Dynamic vs Map
    - Dynamic vs Static
    - Dynamic vs Kinematic

    Without solid response:
    - Dynamic vs Dynamic
    */

    public function collide(delta:Float) {
        broadphase.collide();
    }

    public function updatePosition(delta:Float) {
        for (body in dynamicBodies) {
            body.updatePosition();
        }
    }

    public function addBody(body:Body) {
        dynamicBodies.push(body);
        broadphase.addProxy(body.bfproxy);
    }

    public function removeBody(body:Body) {
        
    }

}