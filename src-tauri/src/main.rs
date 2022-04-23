#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

mod cards;

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![cards::load_cards])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
