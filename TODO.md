### Client Server Interaciotns
#### TODO:

* Server does not disconnect disconnected players and still sends position
  updates.
  * Entities store working
  * Server can actually remove entities when the disconnect happens.
    * wont send updates and remove all information about them.
  * When new player join, all players should receive their information.
    * right now only newer players get older players info...
* send messages -- aggregate on tick.
* Lets do some PERFORMANCE testing.  Get this tick rate to at least 60, if not 9001.
  * meeples API for players
  *
