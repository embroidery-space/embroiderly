#![allow(clippy::future_not_send)]

#[cfg(feature = "idb")]
pub mod idb;
#[cfg(feature = "net")]
pub mod net;
#[cfg(feature = "opfs")]
pub mod opfs;
#[cfg(feature = "timers")]
pub mod timers;

mod error;
pub use error::Error;
