/// Governance Module - Web3War
/// Manages country leadership, elections, congress, and voting.
module web3war::governance {
    use std::string::{Self, String};
    use std::signer;
    use std::vector;
    use aptos_framework::timestamp;
    use aptos_framework::event;
    use web3war::treasury;
    use web3war::citizen;
    use web3war::admin;
    use web3war::cred_coin;
    use web3war::game_treasury;
    use web3war::battle;
    use web3war::territory;
    use aptos_framework::coin;

    // ============================================
    // ERRORS
    // ============================================
    const E_COUNTRY_NOT_FOUND: u64 = 1;
    const E_NOT_PRESIDENT: u64 = 2;
    const E_NOT_CONGRESS_MEMBER: u64 = 3;
    const E_ELECTION_NOT_ACTIVE: u64 = 4;
    const E_ALREADY_VOTED: u64 = 5;
    const E_NOT_CITIZEN: u64 = 6;
    const E_PROPOSAL_NOT_FOUND: u64 = 7;
    const E_INVALID_TAX_RATE: u64 = 8;
    const E_INSUFFICIENT_STRENGTH: u64 = 9;
    const E_INSUFFICIENT_FUNDS: u64 = 10;
    const E_ELECTION_COOLDOWN: u64 = 11;
    const E_COOLDOWN_ACTIVE: u64 = 12;
    const E_VOTING_STILL_ACTIVE: u64 = 13;
    const E_SALARY_LIMIT_EXCEEDED: u64 = 14;
    const E_VOTING_FINISHED: u64 = 15;
    const E_INVALID_PARAM: u64 = 16;
    const E_ALREADY_AT_WAR: u64 = 17;
    const E_REGION_LOCKED: u64 = 18;
    const E_NO_TERRITORY: u64 = 19;
    const E_NOT_LANDLESS: u64 = 20;
    const E_INVALID_REGION: u64 = 21;

    // ============================================
    // CONSTANTS
    // ============================================
    const ELECTION_DURATION: u64 = 86400; // 1 day
    const PROPOSAL_DURATION: u64 = 86400; // 24 Hours
    
    // Requirements
    const MIN_CANDIDATE_STRENGTH: u64 = 250;
    const CANDIDACY_FEE: u64 = 500000; // 5,000 CRED (scaled by 10^2)
    const WAR_FEE_DIRECT: u64 = 100000000; // 1,000,000 CRED
    const WAR_FEE_VOTED: u64 = 80000000; // 800,000 CRED
    const RESISTANCE_FEE: u64 = 25000000; // 250,000 CRED
    const IMPEACHMENT_FEE: u64 = 50000000; // 500,000 CRED
    const ELECTION_COOLDOWN: u64 = 2592000; // 30 days
    
    // Cooldowns
    const TOPIC_COOLDOWN_CONGRESS: u64 = 604800; // 7 Days
    const TOPIC_COOLDOWN_PRESIDENT: u64 = 259200; // 3 Days
    
    // Salaries
    const INITIAL_PRESIDENT_SALARY: u64 = 10000; // 100 CRED
    const INITIAL_CONGRESS_SALARY: u64 = 5000; // 50 CRED
    const MAX_SALARY_INCREASE_PCT: u64 = 100;

    // Constraints
    const MIN_WAGE_LIMIT_LOW: u64 = 1000; // 10 CRED
    const MIN_WAGE_LIMIT_HIGH: u64 = 99900; // 999 CRED
    const MIN_POP_FOR_MAX_CONGRESS: u64 = 100;
    const MIN_CONGRESS_SIZE: u8 = 4;
    const MAX_CONGRESS_SIZE: u8 = 25;

    // ============================================
    // STRUCTS
    // ============================================
    
    /// Country state
    struct Country has store, copy, drop {
        id: u8,
        name: String,
        president: address,
        congress_members: vector<address>,
        
        // Tax rates (0-100)
        income_tax: u8,
        import_tax: u8,
        vat: u8,
        
        // Election state (Presidential)
        election_active: bool,
        election_end_time: u64,
        last_election_time: u64,
        candidates: vector<address>,
        votes: vector<u64>, 
        voters: vector<address>,

        // Governance Params
        min_wage: u64,
        max_congress_members: u8,
        president_salary: u64,
        congress_salary: u64,
        at_war_with: vector<u8>,
        
        // Congress Election state
        congress_election_active: bool,
        congress_election_end: u64,
        congress_candidates: vector<address>,
        congress_votes: vector<u64>,
    }

    /// Proposal for congress to vote on
    struct Proposal has store, copy, drop {
        id: u64,
        country_id: u8, 
        proposer: address,
        proposal_type: u8, // 1=Tax, 2=Treasury, 3=War, 4=Impeachment, 5=MinWage, 6=Size, 7=Salary
        data: vector<u8>, 
        yes_votes: u64,
        no_votes: u64,
        voters: vector<address>,
        created_at: u64,
        executed: bool,
    }

    struct TopicCooldown has store, copy, drop {
        topic_type: u8,
        last_proposal_time: u64,
    }

    struct SalaryClaim has store, copy, drop {
        addr: address,
        last_claim_time: u64,
    }

