#![cfg_attr(
	all(not(debug_assertions), target_os = "windows"),
	windows_subsystem = "windows"
)]

#![feature(proc_macro_hygiene, decl_macro)]

use std::path::PathBuf;
use rocket::{State, response::status::NotFound, response::content::Json};
use tauri::api::path::app_dir;

mod cards;

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![cards::load_cards])
        .setup(|app| {
			let root = app_dir(&app.config()).unwrap();
			tauri::async_runtime::spawn(
				rocket::build()
					.manage(AppDirRocket(root.to_owned()))
					.mount("/", rocket::routes![database])
					.launch()
			);
			Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

struct AppDirRocket(PathBuf);

#[rocket::get("/database/<name>?<force_update>")]
async fn database(dir: &State<AppDirRocket>, name: &str, force_update: Option<bool>) -> Result<Json<String>, NotFound<String>> {
	match cards::do_load_cards(name, &dir.0, force_update.unwrap_or(false)).await {
		Ok(v)  => Ok(Json(v)),
		Err(e) => Err(NotFound(e))
	}
}

