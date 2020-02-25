### Client Server Interaciotns #### Stream Tonight:
* Multiple players executing movement commands.
* Beastco used a cry emoji in chat, should ask about his state of being in a
  demeaning way.
* Get the flamegraph going.
* Set the server tick rate.

#### TODO:
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