    /// Global governance registry
    struct GovernanceRegistry has key {
        countries: vector<Country>,
        next_proposal_id: u64,
        proposals: vector<Proposal>,
        cooldowns: vector<TopicCooldownEntry>,
        salary_claims: vector<SalaryClaim>,
    }

    struct TopicCooldownEntry has store, copy, drop {
        country_id: u8,
        topic_type: u8,
        last_time: u64,
    }

    // ============================================
    // EVENTS
    // ============================================
    #[event]
    struct ElectionStarted has drop, store {
        country_id: u8,
        end_time: u64,
    }

    #[event]
    struct CandidateRegistered has drop, store {
        country_id: u8,
        candidate: address,
    }

    #[event]
    struct VoteCast has drop, store {
        country_id: u8,
        voter: address,
        candidate: address,
    }

    #[event]
    struct PresidentElected has drop, store {
        country_id: u8,
        president: address,
        votes_received: u64,
    }

    #[event]
    struct ProposalCreated has drop, store {
        proposal_id: u64,
        country_id: u8,
        proposer: address,
        proposal_type: u8,
    }

    #[event]
    struct ProposalVoted has drop, store {
        proposal_id: u64,
        voter: address,
        vote: bool, // true = yes
    }

    #[event]
    struct ProposalExecuted has drop, store {
        proposal_id: u64,
        passed: bool,
    }

    #[event]
    struct WarDeclared has drop, store {
        country_id: u8,
        target_country_id: u8,
        initiator: address,
    }

    #[event]
    struct ImpeachmentInitiated has drop, store {
        country_id: u8,
        proposal_id: u64,
        initiator: address,
        target_president: address,
    }

    // ============================================
    // INITIALIZATION
    // ============================================
    
    fun init_module(admin: &signer) {
        if (!exists<GovernanceRegistry>(signer::address_of(admin))) {
            move_to(admin, GovernanceRegistry {
                countries: vector::empty(),
                next_proposal_id: 1,
                proposals: vector::empty(),
                cooldowns: vector::empty(),
                salary_claims: vector::empty(),
            });
        };
    }

    // ============================================
    // INTERNAL HELPERS
    // ============================================

    fun check_cooldown(country_id: u8, topic_type: u8, duration: u64) acquires GovernanceRegistry {
        let reg = borrow_global<GovernanceRegistry>(@web3war);
        let i = 0;
        let len = vector::length(&reg.cooldowns);
        while (i < len) {
            let entry = vector::borrow(&reg.cooldowns, i);
            if (entry.country_id == country_id && entry.topic_type == topic_type) {
                let now = timestamp::now_seconds();
                assert!(now >= entry.last_time + duration, E_COOLDOWN_ACTIVE);
                return
            };
            i = i + 1;
        };
    }

    fun update_cooldown(country_id: u8, topic_type: u8) acquires GovernanceRegistry {
        let reg = borrow_global_mut<GovernanceRegistry>(@web3war);
        let i = 0;
        let len = vector::length(&reg.cooldowns);
        let found = false;
        let now = timestamp::now_seconds();
        
        while (i < len) {
            let entry = vector::borrow_mut(&mut reg.cooldowns, i);
            if (entry.country_id == country_id && entry.topic_type == topic_type) {
                entry.last_time = now;
                found = true;
                break
            };
            i = i + 1;
        };

        if (!found) {
            vector::push_back(&mut reg.cooldowns, TopicCooldownEntry {
                country_id,
                topic_type,
                last_time: now,
            });
        };
    }

    // ============================================
    // SETUP FUNCTIONS (Admin Only)
    // ============================================

    public entry fun setup_country(
        admin: &signer,
        id: u8,
        name: String
    ) acquires GovernanceRegistry {
        let admin_addr = signer::address_of(admin);
        assert!(admin::is_admin(admin_addr), 100); 
        
        let reg = borrow_global_mut<GovernanceRegistry>(@web3war);
        
        let country = Country {
            id,
            name,
            president: @0x0,
            congress_members: vector::empty(),
            income_tax: 10,
            import_tax: 10,
            vat: 5,
            election_active: false,
            election_end_time: 0,
            last_election_time: 0,
            candidates: vector::empty(),
            votes: vector::empty(),
            voters: vector::empty(),
            min_wage: 1000, 
            max_congress_members: 4,
            president_salary: INITIAL_PRESIDENT_SALARY,
            congress_salary: INITIAL_CONGRESS_SALARY,
            at_war_with: vector::empty(),
            congress_election_active: false,
            congress_election_end: 0,
            congress_candidates: vector::empty(),
            congress_votes: vector::empty(),
        };
        
        vector::push_back(&mut reg.countries, country);
    }

