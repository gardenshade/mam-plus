# An object full of helper functions
MP_HELPERS =
    timestamp : ->
        theDate = new Date()
            .toUTCString()
            .split(' ')
        return theDate[2]+' '+theDate[1]
