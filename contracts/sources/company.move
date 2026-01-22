/// Company Module - Web3War
/// Advanced business management with Production Chain and Financials.
module web3war::company {
    use std::signer;
    use std::vector;
    // use aptos_framework::coin;
    use aptos_framework::event;
    
    use aptos_framework::coin;
    use web3war::cred_coin::CRED;
    use web3war::inventory;
    use web3war::citizen;
    use web3war::territory;
    use web3war::admin;
    use web3war::governance;

    // ============================================
    // ERRORS
    // ============================================
    const E_NOT_OWNER: u64 = 1;
    const E_ALREADY_EMPLOYED: u64 = 2;
    const E_NOT_EMPLOYEE: u64 = 3;
    const E_INSUFFICIENT_FUNDS: u64 = 4;
    const E_INSUFFICIENT_RAW_MATERIALS: u64 = 5;
    const E_NO_JOB_OFFER: u64 = 6;
    const E_COMPANY_NOT_FOUND: u64 = 7;

    // ============================================
    // CONSTANTS
    // ============================================
    // Company Types
    const TYPE_RAW_GRAIN: u8 = 1;
    const TYPE_RAW_IRON: u8 = 2;
    const TYPE_RAW_OIL: u8 = 3;
    const TYPE_RAW_ALUMINUM: u8 = 4;
    const TYPE_MFG_FOOD: u8 = 11;
    const TYPE_MFG_WEAPON: u8 = 12;
    const TYPE_MFG_TRANSPORT: u8 = 13;
    const TYPE_MFG_MISSILE: u8 = 14;

    // Item IDs Mapping
    const ID_RAW_GRAIN: u64 = 101;
    const ID_RAW_IRON: u64 = 102;
    const ID_RAW_OIL: u64 = 103;
    const ID_RAW_ALUMINUM: u64 = 104;
    const ID_MFG_FOOD: u64 = 201;
    const ID_MFG_WEAPON: u64 = 202;
    const ID_MFG_TRANSPORT: u64 = 203;
    const ID_MFG_MISSILE: u64 = 204;

    // Production Config (Simplified)
    const RAW_PER_WORK: u64 = 10;
    const MFG_PER_WORK: u64 = 5;
    const RAW_NEEDED_FOR_MFG: u64 = 2; // 2 Raw -> 1 Mfg unit

    // ============================================
    // STRUCTS
    // ============================================

    struct Company has key, store {
        id: u64,
        owner: address,
        name: vector<u8>,
        co_type: u8, 
        quality: u8,
        region_id: u64,
        
        // Finances
        balance: u64, 
        
        // Logistics
        raw_stock: u64,
        product_stock: u64,

        // HR
        employees: vector<address>,
        job_offer: JobOffer,
    }
    
    struct JobOffer has store, copy, drop {
        active: bool,
        salary: u64,
        open_positions: u64,
    }

    struct CompanyInfo has store, copy, drop {
        id: u64,
        owner: address,
        name: vector<u8>,
        co_type: u8,
        quality: u8,
        region_id: u64,
        balance: u64,
        raw_stock: u64,
        product_stock: u64,
        employees: vector<address>,
        job_offer: JobOffer,
    }

    struct CompanyConfig has key {
        admin: address,
        creation_fee: u64,
        upgrade_tier_2: u64,
        upgrade_tier_3: u64,
        upgrade_tier_4: u64,
        upgrade_tier_5: u64,
    }

    struct CompanyRegistry has key {
        next_id: u64,
        companies: vector<Company>,
    }

    // ============================================
    // EVENTS
    // ============================================
    #[event]
    struct CompanyCreated has drop, store { id: u64, owner: address, co_type: u8 }

    #[event]
    struct JobOfferPosted has drop, store { company_id: u64, salary: u64, positions: u64 }

    #[event]
    struct WorkPerformed has drop, store { 
        company_id: u64, 
        worker: address, 
        salary_paid: u64, 
        produced_qty: u64 
    }

    // ============================================
    // INITIALIZATION
    // ============================================
    
    fun init_module(admin: &signer) {
        let addr = signer::address_of(admin);
        if (!exists<CompanyRegistry>(addr)) {
            move_to(admin, CompanyRegistry { next_id: 1, companies: vector::empty() });
        };
        if (!exists<CompanyConfig>(addr)) {
            move_to(admin, CompanyConfig {
                admin: addr,
                creation_fee: 1000 * 100000000, 
                upgrade_tier_2: 2500 * 100000000,
                upgrade_tier_3: 5000 * 100000000,
                upgrade_tier_4: 10000 * 100000000,
                upgrade_tier_5: 20000 * 100000000,
            });
        };
    }

