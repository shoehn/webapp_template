use axum::{
    extract::Request,
    http::{header, StatusCode},
    middleware::Next,
    response::{IntoResponse, Response},
};

use super::jwt::{verify_token, Claims};

/// Extension type to store authenticated user claims
#[derive(Clone, Debug)]
pub struct AuthUser(pub Claims);

/// Middleware to require authentication for a route
pub async fn require_auth(mut request: Request, next: Next) -> Result<Response, Response> {
    // Try to get token from cookie first
    let token = request
        .headers()
        .get(header::COOKIE)
        .and_then(|header| header.to_str().ok())
        .and_then(|cookies| {
            cookies
                .split(';')
                .find(|cookie| cookie.trim().starts_with("access_token="))
                .map(|cookie| cookie.trim().trim_start_matches("access_token="))
        })
        // Fallback to Authorization header
        .or_else(|| {
            request
                .headers()
                .get(header::AUTHORIZATION)
                .and_then(|header| header.to_str().ok())
                .and_then(|auth| auth.strip_prefix("Bearer "))
        });

    let token = token.ok_or_else(|| {
        (
            StatusCode::UNAUTHORIZED,
            "Missing authentication token".to_string(),
        )
            .into_response()
    })?;

    let claims = verify_token(token).map_err(|e| {
        tracing::warn!("Invalid token: {:?}", e);
        (
            StatusCode::UNAUTHORIZED,
            "Invalid or expired token".to_string(),
        )
            .into_response()
    })?;

    // Insert claims into request extensions
    request.extensions_mut().insert(AuthUser(claims));

    Ok(next.run(request).await)
}
