
package glaze;

import glaze.geom.Vector2;
import glaze.physics.collision.BFProxy;
import glaze.physics.collision.broadphase.IBroadphase;
import glaze.physics.Body;

class Engine 
{

    public var dynamicBodies:Array<Body>;
    public var sleepingBodies:Array<Body>;

    public var broadphase:IBroadphase;

    public var globalForce:Vector2;
    public var globalDamping:Float;

    public var pps : Float;
        
    public var msPerPhysics:Float;
    public var invMsPerPhysics:Float;
    private var accumulator:Float;
    
    public var stepCount:Int;
    public var updateCount:Int;

    public function new(pps:Int,broadphase:IBroadphase) {
        this.pps = pps;
        this.broadphase = broadphase;

        dynamicBodies = new Array<Body>();
        sleepingBodies = new Array<Body>();
        
        globalForce = new Vector2(0,30); 
        globalDamping = 0.99;

        stepCount = 0;
        updateCount = 0;
        accumulator = 0;
        msPerPhysics = 1000/pps;
        invMsPerPhysics = msPerPhysics/1000;
    }

    public function update(delta:Float) {
        stepCount++;
        accumulator+=delta;
        while (accumulator>msPerPhysics) {
            updateCount++;
            accumulator-=msPerPhysics;
            preUpdate(invMsPerPhysics);
            collide(invMsPerPhysics);
            updatePosition(invMsPerPhysics);
        }
    }

    public function preUpdate(delta:Float) {
        for (body in dynamicBodies) {
            body.update(delta,globalForce,globalDamping);
        }
    }

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
        dynamicBodies.remove(body);
        broadphase.removeProxy(body.bfproxy);
    }

}