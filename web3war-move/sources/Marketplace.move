module web3war::marketplace {
    use std::signer;
    use std::vector;
    use std::error;
    use web3war::commander;
    // use web3war::economy; // Need to expose resource transfer in Economy first

    /// Error codes
    const E_MARKET_NOT_INIT: u64 = 1;
    const E_ITEM_NOT_FOUND: u64 = 2;

    struct Listing has store, drop, copy {
        id: u64,
        seller: address,
        resource_type: u8, // 1: Iron, 2: Grain, 3: Oil
        amount: u64,
        price_gold: u64,
        active: bool,
    }

    struct Market has key {
        listings: vector<Listing>,
        next_id: u64,
    }

    public entry fun init_market(admin: &signer) {
        move_to(admin, Market {
            listings: vector::empty<Listing>(),
            next_id: 1,
        });
    }

    /// List an item for sale
    public entry fun list_item(account: &signer, resource_type: u8, amount: u64, price_gold: u64) acquires Market {
        let addr = signer::address_of(account);
        // TODO: Transfer resources from User to Contract Escrow (Needs economy::withdraw)
        
        let market = borrow_global_mut<Market>(@web3war);
        let id = market.next_id;
        market.next_id = id + 1;

        let listing = Listing {
            id,
            seller: addr,
            resource_type,
            amount,
            price_gold,
            active: true,
        };
        vector::push_back(&mut market.listings, listing);
    }

    /// Buy an item
    public entry fun buy_item(buyer: &signer, listing_id: u64) acquires Market {
        let buyer_addr = signer::address_of(buyer);
        let market = borrow_global_mut<Market>(@web3war);
        
        // Find listing (Linear search for prototype)
        let len = vector::length(&market.listings);
        let i = 0;
        while (i < len) {
            let listing = vector::borrow_mut(&mut market.listings, i);
            if (listing.id == listing_id && listing.active) {
                // 1. Pay Seller
                // This requires a transfer_gold function in Commander
                // commander::transfer_gold(buyer, listing.seller, listing.price_gold);

                // 2. Transfer Item to Buyer
                // economy::deposit(buyer_addr, listing.resource_type, listing.amount);

                listing.active = false;
                return
            };
            i = i + 1;
        };
        };
        abort E_ITEM_NOT_FOUND
    }

    #[view]
    public fun get_listings(): vector<Listing> acquires Market {
        if (!exists<Market>(@web3war)) {
            return vector::empty<Listing>()
        };
        let market = borrow_global<Market>(@web3war);
        market.listings
    }
}
