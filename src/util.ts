/**
 * Class containing common utility methods
 *
 * If the method should have user-changeable settings, consider using `Core.ts` instead
 */

class Util {
    /**
     * Animation frame timer
     */
    public static afTimer():Promise<number> {
        return new Promise( (resolve) => {
            requestAnimationFrame(resolve);
        } );
    }
    /**
     * Allows setting multiple attributes at once
     */
    public static setAttr(el:Element,attr:StringObject):Promise<void>{
        return new Promise( resolve => {
            for(const key in attr){
                el.setAttribute(key,attr[key]);
            }
            resolve();
        });
    }
}