    /// Update fees (Admin only)
    public entry fun update_fees(
        admin: &signer,
        creation_fee: u64,
        u2: u64, u3: u64, u4: u64, u5: u64
    ) acquires CompanyConfig {
        let config = borrow_global_mut<CompanyConfig>(@web3war);
        assert!(signer::address_of(admin) == config.admin, E_NOT_OWNER);
        config.creation_fee = creation_fee;
        config.upgrade_tier_2 = u2;
        config.upgrade_tier_3 = u3;
        config.upgrade_tier_4 = u4;
        config.upgrade_tier_5 = u5;
    }

    // ============================================
    // PUBLIC ENTRY FUNCTIONS
    // ============================================

    /// Create a new company (Investment cost: 1000 SUPRA)
    public entry fun create_company(
        account: &signer,
        name: vector<u8>,
        co_type: u8,
        region_id: u64
    ) acquires CompanyRegistry, CompanyConfig {
        let owner = signer::address_of(account);
        let config = borrow_global<CompanyConfig>(@web3war);
        
        // Fee: 1000 SUPRA (Free for admins)
        if (!admin::is_admin(owner)) {
            aptos_framework::coin::transfer<0x1::supra_coin::SupraCoin>(account, @web3war, config.creation_fee);
        };

        let reg = borrow_global_mut<CompanyRegistry>(@web3war);
        let id = reg.next_id;
        reg.next_id = reg.next_id + 1;

        let company = Company {
            id,
            owner,
            name,
            co_type,
            quality: 1,
            region_id,
            balance: 0,
            raw_stock: 0,
            product_stock: 0,
            employees: vector::empty(),
            job_offer: JobOffer { active: false, salary: 0, open_positions: 0 },
        };
        vector::push_back(&mut reg.companies, company);
        
        event::emit(CompanyCreated { id, owner, co_type });
    }

    /// Deposit funds into company treasury (Transfer real FT CRED to game treasury)
    public entry fun deposit_funds(account: &signer, company_id: u64, amount: u64) acquires CompanyRegistry {
        coin::transfer<CRED>(account, @web3war, amount);


        let reg = borrow_global_mut<CompanyRegistry>(@web3war);
        let company = find_company_mut(&mut reg.companies, company_id);
        company.balance = company.balance + amount;
    }
    
    /// Update/Post job offer (Enforces Minimum Wage)
    public entry fun post_job_offer(
        account: &signer, 
        company_id: u64, 
        salary: u64, 
        positions: u64
    ) acquires CompanyRegistry {
        let owner = signer::address_of(account);
        let reg = borrow_global_mut<CompanyRegistry>(@web3war);
        let company = find_company_mut(&mut reg.companies, company_id);
        
        assert!(company.owner == owner, E_NOT_OWNER);
        
        // Minimum Wage Check
        let (min_wage, _, _, _) = governance::get_country_governance_data(web3war::territory::get_region_country(company.region_id));
        assert!(salary >= min_wage, 105); // E_BELOW_MIN_WAGE
        
        company.job_offer = JobOffer {
            active: positions > 0,
            salary,
            open_positions: positions
        };
        
        event::emit(JobOfferPosted { company_id, salary, positions });
    }

    /// Citizen performs work (Entry function)
    /// Subtracts energy, produces products, pays salary, and gives XP.
    public entry fun work(account: &signer, company_id: u64) acquires CompanyRegistry {
        let worker = signer::address_of(account);
        let strength = citizen::get_strength(worker);
        
        // 1. Consume Energy (Base 10)
        citizen::consume_energy(worker, 10);
        
        // 2. Perform Production & Pay Salary
        perform_work(worker, company_id, strength);
        
        // 3. Award XP and Rank Points
        citizen::add_experience(worker, 10, 2);
    }

