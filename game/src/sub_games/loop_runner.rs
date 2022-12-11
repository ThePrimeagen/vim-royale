use futures::channel::mpsc::Sender;
use anyhow::Result;

pub async fn run(mut tx: Sender<(usize, usize)>) -> Result<()> {

        let _ = tx.try_send((tick, current - prev_frame_time));
}


