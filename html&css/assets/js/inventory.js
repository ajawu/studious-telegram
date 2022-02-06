const Database = require('better-sqlite3');
const $ = require('jquery');
const numeral = require('numeral');
const Datatable = require('datatables.net-bs5')();
const swal = require('sweetalert');
const bootstrap = require('bootstrap');
const { app, getCurrentWindow } = require('electron').remote;
const path = require('path');

const databasePath = path.join(
    app.getAppPath('userData').replace('app.asar', ''),
    'data.db',
);

const inventoryTableBody = $('#inventory-body');
const studentIdField = document.getElementById('studentIdField');
const productPopupIdField = document.getElementById('productPopupId');
const method = document.getElementById('dbMethod');
const firstNameField = document.getElementById('firstName');
const lastNameField = document.getElementById('lastName');
const classField = document.getElementById('studentClass');
const genderField = document.getElementById('gender');
const studentActiveField = document.getElementById('studentActiveCheck');

/**
 * Append product details to inventory table
 */
function displayRow(studentId, firstName, lastName, gender, studentClass, studentStatus) {
    const tableRow = `<tr>
      <td>
      <span class="fw-bold">${numeral(studentId).format(
        '000000',
    )}</span></td>
      <td><span class="fw-normal text-capitalize">${firstName}</span></td>
      <td><span class="fw-normal text-capitalize">${lastName}</span></td>
      <td><span class="fw-normal">${gender ? 'Female' : 'Male'}</span></td>
      <td><span class="fw-bold text-uppercase">${studentClass}</span></td>
      ${studentStatus
            ? `<td><span class="fw-bold text-success">Active</span></td>`
            : `<td><span class="fw-bold text-danger">Inactive</span></td>`
        }
      <td>
        <div class="btn-group">
          <button class="btn btn-link text-dark dropdown-toggle dropdown-toggle-split m-0 p-0"
              data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
              <svg class="icon icon-xs" fill="currentColor" viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg">
                  <path
                      d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z">
                  </path>
              </svg><span class="visually-hidden">Toggle Dropdown</span></button>
          <div class="dropdown-menu dashboard-dropdown dropdown-menu-start mt-2 py-1">
              <button class="dropdown-item d-flex align-items-center" onclick="getStudent(${studentId})">
                  <svg class="dropdown-icon text-gray-400 me-2" fill="currentColor"
                      viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"></path>
                      <path fill-rule="evenodd"
                          d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                          clip-rule="evenodd"></path>
                  </svg> View Details
              </button>
          </div>
        </div>
        <button class="btn btn-link text-dark m-0 p-0 d-none admin-only-button" onclick="addDelete(${studentId}, '${firstName} ${lastName}')" data-bs-toggle="modal" data-bs-target="#deleteModal">
          <svg class="icon icon-xs text-danger" title="" data-bs-toggle="tooltip"
            fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"
            data-bs-original-title="Delete" aria-label="Delete">
            <path fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clip-rule="evenodd"></path>
          </svg>
        </button>
      </td>
    </tr>`;
    inventoryTableBody.append(tableRow);
}

/**
 * Get the product with matching id
 * @param {int} studentId
 */
function getStudent(studentId) {
    const db = new Database(databasePath, { verbose: console.log });
    try {
        const selectProductQuery = db.prepare(
            'SELECT first_name, last_name, class, gender, status FROM student WHERE id = ?',
        );
        const studentRow = selectProductQuery.get(studentId);
        if (studentRow) {
            // Load data into form fields
            productPopupIdField.value = studentId;
            firstNameField.value = studentRow.first_name;
            lastNameField.value = studentRow.last_name;
            classField.value = studentRow.class;
            genderField.value = studentRow.gender;
            studentActiveField.checked = studentRow.status ? true : false;
            // Format popup modal
            document.getElementById('addProductButton').textContent =
                'Update Student';
            document.getElementById('modal-title').textContent =
                'Student Update';
            method.value = 'update';
            const studentModal = new bootstrap.Modal(
                document.getElementById('student-modal'),
            );
            studentModal.show();
        } else {
            swal('Oops', 'An error occurred while fetching product', 'error');
        }
    } catch (err) {
        swal('Oops', err.message, 'error');
    }
    db.close();
}

/**
 * Resets the content of all input fields in the product popup
 */
function clearProductPopup() {
    productPopupIdField.value = '';
    method.value = '';
    firstNameField.value = '';
    lastNameField.value = '';
    classField.value = '';
    genderField.value = '';
    studentActiveField.checked = false;
    document.getElementById('addProductButton').textContent = 'Create Student';
    document.getElementById('modal-title').textContent = 'New Student';
}

