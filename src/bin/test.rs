use anyhow::Result;
use deku::prelude::*;
use std::convert::TryInto;

/*
#[derive(Debug, PartialEq, DekuRead, DekuWrite)]
#[deku(id = "typ", ctx = "typ: u8")]
enum Message {
    #[deku(id = "0")]
    Whoami(u8),
    #[deku(id = "1")]
    Blazingly,
}

#[derive(Debug, PartialEq, DekuRead, DekuWrite)]
struct ServerMessage {
    // We don't need a length here as deku will error out if there's not enough data to read
    // length: u8,
    typ: u8,
    seq_nu: u16,
    version: u8,
    #[deku(ctx = "*typ")]
    msg: Message,
}
*/

// Here's an alternative, we can include `typ` in the enum and get rid of the context passing
// if you're open to changing the format a bit
#[derive(Debug, PartialEq, DekuRead, DekuWrite)]
#[deku(type = "u8")]
enum Message {
    #[deku(id = "0")]
    Whoami(u8),
    #[deku(id = "1")]
    Blazingly,
}

#[derive(Debug, PartialEq, DekuRead, DekuWrite)]
struct ServerMessage {
    seq_nu: u16,
    version: u8,
    msg: Message, // Message here is now u8
}

fn main() -> Result<()> {
    env_logger::init();
    let server_msg_1 = ServerMessage {
        seq_nu: 0x6969,
        version: 0xAB,
        msg: Message::Whoami(3),
    };

    let server_ser_1: Vec<u8> = server_msg_1.try_into()?;
    println!("server_msg_1: {:x?}", server_ser_1);

    let test_data: &[u8] = [
        // ServerMessage1
        0x69, 0x69, 0xAB, 0x00, 0x03, // ServerMessage2
        0x69, 0x69, 0xAB, 0x01,
    ]
    .as_ref();

    // let's read a message from the buffer
    let (rest, msg1) =
        ServerMessage::from_bytes((test_data, 0 /* bit offset starts at 0 */)).unwrap();
    println!("msg: {:?}", msg1);

    assert_eq!(
        ServerMessage {
            seq_nu: 0x6969,
            version: 0xAB,
            msg: Message::Whoami(3)
        },
        msg1
    );

    // let's serialize this back to bytes, make sure we got the same thing
    let codes: Vec<u8> = msg1.try_into().unwrap();
    assert_eq!(test_data[..5].to_vec(), codes);

    // let's read another message from the buffer
    let (rest, msg2) = ServerMessage::from_bytes(rest).unwrap();

    // let's make sure we read all the data in the buffer
    assert!(rest.0.is_empty());
    assert_eq!(
        ServerMessage {
            seq_nu: 0x6969,
            version: 0xAB,
            msg: Message::Blazingly
        },
        msg2
    );

    // let's serialize this back to bytes, make sure we got the same thing
    let codes: Vec<u8> = msg2.try_into().unwrap();
    assert_eq!(test_data[5..].to_vec(), codes);
    return Ok(());
}
