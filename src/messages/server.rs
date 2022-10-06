use anyhow::{Result, Context};
use deku::prelude::*;
use std::convert::TryInto;

use crate::version::VERSION;

pub const WHO_AM_I_SERVER: u8 = 0;
pub const WHO_AM_I_CLIENT: u8 = 1;

// Here's an alternative, we can include `typ` in the enum and get rid of the context passing
// if you're open to changing the format a bit
#[derive(Debug, PartialEq, DekuRead, DekuWrite)]
#[deku(type = "u8", endian = "parent_endian", ctx = "parent_endian: deku::ctx::Endian")]
pub enum Message {
    #[deku(id = "0")]
    Whoami(u8),
}

#[derive(Debug, PartialEq, DekuRead, DekuWrite)]
#[deku(endian = "big")]
pub struct ServerMessage {
    seq_nu: u16,
    version: u8,
    msg: Message, // Message here is now u8
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

    use super::{ServerMessage, Message};

    #[test]
    fn test_serialization() -> Result<()> {
        let msg = ServerMessage {
            seq_nu: 2,
            version: 3,
            msg: Message::Whoami(3),
        };

        println!("codes: {:x?}", msg.serialize());

        return Ok(());
    }
}



