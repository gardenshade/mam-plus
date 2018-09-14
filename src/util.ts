/**
 * Class containing common utility methods
 */

class MP_Util {
    /**
     * Animation frame timer
     */
    static afTimer():Promise<number> {
        return new Promise( (resolve) => {
            requestAnimationFrame(resolve);
        } );
    }
}
