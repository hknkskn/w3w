/// Alliance Module - Web3War
/// Manages Mutual Protection Pacts (MPPs) between countries.
module web3war::alliance {
    use std::signer;
    use std::vector;
    use aptos_framework::timestamp;
    use aptos_framework::event;

    const E_ALLIANCE_EXISTS: u64 = 1;
    const E_ALLIANCE_NOT_FOUND: u64 = 2;

    struct MPP has store, copy, drop {
        id: u64,
        country_a: u8,
        country_b: u8,
        created_at: u64,
        expires_at: u64,
        gold_cost: u64,
    }

    struct AllianceRegistry has key {
        next_id: u64,
        active_mpps: vector<MPP>,
    }

    #[event]
    struct MPPSigned has drop, store {
        id: u64,
        country_a: u8,
        country_b: u8,
        expires_at: u64,
    }

    fun init_module(admin: &signer) {
        if (!exists<AllianceRegistry>(signer::address_of(admin))) {
            move_to(admin, AllianceRegistry { next_id: 1, active_mpps: vector::empty() });
        };
    }

    /// Sign MPP (requires both countries' approval - simplified)
    public entry fun sign_mpp(
        _account: &signer,
        country_a: u8,
        country_b: u8,
        duration_days: u64,
        gold_cost: u64,
    ) acquires AllianceRegistry {
        let reg = borrow_global_mut<AllianceRegistry>(@web3war);
        let id = reg.next_id;
        reg.next_id = reg.next_id + 1;
        
        let now = timestamp::now_seconds();
        let expires = now + (duration_days * 86400);
        
        let mpp = MPP { id, country_a, country_b, created_at: now, expires_at: expires, gold_cost };
        vector::push_back(&mut reg.active_mpps, mpp);
        
        event::emit(MPPSigned { id, country_a, country_b, expires_at: expires });
    }

    #[view]
    public fun has_mpp(country_a: u8, country_b: u8): bool acquires AllianceRegistry {
        let reg = borrow_global<AllianceRegistry>(@web3war);
        let now = timestamp::now_seconds();
        let i = 0;
        while (i < vector::length(&reg.active_mpps)) {
            let mpp = vector::borrow(&reg.active_mpps, i);
            if (mpp.expires_at > now) {
                if ((mpp.country_a == country_a && mpp.country_b == country_b) ||
                    (mpp.country_a == country_b && mpp.country_b == country_a)) {
                    return true
                }
            };
            i = i + 1;
        };
        false
    }
}
