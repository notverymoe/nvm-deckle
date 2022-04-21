#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

use tauri::Manager;
use tauri::api::http::{RawResponse, ClientBuilder, HttpRequestBuilder, ResponseType};

use tauri::api::path::app_dir;

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![load_cards])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
async fn load_cards(
    window: tauri::Window,
    name: String, 
    force_update: bool
) -> Result<Vec<u8>, String> {
    let name = {
        if name.starts_with('/') {
            name.split_at(1).1
        } else {
            &name
        }
    };

    let root = app_dir(&window.config()).unwrap();
    let path = root.join("database/").join(&name);

    if !force_update {
        if let Ok(result) = std::fs::read(&path) {
            return Ok(result);
        }
    }

    let client = ClientBuilder::new().build().unwrap();
    let response = client.send(
        HttpRequestBuilder::new("GET", format!("https://mtgjson.com/api/v5/{}", name))
            .unwrap()
            .response_type(ResponseType::Binary)
    ).await;

    if let Ok(response) = response {
        if let Ok(response) = response.bytes().await {
            std::fs::create_dir_all(root).unwrap();
            std::fs::write(&path, &response.data).unwrap();
            return Ok(response.data);
        }
    }

    return Err("Failed to make request.".to_owned());
}