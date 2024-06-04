import { db, storage } from "./firebase/firebaseConfig.js";
import { doc, updateDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-storage.js";

// Fungsi untuk mengubah ukuran gambar menjadi kotak
async function resizeImage(file) {
    const img = document.createElement('img');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const reader = new FileReader();
    reader.readAsDataURL(file);
    await new Promise(resolve => reader.onload = e => {
        img.src = e.target.result;
        resolve();
    });

    await new Promise(resolve => img.onload = () => {
        const size = Math.min(img.width, img.height);
        canvas.width = size;
        canvas.height = size;
        ctx.drawImage(img, (img.width - size) / 2, (img.height - size) / 2, size, size, 0, 0, size, size);
        resolve();
    });

    return new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
}

// Fungsi untuk memuat data yang sudah ada
async function loadData() {
    const uid = localStorage.getItem('uid'); // Mengambil uid dari localStorage
    const userRef = doc(db, "users", uid);
    const docSnap = await getDoc(userRef);

    if (docSnap.exists()) {
        const data = docSnap.data();
        document.getElementById('nama').value = data.nama || '';
        document.getElementById('npm').value = data.npm || '';
        document.getElementById('jabatan').value = data.jabatan || '';
        document.getElementById('jurusan').value = data.jurusan || '';
        document.getElementById('angkatan').value = data.angkatan || '';
        document.getElementById('divisi').value = data.divisi || '';
        document.getElementById('alasan').value = data.alasan || '';
        document.getElementById('visi').value = data.visi || '';
        document.getElementById('misi').value = data.misi || '';
        // Setiap field lainnya
    }
}

document.addEventListener('DOMContentLoaded', loadData);

document.getElementById('pendaftaranForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const fotoProfil = document.getElementById('fotoProfil').files[0];
    const resizedImage = await resizeImage(fotoProfil);
    const uid = localStorage.getItem('uid'); // Mengambil uid dari localStorage

    const fotoProfilRef = ref(storage, `profileImages/${uid}/profil.png`);
    const snapshot = await uploadBytes(fotoProfilRef, resizedImage);
    const fotoProfilUrl = await getDownloadURL(fotoProfilRef);

    await updateDoc(doc(db, "users", uid), {
        fotoProfil: fotoProfilUrl,
        nama: document.getElementById('nama').value,
        npm: document.getElementById('npm').value,
        jabatan: document.getElementById('jabatan').value,
        jurusan: document.getElementById('jurusan').value,
        angkatan: document.getElementById('angkatan').value,
        divisi: document.getElementById('divisi').value,
        alasan: document.getElementById('alasan').value,
        visi: document.getElementById('visi').value,
        misi: document.getElementById('misi').value,
        anggota: "terdaftar",
        firstLogin: "true"
    });

    alert('Pendaftaran berhasil!');
});