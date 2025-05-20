document.querySelectorAll('.room-type').forEach((button) => {
    button.addEventListener('click', () => {
        const { type } = button.dataset;

        // Перемикаємо активність
        document.querySelectorAll('.room-type').forEach((btn) => btn.classList.remove('active'));
        button.classList.add('active');

        fetch(`http://localhost:8080/api/room-types/name/${type}`)
            .then((res) => {
                if (!res.ok) throw new Error('Failed to load room info');
                return res.json();
            })
            .then((data) => {
                document.querySelector('.room-image img').src = data.imageUrl;
                document.querySelector('.room-description h3').textContent = `${data.roomType} Room`;
                document.querySelector('.room-description p').textContent = data.roomTypeDescription;
            })
            .catch((err) => {
                console.error(err);
                alert("Couldn't load room info.");
            });
    });
});
