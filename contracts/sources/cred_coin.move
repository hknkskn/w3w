/// Web3War Credits (CRED)
/// The single currency for the in-game economy.
module web3war::cred_coin {
    use std::string;
    use std::signer;
    use aptos_framework::coin;
    
    friend web3war::citizen;
    friend web3war::company;
    friend web3war::governance;

    struct CRED {}

    struct Caps has key {
        mint: coin::MintCapability<CRED>,
        burn: coin::BurnCapability<CRED>,
        freeze: coin::FreezeCapability<CRED>,
    }

    /// Only called during genesis/deployment
    public entry fun initialize(admin: &signer) {
        let addr = signer::address_of(admin);
        if (exists<Caps>(addr)) return;

        let (burn_cap, freeze_cap, mint_cap) = coin::initialize<CRED>(
            admin,
            string::utf8(b"Web3War Credits"),
            string::utf8(b"CRED"),
            2, // decimals (cents)
            true, // monitor_supply
        );
        
        move_to(admin, Caps { mint: mint_cap, burn: burn_cap, freeze: freeze_cap });
        
        // Register the coin store for admin if not already registered
        if (!coin::is_account_registered<CRED>(addr)) {
            coin::register<CRED>(admin);
        };
    }

    /// Admin can mint coins (e.g. for airdrops or initial treasury funding)
    public entry fun mint(admin: &signer, recipient: address, amount: u64) acquires Caps {
        let caller = signer::address_of(admin);
        // Ensure caller is an authorized admin
        assert!(web3war::admin::is_admin(caller), 100); // E_NOT_ADMIN
        
        let caps = borrow_global<Caps>(@web3war);
        let coins = coin::mint(amount, &caps.mint);
        coin::deposit(recipient, coins);
    }
    
    /// Register a user to receive CRED
    public entry fun register(account: &signer) {
        coin::register<CRED>(account);
    }

    /// Internal reward mint (Authorized modules only)
    public(friend) fun internal_mint(recipient: address, amount: u64) acquires Caps {
        let caps = borrow_global<Caps>(@web3war);
        let coins = coin::mint(amount, &caps.mint);
        coin::deposit(recipient, coins);
    }

    /// Internal burn (Authorized modules only)
    public(friend) fun internal_burn(account: &signer, amount: u64) acquires Caps {
        let caps = borrow_global<Caps>(@web3war);
        let coins = coin::withdraw<CRED>(account, amount);
        coin::burn(coins, &caps.burn);
    }
}
