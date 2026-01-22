/// Treasury Module - Web3War
/// Manages country funds from taxes.
module web3war::treasury {
    use std::signer;
    use std::vector;
    use aptos_framework::event;

    const E_INSUFFICIENT_FUNDS: u64 = 1;
    const E_NOT_APPROVED: u64 = 2;

    struct DonorRecord has store, copy, drop {
        addr: address,
        amount: u64,
    }

    struct TreasuryBalance has store, copy, drop {
        country_id: u8,
        credits: u64,
        donors: vector<DonorRecord>,
    }

    struct TreasuryRegistry has key {
        balances: vector<TreasuryBalance>,
    }

    #[event]
    struct TaxDeposited has drop, store {
        country_id: u8,
        amount: u64,
        tax_type: u8, // 0=Tax, 1=Donation
    }

    fun init_module(admin: &signer) {
        if (!exists<TreasuryRegistry>(signer::address_of(admin))) {
            move_to(admin, TreasuryRegistry {
                balances: vector::empty(),
            });
        };
    }

    /// Donate CRED to a country treasury
    public entry fun donate_to_treasury(
        account: &signer,
        country_id: u8,
        amount: u64
    ) acquires TreasuryRegistry {
        let addr = signer::address_of(account);
        
        // Burn CRED from user (Donation) - Using internal_burn for simplicity or transfer to @web3war
        // Actually, treasury is just a number here. We should probably transfer coins if this was real.
        // But in this game architecture, treasury is a virtual balance.
        web3war::cred_coin::internal_burn(account, amount);
        
        let reg = borrow_global_mut<TreasuryRegistry>(@web3war);
        let i = 0;
        let len = vector::length(&reg.balances);
        let found = false;
        
        while (i < len) {
            let b = vector::borrow_mut(&mut reg.balances, i);
            if (b.country_id == country_id) {
                b.credits = b.credits + amount;
                
                // Update donor record
                let d_idx = 0;
                let d_len = vector::length(&b.donors);
                let d_found = false;
                while (d_idx < d_len) {
                    let d = vector::borrow_mut(&mut b.donors, d_idx);
                    if (d.addr == addr) {
                        d.amount = d.amount + amount;
                        d_found = true;
                        break
                    };
                    d_idx = d_idx + 1;
                };
                if (!d_found) {
                    vector::push_back(&mut b.donors, DonorRecord { addr, amount });
                };

                found = true;
                break
            };
            i = i + 1;
        };
        
        if (!found) {
            let donors = vector::empty();
            vector::push_back(&mut donors, DonorRecord { addr, amount });
            vector::push_back(&mut reg.balances, TreasuryBalance { country_id, credits: amount, donors });
        };
        
        event::emit(TaxDeposited { country_id, amount, tax_type: 1 });
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
            vector::push_back(&mut reg.balances, TreasuryBalance { country_id, credits: amount, donors: vector::empty() });
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
        0
    }

    #[view]
    public fun get_top_donors(country_id: u8): vector<DonorRecord> acquires TreasuryRegistry {
        let reg = borrow_global<TreasuryRegistry>(@web3war);
        let i = 0;
        let len = vector::length(&reg.balances);
        while (i < len) {
            let b = vector::borrow(&reg.balances, i);
            if (b.country_id == country_id) {
                return b.donors
            };
            i = i + 1;
        };
        vector::empty<DonorRecord>()
    }

    /// Deposit reward from game treasury to country treasury
    public fun deposit_reward(country_id: u8, amount: u64) acquires TreasuryRegistry {
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
            vector::push_back(&mut reg.balances, TreasuryBalance { 
                country_id, 
                credits: amount, 
                donors: vector::empty() 
            });
        };
    }
}