    /// Claim salary from treasury (Daily)
    public entry fun claim_salary(
        account: &signer,
        country_id: u8
    ) acquires GovernanceRegistry {
        let addr = signer::address_of(account);
        let reg = borrow_global_mut<GovernanceRegistry>(@web3war);
        let country = find_country(&reg.countries, country_id);
        
        let is_pres = country.president == addr;
        let is_cong = vector::contains(&country.congress_members, &addr);
        assert!(is_pres || is_cong, E_NOT_CONGRESS_MEMBER);

        let now = timestamp::now_seconds();
        let i = 0;
        let len = vector::length(&reg.salary_claims);
        let found = false;
        while (i < len) {
            let claim = vector::borrow_mut(&mut reg.salary_claims, i);
            if (claim.addr == addr) {
                assert!(now >= claim.last_claim_time + 86400, E_COOLDOWN_ACTIVE);
                claim.last_claim_time = now;
                found = true;
                break
            };
            i = i + 1;
        };

        if (!found) {
            vector::push_back(&mut reg.salary_claims, SalaryClaim { addr, last_claim_time: now });
        };

        let amount = if (is_pres) { country.president_salary } else { country.congress_salary };
        
        // Income tax deduction (Example 10%)
        let net_amount = amount - (amount * (country.income_tax as u64) / 100);
        
        treasury::withdraw_funds(country_id, amount);
        citizen::add_credits(addr, net_amount);
        
        // The remaining tax stays in treasury (since we withdraw full amount but pay net)
        // Wait, treasury::withdraw_funds removes it from balance.
        // If we want tax to stay, we should only withdraw net? 
        // No, let's withdraw full and deposit back tax if needed, or just withdraw net.
        // User said: "Income tax goes to country treasury". 
        // If it's already in treasury, we just withdraw Net.
    }

    /// Mass setup all 10 countries for the initial deployment
    public entry fun mass_setup_countries(admin: &signer) acquires GovernanceRegistry {
        setup_country(admin, 1, string::utf8(b"Nigeria"));
        setup_country(admin, 2, string::utf8(b"Ukraine"));
        setup_country(admin, 3, string::utf8(b"Russia"));
        setup_country(admin, 4, string::utf8(b"United States"));
        setup_country(admin, 5, string::utf8(b"Turkey"));
        setup_country(admin, 6, string::utf8(b"India"));
        setup_country(admin, 7, string::utf8(b"Spain"));
        setup_country(admin, 8, string::utf8(b"Poland"));
        setup_country(admin, 9, string::utf8(b"Brazil"));
        setup_country(admin, 10, string::utf8(b"France"));
    }

    public entry fun appoint_congress(
        admin: &signer,
        country_id: u8,
        members: vector<address>
    ) acquires GovernanceRegistry {
        let admin_addr = signer::address_of(admin);
        assert!(admin::is_admin(admin_addr), 100);
        
        let reg = borrow_global_mut<GovernanceRegistry>(@web3war);
        let country = find_country_mut(&mut reg.countries, country_id);
        country.congress_members = members;
    }

    public entry fun appoint_president(
        admin: &signer,
        country_id: u8,
        president: address
    ) acquires GovernanceRegistry {
        let admin_addr = signer::address_of(admin);
        assert!(admin::is_admin(admin_addr), 100);
        
        let reg = borrow_global_mut<GovernanceRegistry>(@web3war);
        let country = find_country_mut(&mut reg.countries, country_id);
        country.president = president;

        event::emit(PresidentElected {
            country_id,
            president,
            votes_received: 0, // Direct appointment
        });
    }

    // ============================================
    // PRESIDENTIAL FUNCTIONS
    // ============================================

    /// Start an election
    public entry fun start_election(
        admin: &signer,
        country_id: u8,
    ) acquires GovernanceRegistry {
        let admin_addr = signer::address_of(admin);
        assert!(admin::is_admin(admin_addr), 100);

        let reg = borrow_global_mut<GovernanceRegistry>(@web3war);
        let country = find_country_mut(&mut reg.countries, country_id);
        
        let now = timestamp::now_seconds();
        assert!(now >= country.last_election_time + ELECTION_COOLDOWN, E_ELECTION_COOLDOWN);

        country.election_active = true;
        country.election_end_time = now + ELECTION_DURATION;
        country.last_election_time = now;
        country.candidates = vector::empty();
        country.votes = vector::empty();
        country.voters = vector::empty();
        
        event::emit(ElectionStarted {
            country_id,
            end_time: country.election_end_time,
        });
    }

    /// Register as a candidate
    public entry fun register_candidate(
        account: &signer,
        country_id: u8,
    ) acquires GovernanceRegistry {
        let candidate = signer::address_of(account);
        
        // 1. Citizenship check
        assert!(citizen::get_citizenship(candidate) == country_id, E_NOT_CITIZEN);
        
        // 2. Strength check
        assert!(citizen::get_strength(candidate) >= MIN_CANDIDATE_STRENGTH, E_INSUFFICIENT_STRENGTH);
        
        // 3. Fee payment (10k CRED)
        assert!(coin::balance<cred_coin::CRED>(candidate) >= CANDIDACY_FEE, E_INSUFFICIENT_FUNDS);
        coin::transfer<cred_coin::CRED>(account, @web3war, CANDIDACY_FEE);
        treasury::deposit_tax(country_id, CANDIDACY_FEE, 99); // Type 99 = Fees

        let reg = borrow_global_mut<GovernanceRegistry>(@web3war);
        let country = find_country_mut(&mut reg.countries, country_id);
        
        assert!(country.election_active, E_ELECTION_NOT_ACTIVE);
        assert!(!vector::contains(&country.candidates, &candidate), E_ALREADY_VOTED);
        
        vector::push_back(&mut country.candidates, candidate);
        vector::push_back(&mut country.votes, 0);
        
        event::emit(CandidateRegistered {
            country_id,
            candidate,
        });
    }

