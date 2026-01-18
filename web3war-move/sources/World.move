module web3war::world {
    use std::string::{String};
    use std::vector;
    use std::signer;

    /// A Country in the world
    struct Country has store, drop {
        id: u64,
        code: String, // ISO Code (e.g. "TR")
        name: String,
        capital_region_id: u64,
    }

    /// A specific Map Region (Tile/Zone)
    struct Region has key, store {
        id: u64,
        name: String,
        owner_country_id: u64,
        resource_bonus: u8, // 1: None, 2: Iron, 3: Grain, etc.
    }

    /// Global definition of the World Map
    struct WorldMap has key {
        countries: vector<Country>,
        region_count: u64,
    }

    /// Initialize the world (Admin only)
    public entry fun init_world(admin: &signer) {
        // Assert admin logic here (omitted for prototype)
        
        move_to(admin, WorldMap {
            countries: vector::empty<Country>(),
            region_count: 0,
        });
    }

    /// Add a new country
    public entry fun add_country(admin: &signer, code: String, name: String, capital_id: u64) acquires WorldMap {
        let addr = signer::address_of(admin);
        let map = borrow_global_mut<WorldMap>(addr);
        
        let new_id = vector::length(&map.countries) + 1;
        let country = Country {
            id: new_id,
            code,
            name,
            capital_region_id: capital_id,
        };
        vector::push_back(&mut map.countries, country);
    }

    #[view]
    public fun country_exists(code: String): bool acquires WorldMap {
        if (!exists<WorldMap>(@web3war)) return false;
        let map = borrow_global<WorldMap>(@web3war);
        let i = 0;
        let len = vector::length(&map.countries);
        while (i < len) {
            let country = vector::borrow(&map.countries, i);
            if (country.code == code) {
                return true
            };
            i = i + 1;
        };
        };
        false
    }

    #[view]
    public fun get_country_info(country_id: u64): (String, u64) acquires WorldMap {
        if (!exists<WorldMap>(@web3war)) {
            return (std::string::utf8(b"Unknown"), 0)
        };
        let map = borrow_global<WorldMap>(@web3war);
        let i = 0;
        let len = vector::length(&map.countries);
        while (i < len) {
            let country = vector::borrow(&map.countries, i);
            if (country.id == country_id) {
                return (country.name, country.capital_region_id)
            };
            i = i + 1;
        };
        (std::string::utf8(b"Unknown"), 0)
    }
}
