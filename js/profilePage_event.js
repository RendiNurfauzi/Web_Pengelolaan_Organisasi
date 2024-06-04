import { db, auth, doc, updateDoc, getDoc, ref, uploadBytes, getDownloadURL, storage } from './firebase/firebaseConfig.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-auth.js";

let logMessages = ""; // Variabel untuk menyimpan log
const log = (message) => {
    console.log(message);
    logMessages += message + "\n"; // Menambahkan pesan ke log
};

document.addEventListener('DOMContentLoaded', () => {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            log("Pengguna masuk."); // Menambahkan log ketika pengguna masuk
            initializeProfilePage(user);
        } else {
            log("Tidak ada pengguna yang masuk.");
            window.location.href = "LoginPage.html"; // Arahkan ke LoginPage.html
        }
    });
});

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
        console.log("Original Width: " + img.width); // Debugging
        console.log("Original Height: " + img.height); // Debugging

        // Mengatur ukuran kanvas menjadi 500x500
        canvas.width = 500;
        canvas.height = 500;

        // Menghitung posisi untuk memusatkan gambar
        const offsetX = (img.width > 500) ? (img.width - 500) / 2 : 0;
        const offsetY = (img.height > 500) ? (img.height - 500) / 2 : 0;

        console.log("Offset X: " + offsetX); // Debugging
        console.log("Offset Y: " + offsetY); // Debugging

        // Menggambar gambar ke kanvas dengan memotongnya menjadi 500x500
        ctx.drawImage(img, offsetX, offsetY, 500, 500, 0, 0, 500, 500);
        resolve();
    });

    return new Promise(resolve => {
        canvas.toBlob(blob => {
            console.log("Image resized to 500x500"); // Debugging
            resolve(blob);
        }, 'image/png');
    });
}
async function initializeProfilePage() {
    const user = auth.currentUser;
    const userId = localStorage.getItem('userId'); // Dapatkan User ID dari localStorage
    console.log('User ID:', userId); // Gunakan User ID

    // ... kode lainnya ...
    const form = document.getElementById('profileForm');
    const profileImageInput = document.getElementById('profileImage');
    let logMessages = ""; // Variabel untuk menyimpan log

    const log = (message) => {
        console.log(message);
        logMessages += message + "\n"; // Menambahkan pesan ke log
    };

    if (!user) {
        log("Tidak ada pengguna yang masuk.");
        window.location.href = "LoginPage.html"; // Arahkan ke LoginPage.html
        return; // Hentikan eksekusi lebih lanjut jika tidak ada pengguna yang masuk
    }

    // Tambahkan userId ke URL
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set('userId', user.uid);
    history.pushState({}, '', currentUrl);

    // Ambil dan tampilkan data pengguna
    try {
        const userRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
            const userData = docSnap.data();
            fillFormData(userData);
            if (userData.fotoProfil) {
                displayProfileImage(userData.fotoProfil, form);
            }
            log("Data profil berhasil dimuat.");
        } else {
            log("Data profil tidak ditemukan.");
        }
    } catch (error) {
        console.error("Error fetching user data: ", error);
        log("Error fetching user data: " + error);
        alert('Gagal memuat data profil: ' + error.message);
    }

    // Setup event listeners
    setupEventListeners(profileImageInput, user, form, logMessages, log);
}

function fillFormData(userData) {
    document.getElementById('username').value = userData.nama || '';
    document.getElementById('npm').value = userData.npm || '';
    document.getElementById('role').value = userData.role || '';
    document.getElementById('divisi').value = userData.divisi || '';
    document.getElementById('jabatan').value = userData.jabatan || '';
    document.getElementById('jurusan').value = userData.jurusan || '';
    document.getElementById('angkatan').value = userData.angkatan || '';
    document.getElementById('anggota').value = userData.anggota || '';
}

function displayProfileImage(imageUrl, form) {
    const imgContainer = document.createElement('div');
    imgContainer.className = 'profile-image-container'; // Pastikan ini sesuai dengan kelas yang Anda definisikan di CSS

    const imgElement = document.createElement('img');
    imgElement.src = imageUrl;
    imgElement.alt = "Foto Profil";
    imgElement.id = "profileImg"; // Tambahkan ID untuk memudahkan manipulasi di masa depan

    imgContainer.appendChild(imgElement); // Tambahkan gambar ke dalam container
    document.querySelector('.profile-container').insertBefore(imgContainer, form); // Sisipkan container sebelum form
}

function setupEventListeners(profileImageInput, user, form, logMessages, log) {
    profileImageInput.addEventListener('change', async (event) => {
        if (event.target.files.length > 0) {
            const imageFile = event.target.files[0];
            const resizedImage = await resizeImage(imageFile); // Pastikan fungsi ini dipanggil
            await uploadImageToStorage(resizedImage, user); // Pastikan gambar yang diresize yang diunggah
        }
    });

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        await handleFormSubmit(event, user, profileImageInput, logMessages, log);
    });
}

async function uploadImageToStorage(file, user) {
    const storageRef = ref(storage, `profileImages/${user.uid}/profil.png`);
    try {
        const snapshot = await uploadBytes(storageRef, file);
        const imageUrl = await getDownloadURL(snapshot.ref);
        console.log("Gambar berhasil diupload: ", imageUrl);

        // Perbarui URL gambar profil di Firestore
        await updateDoc(doc(db, "users", user.uid), {
            fotoProfil: imageUrl
        });

        return imageUrl;
    } catch (error) {
        console.error("Error uploading image: ", error);
        alert('Gagal mengupload gambar: ' + error.message);
    }
}

async function handleFormSubmit(event, user, profileImageInput, logMessages, log) {
    const imageFile = profileImageInput.files[0];
    let imageUrl = "";

    if (imageFile) {
        imageUrl = await uploadImageToStorage(imageFile, user);
        const imgElement = document.getElementById('profileImg');
        if (imgElement) {
            imgElement.src = imageUrl; // Perbarui URL gambar
        }
    }

    const updatedData = {
        nama: document.getElementById('username').value.trim(),
        npm: document.getElementById('npm').value.trim(),
        role: document.getElementById('role').value.trim(),
        divisi: document.getElementById('divisi').value.trim(),
        jabatan: document.getElementById('jabatan').value.trim(),
        jurusan: document.getElementById('jurusan').value.trim(),
        angkatan: document.getElementById('angkatan').value.trim(),
        anggota: document.getElementById('anggota').value.trim(),
        fotoProfil: imageUrl || user.fotoProfil || ""
    };

    try {
        await updateDoc(doc(db, "users", user.uid), updatedData);
        log('Profil berhasil diperbarui.');
        alert('Profil berhasil diperbarui.');
    } catch (error) {
        console.error("Error updating profile: ", error);
        log("Error updating profile: " + error);
        alert('Gagal memperbarui profil: ' + error.message);
    }

    // Fungsi untuk mengunduh log
    const downloadLog = () => {
        const blob = new Blob([logMessages], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'profileUpdateLog.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };

    // Panggil fungsi downloadLog untuk mengunduh file log
    downloadLog();
}