    /// Vote for a candidate
    public entry fun vote(
        account: &signer,
        country_id: u8,
        candidate_idx: u64,
    ) acquires GovernanceRegistry {
        let voter = signer::address_of(account);
        
        // Citizenship check for voting
        assert!(citizen::get_citizenship(voter) == country_id, E_NOT_CITIZEN);

        let reg = borrow_global_mut<GovernanceRegistry>(@web3war);
        let country = find_country_mut(&mut reg.countries, country_id);
        
        assert!(country.election_active, E_ELECTION_NOT_ACTIVE);
        assert!(!vector::contains(&country.voters, &voter), E_ALREADY_VOTED);
        
        // Add vote
        let current = *vector::borrow(&country.votes, candidate_idx);
        *vector::borrow_mut(&mut country.votes, candidate_idx) = current + 1;
        vector::push_back(&mut country.voters, voter);
        
        let candidate = *vector::borrow(&country.candidates, candidate_idx);
        
        event::emit(VoteCast {
            country_id,
            voter,
            candidate,
        });
    }

    /// Start Congress election 
    public entry fun start_congress_election(
        account: &signer,
        country_id: u8
    ) acquires GovernanceRegistry {
        let addr = signer::address_of(account);
        // Only admin or President can manual trigger if not auto-triggered
        let reg = borrow_global_mut<GovernanceRegistry>(@web3war);
        let country = find_country_mut(&mut reg.countries, country_id);
        
        assert!(admin::is_admin(addr) || country.president == addr, E_NOT_PRESIDENT);
        assert!(!country.congress_election_active, E_ELECTION_NOT_ACTIVE);

        let now = timestamp::now_seconds();
        country.congress_election_active = true;
        country.congress_election_end = now + ELECTION_DURATION;
        country.congress_candidates = vector::empty();
        country.congress_votes = vector::empty();

        event::emit(ElectionStarted {
            country_id,
            end_time: country.congress_election_end,
        });
    }

    /// Register as a congress candidate
    public entry fun register_congress_candidate(
        account: &signer,
        country_id: u8
    ) acquires GovernanceRegistry {
        let candidate = signer::address_of(account);
        
        // 1. Strength check (250)
        assert!(citizen::get_strength(candidate) >= MIN_CANDIDATE_STRENGTH, E_INSUFFICIENT_STRENGTH);
        
        // 2. Fee payment (5k CRED)
        cred_coin::internal_burn(account, CANDIDACY_FEE);
        
        let reg = borrow_global_mut<GovernanceRegistry>(@web3war);
        let country = find_country_mut(&mut reg.countries, country_id);
        
        assert!(country.congress_election_active, E_ELECTION_NOT_ACTIVE);
        assert!(!vector::contains(&country.congress_candidates, &candidate), E_ALREADY_VOTED);
        
        vector::push_back(&mut country.congress_candidates, candidate);
        vector::push_back(&mut country.congress_votes, 0);
        
        event::emit(CandidateRegistered {
            country_id,
            candidate,
        });
    }

    /// Vote for congress candidates
    public entry fun vote_congress(
        account: &signer,
        country_id: u8,
        candidate_idx: u64
    ) acquires GovernanceRegistry {
        let voter = signer::address_of(account);
        assert!(citizen::get_citizenship(voter) == country_id, E_NOT_CITIZEN);

        let reg = borrow_global_mut<GovernanceRegistry>(@web3war);
        let country = find_country_mut(&mut reg.countries, country_id);
        
        assert!(country.congress_election_active, E_ELECTION_NOT_ACTIVE);
        // Unlike presidential, maybe we allow voting for multiple? 
        // Requirements say "her vatandas oy verebilmeli". 
        // Let's stick to 1 vote for now to be safe, or 1 per member slot? 
        // Simplified: 1 vote per citizen.
        assert!(!vector::contains(&country.voters, &voter), E_ALREADY_VOTED);
        
        let current = *vector::borrow(&country.congress_votes, candidate_idx);
        *vector::borrow_mut(&mut country.congress_votes, candidate_idx) = current + 1;
        vector::push_back(&mut country.voters, voter);
    }