/**
 * Add details of product to be deleted to the delete modal
 * @param {number} studentId id of the product to be deleted
 * @param {string} studentName name of the product to be deleted
 */
// eslint-disable-next-line no-unused-vars
function addDelete(studentId, studentName) {
    document.getElementById('productDeleteName').textContent = studentName;
    studentIdField.textContent = studentId;
}

/**
 * Delete the student with matching id from the database
 */
// eslint-disable-next-line no-unused-vars
function deleteStudent() {
    const db = new Database(databasePath, { verbose: console.log });
    const studentId = document.getElementById('studentIdField').textContent;
    try {
        const deleteStudentQuery = db.prepare(
            'DELETE FROM student WHERE id = ?',
        );
        deleteStudentQuery.run(studentId);
        swal('Success', 'Student deleted successfully!', 'success').then(() => {
            getCurrentWindow().reload();
        });
    } catch (err) {
        swal('Oops!', err.message, 'error');
    }
    db.close();
}

/**
 * Load products from database
 */
function loadInventory() {
    const db = new Database(databasePath, { verbose: console.log });
    try {
        const productsQuery = db.prepare(
            'SELECT id, first_name, last_name, gender, class, status FROM student',
        );
        productsQuery.all().forEach((product) => {
            displayRow(
                product.id,
                product.first_name,
                product.last_name,
                product.gender,
                product.class,
                product.status,
            );
        });

        $('#inventory-table').DataTable();
        document.getElementById('tableLoad').classList.add('d-none');
        document.getElementById('inventory-table').classList.remove('d-none');
    } catch (err) {
        swal('Oops!', err.message, 'error').then(() => {
            console.log('An error occurred. Contact the administrator.');
        });
    }
    db.close();
}

/**
 * Validate the input for the fields in the product popup and display errors for invalid fields
 * @param {Array} inputFields Array containing input fields to be validated
 * @returns {bool} true if all field is not blank and false otherwise
 */
function validateInputField(inputFields) {
    for (let index = 0; index < inputFields.length; index += 1) {
        if (inputFields[index].value || inputFields[index].checked) {
            inputFields[index].classList.remove('is-invalid');
        } else {
            inputFields[index].classList.add('is-invalid');
            return false;
        }
    }
    return true;
}

document.getElementById('addProductButton').addEventListener('click', () => {
    if (
        validateInputField([
            firstNameField,
            lastNameField,
            classField,
            genderField,
            studentActiveField,
        ])
    ) {
        // ------
        const db = new Database(databasePath, { verbose: console.log });

        if (method.value === 'update') {
            try {
                const updateStudentQuery =
                    db.prepare(`UPDATE student SET first_name = ?, last_name = ?, gender = ?, class = ?, status = ? WHERE id = ?`);
                updateStudentQuery.run(
                    firstNameField.value,
                    lastNameField.value,
                    genderField.value,
                    classField.value,
                    studentActiveField.checked ? 1 : 0,
                    productPopupIdField.value,
                );
                swal(
                    'Success',
                    'Student updated successfully!',
                    'success',
                ).then(() => {
                    getCurrentWindow().reload();
                });
            } catch (err) {
                swal('Oops!', err.message, 'error');
            }
        } else if (method.value === 'create') {
            try {
                const createStudentQuery =
                    db.prepare(`INSERT INTO student (first_name, last_name, gender, class, status) VALUES(?, ?, ?, ?, ?)`);
                createStudentQuery.run(
                    firstNameField.value,
                    lastNameField.value,
                    genderField.value,
                    classField.value,
                    studentActiveField.checked ? 1 : 0,
                );
                swal(
                    'Success',
                    'Student created successfully!',
                    'success',
                ).then(() => {
                    getCurrentWindow().reload();
                });
            } catch (err) {
                swal('Oops!', err.message, 'error');
            }
        }
        db.close();
    }
});

$(document).ready(() => {
    loadInventory(false);
    // Display Name
    try {
        document.getElementById('full-name').textContent = JSON.parse(
            window.localStorage.getItem('auth'),
        ).name;
    } catch (err) {
        console.log('Element missing');
    }

    // Display admin only elements
    const isAdmin = JSON.parse(window.localStorage.getItem('auth')).admin;
    const adminElments = document.getElementsByClassName('admin-only-button');
    if (parseInt(isAdmin, 10) === 1) {
        for (const adminElement of adminElments) {
            adminElement.classList.remove('d-none');
        }
    }
});
