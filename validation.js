const loginform = document.getElementById("loginform");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const repeatPasswordInput = document.getElementById("repeat-password");
const namaInput = document.getElementById("username");
const errorMassage = document.getElementById("error-massage");

if (loginform) {
  loginform.addEventListener("submit", (e) => {
    e.preventDefault();
    errorMassage.innerText = "";
    if (namaInput) {
      if (
        namaInput.value === "" ||
        emailInput.value === "" ||
        passwordInput.value === ""
      ) {
        errorMassage.style.color = "#d9534f";
        errorMassage.innerText = "Semua kolom wajib diisi!";
        return;
      }

      if (passwordInput.value !== repeatPasswordInput.value) {
        errorMassage.style.color = "#d9534f";
        errorMassage.innerText = "Password tidak cocok!";
        return;
      }

      errorMassage.style.color = "#0b2f61";
      errorMassage.innerText = "Sedang mendaftarkan akun...";

      const dataPayload = {
        data: [
          {
            Username: namaInput.value,
            Email: emailInput.value,
            Password: passwordInput.value,
          },
        ],
      };

      fetch("https://sheetdb.io/api/v1/eti9267z25pab?sheet=DataUser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataPayload),
      })
        .then((res) => {
          if (!res.ok) throw new Error("Koneksi ke SheetDB ditolak");
          return res.json();
        })
        .then((data) => {
          alert("Pendaftaran Berhasil! Silakan Login.");
          window.location.href = "index.html";
        })
        .catch((err) => {
          console.error(err);
          errorMassage.style.color = "#d9534f";
          errorMassage.innerText = "Gagal terhubung ke database cloud.";
        });
    } else {
      if (emailInput.value === "" || passwordInput.value === "") {
        errorMassage.style.color = "#d9534f";
        errorMassage.innerText = "Email dan Password wajib diisi!";
        return;
      }

      errorMassage.style.color = "#0b2f61";
      errorMassage.innerText = "Memeriksa akun...";

      fetch("https://sheetdb.io/api/v1/eti9267z25pab?sheet=DataUser")
        .then((res) => {
          if (!res.ok) throw new Error("Gagal mengambil data");
          return res.json();
        })
        .then((dataAkun) => {
          const emailDiketik = emailInput.value;
          const passwordDiketik = passwordInput.value;

          const listUser = Array.isArray(dataAkun)
            ? dataAkun
            : dataAkun.data || [];

          const akunCocok = listUser.find(
            (u) => u.Email === emailDiketik && u.Password === passwordDiketik,
          );

          if (akunCocok) {
            localStorage.setItem("emailTerdaftar", emailDiketik);
            alert("Login Berhasil!");
            window.location.href = "k-roadv3.html";
          } else {
            errorMassage.style.color = "#d9534f";
            errorMassage.innerText =
              "Email belum terdaftar atau password salah!";
          }
        })
        .catch((err) => {
          console.error(err);
          errorMassage.style.color = "#d9534f";
          errorMassage.innerText =
            "Gagal memeriksa akun. Periksa koneksi internet.";
        });
    }
  });
}
