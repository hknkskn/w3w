module web3war::commander {
    use std::string::{String};
    use std::signer;
    use std::error;

    /// Error codes
    const E_NOT_INITIALIZED: u64 = 1;
    const E_ALREADY_INITIALIZED: u64 = 2;
    const E_INSUFFICIENT_ENERGY: u64 = 3;

    /// struct representing a Battalion Commander (User)
    struct Commander has key {
        name: String,
        battalion_name: String,
        citizenship: String, // Country ID (e.g., "TR")
        rank: u8,         // 0: Squad, 1: Platoon, 2: Company, 3: Battalion
        rank_points: u64, // Experience towards next rank
        strength: u64,    // Combat power
        energy: u64,      // Current energy (Max 100)
        max_energy: u64,  // Upgradeable max energy
        gold: u64,        // Game currency (simplified)
        w3w_balance: u64, // Premium Token
        current_region_id: u64, // Current location
    }

    /// Initializes a new commander profile for the user
    public entry fun create_commander(account: &signer, name: String, battalion_name: String, citizenship: String) {
        let addr = signer::address_of(account);
        assert!(!exists<Commander>(addr), error::already_exists(E_ALREADY_INITIALIZED));
        
        // Validation: Check if country code exists in World
        // Note: For prototype with lazy init, we might skip strict check if WorldMap isn't posted yet
        // assert!(web3war::world::country_exists(citizenship), error::invalid_argument(404)); 

        let commander = Commander {
            name,
            battalion_name,
            citizenship,
            current_region_id: 1, // Default start region (e.g. Capital)
            rank: 0, // Starts as Squad Leader
            rank_points: 0,
            strength: 10, // Base strength
            energy: 100,
            max_energy: 100,
            gold: 0,
            w3w_balance: 0,
        };

        move_to(account, commander);
    }

    /// Consumes energy for actions (Work, Train, Fight)
    public fun consume_energy(account: &signer, amount: u64) acquires Commander {
        let addr = signer::address_of(account);
        assert!(exists<Commander>(addr), error::not_found(E_NOT_INITIALIZED));
        
        let commander = borrow_global_mut<Commander>(addr);
        assert!(commander.energy >= amount, error::invalid_state(E_INSUFFICIENT_ENERGY));

        commander.energy = commander.energy - amount;
    }

    /// Increases strength (Training reward)
    public fun add_strength(account: &signer, amount: u64) acquires Commander {
        let addr = signer::address_of(account);
        let commander = borrow_global_mut<Commander>(addr);
        commander.strength = commander.strength + amount;
    }

    /// Increases rank points and handles promotion logic
    public fun add_rank_points(account: &signer, amount: u64) acquires Commander {
        let addr = signer::address_of(account);
        let commander = borrow_global_mut<Commander>(addr);
        commander.rank_points = commander.rank_points + amount;

        // Simple promotion logic
        if (commander.rank == 0 && commander.rank_points >= 100) {
            commander.rank = 1; // Promotion to Platoon
        } else if (commander.rank == 1 && commander.rank_points >= 500) {
            commander.rank = 2; // Promotion to Company
        } else if (commander.rank == 2 && commander.rank_points >= 2000) {
            commander.rank = 3; // Promotion to Battalion
        };
    }

    // -- View Functions --

    #[view]
    public fun get_profile(addr: address): (String, String, u64, u8, u64, u64, u64) acquires Commander {
        let commander = borrow_global<Commander>(addr);
        (commander.name, commander.citizenship, commander.current_region_id, commander.rank, commander.strength, commander.energy, commander.w3w_balance)
    }

    // -- Economy Functions --

    /// Adds W3W tokens to a commander's balance
    public fun add_w3w(addr: address, amount: u64) acquires Commander {
        assert!(exists<Commander>(addr), error::not_found(E_NOT_INITIALIZED));
        let commander = borrow_global_mut<Commander>(addr);
        commander.w3w_balance = commander.w3w_balance + amount;
    }

    /// Spends W3W tokens from a commander's balance
    public fun spend_w3w(account: &signer, amount: u64) acquires Commander {
        let addr = signer::address_of(account);
        assert!(exists<Commander>(addr), error::not_found(E_NOT_INITIALIZED));
        
        let commander = borrow_global_mut<Commander>(addr);
        assert!(commander.w3w_balance >= amount, error::invalid_state(3001)); // E_INSUFFICIENT_FUNDS

        commander.w3w_balance = commander.w3w_balance - amount;
    }

    /// Transfers W3W tokens from sender to recipient
    public fun transfer_w3w(sender: &signer, recipient: address, amount: u64) acquires Commander {
        let sender_addr = signer::address_of(sender);
        spend_w3w(sender, amount); // Deduct from sender
        add_w3w(recipient, amount); // Add to recipient
    }
}