    /// Withdraw products from company to owner's inventory
    public entry fun withdraw_product(
        account: &signer,
        company_id: u64,
        amount: u64
    ) acquires CompanyRegistry {
        let owner = signer::address_of(account);
        let reg = borrow_global_mut<CompanyRegistry>(@web3war);
        let company = find_company_mut(&mut reg.companies, company_id);
        
        assert!(company.owner == owner, E_NOT_OWNER);
        assert!(company.product_stock >= amount, 103); // E_INSUFFICIENT_STOCK
        
        company.product_stock = company.product_stock - amount;
        
        // Determine Category & ID
        let (cat, id) = get_company_output_info(company.co_type);
        inventory::add_item(owner, id, cat, company.quality, amount);
    }

    /// Deposit raw materials from owner's inventory into company stock
    public entry fun deposit_raw(
        account: &signer,
        company_id: u64,
        item_id: u64,
        quantity: u64
    ) acquires CompanyRegistry {
        let owner = signer::address_of(account);
        let reg = borrow_global_mut<CompanyRegistry>(@web3war);
        let company = find_company_mut(&mut reg.companies, company_id);
        
        // 1. Validation: Is this the right raw material for this company?
        let required_id = get_required_raw_id(company.co_type);
        assert!(required_id == item_id, 104); // E_WRONG_MATERIAL_TYPE
        
        // 2. Transfer from Inventory
        inventory::remove_item(owner, item_id, 1, quantity); // Raw is usually Q1
        
        // 3. Update Company Stock
        company.raw_stock = company.raw_stock + quantity;
    }

    // ============================================
    // HELPER FUNCTIONS (Internal)
    // ============================================

    fun get_company_output_info(co_type: u8): (u8, u64) {
        if (co_type == TYPE_RAW_GRAIN) { (3, ID_RAW_GRAIN) }
        else if (co_type == TYPE_RAW_IRON) { (3, ID_RAW_IRON) }
        else if (co_type == TYPE_RAW_OIL) { (3, ID_RAW_OIL) }
        else if (co_type == TYPE_RAW_ALUMINUM) { (3, ID_RAW_ALUMINUM) }
        else if (co_type == TYPE_MFG_FOOD) { (1, ID_MFG_FOOD) }
        else if (co_type == TYPE_MFG_WEAPON) { (2, ID_MFG_WEAPON) }
        else if (co_type == TYPE_MFG_TRANSPORT) { (4, ID_MFG_TRANSPORT) }
        else if (co_type == TYPE_MFG_MISSILE) { (2, ID_MFG_MISSILE) }
        else { (0, 0) }
    }

    fun get_required_raw_id(co_type: u8): u64 {
        if (co_type == TYPE_MFG_FOOD) { ID_RAW_GRAIN }
        else if (co_type == TYPE_MFG_WEAPON) { ID_RAW_IRON }
        else if (co_type == TYPE_MFG_TRANSPORT) { ID_RAW_OIL }
        else if (co_type == TYPE_MFG_MISSILE) { ID_RAW_ALUMINUM }
        else { 0 }
    }

    /// Citizen accepts a job
    public entry fun take_job(account: &signer, company_id: u64) acquires CompanyRegistry {
        let worker = signer::address_of(account);
        let reg = borrow_global_mut<CompanyRegistry>(@web3war);
        let company = find_company_mut(&mut reg.companies, company_id);
        
        // Validation
        assert!(company.job_offer.active, E_NO_JOB_OFFER);
        assert!(company.job_offer.open_positions > 0, E_NO_JOB_OFFER);
        assert!(!vector::contains(&company.employees, &worker), E_ALREADY_EMPLOYED);
        
        // Decrement positions
        company.job_offer.open_positions = company.job_offer.open_positions - 1;
        if (company.job_offer.open_positions == 0) {
            company.job_offer.active = false;
        };
        
        vector::push_back(&mut company.employees, worker);
        
        // Update Citizen profile
        citizen::set_employment(worker, company_id);
    }

    /// Citizen resigns from their current job
    public entry fun resign_job(account: &signer, company_id: u64) acquires CompanyRegistry {
        let worker = signer::address_of(account);
        let reg = borrow_global_mut<CompanyRegistry>(@web3war);
        let company = find_company_mut(&mut reg.companies, company_id);
        
        let (found, idx) = vector::index_of(&company.employees, &worker);
        assert!(found, E_NOT_EMPLOYEE);
        
        vector::remove(&mut company.employees, idx);
        
        // Reset Citizen employer status (0 = unemployed)
        citizen::set_employment(worker, 0);
    }

