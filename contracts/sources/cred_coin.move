/// Web3War Credits (CRED)
/// The single currency for the in-game economy.
module web3war::cred_coin {
    use std::string;
    use std::signer;
    use aptos_framework::coin;

    struct CRED {}

    struct Caps has key {
        mint: coin::MintCapability<CRED>,
        burn: coin::BurnCapability<CRED>,
        freeze: coin::FreezeCapability<CRED>,
    }

    /// Only called during genesis/deployment
    public entry fun initialize(admin: &signer) {
        let (burn_cap, freeze_cap, mint_cap) = coin::initialize<CRED>(
            admin,
            string::utf8(b"Web3War Credits"),
            string::utf8(b"CRED"),
            2, // decimals (cents)
            true, // monitor_supply
        );
        
        move_to(admin, Caps { mint: mint_cap, burn: burn_cap, freeze: freeze_cap });
        
        // Register the coin store for admin
        coin::register<CRED>(admin);
    }

    /// Admin can mint coins (e.g. for airdrops or initial treasury funding)
    public entry fun mint(admin: &signer, recipient: address, amount: u64) acquires Caps {
        let caps = borrow_global<Caps>(signer::address_of(admin));
        let coins = coin::mint(amount, &caps.mint);
        coin::deposit(recipient, coins);
    }
    
    /// Register a user to receive CRED
    public entry fun register(account: &signer) {
        coin::register<CRED>(account);
    }
}
