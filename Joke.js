// this is a class that gives jokes
// you might say they are prett classy jokes =D

class Joke {

    // this gives a new joke as a string.  Currently I'm hardwiring 
    // the joke, but building it so it can be extended later without
    // having to dig through the code

    static async getNew() {

        return `What’s the best thing about Switzerland?

        I don’t know, but the flag is a big plus.`
    }
}

module.exports = Joke