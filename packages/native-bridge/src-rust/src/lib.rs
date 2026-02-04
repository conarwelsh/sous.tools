use tauri::{plugin::{Builder, TauriPlugin}, Runtime};
use serde::{Serialize, Deserialize};
use sysinfo::{System, SystemExt, CpuExt};

#[derive(Debug, Serialize, Deserialize)]
pub struct SystemMetrics {
    pub cpu_usage: f32,
    pub memory_used: u64,
    pub memory_total: u64,
}

#[tauri::command]
fn get_system_metrics() -> SystemMetrics {
    let mut sys = System::new_all();
    sys.refresh_all();
    
    SystemMetrics {
        cpu_usage: sys.global_cpu_info().cpu_usage(),
        memory_used: sys.used_memory(),
        memory_total: sys.total_memory(),
    }
}

pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("sous-bridge")
        .invoke_handler(tauri::generate_handler![get_system_metrics])
        .build()
}
