window.addEventListener('DOMContentLoaded', () => {

    let currentMonth, currentYear;
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const Toast = Swal.mixin({
        toast: true,
        position: 'bottom-end',
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true,
    })

    connect_to_database();


    function generateCalendar(month, year) {
        let monthAndYear = document.getElementById("monthAndYear");
        let daysInMonth = 32 - new Date(year, month, 32).getDate();
        let firstDay = (new Date(year, month)).getDay();
        let tbl = document.getElementById("calendar-body");

        tbl.innerHTML = "";
        monthAndYear.innerText = `${months[month]} ${year}`;

        let date = 1;
        for (let i = 0; i < 7; i++) {
            let row = document.createElement("tr");

            for (let j = 0; j < 7; j++) {
                if (i === 0 && j < firstDay) {
                    let cell = document.createElement("td");
                    let cellText = document.createTextNode("");
                    cell.appendChild(cellText);
                    row.appendChild(cell);
                } else if (date > daysInMonth) {
                    break;
                } else {
                    let cell = document.createElement("td");
                    let cellText = document.createTextNode(date);
                    if (date === new Date().getDate() && year === new Date().getFullYear() && month === new Date().getMonth()) {
                        cell.classList.add("bg-info");
                    }

                    cell.appendChild(cellText);
                    row.appendChild(cell);

                    cell.dataset.date = new Date(year, month, date).toISOString().split('T')[0];

                    window.api.invoke('getEvent', cell.dataset.date)
                        .then(event => {
                            if (event) {
                                cell.style.backgroundColor = "#a1c5ff";
                            }
                        })
                        .catch(error => {
                            Swal.fire({
                                icon: 'error',
                                title: 'Oops...',
                                text: error,
                            })
                        });

                    cell.addEventListener('click', (e) => {
                        let date = e.target.dataset.date;
                        document.getElementById('event-date').value = date;
                        window.api.invoke('getEvent', date)
                            .then(event => {
                                if (event) {
                                    document.getElementById('event-title').value = event.title;
                                } else {
                                    document.getElementById('event-title').value = '';
                                }
                                $("#event-modal").modal('show');
                            })
                            .catch(error => {
                                Swal.fire({
                                    icon: 'error',
                                    title: 'Oops...',
                                    text: error,
                                })
                            });
                    });

                    date++;
                }
            }

            tbl.appendChild(row);
        }
    }

    document.getElementById('event-form').addEventListener('submit', function(e) {
        e.preventDefault();
        let date = document.getElementById('event-date').value;
        let title = document.getElementById('event-title').value;
        window.api.invoke('updateEvent', { date, title })
            .then(() => {
                $("#event-modal").modal('hide');
                generateCalendar(currentMonth, currentYear);
                if (title) {
                    document.querySelector(`[data-date="${date}"]`).style.backgroundColor = "#a1c5ff";
                } else {
                    document.querySelector(`[data-date="${date}"]`).style.backgroundColor = "transparent";
                }
            })
            .catch(error => {
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: error,
                })
            });
    });

    document.getElementById('delete-button').addEventListener('click', function() {
        let date = document.getElementById('event-date').value;
        window.api.invoke('deleteEvent', date)
            .then(() => {
                $("#event-modal").modal('hide');
                generateCalendar(currentMonth, currentYear);
                document.querySelector(`[data-date="${date}"]`).style.backgroundColor = "transparent";
            })
            .catch(error => {
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: error,
                })
            });
    });

    function connect_to_database() {
        window.api.invoke('connectToDB')
            .then(response => {
                Toast.fire({
                    icon: 'success',
                    title: "Database: " + response
                });
                document.getElementById('db-status').className = 'status-indicator db-connected';
                let date = new Date();
                currentMonth = date.getMonth();
                currentYear = date.getFullYear();
                generateCalendar(currentMonth, currentYear);

                update_stats(currentYear, currentMonth);
                setInterval(check_databaseoverload, 1000);
            })
            .catch(err => {
                console.log(err);
                Toast.fire({
                    icon: 'error',
                    title: "Database: " + err
                });
                // On change la couleur de l'indicateur de statut de la base de données
                document.getElementById('db-status').className = 'status-indicator db-disconnected';
            });
    }

    function update_stats(year, month) {
        // Mettre à jour le nombre total d'événements
        window.api.invoke('getTotalEvents')
            .then(totalEvents => {
                document.getElementById('total-events').textContent = totalEvents;
            });
        // Mettre à jour le nombre d'événements de ce mois
        window.api.invoke('getMonthEvents', year, month)
            .then(monthEvents => {
                document.getElementById('month-events').textContent = monthEvents;
            });
    }

    document.getElementById('button-calendar-previous').addEventListener('click', function() {
        currentYear = (currentMonth === 0) ? currentYear - 1 : currentYear;
        currentMonth = (currentMonth === 0) ? 11 : currentMonth - 1;
        generateCalendar(currentMonth, currentYear);
        update_stats(currentYear, currentMonth);
    });

    document.getElementById('button-calendar-next').addEventListener('click', function() {
        currentYear = (currentMonth === 11) ? currentYear + 1 : currentYear;
        currentMonth = (currentMonth + 1) % 12;
        generateCalendar(currentMonth, currentYear);
        update_stats(currentYear, currentMonth);
    });

    function check_databaseoverload() {
        window.api.invoke('Isdatabaseoverload')
            .then(result => {
                if (result) {
                    Toast.fire({
                        icon: 'warning',
                        title: "Database: " + "Overloaded, be slow !"
                    });
                }
            });
    }


});
