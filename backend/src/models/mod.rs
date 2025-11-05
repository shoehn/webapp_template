use serde::{Deserialize, Serialize};

// Example model - add your own models here
#[derive(Debug, Serialize, Deserialize)]
pub struct ApiResponse {
    pub message: String,
    pub timestamp: i64,
}
