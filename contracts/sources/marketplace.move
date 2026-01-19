/// Marketplace Module - Web3War
/// Handles buying and selling of items (food, weapons, materials).
module web3war::marketplace {
    use std::signer;
    use std::vector;
    use aptos_framework::timestamp;
    use aptos_framework::event;
    
    use aptos_framework::coin;
    
    use web3war::inventory;
    use web3war::governance;
    use web3war::cred_coin::CRED;

    // ============================================
    // ERRORS
    // ============================================
    const E_LISTING_NOT_FOUND: u64 = 1;
    const E_INSUFFICIENT_FUNDS: u64 = 2;
    const E_NOT_OWNER: u64 = 3;
    const E_INVALID_QUANTITY: u64 = 4;
    const E_LISTING_EMPTY: u64 = 5;

    // ============================================
    // CONSTANTS
    // ============================================
    const TAX_RATE: u64 = 5; // 5% VAT

    // ============================================
    // STRUCTS
    // ============================================
    
    /// Item types
    struct ItemType has copy, drop, store {
        category: u8, // 1=Food, 2=Weapon, 3=Material, 4=Ticket
        quality: u8,  // 1-5 (Q1-Q5)
    }
    
    /// A listing in the marketplace
    struct Listing has key, store, copy, drop {
        id: u64,
        seller: address,
        item_type: ItemType,
        original_item_id: u64, // NEW: Preserve original item ID (e.g. 101 for Grain)
        quantity: u64,
        price_per_unit: u64, // In local currency
        country: u8, // Market location affects tax
        created_at: u64,
    }

    /// Global marketplace state
    struct MarketplaceState has key {
        next_listing_id: u64,
        active_listings: vector<Listing>,
    }

    // ============================================
    // EVENTS
    // ============================================
    #[event]
    struct ItemListed has drop, store {
        listing_id: u64,
        seller: address,
        item_category: u8,
        item_quality: u8,
        quantity: u64,
        price: u64,
    }

    #[event]
    struct ItemSold has drop, store {
        listing_id: u64,
        buyer: address,
        seller: address,
        quantity: u64,
        total_price: u64,
        tax_paid: u64,
    }

    #[event]
    struct ListingCancelled has drop, store {
        listing_id: u64,
        seller: address,
    }

    // ============================================
    // INITIALIZATION
    // ============================================
    
    fun init_module(admin: &signer) {
        if (!exists<MarketplaceState>(signer::address_of(admin))) {
            move_to(admin, MarketplaceState {
                next_listing_id: 1,
                active_listings: vector::empty(),
            });
        };
    }

    // ============================================
    // PUBLIC ENTRY FUNCTIONS
    // ============================================

    /// List an item for sale
    public entry fun list_item(
        account: &signer,
        item_id: u64,
        category: u8,
        quality: u8,
        quantity: u64,
        price_per_unit: u64,
        country: u8,
    ) acquires MarketplaceState {
        let seller = signer::address_of(account);
        
        assert!(quantity > 0, E_INVALID_QUANTITY);
        
        // Check and transfer items from seller's inventory (Escrow)
        inventory::remove_item(seller, item_id, quality, quantity);
        
        let state = borrow_global_mut<MarketplaceState>(@web3war);
        let listing_id = state.next_listing_id;
        state.next_listing_id = state.next_listing_id + 1;
        
        let listing = Listing {
            id: listing_id,
            seller,
            item_type: ItemType { category, quality },
            original_item_id: item_id,
            quantity,
            price_per_unit,
            country,
            created_at: timestamp::now_seconds(),
        };
        
        vector::push_back(&mut state.active_listings, listing);
        
    }

