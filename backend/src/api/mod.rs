use axum::{
    extract::State,
    http::StatusCode,
    response::IntoResponse,
    routing::get,
    Json, Router,
};
use std::time::{SystemTime, UNIX_EPOCH};

use crate::{db::DbPool, models::ApiResponse};

pub fn create_router(pool: DbPool) -> Router {
    Router::new()
        .route("/health", get(health_check))
        .route("/api/hello", get(hello))
        .with_state(pool)
}

async fn health_check() -> impl IntoResponse {
    (StatusCode::OK, "OK")
}

async fn hello(State(_pool): State<DbPool>) -> impl IntoResponse {
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
