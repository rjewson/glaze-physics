package glaze.geom;

class Rectangle {
    
    public var position:Vector2 = new Vector2();
    public var dimensions:Vector2  = new Vector2();

    public function new(x = 0.,y = 0.,width = 0.,height = 0.):Void
    {
        position.setTo(x,y);
        dimensions.setTo(width,height);
    }

}