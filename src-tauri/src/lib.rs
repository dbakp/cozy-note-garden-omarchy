use serde::Serialize;
use serde_json::Value as JsonValue;
use std::{
    collections::HashMap,
    fs,
    path::{Path, PathBuf},
    process::Command,
    time::{SystemTime, UNIX_EPOCH},
};
use tauri::{AppHandle, Manager};

const DATA_FILE_NAME: &str = "garden.json";

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct OmarchyTheme {
    name: String,
    mode: String,
    font: String,
    colors: HashMap<String, String>,
}

fn data_file(app: &AppHandle) -> Result<PathBuf, String> {
    app.path()
        .app_data_dir()
        .map(|directory| directory.join(DATA_FILE_NAME))
        .map_err(|error| format!("Could not resolve the XDG data directory: {error}"))
}

fn validate_state(state: &JsonValue) -> Result<(), String> {
    if state.get("version").and_then(JsonValue::as_u64) != Some(1) {
        return Err("This backup uses an unsupported data version.".into());
    }
    if !state.get("notes").is_some_and(JsonValue::is_array)
        || !state.get("folders").is_some_and(JsonValue::is_array)
    {
        return Err("The file is not a valid Cozy Note Garden backup.".into());
    }
    Ok(())
}

fn write_json(path: &Path, state: &JsonValue) -> Result<(), String> {
    validate_state(state)?;
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent)
            .map_err(|error| format!("Could not create {}: {error}", parent.display()))?;
    }
    let json = serde_json::to_string_pretty(state)
        .map_err(|error| format!("Could not serialize the note library: {error}"))?;
    let temporary = path.with_extension("json.tmp");
    fs::write(&temporary, json)
        .map_err(|error| format!("Could not write {}: {error}", temporary.display()))?;
    fs::rename(&temporary, path)
        .map_err(|error| format!("Could not finalize {}: {error}", path.display()))
}

fn read_json(path: &Path) -> Result<JsonValue, String> {
    let content = fs::read_to_string(path)
        .map_err(|error| format!("Could not read {}: {error}", path.display()))?;
    let state = serde_json::from_str::<JsonValue>(&content)
        .map_err(|error| format!("Could not parse {}: {error}", path.display()))?;
    validate_state(&state)?;
    Ok(state)
}

#[tauri::command]
fn load_app_state(app: AppHandle) -> Result<Option<JsonValue>, String> {
    let path = data_file(&app)?;
    if !path.exists() {
        return Ok(None);
    }
    match read_json(&path) {
        Ok(state) => Ok(Some(state)),
        Err(error) => {
            let stamp = SystemTime::now()
                .duration_since(UNIX_EPOCH)
                .map(|duration| duration.as_secs())
                .unwrap_or_default();
            let backup = path.with_extension(format!("corrupt-{stamp}.json"));
            fs::copy(&path, &backup).map_err(|copy_error| {
                format!("{error} A safety copy could not be created: {copy_error}")
            })?;
            Err(format!(
                "{error} The original was preserved at {}.",
                backup.display()
            ))
        }
    }
}

#[tauri::command]
fn save_app_state(app: AppHandle, state: JsonValue) -> Result<(), String> {
    write_json(&data_file(&app)?, &state)
}

#[tauri::command]
fn get_data_file_path(app: AppHandle) -> Result<String, String> {
    data_file(&app).map(|path| path.to_string_lossy().into_owned())
}

#[tauri::command]
fn write_backup(path: String, state: JsonValue) -> Result<(), String> {
    write_json(Path::new(&path), &state)
}

#[tauri::command]
fn read_backup(path: String) -> Result<JsonValue, String> {
    read_json(Path::new(&path))
}

#[tauri::command]
fn get_omarchy_theme() -> Result<Option<OmarchyTheme>, String> {
    let home = std::env::var_os("HOME")
        .map(PathBuf::from)
        .ok_or_else(|| "HOME is not available".to_string())?;
    let current = home.join(".local/state/omarchy/current");
    let colors_path = current.join("theme/colors.toml");
    if !colors_path.exists() {
        return Ok(None);
    }

    let colors_source = fs::read_to_string(&colors_path)
        .map_err(|error| format!("Could not read {}: {error}", colors_path.display()))?;
    let table = colors_source
        .parse::<toml::Table>()
        .map_err(|error| format!("Could not parse the Omarchy palette: {error}"))?;
    let colors = table
        .iter()
        .filter_map(|(key, value)| value.as_str().map(|color| (key.clone(), color.to_string())))
        .collect::<HashMap<_, _>>();
    let mode = colors.get("mode").cloned().unwrap_or_else(|| "dark".into());
    let name = fs::read_to_string(current.join("theme.name"))
        .unwrap_or_else(|_| "Omarchy".into())
        .trim()
        .to_string();
    let font = Command::new("fc-match")
        .args(["monospace", "-f", "%{family}"])
        .output()
        .ok()
        .filter(|output| output.status.success())
        .map(|output| String::from_utf8_lossy(&output.stdout).to_string())
        .and_then(|families| families.split(',').next().map(str::trim).map(str::to_string))
        .filter(|font| !font.is_empty())
        .unwrap_or_else(|| "monospace".into());

    Ok(Some(OmarchyTheme { name, mode, font, colors }))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // WebKitGTK's DMABUF renderer can produce a fully black webview on a
    // subset of Wayland/Hyprland GPU combinations. Disable that path unless
    // the user has explicitly selected a renderer setting, keeping the app
    // visible and usable on Omarchy while retaining an escape hatch for
    // advanced setups.
    #[cfg(target_os = "linux")]
    if std::env::var_os("WEBKIT_DISABLE_DMABUF_RENDERER").is_none() {
        std::env::set_var("WEBKIT_DISABLE_DMABUF_RENDERER", "1");
    }

    tauri::Builder::default()
        .plugin(tauri_plugin_single_instance::init(|app, _, _| {
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.show();
                let _ = window.set_focus();
            }
        }))
        .plugin(tauri_plugin_window_state::Builder::default().build())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            load_app_state,
            save_app_state,
            get_data_file_path,
            write_backup,
            read_backup,
            get_omarchy_theme,
        ])
        .run(tauri::generate_context!())
        .expect("error while running Cozy Note Garden");
}

#[cfg(test)]
mod tests {
    use super::*;

    fn sample_state() -> JsonValue {
        serde_json::json!({
            "version": 1,
            "notes": [{
                "id": "note-1",
                "title": "Hello",
                "content": "<p>Garden</p>",
                "tags": [],
                "createdAt": "2026-08-26T00:00:00.000Z",
                "updatedAt": "2026-08-26T00:00:00.000Z"
            }],
            "folders": []
        })
    }

    #[test]
    fn validates_supported_state() {
        assert!(validate_state(&sample_state()).is_ok());
        assert!(validate_state(&serde_json::json!({ "version": 2, "notes": [], "folders": [] })).is_err());
        assert!(validate_state(&serde_json::json!({ "version": 1, "notes": {} })).is_err());
    }

    #[test]
    fn round_trips_a_library_atomically() {
        let stamp = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .expect("clock")
            .as_nanos();
        let directory = std::env::temp_dir().join(format!("cozy-note-garden-test-{stamp}"));
        let path = directory.join("garden.json");
        let state = sample_state();

        write_json(&path, &state).expect("write state");
        let loaded = read_json(&path).expect("read state");
        assert_eq!(loaded, state);
        assert!(!path.with_extension("json.tmp").exists());

        fs::remove_dir_all(directory).expect("clean test data");
    }
}
