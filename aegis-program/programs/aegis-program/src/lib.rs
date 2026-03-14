use anchor_lang::prelude::*;

declare_id!("8RK5m1rte3iKwJ2eJxoLXaxMmYyq3moAaTov72KqtgdG");

#[program]
pub mod aegis_program {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
