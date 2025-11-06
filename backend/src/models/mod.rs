pub mod refresh_token;
pub mod user;

use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

pub use refresh_token::{NewRefreshToken, RefreshRequest, RefreshToken};
pub use user::{AuthResponse, LoginRequest, NewUser, RegisterRequest, User, UserResponse};

// Example model - add your own models here
#[derive(Debug, Serialize, Deserialize, ToSchema)]
pub struct ApiResponse {
    pub message: String,
    pub timestamp: i64,
}
