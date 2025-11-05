mod api;
mod auth;
mod config;
mod db;
mod models;

use config::Config;
use tower_http::cors::{Any, CorsLayer};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

#[tokio::main]
async fn main() {
    // Initialize tracing
    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "webapp_backend=debug,tower_http=debug".into()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    // Load environment variables from .env file if present
    dotenvy::dotenv().ok();

    // Load configuration
    let config = Config::from_env();
    let addr = config.address();

    // Set up database connection pool
    let pool = db::establish_connection_pool();

    // Configure CORS
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any)
        .allow_credentials(true);

    // Create router with all routes
    let app = api::create_router(pool).layer(cors);

    // Start server
    let listener = tokio::net::TcpListener::bind(&addr)
        .await
        .expect("Failed to bind to address");

    tracing::info!("Server listening on {}", addr);

    axum::serve(listener, app)
        .await
        .expect("Failed to start server");
}
