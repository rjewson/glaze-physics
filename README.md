Glaze Platform Physics Engine
=============================


# glaze2





World Size Estimates

Tile size: 16px
World size tiles: 4000*4000
World size pixels: 64000px * 64000px

Broadphase cell size: 1000px
Broadphase cells: 6500

Variables:
    static
    dynamic
    bullet
    sensor

Permutations:
    static
    static sensor
    dynamic
    dynamic sensor
    dynamic bullet


                    static      static sensor       dynamic     dynamic sensor      dynamic bullet
static              X                              
static sensor       X           X
dynamic             Spec        AABB                AABB
dynamic sensor      AABB        X                   AABB        X
dynamic bullet      Seg         Seg                 Seg         Seg                 X

