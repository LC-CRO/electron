const { ipcRenderer } = require('electron');
let currentMonth, currentYear;
const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const Toast = Swal.mixin({
    toast: true,
    position: 'bottom-end',
    showConfirmButton: false,
    timer: 1500,
    timerProgressBar: true,
})

document.addEventListener('DOMContentLoaded', () => {
    connect_to_database();
    let date = new Date();
    currentMonth = date.getMonth();
    currentYear = date.getFullYear();
    generateCalendar(currentMonth, currentYear);
});

function generateCalendar(month, year) {
    let monthAndYear = document.getElementById("monthAndYear");
    let daysInMonth = 32 - new Date(year, month, 32).getDate();
    let firstDay = (new Date(year, month)).getDay();
    let tbl = document.getElementById("calendar-body");

    tbl.innerHTML = "";
    monthAndYear.innerText = `${months[month]} ${year}`;

    let date = 1;
    for (let i = 0; i < 6; i++) {
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

                ipcRenderer.invoke('getEvent', cell.dataset.date)
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
                    $('#event-date').val(date);
                    ipcRenderer.invoke('getEvent', date)
                        .then(event => {
                            if (event) {
                                $('#event-title').val(event.title);
                            } else {
                                $('#event-title').val('');
                            }
                            $('#event-modal').modal('show');
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

$('#event-form').on('submit', function(e) {
    e.preventDefault();
    let date = $('#event-date').val();
    let title = $('#event-title').val();
    ipcRenderer.invoke('updateEvent', { date, title })
        .then(() => {
            $('#event-modal').modal('hide');
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

$('#delete-button').on('click', function() {
    let date = $('#event-date').val();
    ipcRenderer.invoke('deleteEvent', date)
        .then(() => {
            $('#event-modal').modal('hide');
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
    ipcRenderer.invoke('connectToDB', )
        .then(response =>  Toast.fire({
            icon: 'success',
            title: "Database: " + response
        })) // "connected"
        .catch(err => Toast.fire({
            icon: 'error',
            title: "Database: " + err
        })); // imprime l'erreur si la connexion a échoué

}