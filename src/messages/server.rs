use anyhow::{Result};
use deku::prelude::*;
use serde::Serialize;
use std::convert::TryInto;

use crate::version::VERSION;

pub const WHO_AM_I_SERVER: u8 = 0;
pub const WHO_AM_I_CLIENT: u8 = 1;

#[derive(Debug, PartialEq, DekuRead, DekuWrite, Serialize)]
#[deku(endian = "parent_endian", ctx = "parent_endian: deku::ctx::Endian")]
pub struct PlayerStart {

    #[deku(bits = 24)]
    entity_id: usize,

    range: u16,
    position: u32,
}

// Here's an alternative, we can include `typ` in the enum and get rid of the context passing
// if you're open to changing the format a bit
#[derive(Debug, PartialEq, DekuRead, DekuWrite, Serialize)]
#[deku(type = "u8", endian = "parent_endian", ctx = "parent_endian: deku::ctx::Endian")]
pub enum Message {

    #[deku(id = "0")]
    Whoami(u8),

    #[deku(id = "1")]
    PlayerStart(PlayerStart),
}

/*
export type PlayerPositionUpdate = {
    type: MessageType.PlayerPositionUpdate,
    value: Entity & {
        position: Position,
    }
}

export type CreateEntity = {
    type: MessageType.CreateEntity,
    value: Entity & {
        position: Position,
        info: number,
    }
}

export type DeleteEntity = {
    type: MessageType.DeleteEntity,
    value: Entity,
}

export type HealthUpdate = {
    type: MessageType.HealthUpdate,
    value: Entity & {
        health: number,
    }
}

export type CirclePosition = {
    type: MessageType.CirclePosition,
    value: {
        size: number,
        position: Position,
        seconds: number,
    }
}

export type CircleStart = {
    type: MessageType.CircleStart,
    value: {
        seconds: number,
    }
}

export type PlayerCount = {
    type: MessageType.PlayerCount,
    value: {
        count: number,
    }
}

export type WhoAmI = {
    type: MessageType.WhoAmI,
    value: WhoAmIType;
}

export type PlayerQueueCount = {
    type: MessageType.PlayerQueueCount,
    value: undefined
}

export type GameCount = {
    type: MessageType.GameCount,
    value: undefined
}

export type PlayerQueueCountResult = {
    type: MessageType.PlayerQueueCountResult,
    value: number
}

export type GameCountResult = {
    type: MessageType.GameCountResult,
    value: number
}


*/

#[derive(Debug, PartialEq, DekuRead, DekuWrite, Serialize)]
#[deku(endian = "big")]
pub struct ServerMessage {
    pub seq_nu: u16,
    pub version: u8,
    pub msg: Message, // Message here is now u8
}

impl ServerMessage {
    pub fn deserialize(bytes: &[u8]) -> Result<ServerMessage> {
        let (_, server_msg) =  ServerMessage::from_bytes((bytes, 0))?;
        return Ok(server_msg);
    }

    pub fn serialize(self) -> Result<Vec<u8>> {
        return Ok(self.try_into()?);
    }

    pub fn create_whoami_server() -> ServerMessage {
        return ServerMessage {
            seq_nu: 0,
            version: VERSION,
            msg: Message::Whoami(WHO_AM_I_SERVER),
        };
    }
}

#[cfg(test)]
mod test {
    use anyhow::Result;

    use crate::messages::server::PlayerStart;

    use super::{ServerMessage, Message};

    #[test]
    fn test_serialization() -> Result<()> {
        let msg = ServerMessage {
            seq_nu: 2,
            version: 3,
            msg: Message::PlayerStart(PlayerStart {
                entity_id: 5,
                position: 6,
                range: 7,
            })
        };

        println!("codes: {:x?}", msg.serialize());

        return Ok(());
    }
}



