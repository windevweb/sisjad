// Initialize Supabase Client
const supabaseUrl = 'https://eyzvqdknrkkjznqvmxgb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV5enZxZGtucmtranpucXZteGdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg0OTc1NzksImV4cCI6MjA1NDA3MzU3OX0.v-3bKrF431br9SKSXPzUOHU-f4CW_4SAgtSic502sbs';

const { createClient } = supabase;
const supabaseClient = createClient(supabaseUrl, supabaseKey);

let schedules = [];

// Load Schedules from Supabase
async function loadSchedules() {
  const { data, error } = await supabaseClient
    .from('schedules')
    .select('*')
    .order('date', { ascending: true });

  if (error) {
    console.error('Error loading schedules:', error);
  } else {
    schedules = data; // Update local schedules array
    renderSchedules();
  }
}

// Format Date (e.g., "13 Februari")
function formatDate(dateString) {
  const options = { day: 'numeric', month: 'long' };
  return new Date(dateString).toLocaleDateString('id-ID', options);
}

// Render Schedules
function renderSchedules(filteredSchedules = schedules) {
  const scheduleList = document.getElementById('scheduleList');
  scheduleList.innerHTML = '';
  filteredSchedules.forEach((schedule, index) => {
    const card = document.createElement('div');
    card.classList.add(
      'bg-white',
      'p-4',
      'rounded-lg',
      'shadow-md',
      'transform',
      'transition-transform',
      'hover:scale-105'
    );

    // Badge Color Based on Shift
    const badgeColors = {
      Pagi: 'bg-gradient-to-r from-yellow-400 to-yellow-600',
      Siang: 'bg-gradient-to-r from-green-400 to-green-600',
      Sore: 'bg-gradient-to-r from-orange-400 to-orange-600',
      Libur: 'bg-gradient-to-r from-red-400 to-red-600',
    };

    const badgeColor = badgeColors[schedule.shift] || 'bg-gray-400';

    card.innerHTML = `
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-semibold">${schedule.day}</h3>
        <span class="${badgeColor} text-white px-3 py-1 rounded-full text-sm font-medium">
          ${schedule.shift}
        </span>
      </div>
      <div class="flex items-center mb-4">
        <i class="fas fa-calendar-alt text-blue-500 mr-2"></i>
        <p class="text-sm text-gray-600">${formatDate(schedule.date)}</p>
      </div>
      <div class="flex items-center mb-4">
        <i class="fas fa-sticky-note text-green-500 mr-2"></i>
        <p class="text-sm text-gray-700">${schedule.notes || '-'}</p>
      </div>
      <button onclick="deleteSchedule(${index})"
        class="w-full bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600 transition duration-300">
        Hapus
      </button>
    `;
    scheduleList.appendChild(card);
  });
}

// Play Sound Effect
function playSound(url) {
  const audio = new Audio(url);
  audio.play().catch(error => {
    console.error('Gagal memainkan suara:', error);
  });
}

// Show Notification with Sound Effect
function showNotification(message, type = 'success') {
  const notification = document.getElementById('notification');
  notification.textContent = message;

  // Set background color based on type
  if (type === 'success') {
    notification.classList.remove('bg-red-500');
    notification.classList.add('bg-green-500');
    playSound('./sounds/beep.mp3'); // Ganti dengan path file audio Anda
  } else if (type === 'error') {
    notification.classList.remove('bg-green-500');
    notification.classList.add('bg-red-500');
    playSound('./sounds/error.mp3'); // Ganti dengan path file audio Anda
  }

  // Show notification with animation
  notification.classList.remove('hidden', 'scale-0');
  notification.classList.add('opacity-100', 'scale-100');

  // Hide notification after 3 seconds
  setTimeout(() => {
    notification.classList.remove('opacity-100', 'scale-100');
    notification.classList.add('hidden', 'scale-0');
  }, 3000);
}

