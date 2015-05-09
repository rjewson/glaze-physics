
package glaze.physics;

import glaze.geom.Vector2;
import glaze.physics.collision.BFProxy;
import glaze.physics.collision.Contact;
import glaze.geom.AABB;
import glaze.geom.BFBB;

class Body 
{

    public var position:Vector2 = new Vector2();
    public var positionCorrection:Vector2 = new Vector2();
    public var predictedPosition:Vector2 = new Vector2();
    public var previousPosition:Vector2 = new Vector2();

    public var velocity:Vector2 = new Vector2();
    public var originalVelocity:Vector2 = new Vector2();

    public var lastNormal:Vector2 = new Vector2();

    public var stepContactCount:Int = 0;

    public var maxScalarVelocity:Float = 10000;

    public var aabb:AABB = new AABB();
    public var bfproxy:BFProxy = new BFProxy();
    public var material:Material;

    public var forces:Vector2 = new Vector2();
    private var accumulatedForces:Vector2 = new Vector2();

    public var isBullet:Bool = false;

    public var damping:Float = 1;

    public var mass:Float = 1;
    public var invMass:Float = 1;

    public var dt:Float = 0;

    public var onGround:Bool = false;
    public var onGroundPrev:Bool = false;

    public var totalBounceCount:Int = 0;
    public var bounceCount:Int = 0;
    public var canBounce(get, null):Bool;

    public var debug:Int = 0;    

    public function new(w:Float,h:Float,material:Material) {
        aabb.extents.setTo(w,h);
        this.material = material;
        aabb.position = this.position;
        setMass(1);

        bfproxy.body = this;
        bfproxy.aabb = aabb;
        bfproxy.isStatic = false;
    }

    public function update(dt:Float,globalForces:Vector2,globalDamping:Float) {
        this.dt = dt;
        //Add global forces to local ones
        forces.plusEquals(globalForces);
        velocity.plusEquals(forces);
        velocity.multEquals(globalDamping*damping);
        velocity.clamp(maxScalarVelocity);
        originalVelocity.copy(velocity);

        predictedPosition.copy(position);
        predictedPosition.plusMultEquals(velocity,dt);
        previousPosition.copy(position);

        forces.setTo(0,0);
        damping = 1;

        onGroundPrev = onGround;
        onGround = false;
        stepContactCount = 0;
    }

    public function respondStaticCollision(contact:Contact):Bool {
        var seperation = Math.max(contact.distance,0);
        var penetration = Math.min(contact.distance,0);
        
        positionCorrection.x -= contact.normal.x * (penetration/dt);
        positionCorrection.y -= contact.normal.y * (penetration/dt);

        var nv = velocity.dot(contact.normal) + (seperation/dt);

        if (nv<0) {
            stepContactCount++;

            //Cancel normal vel
            velocity.x -= contact.normal.x * nv;
            velocity.y -= contact.normal.y * nv;
            
            // if (debug>0) {
            //     trace(contact.normal,seperation,penetration,contact.distance);
            //     debug--;
            // }

            //Item doesnt bounce? Surface is updwards?
            if (!canBounce && contact.normal.y < 0) {
                onGround = true;
                var tangent:Vector2 = contact.normal.rightHandNormal();
                var tv:Float = velocity.dot(tangent) * material.friction;
                velocity.x -= tangent.x * tv;
                velocity.y -= tangent.y * tv;
            }

            //store contact normal for later reflection
            lastNormal.copy(contact.normal);

            return true;
        } 
        return false;
    }

    public function updatePosition() {
        // position.x += (velocity.x*dt) + (positionCorrection.x*dt);
        // position.y += (velocity.y*dt) + (positionCorrection.y*dt);
        positionCorrection.plusEquals(velocity);
        positionCorrection.multEquals(dt);
        position.plusEquals(positionCorrection);
        positionCorrection.setTo(0,0);

        //Anything hit? Any bounces left?
        if (stepContactCount>0 && canBounce) {
            //Reflect it...
            originalVelocity.reflectEquals(lastNormal);
            //Fixme
            originalVelocity.multEquals(material.elasticity);
            velocity.copy(originalVelocity);
            bounceCount++;
        }

    }

    public function addForce(f:Vector2) {
        forces.plusMultEquals(f,invMass);
    }

    public function addMasslessForce(f:Vector2) {
        forces.plusEquals(f);
    }

    public function setMass(mass) {
        this.mass = mass;
        this.invMass = 1/mass;
    }

    public function setBounces(count:Int) {
        totalBounceCount = count;
        bounceCount = 0; 
    }

    inline function get_canBounce():Bool {
        return bounceCount!=totalBounceCount;
    }

}