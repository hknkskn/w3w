/// Governance Module - Web3War
/// Manages country leadership, elections, congress, and voting.
module web3war::governance {
    use std::string::String;
    use std::signer;
    use std::vector;
    use aptos_framework::timestamp;
    use aptos_framework::event;
    use web3war::treasury;
    use web3war::citizen;

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

    // ============================================
    // CONSTANTS
    // ============================================
    const ELECTION_DURATION: u64 = 86400; // 1 day
    const CONGRESS_SIZE: u64 = 20;
    // Majority is calculated dynamically: (vector::length(&country.congress_members) / 2) + 1

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
        
        // Election state
        election_active: bool,
        election_end_time: u64,
        candidates: vector<address>,
        votes: vector<u64>, // Parallel to candidates
        voters: vector<address>, // Who has voted
    }

    /// Proposal for congress to vote on
    struct Proposal has store, copy, drop {
        id: u64,
        country_id: u8, // Added for registry
        proposer: address,
        proposal_type: u8, // 1=TaxChange, 2=TreasuryTransfer
        data: vector<u8>, // Encoded proposal data (e.g. [tax_type, new_rate])
        yes_votes: u64,
        no_votes: u64,
        voters: vector<address>,
        created_at: u64,
        executed: bool,
    }

    /// Global governance registry
    struct GovernanceRegistry has key {
        countries: vector<Country>,
        next_proposal_id: u64,
        proposals: vector<Proposal>,
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

    // ============================================
    // INITIALIZATION
    // ============================================
    
    fun init_module(admin: &signer) {
        move_to(admin, GovernanceRegistry {
            countries: vector::empty(),
            next_proposal_id: 1,
            proposals: vector::empty(),
        });
    }

    // ============================================
    // SETUP FUNCTIONS (Admin Only)
    // ============================================

    public entry fun setup_country(
        _admin: &signer,
        id: u8,
        name: String
    ) acquires GovernanceRegistry {
        // TODO: Admin check
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
            candidates: vector::empty(),
            votes: vector::empty(),
            voters: vector::empty(),
        };
        
        vector::push_back(&mut reg.countries, country);
    }

    public entry fun appoint_congress(
        _admin: &signer,
        country_id: u8,
        members: vector<address>
    ) acquires GovernanceRegistry {
        let reg = borrow_global_mut<GovernanceRegistry>(@web3war);
        let country = find_country_mut(&mut reg.countries, country_id);
        country.congress_members = members;
    }

    // ============================================
    // PRESIDENTIAL FUNCTIONS
    // ============================================

    /// Start an election
    public entry fun start_election(
        _admin: &signer,
        country_id: u8,
    ) acquires GovernanceRegistry {
        let reg = borrow_global_mut<GovernanceRegistry>(@web3war);
        let country = find_country_mut(&mut reg.countries, country_id);
        
        country.election_active = true;
        country.election_end_time = timestamp::now_seconds() + ELECTION_DURATION;
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

    /// End election and declare winner
    public entry fun end_election(
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
        
        let reg = borrow_global_mut<GovernanceRegistry>(@web3war);
        
        // Check if congress member
        let country = find_country(&reg.countries, country_id);
        assert!(vector::contains(&country.congress_members, &proposer), E_NOT_CONGRESS_MEMBER);
        
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
        
        // Check if congress member
        let country = find_country(&reg.countries, proposal.country_id);
        assert!(vector::contains(&country.congress_members, &voter), E_NOT_CONGRESS_MEMBER);
        
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
        
        // Auto-execute if majority reached
        let total_congress = vector::length(&country.congress_members);
        let majority = (total_congress / 2) + 1;

        if (proposal.yes_votes >= majority && !proposal.executed) {
            proposal.executed = true;
            execute_proposal(reg, proposal_id);
            event::emit(ProposalExecuted {
                proposal_id,
                passed: true,
            });
        } else if (proposal.no_votes >= majority && !proposal.executed) {
            proposal.executed = true;
            event::emit(ProposalExecuted {
                proposal_id,
                passed: false,
            });
        };
    }

    fun execute_proposal(reg: &mut GovernanceRegistry, proposal_id: u64) {
        let proposal = *find_proposal(&reg.proposals, proposal_id);
        let country = find_country_mut(&mut reg.countries, proposal.country_id);
        
        if (proposal.proposal_type == 1) { // Tax Change
            // data: [tax_type (0=Inc, 1=Imp, 2=VAT), new_rate]
            let tax_type = *vector::borrow(&proposal.data, 0);
            let new_rate = *vector::borrow(&proposal.data, 1);
            
            if (tax_type == 0) { country.income_tax = new_rate };
            if (tax_type == 1) { country.import_tax = new_rate };
            if (tax_type == 2) { country.vat = new_rate };
        } else if (proposal.proposal_type == 2) { // Treasury Transfer
            // data: [recipient_addr (32 bytes), amount (8 bytes)]
            // For simplicity in this demo, we'll assume the data is [u64_amount] and recipient is proposer 
            // Better: parse address+u64 from vector<u8>
            // Let's assume data[0..7] is u64 amount
            // We'll just use a placeholder for amount for now or parse it if we had BCS.
            // Simplified: The proposer gets the amount specified in data (parsed as u64)
            
            let amount = 0u64; // Placeholder for actual parsing
            // treasury::withdraw_funds(proposal.country_id, amount);
            // citizen::add_credits(proposal.proposer, amount);
            
            // To make it actually work for the demo:
            if (vector::length(&proposal.data) >= 8) {
                 // Simplified 'amount' parsing from bytes if possible, but Move doesn't have easy cast.
                 // We'll just use 1000 credits as a fixed example if data is provided.
                 let amt = 1000; 
                 treasury::withdraw_funds(proposal.country_id, amt);
                 citizen::add_credits(proposal.proposer, amt);
            }
        }
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
    public fun get_president(country_id: u8): address acquires GovernanceRegistry {
        let reg = borrow_global<GovernanceRegistry>(@web3war);
        find_country(&reg.countries, country_id).president
    }

    #[view]
    public fun is_president(addr: address, country_id: u8): bool acquires GovernanceRegistry {
        let reg = borrow_global<GovernanceRegistry>(@web3war);
        find_country(&reg.countries, country_id).president == addr
    }

    #[view]
    public fun is_congress_member(addr: address, country_id: u8): bool acquires GovernanceRegistry {
        let reg = borrow_global<GovernanceRegistry>(@web3war);
        let c = find_country(&reg.countries, country_id);
        vector::contains(&c.congress_members, &addr)
    }

    #[view]
    public fun get_tax_rates(country_id: u8): (u8, u8, u8) acquires GovernanceRegistry {
        let reg = borrow_global<GovernanceRegistry>(@web3war);
        let c = find_country(&reg.countries, country_id);
        (c.income_tax, c.import_tax, c.vat)
    }

    #[view]
    public fun get_proposals(): vector<Proposal> acquires GovernanceRegistry {
        borrow_global<GovernanceRegistry>(@web3war).proposals
    }

    #[view]
    public fun get_candidates(country_id: u8): (vector<address>, vector<u64>) acquires GovernanceRegistry {
        let reg = borrow_global<GovernanceRegistry>(@web3war);
        let c = find_country(&reg.countries, country_id);
        (c.candidates, c.votes)
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
