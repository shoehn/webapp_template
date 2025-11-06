use argon2::{
    password_hash::{rand_core::OsRng, PasswordHash, PasswordHasher, PasswordVerifier, SaltString},
    Argon2,
};

/// Hash a password using Argon2id
///
/// Uses OWASP recommended parameters:
/// - Memory: 19 MiB
/// - Iterations: 2
/// - Parallelism: 1
pub fn hash_password(password: &str) -> Result<String, argon2::password_hash::Error> {
    let salt = SaltString::generate(&mut OsRng);
    let argon2 = Argon2::default();
    let password_hash = argon2.hash_password(password.as_bytes(), &salt)?;
    Ok(password_hash.to_string())
}

/// Verify a password against a hash
pub fn verify_password(password: &str, hash: &str) -> Result<bool, argon2::password_hash::Error> {
    let parsed_hash = PasswordHash::new(hash)?;
    let argon2 = Argon2::default();

    match argon2.verify_password(password.as_bytes(), &parsed_hash) {
        Ok(()) => Ok(true),
        Err(argon2::password_hash::Error::Password) => Ok(false),
        Err(e) => Err(e),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_hash_password() {
        let password = "my_secure_password123";
        let hash = hash_password(password).expect("Failed to hash password");
        assert!(!hash.is_empty());
        assert!(hash.starts_with("$argon2"));
    }

    #[test]
    fn test_verify_password_correct() {
        let password = "my_secure_password123";
        let hash = hash_password(password).expect("Failed to hash password");
        let result = verify_password(password, &hash).expect("Failed to verify password");
        assert!(result);
    }

    #[test]
    fn test_verify_password_incorrect() {
        let password = "my_secure_password123";
        let wrong_password = "wrong_password";
        let hash = hash_password(password).expect("Failed to hash password");
        let result = verify_password(wrong_password, &hash).expect("Failed to verify password");
        assert!(!result);
    }

    #[test]
    fn test_hash_produces_different_salts() {
        let password = "my_secure_password123";
        let hash1 = hash_password(password).expect("Failed to hash password");
        let hash2 = hash_password(password).expect("Failed to hash password");
        assert_ne!(hash1, hash2, "Same password should produce different hashes due to different salts");
    }
}
