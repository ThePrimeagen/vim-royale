use crate::messages::server::ServerMessage;


pub fn parse(bytes: &[u8], len: usize, offset: usize) -> (usize, Option<ServerMessage>) {
    if bytes[offset] as usize > len {
        return (offset, None);
    }

    let data_slice = &bytes[offset + 1..1 + (bytes[offset] as usize)];

}

