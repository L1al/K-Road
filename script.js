var map = L.map("map", {
  maxZoom: 19,
  zoomControl: false,
}).setView([-3.9886, 122.5149], 13);

L.tileLayer(
  "https://api.maptiler.com/maps/streets-v2-light/{z}/{x}/{y}.png?key=fQbSorOkyRaY0FpuZbgX",
  {
    maxZoom: 19,
    attribution:
      '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>',
  },
).addTo(map);

const tombolFotoCepat = document.getElementById("foto-form");
const tombolHome = document.getElementById("home");
const tombolRiwayat = document.getElementById("laporanku");
const tombolNotifikasi = document.getElementById("notif");
const tombolkembali = document.querySelectorAll("#kembali");
const inpfile = document.getElementById("Foto");
const previewContainer = document.getElementById("image_preview");
const navigasiBawah = document.getElementById("container-bawah");
const key = "fQbSorOkyRaY0FpuZbgX";

const halamanForm = document.querySelector(".form-isi");
const halLaporan = document.querySelector(".hal-riwayat");
const halNotifikasi = document.querySelector(".hal-notif");
const imagePreview = previewContainer.querySelector(".image-preview");
const previewDefaultext = previewContainer.querySelector(".image-preview-text");

tombolFotoCepat.addEventListener("click", function () {
  halamanForm.style.display = "flex";
  halLaporan.style.display = "none";
  halNotifikasi.style.display = "none";
});

tombolHome.addEventListener("click", function () {
  halamanForm.style.display = "none";
  halLaporan.style.display = "none";
  halNotifikasi.style.display = "none";
  tombolFotoCepat.style.display = "flex";
});

tombolRiwayat.addEventListener("click", function () {
  halLaporan.style.display = "flex";
  halamanForm.style.display = "none";
  halNotifikasi.style.display = "none";
  navigasiBawah.style.display = "flex";
  tombolFotoCepat.style.display = "none";

  loadRiwayat();
});

tombolNotifikasi.addEventListener("click", function () {
  halNotifikasi.style.display = "block";
  halLaporan.style.display = "none";
  halamanForm.style.display = "none";
});

tombolkembali.forEach(function (btn) {
  btn.addEventListener("click", function () {
    halamanForm.style.display = "none";
    halLaporan.style.display = "none";
    halNotifikasi.style.display = "none";
    navigasiBawah.style.display = "flex";
    tombolFotoCepat.style.display = "flex";
  });
});

inpfile.addEventListener("change", function () {
  const file = this.files[0];
  if (file) {
    const reader = new FileReader();
    previewDefaultext.style.display = "none";
    imagePreview.style.display = "block";

    reader.addEventListener("load", function () {
      imagePreview.setAttribute("src", this.result);
    });
    reader.readAsDataURL(file);
  } else {
    previewDefaultext.style.display = null;
    imagePreview.style.display = null;
    imagePreview.setAttribute("src", "");
  }
});

let koordinatlat = null;
let koordinatlong = null;

const successCallback = (position) => {
  const lat = position.coords.latitude;
  const lang = position.coords.longitude;

  koordinatlat = lat;
  koordinatlong = lang;

  halamanForm.style.display = "none";
  halLaporan.style.display = "none";
  halNotifikasi.style.display = "none";
  navigasiBawah.style.display = "none";

  if (window.userMarker) {
    map.removeLayer(window.userMarker);
  }
  window.userMarker = L.marker([lat, lang], {
    draggable: true,
    autoPan: true,
  }).addTo(map);

  window.userMarker.on("dragend", function (event) {
    const posisiBaru = event.target.getLatLng();

    document.getElementById("form-lat").value = posisiBaru.lat;
    document.getElementById("form-long").value = posisiBaru.lng;

    navigasiBawah.style.display = "flex";

    koordinatlat = posisiBaru.lat;
    koordinatlong = posisiBaru.lng;

    console.log(
      "sukses digeser ke koordinat baru:",
      posisiBaru.lat,
      posisiBaru.lng,
    );
  });

  map.flyTo([lat, lang], 18, {
    animate: true,
    duration: 1.5,
    easeLinearity: 0.25,
  });

  document.getElementById("form-lat").value = lat;
  document.getElementById("form-long").value = lang;
};

const errorCallback = (error) => {
  console.log(error);
};

const gps = document.getElementById("gps");
const gpsStatus = document.querySelector("#lokasiakurat");

