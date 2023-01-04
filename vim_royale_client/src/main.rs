mod vim_royale;
mod state;

use vim_royale::vim_royale;
use anyhow::Result;

fn main() -> Result<()> {
    vim_royale()?;
    return Ok(());

}
