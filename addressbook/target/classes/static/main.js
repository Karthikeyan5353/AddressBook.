// Backend API URL
const API_URL = '/api/addresses';

// Regular expressions for validation
const strRegex = /^[a-zA-Z\s]*$/; // Only letters
const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im; // Phone format validation

// DOM elements
const fullscreenDiv = document.getElementById('fullscreen-div');
const modal = document.getElementById('modal');
const addBtn = document.getElementById('add-btn');
const closeBtn = document.getElementById('close-btn');
const modalBtns = document.getElementById('modal-btns');
const form = document.getElementById('modal');
const addrBookList = document.querySelector('#addr-book-list tbody');
const searchBar = document.getElementById('search-bar'); // Search input

// Variables for form data
let firstName, lastName, email, phone, city, labels;

// API methods
async function fetchAddressesFromDB() {
    const response = await fetch(API_URL);
    return response.json();
}

async function saveAddressToDB(address) {
    await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(address)
    });
}

async function deleteAddressFromDB(id) {
    await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
}

// Address class
class Address {
    constructor(id, firstName, lastName, email, phone, city, labels) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.phone = phone;
        this.city = city;
        this.labels = labels;
    }

    static async getAddresses() {
        return fetchAddressesFromDB();
    }

    static async addAddress(address) {
        await saveAddressToDB(address);
    }

    static async deleteAddress(id) {
        await deleteAddressFromDB(id);
        addrBookList.innerHTML = ""; // Clear the UI
        UI.showAddressList();
    }

    static async updateAddress(item) {
        await saveAddressToDB(item); // POST handles both insert and update
        addrBookList.innerHTML = ""; // Clear the UI
        UI.showAddressList();
    }
}

// UI class
class UI {
    static async showAddressList() {
        const addresses = await Address.getAddresses();
        addrBookList.innerHTML = ""; // Clear the table
        addresses.forEach((address, index) => UI.addToAddressList(address, index + 1)); // Add sequential ID
    }

    static addToAddressList(address, sequenceNumber) {
        const tableRow = document.createElement('tr');
        tableRow.setAttribute('data-id', address.id);
        tableRow.setAttribute('data-name', `${address.firstName} ${address.lastName}`.toLowerCase()); // Add searchable attribute
        tableRow.innerHTML = `
            <td>${sequenceNumber}</td> <!-- Display sequential ID -->
            <td><span class="address">${address.city}</span></td>
            <td><span>${address.labels}</span></td>
            <td>${address.firstName} ${address.lastName}</td>
            <td>${address.phone}</td>
        `;
        addrBookList.appendChild(tableRow);
    }

    static showModalData(id) {
        Address.getAddresses().then(addresses => {
            addresses.forEach(address => {
                if (address.id == id) {
                    form.first_name.value = address.firstName;
                    form.last_name.value = address.lastName;
                    form.email.value = address.email;
                    form.phone.value = address.phone;
                    form.city.value = address.city;
                    form.labels.value = address.labels;
                    document.getElementById('modal-title').innerHTML = "Change Address Details";

                    document.getElementById('modal-btns').innerHTML = `
                        <button type="submit" id="update-btn" data-id="${id}">Update</button>
                        <button type="button" id="delete-btn" data-id="${id}">Delete</button>
                    `;
                }
            });
        });
    }

    static showModal() {
        modal.style.display = "block";
        fullscreenDiv.style.display = "block";
    }

    static closeModal() {
        modal.style.display = "none";
        fullscreenDiv.style.display = "none";
    }
}

// Event Listeners
window.addEventListener('DOMContentLoaded', () => {
    eventListeners();
    UI.showAddressList();
});

function eventListeners() {
    addBtn.addEventListener('click', () => {
        form.reset();
        document.getElementById('modal-title').innerHTML = "Add Address";
        UI.showModal();
        document.getElementById('modal-btns').innerHTML = `
            <button type="submit" id="save-btn">Save</button>
        `;
    });

    closeBtn.addEventListener('click', UI.closeModal);

    modalBtns.addEventListener('click', async (event) => {
        event.preventDefault();
        const target = event.target;

        if (target.id === "save-btn") {
            const isFormValid = getFormData();
            if (isFormValid) {
                const address = new Address(null, firstName, lastName, email, phone, city, labels);
                await Address.addAddress(address);
                UI.closeModal();
                addrBookList.innerHTML = "";
                UI.showAddressList();
            }
        } else if (target.id === "delete-btn") {
            const id = target.dataset.id;
            await Address.deleteAddress(id);
            UI.closeModal();
        } else if (target.id === "update-btn") {
            const id = target.dataset.id;
            const isFormValid = getFormData();
            if (isFormValid) {
                const address = new Address(id, firstName, lastName, email, phone, city, labels);
                await Address.updateAddress(address);
                UI.closeModal();
            }
        }
    });

    addrBookList.addEventListener('click', (event) => {
        const trElement = event.target.closest('tr');
        if (trElement) {
            const id = trElement.dataset.id;
            UI.showModal();
            UI.showModalData(id);
        }
    });

    searchBar.addEventListener('input', filterAddresses); // Attach search functionality
}

// Form Validation
function getFormData() {
    let inputValidStatus = [];

    if (!strRegex.test(form.first_name.value) || form.first_name.value.trim().length === 0) {
        addErrMsg(form.first_name);
        inputValidStatus[0] = false;
    } else {
        firstName = form.first_name.value;
        inputValidStatus[0] = true;
    }

    if (!strRegex.test(form.last_name.value) || form.last_name.value.trim().length === 0) {
        addErrMsg(form.last_name);
        inputValidStatus[1] = false;
    } else {
        lastName = form.last_name.value;
        inputValidStatus[1] = true;
    }

    if (!emailRegex.test(form.email.value)) {
        addErrMsg(form.email);
        inputValidStatus[2] = false;
    } else {
        email = form.email.value;
        inputValidStatus[2] = true;
    }

    if (!phoneRegex.test(form.phone.value)) {
        addErrMsg(form.phone);
        inputValidStatus[3] = false;
    } else {
        phone = form.phone.value;
        inputValidStatus[3] = true;
    }

    if (!strRegex.test(form.city.value) || form.city.value.trim().length === 0) {
        addErrMsg(form.city);
        inputValidStatus[4] = false;
    } else {
        city = form.city.value;
        inputValidStatus[4] = true;
    }

    labels = form.labels.value;
    return inputValidStatus.includes(false) ? false : true;
}

function addErrMsg(inputBox) {
    inputBox.classList.add('errorMsg');
    setTimeout(() => inputBox.classList.remove('errorMsg'), 1500);
}

// Search Functionality
function filterAddresses() {
    const searchTerm = searchBar.value.toLowerCase();
    const rows = addrBookList.querySelectorAll('tr');

    rows.forEach(row => {
        const name = row.dataset.name; // Retrieve the searchable attribute
        if (name.includes(searchTerm)) {
            row.style.display = "";
        } else {
            row.style.display = "none";
        }
    });
}