gps.addEventListener("click", function () {
  navigator.geolocation.getCurrentPosition(successCallback, errorCallback, {
    enableHighAccuracy: true,
    timeout: 5000,
  });
});

const backButton = document.getElementById("back");

backButton.addEventListener("click", function () {
  halamanForm.style.display = "none";
  halLaporan.style.display = "none";
  halNotifikasi.style.display = "none";
  navigasiBawah.style.display = "flex";
});

function formatDate(dateobject) {
  const parts = {
    date: dateobject.getDate(),
    month: dateobject.getMonth() + 1,
    year: dateobject.getFullYear(),
    hours: dateobject.getHours().toString().padStart(2, "0"),
    minutes: dateobject.getMinutes().toString().padStart(2, "0"),
  };
  return {
    Tanggal: `${parts.date}/${parts.month}/${parts.year}`,
    Jam: `${parts.hours}:${parts.minutes}`,
  };
}
const myDate = new Date();
const myDateFormatted = formatDate(myDate);

document.getElementById("form-tanggal").value = myDateFormatted.Tanggal;
document.getElementById("form-jam").value = myDateFormatted.Jam;

async function getKecamatanFromCoords(lat, lon) {
  if (lat === null || lon === null || lat === "" || lon === "") {
    return "tidak diketahui";
  }

  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=14&addressdetails=1`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("gagal memanggil api");

    const data = await res.json();

    if (data && data.address) {
      const kecamatan =
        data.address.city_district ||
        data.address.suburb ||
        data.address.town ||
        data.address.county;

      if (kecamatan) {
        return kecamatan.replace(/^kecamatan\s+/i, "").trim();
      }

      if (data.address.village) return data.address.village;
      if (data.address.neighbourhood) return data.address.neighbourhood;
    }

    return "tidak diketahui";
  } catch (err) {
    console.error("error reverse geocoding:", err);
    return "tidak diketahui";
  }
}

const IMGBB_API_KEY = "3b1993b9abb6088949937c936112c01b";

var form = document.getElementById("sheetdb-form");

const submitBtn = form.querySelector("button[type='submit']");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const file = document.getElementById("Foto").files[0];

  const emailPelapor = localStorage.getItem("emailTerdaftar") || "Anonim";
  const inputFormEmail = document.getElementById("form-email");
  if (inputFormEmail) {
    inputFormEmail.value = emailPelapor;
  }

  if (!file) {
    alert("silakan pilih foto bukti kerusakan jalan terlebih dahulu!");
    return;
  }

  submitBtn.disabled = true;
  submitBtn.innerText = "mengupload foto...";

  try {
    let fotoUrl = "";
    const formData = new FormData();
    formData.append("image", file);

    const imgbbRes = await fetch(
      `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
      {
        method: "POST",
        body: formData,
      },
    );

    if (!imgbbRes.ok) throw new Error("gagal mengunggah foto ke imgbb.");

    const imgbbData = await imgbbRes.json();
    fotoUrl = imgbbData.data.url;

    document.getElementById("form-foto").value = fotoUrl;

    submitBtn.innerText = "mendapatkan lokasi kecamatan...";
    const latInput = document.getElementById("form-lat").value;
    const longInput = document.getElementById("form-long").value;
    const namaKecamatan = await getKecamatanFromCoords(latInput, longInput);

    submitBtn.innerText = "menyimpan laporan...";

    const payload = {
      data: [
        {
          Foto: fotoUrl,
          Email: emailPelapor,
          Alamat: document.getElementById("jalan").value,
          Kecamatan: namaKecamatan,
          Tingkat_Kerusakan: form.querySelector(
            "input[name='data[Tingkat_Kerusakan]']:checked",
          ).value,
          Deskripsi: document.getElementById("deskripsi").value,
          Latitude: latInput,
          Longitude: longInput,
          Tanggal: document.getElementById("form-tanggal").value,
          Jam: document.getElementById("form-jam").value,
          Status: "Proses",
        },
      ],
    };

    const response = await fetch(
      "https://sheetdb.io/api/v1/eti9267z25pab?sheet=Laporan",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );

    if (!response.ok) throw new Error("gagal mengirim data ke google sheets.");
    await response.json();

    alert("laporan kerusakan jalan berhasil dikirim ke database k-road!");
    form.reset();

    if (imagePreview && previewDefaultext) {
      imagePreview.style.display = "none";
      imagePreview.setAttribute("src", "");
      previewDefaultext.style.display = "block";
    }
  } catch (err) {
    console.error(err);
    alert("gagal memproses laporan: " + err.message);
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerText = "Kirim Laporan";
  }
});

