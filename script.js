// Script untuk mengelola jadwal PKL
document.addEventListener("DOMContentLoaded", () => {
    const scheduleForm = document.getElementById("scheduleForm");
    const scheduleList = document.getElementById("scheduleList");
  
    // Array untuk menyimpan jadwal
    let schedules = [];
  
    // Fungsi untuk menyimpan jadwal ke localStorage
    function saveSchedules() {
      localStorage.setItem("schedules", JSON.stringify(schedules));
    }
  
    // Fungsi untuk memuat jadwal dari localStorage
    function loadSchedules() {
      const savedSchedules = localStorage.getItem("schedules");
      if (savedSchedules) {
        schedules = JSON.parse(savedSchedules);
        renderSchedules();
      }
    }
  
    // Fungsi untuk merender daftar jadwal
    function renderSchedules() {
      scheduleList.innerHTML = "";
      schedules.forEach((schedule, index) => {
        const scheduleItem = document.createElement("div");
        scheduleItem.classList.add("bg-gray-100", "p-4", "rounded", "flex", "justify-between", "items-center");
        scheduleItem.innerHTML = `
          <div>
            <strong>${schedule.day} (${schedule.shift})</strong><br>
            <small>${schedule.date}</small><br>
            <span class="text-gray-600">${schedule.notes}</span>
          </div>
          <button onclick="deleteSchedule(${index})" class="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition duration-300">Hapus</button>
        `;
        scheduleList.appendChild(scheduleItem);
      });
    }
  
    // Fungsi untuk menambahkan jadwal
    scheduleForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const day = document.getElementById("day").value;
      const shift = document.getElementById("shift").value;
      const date = document.getElementById("date").value;
      const notes = document.getElementById("notes").value;
  
      if (day && shift && date) {
        schedules.push({ day, shift, date, notes });
        saveSchedules();
        renderSchedules();
        scheduleForm.reset();
      } else {
        alert("Silakan isi semua field!");
      }
    });
  
    // Fungsi untuk menghapus jadwal
    window.deleteSchedule = (index) => {
      schedules.splice(index, 1);
      saveSchedules();
      renderSchedules();
    };
  
    // Muat jadwal saat halaman dimuat
    loadSchedules();
  
    // Tampilkan jadwal hari ini dan besok di landing page
    if (window.location.pathname.includes("index.html")) {
      const today = new Date().toISOString().split("T")[0];
      const tomorrow = new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split("T")[0];
  
      const todayScheduleList = document.getElementById("todaySchedule");
      const tomorrowScheduleList = document.getElementById("tomorrowSchedule");
  
      const todaySchedules = schedules.filter((s) => s.date === today);
      const tomorrowSchedules = schedules.filter((s) => s.date === tomorrow);
  
      todayScheduleList.innerHTML = todaySchedules.length
        ? todaySchedules.map((s) => `<li>${s.day} (${s.shift}): ${s.notes || "Tidak ada catatan"}</li>`).join("")
        : "<li>Tidak ada jadwal hari ini.</li>";
  
      tomorrowScheduleList.innerHTML = tomorrowSchedules.length
        ? tomorrowSchedules.map((s) => `<li>${s.day} (${s.shift}): ${s.notes || "Tidak ada catatan"}</li>`).join("")
        : "<li>Tidak ada jadwal besok.</li>";
    }
  });