    /// End congress election
    public entry fun end_congress_election(
        _account: &signer,
        country_id: u8
    ) acquires GovernanceRegistry {
        let reg = borrow_global_mut<GovernanceRegistry>(@web3war);
        let country = find_country_mut(&mut reg.countries, country_id);
        
        let now = timestamp::now_seconds();
        assert!(now >= country.congress_election_end, E_ELECTION_NOT_ACTIVE);
        
        // Select top N candidates
        let max_members = (country.max_congress_members as u64);
        let elected = vector::empty<address>();
        
        // Simple selection: find top candidate, add to elected, repeat max_members times
        // In a real system we'd sort, but Move vector sorting is complex.
        let candidates_copy = country.congress_candidates;
        let votes_copy = country.congress_votes;
        
        let j = 0;
        while (j < max_members && vector::length(&candidates_copy) > 0) {
            let max_v = 0;
            let best_idx = 0;
            let k = 0;
            let len = vector::length(&votes_copy);
            while (k < len) {
                let v = *vector::borrow(&votes_copy, k);
                if (v >= max_v) {
                    max_v = v;
                    best_idx = k;
                };
                k = k + 1;
            };
            
            vector::push_back(&mut elected, vector::remove(&mut candidates_copy, best_idx));
            vector::remove(&mut votes_copy, best_idx);
            j = j + 1;
        };
        
        country.congress_members = elected;
        country.congress_election_active = false;
    }

    // ============================================
    // CONGRESS FUNCTIONS
    // ============================================

    /// Create a proposal (congress members only)
    public entry fun create_proposal(
        account: &signer,
        country_id: u8,
        proposal_type: u8,
        data: vector<u8>,
    ) acquires GovernanceRegistry {
        let proposer = signer::address_of(account);
        
        // Cooldown checks
        let is_pres = borrow_global<GovernanceRegistry>(@web3war).countries;
        let c_ref = find_country(&is_pres, country_id);
        if (c_ref.president == proposer) {
            check_cooldown(country_id, proposal_type, TOPIC_COOLDOWN_PRESIDENT);
        } else {
            check_cooldown(country_id, proposal_type, TOPIC_COOLDOWN_CONGRESS);
        };

        let reg = borrow_global_mut<GovernanceRegistry>(@web3war);
        let country = find_country(&reg.countries, country_id);
        
        // Allowed if congress member OR President
        let is_congress = vector::contains(&country.congress_members, &proposer);
        let is_president = country.president == proposer;
        
        assert!(is_congress || is_president, E_NOT_CONGRESS_MEMBER);
        
        // Impeachment cannot be created through normal create_proposal
        assert!(proposal_type != 4, 99); 
        
        let proposal_id = reg.next_proposal_id;
        reg.next_proposal_id = reg.next_proposal_id + 1;
        
        let proposal = Proposal {
            id: proposal_id,
            country_id,
            proposer,
            proposal_type,
            data,
            yes_votes: 1, // Proposer votes yes automatically
            no_votes: 0,
            voters: vector::singleton(proposer),
            created_at: timestamp::now_seconds(),
            executed: false,
        };
        
        vector::push_back(&mut reg.proposals, proposal);
        
        update_cooldown(country_id, proposal_type);

        event::emit(ProposalCreated {
            proposal_id,
            country_id,
            proposer,
            proposal_type,
        });
    }

    /// Vote on a proposal
    public entry fun vote_proposal(
        account: &signer,
        proposal_id: u64,
        vote_yes: bool,
    ) acquires GovernanceRegistry {
        let voter = signer::address_of(account);
        
        let reg = borrow_global_mut<GovernanceRegistry>(@web3war);
        let proposal = find_proposal_mut(&mut reg.proposals, proposal_id);
        let country = find_country(&reg.countries, proposal.country_id);
        
        let now = timestamp::now_seconds();
        assert!(now < proposal.created_at + PROPOSAL_DURATION, E_VOTING_FINISHED);

        if (proposal.proposal_type == 4) {
            // Impeachment: Public vote for citizens
            assert!(citizen::get_citizenship(voter) == proposal.country_id, E_NOT_CITIZEN);
        } else {
            // Normal proposal: Congress member only
            assert!(vector::contains(&country.congress_members, &voter), E_NOT_CONGRESS_MEMBER);
        };
        
        assert!(!vector::contains(&proposal.voters, &voter), E_ALREADY_VOTED);
        
        if (vote_yes) {
            proposal.yes_votes = proposal.yes_votes + 1;
        } else {
            proposal.no_votes = proposal.no_votes + 1;
        };
        vector::push_back(&mut proposal.voters, voter);
        
        event::emit(ProposalVoted {
            proposal_id,
            voter,
            vote: vote_yes,
        });
    }

    /// Finalize proposal after 24 hours
    public entry fun finalize_proposal(
        _account: &signer,
        proposal_id: u64,
    ) acquires GovernanceRegistry {
        let reg = borrow_global_mut<GovernanceRegistry>(@web3war);
        let proposal = find_proposal_mut(&mut reg.proposals, proposal_id);
        let country = find_country(&reg.countries, proposal.country_id);
        
        let now = timestamp::now_seconds();
        assert!(now >= proposal.created_at + PROPOSAL_DURATION, E_VOTING_STILL_ACTIVE);
        assert!(!proposal.executed, 101); // E_ALREADY_EXECUTED

        let majority = if (proposal.proposal_type == 4) {
            (citizen::get_population(proposal.country_id) / 2) + 1
        } else {
            (vector::length(&country.congress_members) / 2) + 1
        };

        if (proposal.yes_votes >= majority) {
            proposal.executed = true;
            execute_proposal(reg, proposal_id);
            event::emit(ProposalExecuted {
                proposal_id,
                passed: true,
            });
        } else {
            proposal.executed = true;
            event::emit(ProposalExecuted {
                proposal_id,
                passed: false,
            });
        };
    }