    /// Buy items from a listing
    public entry fun buy_item(
        account: &signer,
        listing_id: u64,
        quantity: u64,
    ) acquires MarketplaceState {
        let buyer = signer::address_of(account);
        
        let state = borrow_global_mut<MarketplaceState>(@web3war);
        
        // linear search to find index and modify
        let len = vector::length(&state.active_listings);
        let i = 0;
        let found = false;
        let index = 0;
        
        while (i < len) {
            let l = vector::borrow(&state.active_listings, i);
            if (l.id == listing_id) {
                found = true;
                index = i;
                break
            };
            i = i + 1;
        };
        
        if (!found) { abort E_LISTING_NOT_FOUND };
        
        // Scope for modification
        let seller_addr: address;
        let total_price: u64;
        let tax: u64;
        let listing_country: u8;
        let item_cat: u8;
        let item_qual: u8;
        let original_id: u64;
        let should_remove = false;
        
        {
            let listing = vector::borrow_mut(&mut state.active_listings, index);
            assert!(listing.quantity >= quantity, E_INVALID_QUANTITY);
            
            total_price = listing.price_per_unit * quantity;
            
            // Dynamic Tax from Governance
            let (_, _, vat_rate) = governance::get_tax_rates(listing.country);
            tax = (total_price * (vat_rate as u64)) / 100;
            
            seller_addr = listing.seller;
            listing_country = listing.country;
            item_cat = listing.item_type.category;
            item_qual = listing.item_type.quality;
            original_id = listing.original_item_id;
            
            listing.quantity = listing.quantity - quantity;
            if (listing.quantity == 0) {
                should_remove = true;
            };
        };
        
        if (should_remove) {
            vector::remove(&mut state.active_listings, index);
        };
        
        // Transfer Credits (FT TRANSFERS)
        coin::transfer<CRED>(account, seller_addr, total_price - tax);
        coin::transfer<CRED>(account, @web3war, tax); // Simplified: Transfer tax to admin/treasury addr
        // treasury::deposit_tax(listing_country, tax, 3); // We will update treasury to handle Coins later or keep this as tracking


        // Transfer Items
        inventory::add_item(
            buyer, 
            original_id, // RESTORED: use the original ID stored during listing
            item_cat, 
            item_qual, 
            quantity
        );
        
        event::emit(ItemSold {
            listing_id,
            buyer,
            seller: seller_addr,
            quantity,
            total_price,
            tax_paid: tax,
        });
    }

    /// Cancel a listing
    public entry fun cancel_listing(
        account: &signer,
        listing_id: u64,
    ) acquires MarketplaceState {
        let seller = signer::address_of(account);
        
        let state = borrow_global_mut<MarketplaceState>(@web3war);
        let listing = find_listing(&state.active_listings, listing_id);
        
        assert!(listing.seller == seller, E_NOT_OWNER);
        
        // Return items to seller's inventory
        inventory::add_item(
            seller, 
            listing.original_item_id, 
            listing.item_type.category, 
            listing.item_type.quality, 
            listing.quantity
        );
        
        remove_listing(&mut state.active_listings, listing_id);
        
        event::emit(ListingCancelled {
            listing_id,
            seller,
        });
    }

    // ============================================
    // VIEW FUNCTIONS
    // ============================================
    
    #[view]
    public fun get_listings_by_category(category: u8): vector<Listing> acquires MarketplaceState {
        let state = borrow_global<MarketplaceState>(@web3war);
        let result = vector::empty<Listing>();
        
        let len = vector::length(&state.active_listings);
        let i = 0;
        while (i < len) {
            let listing = vector::borrow(&state.active_listings, i);
            if (listing.item_type.category == category) {
                vector::push_back(&mut result, *listing);
            };
            i = i + 1;
        };
        
        result
    }

    #[view]
    public fun get_my_listings(seller: address): vector<Listing> acquires MarketplaceState {
        let state = borrow_global<MarketplaceState>(@web3war);
        let result = vector::empty<Listing>();
        
        let len = vector::length(&state.active_listings);
        let i = 0;
        while (i < len) {
            let listing = vector::borrow(&state.active_listings, i);
            if (listing.seller == seller) {
                vector::push_back(&mut result, *listing);
            };
            i = i + 1;
        };
        
        result
    }

    #[view]
    public fun get_listing(listing_id: u64): Listing acquires MarketplaceState {
        let state = borrow_global<MarketplaceState>(@web3war);
        *find_listing(&state.active_listings, listing_id)
    }

    // ============================================
    // INTERNAL FUNCTIONS
    // ============================================
    
    fun find_listing(listings: &vector<Listing>, id: u64): &Listing {
        let len = vector::length(listings);
        let i = 0;
        while (i < len) {
            let l = vector::borrow(listings, i);
            if (l.id == id) {
                return l
            };
            i = i + 1;
        };
        abort E_LISTING_NOT_FOUND
    }
    
    fun find_listing_mut(listings: &mut vector<Listing>, id: u64): &mut Listing {
        let len = vector::length(listings);
        let i = 0;
        while (i < len) {
            let l = vector::borrow_mut(listings, i);
            if (l.id == id) {
                return l
            };
            i = i + 1;
        };
        abort E_LISTING_NOT_FOUND
    }
    
    fun remove_listing(listings: &mut vector<Listing>, id: u64) {
        let len = vector::length(listings);
        let i = 0;
        while (i < len) {
            let l = vector::borrow(listings, i);
            if (l.id == id) {
                vector::remove(listings, i);
                return
            };
            i = i + 1;
        };
    }
}