const SHEETDB_URL = "https://sheetdb.io/api/v1/eti9267z25pab?sheet=Laporan";

const steps = [
  { label: "Laporan diterima" },
  { label: "Foto diverifikasi" },
  { label: "Diteruskan ke dinas" },
  { label: "Selesai ditangani" },
];

function getStepIndex(status) {
  if (!status) return 0;
  const s = status.toLowerCase();
  if (s.includes("selesai")) return 4;
  if (s.includes("proses") || s.includes("dinas")) return 2;
  if (s.includes("verif")) return 1;
  return 0;
}

function renderTracker(status) {
  const activeIdx = getStepIndex(status);
  return steps
    .map((step, i) => {
      const isDone = i < activeIdx;
      const isActive = i === activeIdx;
      const isLast = i === steps.length - 1;
      return `
      <div class="tracker-step">
        <div class="step-dot-wrap">
          <div class="step-dot ${isDone || isActive ? "done" : ""}">
            ${isDone || isActive ? "✓" : ""}
          </div>
          ${!isLast ? `<div class="step-line ${isDone ? "done" : ""}"></div>` : ""}
        </div>
        <span class="step-text ${isActive ? "active" : ""}">${step.label}</span>
      </div>`;
    })
    .join("");
}

function badgeStatus(status) {
  if (!status)
    return `<span class="badge-status badge-menunggu">Menunggu Verifikasi</span>`;
  const s = status.toLowerCase();
  if (s.includes("selesai"))
    return `<span class="badge-status badge-selesai">${status}</span>`;
  if (s.includes("proses"))
    return `<span class="badge-status badge-diproses">${status}</span>`;
  if (s.includes("tolak"))
    return `<span class="badge-status badge-ditolak">${status}</span>`;
  return `<span class="badge-status badge-menunggu">${status}</span>`;
}

async function loadRiwayat() {
  const body = document.getElementById("riwayat-body");

  body.innerHTML = `<div class="empty-state">memuat laporan...</div>`;

  const email = localStorage.getItem("emailTerdaftar") || null;

  try {
    const res = await fetch(SHEETDB_URL);
    if (!res.ok) throw new Error("gagal mengambil data: " + res.status);
    const data = await res.json();

    if (!Array.isArray(data) || data.length === 0) {
      body.innerHTML = `<div class="empty-state">belum ada laporan.</div>`;
      return;
    }

    const filtered = email
      ? data.filter(
          (r) => r.Email && r.Email.toLowerCase() === email.toLowerCase(),
        )
      : data;

    if (!filtered.length) {
      body.innerHTML = `<div class="empty-state">belum ada laporan yang dikirim.</div>`;
      return;
    }

    const sorted = filtered.sort((a, b) => {
      const parse = (r) => {
        if (!r.Tanggal || !r.Jam) return 0;
        const [d, m, y] = r.Tanggal.split("/");
        return new Date(`${y}-${m}-${d}T${r.Jam}`).getTime();
      };
      return parse(b) - parse(a);
    });

    body.innerHTML = sorted
      .map((row) => {
        const foto = row.Foto || "";
        const alamat = row.Alamat || "-";
        const tanggal = row.Tanggal || "";
        const jam = row.Jam || "";
        const tk = row.Tingkat_Kerusakan || "";
        const status = row.Status || "";
        const deskripsi = row.Deskripsi || "";

        return `
        <div class="laporan-item">
          <div class="laporan-card">
            <div class="laporan-card-inner">
              ${
                foto
                  ? `<img src="${foto}" class="laporan-foto" />`
                  : `<div class="laporan-foto-placeholder">📷</div>`
              }
              <div class="laporan-info">
                <p class="laporan-judul">${alamat}</p>
                <p class="laporan-meta">📅 ${tanggal} &nbsp; 🕐 ${jam}</p>
                <p class="laporan-meta">${tk}</p>
                ${deskripsi ? `<p class="laporan-meta">"${deskripsi}"</p>` : ""}
              </div>
            </div>
            <div class="laporan-footer">${badgeStatus(status)}</div>
          </div>
          <div class="tracker-box">
            <p class="tracker-title">progress penanganan</p>
            ${renderTracker(status)}
          </div>
        </div>`;
      })
      .join("");
  } catch (err) {
    body.innerHTML = `<div class="error-state">❌ gagal memuat: ${err.message}</div>`;
  }
}
