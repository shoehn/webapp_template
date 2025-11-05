use axum::{
    extract::State,
    http::{header, StatusCode},
    response::{IntoResponse, Response},
    Extension, Json,
};
use diesel::prelude::*;
use validator::Validate;

use crate::{
    auth::{create_token, hash_password, verify_password, AuthUser},
    db::{schema::{refresh_tokens, users}, DbPool},
    models::{
        AuthResponse, LoginRequest, NewRefreshToken, NewUser, RefreshRequest, RegisterRequest,
        User, UserResponse,
    },
};

const COOKIE_MAX_AGE: i64 = 15 * 60; // 15 minutes in seconds

/// Register a new user
pub async fn register(
    State(pool): State<DbPool>,
    Json(payload): Json<RegisterRequest>,
) -> Result<Json<AuthResponse>, Response> {
    // Validate input
    payload.validate().map_err(|e| {
        (StatusCode::BAD_REQUEST, Json(serde_json::json!({
            "error": "Validation error",
            "details": e.to_string()
        })))
            .into_response()
    })?;

    // Hash password
    let password_hash = hash_password(&payload.password).map_err(|e| {
        tracing::error!("Failed to hash password: {:?}", e);
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            "Failed to process password",
        )
            .into_response()
    })?;

    // Create new user
    let new_user = NewUser {
        username: payload.username,
        email: payload.email.to_lowercase(),
        password_hash,
    };

    let mut conn = pool.get().map_err(|e| {
        tracing::error!("Failed to get database connection: {:?}", e);
        (StatusCode::INTERNAL_SERVER_ERROR, "Database error").into_response()
    })?;

    // Insert user
    let user: User = diesel::insert_into(users::table)
        .values(&new_user)
        .get_result(&mut conn)
        .map_err(|e| {
            tracing::error!("Failed to insert user: {:?}", e);
            match e {
                diesel::result::Error::DatabaseError(
                    diesel::result::DatabaseErrorKind::UniqueViolation,
                    _,
                ) => (StatusCode::CONFLICT, "Email or username already exists").into_response(),
                _ => (StatusCode::INTERNAL_SERVER_ERROR, "Failed to create user").into_response(),
            }
        })?;

    // Create tokens
    create_auth_response(user, &mut conn).await
}

/// Login with email and password
pub async fn login(
    State(pool): State<DbPool>,
    Json(payload): Json<LoginRequest>,
) -> Result<Response, Response> {
    let mut conn = pool.get().map_err(|e| {
        tracing::error!("Failed to get database connection: {:?}", e);
        (StatusCode::INTERNAL_SERVER_ERROR, "Database error").into_response()
    })?;

    // Find user by email
    let user: User = users::table
        .filter(users::email.eq(payload.email.to_lowercase()))
        .first(&mut conn)
        .map_err(|_| {
            (
                StatusCode::UNAUTHORIZED,
                "Invalid email or password",
            )
                .into_response()
        })?;

    // Check if user is active
    if !user.is_active {
        return Err((StatusCode::FORBIDDEN, "Account is disabled").into_response());
    }

    // Verify password
    let is_valid = verify_password(&payload.password, &user.password_hash).map_err(|e| {
        tracing::error!("Failed to verify password: {:?}", e);
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            "Failed to verify password",
        )
            .into_response()
    })?;

    if !is_valid {
        return Err((StatusCode::UNAUTHORIZED, "Invalid email or password").into_response());
    }

    // Create tokens and response
    let auth_response = create_auth_response(user, &mut conn).await?;

    // Create response with cookie
    Ok(create_response_with_cookie(auth_response))
}

