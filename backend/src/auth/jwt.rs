use chrono::{Duration, Utc};
use jsonwebtoken::{decode, encode, DecodingKey, EncodingKey, Header, Validation};
use serde::{Deserialize, Serialize};
use std::env;

const ACCESS_TOKEN_DURATION_MINUTES: i64 = 15;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Claims {
    pub sub: String,      // Subject (user_id)
    pub email: String,    // User email
    pub exp: i64,         // Expiration time
    pub iat: i64,         // Issued at
}

impl Claims {
    pub fn new(user_id: i32, email: String) -> Self {
        let now = Utc::now();
        let expiration = now + Duration::minutes(ACCESS_TOKEN_DURATION_MINUTES);

        Self {
            sub: user_id.to_string(),
            email,
            exp: expiration.timestamp(),
            iat: now.timestamp(),
        }
    }
}

/// Create a new JWT access token
pub fn create_token(user_id: i32, email: String) -> Result<String, jsonwebtoken::errors::Error> {
    let claims = Claims::new(user_id, email);
    let secret = get_jwt_secret();
    encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(secret.as_bytes()),
    )
}

/// Verify and decode a JWT token
pub fn verify_token(token: &str) -> Result<Claims, jsonwebtoken::errors::Error> {
    let secret = get_jwt_secret();
    let validation = Validation::default();
    let token_data = decode::<Claims>(
        token,
        &DecodingKey::from_secret(secret.as_bytes()),
        &validation,
    )?;
    Ok(token_data.claims)
}

fn get_jwt_secret() -> String {
    env::var("JWT_SECRET").unwrap_or_else(|_| {
        tracing::warn!("JWT_SECRET not set, using default (NOT SECURE FOR PRODUCTION)");
        "your-secret-key-change-this-in-production".to_string()
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_create_token() {
        let token = create_token(1, "test@example.com".to_string()).expect("Failed to create token");
        assert!(!token.is_empty());
    }

    #[test]
    fn test_verify_token_valid() {
        let user_id = 1;
        let email = "test@example.com".to_string();
        let token = create_token(user_id, email.clone()).expect("Failed to create token");

        let claims = verify_token(&token).expect("Failed to verify token");
        assert_eq!(claims.sub, user_id.to_string());
        assert_eq!(claims.email, email);
    }

    #[test]
    fn test_verify_token_invalid() {
        let invalid_token = "invalid.token.here";
        let result = verify_token(invalid_token);
        assert!(result.is_err());
    }

    #[test]
    fn test_claims_contains_expiration() {
        let claims = Claims::new(1, "test@example.com".to_string());
        let now = Utc::now().timestamp();
        let expected_exp = now + (ACCESS_TOKEN_DURATION_MINUTES * 60);

        // Allow 2 second variance for test execution time
        assert!((claims.exp - expected_exp).abs() < 2);
    }
}
