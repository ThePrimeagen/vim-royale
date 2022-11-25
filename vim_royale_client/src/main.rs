mod vim_royale;

use vim_royale::vim_royale;
use anyhow::Result;

fn main() -> Result<()> {
    vim_royale()?;
    return Ok(());
}
