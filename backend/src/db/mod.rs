pub mod schema;

use diesel::r2d2::{self, ConnectionManager};
use diesel::sqlite::SqliteConnection;
use std::env;

pub type DbPool = r2d2::Pool<ConnectionManager<SqliteConnection>>;

pub fn establish_connection_pool() -> DbPool {
    let database_url = env::var("DATABASE_URL").unwrap_or_else(|_| "database.db".to_string());
    let manager = ConnectionManager::<SqliteConnection>::new(database_url);
    r2d2::Pool::builder()
        .build(manager)
        .expect("Failed to create pool")
}
