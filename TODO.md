#### TODO:

* explore shooting.
---- What I actually will do ---
  * Lets do hjkl of shooting.
    * Create an entity that "_MiRrOrEd_" Architectural Pattern on the server.
      * Entity creation system where the amount of binary is arbitrary
        depending on the type of creation.
    * Hit detection / Bullet life?


---- What I actually need to do ---
  * 1.  Display a wheel of letters to start shooting in a direction.
  * 2.  When letter pressed, display the letters to shoot.
  * 3.  Bullets being created and displayed on other screens.
  * 4.  Server determines health of players.


* rewrite in rust
  * Prime will kill you in tarkov if you suggest this.

* The logger clearly doesn't log, but instead leaks.... NICE TRY GUY...
* If someone DCs, and has an update in the queue for movement, the server
  movement executer will throw an null exception.  Should ignore movemnets that
  have no player associated with them (likely DC).  Also feel like I should log
  it osemwhere

// Hi def mode.
* Explore dynamic sizing based on window's available space.
* Debug network thing...
  * When I use an environment var, DEBUG=true, network protocols sync with the
    server and contain some sort of numbering system.
* Unit testing any of the individual components.

