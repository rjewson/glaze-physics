
package ds;

import haxe.io.Bytes;
import haxe.io.BytesData;

class Bytes2D 
{

    public var data:Bytes;
    public var bytesData:BytesData;

    public var width:Int;
    public var height:Int;

    private var internalWidth:Int;

    public var cellSize:Int;
    public var invCellSize:Float;

    public var bytesPerCell:Int;

    public function new(width:Int, height:Int, cellSize:Int, bytesPerCell:Int, ?data:Bytes) 
    {
        initalize(width, height, cellSize, bytesPerCell, data);
    }
    
    public function initalize(width:Int, height:Int, cellSize:Int, bytesPerCell:Int, ?data:Bytes):Void {
        this.width = width;
        this.height = height;
        
        this.internalWidth = width * bytesPerCell;

        this.cellSize = cellSize;
        this.invCellSize = 1 / cellSize;

        this.bytesPerCell = bytesPerCell;
        
        //Passed data? if so init with that and hope is the right dimension (to fix)
        if (data==null) 
            this.data = Bytes.alloc(width*height*bytesPerCell);
        else
            this.data = data;

        bytesData = this.data.getData();
    }

    inline public function get(x:Int,y:Int,offset:Int):Int {
        //3.2 bug?
        //return Bytes.fastGet(bytesData, (y * internalWidth) + (x * bytesPerCell) + offset);
        return data.get( (y * internalWidth) + (x * bytesPerCell) + offset);
    }

    inline public function set(x:Int,y:Int,offset:Int,value:Int) {
        data.set( (y * internalWidth) + (x * bytesPerCell) + offset ,value);
    }

    inline public function Index(value:Float):Int {
        //FIXME Not sure this always works...
        //return Std.int(value / cellSize);
        //return Math.floor(value * invCellSize);
        return Std.int(value * invCellSize);
    }   

    public static function uncompressData(str:String,compressed:Bool=true):Bytes {
        var mapbytes:Bytes = haxe.crypto.Base64.decode(str);
        if (compressed)
            mapbytes = haxe.zip.Uncompress.run(mapbytes);
        return mapbytes;
    }

}