/// Refresh access token using refresh token
pub async fn refresh(
    State(pool): State<DbPool>,
    Json(payload): Json<RefreshRequest>,
) -> Result<Response, Response> {
    let mut conn = pool.get().map_err(|e| {
        tracing::error!("Failed to get database connection: {:?}", e);
        (StatusCode::INTERNAL_SERVER_ERROR, "Database error").into_response()
    })?;

    // Find refresh token
    let refresh_token: crate::models::RefreshToken = refresh_tokens::table
        .find(&payload.refresh_token)
        .first(&mut conn)
        .map_err(|_| {
            (StatusCode::UNAUTHORIZED, "Invalid refresh token").into_response()
        })?;

    // Check if token is expired
    let now = chrono::Utc::now().naive_utc();
    if refresh_token.expires_at < now {
        // Delete expired token
        let _ = diesel::delete(refresh_tokens::table.find(&refresh_token.id))
            .execute(&mut conn);
        return Err((StatusCode::UNAUTHORIZED, "Refresh token expired").into_response());
    }

    // Get user
    let user: User = users::table
        .find(refresh_token.user_id)
        .first(&mut conn)
        .map_err(|_| {
            (StatusCode::UNAUTHORIZED, "User not found").into_response()
        })?;

    // Check if user is active
    if !user.is_active {
        return Err((StatusCode::FORBIDDEN, "Account is disabled").into_response());
    }

    // Create new access token
    let access_token = create_token(user.id, user.email.clone()).map_err(|e| {
        tracing::error!("Failed to create token: {:?}", e);
        (StatusCode::INTERNAL_SERVER_ERROR, "Failed to create token").into_response()
    })?;

    // Return response with new access token
    Ok(create_response_with_cookie(AuthResponse {
        user: user.into(),
        access_token: access_token.clone(),
        refresh_token: refresh_token.id,
    }))
}

/// Logout - invalidate refresh token
pub async fn logout(
    State(pool): State<DbPool>,
    Json(payload): Json<RefreshRequest>,
) -> Result<StatusCode, Response> {
    let mut conn = pool.get().map_err(|e| {
        tracing::error!("Failed to get database connection: {:?}", e);
        (StatusCode::INTERNAL_SERVER_ERROR, "Database error").into_response()
    })?;

    // Delete refresh token
    diesel::delete(refresh_tokens::table.find(&payload.refresh_token))
        .execute(&mut conn)
        .map_err(|e| {
            tracing::error!("Failed to delete refresh token: {:?}", e);
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                "Failed to logout",
            )
                .into_response()
        })?;

    Ok(StatusCode::NO_CONTENT)
}

/// Get current authenticated user
pub async fn me(
    State(pool): State<DbPool>,
    Extension(auth_user): Extension<AuthUser>,
) -> Result<Json<UserResponse>, Response> {
    let user_id: i32 = auth_user.0.sub.parse().map_err(|_| {
        (StatusCode::UNAUTHORIZED, "Invalid user ID").into_response()
    })?;

    let mut conn = pool.get().map_err(|e| {
        tracing::error!("Failed to get database connection: {:?}", e);
        (StatusCode::INTERNAL_SERVER_ERROR, "Database error").into_response()
    })?;

    let user: User = users::table.find(user_id).first(&mut conn).map_err(|_| {
        (StatusCode::NOT_FOUND, "User not found").into_response()
    })?;

    Ok(Json(user.into()))
}

// Helper functions

async fn create_auth_response(
    user: User,
    conn: &mut diesel::r2d2::PooledConnection<diesel::r2d2::ConnectionManager<diesel::SqliteConnection>>,
) -> Result<AuthResponse, Response> {
    // Create access token
    let access_token = create_token(user.id, user.email.clone()).map_err(|e| {
        tracing::error!("Failed to create token: {:?}", e);
        (StatusCode::INTERNAL_SERVER_ERROR, "Failed to create token").into_response()
    })?;

    // Create refresh token
    let new_refresh_token = NewRefreshToken::new(user.id);
    let refresh_token_id = new_refresh_token.id.clone();

    diesel::insert_into(refresh_tokens::table)
        .values(&new_refresh_token)
        .execute(conn)
        .map_err(|e| {
            tracing::error!("Failed to create refresh token: {:?}", e);
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                "Failed to create refresh token",
            )
                .into_response()
        })?;

    Ok(AuthResponse {
        user: user.into(),
        access_token,
        refresh_token: refresh_token_id,
    })
}

fn create_response_with_cookie(auth_response: AuthResponse) -> Response {
    let cookie = format!(
        "access_token={}; HttpOnly; SameSite=Lax; Path=/; Max-Age={}",
        auth_response.access_token, COOKIE_MAX_AGE
    );

    (
        StatusCode::OK,
        [(header::SET_COOKIE, cookie)],
        Json(auth_response),
    )
        .into_response()
}
