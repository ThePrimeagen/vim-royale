#### TODO:

* networking
  * createEntity / all the game state updates should be related to an entity -- nice programming --
    * createEntity(obj: {encodeType(), encode(), decode(), is()});
    * gameStateUpdates(...);
  * (DOING): f it, just make createEntity take in a type and more encoding bits -- shooting possible --
  * buffer network messages until server tick. -- perf --

* explore shooting.

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

