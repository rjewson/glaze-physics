
package glaze.physics.collision;

import glaze.physics.collision.BFProxy;
import glaze.physics.collision.Intersect;
import glaze.physics.collision.Map;
import glaze.geom.Vector2;

class BruteforceBroadphase 
{

    public var staticProxies:Array<BFProxy>;
    public var dynamicProxies:Array<BFProxy>;
    public var map:Map;
    public var nf:Intersect;

    public function new(map:Map, nf:Intersect) {
        this.map = map;
        this.nf = nf;
        staticProxies  = new Array<BFProxy>();
        dynamicProxies = new Array<BFProxy>();
    }

    public function addProxy(proxy:BFProxy) {
        var target = proxy.isStatic ? staticProxies : dynamicProxies;
        target.push(proxy);
    }

    public function collide() {
        var count = dynamicProxies.length;
        for (i in 0...count) {

            var dynamicProxy = dynamicProxies[i];

            map.testCollision( dynamicProxy.body );

            for (staticProxy in staticProxies) {
                //test A<>static
                nf.Collide(dynamicProxy,staticProxy);
            }

            for (j in i+1...count) {
                var dynamicProxyB = dynamicProxies[j];
                nf.Collide(dynamicProxy,dynamicProxyB);
            }

        }
    }

    public function Search(position:Vector2,radius:Float,result:Body->Float->Void):Void {
        return null;
    }

}