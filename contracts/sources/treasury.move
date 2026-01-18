/// Treasury Module - Web3War
/// Manages country funds from taxes.
module web3war::treasury {
    use aptos_framework::event;

    const E_INSUFFICIENT_FUNDS: u64 = 1;
    const E_NOT_APPROVED: u64 = 2;

    struct TreasuryBalance has store, copy, drop {
        country_id: u8,
        credits: u64,
    }

    struct TreasuryRegistry has key {
        balances: vector<TreasuryBalance>,
    }

    #[event]
    struct TaxDeposited has drop, store {
        country_id: u8,
        amount: u64,
        tax_type: u8,
    }

    fun init_module(admin: &signer) {
        move_to(admin, TreasuryRegistry {
            balances: vector::empty(),
        });
    }

    public fun deposit_tax(country_id: u8, amount: u64, tax_type: u8) acquires TreasuryRegistry {
        let reg = borrow_global_mut<TreasuryRegistry>(@web3war);
        let i = 0;
        let len = vector::length(&reg.balances);
        let found = false;
        
        while (i < len) {
            let b = vector::borrow_mut(&mut reg.balances, i);
            if (b.country_id == country_id) {
                b.credits = b.credits + amount;
                found = true;
                break
            };
            i = i + 1;
        };
        
        if (!found) {
            vector::push_back(&mut reg.balances, TreasuryBalance { country_id, credits: amount });
        };
        
        event::emit(TaxDeposited { country_id, amount, tax_type });
    }

    #[view]
    public fun get_balance(country_id: u8): u64 acquires TreasuryRegistry {
        let reg = borrow_global<TreasuryRegistry>(@web3war);
        let i = 0;
        let len = vector::length(&reg.balances);
        
        while (i < len) {
            let b = vector::borrow(&reg.balances, i);
            if (b.country_id == country_id) {
                return b.credits
            };
            i = i + 1;
        };
        0
    }

    /// Internal helper for governance to spend treasury funds
    public fun withdraw_funds(country_id: u8, amount: u64): u64 acquires TreasuryRegistry {
        let reg = borrow_global_mut<TreasuryRegistry>(@web3war);
        let i = 0;
        let len = vector::length(&reg.balances);
        
        while (i < len) {
            let b = vector::borrow_mut(&mut reg.balances, i);
            if (b.country_id == country_id) {
                assert!(b.credits >= amount, E_INSUFFICIENT_FUNDS);
                b.credits = b.credits - amount;
                return amount
            };
            i = i + 1;
        };
        abort E_INSUFFICIENT_FUNDS
    }
}
