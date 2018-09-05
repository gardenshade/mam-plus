/// <reference path="example_module.ts" />

namespace userscript {
    export const time: string = '##timestamp##';
    export let init = () => {
        console.log(time);
    };
}

userscript.init();
example.msngr('runnin');
