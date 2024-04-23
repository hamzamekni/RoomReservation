const daysTag = document.querySelector(".days");
const currentDate = document.querySelector(".current-date");
const prevNextIcon = document.querySelectorAll(".icons span");
let pickedRoom = null;

let date = new Date();
let currYear = date.getFullYear();
let currMonth = date.getMonth();

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const renderCalendar = () => {
  let firstDayofMonth = new Date(currYear, currMonth, 1).getDay(); // getting first day of month
  let lastDateofMonth = new Date(currYear, currMonth + 1, 0).getDate(); // getting last date of month
  let lastDayofMonth = new Date(currYear, currMonth, lastDateofMonth).getDay(); // getting last day of month
  let lastDateofLastMonth = new Date(currYear, currMonth, 0).getDate(); // getting last date of previous month
  let liTag = "";

  for (let i = firstDayofMonth; i > 0; i--) {
    liTag += `<li class="inactive">${lastDateofLastMonth - i + 1}</li>`;
  }

  for (let i = 1; i <= lastDateofMonth; i++) {
    let isToday =
      i === date.getDate() &&
        currMonth === new Date().getMonth() &&
        currYear === new Date().getFullYear()
        ? "active"
        : "";
    liTag += `<li class="${isToday}" data-date="${currYear}-${currMonth + 1}-${i}">${i}</li>`;
  }

  for (let i = lastDayofMonth; i < 6; i++) {
    // creating li of next month first days
    liTag += `<li class="inactive">${i - lastDayofMonth + 1}</li>`;
  }
  currentDate.innerText = `${months[currMonth]} ${currYear}`; // passing current mon and yr as currentDate text
  daysTag.innerHTML = liTag;

  // Adding event listeners to each day
  const days = document.querySelectorAll(".days li");
  days.forEach((day) => {
    day.addEventListener("click", () => {
      const titleDiv = document.getElementById('title');
      titleDiv.style.display = 'none';
      // Remove active class from all days
      days.forEach((d) => d.classList.remove("active"));

      // Add active class to clicked day
      day.classList.add("active");
      var req = new XMLHttpRequest();
      req.open("POST", "http://localhost:5000/room/available");
      req.setRequestHeader("Content-Type", "application/json");
      let responseData = null;
      req.onload = function () {
        if (req.status == 200) {
          responseData = JSON.parse(req.responseText);
          let availableRooms = responseData.availableRooms;


          document.getElementById("roomCardsContainer").innerHTML = "";

          var capacityFilter = document.getElementById("capacityFilter").value;
          availableRooms = availableRooms.filter(room => room.capacity >= capacityFilter);

          availableRooms.forEach((room) => {
            const roomCard = document.createElement("div");
            roomCard.classList.add("room-card");

            // Room image
            const roomImage = document.createElement("img");
            roomImage.src = room.roomImage;
            roomCard.appendChild(roomImage);

            // Room number
            const roomNumber = document.createElement("h2");
            roomNumber.innerText = `Room ${room.roomNumber}`;
            roomCard.appendChild(roomNumber);

            // Room capacity
            const capacity = document.createElement("p");
            capacity.innerText = `Capacity: ${room.capacity}`;
            roomCard.appendChild(capacity);
            // Equipment
            // room.equipment.forEach((equip) => {
            //   let equipmentInfo = document.createElement("p");
            //   equipmentInfo.classList.add("card-text");
            //   equipmentInfo.innerText = `${equip.name}: ${equip.quantity}`;
            //   roomCard.appendChild(equipmentInfo);
            // });
            const button = document.createElement("button");
            button.classList.add("btn", "primary");
            button.innerText = "Book Room";
            button.onclick = function () {
              openForm(room,day.getAttribute("data-date"));
            };
            roomCard.appendChild(button);

            // Append the room card to the container
            document.getElementById("roomCardsContainer").appendChild(roomCard);
          });
        } else {
          console.log("ERROR", req.response);
        }
      };

      req.onerror = function () {
        console.log("Network Error");
      };
      const requestData = {
        date: day.getAttribute("data-date"),
      };
      req.send(JSON.stringify(requestData));
    });
  });
};

