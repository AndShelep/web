document.getElementById('bookingForm').addEventListener('submit', (e) => {
    e.preventDefault();

    const checkin = document.getElementById('checkin').value;
    const checkout = document.getElementById('checkout').value;

    if (!checkin || !checkout) {
        alert('Please select both check-in and check-out dates.');
        return;
    }

    fetch(`http://localhost:8080/api/rooms/available/room-types/${checkin}/${checkout}`)
        .then((res) => {
            if (!res.ok) throw new Error('Failed to fetch available rooms');
            return res.json();
        })
        .then((data) => {
            const container = document.getElementById('roomList');
            container.innerHTML = '';

            if (data.length === 0) {
                container.innerHTML = '<p>No rooms available for selected dates.</p>';
                return;
            }

            data.forEach((roomType) => {
                container.innerHTML += `
                    <div class="room-card">
                      <img src="${roomType.imageUrl}" alt="${roomType.roomType} Room" class="room-card__image">
                      <div class="room-card__content">
                        <h3 class="room-card__title">${roomType.roomType} Room</h3>
                        <p class="room-card__description">${roomType.roomTypeDescription}</p>
                        <div class="room-card__footer">
                          <span class="room-card__price">${roomType.pricePerNight}₴ / night</span>
                          <a href="enter-info.html?room=${roomType.roomType}&in=${checkin}&out=${checkout}" class="btn btn-outline">Book</a>
                        </div>
                      </div>
                    </div>
                    <div class="section-divider"></div>
                `;
            });
        })
        .catch((err) => {
            console.error(err);
            alert('Could not load available rooms.');
        });
});
