/// <reference path="util.ts" />
/**
 * Class for handling validation & confirmation
 */

class MP_Check {
    /**
     * Checks to see if an element exists, then resolves a promise when it exists
     */
    static elemLoad( selector:string ):Promise<Element|void> {
        if( document.querySelector( selector ) === null ){
            return MP_Util.afTimer().then( () => {
                this.elemLoad( selector );
            } );
        }else{
            return Promise.resolve( document.querySelector( selector ) );
        }
    }
}
