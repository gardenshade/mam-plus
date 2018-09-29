/**
 * Class containing common utility methods
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
}
