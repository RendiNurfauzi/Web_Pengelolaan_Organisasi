import { getAuth, signInWithEmailAndPassword, setPersistence, browserLocalPersistence } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-auth.js";

document.addEventListener('DOMContentLoaded', () => {
    const loginButton = document.querySelector('.loginButton');
    const emailInput = document.querySelector('.emailInput');
    const passwordInput = document.querySelector('.passwordInput');
    const auth = getAuth();

    

    loginButton.addEventListener('click', () => {
        const email = emailInput.value;
        const password = passwordInput.value;

        setPersistence(auth, browserLocalPersistence)
            .then(() => {
                return signInWithEmailAndPassword(auth, email, password);
            })
            .then((userCredential) => {
                console.log('Login berhasil:', userCredential.user);
                localStorage.setItem('userEmail', userCredential.user.email);
                localStorage.setItem('userId', userCredential.user.uid); // Simpan User ID

                // Redirect ke halaman directLink
                window.location.href = 'directlink.html';
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                console.error('Error saat login:', errorCode, errorMessage);
                alert('Login gagal: ' + errorMessage); // Tampilkan pesan error
            });
    });

    const registerTitle = document.querySelector('.registerTitle');
    if (registerTitle) {
        registerTitle.addEventListener('click', function() {
            window.location.href = 'Daftar.html'; // Redirect ke halaman daftar saat diklik
        });
    } else {
        console.log('Element dengan class "registerTitle" tidak ditemukan.');
    }

        // Function to generate a random number between min and max
        function getRandomNumber(min, max) {
            return Math.random() * (max - min) + min;
        }
    
        // Function to create a bubble
        function createBubble() {
            // Create a new div element
            var bubble = document.createElement("div");
            bubble.classList.add("bubble");
    
            // Set random horizontal position
            var horizontalPosition = getRandomNumber(0, window.innerWidth);
            bubble.style.left = horizontalPosition + "px";
    
            // Set random animation duration
            var animationDuration = getRandomNumber(2, 6) + "s"; // Between 2s and 6s
            bubble.style.animationDuration = animationDuration;
    
            // Append the bubble to the body
            document.body.appendChild(bubble);
    
            // Remove the bubble after animation completes
            bubble.addEventListener("animationend", function() {
                bubble.remove();
            });
        }
    
        // Create multiple bubbles
        var numberOfBubbles = 20; // Adjust the number of bubbles as needed
        for (var i = 0; i < numberOfBubbles; i++) {
            createBubble();
        }

    
});
