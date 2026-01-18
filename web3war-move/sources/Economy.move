module web3war::economy {
    use std::signer;
    use std::error;
    use web3war::commander;

    /// Error codes
    const E_NO_WALLET: u64 = 1;

    /// Holds the user's resources
    struct ResourceWallet has key {
        wood: u64,
        iron: u64,
        oil: u64,
        grain: u64,
        food: u64,
        weapons: u64,
    }

    /// Initialize the resource wallet for a user
    public entry fun init_wallet(account: &signer) {
        if (!exists<ResourceWallet>(signer::address_of(account))) {
            move_to(account, ResourceWallet {
                wood: 0,
                iron: 0,
                oil: 0,
                grain: 0,
                food: 0,
                weapons: 0,
            });
        }
    }

    /// Work action: Consumes 10 Energy, gives raw materials
    public entry fun work(account: &signer) acquires ResourceWallet {
        // 1. Consume Energy from Commander module
        commander::consume_energy(account, 10);

        // 2. Add Resources
        let addr = signer::address_of(account);
        assert!(exists<ResourceWallet>(addr), error::not_found(E_NO_WALLET));
        
        let wallet = borrow_global_mut<ResourceWallet>(addr);
        // Simple logic: Work gives randomish basic resources (fixed for now)
        wallet.iron = wallet.iron + 5;
        wallet.grain = wallet.grain + 5;
        
        // Also give some experience
        commander::add_rank_points(account, 1);
    }

    /// Train action: Consumes 10 Energy, gives Strength
    public entry fun train(account: &signer) {
        // 1. Consume Energy
        commander::consume_energy(account, 10);

        // 2. Add Strength
        commander::add_strength(account, 5); // +5 Strength

        // 3. Add Rank Points
        commander::add_rank_points(account, 2);
    }

    /// Manufacture action: Convert Raw -> Processed
    public entry fun craft_weapons(account: &signer, amount: u64) acquires ResourceWallet {
        let addr = signer::address_of(account);
        let wallet = borrow_global_mut<ResourceWallet>(addr);

        let cost_iron = amount * 10;
        assert!(wallet.iron >= cost_iron, 1001); // E_INSUFFICIENT_RESOURCES

        wallet.iron = wallet.iron - cost_iron;
        wallet.weapons = wallet.weapons + amount;
    }
    /// Distribute W3W to a user (Admin only - simplified mechanism)
    public entry fun distribute_w3w(admin: &signer, recipient: address, amount: u64) {
        // In real app, assert admin address
        commander::add_w3w(recipient, amount);
    }

    /// Helper: Deposit resource (Internal/Friend only usually, but public for prototype linkages)
    public fun deposit_resource(recipient: address, resource_type: u8, amount: u64) acquires ResourceWallet {
        assert!(exists<ResourceWallet>(recipient), error::not_found(E_NO_WALLET));
        let wallet = borrow_global_mut<ResourceWallet>(recipient);
        
        if (resource_type == 1) { wallet.iron = wallet.iron + amount; }
        else if (resource_type == 2) { wallet.grain = wallet.grain + amount; }
        else if (resource_type == 3) { wallet.oil = wallet.oil + amount; }
        // ... add others
    }

    /// Helper: Withdraw resource
    public fun withdraw_resource(owner: &signer, resource_type: u8, amount: u64) acquires ResourceWallet {
        let addr = signer::address_of(owner);
        assert!(exists<ResourceWallet>(addr), error::not_found(E_NO_WALLET));
        let wallet = borrow_global_mut<ResourceWallet>(addr);

        if (resource_type == 1) { 
            assert!(wallet.iron >= amount, 1001);
            wallet.iron = wallet.iron - amount; 
        } else if (resource_type == 2) {
            assert!(wallet.grain >= amount, 1001);
            wallet.grain = wallet.grain - amount;
        } else if (resource_type == 3) {
            assert!(wallet.oil >= amount, 1001);
            wallet.oil = wallet.oil - amount;
        }
    }

    #[view]
    public fun get_balance(addr: address): (u64, u64, u64, u64, u64, u64) acquires ResourceWallet {
        if (!exists<ResourceWallet>(addr)) {
            return (0, 0, 0, 0, 0, 0)
        };
        let wallet = borrow_global<ResourceWallet>(addr);
        (wallet.wood, wallet.iron, wallet.oil, wallet.grain, wallet.food, wallet.weapons)
    }
}