// Add Schedule to Supabase
async function addSchedule(day, shift, date, notes) {
  const { data, error } = await supabaseClient
    .from('schedules')
    .insert([{ day, shift, date, notes }])
    .select();

  if (error) {
    console.error('Error adding schedule:', error);
    showNotification('Gagal menambahkan jadwal!', 'error');
  } else {
    loadSchedules(); // Reload schedules after adding
    showNotification('Jadwal berhasil ditambahkan!');
  }
}

// Delete Schedule from Supabase
async function deleteSchedule(index) {
  const scheduleId = schedules[index].id;

  const { error } = await supabaseClient
    .from('schedules')
    .delete()
    .eq('id', scheduleId);

  if (error) {
    console.error('Error deleting schedule:', error);
    showNotification('Gagal menghapus jadwal!', 'error');
  } else {
    loadSchedules(); // Reload schedules after deletion
    showNotification('Jadwal berhasil dihapus!');
  }
}

// Handle Form Submission
document.getElementById('scheduleForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const day = document.getElementById('day').value;
  const shift = document.getElementById('shift').value;
  const date = document.getElementById('date').value;
  const notes = document.getElementById('notes').value;

  if (day && shift && date) {
    await addSchedule(day, shift, date, notes);
    document.getElementById('popupForm').classList.add('hidden', 'opacity-0', 'pointer-events-none');
    document.getElementById('scheduleForm').reset();
  } else {
    showNotification('Silakan isi semua field!', 'error');
  }
});

// Toggle Pop-Up Form
document.getElementById('openFormButton').addEventListener('click', () => {
  const popupForm = document.getElementById('popupForm');
  popupForm.classList.remove('hidden', 'opacity-0', 'pointer-events-none');
  popupForm.classList.add('opacity-100', 'pointer-events-auto');
  popupForm.querySelector('.transform').classList.remove('scale-95', 'opacity-0');
  popupForm.querySelector('.transform').classList.add('scale-100', 'opacity-100');
});

document.getElementById('closeFormButton').addEventListener('click', () => {
  const popupForm = document.getElementById('popupForm');
  popupForm.querySelector('.transform').classList.remove('scale-100', 'opacity-100');
  popupForm.querySelector('.transform').classList.add('scale-95', 'opacity-0');
  setTimeout(() => {
    popupForm.classList.add('hidden', 'opacity-0', 'pointer-events-none');
  }, 300); // Match the duration of the transition
});

// Filter and Search
document.getElementById('searchInput').addEventListener('input', () => {
  const query = document.getElementById('searchInput').value.toLowerCase();
  filterSchedules(query, document.getElementById('filterShift').value);
});

document.getElementById('filterShift').addEventListener('change', () => {
  const query = document.getElementById('searchInput').value.toLowerCase();
  filterSchedules(query, document.getElementById('filterShift').value);
});

function filterSchedules(query, shift) {
  const filtered = schedules.filter(schedule => {
    const matchesQuery = schedule.day.toLowerCase().includes(query) || schedule.notes?.toLowerCase().includes(query);
    const matchesShift = shift ? schedule.shift === shift : true;
    return matchesQuery && matchesShift;
  });
  renderSchedules(filtered);
}

// Toggle Mobile Menu
document.getElementById('menuButton').addEventListener('click', () => {
  const mobileMenu = document.getElementById('mobileMenu');
  mobileMenu.classList.toggle('hidden');
});

// Fetch Footer
fetch('footer.html')
  .then(response => {
    if (!response.ok) {
      throw new Error('File footer.html tidak ditemukan.');
    }
    return response.text();
  })
  .then(data => {
    document.getElementById('footerPlaceholder').innerHTML = data;
  })
  .catch(error => {
    console.error('Error fetching footer:', error);
    document.getElementById('footerPlaceholder').innerHTML = `
      <footer class="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-4 sm:py-6 mt-8">
        <div class="container mx-auto text-center">
          Footer tidak dapat dimuat.
        </div>
      </footer>
    `;
  });

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
  loadSchedules(); // Load schedules when the page loads
});