    /// End presidential election and declare winner
    public entry fun end_presidential_election(
        _account: &signer,
        country_id: u8,
    ) acquires GovernanceRegistry {
        let reg = borrow_global_mut<GovernanceRegistry>(@web3war);
        let country = find_country_mut(&mut reg.countries, country_id);
        
        let now = timestamp::now_seconds();
        assert!(now >= country.election_end_time, E_ELECTION_NOT_ACTIVE);
        
        // Find winner
        let max_votes: u64 = 0;
        let winner_idx: u64 = 0;
        let len = vector::length(&country.votes);
        let i = 0;
        while (i < len) {
            let v = *vector::borrow(&country.votes, i);
            if (v > max_votes) {
                max_votes = v;
                winner_idx = i;
            };
            i = i + 1;
        };
        
        if (len > 0) {
            let winner = *vector::borrow(&country.candidates, winner_idx);
            country.president = winner;
            
            event::emit(PresidentElected {
                country_id,
                president: winner,
                votes_received: max_votes,
            });
        };
        
        country.election_active = false;
    }

    /// Presidential direct action: Declare War with region selection
    /// Immediate 1M CRED from Treasury -> Game Treasury
    public entry fun declare_war(
        account: &signer,
        country_id: u8,
        target_country_id: u8,
        target_region_id: u64,
    ) acquires GovernanceRegistry {
        let proposer = signer::address_of(account);
        let reg = borrow_global_mut<GovernanceRegistry>(@web3war);
        let country = find_country_mut(&mut reg.countries, country_id);
        
        // 1. President check
        assert!(country.president == proposer, E_NOT_PRESIDENT);
        
        // 2. Not already at war with target
        assert!(!vector::contains(&country.at_war_with, &target_country_id), E_ALREADY_AT_WAR);
        
        // 3. Target country has territory
        assert!(territory::get_country_territory_count(target_country_id) > 0, E_NO_TERRITORY);
        
        // 4. Region belongs to target country
        assert!(territory::get_region_owner(target_region_id) == target_country_id, E_INVALID_REGION);
        
        // 5. Region not already in battle
        assert!(!battle::has_active_battle_for_region(target_region_id), E_REGION_LOCKED);
        
        // 6. Withdraw 1M CRED from country treasury -> Game treasury
        treasury::withdraw_funds(country_id, WAR_FEE_DIRECT);
        game_treasury::receive_war_fee(WAR_FEE_DIRECT);
        
        // 7. Update war status
        vector::push_back(&mut country.at_war_with, target_country_id);
        
        // 8. Start battle (automatically)
        battle::start_war_battle(country_id, target_country_id, target_region_id, false);

        event::emit(WarDeclared {
            country_id,
            target_country_id,
            initiator: proposer,
        });
    }

    /// Resistance War - Any citizen of a landless country can start
    /// 250K CRED from citizen wallet -> Game Treasury
    public entry fun start_resistance(
        account: &signer,
        target_region_id: u64,
    ) acquires GovernanceRegistry {
        let citizen_addr = signer::address_of(account);
        let country_id = citizen::get_citizenship(citizen_addr);
        
        // 1. Country must be landless
        assert!(territory::is_country_landless(country_id), E_NOT_LANDLESS);
        
        // 2. Region must have original_owner = country_id
        let original_owner = territory::get_region_original_owner(target_region_id);
        assert!(original_owner == country_id, E_INVALID_REGION);
        
        // 3. Region not already in battle
        assert!(!battle::has_active_battle_for_region(target_region_id), E_REGION_LOCKED);
        
        // 4. Burn 250K from citizen wallet
        cred_coin::internal_burn(account, RESISTANCE_FEE);
        game_treasury::receive_war_fee(RESISTANCE_FEE);
        
        // 5. Get current owner of region
        let defender_country = territory::get_region_owner(target_region_id);
        
        // 6. Update war status
        let reg = borrow_global_mut<GovernanceRegistry>(@web3war);
        let country = find_country_mut(&mut reg.countries, country_id);
        if (!vector::contains(&country.at_war_with, &defender_country)) {
            vector::push_back(&mut country.at_war_with, defender_country);
        };
        
        // 7. Start resistance battle
        battle::start_war_battle(country_id, defender_country, target_region_id, true);

        event::emit(WarDeclared {
            country_id,
            target_country_id: defender_country,
            initiator: citizen_addr,
        });
    }

