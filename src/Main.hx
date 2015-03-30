
package ;

import js.Browser;

class Main 
{

	public static function main() {
        var demo = new demo.Test1();
        Browser.document.getElementById("stopbutton").addEventListener("click",function(event){
            demo.loop.stop();
        });
        Browser.document.getElementById("startbutton").addEventListener("click",function(event){
            demo.loop.start();
        });
    }	
    
}