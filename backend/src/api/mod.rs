pub mod auth;

use axum::{
    extract::State,
    http::StatusCode,
    middleware,
    response::IntoResponse,
    routing::{get, post},
    Json, Router,
};
use std::time::{SystemTime, UNIX_EPOCH};

use crate::{auth::require_auth, db::DbPool, models::ApiResponse};

pub fn create_router(pool: DbPool) -> Router {
    let public_routes = Router::new()
        .route("/health", get(health_check))
        .route("/api/hello", get(hello))
        .route("/api/auth/register", post(auth::register))
        .route("/api/auth/login", post(auth::login))
        .route("/api/auth/refresh", post(auth::refresh))
        .route("/api/auth/logout", post(auth::logout));

    let protected_routes = Router::new()
        .route("/api/auth/me", get(auth::me))
        .route_layer(middleware::from_fn(require_auth));

    Router::new()
        .merge(public_routes)
        .merge(protected_routes)
        .with_state(pool)
}

/// Health check endpoint
#[utoipa::path(
    get,
    path = "/health",
    responses(
        (status = 200, description = "Service is healthy"),
    ),
    tag = "Health"
)]
pub async fn health_check() -> impl IntoResponse {
    (StatusCode::OK, "OK")
}

/// Example API endpoint
#[utoipa::path(
    get,
    path = "/api/hello",
    responses(
        (status = 200, description = "Hello message", body = ApiResponse),
    ),
    tag = "Example"
)]
pub async fn hello(State(_pool): State<DbPool>) -> impl IntoResponse {
    let timestamp = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_secs() as i64;

    let response = ApiResponse {
        message: "Hello from Axum!".to_string(),
        timestamp,
    };

    (StatusCode::OK, Json(response))
}