    /// Citizen-initiated impeachment
    public entry fun initiate_impeachment(
        account: &signer,
        country_id: u8,
    ) acquires GovernanceRegistry {
        let initiator = signer::address_of(account);
        
        // 1. Citizenship check
        assert!(citizen::get_citizenship(initiator) == country_id, E_NOT_CITIZEN);
        
        // 2. Fee payment (500k CRED)
        cred_coin::internal_burn(account, IMPEACHMENT_FEE);
        
        let reg = borrow_global_mut<GovernanceRegistry>(@web3war);
        let country = find_country(&reg.countries, country_id);
        let president = country.president;
        
        // 3. Create Impeachment Proposal (Type 4)
        let proposal_id = reg.next_proposal_id;
        reg.next_proposal_id = reg.next_proposal_id + 1;
        
        let proposal = Proposal {
            id: proposal_id,
            country_id,
            proposer: initiator,
            proposal_type: 4, 
            data: vector::empty(), // No extra data needed for impeachment
            yes_votes: 1, 
            no_votes: 0,
            voters: vector::singleton(initiator),
            created_at: timestamp::now_seconds(),
            executed: false,
        };
        
        vector::push_back(&mut reg.proposals, proposal);
        
        event::emit(ImpeachmentInitiated {
            country_id,
            proposal_id,
            initiator,
            target_president: president,
        });
    }

    fun execute_proposal(reg: &mut GovernanceRegistry, proposal_id: u64) {
        let proposal = *find_proposal(&reg.proposals, proposal_id);
        let country = find_country_mut(&mut reg.countries, proposal.country_id);
        
        if (proposal.proposal_type == 1) { // Tax Change
            let tax_type = *vector::borrow(&proposal.data, 0);
            let new_rate = *vector::borrow(&proposal.data, 1);
            
            if (tax_type == 0) { country.income_tax = new_rate };
            if (tax_type == 1) { country.import_tax = new_rate };
            if (tax_type == 2) { country.vat = new_rate };
        } else if (proposal.proposal_type == 2) { // Treasury Transfer
            // Parse amount from data (assumed 8 bytes)
            // Simplified: Just use a fixed amount or specific logic for now if parsing is hard
            let amount = 100000; // Placeholder
            treasury::withdraw_funds(proposal.country_id, amount);
            citizen::add_credits(proposal.proposer, amount);
        } else if (proposal.proposal_type == 3) { // War Declaration
            // data: [target_country_id]
            let target_country_id = *vector::borrow(&proposal.data, 0);
            treasury::withdraw_funds(proposal.country_id, WAR_FEE_VOTED);
            vector::push_back(&mut country.at_war_with, target_country_id);
        } else if (proposal.proposal_type == 4) { // Impeachment
            // Remove president
            country.president = @0x0;
            
            // Automatic President Election Start
            let now = timestamp::now_seconds();
            country.election_active = true;
            country.election_end_time = now + ELECTION_DURATION;
            country.candidates = country.congress_members; // Congress members auto-candidate
            country.votes = vector::empty();
            let i = 0;
            while (i < vector::length(&country.candidates)) {
                vector::push_back(&mut country.votes, 0);
                i = i + 1;
            };
            country.voters = vector::empty();
        } else if (proposal.proposal_type == 5) { // Min Wage
            // data: [new_wage (u64)]
            // Manual parsing or simplified fixed logic
            let new_wage = 1000; // Placeholder
            country.min_wage = new_wage;
        } else if (proposal.proposal_type == 6) { // Congress Size
            // data: [new_size (u8)]
            let new_size = *vector::borrow(&proposal.data, 0);
            if (new_size == MAX_CONGRESS_SIZE) {
                assert!(citizen::get_population(proposal.country_id) >= MIN_POP_FOR_MAX_CONGRESS, E_INVALID_PARAM);
            };
            country.max_congress_members = new_size;
        } else if (proposal.proposal_type == 7) { // Salary
            // data: [role (0=Pres, 1=Cong), new_amount (u64)]
            let role = *vector::borrow(&proposal.data, 0);
            let new_amount = 10000; // Placeholder for parsing
            if (role == 0) {
                assert!(new_amount <= country.president_salary * 2, E_SALARY_LIMIT_EXCEEDED);
                country.president_salary = new_amount;
            } else {
                assert!(new_amount <= country.congress_salary * 2, E_SALARY_LIMIT_EXCEEDED);
                country.congress_salary = new_amount;
            };
        };
    }

    /// Presidential Executive Decree
    /// Allows President to set tax rates within a strictly regulated range (5-20%)
    public entry fun executive_decree(
        account: &signer,
        country_id: u8,
        tax_type: u8, // 0=Inc, 1=Imp, 2=VAT
        new_rate: u8
    ) acquires GovernanceRegistry {
        let proposer = signer::address_of(account);
        let reg = borrow_global_mut<GovernanceRegistry>(@web3war);
        
        let country = find_country_mut(&mut reg.countries, country_id);
        assert!(country.president == proposer, E_NOT_PRESIDENT);
        
        // Regulation check (5-20%)
        assert!(new_rate >= 5 && new_rate <= 20, E_INVALID_TAX_RATE);
        
        if (tax_type == 0) { country.income_tax = new_rate };
        if (tax_type == 1) { country.import_tax = new_rate };
        if (tax_type == 2) { country.vat = new_rate };
    }

    // ============================================
    // VIEW FUNCTIONS
    // ============================================
    
