pub mod refresh_token;
pub mod user;

use serde::{Deserialize, Serialize};

pub use refresh_token::{NewRefreshToken, RefreshRequest, RefreshToken};
pub use user::{AuthResponse, LoginRequest, NewUser, RegisterRequest, User, UserResponse};

// Example model - add your own models here
#[derive(Debug, Serialize, Deserialize)]
pub struct ApiResponse {
    pub message: String,
    pub timestamp: i64,
}
