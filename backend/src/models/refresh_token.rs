use chrono::{Duration, NaiveDateTime, Utc};
use diesel::prelude::*;
use serde::Deserialize;
use uuid::Uuid;

use crate::db::schema::refresh_tokens;

const REFRESH_TOKEN_DURATION_DAYS: i64 = 30;

#[derive(Debug, Queryable, Selectable)]
#[diesel(table_name = refresh_tokens)]
pub struct RefreshToken {
    pub id: String,
    pub user_id: i32,
    pub expires_at: NaiveDateTime,
    pub created_at: NaiveDateTime,
}

#[derive(Debug, Insertable)]
#[diesel(table_name = refresh_tokens)]
pub struct NewRefreshToken {
    pub id: String,
    pub user_id: i32,
    pub expires_at: NaiveDateTime,
}

impl NewRefreshToken {
    pub fn new(user_id: i32) -> Self {
        let now = Utc::now().naive_utc();
        let expires_at = now + Duration::days(REFRESH_TOKEN_DURATION_DAYS);

        Self {
            id: Uuid::new_v4().to_string(),
            user_id,
            expires_at,
        }
    }
}

#[derive(Debug, Deserialize)]
pub struct RefreshRequest {
    pub refresh_token: String,
}