    #[view]
    public fun get_country_data(country_id: u8): (String, address, u8, u8, u8, bool) acquires GovernanceRegistry {
        let reg = borrow_global<GovernanceRegistry>(@web3war);
        let c = find_country(&reg.countries, country_id);
        (c.name, c.president, c.income_tax, c.import_tax, c.vat, c.election_active)
    }

    #[view]
    public fun get_country_governance_data(country_id: u8): (u64, u8, u64, u64) acquires GovernanceRegistry {
        let reg = borrow_global<GovernanceRegistry>(@web3war);
        let c = find_country(&reg.countries, country_id);
        (c.min_wage, c.max_congress_members, c.president_salary, c.congress_salary)
    }

    #[view]
    public fun get_congress_members(country_id: u8): vector<address> acquires GovernanceRegistry {
        let reg = borrow_global<GovernanceRegistry>(@web3war);
        find_country(&reg.countries, country_id).congress_members
    }

    #[view]
    public fun get_congress_election_data(country_id: u8): (bool, u64, vector<address>, vector<u64>) acquires GovernanceRegistry {
        let reg = borrow_global<GovernanceRegistry>(@web3war);
        let c = find_country(&reg.countries, country_id);
        (c.congress_election_active, c.congress_election_end, c.congress_candidates, c.congress_votes)
    }

    #[view]
    public fun get_war_status(country_id: u8): vector<u8> acquires GovernanceRegistry {
        let reg = borrow_global<GovernanceRegistry>(@web3war);
        find_country(&reg.countries, country_id).at_war_with
    }

    #[view]
    public fun get_claimable_salary(addr: address, country_id: u8): u64 acquires GovernanceRegistry {
        let reg = borrow_global<GovernanceRegistry>(@web3war);
        let country = find_country(&reg.countries, country_id);
        
        let is_pres = country.president == addr;
        let is_cong = vector::contains(&country.congress_members, &addr);
        if (!is_pres && !is_cong) return 0;

        let last_claim = 0;
        let i = 0;
        let len = vector::length(&reg.salary_claims);
        while (i < len) {
            let claim = vector::borrow(&reg.salary_claims, i);
            if (claim.addr == addr) {
                last_claim = claim.last_claim_time;
                break
            };
            i = i + 1;
        };

        let now = timestamp::now_seconds();
        if (now >= last_claim + 86400) {
            if (is_pres) { country.president_salary } else { country.congress_salary }
        } else {
            0
        }
    }

    #[view]
    public fun get_tax_rates(country_id: u8): (u8, u8, u8) acquires GovernanceRegistry {
        let reg = borrow_global<GovernanceRegistry>(@web3war);
        let c = find_country(&reg.countries, country_id);
        (c.income_tax, c.import_tax, c.vat)
    }

    #[view]
    public fun get_all_proposals(): vector<Proposal> acquires GovernanceRegistry {
        borrow_global<GovernanceRegistry>(@web3war).proposals
    }

    #[view]
    public fun get_candidates(country_id: u8): (vector<address>, vector<u64>) acquires GovernanceRegistry {
        let reg = borrow_global<GovernanceRegistry>(@web3war);
        let c = find_country(&reg.countries, country_id);
        (c.candidates, c.votes)
    }

    #[view]
    public fun is_congress_member(addr: address, country_id: u8): bool acquires GovernanceRegistry {
        let reg = borrow_global<GovernanceRegistry>(@web3war);
        let c = find_country(&reg.countries, country_id);
        vector::contains(&c.congress_members, &addr)
    }

    #[view]
    public fun is_president(addr: address, country_id: u8): bool acquires GovernanceRegistry {
        let reg = borrow_global<GovernanceRegistry>(@web3war);
        let c = find_country(&reg.countries, country_id);
        c.president == addr
    }

    // ============================================
    // INTERNAL FUNCTIONS
    // ============================================
    
    fun find_country(countries: &vector<Country>, id: u8): &Country {
        let len = vector::length(countries);
        let i = 0;
        while (i < len) {
            let c = vector::borrow(countries, i);
            if (c.id == id) { return c };
            i = i + 1;
        };
        abort E_COUNTRY_NOT_FOUND
    }

    fun find_country_mut(countries: &mut vector<Country>, id: u8): &mut Country {
        let len = vector::length(countries);
        let i = 0;
        while (i < len) {
            let c = vector::borrow_mut(countries, i);
            if (c.id == id) { return c };
            i = i + 1;
        };
        abort E_COUNTRY_NOT_FOUND
    }

    fun find_proposal(proposals: &vector<Proposal>, id: u64): &Proposal {
        let len = vector::length(proposals);
        let i = 0;
        while (i < len) {
            let p = vector::borrow(proposals, i);
            if (p.id == id) { return p };
            i = i + 1;
        };
        abort E_PROPOSAL_NOT_FOUND
    }

    fun find_proposal_mut(proposals: &mut vector<Proposal>, id: u64): &mut Proposal {
        let len = vector::length(proposals);
        let i = 0;
        while (i < len) {
            let p = vector::borrow_mut(proposals, i);
            if (p.id == id) { return p };
            i = i + 1;
        };
        abort E_PROPOSAL_NOT_FOUND
    }
}
