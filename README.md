Glaze Physics
=============

A game physics engine specializing in fun, high performance and robust AABB (rectangle) game physics.

There are 4 types of collidable AABB entities in the engine:
* Tiles: Organized on a regular grid, these for the basis of the world.
* Static: Arbitary AABBs placed in the world to augment the tiled world.
* Dynamic (Body): Moving AABB's attached to dynamic body.  Uses speculative contacts.
* Bullet (Body): Moving AABB's attached to a dynamic body.  Uses swept segments.

These AABB entities can also be sensors.  Sensors never have a physical response.

                    static      static sensor       dynamic     dynamic sensor      dynamic bullet
static              X                              
static sensor       X           X
dynamic             Spec        AABB                AABB
dynamic sensor      AABB        X                   AABB        X
dynamic bullet      Seg         Seg                 Seg         Seg                 X

