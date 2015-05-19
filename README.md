Glaze Platform Physics Engine
=============================


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

