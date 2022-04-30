use std::path::PathBuf;

use tauri::Manager;
use tauri::api::http::{ClientBuilder, HttpRequestBuilder, ResponseType};

use tauri::api::path::app_dir;

#[tauri::command]
pub async fn load_cards(
    window: tauri::Window,
    database: u32, 
    force_update: bool
) -> Result<String, String> {
    match (try_get_db_name(database), app_dir(&window.config())) {
        (Some(n), Some(v)) => do_load_cards(n, &v, force_update).await,
        _    => Err("Failed to get database".to_owned()), 
    }
    
}

pub async fn do_load_cards(
    name: &str,
    root: &PathBuf,
    force_update: bool
) -> Result<String, String> {

    let paths = match get_database_paths(root, name) {
        Some(v) => v,
        None    => return Err("Failed to get databae path".to_owned()),
    };

    let data = match force_update {
        true  => Err("".into()),
        false => load_cards_from_disk(&paths),
    };

    if let Ok(data) = data {
        return Ok(unsafe{ String::from_utf8_unchecked(data) } );
    }

    if force_update {
        eprintln!("Failed to read cache: {:?}", data);
    }

    match load_cards_from_mtgjson(name).await {
        Ok(data) => {
            if let Err(e) = write_cards_to_disk(&paths, &data) {
                eprintln!("Failed to write file: {}", e)
            }
            Ok(unsafe{ String::from_utf8_unchecked(data) } )
        },
        Err(e) => {
            eprintln!("Failed to download: {}", e);
            Err(e)
        }
    }
}

fn try_get_db_name(id: u32) -> Option<&'static str> {
    match id {
        0 => Some("AtomicCards"),
        _ => None,
    }
}

fn load_cards_from_disk(paths: &DatabasePaths) -> Result<Vec<u8>, String> {
    std::fs::read(&paths.path).map_err(|e| e.to_string())
}

fn write_cards_to_disk(paths: &DatabasePaths, data: &Vec<u8>) -> std::io::Result<()> {
    let DatabasePaths{root, path} = paths;
    std::fs::create_dir_all(root)?;
    std::fs::write(path, data)?;
    Ok(())
}

async fn load_cards_from_mtgjson(name: &str) -> Result<Vec<u8>, String> {
    let client = ClientBuilder::new().build().unwrap();
    let response = client.send(
        HttpRequestBuilder::new("GET", format!("https://mtgjson.com/api/v5/{}.json.xz", name))
            .unwrap()
            .response_type(ResponseType::Binary)
    ).await;

    match response {
        Ok(response) => match response.bytes().await {
            Ok(bytes) => decompress_xz(&bytes.data).map_err(|e| e.to_string()),
            Err(e)    => Err(e.to_string()),
        },
        Err(e) => Err(e.to_string()),
    }
}

fn decompress_xz(source: &Vec<u8>) -> Result<Vec<u8>, lzma_rs::error::Error> {
    let mut source = std::io::Cursor::new(source);
    let mut result: Vec<u8> = Vec::new();
    lzma_rs::xz_decompress(&mut source, &mut result).map(|_| result)
}

struct DatabasePaths {
    root: PathBuf,
    path: PathBuf,
}

fn get_database_paths(dir: &PathBuf, name: &str) -> Option<DatabasePaths> {
    let root = dir.to_owned();
    let path = root.join("database/").join(&name).with_extension("json");
    Some(DatabasePaths{root, path})
}