    /// Upgrade company quality level (using SUPRA)
    /// Higher quality = higher production but consumes more raw materials.
    public entry fun upgrade_quality(account: &signer, company_id: u64) acquires CompanyRegistry, CompanyConfig {
        let owner = signer::address_of(account);
        let reg = borrow_global_mut<CompanyRegistry>(@web3war);
        let config = borrow_global<CompanyConfig>(@web3war);
        let company = find_company_mut(&mut reg.companies, company_id);
        
        assert!(company.owner == owner, E_NOT_OWNER);
        assert!(company.quality < 5, 102); // Max Q5

        // Tiered Pricing based on current Quality
        let supra_cost = if (company.quality == 1) {
            config.upgrade_tier_2
        } else if (company.quality == 2) {
            config.upgrade_tier_3
        } else if (company.quality == 3) {
            config.upgrade_tier_4
        } else {
            config.upgrade_tier_5
        };

        if (!admin::is_admin(owner)) {
            aptos_framework::coin::transfer<0x1::supra_coin::SupraCoin>(account, @web3war, supra_cost);
        };

        company.quality = company.quality + 1;
    }

    /// Authorized Work Action (Called by Citizen via Main Loop mostly)
    /// Standard Pattern: `citizen::work` calls `company::perform_work`
    public fun perform_work(
        worker: address,
        company_id: u64,
        _strength: u64
    ) acquires CompanyRegistry {
        let reg = borrow_global_mut<CompanyRegistry>(@web3war);
        let company = find_company_mut(&mut reg.companies, company_id);
        
        // 1. Validate Employment
        assert!(vector::contains(&company.employees, &worker), E_NOT_EMPLOYEE);
        
        // 2. Validate Funds
        let salary = company.job_offer.salary;
        assert!(company.balance >= salary, E_INSUFFICIENT_FUNDS);
        
        // 3. Process Production & Consumption (SCALED BY QUALITY)
        let quality_multiplier = (company.quality as u64); // Q1=1x, Q7=7x
        let bonus_pct = territory::get_production_bonus(company.region_id, company.co_type);

        let produced_amount: u64;

        if (company.co_type <= 10) { 
            // RAW MATERIAL COMPANY
            let base_production = RAW_PER_WORK;
            
            // Production scales linearly with quality
            produced_amount = ((base_production * (100 + bonus_pct)) / 100) * quality_multiplier;
            
            // Add to internal company stock
            company.product_stock = company.product_stock + produced_amount;
        } else {
            // MFG COMPANY
            // Raw needs scale with output and quality
            let raw_needed = (RAW_NEEDED_FOR_MFG * MFG_PER_WORK) * quality_multiplier;
            
            // Consume from internal company stock
            assert!(company.raw_stock >= raw_needed, E_INSUFFICIENT_RAW_MATERIALS);
            company.raw_stock = company.raw_stock - raw_needed;
            
            // Bonus also applies to MFG output
            produced_amount = ((MFG_PER_WORK * (100 + bonus_pct)) / 100) * quality_multiplier;
            
            // Add finished goods to company stock
            company.product_stock = company.product_stock + produced_amount;
        };

        // 4. Pay Salary
        company.balance = company.balance - salary;
        citizen::add_credits(worker, salary);
        
        event::emit(WorkPerformed { company_id, worker, salary_paid: salary, produced_qty: produced_amount });
    }

    // ... (Helpers: find_company_mut)
    fun find_company_mut(companies: &mut vector<Company>, id: u64): &mut Company {
        let i = 0;
        let len = vector::length(companies);
        while (i < len) {
            let c = vector::borrow_mut(companies, i);
            if (c.id == id) { return c };
            i = i + 1;
        };
        abort E_COMPANY_NOT_FOUND
    }

    #[view]
    public fun get_all_companies(): vector<CompanyInfo> acquires CompanyRegistry {
        let reg = borrow_global<CompanyRegistry>(@web3war);
        let infos = vector::empty<CompanyInfo>();
        let i = 0;
        let len = vector::length(&reg.companies);
        
        while (i < len) {
            let c = vector::borrow(&reg.companies, i);
            let info = CompanyInfo {
                id: c.id,
                owner: c.owner,
                name: c.name,
                co_type: c.co_type,
                quality: c.quality,
                region_id: c.region_id,
                balance: c.balance,
                raw_stock: c.raw_stock,
                product_stock: c.product_stock,
                employees: c.employees,
                job_offer: c.job_offer,
            };
            vector::push_back(&mut infos, info);
            i = i + 1;
        };
        infos
    }
}
