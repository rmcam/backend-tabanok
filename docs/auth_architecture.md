graph LR
    subgraph Auth Module
        A[AuthController] --> B(AuthService)
        B --> C(UserService)
        B --> D(JwtService)
        B --> E(MailService)
        B --> F(StatisticsService)
        B --> G(ConfigService)
        B --> H(RevokedTokenRepository)

        style A fill:#f9f,stroke:#333,stroke-width:2px
        style B fill:#ccf,stroke:#333,stroke-width:2px
        style C fill:#ddf,stroke:#333,stroke-width:2px
        style D fill:#ddf,stroke:#333,stroke-width:2px
        style E fill:#ddf,stroke:#333,stroke-width:2px
        style F fill:#ddf,stroke:#333,stroke-width:2px
        style G fill:#ddf,stroke:#333,stroke-width:2px
        style H fill:#ddf,stroke:#333,stroke-width:2px
    end