renderCalendar();

prevNextIcon.forEach((icon) => {
  // getting prev and next icons
  icon.addEventListener("click", () => {

    // adding click event on both icons
    // if clicked icon is previous icon then decrement current month by 1 else increment it by 1
    currMonth = icon.id === "prev" ? currMonth - 1 : currMonth + 1;

    if (currMonth < 0 || currMonth > 11) {
      // if current month is less than 0 or greater than 11
      // creating a new date of current year & month and pass it as date value
      date = new Date(currYear, currMonth, new Date().getDate());
      currYear = date.getFullYear(); // updating current year with new date year
      currMonth = date.getMonth(); // updating current month with new date month
    } else {
      date = new Date(); // pass the current date as date value
    }
    renderCalendar(); // calling renderCalendar function
  });
});


function openForm(room, date) {
  pickedRoom = room._id;
  let hoursContainer = document.getElementById('available-hours');
  hoursContainer.innerHTML = '';
  let availableHours = []

  var req = new XMLHttpRequest();
  const apiUrl = `http://localhost:5000/room/hours/${pickedRoom}/${date}`;
  req.open("GET", apiUrl);
  req.setRequestHeader("Content-Type", "application/json");
  req.onload = function () {
    if (req.status == 200) {
      responseData = JSON.parse(req.responseText);
      availableHours = responseData.availableHours;
    } else {
      console.log('Error');
    }
    document.getElementById("popupForm").style.display = "block";
    const selectedRoomImage = document.createElement("img");
    selectedRoomImage.classList.add('selectedRoom');
 
    const capacityP = document.createElement("p");
    capacityP.textContent = 'Capacity :' + room.capacity


    hoursContainer.appendChild(selectedRoomImage);
    // Equipment
    room.equipment.forEach((equip) => {
      let equipmentInfo = document.createElement("p");
      equipmentInfo.classList.add("card-text");
      equipmentInfo.innerText = `${equip.name}: ${equip.quantity}`;
      hoursContainer.appendChild(equipmentInfo);
    });
    hoursContainer.appendChild(capacityP);


    selectedRoomImage.src = room.roomImage;
    
    if (availableHours.length>0) {
      // Display available hours as clickable buttons
      availableHours.forEach(hour => {
        const button = document.createElement('button');
        button.textContent = new Date(hour).getHours() + ' : 00';
        button.addEventListener('click', () => {
          button.classList.toggle('selected');
        });
        hoursContainer.appendChild(button);
      });
    } else {
      hoursContainer.textContent = 'No available slots for this date.';
    }
    document.getElementById("available-hours").style.display = "block";

  };
  req.send();
}
function closeForm() {
  document.getElementById("popupForm").style.display = "none";
}

function submitHours() {
  const selectedButtons = document.querySelectorAll('button.selected');
  const selectedDate = document.querySelectorAll('li.active')[0].getAttribute("data-date");

  if (!selectedDate || selectedButtons.length === 0) {
    console.log('Error: Selected date or hours not available.');
    return;
  }

  // Iterate over the selected buttons
  let hoursData = [];
  selectedButtons.forEach(button => {
    let d = new Date(selectedDate);
    d.setHours(button.textContent.replace(' : 00', ''));
    d.setMinutes(0);
    d.setSeconds(0);
    hoursData.push(d);
  });

  const requestData = {
    hours: hoursData,
    roomId: pickedRoom
  };

  const req = new XMLHttpRequest();
  req.open("POST", "http://localhost:5000/book");
  req.setRequestHeader("Content-Type", "application/json");

  req.onload = function () {
    if (req.status == 200 || req.status == 201) {
      const responseData = JSON.parse(req.responseText);
      console.log(JSON.stringify(requestData))
      window.location.replace("http://localhost:5000/book/confirm");

    } else {
      console.log('Error:', req.statusText);
    }
  };
  req.onerror = function () {
    console.log('Network Error');
  };
  closeForm();
  req.send(JSON.stringify(requestData));
}
