module web3war::newspaper {
    use std::string::{String};
    use std::vector;
    use aptos_framework::timestamp;
    use std::signer;
    // use aptos_framework::coin;
    // use web3war::cred_coin::CRED;

    struct Newspaper has key {
        name: String,
        owner: address,
        subscriber_count: u64,
        articles: vector<Article>,
    }

    struct Article has store, copy, drop {
        id: u64,
        author: address,
        title: String,
        content_hash: String, // Store IPFS hash or small content
        timestamp: u64,
        votes: u64,
    }

    struct NewspaperConfig has key {
        admin: address,
        creation_fee: u64,
    }

    struct NewspaperRegistry has key {
        newspapers: vector<address>,
    }

    const E_NOT_OWNER: u64 = 1;
    const E_ALREADY_EXISTS: u64 = 2;

    fun init_module(admin: &signer) {
        if (!exists<NewspaperConfig>(signer::address_of(admin))) {
            move_to(admin, NewspaperConfig {
                admin: signer::address_of(admin),
                creation_fee: 2500 * 100000000, // 2500 SUPRA
            });
        };
        if (!exists<NewspaperRegistry>(signer::address_of(admin))) {
            move_to(admin, NewspaperRegistry {
                newspapers: vector::empty<address>(),
            });
        };
    }

    /// Update fees (Admin only)
    public entry fun update_fees(admin: &signer, new_fee: u64) acquires NewspaperConfig {
        let config = borrow_global_mut<NewspaperConfig>(@web3war);
        assert!(signer::address_of(admin) == config.admin, E_NOT_OWNER);
        config.creation_fee = new_fee;
    }

    public entry fun create_newspaper(account: &signer, name: String) acquires NewspaperRegistry, NewspaperConfig {
        let addr = signer::address_of(account);
        assert!(!exists<Newspaper>(addr), E_ALREADY_EXISTS);

        let config = borrow_global<NewspaperConfig>(@web3war);

        // Take fee in SUPRA
        aptos_framework::coin::transfer<0x1::supra_coin::SupraCoin>(account, @web3war, config.creation_fee);

        move_to(account, Newspaper {
            name,
            owner: addr,
            subscriber_count: 0,
            articles: vector::empty<Article>(),
        });

        let registry = borrow_global_mut<NewspaperRegistry>(@web3war);
        vector::push_back(&mut registry.newspapers, addr);
    }

    public entry fun publish_article(account: &signer, title: String, content_hash: String) acquires Newspaper {
        let addr = signer::address_of(account);
        assert!(exists<Newspaper>(addr), E_NOT_OWNER);

        let newspaper = borrow_global_mut<Newspaper>(addr);
        let article_id = vector::length(&newspaper.articles);

        let article = Article {
            id: article_id,
            author: addr,
            title,
            content_hash,
            timestamp: timestamp::now_seconds(),
            votes: 0,
        };

        vector::push_back(&mut newspaper.articles, article);
    }

    public entry fun endorse_article(newspaper_addr: address, article_id: u64) acquires Newspaper {
        let newspaper = borrow_global_mut<Newspaper>(newspaper_addr);
        let article = vector::borrow_mut(&mut newspaper.articles, article_id);
        article.votes = article.votes + 1;
    }

    public entry fun subscribe(newspaper_addr: address) acquires Newspaper {
        let newspaper = borrow_global_mut<Newspaper>(newspaper_addr);
        newspaper.subscriber_count = newspaper.subscriber_count + 1;
    }

    #[view]
    public fun get_newspaper_info(owner_addr: address): (String, u64, u64) acquires Newspaper {
        let newspaper = borrow_global<Newspaper>(owner_addr);
        (newspaper.name, newspaper.subscriber_count, vector::length(&newspaper.articles))
    }

    #[view]
    public fun get_articles(owner_addr: address): vector<Article> acquires Newspaper {
        let newspaper = borrow_global<Newspaper>(owner_addr);
        newspaper.articles
    }

    #[view]
    public fun get_all_newspapers(): vector<address> acquires NewspaperRegistry {
        let registry = borrow_global<NewspaperRegistry>(@web3war);
        registry.newspapers
    }
}
