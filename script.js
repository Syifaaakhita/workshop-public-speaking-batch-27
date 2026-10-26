document.addEventListener('DOMContentLoaded', function () {
    // 1. Inisialisasi Elemen Form & Paket
    const waForm = document.getElementById('waForm');
    const paketInput = document.getElementById('paket');
    const pagePackage = paketInput ? paketInput.value.toLowerCase() : '';

    // 2. Deteksi Kategori Kursi Aktif Berdasarkan Nama Paket
    let activeCategory = '';
    if (pagePackage.includes('bronze') || pagePackage.includes('paket 1')) {
        activeCategory = 'bronze';
    } else if (pagePackage.includes('silver') || pagePackage.includes('paket 2')) {
        activeCategory = 'silver';
    } else if (pagePackage.includes('gold') || pagePackage.includes('platinum') || pagePackage.includes('paket 3')) {
        activeCategory = 'platinum';
    }

    // 3. Generate Denah Kursi
    generateSeats('platinumRow', 'P', 20, 'platinum', activeCategory);
    generateSeats('silverRow', 'S', 30, 'silver', activeCategory);
    generateSeats('bronzeRow', 'B', 50, 'bronze', activeCategory);

    // 4. Daftar Kursi yang Sudah Terjual (Sold Out) - Ubah jika ada kursi terisi lainnya
    markOccupiedSeats(['P-01', 'S-05', 'B-10', 'B-11']);

    // 5. URL Google Apps Script milik Anda
    const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyjxfprMTgHCGo3YemXAayqpP-7_5nBxi0eTOGyrqG4AgdIUGwge_Pgnb8g84YXIB9Diw/exec";

    // 6. Handle Pengiriman Form
    if (waForm) {
        waForm.addEventListener('submit', function (event) {
            event.preventDefault();

            const namaInput = document.getElementById('nama');
            const whatsappInput = document.getElementById('whatsapp');
            const selectedSeatInput = document.getElementById('selectedSeatInput');
            const catatanInput = document.getElementById('catatan');

            const nama = namaInput ? namaInput.value.trim() : '';
            const whatsapp = whatsappInput ? whatsappInput.value.trim() : '';
            const paket = paketInput ? paketInput.value : 'Workshop Public Speaking Batch 27';
            const seatTerpilih = selectedSeatInput ? selectedSeatInput.value.trim() : '';
            const catatan = catatanInput ? catatanInput.value.trim() : '';

            // Validasi: Wajib memilih kursi sebelum kirim
            if (!seatTerpilih) {
                alert('Silakan klik dan pilih nomor kursi Anda pada denah sebelum melanjutkan!');
                return;
            }

            // Kirim Data ke Google Sheets di latar belakang
            const formData = new FormData();
            formData.append('nama', nama);
            formData.append('whatsapp', whatsapp);
            formData.append('paket', paket);
            formData.append('seat', seatTerpilih);
            formData.append('catatan', catatan);

            fetch(SCRIPT_URL, { method: 'POST', body: formData })
                .then(response => console.log('Data berhasil disimpan ke Google Sheets!'))
                .catch(error => console.error('Error saat menyimpan ke Google Sheets:', error));

            // Buka WhatsApp Admin
            const adminPhone = "6281342999083";
            const message = `Halo Admin, saya ingin mendaftar workshop.%0A%0A` +
                            `*Nama:* ${encodeURIComponent(nama)}%0A` +
                            `*No. WhatsApp:* ${encodeURIComponent(whatsapp)}%0A` +
                            `*Pilihan Paket:* ${encodeURIComponent(paket)}%0A` +
                            `*Nomor Kursi Terpilih:* ${encodeURIComponent(seatTerpilih)}%0A` +
                            `*Catatan:* ${encodeURIComponent(catatan ? catatan : '-')}`;

            const waUrl = `https://wa.me/${adminPhone}?text=${message}`;
            window.open(waUrl, '_blank');
        });
    }
});

// FUNGSI UTAMA: MEMBUAT SEAT DINAMIS
function generateSeats(containerId, prefix, total, category, activeCategory) {
    const container = document.getElementById(containerId);
    if (!container) return;

    for (let i = 1; i <= total; i++) {
        const seatNum = `${prefix}-${i < 10 ? '0' + i : i}`;
        const btn = document.createElement('button');
        btn.type = 'button';

        const isLocked = category !== activeCategory;
        btn.className = `seat-btn ${category} ${isLocked ? 'locked' : ''}`;
        btn.innerText = seatNum;
        btn.dataset.seat = seatNum;

        if (!isLocked) {
            btn.addEventListener('click', function () {
                selectSeat(btn, seatNum);
            });
        }

        container.appendChild(btn);
    }
}

// FUNGSI UTAMA: PILIH KURSI
function selectSeat(btnElement, seatNum) {
    if (btnElement.classList.contains('occupied') || btnElement.classList.contains('locked')) return;

    document.querySelectorAll('.seat-btn').forEach(s => s.classList.remove('selected'));
    btnElement.classList.add('selected');

    const selectedSeatNumEl = document.getElementById('selectedSeatNum');
    const selectedSeatInputEl = document.getElementById('selectedSeatInput');

    if (selectedSeatNumEl) selectedSeatNumEl.innerText = seatNum;
    if (selectedSeatInputEl) selectedSeatInputEl.value = seatNum;
}

// FUNGSI UTAMA: TANDA KURSI TERJUAL / SOLD OUT
function markOccupiedSeats(seatArray) {
    seatArray.forEach(seatNum => {
        const btn = document.querySelector(`[data-seat="${seatNum}"]`);
        if (btn) {
            btn.classList.add('occupied');
            btn.classList.remove('locked');
        }
    });
}