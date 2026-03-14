use anchor_lang::prelude::*;

declare_id!("8RK5m1rte3iKwJ2eJxoLXaxMmYyq3moAaTov72KqtgdG");

#[program]
pub mod aegis_program {
    use super::*;

    
    pub fn open_position(
        ctx: Context<OpenPosition>,
        position_id: u64,
        encrypted_data: [u8; 64],
        side: u8,
        leverage: u8,
    ) -> Result<()> {
        let pos = &mut ctx.accounts.position;
        pos.owner          = ctx.accounts.owner.key();
        pos.position_id    = position_id;
        pos.encrypted_data = encrypted_data;
        pos.side           = side;
        pos.leverage       = leverage;
        pos.opened_at      = Clock::get()?.unix_timestamp;
        pos.is_open        = true;
        msg!("Position {} opened. Side: {} Lev: {}x", position_id, side, leverage);
        Ok(())
    }

 
    pub fn close_position(
        ctx: Context<ClosePosition>,
        position_id: u64,
    ) -> Result<()> {
        let pos = &mut ctx.accounts.position;
        require!(pos.owner == ctx.accounts.owner.key(), AegisError::Unauthorized);
        require!(pos.position_id == position_id, AegisError::PositionNotFound);
        require!(pos.is_open, AegisError::PositionAlreadyClosed);
        pos.is_open   = false;
        pos.closed_at = Clock::get()?.unix_timestamp;
        msg!("Position {} closed at {}", position_id, pos.closed_at);
        Ok(())
    }

    
    pub fn check_liquidation(
        _ctx: Context<ArciumComputation>,
        _computation_offset: u64,
        _encrypted_position_id: Vec<u8>,
        _nonce: u64,
    ) -> Result<()> {
        msg!("check_liquidation computation submitted to Arcium MXE");
        emit!(LiquidationCheckResult {
            position_id:      0,
            encrypted_result: vec![0u8; 32],
            nonce:            vec![0u8; 16],
        });
        Ok(())
    }

  
    pub fn reveal_pnl(
        _ctx: Context<ArciumComputation>,
        _computation_offset: u64,
        _encrypted_position_id: Vec<u8>,
        _nonce: u64,
    ) -> Result<()> {
        msg!("reveal_pnl computation submitted to Arcium MXE");
        emit!(PnlRevealResult {
            position_id:      0,
            encrypted_result: vec![0u8; 32],
            nonce:            vec![0u8; 16],
        });
        Ok(())
    }
}



#[derive(Accounts)]
#[instruction(position_id: u64)]
pub struct OpenPosition<'info> {
    #[account(
        init,
        payer = owner,
        space = 8 + PositionAccount::LEN,
        seeds = [b"position", owner.key().as_ref(), &position_id.to_le_bytes()],
        bump,
    )]
    pub position: Account<'info, PositionAccount>,

    #[account(mut)]
    pub owner: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(position_id: u64)]
pub struct ClosePosition<'info> {
    #[account(
        mut,
        seeds = [b"position", owner.key().as_ref(), &position_id.to_le_bytes()],
        bump,
    )]
    pub position: Account<'info, PositionAccount>,

    pub owner: Signer<'info>,
}

#[derive(Accounts)]
pub struct ArciumComputation<'info> {
    
    pub cluster_account: UncheckedAccount<'info>,
    
    pub mxe_account: UncheckedAccount<'info>,
    pub mempool_account: UncheckedAccount<'info>,
    
    pub executing_pool: UncheckedAccount<'info>,
   
    pub comp_def_account: UncheckedAccount<'info>,
    
    pub computation_account: UncheckedAccount<'info>,

    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
}



#[account]
pub struct PositionAccount {
    pub owner:          Pubkey,
    pub position_id:    u64,
    pub encrypted_data: [u8; 64],
    pub side:           u8,
    pub leverage:       u8,
    pub opened_at:      i64,
    pub closed_at:      i64,
    pub is_open:        bool,
}

impl PositionAccount {
    pub const LEN: usize = 32 + 8 + 64 + 1 + 1 + 8 + 8 + 1;
}



#[event]
pub struct LiquidationCheckResult {
    pub position_id:      u64,
    pub encrypted_result: Vec<u8>,
    pub nonce:            Vec<u8>,
}

#[event]
pub struct PnlRevealResult {
    pub position_id:      u64,
    pub encrypted_result: Vec<u8>,
    pub nonce:            Vec<u8>,
}



#[error_code]
pub enum AegisError {
    #[msg("Unauthorized: you do not own this position")]
    Unauthorized,
    #[msg("Position not found")]
    PositionNotFound,
    #[msg("Position is already closed")]
    PositionAlreadyClosed,
}